/* ============================================
   MAMOOL MALikee - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ============================================
    // HEADER SCROLL EFFECT
    // ============================================
    const header = document.getElementById('header');

    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }


    // ============================================
    // MOBILE MENU TOGGLE
    // ============================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('overlay');

    if (mobileMenuBtn && mobileMenu && overlay) {

        mobileMenuBtn.addEventListener('click', function () {

            mobileMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            overlay.classList.toggle('active');

            document.body.style.overflow =
                mobileMenu.classList.contains('active')
                    ? 'hidden'
                    : '';

        });


        overlay.addEventListener('click', function () {

            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            overlay.classList.remove('active');

            document.body.style.overflow = '';

        });

    }


    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================
    const revealElements =
        document.querySelectorAll('.reveal');

    const revealObserver =
        new IntersectionObserver((entries) => {

            entries.forEach((entry, index) => {

                if (entry.isIntersecting) {

                    setTimeout(() => {
                        entry.target.classList.add('active');
                    }, index * 100);

                    revealObserver.unobserve(entry.target);
                }

            });

        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });


    revealElements.forEach(el => {
        revealObserver.observe(el);
    });


    // ============================================
    // WISHLIST TOGGLE
    // ============================================
    document
        .querySelectorAll('.product-wishlist')
        .forEach(btn => {

            btn.addEventListener('click', function (e) {

                e.preventDefault();
                e.stopPropagation();

                this.classList.toggle('active');

                const icon =
                    this.querySelector('i');

                if (this.classList.contains('active')) {

                    icon.classList.remove('far');
                    icon.classList.add('fas');

                    showToast('Added to wishlist');

                } else {

                    icon.classList.remove('fas');
                    icon.classList.add('far');

                    showToast('Removed from wishlist');
                }

            });

        });


    // ============================================
    // SIZE SELECTOR
    // ============================================
    document
        .querySelectorAll('.size-option')
        .forEach(btn => {

            btn.addEventListener('click', function () {

                this.parentElement
                    .querySelectorAll('.size-option')
                    .forEach(b => {
                        b.classList.remove('active');
                    });

                this.classList.add('active');

            });

        });


    // ============================================
    // PAYMENT METHOD SELECTION
    // ============================================
    document
        .querySelectorAll('.payment-method')
        .forEach(method => {

            method.addEventListener('click', function () {

                document
                    .querySelectorAll('.payment-method')
                    .forEach(m => {
                        m.classList.remove('selected');
                    });

                this.classList.add('selected');

                const radio =
                    this.querySelector(
                        'input[type="radio"]'
                    );

                if (radio) {
                    radio.checked = true;
                }

            });

        });


    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document
        .querySelectorAll('a[href^="#"]')
        .forEach(anchor => {

            anchor.addEventListener('click', function (e) {

                const targetId =
                    this.getAttribute('href');

                if (targetId !== '#') {

                    const target =
                        document.querySelector(targetId);

                    if (target) {

                        e.preventDefault();

                        target.scrollIntoView({
                            behavior: 'smooth'
                        });

                    }

                }

            });

        });


    // ============================================
    // CART SHIPPING ZONE
    // ============================================
    const shippingZone =
        document.getElementById('shippingZone');

    if (shippingZone) {

        const savedZone =
            localStorage.getItem('shippingZone');

        if (savedZone) {
            shippingZone.value = savedZone;
        }

        shippingZone.addEventListener(
            'change',
            function () {

                localStorage.setItem(
                    'shippingZone',
                    this.value
                );

                updateShipping();

            }
        );

        updateShipping();
    }

});


// ============================================
// CHANGE PRODUCT IMAGE IN GALLERY
// ============================================
function changeImage(thumb) {

    const mainImage =
        document.getElementById('mainImage');

    if (mainImage && thumb) {

        mainImage.src =
            thumb.src.replace('w=200', 'w=800');

        document
            .querySelectorAll('.gallery-thumbs img')
            .forEach(img => {
                img.classList.remove('active');
            });

        thumb.classList.add('active');
    }
}


// ============================================
// UPDATE QUANTITY
// ============================================
function updateQty(change) {

    const input =
        document.getElementById('qtyInput');

    if (input) {

        let val =
            parseInt(input.value) || 1;

        val =
            Math.max(1, val + change);

        input.value = val;
    }
}


// ============================================
// SHOW TAB CONTENT
// ============================================
function showTab(tabId) {

    document
        .querySelectorAll('.tab-content')
        .forEach(content => {
            content.classList.remove('active');
        });

    document
        .querySelectorAll('.tab-nav button')
        .forEach(btn => {
            btn.classList.remove('active');
        });

    const targetContent =
        document.getElementById(tabId);

    if (targetContent) {
        targetContent.classList.add('active');
    }

    if (typeof event !== 'undefined' && event.target) {
        event.target.classList.add('active');
    }
}


// ============================================
// ADD TO CART
// ============================================
function addToCart(button) {

    const isAuthenticated =
        button.dataset.authenticated === 'true';


    // User is not logged in
    if (!isAuthenticated) {

        const currentUrl =
            window.location.pathname +
            window.location.search;

        window.location.href =
            button.dataset.loginUrl +
            '?next=' +
            encodeURIComponent(currentUrl);

        return;
    }


    // Get selected variant
    const selectedVariant =
        document.querySelector(
            '.size-option.active'
        );

    if (!selectedVariant) {

        showToast(
            'Please select a size'
        );

        return;
    }


    const productId =
        parseInt(button.dataset.productId);

    const productName =
        button.dataset.productName;

    const image =
        button.dataset.image;


    const variantId =
        parseInt(
            selectedVariant.dataset.variantId
        );

    const size =
        selectedVariant.dataset.size;

    const price =
        parseFloat(
            selectedVariant.dataset.price
        );


    // Get quantity
    const qtyInput =
        document.getElementById('qtyInput');

    const quantity =
        qtyInput
            ? Math.max(
                1,
                parseInt(qtyInput.value) || 1
            )
            : 1;


    // Read existing cart
    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem('cart')
            ) || [];

    } catch (error) {

        cart = [];
    }


    // Check existing same variant
    const existingItem =
        cart.find(
            item =>
                item.product_id === productId &&
                item.variant_id === variantId
        );


    if (existingItem) {

        existingItem.quantity += quantity;

    } else {

        cart.push({

            product_id: productId,
            variant_id: variantId,
            name: productName,
            size: size,
            price: price,
            quantity: quantity,
            image: image

        });

    }


    // Save cart
    localStorage.setItem(
        'cart',
        JSON.stringify(cart)
    );


    updateCartCount();

    showToast(
        productName + ' added to bag'
    );
}


// ============================================
// UPDATE CART COUNT
// ============================================
function updateCartCount() {

    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem('cart')
            ) || [];

    } catch (error) {

        cart = [];
    }


    const totalQuantity =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    document
        .querySelectorAll('.cart-count')
        .forEach(countElement => {

            countElement.textContent =
                totalQuantity;

        });
}


// ============================================
// BUY NOW
// ============================================
function buyNow() {
    // Add to Bag button থেকে product details নাও
    const button = document.getElementById('addToBagBtn');

    if (!button) {
        showToast('Product information not found.');
        return;
    }

    // Login করা না থাকলে login page-এ পাঠাও
    const isAuthenticated =
        button.dataset.authenticated === 'true';

    if (!isAuthenticated) {
        const currentUrl =
            window.location.pathname +
            window.location.search;

        window.location.href =
            button.dataset.loginUrl +
            '?next=' +
            encodeURIComponent(currentUrl);

        return;
    }

    // Selected size/variant যাচাই
    const selectedVariant =
        document.querySelector('.size-option.active');

    if (!selectedVariant) {
        showToast('Please select a size');
        return;
    }

    // Product ও variant details
    const productId =
        parseInt(button.dataset.productId);

    const productName =
        button.dataset.productName;

    const image =
        button.dataset.image;

    const variantId =
        parseInt(selectedVariant.dataset.variantId);

    const size =
        selectedVariant.dataset.size;

    const price =
        parseFloat(selectedVariant.dataset.price);

    // Quantity
    const qtyInput =
        document.getElementById('qtyInput');

    const quantity =
        qtyInput
            ? Math.max(1, parseInt(qtyInput.value) || 1)
            : 1;

    if (
        !productId ||
        !variantId ||
        !Number.isFinite(price)
    ) {
        showToast('Invalid product or size selection.');
        return;
    }

    // Existing cart পড়ো
    let cart = [];

    try {
        cart =
            JSON.parse(localStorage.getItem('cart')) || [];
    } catch (error) {
        cart = [];
    }

    if (!Array.isArray(cart)) {
        cart = [];
    }

    // একই product + variant cart-এ থাকলে quantity বাড়াও
    const existingItem = cart.find(
        item =>
            item.product_id === productId &&
            item.variant_id === variantId
    );

    if (existingItem) {
        existingItem.quantity =
            (parseInt(existingItem.quantity) || 0) + quantity;
    } else {
        cart.push({
            product_id: productId,
            variant_id: variantId,
            name: productName,
            size: size,
            price: price,
            quantity: quantity,
            image: image
        });
    }

    // Cart save করে checkout-এ যাও
    localStorage.setItem('cart', JSON.stringify(cart));

    updateCartCount();

    window.location.href = '/checkout/';
}


// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message) {

    const existingToast =
        document.querySelector(
            '.toast-notification'
        );

    if (existingToast) {
        existingToast.remove();
    }


    const toast =
        document.createElement('div');

    toast.className =
        'toast-notification';


    toast.innerHTML = `
        <i
            class="fas fa-check-circle"
            style="
                color: var(--gold-primary);
                margin-right: 0.8rem;
            "
        ></i>

        <span>${message}</span>
    `;


    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: var(--black-light);
        color: var(--cream);
        padding: 1rem 1.5rem;
        border: 1px solid rgba(201, 162, 39, 0.3);
        border-radius: 4px;
        display: flex;
        align-items: center;
        z-index: 9999;
        font-size: 0.9rem;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        animation: slideInRight 0.4s ease;
    `;


    document.body.appendChild(toast);


    setTimeout(() => {

        toast.style.animation =
            'slideOutRight 0.4s ease forwards';

        setTimeout(() => {
            toast.remove();
        }, 400);

    }, 3000);
}


// ============================================
// TOAST ANIMATIONS
// ============================================
const toastStyles =
    document.createElement('style');

toastStyles.textContent = `

    @keyframes slideInRight {

        from {
            transform: translateX(100%);
            opacity: 0;
        }

        to {
            transform: translateX(0);
            opacity: 1;
        }

    }


    @keyframes slideOutRight {

        from {
            transform: translateX(0);
            opacity: 1;
        }

        to {
            transform: translateX(100%);
            opacity: 0;
        }

    }

`;

document.head.appendChild(
    toastStyles
);


// ============================================
// RENDER CART
// ============================================
function renderCart() {

    const cartItemsContainer =
        document.getElementById(
            'cartItems'
        );

    if (!cartItemsContainer) {
        return;
    }


    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem('cart')
            ) || [];

    } catch (error) {

        cart = [];
    }


    const subtotal =
        cart.reduce(
            (total, item) =>
                total +
                (
                    item.price *
                    item.quantity
                ),
            0
        );


    const subtotalElement =
        document.getElementById(
            'cartSubtotal'
        );

    const shippingZone =
        document.getElementById(
            'shippingZone'
        );

    const shippingElement =
        document.getElementById(
            'cartShipping'
        );

    const totalElement =
        document.getElementById(
            'cartTotal'
        );


    // Subtotal
    if (subtotalElement) {

        subtotalElement.textContent =
            '৳' +
            subtotal.toLocaleString();

    }


    // Shipping
    let shipping = 0;

    if (
        shippingZone &&
        shippingZone.value
    ) {

        const selectedOption =
            shippingZone.options[
                shippingZone.selectedIndex
            ];

        shipping =
            parseFloat(
                selectedOption.dataset.charge
            ) || 0;
    }


    if (shippingElement) {

        shippingElement.textContent =
            '৳' +
            shipping.toLocaleString();

    }


    // Coupon discount
    const discountElement =
        document.getElementById(
            'cartDiscount'
        );

    const discountRow =
        document.getElementById(
            'discountRow'
        );


    let discount = 0;

    try {

        const appliedCoupon =
            JSON.parse(
                localStorage.getItem(
                    'appliedCoupon'
                )
            );

        if (appliedCoupon) {

            discount =
                parseFloat(
                    appliedCoupon.discount
                ) || 0;

        }

    } catch (error) {

        discount = 0;

    }


    if (discountRow) {

        discountRow.style.display =
            discount > 0
                ? ''
                : 'none';

    }


    if (discountElement) {

        discountElement.textContent =
            '-৳' +
            discount.toLocaleString();

    }


    // Total
    if (totalElement) {

        const finalTotal =
            Math.max(
                0,
                subtotal +
                shipping -
                discount
            );

        totalElement.textContent =
            '৳' +
            finalTotal.toLocaleString();

    }


    // Empty cart
    if (cart.length === 0) {

        cartItemsContainer.innerHTML = `
            <p>Your shopping bag is empty.</p>
        `;

        return;
    }


    // Render items
    cartItemsContainer.innerHTML = '';


    cart.forEach((item, index) => {

        const cartItem =
            document.createElement('div');

        cartItem.className =
            'cart-item';


        cartItem.innerHTML = `

            <div class="cart-item-image">

                <img
                    src="${item.image}"
                    alt="${item.name}"
                >

            </div>


            <div class="cart-item-details">

                <h3>
                    ${item.name}
                </h3>

                <p>
                    Size: ${item.size}
                </p>


                <div
                    class="quantity-selector"
                    style="
                        border-color:
                        rgba(255,255,255,0.1);
                        width:fit-content;
                    "
                >

                    <button
                        onclick="
                            changeCartQuantity(
                                ${index},
                                -1
                            )
                        "
                    >
                        -
                    </button>


                    <input
                        type="text"
                        value="${item.quantity}"
                        style="width:40px;"
                        readonly
                    >


                    <button
                        onclick="
                            changeCartQuantity(
                                ${index},
                                1
                            )
                        "
                    >
                        +
                    </button>

                </div>

            </div>


            <div class="cart-item-price">
                ৳${item.price.toLocaleString()}
            </div>


            <button
                class="cart-item-remove"
                onclick="
                    removeCartItem(${index})
                "
            >
                <i class="fas fa-times"></i>
            </button>

        `;


        cartItemsContainer.appendChild(
            cartItem
        );

    });
}


// Initial cart render
renderCart();

updateCartCount();


// ============================================
// CHANGE CART QUANTITY
// ============================================
function changeCartQuantity(
    index,
    change
) {

    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem('cart')
            ) || [];

    } catch (error) {

        cart = [];
    }


    if (!cart[index]) {
        return;
    }


    cart[index].quantity += change;


    if (
        cart[index].quantity < 1
    ) {

        cart[index].quantity = 1;

    }


    localStorage.setItem(
        'cart',
        JSON.stringify(cart)
    );


    renderCart();

    updateCartCount();
}


// ============================================
// REMOVE CART ITEM
// ============================================
function removeCartItem(index) {

    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem('cart')
            ) || [];

    } catch (error) {

        cart = [];
    }


    if (!cart[index]) {
        return;
    }


    cart.splice(index, 1);


    localStorage.setItem(
        'cart',
        JSON.stringify(cart)
    );


    renderCart();

    updateCartCount();
}


// ============================================
// UPDATE SHIPPING
// ============================================
function updateShipping() {

    renderCart();

}


// ============================================
// APPLY COUPON
// ============================================
async function applyCoupon() {

    const couponInput =
        document.getElementById(
            'couponInput'
        );

    const couponMessage =
        document.getElementById(
            'couponMessage'
        );


    if (!couponInput) {
        return;
    }


    const code =
        couponInput.value.trim();


    if (!code) {

        if (couponMessage) {

            couponMessage.textContent =
                'Please enter a coupon code.';

        }

        return;
    }


    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem('cart')
            ) || [];

    } catch (error) {

        cart = [];
    }


    const subtotal =
        cart.reduce(
            (total, item) =>
                total +
                (
                    item.price *
                    item.quantity
                ),
            0
        );


    if (subtotal <= 0) {

        if (couponMessage) {

            couponMessage.textContent =
                'Your cart is empty.';

        }

        return;
    }


    try {

        const response =
            await fetch(
                `/api/products/coupons/apply/?code=${encodeURIComponent(
                    code
                )}&subtotal=${subtotal}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (couponMessage) {

                couponMessage.textContent =
                    data.detail ||
                    'Invalid coupon.';

            }

            return;
        }


        const discount =
            parseFloat(
                data.discount_amount
            ) || 0;


        localStorage.setItem(

            'appliedCoupon',

            JSON.stringify({

                code: data.code,
                discount: discount

            })

        );


        if (couponMessage) {

            couponMessage.textContent =
                `${data.code} applied successfully.`;

        }


        renderCart();

    } catch (error) {

        if (couponMessage) {

            couponMessage.textContent =
                'Unable to apply coupon right now.';

        }

    }
}


// ============================================
// ADD TO CART FROM SHOP
// ============================================
function addToCartFromShop(button) {

    const isAuthenticated =
        button.dataset.authenticated === 'true';


    if (!isAuthenticated) {

        const currentUrl =
            window.location.pathname +
            window.location.search;


        window.location.href =
            button.dataset.loginUrl +
            '?next=' +
            encodeURIComponent(
                currentUrl
            );

        return;
    }


    const productId =
        parseInt(
            button.dataset.productId
        );

    const productName =
        button.dataset.productName;

    const image =
        button.dataset.image;


    const variantId =
        parseInt(
            button.dataset.variantId
        );

    const size =
        button.dataset.size;

    const price =
        parseFloat(
            button.dataset.price
        );


    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem('cart')
            ) || [];

    } catch (error) {

        cart = [];
    }


    const existingItem =
        cart.find(
            item =>
                item.product_id === productId &&
                item.variant_id === variantId
        );


    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({

            product_id: productId,
            variant_id: variantId,
            name: productName,
            size: size,
            price: price,
            quantity: 1,
            image: image

        });

    }


    localStorage.setItem(
        'cart',
        JSON.stringify(cart)
    );


    updateCartCount();


    showToast(
        productName +
        ' added to bag'
    );


    setTimeout(() => {

        window.location.href =
            button.dataset.cartUrl;

    }, 700);
}


// ============================================
// CHECKOUT - LOAD SAVED CUSTOMER DATA
// ============================================
function loadSavedCheckoutData() {

    let savedData = null;


    try {

        savedData =
            JSON.parse(
                localStorage.getItem(
                    'savedCheckoutData'
                )
            );

    } catch (error) {

        savedData = null;

    }


    if (!savedData) {
        return;
    }


    // ========================================
    // CUSTOMER + DELIVERY FIELDS
    // ========================================
    const fieldMap = {

        checkoutFullName:
            savedData.full_name,

        checkoutEmail:
            savedData.email,

        checkoutPhone:
            savedData.phone,

        checkoutAddress:
            savedData.address,

        checkoutCity:
            savedData.city,

        checkoutDistrict:
            savedData.district,

        checkoutPostcode:
            savedData.postcode

    };


    Object.entries(fieldMap)
        .forEach(
            ([id, value]) => {

                const input =
                    document.getElementById(id);


                if (
                    input &&
                    value !== undefined &&
                    value !== null
                ) {

                    input.value = value;

                }

            }
        );


    // ========================================
    // SHIPPING ZONE
    // ========================================
    const shippingZone =
        document.getElementById(
            'checkoutShippingZone'
        );


    if (
        shippingZone &&
        savedData.shipping_zone
    ) {

        shippingZone.value =
            savedData.shipping_zone;

    }


    // ========================================
    // SAVE ADDRESS CHECKBOX
    // ========================================
    const saveAddress =
        document.getElementById(
            'saveAddress'
        );


    if (saveAddress) {

        saveAddress.checked = true;

    }


    // ========================================
    // PAYMENT METHOD
    // ========================================
    if (
        savedData.payment_method
    ) {

        const payment =
            document.querySelector(
                `input[name="payment"][value="${savedData.payment_method}"]`
            );


        if (payment) {

            payment.checked = true;


            const paymentContainer =
                payment.closest(
                    '.payment-method'
                );


            if (paymentContainer) {

                document
                    .querySelectorAll(
                        '.payment-method'
                    )
                    .forEach(method => {

                        method.classList
                            .remove(
                                'selected'
                            );

                    });


                paymentContainer.classList
                    .add('selected');

            }

        }

    }

}


// ============================================
// CHECKOUT - RENDER CHECKOUT
// ============================================
function renderCheckout() {

    const checkoutItemsList =
        document.getElementById(
            'checkoutItemsList'
        );


    if (!checkoutItemsList) {
        return;
    }


    let cart = [];


    try {

        cart =
            JSON.parse(
                localStorage.getItem('cart')
            ) || [];

    } catch (error) {

        cart = [];

    }


    const emptyState =
        document.getElementById(
            'checkoutEmptyState'
        );


    const formWrapper =
        document.getElementById(
            'checkoutFormWrapper'
        );


    // ========================================
    // EMPTY CART
    // ========================================
    if (
        cart.length === 0
    ) {

        if (emptyState) {

            emptyState.style.display =
                'block';

        }


        if (formWrapper) {

            formWrapper.style.display =
                'none';

        }


        return;

    }


    // ========================================
    // CART HAS ITEMS
    // ========================================
    if (emptyState) {

        emptyState.style.display =
            'none';

    }


    if (formWrapper) {

        formWrapper.style.display =
            'grid';

    }


    // ========================================
    // SUBTOTAL
    // ========================================
    const subtotal =
        cart.reduce(
            (total, item) =>
                total +
                (
                    item.price *
                    item.quantity
                ),
            0
        );


    const subtotalElement =
        document.getElementById(
            'checkoutSubtotal'
        );


    if (subtotalElement) {

        subtotalElement.textContent =
            '৳' +
            subtotal.toLocaleString();

    }


    // ========================================
    // SHIPPING
    // ========================================
    let shipping = 0;


    const shippingZone =
        document.getElementById(
            'checkoutShippingZone'
        );


    if (
        shippingZone &&
        shippingZone.value
    ) {

        const selectedOption =
            shippingZone.options[
                shippingZone.selectedIndex
            ];


        shipping =
            parseFloat(
                selectedOption.dataset.charge
            ) || 0;

    }


    const shippingElement =
        document.getElementById(
            'checkoutShipping'
        );


    if (shippingElement) {

        shippingElement.textContent =
            '৳' +
            shipping.toLocaleString();

    }


    // ========================================
    // COUPON DISCOUNT
    // ========================================
    let discount = 0;


    try {

        const appliedCoupon =
            JSON.parse(
                localStorage.getItem(
                    'appliedCoupon'
                )
            );


        if (appliedCoupon) {

            discount =
                parseFloat(
                    appliedCoupon.discount
                ) || 0;

        }

    } catch (error) {

        discount = 0;

    }


    const discountRow =
        document.getElementById(
            'checkoutDiscountRow'
        );


    const discountElement =
        document.getElementById(
            'checkoutDiscount'
        );


    if (discountRow) {

        discountRow.style.display =
            discount > 0
                ? ''
                : 'none';

    }


    if (discountElement) {

        discountElement.textContent =
            '-৳' +
            discount.toLocaleString();

    }


    // ========================================
    // FINAL TOTAL
    // ========================================
    const finalTotal =
        Math.max(
            0,
            subtotal +
            shipping -
            discount
        );


    const totalElement =
        document.getElementById(
            'checkoutTotal'
        );


    if (totalElement) {

        totalElement.textContent =
            '৳' +
            finalTotal.toLocaleString();

    }


    // ========================================
    // CHECKOUT ITEMS
    // ========================================
    checkoutItemsList.innerHTML = '';


    cart.forEach(item => {

        const div =
            document.createElement('div');


        div.style.cssText =
            'display:flex; gap:1rem; margin-bottom:1rem;';


        div.innerHTML = `

            <img
                src="${item.image}"
                style="
                    width:60px;
                    height:60px;
                    object-fit:cover;
                    border-radius:4px;
                "
            >


            <div style="flex:1;">

                <p
                    style="
                        font-size:0.85rem;
                        color:var(--cream);
                        margin-bottom:0.2rem;
                    "
                >
                    ${item.name}
                </p>


                <p
                    style="
                        font-size:0.8rem;
                        color:var(--gray-light);
                    "
                >
                    Size:
                    ${item.size}
                    |
                    Qty:
                    ${item.quantity}
                </p>

            </div>


            <span
                style="
                    color:var(--gold-primary);
                    font-weight:500;
                "
            >
                ৳${(
                    item.price *
                    item.quantity
                ).toLocaleString()}
            </span>

        `;


        checkoutItemsList.appendChild(
            div
        );

    });

}


// ============================================
// CHECKOUT PAGE INITIALIZATION
// ============================================
document.addEventListener(
    'DOMContentLoaded',
    function () {

        // First load saved customer data
        loadSavedCheckoutData();


        // Then render checkout
        renderCheckout();


        // Shipping zone
        const checkoutShippingZone =
            document.getElementById(
                'checkoutShippingZone'
            );


        if (checkoutShippingZone) {

            // Existing cart shipping zone
            const savedZone =
                localStorage.getItem(
                    'shippingZone'
                );


            if (
                savedZone &&
                !checkoutShippingZone.value
            ) {

                checkoutShippingZone.value =
                    savedZone;

            }


            // Shipping zone change
            checkoutShippingZone.addEventListener(
                'change',
                function () {

                    localStorage.setItem(
                        'shippingZone',
                        this.value
                    );


                    renderCheckout();

                }
            );


            // Final render
            renderCheckout();

        }

    }
);


// ============================================
// CHECKOUT - PLACE ORDER
// ============================================
document.addEventListener(
    'DOMContentLoaded',
    function () {

        const placeOrderBtn =
            document.getElementById(
                'placeOrderBtn'
            );


        if (!placeOrderBtn) {
            return;
        }


        placeOrderBtn.addEventListener(
            'click',
            async function () {


                // ========================================
                // 1. READ CHECKOUT FIELDS
                // ========================================
                const fullName =
                    document
                        .getElementById(
                            'checkoutFullName'
                        )
                        ?.value
                        .trim();


                const email =
                    document
                        .getElementById(
                            'checkoutEmail'
                        )
                        ?.value
                        .trim();


                const phone =
                    document
                        .getElementById(
                            'checkoutPhone'
                        )
                        ?.value
                        .trim();


                const address =
                    document
                        .getElementById(
                            'checkoutAddress'
                        )
                        ?.value
                        .trim();


                const city =
                    document
                        .getElementById(
                            'checkoutCity'
                        )
                        ?.value
                        .trim();


                const district =
                    document
                        .getElementById(
                            'checkoutDistrict'
                        )
                        ?.value
                        .trim();


                const postcode =
                    document
                        .getElementById(
                            'checkoutPostcode'
                        )
                        ?.value
                        .trim();


                const shippingZoneElement =
                    document.getElementById(
                        'checkoutShippingZone'
                    );


                const shippingZone =
                    shippingZoneElement?.value ||
                    '';


                // ========================================
                // SHIPPING LOCATION
                // ========================================
                let shippingLocation = '';


                if (
                    shippingZoneElement &&
                    shippingZoneElement.selectedIndex >= 0
                ) {

                    shippingLocation =
                        shippingZoneElement
                            .options[
                                shippingZoneElement
                                    .selectedIndex
                            ]
                            .textContent
                            .trim();

                }


                // ========================================
                // ORDER NOTE
                // ========================================
                const orderNote =
                    document
                        .getElementById(
                            'checkoutOrderNote'
                        )
                        ?.value
                        .trim() ||
                    '';


                // ========================================
                // PAYMENT METHOD
                // ========================================
                const paymentElement =
                    document.querySelector(
                        'input[name="payment"]:checked'
                    );


                const paymentMethod =
                    paymentElement
                        ? paymentElement.value
                        : '';


                // ========================================
                // SAVE ADDRESS CHECKBOX
                // ========================================
                const saveAddress =
                    document
                        .getElementById(
                            'saveAddress'
                        )
                        ?.checked ||
                    false;


                // ========================================
                // 2. VALIDATE
                // ========================================
                if (!fullName) {

                    showToast(
                        'Please enter your full name.'
                    );

                    return;
                }


                if (!email) {

                    showToast(
                        'Please enter your email.'
                    );

                    return;
                }


                if (!phone) {

                    showToast(
                        'Please enter your phone number.'
                    );

                    return;
                }


                if (!address) {

                    showToast(
                        'Please enter your address.'
                    );

                    return;
                }


                if (!city) {

                    showToast(
                        'Please enter your city.'
                    );

                    return;
                }


                if (!district) {

                    showToast(
                        'Please enter your district.'
                    );

                    return;
                }


                if (!postcode) {

                    showToast(
                        'Please enter your post code.'
                    );

                    return;
                }


                if (!shippingZone) {

                    showToast(
                        'Please select your delivery location.'
                    );

                    return;
                }


                if (!paymentMethod) {

                    showToast(
                        'Please select a payment method.'
                    );

                    return;
                }


                // ========================================
                // 3. READ CART
                // ========================================
                let cart = [];


                try {

                    cart =
                        JSON.parse(
                            localStorage.getItem(
                                'cart'
                            )
                        ) || [];

                } catch (error) {

                    cart = [];

                }


                if (
                    !Array.isArray(cart) ||
                    cart.length === 0
                ) {

                    showToast(
                        'Your shopping bag is empty.'
                    );

                    return;
                }


                // ========================================
                // 4. PREPARE CART
                // ONLY SEND VARIANT + QUANTITY
                // ========================================
                const orderCart =
                    cart.map(
                        item => ({

                            variant_id:
                                item.variant_id,

                            quantity:
                                item.quantity

                        })
                    );


                // ========================================
                // 5. READ COUPON
                // ========================================
                let couponCode = '';


                try {

                    const appliedCoupon =
                        JSON.parse(
                            localStorage.getItem(
                                'appliedCoupon'
                            )
                        );


                    if (
                        appliedCoupon &&
                        appliedCoupon.code
                    ) {

                        couponCode =
                            String(
                                appliedCoupon.code
                            )
                                .trim()
                                .toUpperCase();

                    }

                } catch (error) {

                    couponCode = '';

                }


                // ========================================
                // 6. CSRF TOKEN
                // ========================================
                const csrfInput =
                    document.querySelector(
                        'input[name="csrfmiddlewaretoken"]'
                    );


                const csrfToken =
                    csrfInput
                        ? csrfInput.value
                        : '';


                if (!csrfToken) {

                    showToast(
                        'Security token missing. Please refresh the page.'
                    );

                    return;
                }


                // ========================================
                // 7. DISABLE BUTTON
                // ========================================
                const originalText =
                    placeOrderBtn.textContent;


                placeOrderBtn.disabled =
                    true;


                placeOrderBtn.textContent =
                    'Placing Order...';


                try {

                    // ====================================
                    // 8. SEND ORDER TO DJANGO
                    // ====================================
                    const response =
                        await fetch(
                            placeOrderBtn.dataset.orderUrl,
                            {

                                method: 'POST',

                                headers: {

                                    'Content-Type':
                                        'application/json',

                                    'X-CSRFToken':
                                        csrfToken,

                                    'X-Requested-With':
                                        'XMLHttpRequest'

                                },

                                credentials:
                                    'same-origin',

                                body:
                                    JSON.stringify({

                                        full_name:
                                            fullName,

                                        email:
                                            email,

                                        phone:
                                            phone,


                                        address:
                                            address,

                                        city:
                                            city,

                                        district:
                                            district,

                                        postcode:
                                            postcode,


                                        shipping_zone:
                                            shippingZone,

                                        shipping_location:
                                            shippingLocation,


                                        payment_method:
                                            paymentMethod,


                                        order_note:
                                            orderNote,

                                        save_address:
                                            saveAddress,


                                        coupon_code:
                                            couponCode,


                                        cart:
                                            orderCart

                                    })

                            }
                        );


                    // ====================================
                    // 9. READ RESPONSE
                    // ====================================
                    let result = {};


                    try {

                        result =
                            await response.json();

                    } catch (error) {

                        result = {};

                    }


                    // ====================================
                    // 10. BACKEND ERROR
                    // ====================================
                    if (!response.ok) {

                        const errorMessage =
                            result.detail ||
                            'Unable to place your order.';


                        showToast(
                            errorMessage
                        );


                        placeOrderBtn.disabled =
                            false;


                        placeOrderBtn.textContent =
                            originalText;


                        return;
                    }


                    // ====================================
                    // 11. SUCCESSFUL ORDER
                    // ====================================
                    if (
                        result.success &&
                        result.order_number
                    ) {


                        // ====================================
                        // SAVE CUSTOMER DATA
                        // ====================================
                        if (saveAddress) {

                            localStorage.setItem(

                                'savedCheckoutData',

                                JSON.stringify({

                                    full_name:
                                        fullName,

                                    email:
                                        email,

                                    phone:
                                        phone,


                                    address:
                                        address,

                                    city:
                                        city,

                                    district:
                                        district,

                                    postcode:
                                        postcode,


                                    shipping_zone:
                                        shippingZone,

                                    payment_method:
                                        paymentMethod

                                })

                            );

                        } else {

                            // User chose not to save
                            localStorage.removeItem(
                                'savedCheckoutData'
                            );

                        }


                        // ====================================
                        // CLEAR CART
                        // ====================================
                        localStorage.removeItem(
                            'cart'
                        );


                        // ====================================
                        // CLEAR COUPON
                        // ====================================
                        localStorage.removeItem(
                            'appliedCoupon'
                        );


                        // ====================================
                        // CLEAR TEMP SHIPPING
                        // SAVED CHECKOUT DATA IS NOT CLEARED
                        // ====================================
                        localStorage.removeItem(
                            'shippingZone'
                        );

                        localStorage.removeItem(
                            'checkoutShippingZone'
                        );


                        // ====================================
                        // UPDATE CART COUNT
                        // ====================================
                        updateCartCount();


                        // ====================================
                        // GO TO CONFIRMATION PAGE
                        // ====================================
                        const confirmationUrl =
                            `/order-confirmation/${encodeURIComponent(
                                result.order_number
                            )}/`;


                        window.location.href =
                            confirmationUrl;


                        return;

                    }


                    // ====================================
                    // UNEXPECTED RESPONSE
                    // ====================================
                    showToast(
                        'Order was not created.'
                    );


                    placeOrderBtn.disabled =
                        false;


                    placeOrderBtn.textContent =
                        originalText;


                } catch (error) {

                    console.error(
                        'Order submission error:',
                        error
                    );


                    showToast(
                        'Something went wrong. Please try again.'
                    );


                    placeOrderBtn.disabled =
                        false;


                    placeOrderBtn.textContent =
                        originalText;

                }

            }
        );

    }
);