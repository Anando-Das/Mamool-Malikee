/* ============================================
   MAMOOL MALikee - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    // Header scroll effect
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

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('overlay');

    if (mobileMenuBtn && mobileMenu && overlay) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        overlay.addEventListener('click', function () {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Scroll reveal animations
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
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

    revealElements.forEach(el => revealObserver.observe(el));

    // Wishlist toggle
    document.querySelectorAll('.product-wishlist').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.toggle('active');
            const icon = this.querySelector('i');
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

    // Size selector
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.addEventListener('click', function () {
            this.parentElement.querySelectorAll('.size-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function () {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
            this.querySelector('input[type="radio"]').checked = true;
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });




    const shippingZone = document.getElementById('shippingZone');

    if (shippingZone) {

        const savedZone = localStorage.getItem('shippingZone');

        if (savedZone) {
            shippingZone.value = savedZone;
        }

        shippingZone.addEventListener('change', function () {
            localStorage.setItem('shippingZone', this.value);
            updateShipping();
        });

        updateShipping();
    }




});

// Change product image in gallery
function changeImage(thumb) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage && thumb) {
        mainImage.src = thumb.src.replace('w=200', 'w=800');
        document.querySelectorAll('.gallery-thumbs img').forEach(img => img.classList.remove('active'));
        thumb.classList.add('active');
    }
}

// Update quantity
function updateQty(change) {
    const input = document.getElementById('qtyInput');
    if (input) {
        let val = parseInt(input.value) || 1;
        val = Math.max(1, val + change);
        input.value = val;
    }
}

// Show tab content
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.tab-nav button').forEach(btn => btn.classList.remove('active'));

    const targetContent = document.getElementById(tabId);
    if (targetContent) targetContent.classList.add('active');

    event.target.classList.add('active');
}

// Add to cart with toast notification
function addToCart(button) {

    const isAuthenticated = button.dataset.authenticated === 'true';

    // User is not logged in
    if (!isAuthenticated) {
        const currentUrl = window.location.pathname + window.location.search;

        window.location.href =
            button.dataset.loginUrl + '?next=' + encodeURIComponent(currentUrl);

        return;
    }

    // Get selected variant
    const selectedVariant = document.querySelector('.size-option.active');

    if (!selectedVariant) {
        showToast('Please select a size');
        return;
    }

    const productId = parseInt(button.dataset.productId);
    const productName = button.dataset.productName;
    const image = button.dataset.image;

    const variantId = parseInt(selectedVariant.dataset.variantId);
    const size = selectedVariant.dataset.size;
    const price = parseFloat(selectedVariant.dataset.price);

    // Get selected quantity
    const qtyInput = document.getElementById('qtyInput');
    const quantity = qtyInput
        ? Math.max(1, parseInt(qtyInput.value) || 1)
        : 1;

    // Read existing cart
    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (error) {
        cart = [];
    }

    // Check if same variant already exists
    const existingItem = cart.find(
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
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    showToast(productName + ' added to bag');
}

function updateCartCount() {

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (error) {
        cart = [];
    }

    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    document.querySelectorAll('.cart-count').forEach(countElement => {
        countElement.textContent = totalQuantity;
    });
}

// Buy now
function buyNow() {
    showToast('Redirecting to checkout...');
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 1000);
}

// Toast notification
function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <i class="fas fa-check-circle" style="color: var(--gold-primary); margin-right: 0.8rem;"></i>
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
        toast.style.animation = 'slideOutRight 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Add toast animations to stylesheet dynamically
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(toastStyles);

function renderCart() {

    const cartItemsContainer = document.getElementById('cartItems');

    if (!cartItemsContainer) {
        return;
    }

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (error) {
        cart = [];
    }


    const subtotal = cart.reduce(
        (total, item) => total + (item.price * item.quantity),
        0
    );

    const subtotalElement = document.getElementById('cartSubtotal');
    const shippingZone = document.getElementById('shippingZone');
    const shippingElement = document.getElementById('cartShipping');
    const totalElement = document.getElementById('cartTotal');

    if (subtotalElement) {
        subtotalElement.textContent = '৳' + subtotal.toLocaleString();
    }

    let shipping = 0;

    if (shippingZone && shippingZone.value) {
        const selectedOption =
            shippingZone.options[shippingZone.selectedIndex];

        shipping = parseFloat(
            selectedOption.dataset.charge
        ) || 0;
    }

    if (shippingElement) {
        shippingElement.textContent =
            '৳' + shipping.toLocaleString();
    }




    const discountElement = document.getElementById('cartDiscount');
    const discountRow = document.getElementById('discountRow');

    let discount = 0;

    try {
        const appliedCoupon =
            JSON.parse(localStorage.getItem('appliedCoupon'));

        if (appliedCoupon) {
            discount = parseFloat(appliedCoupon.discount) || 0;
        }
    } catch (error) {
        discount = 0;
    }

    if (discountRow) {
        discountRow.style.display = discount > 0 ? '' : 'none';
    }

    if (discountElement) {
        discountElement.textContent =
            '-৳' + discount.toLocaleString();
    }



    if (totalElement) {
        const finalTotal = Math.max(
            0,
            subtotal + shipping - discount
        );

        totalElement.textContent =
            '৳' + finalTotal.toLocaleString();
    }


    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <p>Your shopping bag is empty.</p>
        `;
        return;
    }

    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {

        const cartItem = document.createElement('div');

        cartItem.className = 'cart-item';

        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>

            <div class="cart-item-details">

                <h3>${item.name}</h3>

                <p>
                    Size: ${item.size}
                </p>

                <div
                    class="quantity-selector"
                    style="border-color:rgba(255,255,255,0.1); width:fit-content;"
                >
                    <button onclick="changeCartQuantity(${index}, -1)">-</button>

                    <input
                        type="text"
                        value="${item.quantity}"
                        style="width:40px;"
                        readonly
                    >

                    <button onclick="changeCartQuantity(${index}, 1)">+</button>
                </div>

            </div>

            <div class="cart-item-price">
                ৳${item.price.toLocaleString()}
            </div>

            <button
                class="cart-item-remove"
                onclick="removeCartItem(${index})"
            >
                <i class="fas fa-times"></i>
            </button>
        `;

        cartItemsContainer.appendChild(cartItem);
    });
}

renderCart();
updateCartCount();

function changeCartQuantity(index, change) {

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (error) {
        cart = [];
    }

    if (!cart[index]) {
        return;
    }

    cart[index].quantity += change;

    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Cart changed, so existing coupon must be cleared
    localStorage.removeItem('appliedCoupon');

    renderCart();
    updateCartCount();
}

function removeCartItem(index) {

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (error) {
        cart = [];
    }

    if (!cart[index]) {
        return;
    }

    cart.splice(index, 1);

    localStorage.setItem('cart', JSON.stringify(cart));

    localStorage.removeItem('appliedCoupon');

    renderCart();
    updateCartCount();
}

function updateShipping() {
    renderCart();
}


async function applyCoupon() {

    const couponInput = document.getElementById('couponInput');
    const couponMessage = document.getElementById('couponMessage');

    if (!couponInput) {
        return;
    }

    const code = couponInput.value.trim();

    if (!code) {
        if (couponMessage) {
            couponMessage.textContent = 'Please enter a coupon code.';
        }
        return;
    }

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (error) {
        cart = [];
    }

    const subtotal = cart.reduce(
        (total, item) => total + (item.price * item.quantity),
        0
    );

    if (subtotal <= 0) {
        if (couponMessage) {
            couponMessage.textContent = 'Your cart is empty.';
        }
        return;
    }

    try {

        const response = await fetch(
            `/api/products/coupons/apply/?code=${encodeURIComponent(code)}&subtotal=${subtotal}`
        );

        const data = await response.json();

        if (!response.ok) {
            if (couponMessage) {
                couponMessage.textContent =
                    data.detail || 'Invalid coupon.';
            }

            return;
        }

        const discount = parseFloat(data.discount_amount) || 0;

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


function addToCartFromShop(button) {

    const isAuthenticated =
        button.dataset.authenticated === 'true';

    if (!isAuthenticated) {
        const currentUrl =
            window.location.pathname + window.location.search;

        window.location.href =
            button.dataset.loginUrl +
            '?next=' +
            encodeURIComponent(currentUrl);

        return;
    }

    const productId =
        parseInt(button.dataset.productId);

    const productName =
        button.dataset.productName;

    const image =
        button.dataset.image;

    const variantId =
        parseInt(button.dataset.variantId);

    const size =
        button.dataset.size;

    const price =
        parseFloat(button.dataset.price);

    let cart = [];

    try {
        cart =
            JSON.parse(localStorage.getItem('cart')) || [];
    } catch (error) {
        cart = [];
    }

    const existingItem = cart.find(
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
        productName + ' added to bag'
    );

    setTimeout(() => {
        window.location.href =
            button.dataset.cartUrl;
    }, 700);
}