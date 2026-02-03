const ADMIN_API_URL = 'https://gymfinder953.runasp.net/api';

const OrderStatus = {
    Pending: 0,
    Confirmed: 1,
    Shipping: 2,
    Completed: 3,
    Cancelled: 4
};

const StatusLabels = {
    0: 'Chờ xác nhận',
    1: 'Đã xác nhận',
    2: 'Đang giao',
    3: 'Hoàn tất',
    4: 'Đã hủy'
};

const StatusClasses = {
    0: 'status-pending',
    1: 'status-confirmed',
    2: 'status-shipping',
    3: 'status-completed',
    4: 'status-cancelled'
};

async function loadProducts() {
    const container = document.getElementById('products-container');

    try {
        const response = await fetch(`${ADMIN_API_URL}/products?includeOutOfStock=true`);
        const products = await response.json();

        if (products.length === 0) {
            container.innerHTML = `<tr><td colspan="4" class="text-center py-50 text-white/40">Không tìm thấy sản phẩm nào.</td></tr>`;
            return;
        }

        container.innerHTML = products.map(product => renderProductRow(product)).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = `<tr><td colspan="4" class="text-center py-50 text-red-500">Lỗi khi tải danh sách sản phẩm.</td></tr>`;
    }
}

function renderProductRow(product) {
    const numericPrice = parseInt(product.price.replace(/[^0-9]/g, ''));
    return `
        <tr>
            <td class="p-20 border-b border-white/5">
                <div class="flex items-center gap-15">
                    <img src="${product.image}" class="size-40 object-cover rounded-lg" alt="">
                    <div>
                        <p class="font-bold">${product.name}</p>
                        <p class="text-xs text-white/40 font-bold">${product.categoryName}</p>
                    </div>
                </div>
            </td>
            <td class="p-20 border-b border-white/5 text-center">
                <div class="flex items-center justify-center gap-10">
                    <input type="number" value="${numericPrice}" id="price-input-${product.id}"
                        class="w-120 bg-white/5 border border-white/10 rounded-lg px-10 py-5 text-center font-bold text-primary">
                    <span class="text-xs text-white/40">đ</span>
                </div>
            </td>
            <td class="p-20 border-b border-white/5 text-center">
                <div class="flex items-center justify-center gap-10">
                    <input type="number" value="${product.unitsInStock}" id="stock-input-${product.id}"
                        class="w-80 bg-white/5 border border-white/10 rounded-lg px-10 py-5 text-center font-bold">
                    <span class="text-xs text-white/40">sp</span>
                </div>
            </td>
            <td class="p-20 border-b border-white/5 text-center">
                <div class="flex items-center justify-center gap-10">
                    <button onclick="updateProductInfo(${product.id})" 
                        class="bg-primary/20 text-primary hover:bg-primary hover:text-black px-15 py-5 rounded-lg text-xs font-bold transition-all">
                        LƯU
                    </button>
                    <button onclick='editProduct(${JSON.stringify(product).replace(/'/g, "&apos;")})' 
                        class="bg-white/5 text-white/60 hover:text-white px-10 py-5 rounded-lg text-xs font-bold transition-all">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

async function updateProductInfo(id) {
    const stockInput = document.getElementById(`stock-input-${id}`);
    const priceInput = document.getElementById(`price-input-${id}`);
    const newStock = parseInt(stockInput.value);
    const newPrice = parseInt(priceInput.value);

    if (isNaN(newStock) || newStock < 0 || isNaN(newPrice) || newPrice < 0) {
        alert('Thông tin không hợp lệ!');
        return;
    }

    try {
        const response = await fetch(`${ADMIN_API_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                price: newPrice,
                unitsInStock: newStock,
                categoryId: 0
            })
        });

        if (response.ok) {
            alert('Cập nhật thành công!');
            loadProducts();
        } else {
            alert('Cập nhật thất bại.');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Lỗi kết nối server.');
    }
}

// --- Product Management Modal Functions ---

let allCategories = [];

