const API_BASE_URL = 'http://localhost:5037/api';

document.addEventListener('DOMContentLoaded', function () {
    initGymFinder();
});

async function initGymFinder() {
    const gymGrid = document.getElementById('gym-grid');
    const searchInput = document.getElementById('gym-search-input');
    const searchBtn = document.getElementById('gym-search-btn');
    const ratingFilter = document.getElementById('gym-rating-filter');
    const statusText = document.getElementById('gym-status');

    // Initial Load
    loadGyms();

    // Event Listeners
    searchBtn.addEventListener('click', () => loadGyms());
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadGyms();
    });
    ratingFilter.addEventListener('change', () => loadGyms());

    // Modal logic
    initReviewModal();
    initBookingModal();
}

async function loadGyms(page = 1) {
    const gymGrid = document.getElementById('gym-grid');
    const emptyState = document.getElementById('gym-empty');
    const searchInput = document.getElementById('gym-search-input');
    const ratingFilter = document.getElementById('gym-rating-filter');
    const statusText = document.getElementById('gym-status');

    const search = searchInput.value;
    const minRating = ratingFilter.value;

    try {
        showStatus('Đang tìm kiếm phòng tập...');
        const url = new URL(`${API_BASE_URL}/gyms`);
        if (search) url.searchParams.append('search', search);
        if (minRating > 0) url.searchParams.append('minRating', minRating);
        url.searchParams.append('page', page);
        url.searchParams.append('pageSize', 9);

        const response = await fetch(url);
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();

        // Handle paginated response: data.items instead of data
        const gyms = data.items || [];
        renderGyms(gyms);
        renderPagination(data);

        if (gyms.length === 0) {
            gymGrid.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error loading gyms:', error);
        gymGrid.innerHTML = '<p class="col-span-full text-center text-red-500">Lỗi khi tải danh sách phòng tập. Vui lòng thử lại sau.</p>';
    } finally {
        hideStatus();
    }
}

function renderGyms(gyms) {
    const gymGrid = document.getElementById('gym-grid');
    gymGrid.innerHTML = gyms.map(gym => `
        <div class="gym-card group bg-white dark:bg-dark rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 dark:border-white/5 duration-500 hover:shadow-2xl hover:-translate-y-2">
            <a href="gym-details.html?id=${gym.id}" class="block aspect-[4/3] overflow-hidden relative">
                <img src="${gym.image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop'}" 
                    alt="${gym.name}" class="gym-image w-full h-full object-cover duration-700 group-hover:scale-110">
                <div class="absolute top-6 right-6 bg-primary text-black px-4 py-1.5 rounded-full text-sm font-black shadow-xl backdrop-blur-sm">
                    ${gym.rating.toFixed(1)} <i class="las la-star"></i>
                </div>
            </a>
            <div class="p-8">
                <a href="gym-details.html?id=${gym.id}" class="block">
                    <h3 class="text-2xl font-black mb-3 dark:text-white truncate hover:text-primary transition-all underline-offset-4">${gym.name}</h3>
                </a>
                <div class="flex items-center justify-between mb-6">
                    <p class="text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed text-sm">
                        <i class="las la-map-marker-alt text-primary mr-1"></i> ${gym.address || 'Hà Nội'}
                    </p>
                    <div class="text-right">
                        <span class="text-primary font-black text-xl">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(gym.pricePerHour || 50000)}</span>
                        <p class="text-[10px] text-white/40 uppercase tracking-widest">mỗi giờ</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-10 pt-6 border-t border-gray-100 dark:border-white/5">
                    <button onclick="openReview(${gym.id}, '${gym.name.replace(/'/g, "\\'")}')" 
                        class="text-xs font-black text-white/60 hover:text-primary transition-all flex items-center justify-center gap-5">
                        <i class="las la-star"></i> ${gym.reviewCount || 0} ĐÁNH GIÁ
                    </button>
                    <button onclick="openBooking(${gym.id}, '${gym.name.replace(/'/g, "\\'")}', ${gym.pricePerHour || 50000})" 
                        class="text-sm font-black text-black bg-primary px-4 py-3 rounded-xl hover:bg-white hover:text-black transition-all shadow-lg shadow-primary/20">
                        ĐẶT LỊCH
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

let currentPage = 1;

function renderPagination(data) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;

    const { totalPages, currentPage: page } = data;
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = `
        <div class="pagination-wrapper flex justify-center items-center gap-4 mt-20">
            <button onclick="changePage(${page - 1})" ${page === 1 ? 'disabled' : ''} 
                class="page-nav-btn ${page === 1 ? 'opacity-30 cursor-not-allowed' : ''}">
                <i class="las la-angle-left"></i>
            </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button onclick="changePage(${i})" 
                class="page-number-btn ${i === page ? 'active' : ''}">
                ${i}
            </button>
        `;
    }

    html += `
            <button onclick="changePage(${page + 1})" ${page === totalPages ? 'disabled' : ''} 
                class="page-nav-btn ${page === totalPages ? 'opacity-30 cursor-not-allowed' : ''}">
                <i class="las la-angle-right"></i>
            </button>
        </div>
    `;

    paginationContainer.innerHTML = html;
}

window.changePage = function (page) {
    currentPage = page;
    loadGyms(page);
};

// Review Modal Logic
let currentRating = 5;

function initReviewModal() {
    const modal = document.getElementById('review-modal');
    const closeBtns = document.querySelectorAll('.modal-close');
    const starBtns = document.querySelectorAll('.star-btn');
    const form = document.getElementById('gym-review-form');

    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        modal.classList.add('hidden');
    }));

    starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentRating = parseInt(btn.dataset.value);
            updateStars(currentRating);
        });
        btn.addEventListener('mouseenter', () => updateStars(parseInt(btn.dataset.value)));
        btn.addEventListener('mouseleave', () => updateStars(currentRating));
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = Auth.getUser();
        if (!user) {
            alert('Vui lòng đăng nhập để đánh giá!');
            window.location.href = 'login.html';
            return;
        }

        const gymId = document.getElementById('modal-gym-id').value;
        const comment = document.getElementById('modal-review-comment').value;

        try {
            const response = await fetch(`${API_BASE_URL}/gymreviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gymId: parseInt(gymId),
                    userId: user.id,
                    rating: currentRating,
                    comment: comment
                })
            });

            if (!response.ok) throw new Error('Review submission failed');

            alert('Cảm ơn bạn đã gửi đánh giá!');
            modal.classList.add('hidden');
            loadGyms();
        } catch (error) {
            console.error('Review error:', error);
            alert('Lỗi khi gửi đánh giá.');
        }
    });
}

