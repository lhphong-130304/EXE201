document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const modal = document.getElementById('pt-contact-modal');
    const modalContent = modal.querySelector('.modal-content');
    const closeModalBtn = document.getElementById('close-pt-modal');

    // Elements to populate
    const ptNameEl = document.getElementById('pt-modal-name');
    const ptRoleEl = document.getElementById('pt-modal-role');
    const ptImageEl = document.getElementById('pt-modal-image');
    const ptPhoneLink = document.getElementById('pt-modal-phone');

    // Default Gym Phone Number
    const GYM_PHONE = "0987654321"; // Replace with actual data if available

    // Functions
    function openModal(data) {
        if (!modal) return;

        // Populate data
        if (ptNameEl) ptNameEl.textContent = data.name || 'PT Name';
        if (ptRoleEl) ptRoleEl.textContent = data.role || 'Personal Trainer';
        if (ptImageEl) ptImageEl.src = data.image || 'assets/images/team/default.png';

        // Update Call Link
        if (ptPhoneLink) {
            ptPhoneLink.href = `tel:${GYM_PHONE}`;
        }

        // Show Modal
        modal.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity transition
        setTimeout(() => {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }, 10);
    }

    function closeModal() {
        if (!modal) return;

        // Hide Modal logic
        modal.classList.add('opacity-0', 'pointer-events-none');
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300); // Match transition duration
    }

    // Event Listeners for Triggers
    // We attach listener to document to handle potential dynamic content, 
    // but specifically looking for .pt-trigger-btn
    document.addEventListener('click', function (e) {
        const trigger = e.target.closest('.pt-trigger-btn');
        if (trigger) {
            e.preventDefault();
            const projectItem = trigger.closest('.project');

            if (projectItem) {
                const data = {
                    name: projectItem.getAttribute('data-name'),
                    role: projectItem.getAttribute('data-role'),
                    image: projectItem.getAttribute('data-image')
                };
                openModal(data);
            }
        }
    });

    // Close Button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Click outside to close
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Escape key to close
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
});
