// gym-details.js
const DETAIL_API_BASE_URL = 'https://gymfinder953.runasp.net/api';

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const gymId = urlParams.get('id');

    if (!gymId) {
        window.location.href = 'gym-finder.html';
        return;
    }

    loadGymDetails(gymId);
});

async function loadGymDetails(id) {
    try {
        const response = await fetch(`${DETAIL_API_BASE_URL}/gyms/${id}`);
        if (!response.ok) throw new Error('Gym not found');
        const gym = await response.json();

        renderGymDetails(gym);
        renderReviews(gym.reviews || []);

        // Setup buttons
        document.getElementById('detail-booking-btn').onclick = () => {
            openBooking(gym.id, gym.name, gym.pricePerHour || 50000);
        };

        document.getElementById('detail-review-btn').onclick = () => {
            openReview(gym.id, gym.name);
        };

    } catch (error) {
        console.error('Error loading gym details:', error);
        document.getElementById('gym-details-content').innerHTML = `
            <div class="col-span-full text-center py-100">
                <h2 class="text-3xl font-bold mb-20 dark:text-white">Không tìm thấy phòng tập</h2>
                <a href="gym-finder.html" class="btn btn-primary">Quay lại danh sách</a>
            </div>
        `;
    }
}

function renderGymDetails(gym) {
    document.getElementById('gym-detail-image').src = gym.image || 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop';
    document.getElementById('gym-detail-name').textContent = gym.name;
    document.getElementById('gym-detail-address').textContent = gym.address;
    document.getElementById('gym-detail-rating').textContent = gym.rating.toFixed(1);
    document.getElementById('gym-detail-price').textContent = new Intl.NumberFormat('vi-VN').format(gym.pricePerHour || 50000);

    const descEl = document.getElementById('gym-detail-description');
    if (gym.description) {
        descEl.innerHTML = gym.description.split('\n').map(p => `<p>${p}</p>`).join('');
    } else {
        descEl.innerHTML = '<p>Thông tin mô tả đang được cập nhật...</p>';
    }

    // Update Page Title
    document.title = `${gym.name} - GYMFINDER`;
}

function renderReviews(reviews) {
    const container = document.getElementById('gym-reviews-list');

    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="text-center py-40 opacity-40 italic">
                Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm!
            </div>
        `;
        return;
    }

    container.innerHTML = reviews.map(review => `
        <div class="bg-gray-50 dark:bg-white/5 p-25 rounded-3xl border border-black/5 dark:border-white/5">
            <div class="flex justify-between items-start mb-15">
                <div class="flex items-center gap-10">
                    <div class="size-40 rounded-full bg-primary flex items-center justify-center font-bold text-black uppercase">
                        ${review.userName ? review.userName.charAt(0) : '?'}
                    </div>
                    <div>
                        <h5 class="font-bold text-sm dark:text-white">${review.userName || 'Hội viên ẩn danh'}</h5>
                        <p class="text-[10px] text-white/40 uppercase tracking-widest">${review.date}</p>
                    </div>
                </div>
                <div class="flex text-primary text-xs">
                    ${Array(5).fill(0).map((_, i) => `<i class="${i < review.rating ? 'las' : 'lar'} la-star"></i>`).join('')}
                </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">"${review.comment || 'Không có nhận xét.'}"</p>
        </div>
    `).join('');
}
