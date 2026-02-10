const SIDEBAR_COLLAPSED_CLASS = 'w-12';
const SIDEBAR_EXPANDED_CLASS = 'w-48';

function renderSidebar(activePageId) {
    window.activePage = activePageId || window.activePage || '';

    // 1. Get state from localStorage
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const widthClass = isCollapsed ? SIDEBAR_COLLAPSED_CLASS : SIDEBAR_EXPANDED_CLASS;
    const textClass = isCollapsed ? 'hidden' : 'block';

    // 2. Build HTML
    const sidebarHTML = `
      <aside id="app-sidebar" class="${widthClass} bg-[#0b0c0e] flex flex-col shrink-0 border-r border-[#2c3235] z-50 h-screen font-sans transition-all duration-300 relative group/sidebar">
          
          <div class="h-14 flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-center px-4'} bg-[#0b0c0e] border-b border-[#2c3235] relative">
              <div class="flex items-center gap-2 transition-all duration-300">
                  <div class="flex items-center cursor-pointer bg-white rounded-md" onclick="toggleSidebar()">
                      <!-- <img src="/src/assets/images/gnfc-full-logo.png" onerror="this.onerror=null;this.src='/src/assets/images/gnfc-logo.png';" class="h-6 w-auto object-contain" alt="GNFC Logo"> -->
                     <!-- <img src="/src/assets/images/gnfc-sidebar-logo.png" onerror="this.onerror=null;this.src='/src/assets/images/gnfc-logo.png';" class="${isCollapsed ? 'hidden' : 'block'} h-6 w-auto object-contain" alt="GNFC Text"> -->
                     <img src="/src/assets/images/gnfc-full-logo.png" onerror="this.onerror=null;this.src='/src/assets/images/gnfc-logo.png';" class="h-12 w-auto object-contain" alt="GNFC Logo">
                  </div>
              </div>
              
               <button onclick="toggleSidebar()" class="absolute -right-5 top-1/2 -translate-y-1/2 w-6 h-6 bg-dark-panel rounded-full border border-dark-border text-white hover:text-white flex items-center justify-center transition-transform hover:scale-110 z-50 shadow-md ${isCollapsed ? 'rotate-180' : ''}">
                  <i class="ph-bold ph-caret-left text-xs"></i>
              </button>
          </div>
  
          <nav class="flex-1 overflow-y-auto py-4 space-y-1 overflow-x-hidden">
              
              <div class="sidebar-section-title ${isCollapsed ? 'hidden' : 'block px-4 text-[10px] font-bold text-[#8e8e9e] uppercase tracking-widest mb-2 mt-2'}">Dashboards</div>
              
              ${createLink("dashboard", "/src/pages/dashboard.html", "ph-squares-four", "Plant Status", isCollapsed)}
  
              <div class="sidebar-section-title ${isCollapsed ? 'hidden' : 'block px-4 text-[10px] font-bold text-[#8e8e9e] uppercase tracking-widest mb-2 mt-6'}">Logs</div>
              
              ${createLink("shift_logbook_officer", "#", "ph-notebook", "Officer Logs", isCollapsed)}
              
              ${createLink("technician_logbook", "/src/pages/technician_logbook.html", "ph-factory", "Technician Logs", isCollapsed)}
              
              <div class="sidebar-section-title ${isCollapsed ? 'hidden' : 'block px-4 text-[10px] font-bold text-[#8e8e9e] uppercase tracking-widest mb-2 mt-6'}">Analysis</div>
              
              ${createLink("job_types", "#", "ph-wrench", "Job Analysis", isCollapsed)}
              ${createLink("instrument_types", "#", "ph-faders", "Instrument Types", isCollapsed)}

            <div class="sidebar-section-title ${isCollapsed ? 'hidden' : 'block px-4 text-[10px] font-bold text-[#8e8e9e] uppercase tracking-widest mb-2 mt-6'}">System</div>

            ${createLink("settings", "/src/pages/settings.html", "ph-gear", "Settings", isCollapsed)}
     
          </nav>
  
          <div class="${isCollapsed ? 'p-2' : 'p-4'} border-t border-[#2c3235] bg-[#0b0c0e]">
              <div onmouseenter="showSidebarTooltip(event, 'Admin User')" onmouseleave="hideSidebarTooltip()" class="flex items-center gap-3 text-[#c7d0d9] hover:text-white cursor-pointer transition overflow-hidden ${isCollapsed ? 'justify-center' : ''}">
                  <img src="https://ui-avatars.com/api/?name=Admin&background=2c3235&color=fff" class="w-8 h-8 rounded-full border border-[#2c3235] shrink-0">
                  <div class="flex-1 ${textClass} whitespace-nowrap transition-opacity duration-300">
                      <p class="text-sm font-medium leading-none">Admin User</p>
                      <p class="text-[#5794F2] text-xs" onclick="logout()">Sign out</p>
                  </div>
                  <i class="ph-bold ph-sign-out ${textClass}" onclick="logout()"></i>
              </div>
          </div>
      </aside>
      
      <!-- Custom Tooltip Element -->
      <div id="sidebar-tooltip" class="fixed z-9999 hidden px-3 py-1.5 bg-dark-panel text-dark-text text-xs font-bold rounded border border-dark-border shadow-2xl pointer-events-none whitespace-nowrap transition-all duration-200 opacity-0 transform translate-x-2">
          <span id="sidebar-tooltip-text"></span>
          <!-- Arrow -->
          <div class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-dark-panel border-l border-b border-dark-border"></div>
      </div>
      `;

    const container = document.getElementById("sidebar-container");
    if (container) container.innerHTML = sidebarHTML;
}

