const API_BASE_URL = 'http://localhost:5037/api';

document.addEventListener('DOMContentLoaded', () => {
    initUserDashboard();
});

async function initUserDashboard() {
    const userString = localStorage.getItem('gym-user');
    const user = userString ? JSON.parse(userString) : null;
    const isLoggedIn = localStorage.getItem('gym-login') === 'true';

    if (!isLoggedIn || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Refresh user data to get latest profile fields
    await refreshUserData(user.id || user.Id);

    // Setup Profile Form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.onsubmit = handleProfileUpdate;
    }

    // Initial load
    fetchAndRenderOrders();
    setupStarRating();
}

async function refreshUserData(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (response.ok) {
            const userData = await response.json();
            localStorage.setItem('gym-user', JSON.stringify(userData));
            updateUserUI(userData);
        }
    } catch (error) {
        console.error("Error refreshing user data:", error);
    }
}

function updateUserUI(user) {
    const name = user.fullName || user.FullName || 'User';

    // Header/Sidebar labels
    const userNameElements = document.querySelectorAll('#user-display-name, #sidebar-user-name');
    userNameElements.forEach(el => el.textContent = name);

    // Pre-fill Profile Form
    if (document.getElementById('profile-fullname')) {
        document.getElementById('profile-fullname').value = name;
        document.getElementById('profile-email').value = user.email || user.Email || '';
        document.getElementById('profile-phone').value = user.phoneNumber || user.PhoneNumber || '';
        document.getElementById('profile-gender').value = user.gender || user.Gender || '';
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const saveBtn = document.getElementById('save-profile-btn');
    const user = JSON.parse(localStorage.getItem('gym-user'));
    const userId = user.id || user.Id;

    saveBtn.disabled = true;
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="las la-spinner la-spin"></i> Đang tải...';

    const updateData = {
        fullName: document.getElementById('profile-fullname').value,
        phoneNumber: document.getElementById('profile-phone').value,
        gender: document.getElementById('profile-gender').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const result = await response.json();
            localStorage.setItem('gym-user', JSON.stringify(result.user));
            updateUserUI(result.user);

            saveBtn.innerHTML = '<i class="las la-check"></i> Đã cập nhật';
            saveBtn.classList.replace('bg-primary', 'bg-green-500');

            setTimeout(() => {
                saveBtn.innerHTML = 'Lưu thay đổi';
                saveBtn.classList.replace('bg-green-500', 'bg-primary');
                saveBtn.disabled = false;
            }, 2000);
        } else {
            throw new Error('Update failed');
        }
    } catch (error) {
        console.error("Profile Update Error:", error);
        alert("Lỗi khi cập nhật hồ sơ cá nhân.");
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    }
}

window.switchTab = function (tab) {
    const sections = ['orders', 'profile', 'pt-bookings', 'gym-bookings'];

    sections.forEach(s => {
        const section = document.getElementById(`${s}-section`);
        const btn = document.getElementById(`tab-${s}`);

        if (s === tab) {
            section.classList.remove('hidden');
            btn.classList.add('bg-primary', 'text-black');
            btn.classList.remove('text-dark/60', 'dark:text-white/40', 'hover:bg-black/5', 'dark:hover:bg-white/5');

            if (s === 'orders') fetchAndRenderOrders();
            if (s === 'pt-bookings') fetchAndRenderPTBookings();
            if (s === 'gym-bookings') fetchAndRenderGymBookings();
        } else {
            section.classList.add('hidden');
            btn.classList.remove('bg-primary', 'text-black');
            btn.classList.add('text-dark/60', 'dark:text-white/40', 'hover:bg-black/5', 'dark:hover:bg-white/5');
        }
    });
};