async function loadCategories() {
    try {
        const response = await fetch(`${ADMIN_API_URL}/Category`);
        allCategories = await response.json();
        const select = document.getElementById('product-category');
        if (select) {
            select.innerHTML = allCategories.map(c => `<option value="${c.id}" class="bg-[#1C1E20] text-white">${c.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

window.openProductModal = function () {
    document.getElementById('product-modal-title').textContent = 'Thêm sản phẩm mới';
    document.getElementById('product-id').value = '';
    document.getElementById('product-form').reset();
    document.getElementById('product-modal').classList.replace('hidden', 'flex');
}

window.closeProductModal = function () {
    document.getElementById('product-modal').classList.replace('flex', 'hidden');
}

window.editProduct = function (product) {
    document.getElementById('product-modal-title').textContent = 'Chỉnh sửa sản phẩm';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = parseInt(product.price.replace(/[^0-9]/g, ''));
    document.getElementById('product-stock').value = product.unitsInStock;
    document.getElementById('product-category').value = product.categoryId;
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-image').value = product.image.replace('assets/images/shop/', '');

    document.getElementById('product-modal').classList.replace('hidden', 'flex');
}

document.getElementById('product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('product-name').value,
        price: parseFloat(document.getElementById('product-price').value),
        unitsInStock: parseInt(document.getElementById('product-stock').value),
        categoryId: parseInt(document.getElementById('product-category').value),
        description: document.getElementById('product-description').value,
        image: document.getElementById('product-image').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${ADMIN_API_URL}/products/${id}` : `${ADMIN_API_URL}/products`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            alert(id ? 'Cập nhật thành công!' : 'Thêm sản phẩm mới thành công!');
            closeProductModal();
            loadProducts();
        } else {
            alert('Có lỗi xảy ra, vui lòng thử lại.');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Lỗi kết nối server.');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    // Check auth
    const user = Auth.getUser();
    const isLoggedIn = localStorage.getItem('gym-login') === 'true';

    if (!isLoggedIn || !user || (user.role !== 'ADMIN' && user.Role !== 'ADMIN')) {
        window.location.href = 'index.html';
        return;
    }

    // Display admin info
    document.getElementById('admin-name').textContent = user.fullName || user.FullName || 'Admin';

    // Logout button
    const logoutBtn = document.getElementById('logout-btn-dashboard');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    }

    // Load orders initially
    loadOrders();
});

window.switchTab = function (tab) {
    const sections = ['orders', 'bookings', 'pt-bookings', 'products'];

    sections.forEach(s => {
        const section = document.getElementById(`${s}-section`);
        const btn = document.getElementById(`tab-${s}`);

        if (s === tab) {
            section.classList.remove('hidden');
            btn.classList.add('bg-primary', 'text-black');
            btn.classList.remove('text-white/60', 'hover:bg-white/5');

            // Trigger load for the specific tab
            if (s === 'pt-bookings') loadPTBookings();
            if (s === 'bookings') loadBookings();
            if (s === 'orders') loadOrders();
            if (s === 'products') loadProducts();
        } else {
            section.classList.add('hidden');
            btn.classList.remove('bg-primary', 'text-black');
            btn.classList.add('text-white/60', 'hover:bg-white/5');
        }
    });
};

async function loadPTBookings() {
    const container = document.getElementById('pt-bookings-container');

    try {
        const response = await fetch(`${ADMIN_API_URL}/TrainerBookings`);
        const bookings = await response.json();

        if (bookings.length === 0) {
            container.innerHTML = `
                <div class="text-center py-100 bg-white/5 rounded-3xl">
                    <i class="fas fa-user-tie text-5xl text-white/10 mb-20"></i>
                    <p class="text-white/40">Chưa có yêu cầu thuê PT nào.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = bookings.map(booking => renderPTBookingCard(booking)).join('');
    } catch (error) {
        console.error('Error loading PT bookings:', error);
        container.innerHTML = `<div class="text-red-500 text-center py-50">Không thể tải danh sách thuê PT.</div>`;
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function renderPTBookingCard(booking) {
    const date = formatDate(booking.bookingDate);
    const createdAt = formatDate(booking.createdAt);
    const total = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalPrice);

    return `
        <div class="order-card p-30 border-l-4 border-primary">
            <div class="flex justify-between items-start mb-20">
                <div class="flex items-center gap-20">
                    <div class="size-60 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <i class="fas fa-user-tie text-primary text-2xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-black italic uppercase text-primary">${booking.trainerName}</h3>
                        <p class="text-white/60 text-sm font-bold"><i class="fas fa-user mr-10"></i>Khách hàng: ${booking.userName}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-10">
                    <span class="status-badge ${BookingStatusClasses[booking.status]}" id="pt-status-${booking.id}">
                        ${BookingStatusLabels[booking.status]}
                    </span>
                    ${(booking.status !== 2 && booking.status !== 3) ? `
                    <select class="status-select" onchange="updatePTBookingStatus(${booking.id}, this.value)">
                        ${Object.keys(BookingStatusLabels).map(val => `
                            <option value="${val}" ${booking.status == val ? 'selected' : ''}>${BookingStatusLabels[val]}</option>
                        `).join('')}
                    </select>` : ''}
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-20 bg-white/5 p-20 rounded-2xl border border-white/5">
                <div>
                    <p class="text-[10px] text-white/40 uppercase tracking-widest mb-5 italic">Ngày yêu cầu</p>
                    <p class="font-bold">${date}</p>
                </div>
                <div>
                    <p class="text-[10px] text-white/40 uppercase tracking-widest mb-5 italic">Ghi chú giờ</p>
                    <p class="font-bold">${booking.timeSlot || 'Lịch hẹn linh hoạt'}</p>
                </div>
                <div>
                    <p class="text-[10px] text-white/40 uppercase tracking-widest mb-5 italic">Phí thuê / Giờ</p>
                    <p class="font-bold text-primary">${total}</p>
                </div>
            </div>
            <p class="text-[10px] text-white/20 mt-15 italic font-medium">Yêu cầu lúc: ${createdAt}</p>
        </div>
    `;
}

async function updatePTBookingStatus(id, newStatus) {
    try {
        const response = await fetch(`${ADMIN_API_URL}/TrainerBookings/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: parseInt(newStatus) })
        });

        if (response.ok) {
            const badge = document.getElementById(`pt-status-${id}`);
            if (badge) {
                badge.textContent = BookingStatusLabels[newStatus];
                badge.className = `status-badge ${BookingStatusClasses[newStatus]}`;
            }
            alert('Cập nhật trạng thái thuê PT thành công!');
        }
    } catch (error) {
        console.error('Error updating PT booking status:', error);
        alert('Lỗi khi cập nhật trạng thái.');
    }
}

