const API_BASE_URL = 'http://localhost:5037/api';

const TIME_SLOTS = [
    "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
    "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00",
    "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00"
];

document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderTrainers();
    setupPTModalEvents();
});

async function fetchAndRenderTrainers() {
    const container = document.querySelector('.pxl-team-list');
    if (!container) return;

    // Detect if we are on trainers.html (grid layout) vs team.html (list layout)
    const isGridView = container.classList.contains('grid') || window.location.pathname.includes('trainers.html');
    const isMainTeamPage = window.location.pathname.includes('team.html');

    try {
        const response = await fetch(`${API_BASE_URL}/PersonalTrainers`);
        let trainers = await response.json();

        if (trainers.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-60 opacity-50 italic"><p>Hiện chưa có huấn luyện viên nào.</p></div>';
            return;
        }

        if (isGridView) {
            container.innerHTML = trainers.map(trainer => renderTrainerCard(trainer)).join('');
        } else {
            container.innerHTML = trainers.map(trainer => renderTrainerItem(trainer)).join('');
        }

    } catch (error) {
        console.error("Error fetching trainers:", error);
        container.innerHTML = '<p class="col-span-full text-center py-40 text-red-500 font-bold italic">Không thể tải danh sách huấn luyện viên.</p>';
    }
}

function renderTrainerCard(trainer) {
    return `
    <div class="group relative bg-[#F8F9FA] dark:bg-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(227,255,117,0.1)] border border-black/5 dark:border-white/10 h-full flex flex-col">
        <!-- Badge -->
        <div class="absolute top-20 left-20 z-10">
            <span class="bg-primary/90 backdrop-blur-md text-black text-[10px] font-black uppercase tracking-[0.1em] px-15 py-6 rounded-full shadow-lg">Sẵn sàng</span>
        </div>

        <!-- Image Seciton -->
        <div class="relative aspect-[4/5] overflow-hidden">
            <img src="${trainer.image}" alt="${trainer.name}" class="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110">
            
            <!-- Floating Price Tag -->
            <div class="absolute bottom-20 right-20 z-10 transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <div class="bg-black/80 backdrop-blur-xl border border-white/20 text-primary px-15 py-8 rounded-2xl shadow-2xl">
                    <span class="text-xs font-black italic tracking-tighter">${formatPrice(trainer.pricePerHour)}/h</span>
                </div>
            </div>

            <!-- Hover Overlay Action -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-30">
                <button onclick="openPTDetail(${trainer.id})" class="btn btn-primary w-full py-18 rounded-2xl text-black font-black uppercase italic tracking-widest text-xs transform translate-y-20 group-hover:translate-y-0 transition-transform duration-500 delay-100 shadow-[0_0_30px_rgba(227,255,117,0.3)]">
                    Xem hồ sơ chi tiết
                </button>
            </div>
        </div>

        <!-- Info Section -->
        <div class="p-30 flex-grow flex flex-col justify-between">
            <div>
                <div class="flex justify-between items-start mb-10">
                    <h3 class="text-2xl font-black italic uppercase tracking-tighter transition-colors group-hover:text-primary">${trainer.name}</h3>
                    <div class="flex items-center gap-8 bg-black/5 dark:bg-white/10 px-12 py-6 rounded-xl border border-black/5 dark:border-white/5">
                        <div class="flex gap-2">
                            ${renderStars(trainer.rating)}
                        </div>
                        <span class="text-[11px] font-black italic tracking-tighter">${trainer.rating}</span>
                    </div>
                </div>
                <p class="text-primary text-[11px] font-black uppercase tracking-[0.2em] mb-15">${trainer.role}</p>
                <p class="text-xs opacity-50 line-clamp-2 leading-relaxed italic mb-20">"${trainer.bio ? trainer.bio.substring(0, 100) + '...' : 'Chuyên gia huấn luyện thể hình hàng đầu tại GymFinder.'}"</p>
            </div>
            
            <div class="flex items-center gap-15 pt-20 border-t border-black/5 dark:border-white/5">
                <div class="flex -space-x-8">
                    <div class="size-24 rounded-full border-2 border-white dark:border-dark bg-gray-200"></div>
                    <div class="size-24 rounded-full border-2 border-white dark:border-dark bg-gray-300"></div>
                    <div class="size-24 rounded-full border-2 border-white dark:border-dark bg-gray-400"></div>
                </div>
                <span class="text-[10px] font-bold opacity-40 uppercase tracking-widest">+120 học viên</span>
            </div>
        </div>
    </div>`;
}