async function fetchAndRenderOrders() {
    const container = document.getElementById('order-list-container');
    if (!container) return;

    const user = JSON.parse(localStorage.getItem('gym-user'));
    const userId = user?.id || user?.Id;

    if (!userId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
        if (!response.ok) throw new Error('Kết nối API thất bại');

        const orders = await response.json();

        if (!orders || orders.length === 0) {
            container.innerHTML = `<div class="text-center py-60 opacity-50 italic"><p>Bạn chưa có đơn hàng nào.</p></div>`;
            return;
        }

        container.innerHTML = orders.map(order => renderOrderCard(order)).join('');
    } catch (error) {
        console.error("Lỗi Fetch:", error);
        container.innerHTML = `<p class="text-center py-40 text-red-500 font-bold italic">Không thể tải danh sách đơn hàng.</p>`;
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

function renderOrderCard(order) {
    const oId = order.id;
    const oDate = formatDate(order.orderDate);
    const oTotal = order.totalAmount;
    const oStatus = order.status;
    const oDetails = order.orderDetails || [];

    return `
    <div class="bg-gray-100 dark:bg-[#1A1C1E] p-30 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-lg group hover:border-primary/30 duration-300">
        <div class="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-20 mb-25">
            <div>
                <span class="block text-[10px] opacity-40 uppercase tracking-widest font-black">Mã đơn</span>
                <span class="font-black text-primary italic text-xl">#ORD-${oId}</span>
            </div>
            <div class="text-right flex items-center gap-20">
                <span class="text-xs font-bold opacity-60 italic">${oDate}</span>
                <span class="${getStatusClass(oStatus)} px-15 py-5 rounded-full text-[10px] font-black uppercase italic tracking-widest">
                    ${getStatusText(oStatus)}
                </span>
                ${(oStatus === 0 || oStatus === 1) ? `
                <button onclick="cancelOrder(${oId})" class="text-[10px] font-black text-red-500 hover:text-red-700 duration-300 uppercase tracking-widest italic ml-10">
                    <i class="fas fa-times-circle mr-5"></i> Hủy đơn
                </button>` : ''}
            </div>
        </div>

        <div class="space-y-20">
            ${oDetails.map(detail => renderOrderDetail(detail, oStatus)).join('')}
        </div>

        <div class="flex justify-between items-end mt-25 pt-20 border-t border-black/5 dark:border-white/5">
            <span class="text-[10px] opacity-30 italic font-bold uppercase tracking-widest">GymFinder Ecosystem</span>
            <div class="text-right">
                <p class="text-[10px] opacity-40 uppercase font-black tracking-widest">Tổng thanh toán</p>
                <p class="text-3xl font-black text-primary italic">${formatPrice(oTotal)}</p>
            </div>
        </div>
    </div>`;
}

function renderOrderDetail(detail, orderStatus) {
    const product = detail.product || {};
    const pName = product.name || 'Sản phẩm không xác định';
    const pImg = product.image || 'assets/images/shop/product-placeholder.jpg';
    const pPrice = detail.price;
    const pQty = detail.quantity;

    return `
    <div class="flex items-center gap-25">
        <div class="size-80 bg-white dark:bg-black/20 rounded-2xl overflow-hidden flex-shrink-0 border border-black/5 dark:border-white/5 shadow-md">
            <img src="${pImg}" alt="${pName}" class="w-full h-full object-cover group-hover:scale-110 duration-500">
        </div>
        <div class="grow">
            <h5 class="text-base font-black uppercase italic tracking-tight mb-5">${pName}</h5>
            <p class="text-xs opacity-50 font-bold">${pQty} x ${formatPrice(pPrice)}</p>
        </div>
        <div class="flex flex-col items-end gap-10">
            <div class="font-black text-lg italic">
                ${formatPrice(pPrice * pQty)}
            </div>
            ${orderStatus === 3 ? `
            <button onclick="openReviewModal(${product.id}, '${pName.replace(/'/g, "\\'")}', '${pImg}')" 
                class="text-[10px] font-black text-primary hover:text-white duration-300 uppercase tracking-widest italic">
                <i class="fas fa-star mr-5"></i> Viết Đánh giá
            </button>` : ''}
        </div>
    </div>`;
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function getStatusText(status) {
    const s = parseInt(status);
    const map = { 0: "Chờ xác nhận", 1: "Đã xác nhận", 2: "Đang giao", 3: "Hoàn tất", 4: "Đã hủy" };
    return map[s] || "Đang xử lý";
}

function getStatusClass(status) {
    const s = parseInt(status);
    if (s === 3) return "bg-green-500/10 text-green-500";
    if (s === 4) return "bg-red-500/10 text-red-500";
    return "bg-yellow-500/10 text-yellow-500";
}

// --- Review Functions ---

function setupStarRating() {
    const stars = document.querySelectorAll('#star-rating i');
    stars.forEach(star => {
        star.addEventListener('mouseover', function () {
            const rating = this.getAttribute('data-rating');
            highlightStars(rating);
        });

        star.addEventListener('click', function () {
            const rating = this.getAttribute('data-rating');
            document.getElementById('review-rating').value = rating;
            highlightStars(rating);
        });
    });

    document.getElementById('star-rating')?.addEventListener('mouseleave', function () {
        const currentRating = document.getElementById('review-rating').value;
        highlightStars(currentRating);
    });

    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.onsubmit = handleReviewSubmit;
    }
}

function highlightStars(rating) {
    document.querySelectorAll('#star-rating i').forEach(s => {
        if (s.getAttribute('data-rating') <= rating) {
            s.classList.remove('far');
            s.classList.add('fas');
        } else {
            s.classList.remove('fas');
            s.classList.add('far');
        }
    });
}

function openReviewModal(productId, productName, productImage) {
    const modal = document.getElementById('review-modal');
    const productInfo = document.getElementById('review-product-info');
    const modalTitle = modal.querySelector('h3');

    if (modalTitle) modalTitle.textContent = "Đánh giá sản phẩm";

    document.getElementById('review-product-id').value = productId;
    document.getElementById('review-comment').value = '';
    document.getElementById('review-rating').value = '5';

    highlightStars(5);

    productInfo.innerHTML = `
        <img src="${productImage}" class="size-70 rounded-xl object-cover border border-black/5 dark:border-white/5 shadow-md">
        <div>
            <h4 class="font-black text-sm uppercase italic mb-5 leading-tight">${productName}</h4>
            <p class="text-[10px] opacity-50 font-bold uppercase tracking-widest">Đánh giá sản phẩm này</p>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

async function handleReviewSubmit(e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('gym-user'));
    if (!user) {
        alert("Vui lòng đăng nhập lại.");
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang gửi...";

    const type = document.getElementById('review-type').value; // 'product' or 'trainer'
    const id = parseInt(document.getElementById('review-product-id').value);

    const reviewData = {
        UserId: user.id || user.Id,
        TrainerId: id,
        Rating: parseInt(document.getElementById('review-rating').value),
        Comment: document.getElementById('review-comment').value
    };

    if (type !== 'trainer') {
        reviewData.ProductId = id;
        delete reviewData.TrainerId;
    }

    console.log("Submitting review data:", reviewData);

    const endpoint = type === 'trainer' ? 'trainerreviews' : 'productreviews';

    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });

        if (response.ok) {
            alert("Đánh giá của bạn đã được ghi lại. Cảm ơn bạn!");
            closeReviewModal();
        } else {
            const error = await response.json();
            alert(error.message || "Gửi đánh giá thất bại.");
        }
    } catch (error) {
        console.error("Lỗi gửi đánh giá:", error);
        alert("Không thể kết nối đến máy chủ.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function fetchAndRenderPTBookings() {
    const container = document.getElementById('pt-bookings-container');
    if (!container) return;

    const user = JSON.parse(localStorage.getItem('gym-user'));
    const userId = user?.id || user?.Id;

    if (!userId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/trainerbookings/my/${userId}`);
        if (!response.ok) throw new Error('Kết nối API thất bại');

        const bookings = await response.json();

        if (!bookings || bookings.length === 0) {
            container.innerHTML = `<div class="text-center py-60 opacity-50 italic"><p>Bạn chưa thuê huấn luyện viên nào.</p></div>`;
            return;
        }

        container.innerHTML = bookings.map(booking => renderPTBookingCard(booking)).join('');
    } catch (error) {
        console.error("Lỗi Fetch PT Bookings:", error);
        container.innerHTML = `<p class="text-center py-40 text-red-500 font-bold italic">Không thể tải danh sách thuê PT.</p>`;
    }
}

