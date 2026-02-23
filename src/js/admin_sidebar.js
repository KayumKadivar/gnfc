const adminLinks = [
    { key: 'privilege', label: 'Privilege', url: '#' },
    { key: 'default_privilege', label: 'Default Privilege', url: '#' },
    { key: 'user_privilege', label: 'User Privilege', url: '#' },
    { key: 'plants', label: 'Plants', url: '#' },
    { key: 'modules', label: 'Modules', url: '#' },
    { key: 'user', label: 'User', url: '#' },
    { key: 'user_plants', label: 'User-Plants', url: '#' },
    { key: 'user_email', label: 'User-Email', url: '#' },
    { key: 'change_password', label: 'Change Password', url: '#' },
    { key: 'reset_password', label: 'Reset Password', url: '#' },
    { key: 'admin_member', label: 'Admin Member', url: '#' },
    { key: 'new_update_popup', label: 'New Update Popup', url: '#' },
    { key: 'whats_new', label: "What's new", url: '#' },
    { key: 'mail_schedule', label: 'Mail Schedule', url: '#' },
    { key: 'login_info', label: 'Login Info', url: '#' },
    { key: 'ex_dms_space', label: 'Space for Ex-DMS', url: '#' },
    { label: 'Exit', url: '/index.html' }
];

const ACTIVE_CLASSES = ['bg-sky-500/15', 'text-white', 'border-l-sky-400'];
const INACTIVE_CLASSES = ['text-slate-300', 'border-l-transparent'];

function initAdminSidebar() {
    const container = document.getElementById('adminSidebarContainer');
    if (!container) return;

    const sidebarHTML = `
        <div class="h-full flex flex-col">
            <div class="border-b border-slate-800 bg-slate-950 px-4 py-4">
                <p class="text-[11px] uppercase tracking-[0.25em] text-slate-400">Admin</p>
                <p class="mt-1 text-sm font-semibold text-slate-100">Control Panel</p>
            </div>

            <nav class="flex-1 overflow-y-auto py-2 custom-scroll">
                ${adminLinks.map((link) => `
                    <a
                        href="${link.url}"
                        data-admin-view="${link.key || ''}"
                        class="admin-nav-link block border-l-4 px-4 py-2.5 text-sm font-medium transition-colors duration-150 hover:bg-slate-800 hover:text-white border-l-transparent text-slate-300"
                    >
                        ${link.label}
                    </a>
                `).join('')}
            </nav>
        </div>
    `;

    container.innerHTML = sidebarHTML;

    const links = Array.from(container.querySelectorAll('.admin-nav-link'));

    function setActiveLink(activeKey) {
        links.forEach((link) => {
            const key = link.dataset.adminView || '';
            const isActive = key && key === activeKey;

            link.classList.remove(...ACTIVE_CLASSES, ...INACTIVE_CLASSES);
            link.classList.add(...(isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES));
        });
    }

    links.forEach((link) => {
        const viewKey = link.dataset.adminView || '';
        const href = link.getAttribute('href');

        if (viewKey) {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                setActiveLink(viewKey);
                if (typeof window.renderAdminContent === 'function') {
                    window.renderAdminContent(viewKey);
                }
            });
            return;
        }

        if (href === '#') {
            link.addEventListener('click', (event) => {
                event.preventDefault();
            });
        }
    });

    window.setAdminSidebarActive = setActiveLink;
    setActiveLink('privilege');
}
