const NOTIFICATIONS_API_URL = 'https://gymfinder953.runasp.net/api/notifications';

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.userId = null;
        this.init();
    }

    async init() {
        // Wait for Auth to be defined (in case of script load race conditions)
        if (typeof Auth === 'undefined') {
            setTimeout(() => this.init(), 100);
            return;
        }

        const user = Auth.getUser();
        if (!user) return;
        this.userId = user.id;

        this.renderNotificationBell();
        await this.loadNotifications();

        // Refresh every 30 seconds
        setInterval(() => this.loadNotifications(), 30000);
    }

    async loadNotifications() {
        if (!this.userId) return;

        try {
            const response = await fetch(`${NOTIFICATIONS_API_URL}/user/${this.userId}`);
            this.notifications = await response.json();
            this.unreadCount = this.notifications.filter(n => !n.isRead).length;
            this.updateBadge();
            this.renderDropdown();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    updateBadge() {
        document.querySelectorAll('.notification-badge').forEach(badge => {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    }

    renderNotificationBell() {
        const desktopUserInfo = document.getElementById('user-info');
        const mobileUserInfo = document.getElementById('user-info-mobile');

        if (!desktopUserInfo && !mobileUserInfo) return;

        // SVG Bell Icon for universal compatibility
        const bellIcon = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;

        const createBell = (idSuffix) => {
            const container = document.createElement('div');
            container.id = `notification-bell-container-${idSuffix}`;
            // Added theme classes dark:text-white text-black
            container.className = 'relative flex items-center ml-10 cursor-pointer group dark:text-white text-black';
            container.innerHTML = `
                <div class="relative p-10 hover:bg-white/5 rounded-full transition-all notif-trigger" data-suffix="${idSuffix}">
                    ${bellIcon}
                    <span id="notification-badge-${idSuffix}" class="notification-badge absolute top-5 right-5 w-18 h-18 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center hidden border-2 border-white dark:border-[#141618]">0</span>
                </div>
                
                <div id="notification-dropdown-${idSuffix}" class="notification-dropdown absolute top-[50px] right-0 w-[300px] sm:w-[350px] bg-white dark:bg-[#1C1E20] border border-black/5 dark:border-white/5 rounded-3xl shadow-2xl hidden z-[10000] overflow-hidden">
                    <div class="p-20 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/5 dark:bg-white/5">
                        <h5 class="font-bold text-sm text-black dark:text-white">Thông báo</h5>
                        <button onclick="Notifications.clearAll()" class="text-[10px] uppercase tracking-widest text-primary hover:text-black dark:hover:text-white transition-all font-bold">Xóa tất cả</button>
                    </div>
                    <div id="notification-list-${idSuffix}" class="notification-list max-h-[400px] overflow-y-auto">
                        <!-- Notifications will be rendered here -->
                    </div>
                    <div class="p-15 text-center border-t border-black/5 dark:border-white/5">
                        <p class="text-[10px] text-black/40 dark:text-white/20">GYMFINDER Notification System</p>
                    </div>
                </div>
            `;
            return container;
        };

        if (desktopUserInfo && !document.getElementById('notification-bell-container-desktop')) {
            const nameLink = document.getElementById('user-name-link');
            if (nameLink) {
                // Insert after name link
                nameLink.insertAdjacentElement('afterend', createBell('desktop'));
            } else {
                desktopUserInfo.insertBefore(createBell('desktop'), desktopUserInfo.firstChild);
            }
        }

        if (mobileUserInfo && !document.getElementById('notification-bell-container-mobile')) {
            const mobileNameLink = document.getElementById('user-name-link-mobile');
            if (mobileNameLink) {
                mobileNameLink.insertAdjacentElement('afterend', createBell('mobile'));
                // Adjust mobile container for better layout
                const bell = document.getElementById('notification-bell-container-mobile');
                bell.className = 'relative inline-flex items-center ml-10 cursor-pointer group align-middle dark:text-white text-black';
            } else {
                mobileUserInfo.insertBefore(createBell('mobile'), mobileUserInfo.firstChild);
            }
        }

        document.querySelectorAll('.notif-trigger').forEach(trigger => {
            const suffix = trigger.dataset.suffix;
            const dropdown = document.getElementById(`notification-dropdown-${suffix}`);

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.notification-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.add('hidden');
                });
                dropdown.classList.toggle('hidden');
            });
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.notification-dropdown').forEach(d => d.classList.add('hidden'));
        });

        document.querySelectorAll('.notification-dropdown').forEach(d => {
            d.addEventListener('click', (e) => e.stopPropagation());
        });
    }

    renderDropdown() {
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        document.querySelectorAll('.notification-list').forEach(list => {
            if (this.notifications.length === 0) {
                list.innerHTML = `
                    <div class="p-40 text-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-10 text-black/10 dark:text-white/10"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        <p class="text-black/40 dark:text-white/40 text-xs text-center w-full">Bạn chưa có thông báo nào</p>
                    </div>
                `;
                return;
            }

            list.innerHTML = this.notifications.map(n => `
                <div class="p-20 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer ${n.isRead ? 'opacity-60' : 'bg-primary/10'}" onclick="Notifications.markAsRead(${n.id})">
                    <div class="flex gap-15">
                        <div class="w-10 h-10 rounded-full mt-5 ${n.isRead ? 'bg-black/10 dark:bg-white/10' : 'bg-primary'} flex-shrink-0"></div>
                        <div>
                            <p class="text-sm text-black/80 dark:text-white/80 leading-relaxed">${n.message}</p>
                            <p class="text-[10px] text-black/40 dark:text-white/40 mt-5 italic">${formatDate(n.createdAt)}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        });
    }

    async markAsRead(id) {
        try {
            await fetch(`${NOTIFICATIONS_API_URL}/${id}/read`, { method: 'PUT' });
            await this.loadNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    async clearAll() {
        if (!this.userId) return;
        try {
            await fetch(`${NOTIFICATIONS_API_URL}/user/${this.userId}/clear`, { method: 'DELETE' });
            await this.loadNotifications();
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }
}

const Notifications = new NotificationSystem();