function renderPTBookingCard(booking) {
    const trainerName = booking.trainerName;
    const trainerImg = booking.trainerImage || 'assets/images/team/member-1.jpg';
    const date = formatDate(booking.bookingDate);
    const status = booking.status;
    const price = booking.totalPrice;

    return `
    <div class="bg-gray-100 dark:bg-[#1A1C1E] p-30 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-lg group hover:border-primary/30 duration-300">
        <div class="flex items-center gap-25">
            <div class="size-100 bg-white dark:bg-black/20 rounded-2xl overflow-hidden flex-shrink-0 border border-black/5 dark:border-white/5 shadow-md">
                <img src="${trainerImg}" alt="${trainerName}" class="w-full h-full object-cover">
            </div>
            <div class="grow">
                <div class="flex justify-between items-start mb-10">
                    <div>
                        <h5 class="text-xl font-black uppercase italic tracking-tight text-primary">${trainerName}</h5>
                        <p class="text-xs opacity-50 font-bold italic">Ngày hẹn: ${date}</p>
                    </div>
                    <span class="${getBookingStatusClass(status)} px-15 py-5 rounded-full text-[10px] font-black uppercase italic tracking-widest">
                        ${getBookingStatusText(status)}
                    </span>
                </div>
                <div class="flex justify-between items-center mt-20">
                    <div>
                        <p class="text-[10px] opacity-40 uppercase font-black tracking-widest">Chi phí</p>
                        <p class="text-xl font-black italic">${formatPrice(price)}</p>
                    </div>
                    ${status === 3 ? `
                    <button onclick="openPTReviewModal(${booking.trainerId || 0}, '${trainerName.replace(/'/g, "\\'")}', '${trainerImg}')" 
                        class="btn btn-primary px-20 py-10 !text-[10px] uppercase font-black tracking-widest">
                        Đánh giá HLV
                    </button>` : ''}
                    ${(status === 0 || status === 1) ? `
                    <button onclick="cancelPTBooking(${booking.id})" class="text-[10px] font-black text-red-500 hover:text-red-700 duration-300 uppercase tracking-widest italic">
                        <i class="fas fa-times-circle mr-5"></i> Hủy lịch
                    </button>` : ''}
                </div>
            </div>
        </div>
    </div>`;
}

