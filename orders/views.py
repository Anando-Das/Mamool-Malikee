from decimal import Decimal, InvalidOperation

from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated

from products.models import ProductVariant, ShippingZone, Coupon
from .models import Order, OrderItem


class CreateOrderAPIView(APIView):
    """
    Create a new order from the user's browser cart.

    Important:
    - User must be logged in.
    - Product price comes from database.
    - Shipping charge comes from database.
    - Coupon is revalidated on server.
    - Order + OrderItem are saved atomically.
    """

    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data

        # -------------------------------------------------
        # 1. Customer information
        # -------------------------------------------------
        full_name = str(data.get("full_name", "")).strip()
        email = str(data.get("email", "")).strip()
        phone = str(data.get("phone", "")).strip()

        address = str(data.get("address", "")).strip()
        city = str(data.get("city", "")).strip()
        district = str(data.get("district", "")).strip()
        postcode = str(data.get("postcode", "")).strip()
        shipping_location = str(
            data.get("shipping_location", "")
        ).strip()

        if not full_name:
            return Response(
                {"detail": "Full name is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not email:
            return Response(
                {"detail": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {"detail": "Invalid email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not phone:
            return Response(
                {"detail": "Phone number is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not address:
            return Response(
                {"detail": "Address is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not city:
            return Response(
                {"detail": "City is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not district:
            return Response(
                {"detail": "District is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not postcode:
            return Response(
                {"detail": "Post code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not shipping_location:
            return Response(
                {"detail": "Shipping location is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # 2. Payment method
        # -------------------------------------------------
        payment_method = str(
            data.get("payment_method", "")
        ).strip().lower()

        allowed_payment_methods = {
            choice[0]
            for choice in Order.PAYMENT_METHOD_CHOICES
        }

        if payment_method not in allowed_payment_methods:
            return Response(
                {"detail": "Invalid payment method."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # 3. Shipping zone
        # -------------------------------------------------
        shipping_zone_code = str(
            data.get("shipping_zone", "")
        ).strip()

        if not shipping_zone_code:
            return Response(
                {"detail": "Shipping zone is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        shipping_zone = ShippingZone.objects.filter(
            code=shipping_zone_code,
            is_active=True,
        ).first()

        if not shipping_zone:
            return Response(
                {"detail": "Invalid or inactive shipping zone."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        shipping_cost = Decimal(shipping_zone.charge)

        # -------------------------------------------------
        # 4. Cart validation
        # -------------------------------------------------
        cart = data.get("cart", [])

        if not isinstance(cart, list) or not cart:
            return Response(
                {"detail": "Cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        validated_items = []
        subtotal = Decimal("0.00")

        for cart_item in cart:
            if not isinstance(cart_item, dict):
                return Response(
                    {"detail": "Invalid cart item."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            variant_id = cart_item.get("variant_id")
            quantity = cart_item.get("quantity")

            if variant_id is None:
                return Response(
                    {"detail": "Variant ID is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                variant_id = int(variant_id)
            except (ValueError, TypeError):
                return Response(
                    {"detail": "Invalid variant ID."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if isinstance(quantity, bool):
                return Response(
                    {"detail": "Invalid quantity."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                quantity = int(quantity)
            except (ValueError, TypeError):
                return Response(
                    {"detail": "Invalid quantity."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if quantity <= 0:
                return Response(
                    {"detail": "Quantity must be greater than 0."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            variant = (
                ProductVariant.objects
                .select_related("product")
                .filter(
                    id=variant_id,
                    is_active=True,
                    product__is_active=True,
                )
                .first()
            )

            if not variant:
                return Response(
                    {
                        "detail": (
                            f"Variant {variant_id} is unavailable."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # IMPORTANT:
            # Never trust price/name/size from localStorage.
            product = variant.product
            unit_price = Decimal(variant.price)
            item_total = unit_price * quantity

            subtotal += item_total

            validated_items.append(
                {
                    "variant": variant,
                    "product": product,
                    "product_name": product.name,
                    "size": variant.size,
                    "unit_price": unit_price,
                    "quantity": quantity,
                    "item_total": item_total,
                }
            )

        subtotal = subtotal.quantize(Decimal("0.01"))

        # -------------------------------------------------
        # 5. Coupon validation
        # -------------------------------------------------
        coupon_code = str(
            data.get("coupon_code", "")
        ).strip().upper()

        coupon_discount = Decimal("0.00")
        coupon = None

        if coupon_code:
            coupon = Coupon.objects.filter(
                code__iexact=coupon_code,
                is_active=True,
            ).first()

            if not coupon:
                return Response(
                    {"detail": "Invalid or inactive coupon."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if subtotal < coupon.minimum_order_amount:
                return Response(
                    {
                        "detail": (
                            f"Minimum order amount is "
                            f"৳{coupon.minimum_order_amount}"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if coupon.discount_type == "percentage":
                coupon_discount = (
                    subtotal
                    * coupon.discount_value
                    / Decimal("100")
                )

                if (
                    coupon.max_discount_amount is not None
                    and coupon_discount > coupon.max_discount_amount
                ):
                    coupon_discount = coupon.max_discount_amount

            else:
                coupon_discount = coupon.discount_value

            if coupon_discount > subtotal:
                coupon_discount = subtotal

            coupon_discount = coupon_discount.quantize(
                Decimal("0.01")
            )

        # -------------------------------------------------
        # 6. Final total
        # -------------------------------------------------
        total = (
            subtotal
            + shipping_cost
            - coupon_discount
        )

        if total < 0:
            total = Decimal("0.00")

        total = total.quantize(Decimal("0.01"))

        # -------------------------------------------------
        # 7. Optional fields
        # -------------------------------------------------
        order_note = str(
            data.get("order_note", "")
        ).strip()

        save_address = data.get("save_address", False)

        if isinstance(save_address, str):
            save_address = save_address.lower() in (
                "true",
                "1",
                "yes",
                "on",
            )

        # -------------------------------------------------
        # 8. Save Order + OrderItems atomically
        # -------------------------------------------------
        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                full_name=full_name,
                email=email,
                phone=phone,
                address=address,
                city=city,
                district=district,
                postcode=postcode,
                shipping_zone=shipping_zone,
                shipping_location=shipping_location,
                payment_method=payment_method,
                order_note=order_note,
                save_address=bool(save_address),
                coupon_code=coupon.code if coupon else None,
                subtotal=subtotal,
                shipping_cost=shipping_cost,
                coupon_discount=coupon_discount,
                total=total,
                status="pending",
            )

            for item in validated_items:
                OrderItem.objects.create(
                    order=order,
                    product=item["product"],
                    variant=item["variant"],
                    product_name=item["product_name"],
                    size=item["size"],
                    unit_price=item["unit_price"],
                    quantity=item["quantity"],
                    item_total=item["item_total"],
                )

        # -------------------------------------------------
        # 9. Success response
        # -------------------------------------------------
        return Response(
            {
                "success": True,
                "message": "Order placed successfully.",
                "order_id": order.id,
                "order_number": order.order_number,
                "subtotal": order.subtotal,
                "shipping_cost": order.shipping_cost,
                "coupon_discount": order.coupon_discount,
                "total": order.total,
                "status": order.status,
            },
            status=status.HTTP_201_CREATED,
        )
