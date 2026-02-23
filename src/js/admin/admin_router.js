/**
 * Admin Panel — View Router
 * Central dispatcher: maps sidebar keys → view modules.
 * Each view module registers itself here via AdminRouter.register().
 */
const AdminRouter = (() => {
    'use strict';

    const views = {};

    /**
     * Register a view module.
     * @param {string} key — routing key (e.g., 'privilege')
     * @param {{ render: function, bind: function }} module — must have render() and bind()
     */
    function register(key, module) {
        if (!key || !module) return;
        views[key] = module;
    }

    /**
     * Render the admin content area for the given view key.
     * Called by sidebar clicks and internal navigation.
     */
    function renderAdminContent(viewKey) {
        const content = document.getElementById('adminContent');
        if (!content) return;

        // Close any open modals
        AdminUtils.closeModal();

        const view = views[viewKey];
        let html = '';

        if (view && typeof view.render === 'function') {
            html = view.render();
        } else {
            html = renderComingSoon(viewKey || 'Administrator');
        }

        content.innerHTML = html;

        if (view && typeof view.bind === 'function') {
            view.bind();
        }

        // Update sidebar active state
        if (typeof window.setAdminSidebarActive === 'function') {
            window.setAdminSidebarActive(viewKey);
        }
    }

    /** Default "coming soon" fallback */
    function renderComingSoon(title) {
        const safeName = AdminUtils.escapeHtml(title);
        return `
      ${AdminUtils.renderTopBar(safeName)}
      <div class="admin-card p-10 text-center border-dashed">
        <i class="ph ph-wrench text-3xl color-hint mb-3"></i>
        <h3 class="font-16px fw-semibold color-primary">${safeName}</h3>
        <p class="font-13px color-hint mt-2">This module is ready for the next phase.</p>
      </div>
    `;
    }

    // Expose globally for sidebar and cross-module navigation
    window.renderAdminContent = renderAdminContent;

    return { register, renderAdminContent };
})();
