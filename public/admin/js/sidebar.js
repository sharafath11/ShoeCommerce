document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById('mainSidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const mobileToggle = document.getElementById('mobileToggle');

    // Toggle Desktop Sidebar
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mini');
            document.body.classList.toggle('collapsed-mode');
        });
    }

    // Toggle Mobile Sidebar
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-show');
        });
    }

    // Active Link Highlighting
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath !== '/admin' && href !== '/admin' && currentPath.startsWith(href))) {
            link.classList.add('active');
        }
    });

    // Close sidebar on mobile click outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar && !sidebar.contains(e.target) && mobileToggle && !mobileToggle.contains(e.target)) {
            sidebar.classList.remove('mobile-show');
        }
    });
});

/**
 * Confirm and execute admin logout
 */
window.confirmLogout = async function () {
    const { isConfirmed } = await Swal.fire({
        title: 'Sign Out?',
        text: "You will need to login again to access the dashboard.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0f172a',
        cancelButtonColor: '#f43f5e',
        confirmButtonText: 'Yes, logout',
        cancelButtonText: 'Cancel',
        background: '#fff',
        color: '#0f172a'
    });

    if (isConfirmed) {
        document.getElementById('logout-form').submit();
    }
};