function getBookingStatusText(status) {
    const s = parseInt(status);
    const map = { 0: "Chờ xác nhận", 1: "Đã xác nhận", 2: "Đã hủy", 3: "Hoàn tất" };
    return map[s] || "Đang xử lý";
}

function getBookingStatusClass(status) {
    const s = parseInt(status);
    if (s === 1) return "bg-blue-500/10 text-blue-500";
    if (s === 3) return "bg-green-500/10 text-green-500";
    if (s === 2) return "bg-red-500/10 text-red-500";
    return "bg-yellow-500/10 text-yellow-500";
}

async function fetchAndRenderGymBookings() {
    const container = document.getElementById('gym-bookings-container');
    if (!container) return;

    const user = JSON.parse(localStorage.getItem('gym-user'));
    const userId = user?.id || user?.Id;

    if (!userId) return;

    try {
        const response = await fetch(`${API_BASE_URL}/bookings/my/${userId}`);
        if (!response.ok) throw new Error('Kết nối API thất bại');

        const bookings = await response.json();

        if (!bookings || bookings.length === 0) {
            container.innerHTML = `<div class="text-center py-60 opacity-50 italic"><p>Bạn chưa đặt lịch tập gym nào.</p></div>`;
            return;
        }

        container.innerHTML = bookings.map(booking => renderGymBookingCard(booking)).join('');
    } catch (error) {
        console.error("Lỗi Fetch Gym Bookings:", error);
        container.innerHTML = `<p class="text-center py-40 text-red-500 font-bold italic">Không thể tải danh sách đặt gym.</p>`;
    }
}