function updateStars(val) {
    const starBtns = document.querySelectorAll('.star-btn');
    starBtns.forEach((btn, i) => {
        if (i < val) {
            btn.classList.add('text-yellow-400');
            btn.classList.remove('text-gray-300');
        } else {
            btn.classList.remove('text-yellow-400');
            btn.classList.add('text-gray-300');
        }
    });
}

async function openReview(id, name) {
    const user = Auth.getUser();
    if (!user) {
        alert('Bạn cần đăng nhập để thực hiện chức năng này.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/gymreviews/eligible/${id}/${user.id}`);
        const data = await response.json();

        if (!data.eligible) {
            alert(data.message || 'Bạn cần hoàn thành một lịch tập tại phòng gym này để có thể đánh giá.');
            return;
        }

        document.getElementById('modal-gym-id').value = id;
        document.getElementById('modal-gym-info').innerHTML = `<h4 class="font-bold dark:text-white">${name}</h4>`;
        document.getElementById('modal-review-comment').value = '';
        currentRating = 5;
        updateStars(5);
        document.getElementById('review-modal').classList.remove('hidden');
    } catch (error) {
        console.error('Error checking eligibility:', error);
        alert('Có lỗi xảy ra khi kiểm tra quyền đánh giá. Vui lòng thử lại sau.');
    }
}

function initBookingModal() {
    const form = document.getElementById('gym-booking-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = Auth.getUser();
        if (!user) {
            alert('Vui lòng đăng nhập để đặt lịch!');
            window.location.href = 'login.html';
            return;
        }

        const gymId = document.getElementById('booking-gym-id').value;
        const date = document.getElementById('booking-date').value;
        const time = document.getElementById('booking-time').value;

        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gymId: parseInt(gymId),
                    userId: user.id,
                    bookingDate: date,
                    timeSlot: time
                })
            });

            if (!response.ok) throw new Error('Booking failed');

            alert('Đặt lịch thành công! Vui lòng đợi quản trị viên xác nhận.');
            closeBookingModal();
        } catch (error) {
            console.error('Booking error:', error);
            alert('Lỗi khi đặt lịch. Vui lòng thử lại sau.');
        }
    });
}

window.openBooking = function (id, name, price) {
    const user = Auth.getUser();
    if (!user) {
        alert('Vui lòng đăng nhập để đặt lịch!');
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('booking-gym-id').value = id;
    document.getElementById('modal-booking-gym-name').textContent = name;
    document.getElementById('modal-booking-price').textContent = `Giá: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 50000)}/giờ`;

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('booking-date').value = tomorrow.toISOString().split('T')[0];

    document.getElementById('booking-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.closeBookingModal = function () {
    document.getElementById('booking-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
};

function showStatus(msg) {
    const statusText = document.getElementById('gym-status');
    statusText.innerText = msg;
    statusText.classList.remove('hidden');
}

function hideStatus() {
    const statusText = document.getElementById('gym-status');
    statusText.classList.add('hidden');
}
