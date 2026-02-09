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
      <aside id="app-sidebar" class="${widthClass} bg-[#0b0c0e] flex flex-col flex-shrink-0 border-r border-[#2c3235] z-50 h-screen font-sans transition-all duration-300 relative group/sidebar">
          
          <div class="h-16 flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-5'} bg-[#0b0c0e] border-b border-[#2c3235] relative">
              <div class="flex items-center gap-3 overflow-hidden">
                  <div class="w-9 h-9 flex-shrink-0 cursor-pointer bg-white rounded p-0.5" onclick="toggleSidebar()">
                      <img src="/src/assets/images/gnfc-sidebar-logo.png" onerror="this.onerror=null;this.src='/src/assets/images/gnfc-logo.png';" class="w-full h-full object-contain" alt="GNFC">
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
              
              ${createLink("shift_logbook_officer", "/src/pages/shift_logbook_officer.html", "ph-notebook", "Officer Logs", isCollapsed)}
              
              ${createLink("technician_logbook", "/src/pages/technician_logbook.html", "ph-factory", "Technician Logs", isCollapsed)}
              
              <div class="sidebar-section-title ${isCollapsed ? 'hidden' : 'block px-4 text-[10px] font-bold text-[#8e8e9e] uppercase tracking-widest mb-2 mt-6'}">Analysis</div>
              
              ${createLink("job_types", "/src/pages/job_types.html", "ph-wrench", "Job Analysis", isCollapsed)}
              ${createLink("instrument_types", "/src/pages/instrument_types.html", "ph-faders", "Instrument Types", isCollapsed)}

            <div class="sidebar-section-title ${isCollapsed ? 'hidden' : 'block px-4 text-[10px] font-bold text-[#8e8e9e] uppercase tracking-widest mb-2 mt-6'}">System</div>

            ${createLink("settings", "/src/pages/settings.html", "ph-gear", "Settings", isCollapsed)}
     
          </nav>
  
          <div class="p-4 border-t border-[#2c3235] bg-[#0b0c0e]">
              <div class="flex items-center gap-3 text-[#c7d0d9] hover:text-white cursor-pointer transition overflow-hidden ${isCollapsed ? 'justify-center' : ''}">
                  <img src="https://ui-avatars.com/api/?name=Admin&background=2c3235&color=fff" class="w-8 h-8 rounded-full border border-[#2c3235] flex-shrink-0">
                  <div class="flex-1 ${textClass} whitespace-nowrap transition-opacity duration-300">
                      <p class="text-sm font-medium leading-none">Admin User</p>
                      <p class="text-[#5794F2] text-xs">Sign out</p>
                  </div>
                  <i class="ph-bold ph-sign-out ${textClass}"></i>
              </div>
          </div>
      </aside>
      
      <!-- Custom Tooltip Element -->
      <div id="sidebar-tooltip" class="fixed z-[100] hidden px-3 py-1.5 bg-[#181b1f] text-white text-xs font-medium rounded border border-[#2c3235] shadow-xl pointer-events-none whitespace-nowrap transition-opacity duration-200"></div>
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
          <i class="ph ${icon} text-lg ${isActive ? "text-[#FF9900]" : ""} flex-shrink-0"></i>
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
    // Only show if collapsed (width is w-16)
    if (!sidebar || !sidebar.classList.contains('w-16')) return;

    const tooltip = document.getElementById('sidebar-tooltip');
    if (!tooltip) return;

    tooltip.textContent = text;
    tooltip.classList.remove('hidden');

    // Position calculation
    const rect = event.currentTarget.getBoundingClientRect();
    const top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2); // Center vertically
    const left = rect.right + 8; // 8px default gap

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
}

function hideSidebarTooltip() {
    const tooltip = document.getElementById('sidebar-tooltip');
    if (tooltip) tooltip.classList.add('hidden');
}