function renderGymBookingCard(booking) {
    const gymName = booking.gymName;
    const date = formatDate(booking.bookingDate);
    const time = booking.timeSlot;
    const status = booking.status;
    const price = booking.totalPrice;

    return `
    <div class="bg-gray-100 dark:bg-[#1A1C1E] p-30 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-lg group hover:border-primary/30 duration-300">
        <div class="flex justify-between items-start mb-20 pb-15 border-b border-black/5 dark:border-white/5">
            <div>
                <h5 class="text-xl font-black uppercase italic tracking-tight text-primary">${gymName}</h5>
                <p class="text-[10px] opacity-40 uppercase font-black tracking-widest mt-5">Gym Booking</p>
            </div>
            <span class="${getBookingStatusClass(status)} px-15 py-5 rounded-full text-[10px] font-black uppercase italic tracking-widest">
                ${getBookingStatusText(status)}
            </span>
        </div>
        <div class="grid grid-cols-2 gap-20">
            <div>
                <p class="text-[10px] opacity-40 uppercase font-black tracking-widest mb-5">Thời gian</p>
                <p class="font-bold text-sm italic">${date} | ${time}</p>
            </div>
            <div>
                <p class="text-[10px] opacity-40 uppercase font-black tracking-widest mb-5">Chi phí</p>
                <p class="font-bold text-sm italic text-primary">${formatPrice(price)}</p>
            </div>
        </div>
        ${(status === 0 || status === 1) ? `
        <div class="mt-20 text-right">
            <button onclick="cancelGymBooking(${booking.id})" class="text-[10px] font-black text-red-500 hover:text-red-700 duration-300 uppercase tracking-widest italic">
                <i class="fas fa-times-circle mr-5"></i> Hủy lịch tập
            </button>
        </div>` : ''}
    </div>`;
}

// --- Cancellation API Functions ---

async function cancelOrder(orderId) {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
            method: 'PUT'
        });

        if (response.ok) {
            alert("Đơn hàng đã được hủy.");
            fetchAndRenderOrders();
        } else {
            const err = await response.text();
            alert("Lỗi: " + err);
        }
    } catch (error) {
        console.error("Lỗi hủy đơn:", error);
        alert("Không thể kết nối đến máy chủ.");
    }
}

async function cancelPTBooking(bookingId) {
    if (!confirm("Bạn có chắc chắn muốn hủy yêu cầu thuê PT này?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/trainerbookings/${bookingId}/cancel`, {
            method: 'PUT'
        });

        if (response.ok) {
            alert("Yêu cầu thuê HLv đã được hủy.");
            fetchAndRenderPTBookings();
        } else {
            const err = await response.text();
            alert("Lỗi: " + err);
        }
    } catch (error) {
        console.error("Lỗi hủy thuê PT:", error);
        alert("Không thể kết nối đến máy chủ.");
    }
}

async function cancelGymBooking(bookingId) {
    if (!confirm("Bạn có chắc chắn muốn hủy lịch tập này?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
            method: 'PUT'
        });

        if (response.ok) {
            alert("Lịch tập đã được hủy.");
            fetchAndRenderGymBookings();
        } else {
            const err = await response.text();
            alert("Lỗi: " + err);
        }
    } catch (error) {
        console.error("Lỗi hủy đặt gym:", error);
        alert("Không thể kết nối đến máy chủ.");
    }
}

function openPTReviewModal(trainerId, name, img) {
    // We reuse the same modal, but change the type
    const modal = document.getElementById('review-modal');
    const productInfo = document.getElementById('review-product-info');
    const modalTitle = modal.querySelector('h3');

    if (modalTitle) modalTitle.textContent = "Đánh giá huấn luyện viên";

    // Add a hidden input to track type if not exists
    if (!document.getElementById('review-type')) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.id = 'review-type';
        modal.appendChild(input);
    }

    document.getElementById('review-type').value = 'trainer';
    document.getElementById('review-product-id').value = trainerId;
    document.getElementById('review-comment').value = '';
    document.getElementById('review-rating').value = '5';

    highlightStars(5);

    productInfo.innerHTML = `
        <img src="${img}" class="size-70 rounded-xl object-cover border border-black/5 dark:border-white/5 shadow-md">
        <div>
            <h4 class="font-black text-sm uppercase italic mb-5 leading-tight">${name}</h4>
            <p class="text-[10px] opacity-50 font-bold uppercase tracking-widest">Đánh giá huấn luyện viên này</p>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}