function createLink(id, url, icon, text, isCollapsed) {
    const isActive = id === window.activePage;
    const activeClass = isActive
        ? "bg-[#181b1f] text-white border-l-4 border-[#FF9900]"
        : "text-[#8e8e9e] hover:text-gray-200 hover:bg-[#181b1f] border-l-4 border-transparent";

    const justifyClass = isCollapsed ? 'justify-center' : '';
    const spanClass = isCollapsed ? 'hidden' : 'block';

    // Added onmouseenter/leave
    return `
      <a href="${url}" 
         onmouseenter="showSidebarTooltip(event, '${text}')" 
         onmouseleave="hideSidebarTooltip()"
         class="flex items-center gap-3 px-4 py-2.5 transition-all duration-200 group ${activeClass} ${justifyClass}">
          <i class="ph ${icon} text-lg ${isActive ? "text-[#FF9900]" : ""} shrink-0"></i>
          <span class="font-medium text-sm whitespace-nowrap transition-opacity duration-300 ${spanClass} sidebar-text">${text}</span>
      </a>`;
}

function toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;

    // Use the constant to check
    const isCollapsed = sidebar.classList.contains(SIDEBAR_COLLAPSED_CLASS);
    const willBeCollapsed = !isCollapsed;

    localStorage.setItem('sidebarCollapsed', willBeCollapsed);
    hideSidebarTooltip();

    // Pass the current active page to re-render properly
    renderSidebar(window.activePage || '');
}

// Tooltip Functions logic
function showSidebarTooltip(event, text) {
    const sidebar = document.getElementById('app-sidebar');
    // Only show if collapsed
    if (!sidebar || !sidebar.classList.contains(SIDEBAR_COLLAPSED_CLASS)) return;

    const tooltip = document.getElementById('sidebar-tooltip');
    if (!tooltip) return;

    const textEl = document.getElementById('sidebar-tooltip-text');
    if (textEl) textEl.textContent = text;

    // Position calculation
    const rect = event.currentTarget.getBoundingClientRect();

    // Initial reveal to get height/width if needed, but since it's hidden we calc first
    tooltip.classList.remove('hidden');

    const top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2);
    const left = rect.right + 12;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;

    // Trigger animation
    requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateX(0)';
    });
}

function hideSidebarTooltip() {
    const tooltip = document.getElementById('sidebar-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateX(2px)';
        // Wait for transition before hiding
        setTimeout(() => {
            if (tooltip.style.opacity === '0') {
                tooltip.classList.add('hidden');
            }
        }, 200);
    }
}

function logout() {
    localStorage.removeItem('sidebarCollapsed');
    window.location.href = '/index.html';
}