function renderTrainerItem(trainer) {
    return `
    <div class="project relative border-b dark:border-white/10 border-black/10 sm:px-30 px-20 group transition-all duration-500 hover:bg-black/5 dark:hover:bg-white/5"
        data-id="${trainer.id}" data-name="${trainer.name}" data-role="${trainer.role}"
        data-image="${trainer.image}">
        <div class="box-item max-w-1320 mx-auto lg:flex justify-between items-center relative sm:py-50 py-30">
            <img src="${trainer.image}" alt="${trainer.name}" class="mb-20 lg:hidden mx-auto size-250 object-cover rounded-3xl border-4 border-primary/20 shadow-2xl">
            
            <div class="project-title relative z-4 flex items-center gap-20 lg:mb-0 mb-30 sm:justify-start justify-center">
                <div class="hidden lg:block size-80 rounded-2xl overflow-hidden border-2 border-primary/30 group-hover:scale-110 transition-transform duration-500">
                    <img src="${trainer.image}" alt="" class="w-full h-full object-cover">
                </div>
                <div>
                    <h3 class="sm:text-[45px]/[1.1] text-2xl font-black italic uppercase tracking-tighter group-hover:text-primary transition-colors">${trainer.name}</h3>
                    <span class="text-xs font-black uppercase tracking-[0.3em] opacity-40 mt-5 block">/ ${trainer.role}</span>
                </div>
            </div>

            <div class="flex items-center gap-40 relative z-4">
                <div class="text-right max-md:hidden">
                    <div class="flex items-center justify-end gap-12 mb-8">
                        <div class="flex gap-3 text-xs">
                            ${renderStars(trainer.rating)}
                        </div>
                        <span class="text-base font-black italic tracking-tighter text-primary">${trainer.rating} / 5.0</span>
                    </div>
                    <p class="text-xl font-black text-primary italic tracking-tighter">${formatPrice(trainer.pricePerHour)}<span class="text-[10px] opacity-40 ml-5 uppercase not-italic">Mỗi giờ</span></p>
                </div>

                <div class="project-categ">
                    <a href="javascript:void(0)" onclick="openPTDetail(${trainer.id})"
                        class="group/btn relative overflow-hidden flex items-center gap-15 px-30 py-15 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-xs transition-all hover:shadow-[0_0_30px_rgba(227,255,117,0.4)]">
                        <span class="relative z-10">Thuê HLV ngay</span>
                        <svg class="relative z-10 transform group-hover/btn:translate-x-5 transition-transform" width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.33325 14.1673L14.6666 5.83398" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M6.33325 5.83398H14.6666V14.1673" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </a>
                </div>
            </div>

            <div class="item-image absolute w-350 h-450 pointer-events-none top-0 left-0 overflow-hidden opacity-0 z-10 transition-all duration-700 rounded-3xl group-hover:opacity-100 group-hover:translate-x-20">
                <div class="reveal-image position-relative h-full w-full bg-cover bg-center scale-110 group-hover:scale-100 transition-transform duration-1000"
                    style="background-image: url('${trainer.image}')"></div>
            </div>
        </div>
    </div>`;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

async function openPTDetail(id) {
    const modal = document.getElementById('pt-contact-modal');
    if (!modal) return;

    try {
        const response = await fetch(`${API_BASE_URL}/PersonalTrainers/${id}`);
        const trainer = await response.json();

        document.getElementById('pt-modal-image').src = trainer.image;
        document.getElementById('pt-modal-name').textContent = trainer.name;
        document.getElementById('pt-modal-role').textContent = trainer.role;
        document.getElementById('pt-modal-address').textContent = trainer.address;
        document.getElementById('pt-modal-rating').innerHTML = `
            <div class="flex items-center gap-10">
                <div class="flex gap-2 text-sm">${renderStars(trainer.rating)}</div>
                <span class="font-black italic text-sm">${trainer.rating}</span>
                <span class="text-[10px] opacity-40 uppercase font-bold tracking-widest">(${trainer.reviews.length} đánh giá)</span>
            </div>
        `;
        document.getElementById('pt-modal-price').textContent = `${formatPrice(trainer.pricePerHour)}/Giờ`;
        document.getElementById('pt-modal-bio').textContent = trainer.bio;
        document.getElementById('pt-modal-hire-btn').onclick = () => hireTrainer(trainer.id, trainer.name);

        // Reset and setup date/time selectors
        const dateInput = document.getElementById('pt-booking-date');
        const slotSelect = document.getElementById('pt-booking-slot');

        if (dateInput && slotSelect) {
            dateInput.value = '';
            dateInput.min = new Date().toISOString().split('T')[0];
            slotSelect.innerHTML = '<option value="">Chọn ngày trước...</option>';

            dateInput.onchange = async () => {
                const selectedDate = dateInput.value;
                if (!selectedDate) return;

                slotSelect.innerHTML = '<option value="">Đang tải khung giờ...</option>';

                try {
                    const occResponse = await fetch(`${API_BASE_URL}/TrainerBookings/occupied?trainerId=${trainer.id}&date=${selectedDate}`);
                    const occupiedSlots = await occResponse.json();

                    slotSelect.innerHTML = '<option value="">-- Chọn khung giờ --</option>';
                    TIME_SLOTS.forEach(slot => {
                        const isOccupied = occupiedSlots.includes(slot);
                        slotSelect.innerHTML += `<option value="${slot}" ${isOccupied ? 'disabled class="opacity-30"' : ''}>${slot}${isOccupied ? ' (Đã hết chỗ)' : ''}</option>`;
                    });
                } catch (error) {
                    console.error("Error fetching occupied slots:", error);
                    slotSelect.innerHTML = '<option value="">Lỗi tải dữ liệu</option>';
                }
            };
        }

        // Render reviews
        const reviewsContainer = document.getElementById('pt-modal-reviews');
        if (trainer.reviews && trainer.reviews.length > 0) {
            reviewsContainer.innerHTML = trainer.reviews.map(r => `
                <div class="mb-20 pb-20 border-b border-black/5 dark:border-white/5 last:border-0 text-left">
                    <div class="flex justify-between items-center mb-8">
                        <div class="flex items-center gap-10">
                            <div class="size-30 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">${r.userName.charAt(0).toUpperCase()}</div>
                            <span class="font-black text-xs uppercase tracking-tight">${r.userName}</span>
                        </div>
                        <span class="text-[10px] font-bold opacity-30 uppercase tracking-widest">${formatDate(r.createdAt)}</span>
                    </div>
                    <div class="flex gap-2 text-[10px] text-primary mb-10">
                        ${Array(5).fill(0).map((_, i) => `<i class="${i < r.rating ? 'fas' : 'far'} fa-star"></i>`).join('')}
                    </div>
                    <p class="text-xs opacity-60 leading-relaxed font-medium italic">"${r.comment}"</p>
                </div>
            `).join('');
        } else {
            reviewsContainer.innerHTML = '<div class="text-center py-30 px-20 border-2 border-dashed border-black/5 dark:border-white/5 rounded-2xl"><p class="text-xs opacity-40 font-bold uppercase tracking-widest">Chưa có đánh giá nào cho HLV này.</p></div>';
        }

        // Show modal
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('opacity-100');
            modal.querySelector('.modal-content').classList.remove('scale-95', 'opacity-0');
        }, 10);
    } catch (error) {
        console.error("Error fetching trainer details:", error);
        alert("Không thể tải thông tin chi tiết.");
    }
}

