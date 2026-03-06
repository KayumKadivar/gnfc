(function initNotificationManager(global) {
  "use strict";

  const STORAGE_KEY = "gnfc_notifications_v1";

  const state = {
    notifications: [],
  };

  function loadState() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        state.notifications = JSON.parse(stored);
      } catch (e) {
        state.notifications = [];
      }
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.notifications));
    renderDashboardPanel();
    updateHeaderBadge();
  }

  function addNotification(notification) {
    // notification: { id, type, title, message, action, timestamp }
    const index = state.notifications.findIndex(
      (n) => n.id === notification.id,
    );
    if (index !== -1) {
      state.notifications[index] = {
        ...state.notifications[index],
        ...notification,
      };
    } else {
      state.notifications.unshift({
        ...notification,
        timestamp: notification.timestamp || new Date().toISOString(),
      });
    }
    saveState();
  }

  function removeNotification(id) {
    state.notifications = state.notifications.filter((n) => n.id !== id);
    saveState();
  }

  function clearAll() {
    state.notifications = [];
    saveState();
  }

  function updateHeaderBadge() {
    const count = state.notifications.length;
    const badge = document.getElementById("global-notification-badge");
    const icon = document.getElementById("global-notification-icon");

    if (count > 0) {
      if (badge) {
        badge.textContent = count;
        badge.classList.remove("hidden");
      }
      if (icon) icon.classList.add("color-red", "animate-pulse");
    } else {
      if (badge) badge.classList.add("hidden");
      if (icon) icon.classList.remove("color-red", "animate-pulse");
    }
  }

  function renderDashboardPanel() {
    const listContainer = document.getElementById(
      "dashboard-notifications-list",
    );
    const panelContainer = document.getElementById(
      "dashboard-notifications-panel",
    );

    if (!listContainer || !panelContainer) return;

    if (state.notifications.length === 0) {
      panelContainer.classList.add("hidden");
      return;
    }

    panelContainer.classList.remove("hidden");

    listContainer.innerHTML = state.notifications
      .map(
        (n) => `
            <div class="bg-dark-panel border border-dark-border/60 rounded-md p-4 hover:bg-white/2 transition-all cursor-pointer group shadow-sm" onclick="${n.action}">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg ${getIconBg(n.type)} flex items-center justify-center shrink-0 shadow-md">
                        <i class="${getIconClass(n.type)} font-18px text-white"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                            <h4 class="font-14px fw-black color-primary truncate uppercase tracking-wide ls-wider">${n.title}</h4>
                            <span class="font-10px fw-bold color-label shrink-0 opacity-60">${formatTime(n.timestamp)}</span>
                        </div>
                        <p class="font-12px color-muted leading-relaxed line-clamp-2">${n.message}</p>
                    </div>
                    <div class="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <i class="ph-bold ph-caret-right font-12px color-primary"></i>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");
  }

  function getIconBg(type) {
    switch (type) {
      case "calibration":
        return "bg-gradient-to-br from-gnfc-red to-rose-600";
      case "job":
        return "bg-gradient-to-br from-gnfc-blue to-indigo-600";
      case "system":
        return "bg-gradient-to-br from-gnfc-orange to-amber-600";
      default:
        return "bg-gradient-to-br from-slate-500 to-slate-700";
    }
  }

  function getIconClass(type) {
    switch (type) {
      case "calibration":
        return "ph-bold ph-warning-diamond";
      case "job":
        return "ph-bold ph-briefcase";
      case "system":
        return "ph-bold ph-gear";
      default:
        return "ph-bold ph-bell";
    }
  }

  function formatTime(isoStr) {
    const date = new Date(isoStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
    if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
    return date.toLocaleDateString();
  }

  global.NotificationManager = {
    addNotification,
    removeNotification,
    clearAll,
    renderDashboardPanel,
    updateHeaderBadge,
  };

  loadState();

  // Initial render
  const init = () => {
    renderDashboardPanel();
    updateHeaderBadge();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
