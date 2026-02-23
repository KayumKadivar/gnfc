/**
 * Admin Sidebar — Dark-themed navigation
 * Matches the main portal sidebar style with Phosphor icons.
 */
function initAdminSidebar() {
    'use strict';

    const container = document.getElementById('adminSidebarContainer');
    if (!container) return;

    const sections = [
        {
            label: 'Masters',
            items: [
                { key: 'privilege', label: 'Privilege', icon: 'ph-shield-check' },
                { key: 'default_privilege', label: 'Default Privilege', icon: 'ph-shield-star' },
                { key: 'plants', label: 'Plants', icon: 'ph-factory' },
                { key: 'modules', label: 'Modules', icon: 'ph-puzzle-piece' },
            ]
        },
        {
            label: 'Users',
            items: [
                { key: 'user', label: 'User Info', icon: 'ph-user-circle' },
                { key: 'user_privilege', label: 'User Privilege', icon: 'ph-user-check' },
                { key: 'user_plants', label: 'User Plants', icon: 'ph-tree-structure' },
                { key: 'user_email', label: 'User Email', icon: 'ph-envelope' },
                { key: 'admin_member', label: 'Admin Member', icon: 'ph-users-three' },
            ]
        },
        {
            label: 'Security',
            items: [
                { key: 'change_password', label: 'Change Password', icon: 'ph-key' },
                { key: 'reset_password', label: 'Reset Password', icon: 'ph-arrow-counter-clockwise' },
            ]
        },
        {
            label: 'System',
            items: [
                { key: 'mail_schedule', label: 'Mail Schedule', icon: 'ph-calendar-check' },
                { key: 'login_info', label: 'Login Info', icon: 'ph-signpost' },
                { key: 'ex_dms_space', label: 'Ex-DMS Space', icon: 'ph-folder-open' },
                { key: 'new_update_popup', label: 'Login Popup', icon: 'ph-bell' },
                { key: 'whats_new', label: "What's New", icon: 'ph-sparkle' },
            ]
        }
    ];

    function renderSidebar(activeKey) {
        const sectionsHtml = sections.map(section => `
      <div class="admin-sidebar-section">
        <div class="admin-sidebar-section-label">${section.label}</div>
        ${section.items.map(item => `
          <a class="admin-sidebar-link${item.key === activeKey ? ' active' : ''}" data-nav-key="${item.key}">
            <i class="ph ${item.icon}"></i>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </div>
    `).join('');

        container.innerHTML = `
      <div class="admin-sidebar">
        <div class="admin-sidebar-logo">
          <img src="/src/assets/images/gnfc-logo.png" onerror="this.onerror=null;this.src='/src/assets/images/gnfc-full-logo.png';" alt="GNFC">
          <span>IIMS Admin</span>
        </div>
        ${sectionsHtml}
        <div class="admin-sidebar-footer">
          <a class="admin-sidebar-exit" href="/index.html">
            <i class="ph ph-sign-out"></i>
            <span>Exit</span>
          </a>
        </div>
      </div>
    `;

        // Bind navigation clicks
        container.querySelectorAll('[data-nav-key]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const key = link.dataset.navKey;
                if (typeof window.renderAdminContent === 'function') {
                    window.renderAdminContent(key);
                }
            });
        });
    }

    // Set active state externally
    window.setAdminSidebarActive = function setAdminSidebarActive(key) {
        container.querySelectorAll('.admin-sidebar-link').forEach(link => {
            link.classList.toggle('active', link.dataset.navKey === key);
        });
    };

    // Initial render
    renderSidebar('privilege');
}