async function loadBookings() {
    const container = document.getElementById('bookings-container');

    try {
        const response = await fetch(`${ADMIN_API_URL}/bookings`);
        const bookings = await response.json();

        if (bookings.length === 0) {
            container.innerHTML = `
                <div class="text-center py-100 bg-white/5 rounded-3xl">
                    <i class="fas fa-calendar-alt text-5xl text-white/10 mb-20"></i>
                    <p class="text-white/40">Chưa có lịch đặt nào.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = bookings.map(booking => renderBookingCard(booking)).join('');
    } catch (error) {
        console.error('Error loading bookings:', error);
        container.innerHTML = `<div class="text-red-500 text-center py-50">Không thể tải danh sách đặt lịch.</div>`;
    }
}

const BookingStatusLabels = {
    0: 'Chờ xác nhận',
    1: 'Đã xác nhận',
    2: 'Đã hủy',
    3: 'Hoàn tất'
};

const BookingStatusClasses = {
    0: 'status-pending',
    1: 'status-confirmed',
    2: 'status-cancelled',
    3: 'status-completed'
};

function renderBookingCard(booking) {
    const date = formatDate(booking.bookingDate);
    const createdAt = formatDate(booking.createdAt);
    const total = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalPrice);

    return `
        <div class="order-card p-30">
            <div class="flex justify-between items-start mb-20">
                <div>
                    <h3 class="text-xl font-bold mb-5 italic text-primary">${booking.gymName}</h3>
                    <p class="text-white/60 text-sm font-bold"><i class="fas fa-user mr-10"></i> ${booking.userName}</p>
                </div>
                <div class="flex items-center space-x-10">
                    <span class="status-badge ${BookingStatusClasses[booking.status]}" id="booking-status-${booking.id}">
                        ${BookingStatusLabels[booking.status]}
                    </span>
                    ${(booking.status !== 2 && booking.status !== 3) ? `
                    <select class="status-select" onchange="updateBookingStatus(${booking.id}, this.value)">
                        ${Object.keys(BookingStatusLabels).map(val => `
                            <option value="${val}" ${booking.status == val ? 'selected' : ''}>${BookingStatusLabels[val]}</option>
                        `).join('')}
                    </select>` : ''}
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-20 bg-white/5 p-20 rounded-2xl border border-white/5">
                <div>
                    <p class="text-[10px] text-white/40 uppercase tracking-widest mb-5">Ngày tập</p>
                    <p class="font-bold">${date}</p>
                </div>
                <div>
                    <p class="text-[10px] text-white/40 uppercase tracking-widest mb-5">Khung giờ</p>
                    <p class="font-bold">${booking.timeSlot}</p>
                </div>
                <div>
                    <p class="text-[10px] text-white/40 uppercase tracking-widest mb-5">Tổng tiền</p>
                    <p class="font-bold text-primary">${total}</p>
                </div>
            </div>
            <p class="text-[10px] text-white/20 mt-15 italic">Đặt lúc: ${createdAt}</p>
        </div>
    `;
}

async function updateBookingStatus(bookingId, newStatus) {
    try {
        const response = await fetch(`${ADMIN_API_URL}/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: parseInt(newStatus) })
        });

        const data = await response.json();
        if (data.success) {
            const badge = document.getElementById(`booking-status-${bookingId}`);
            if (badge) {
                badge.textContent = BookingStatusLabels[newStatus];
                badge.className = `status-badge ${BookingStatusClasses[newStatus]}`;
            }
            alert('Cập nhật trạng thái thành công!');
        }
    } catch (error) {
        console.error('Error updating booking status:', error);
        alert('Lỗi khi cập nhật trạng thái.');
    }
}

