const Cart = {
    // API URL
    apiBase: 'http://localhost:5037/api/carts',

    // Helper to get current user ID
    getUserId() {
        const user = Auth.getUser();
        return user ? user.id : null;
    },

    // 1. Get Cart (Load from API)
    async load() {
        const userId = this.getUserId();
        if (!userId) {
            // Guest -> Empty cart
            this.renderEmpty();
            this.updateCartCount(0);
            return [];
        }

        try {
            const response = await fetch(`${this.apiBase}?userId=${userId}`);
            if (!response.ok) throw new Error('Failed to load cart');
            const cartItems = await response.json();

            // Render logic
            this.render(cartItems);
            this.updateCartCount(cartItems.length);
            return cartItems;
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    },

    // 2. Add to Cart
    async add(product, quantity = 1) {
        const userId = this.getUserId();
        if (!userId) {
            // Redirect to login if not logged in
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    productId: product.id,
                    quantity: parseInt(quantity)
                })
            });

            if (response.ok) {
                this.showToast(product);
                this.load(); // Reload cart to update count
            } else {
                alert('Có lỗi xảy ra khi thêm vào giỏ hàng.');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    },

    // 3. Update Quantity
    async updateQuantity(productId, newQuantity) {
        const userId = this.getUserId();
        if (!userId) return;

        try {
            const response = await fetch(`${this.apiBase}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    productId: productId,
                    quantity: parseInt(newQuantity)
                })
            });

            if (response.ok) {
                this.load(); // Reload to render changes
            }
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    },

    // 4. Remove Item
    async remove(productId) {
        const userId = this.getUserId();
        if (!userId) return;

        try {
            const response = await fetch(`${this.apiBase}/remove?userId=${userId}&productId=${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.load();
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    },

    // Helper: Toast Notification
    showToast(product) {
        let container = document.getElementById('cart-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'cart-toast-container';
            container.className = 'fixed bottom-20 right-20 z-[9999] flex flex-col gap-10 pointer-events-none';
            document.body.appendChild(container);

            const style = document.createElement('style');
            style.textContent = `
                .cart-toast { animation: toastSlideIn 0.3s ease-out forwards, toastFadeOut 0.3s ease-in 2.7s forwards; }
                @keyframes toastSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes toastFadeOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(20px); opacity: 0; } }
            `;
            document.head.appendChild(style);
        }

        const toast = document.createElement('div');
        toast.className = 'cart-toast pointer-events-auto flex items-center gap-15 p-15 min-w-[300px] bg-white dark:bg-dark border-l-4 border-primary rounded-md shadow-lg';
        toast.innerHTML = `
            <img src="${product.image}" class="size-40 object-cover rounded me-10" alt="">
            <div class="flex-1">
                <p class="text-sm font-semibold dark:text-white text-dark">Thành công!</p>
                <p class="text-xs dark:text-lightgrey text-bodytext">Đã thêm "${product.name}" vào giỏ hàng.</p>
            </div>
            <button class="text-dark dark:text-white opacity-50 hover:opacity-100" onclick="this.parentElement.remove()">
                <i class="las la-times"></i>
            </button>
        `;
        container.appendChild(toast);
        setTimeout(() => { if (toast.parentElement) toast.remove(); }, 3000);
    },

    formatPrice(price) {
        if (price === null || price === undefined) return '';

        // Ép mọi thứ về number
        const number =
            typeof price === 'number'
                ? price
                : Number(price.replace(/[^\d]/g, ''));

        return new Intl.NumberFormat('vi-VN').format(number) + 'đ';
    },
    parsePrice(priceStr) {
        if (!priceStr) return 0;
        if (typeof priceStr === 'number') return priceStr;

        return Number(priceStr.replace(/[^\d]/g, '')) || 0;
    },


    // Render Logic
    render(cart) {
        const cartTableBody = document.querySelector('tbody.font-medium');
        if (!cartTableBody) return; // Not on cart page

        if (!cart || cart.length === 0) {
            this.renderEmpty();
            this.updateTotal(0);
            return;
        }

        cartTableBody.innerHTML = '';
        let total = 0;

        cart.forEach(item => {
            const priceVal = this.parsePrice(item.price);
            const subtotal = priceVal * item.quantity;
            total += subtotal;

            const row = document.createElement('tr');
            row.className = 'tag';
            row.innerHTML = `
                <td class="py-20 px-15 first:px-0 last:px-0 border-b border-black/20 dark:border-white/20 whitespace-nowrap">
                    <img src="${item.image}" alt="${item.name}" class="size-100 object-cover">
                </td>
                <td class="py-20 px-15 first:px-0 last:px-0 border-b border-black/20 dark:border-white/20 whitespace-nowrap">
                    <span class="sm:text-lg dark:text-white text-dark">${item.name}</span>
                </td>
                <td class="py-20 px-15 first:px-0 last:px-0 border-b border-black/20 dark:border-white/20 whitespace-nowrap">
                    <span class="dark:text-lightgrey text-bodytext">${this.formatPrice(item.price)}</span>
                </td>
                <td class="py-20 px-15 first:px-0 last:px-0 border-b border-black/20 dark:border-white/20 input-group">
                    <span class="flex gap-10">
                        <button type="button" onclick="Cart.updateQuantity(${item.id}, ${item.quantity - 1})" class="button-minus size-30 leading-[27px] text-center cursor-pointer text-xl bg-secondary text-white"><i class="las la-minus text-lg"></i></button>
                        <input type="number" step="1" value="${item.quantity}" onchange="Cart.updateQuantity(${item.id}, this.value)" class="touchspin h-30 w-42 leading-[27px] text-center cursor-pointer bg-light outline-none rounded-md">
                        <button type="button" onclick="Cart.updateQuantity(${item.id}, ${item.quantity + 1})" class="button-plus size-30 leading-[27px] text-center cursor-pointer text-xl bg-secondary text-white"><i class="las la-plus text-lg"></i></button>
                    </span>
                </td>
                <td class="py-20 px-15 first:px-0 last:px-0 border-b border-black/20 dark:border-white/20 whitespace-nowrap">
                    <span class="dark:text-white text-dark">${this.formatPrice(subtotal)}</span>
                </td>
                <td class="py-20 px-15 first:px-0 last:px-0 border-b border-black/20 dark:border-white/20 whitespace-nowrap">
                    <a href="javascript:void(0);" onclick="Cart.remove(${item.id})" class="size-42 leading-38 rounded-full dark:text-light dark:bg-secondary text-secondary bg-light hover:text-dark hover:bg-primary inline-block text-center remove-tag sticky-update-btn">
                        <i class="las la-times text-lg align-middle"></i>
                    </a>
                </td>
            `;
            cartTableBody.appendChild(row);
        });

        this.updateTotal(total);
    },

    renderEmpty() {
        const cartTableBody = document.querySelector('tbody.font-medium');
        if (cartTableBody) {
            cartTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-20">Giỏ hàng của bạn đang trống.</td></tr>';
        }
    },

    updateTotal(totalAmount) {
        const formattedTotal = this.formatPrice(totalAmount);
        const sidebarTotalCell = document.querySelector('.lg\\:col-span-4 .total td:last-child');
        if (sidebarTotalCell) {
            sidebarTotalCell.textContent = formattedTotal;
        }
    },

    updateCartCount(count) {
        const countElements = document.querySelectorAll('.cart-count');
        countElements.forEach(el => {
            el.textContent = count;
        });
    },

    // Checkout Modal Logic
    openCheckoutModal() {
        const userId = this.getUserId();
        if (!userId) return; // Should not happen if on cart page (will redirect)

        // Check if cart empty
        // Since we don't store cart locally anymore, we trust UI or verify
        const rows = document.querySelectorAll('tbody.font-medium tr.tag');
        if (rows.length === 0) {
            alert('Giỏ hàng của bạn đang trống!');
            return;
        }

        const modal = document.getElementById('checkoutModal');
        if (modal) {
            modal.classList.remove('hidden');
            void modal.offsetWidth;
            modal.classList.add('open', 'flex');
            document.body.style.overflow = 'hidden';

            // Auto fill User Info if available
            const user = Auth.getUser();
            if (user) {
                const nameInput = modal.querySelector('input[name="name"]');
                const phoneInput = modal.querySelector('input[name="phone"]');
                const addressInput = modal.querySelector('input[name="address"]');

                // You might want to update User model to store address/phone
                //if (nameInput) nameInput.value = user.fullName;
            }
        }
    },

    closeCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (modal) {
            modal.classList.remove('open');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 300);
            document.body.style.overflow = '';
        }
    },
    async handleCheckout(e) {
        e.preventDefault();

        const userId = this.getUserId();
        if (!userId) {
            alert("Vui lòng đăng nhập");
            return;
        }

        const form = document.getElementById('checkoutForm');
        const formData = new FormData(form);

        const payload = {
            userId: userId,
            fullName: formData.get('name')?.trim(),
            phone: formData.get('phone')?.trim(),
            address: formData.get('address')?.trim(),
            note: formData.get('note')?.trim() || null,
            paymentMethod: formData.get('paymentMethod') || "COD"
        };

        // Validate nhanh
        if (!payload.fullName || !payload.phone || !payload.address) {
            alert("Vui lòng nhập đầy đủ thông tin giao hàng");
            return;
        }

        try {
            const btn = form.querySelector('button[type="submit"]');
            const originalBtnText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="las la-spinner la-spin"></i> ĐANG XỬ LÝ...';

            const response = await fetch("http://localhost:5037/api/orders/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(err);
            }

            const result = await response.json();
            console.log("Order created:", result);

            // ✅ THÀNH CÔNG
            this.closeCheckoutModal();
            form.reset();

            // Reload cart (cart đã bị clear ở backend)
            await this.load();

            if (result.qrUrl) {
                this.showQRModal(result);
            } else {
                this.showSuccessModal();
            }

        } catch (error) {
            console.error("Checkout error:", error);
            alert("Đặt hàng thất bại: " + error.message);
        } finally {
            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span>Hoàn tất đặt hàng</span><i class="las la-long-arrow-alt-right text-2xl group-hover:translate-x-2 transition-transform"></i>';
            }
        }
    },

    showQRModal(orderData) {
        const overlay = document.createElement('div');
        overlay.id = 'qr-modal-overlay';
        overlay.className = 'fixed inset-0 z-[10001] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn p-20';
        overlay.innerHTML = `
            <div class="bg-white dark:bg-[#0a0a0a] w-full max-w-[500px] p-40 rounded-3xl text-center shadow-2xl border border-white/10">
                <div class="mb-30">
                    <h2 class="text-3xl font-bold dark:text-white text-dark mb-10 uppercase">Thanh toán VietQR</h2>
                    <p class="dark:text-gray-400 text-bodytext">Quét mã bên dưới để hoàn tất thanh toán</p>
                </div>

                <div class="bg-white p-20 rounded-2xl mb-30 inline-block shadow-inner border border-gray-100">
                    <img src="${orderData.qrUrl}" alt="VietQR" class="w-full max-w-[300px] mx-auto">
                </div>

                <div class="space-y-4 mb-40 text-left bg-gray-50 dark:bg-white/5 p-20 rounded-xl">
                    <div class="flex justify-between">
                        <span class="text-gray-500 text-sm">Số tiền:</span>
                        <span class="font-bold dark:text-white text-dark">${this.formatPrice(orderData.totalAmount)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500 text-sm">Mã đơn hàng:</span>
                        <span class="font-bold dark:text-white text-dark">#${orderData.orderId}</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    <button onclick="Cart.finalizeQRCheckout()" class="btn btn-primary w-full justify-center py-16 text-lg">XÁC NHẬN ĐÃ CHUYỂN KHOẢN</button>
                    <button onclick="document.getElementById('qr-modal-overlay').remove()" class="text-gray-500 hover:text-primary transition-colors text-sm uppercase font-bold tracking-widest">Đóng</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    finalizeQRCheckout() {
        const overlay = document.getElementById('qr-modal-overlay');
        if (overlay) overlay.remove();
        this.showSuccessModal();
    },


    showSuccessModal() {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn';
        overlay.innerHTML = `
            <div class="bg-white dark:bg-dark p-40 rounded-3xl text-center max-w-[400px] mx-15 shadow-2xl border-2 border-primary">
                <div class="size-80 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-20">
                    <i class="las la-check-circle text-6xl"></i>
                </div>
                <h2 class="text-3xl font-bold dark:text-white text-dark mb-10">Đã nhận đơn hàng!</h2>
                <p class="dark:text-lightgrey text-bodytext mb-30">Cảm ơn bạn đã tin tưởng GYMFINDER. Đơn hàng của bạn đang được xử lý.</p>
                <button onclick="window.location.href='index.html'" class="btn btn-primary w-full justify-center py-12">TRỞ VỀ TRANG CHỦ</button>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    init() {
        // Render if on Cart Page
        if (document.querySelector('tbody.font-medium')) {
            if (!this.getUserId()) {
                window.location.href = 'login.html';
                return;
            }
            this.load();

            const placeOrderBtn = document.getElementById('placeOrderBtn');
            if (placeOrderBtn) {
                placeOrderBtn.addEventListener('click', () => this.openCheckoutModal());
            }

            const checkoutForm = document.getElementById('checkoutForm');
            if (checkoutForm) {
                checkoutForm.addEventListener('submit', (e) => this.handleCheckout(e));
            }
        } else {
            // Just update count header if not on cart page (e.g. Home)
            this.load();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});
