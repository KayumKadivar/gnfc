const SIDEBAR_COLLAPSED_CLASS = "w-20";
const SIDEBAR_EXPANDED_CLASS = "w-60";

const AuthUtils = {
  getLoggedInUser: () => {
    const role = (localStorage.getItem("userRole") || "").toLowerCase();
    const storedName = (localStorage.getItem("currentUserName") || "").trim();

    const roleToName = {
      technician: "Technician",
      engineer: "Engineer",
      manager: "Manager",
    };

    const name = storedName || roleToName[role] || "Admin User";
    return { role, name };
  },

  logout: () => {
    localStorage.removeItem("sidebarCollapsed");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUserName");
    localStorage.removeItem("gnfc_login_session_id");
    localStorage.removeItem("gnfc_calibration_modal_shown_for_login");
    sessionStorage.removeItem("gnfc_calibration_modal_shown");
    window.location.href = "/index.html";
  },
};

window.AuthUtils = AuthUtils;

class SidebarTooltipManager {
  constructor() {
    this.tooltip = document.getElementById("sidebar-tooltip");
    this.textEl = document.getElementById("sidebar-tooltip-text");
  }

  show(event, text, isCollapsed) {
    if (!isCollapsed || !this.tooltip || !this.textEl) return;

    this.textEl.textContent = text;
    const rect = event.currentTarget.getBoundingClientRect();

    this.tooltip.classList.remove("hidden");

    const top = rect.top + rect.height / 2 - this.tooltip.offsetHeight / 2;
    const left = rect.right + 12;

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;

    requestAnimationFrame(() => {
      if (this.tooltip) {
        this.tooltip.style.opacity = "1";
        this.tooltip.style.transform = "translateX(0)";
      }
    });
  }

  hide() {
    if (!this.tooltip) return;
    this.tooltip.style.opacity = "0";
    this.tooltip.style.transform = "translateX(2px)";

    setTimeout(() => {
      if (this.tooltip && this.tooltip.style.opacity === "0") {
        this.tooltip.classList.add("hidden");
      }
    }, 200);
  }
}

class SidebarManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.tooltipManager = new SidebarTooltipManager();
    this.activePage = window.activePage || "";
    this.isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
  }

  createLink(id, url, icon, text) {
    const isActive = id === this.activePage;
    const activeClass = isActive
      ? "bg-[#FF9900]/25 border-l-4 border-[#FF9900] color-orange"
      : "color-label hover-color-secondary hover:bg-[#181b1f] border-l-4 border-transparent";

    const justifyClass = this.isCollapsed ? "justify-center" : "";
    const spanClass = this.isCollapsed ? "hidden" : "block";

    return `
      <a href="${url}" 
         onmouseenter="window.sidebarManager.tooltipManager.show(event, '${text}', window.sidebarManager.isCollapsed)" 
         onmouseleave="window.sidebarManager.tooltipManager.hide()"
         class="flex items-center gap-3 px-4 py-1.5 transition-all duration-200 group font-18px ${activeClass} ${justifyClass}">
          <i class="ph ${icon} text-lg ${isActive ? "color-orange" : ""} shrink-0"></i>
          <span class="fw-medium font-20px whitespace-nowrap transition-opacity duration-300 ${spanClass} sidebar-text">${text}</span>
      </a>`;
  }

  render(activePageId) {
    if (activePageId) {
      this.activePage = activePageId;
      window.activePage = activePageId;
    }

    this.isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    const widthClass = this.isCollapsed
      ? SIDEBAR_COLLAPSED_CLASS
      : SIDEBAR_EXPANDED_CLASS;
    const textClass = this.isCollapsed ? "hidden" : "block";

    const currentUser = AuthUtils.getLoggedInUser();
    const tooltipName = currentUser.name.replace(/'/g, "\\'");
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=2c3235&color=fff`;

    const sidebarHTML = `
      <aside id="app-sidebar" class="${widthClass} bg-[#0b0c0e] flex flex-col shrink-0 border-r border-[#2c3235] z-50 h-screen font-sans transition-all duration-300 relative group/sidebar">
          
          <div class="h-14 flex items-center ${this.isCollapsed ? "justify-center px-0" : "justify-center px-4"} bg-[#0b0c0e] border-b border-[#2c3235] relative">
              <div class="flex items-center gap-2 transition-all duration-300">
                  <div class="flex items-center cursor-pointer bg-white rounded-md" onclick="window.sidebarManager.toggle()">
                     <img src="/src/assets/images/gnfc-full-logo.png" onerror="this.onerror=null;this.src='/src/assets/images/gnfc-logo.png';" class="h-12 w-auto object-contain" alt="GNFC Logo">
                  </div>
              </div>
              
              <button onclick="window.sidebarManager.toggle()" class="absolute -right-5 top-1/2 -translate-y-1/2 w-6 h-6 bg-dark-panel rounded-full border border-dark-borde flex items-center justify-center transition-transform hover:scale-110 z-50 shadow-md ${this.isCollapsed ? "rotate-180" : ""}">
                  <i class="ph-bold ph-caret-left font-14px"></i>
              </button>
          </div>
  
          <nav class="flex-1 overflow-y-auto overflow-x-hidden">
            <!-- Dashboard  -->
            ${this.createLink("dashboard", "/src/pages/dashboard.html", "ph-squares-four", "Dashboard")}
            ${this.createLink("admin", "/src/pages/admin_login.html", "ph-squares-four", "Admin")}
            
            <!-- Plants -->
            ${this.createLink("spp", "#", "ph-plant", "SPP")}
            ${this.createLink("plants", "/src/pages/plant_status.html", "ph-buildings", "Plant")}

            <!-- Logs -->
            ${this.createLink("technician_logbook", "/src/pages/technician_logbook.html", "ph-factory", "Technician Logbook")}
            ${this.createLink("shift_logbook_officer", "/src/pages/officer_log_book.html", "ph-notebook", "Officer Logbook")}

            <!-- Compliance -->
            ${this.createLink("iso", "#", "ph-certificate", "ISO/OHSAS/CPCB")}

            <!-- Jobs & Utility -->
            ${this.createLink("job_list", "/src/pages/job_list.html", "ph-list-bullets", "JOB LIST")}
            ${this.createLink("utility", "#", "ph-lightning", "UTILITY")}
            ${this.createLink("cms", "#", "ph-monitor", "CMS")}
            ${this.createLink("inst_ws", "#", "ph-desktop", "INST WS")}
            ${this.createLink("opr_job_reg", "/src/pages/operation_job_register.html", "ph-clipboard-text", "OPR. Job Reg")}
            ${this.createLink("job_analysis", "#", "ph-chart-bar", "Job Analysis")}

            <!-- Communication & Helpers -->
            ${this.createLink("send_mail", "#", "ph-envelope", "SEND MAIL")}
            ${this.createLink("helper_details", "#", "ph-users-three", "HELPER DETAILS")}

            <!-- System -->
            ${this.createLink("user_info", "/src/pages/user_info.html", "ph-user", "USER INFO")}
            ${this.createLink("settings", "/src/pages/settings.html", "ph-gear", "Settings")}
            ${this.createLink("help", "#", "ph-question", "Help")}
          </nav>
  
          <div class="${this.isCollapsed ? "p-2" : "px-4 py-2"} border-t border-[#2c3235] bg-[#0b0c0e]">
              <div onmouseenter="window.sidebarManager.tooltipManager.show(event, '${tooltipName}', window.sidebarManager.isCollapsed)" onmouseleave="window.sidebarManager.tooltipManager.hide()" class="flex items-center gap-3 color-secondary hover-color-primary cursor-pointer transition overflow-hidden ${this.isCollapsed ? "justify-center" : ""}">
                  <img src="${avatarUrl}" class="w-8 h-8 rounded-full border border-[#2c3235] shrink-0">
                  <div class="flex-1 ${textClass} whitespace-nowrap transition-opacity duration-300">
                      <p class="font-16px fw-medium leading-none">${currentUser.name}</p>
                      <p class="color-blue font-16px" onclick="window.AuthUtils.logout()">Sign out</p>
                  </div>
                  <i class="ph-bold ph-sign-out ${textClass}" onclick="window.AuthUtils.logout()"></i>
              </div>
          </div>
      </aside>
      
      <!-- Custom Tooltip Element -->
      <div id="sidebar-tooltip" class="fixed z-9999 hidden px-3 py-1.5 bg-dark-panel text-dark-text font-14px fw-bold rounded border border-dark-border shadow-2xl pointer-events-none whitespace-nowrap transition-all duration-200 opacity-0 transform translate-x-2">
          <span id="sidebar-tooltip-text"></span>
          <!-- Arrow -->
          <div class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-dark-panel border-l border-b border-dark-border"></div>
      </div>
        `;

    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = sidebarHTML;
      // Need to re-bind tooltip manager as DOM was rewritten
      this.tooltipManager = new SidebarTooltipManager();
    }
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem("sidebarCollapsed", this.isCollapsed);
    this.tooltipManager.hide();
    this.render(this.activePage);
  }
}

// To preserve backwards compatibility with HTML calling renderSidebar
function renderSidebar(activePageId) {
  if (!window.sidebarManager) {
    window.sidebarManager = new SidebarManager("sidebar-container");
  }
  window.sidebarManager.render(activePageId);
}