async function loadOrders() {
    const container = document.getElementById('orders-container');

    try {
        const response = await fetch(`${ADMIN_API_URL}/orders`);
        const orders = await response.json();

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-100 bg-white/5 rounded-3xl">
                    <i class="fas fa-shopping-basket text-5xl text-white/10 mb-20"></i>
                    <p class="text-white/40">Chưa có đơn hàng nào.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => renderOrderCard(order)).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `<div class="text-red-500 text-center py-50">Không thể tải danh sách đơn hàng. Vui lòng kiểm tra kết nối!</div>`;
    }
}

function renderOrderCard(order) {
    const date = formatDate(order.orderDate);
    const total = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount);

    const itemsHtml = order.orderDetails.map(item => `
        <div class="flex items-center justify-between text-sm py-5 border-b border-white/5 last:border-0">
            <span class="text-white/60">${item.product?.name || 'Sản phẩm'} x ${item.quantity}</span>
            <span class="font-medium">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</span>
        </div>
    `).join('');

    return `
        <div class="order-card">
            <div class="flex justify-between items-start mb-20">
                <div>
                    <h3 class="text-xl font-bold mb-5 italic">#ORD-${order.id}</h3>
                    <div class="flex items-center gap-10">
                        <p class="text-white/40 text-sm"><i class="far fa-calendar-alt mr-5"></i> ${date}</p>
                        <span class="text-[10px] px-8 py-2 rounded bg-white/10 text-white/60 font-bold uppercase tracking-wider">
                            <i class="fas ${order.paymentMethod === 'QR' ? 'fa-qrcode' : 'fa-money-bill-wave'} mr-5"></i>
                            ${order.paymentMethod || 'COD'}
                        </span>
                    </div>
                </div>
                <div class="flex items-center space-x-10">
                    <span class="status-badge ${StatusClasses[order.status]}" id="status-badge-${order.id}">
                        ${StatusLabels[order.status]}
                    </span>
                    ${(order.status !== 3 && order.status !== 4) ? `
                    <select class="status-select" onchange="updateStatus(${order.id}, this.value)">
                        ${Object.keys(StatusLabels).map(val => `
                            <option value="${val}" ${order.status == val ? 'selected' : ''}>${StatusLabels[val]}</option>
                        `).join('')}
                    </select>` : ''}
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-30">
                <div class="space-y-10">
                    <p class="text-sm"><i class="fas fa-user mr-10 text-primary"></i> ${order.fullName}</p>
                    <p class="text-sm"><i class="fas fa-phone mr-10 text-primary"></i> ${order.phone}</p>
                    <p class="text-sm"><i class="fas fa-map-marker-alt mr-10 text-primary"></i> ${order.address}</p>
                    ${order.note ? `<p class="text-sm text-white/40 italic"><i class="fas fa-sticky-note mr-10"></i> ${order.note}</p>` : ''}
                </div>
                <div class="bg-black/20 p-20 rounded-2xl border border-white/5">
                    <p class="text-xs font-bold text-white/40 uppercase tracking-widest mb-10">Chi tiết đơn hàng</p>
                    <div class="max-h-[150px] overflow-y-auto mb-15">
                        ${itemsHtml}
                    </div>
                    <div class="flex justify-between items-center pt-10 border-t border-white/10">
                        <span class="font-bold">Tổng cộng</span>
                        <span class="text-primary font-bold text-xl">${total}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function updateStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${ADMIN_API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: parseInt(newStatus) })
        });

        const data = await response.json();
        if (data.success) {
            // Update badge UI
            const badge = document.getElementById(`status-badge-${orderId}`);
            if (badge) {
                badge.textContent = StatusLabels[newStatus];
                badge.className = `status-badge ${StatusClasses[newStatus]}`;
            }
            alert('Cập nhật trạng thái thành công!');
        } else {
            alert(data.message || 'Cập nhật thất bại.');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Không thể kết nối tới server.');
    }
}
