/**
 * Admin Dashboard — Home/Overview View
 * Shows KPI cards, quick-action navigation, and system overview.
 */
(() => {
    'use strict';

    function getGreeting() {
        const h = new Date().getHours();
        return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
    }

    function formatDate() {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }

    function formatTime() {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }

    // KPI data from AdminData
    function getKpiData() {
        const totalUsers = AdminData.userPrivilegeRows.length;
        const totalPlants = AdminData.plantMasterRows.length;
        const totalModules = AdminData.moduleMasterRows.length;
        const adminMembers = AdminData.adminMemberEcSet.size;
        const privilegeGroups = AdminData.privilegeMasterRows.length;
        return { totalUsers, totalPlants, totalModules, adminMembers, privilegeGroups };
    }

    // Quick actions mapped to sidebar keys
    const quickActions = [
        {
            section: 'Masters',
            items: [
                { key: 'privilege', icon: 'ph-shield-check', label: 'Privilege', desc: 'Manage role-based access control', color: '#5794F2' },
                { key: 'default_privilege', icon: 'ph-shield-star', label: 'Default Privilege', desc: 'Set default permissions per group', color: '#B794F4' },
                { key: 'plants', icon: 'ph-factory', label: 'Plants', desc: 'Plant master configuration', color: '#73BF69' },
                { key: 'modules', icon: 'ph-puzzle-piece', label: 'Modules', desc: 'System module registry', color: '#FF9900' },
            ]
        },
        {
            section: 'Users',
            items: [
                { key: 'user', icon: 'ph-user-circle', label: 'User Info', desc: 'User accounts & profiles', color: '#5794F2' },
                { key: 'user_privilege', icon: 'ph-user-check', label: 'User Privilege', desc: 'Individual user permissions', color: '#14b8a6' },
                { key: 'user_plants', icon: 'ph-tree-structure', label: 'User Plants', desc: 'Plant assignment mapping', color: '#73BF69' },
                { key: 'user_email', icon: 'ph-envelope', label: 'User Email', desc: 'Email configuration', color: '#06b6d4' },
            ]
        },
        {
            section: 'Security',
            items: [
                { key: 'change_password', icon: 'ph-key', label: 'Change Password', desc: 'Update admin credentials', color: '#FF9900' },
                { key: 'reset_password', icon: 'ph-arrow-counter-clockwise', label: 'Reset Password', desc: 'Reset user passwords', color: '#F2495C' },
            ]
        },
        {
            section: 'System',
            items: [
                { key: 'mail_schedule', icon: 'ph-calendar-check', label: 'Mail Schedule', desc: 'Automated email dispatches', color: '#5794F2' },
                { key: 'login_info', icon: 'ph-signpost', label: 'Login Info', desc: 'User login activity logs', color: '#14b8a6' },
                { key: 'new_update_popup', icon: 'ph-bell', label: 'Login Popup', desc: 'Login notification settings', color: '#FF9900' },
                { key: 'whats_new', icon: 'ph-sparkle', label: "What's New", desc: 'Release notes & updates', color: '#B794F4' },
            ]
        }
    ];

    // Recent login activity (use seed data)
    function getRecentLogins() {
        const rows = AdminData.userPrivilegeRows.slice(0, 8);
        const logins = AdminData.LOGIN_INFO_LAST_LOGIN_SEED;
        const machines = AdminData.LOGIN_INFO_MACHINE_SEED;
        const hits = AdminData.LOGIN_INFO_HIT_COUNT_SEED;
        return rows.map((r, i) => ({
            name: r.name,
            ec: r.ec,
            group: r.group,
            lastLogin: logins[i] || '-',
            machine: machines[i] || '-',
            hits: hits[i] || 0,
        }));
    }

    function render() {
        const kpi = getKpiData();
        const greeting = getGreeting();

        return `
        <!-- Dashboard Welcome Header -->
        <div class="admin-dash-welcome">
            <div class="admin-dash-welcome-left">
                <h2 class="admin-dash-greeting">
                    <i class="ph-fill ph-sun-dim admin-dash-greeting-icon"></i>
                    Good ${greeting}, <span class="color-orange">Administrator</span>
                </h2>
                <p class="admin-dash-subtitle">GNFC IIMS Admin Control Panel — manage privileges, users, plants, and system settings.</p>
            </div>
            <div class="admin-dash-welcome-right">
                <div class="admin-dash-clock-chip">
                    <i class="ph ph-calendar-blank color-blue"></i>
                    <span id="adm-dash-date" class="font-15px fw-bold font-mono color-primary">${formatDate()}</span>
                </div>
                <div class="admin-dash-clock-chip">
                    <i class="ph ph-clock color-orange"></i>
                    <span id="adm-dash-clock" class="font-15px fw-bold font-mono color-primary tabular-nums">${formatTime()}</span>
                </div>
            </div>
        </div>

        <!-- KPI Summary Cards -->
        <div class="admin-dash-kpi-grid">
            <div class="admin-dash-kpi-card" style="--kpi-accent: #5794F2">
                <div class="admin-dash-kpi-icon-wrap" style="background: rgba(87,148,242,0.12)">
                    <i class="ph-fill ph-users text-2xl" style="color: #5794F2"></i>
                </div>
                <div class="admin-dash-kpi-body">
                    <span class="admin-dash-kpi-value" id="kpi-users">${kpi.totalUsers}</span>
                    <span class="admin-dash-kpi-label">Total Users</span>
                </div>
                <div class="admin-dash-kpi-badge" style="background: rgba(87,148,242,0.1); color: #5794F2">
                    <i class="ph-bold ph-trend-up font-11px"></i> Active
                </div>
            </div>

            <div class="admin-dash-kpi-card" style="--kpi-accent: #73BF69">
                <div class="admin-dash-kpi-icon-wrap" style="background: rgba(115,191,105,0.12)">
                    <i class="ph-fill ph-factory text-2xl" style="color: #73BF69"></i>
                </div>
                <div class="admin-dash-kpi-body">
                    <span class="admin-dash-kpi-value" id="kpi-plants">${kpi.totalPlants}</span>
                    <span class="admin-dash-kpi-label">Plants</span>
                </div>
                <div class="admin-dash-kpi-badge" style="background: rgba(115,191,105,0.1); color: #73BF69">
                    <i class="ph-bold ph-check font-11px"></i> Configured
                </div>
            </div>

            <div class="admin-dash-kpi-card" style="--kpi-accent: #FF9900">
                <div class="admin-dash-kpi-icon-wrap" style="background: rgba(255,153,0,0.12)">
                    <i class="ph-fill ph-puzzle-piece text-2xl" style="color: #FF9900"></i>
                </div>
                <div class="admin-dash-kpi-body">
                    <span class="admin-dash-kpi-value" id="kpi-modules">${kpi.totalModules}</span>
                    <span class="admin-dash-kpi-label">Modules</span>
                </div>
                <div class="admin-dash-kpi-badge" style="background: rgba(255,153,0,0.1); color: #FF9900">
                    <i class="ph-bold ph-lightning font-11px"></i> Running
                </div>
            </div>

            <div class="admin-dash-kpi-card" style="--kpi-accent: #B794F4">
                <div class="admin-dash-kpi-icon-wrap" style="background: rgba(183,148,244,0.12)">
                    <i class="ph-fill ph-shield-check text-2xl" style="color: #B794F4"></i>
                </div>
                <div class="admin-dash-kpi-body">
                    <span class="admin-dash-kpi-value" id="kpi-groups">${kpi.privilegeGroups}</span>
                    <span class="admin-dash-kpi-label">Privilege Groups</span>
                </div>
                <div class="admin-dash-kpi-badge" style="background: rgba(183,148,244,0.1); color: #B794F4">
                    <i class="ph-bold ph-lock-simple font-11px"></i> Roles
                </div>
            </div>

            <div class="admin-dash-kpi-card" style="--kpi-accent: #14b8a6">
                <div class="admin-dash-kpi-icon-wrap" style="background: rgba(20,184,166,0.12)">
                    <i class="ph-fill ph-users-three text-2xl" style="color: #14b8a6"></i>
                </div>
                <div class="admin-dash-kpi-body">
                    <span class="admin-dash-kpi-value" id="kpi-admins">${kpi.adminMembers || 0}</span>
                    <span class="admin-dash-kpi-label">Admin Members</span>
                </div>
                <div class="admin-dash-kpi-badge" style="background: rgba(20,184,166,0.1); color: #14b8a6">
                    <i class="ph-bold ph-crown font-11px"></i> Elevated
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        ${quickActions.map(section => `
            <div class="admin-dash-section">
                <div class="admin-dash-section-header">
                    <h3 class="admin-dash-section-title">${section.section}</h3>
                    <div class="admin-dash-section-line"></div>
                </div>
                <div class="admin-dash-action-grid">
                    ${section.items.map(item => `
                        <div class="admin-dash-action-card" onclick="window.renderAdminContent('${item.key}')" style="--action-accent: ${item.color}">
                            <div class="admin-dash-action-icon" style="background: ${item.color}15; color: ${item.color}">
                                <i class="ph ${item.icon}"></i>
                            </div>
                            <div class="admin-dash-action-info">
                                <span class="admin-dash-action-label">${item.label}</span>
                                <span class="admin-dash-action-desc">${item.desc}</span>
                            </div>
                            <i class="ph ph-caret-right admin-dash-action-arrow"></i>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}

        <!-- Recent Login Activity -->
        <div class="admin-dash-section">
            <div class="admin-dash-section-header">
                <h3 class="admin-dash-section-title">Recent Login Activity</h3>
                <div class="admin-dash-section-line"></div>
                <button class="admin-dash-section-btn" onclick="window.renderAdminContent('login_info')">
                    View All <i class="ph-bold ph-arrow-right font-11px"></i>
                </button>
            </div>
            <div class="admin-table-scroll" style="max-height: 320px">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th class="admin-table-head">EC No</th>
                            <th class="admin-table-head">Name</th>
                            <th class="admin-table-head">Group</th>
                            <th class="admin-table-head">Last Login</th>
                            <th class="admin-table-head">Machine</th>
                            <th class="admin-table-head">Hits</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${getRecentLogins().map(r => `
                            <tr class="admin-table-row">
                                <td class="admin-table-cell font-mono fw-bold color-blue">${AdminUtils.escapeHtml(r.ec)}</td>
                                <td class="admin-table-cell fw-medium">${AdminUtils.escapeHtml(r.name)}</td>
                                <td class="admin-table-cell">
                                    <span class="admin-dash-group-badge">${AdminUtils.escapeHtml(r.group)}</span>
                                </td>
                                <td class="admin-table-cell font-mono font-14px color-secondary">${AdminUtils.escapeHtml(r.lastLogin)}</td>
                                <td class="admin-table-cell font-mono font-14px color-secondary">${AdminUtils.escapeHtml(r.machine)}</td>
                                <td class="admin-table-cell fw-bold">${r.hits.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    }

    let clockInterval = null;

    function bind() {
        // Animate KPI counters
        document.querySelectorAll('.admin-dash-kpi-value').forEach(el => {
            const target = parseInt(el.textContent, 10);
            if (isNaN(target) || target <= 0) return;
            el.textContent = '0';
            let current = 0;
            const step = Math.max(1, Math.ceil(target / 15));
            const interval = setInterval(() => {
                current += step;
                if (current >= target) { current = target; clearInterval(interval); }
                el.textContent = current;
            }, 50);
        });

        // Live clock
        if (clockInterval) clearInterval(clockInterval);
        clockInterval = setInterval(() => {
            const dateEl = document.getElementById('adm-dash-date');
            const clockEl = document.getElementById('adm-dash-clock');
            if (dateEl) dateEl.textContent = formatDate();
            if (clockEl) clockEl.textContent = formatTime();
        }, 1000);
    }

    AdminRouter.register('dashboard', { render, bind });
})();