async function hireTrainer(trainerId, trainerName) {
    const user = JSON.parse(localStorage.getItem('gym-user'));
    if (!user) {
        alert("Vui lòng đăng nhập để thuê huấn luyện viên.");
        window.location.href = 'login.html';
        return;
    }

    const dateInput = document.getElementById('pt-booking-date');
    const slotSelect = document.getElementById('pt-booking-slot');

    if (!dateInput?.value || !slotSelect?.value) {
        alert("Vui lòng chọn ngày và khung giờ bạn muốn tập.");
        return;
    }

    const bookingData = {
        trainerId: trainerId,
        userId: user.id || user.Id,
        bookingDate: dateInput.value,
        timeSlot: slotSelect.value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/TrainerBookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            // Using a more premium alert experience if possible, but basic alert for now
            alert(`Chúc mừng! Yêu cầu thuê HLV ${trainerName} đã được ghi nhận. Đội ngũ GymFinder sẽ liên hệ với bạn trong vòng 24h làm việc.`);
            closePTModal();
        } else {
            alert("Rất tiếc, yêu cầu thuê đang gặp gián đoạn. Vui lòng thử lại sau hoặc liên hệ Hotline.");
        }
    } catch (error) {
        console.error("Error hiring trainer:", error);
        alert("Lỗi kết nối máy chủ. Vui lòng kiểm tra internet.");
    }
}

function setupPTModalEvents() {
    const closeBtn = document.getElementById('close-pt-modal');
    if (closeBtn) {
        closeBtn.onclick = closePTModal;
    }
}

function closePTModal() {
    const modal = document.getElementById('pt-contact-modal');
    if (!modal) return;
    modal.classList.remove('opacity-100');
    modal.querySelector('.modal-content').classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star text-primary"></i>';
    }
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt text-primary"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star text-primary/30"></i>';
    }
    return starsHtml;
}

function setupTrainerHoverEffects() {
    // GSAP interactions can be added here if script is available
}
