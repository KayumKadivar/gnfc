function renderSidebar(activePageId) {
  const sidebarHTML = `
    <aside class="w-64 bg-[#0b0c0e] flex flex-col flex-shrink-0 border-r border-[#2c3235] z-50 h-screen font-sans">
        
        <div class="h-16 flex items-center gap-3 px-5 bg-[#0b0c0e] border-b border-[#2c3235]">
            <div class="w-8 h-8 bg-gradient-to-br from-[#FF9900] to-[#FF5500] rounded flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                <i class="ph-bold ph-lightning"></i>
            </div>
            <div>
                <h1 class="text-gray-200 font-bold tracking-tight text-sm">GNFC MONITOR</h1>
                <p class="text-[#8e8e9e] text-[10px] uppercase tracking-wider font-medium">System Admin</p>
            </div>
        </div>

        <nav class="flex-1 overflow-y-auto py-4 space-y-1">
            
            <div class="px-4 text-[10px] font-bold text-[#8e8e9e] uppercase tracking-widest mb-2 mt-2">Dashboards</div>
            
            ${createLink("dashboard", "dashboard.html", "ph-squares-four", "Plant Status")}

            <div class="px-4 text-[10px] font-bold text-[#8e8e9e] uppercase tracking-widest mb-2 mt-6">Logs</div>
            
            ${createLink("shift_logbook_officer", "shift_logbook_officer.html", "ph-notebook", "Officer Logs")}
            
            ${createLink("technician_logbook", "technician_logbook.html", "ph-factory", "Technician Logs")}
            <div class="px-4 text-[10px] font-bold text-[#8e8e9e] uppercase tracking-widest mb-2 mt-6">Analysis</div>
            
            ${createLink("job_types", "job_types.html", "ph-wrench", "Job Analysis")}
            ${createLink("instrument_types", "instrument_types.html", "ph-faders", "Instrument Types")}
            
         
        </nav>

        <div class="p-4 border-t border-[#2c3235] bg-[#0b0c0e]">
            <div class="flex items-center gap-3 text-[#c7d0d9] hover:text-white cursor-pointer transition">
                <img src="https://ui-avatars.com/api/?name=Admin&background=2c3235&color=fff" class="w-8 h-8 rounded-full border border-[#2c3235]">
                <div class="flex-1">
                    <p class="text-sm font-medium leading-none">Admin User</p>
                    <p class="text-[#5794F2] text-xs">Sign out</p>
                </div>
                <i class="ph-bold ph-sign-out"></i>
            </div>
        </div>
    </aside>`;

  const container = document.getElementById("sidebar-container");
  if (container) container.innerHTML = sidebarHTML;
}

function createLink(id, url, icon, text) {
  const isActive = id === window.activePage;
  // Grafana Active Style: Left Orange Border + Darker BG
  const activeClass = isActive
    ? "bg-[#181b1f] text-white border-l-4 border-[#FF9900]"
    : "text-[#8e8e9e] hover:text-gray-200 hover:bg-[#181b1f] border-l-4 border-transparent";

  // Fix: Ensure icons work
  return `
    <a href="${url}" class="flex items-center gap-3 px-4 py-2.5 transition-all duration-200 group ${activeClass}">
        <i class="ph ${icon} text-lg ${isActive ? "text-[#FF9900]" : ""}"></i>
        <span class="font-medium text-sm">${text}</span>
    </a>`;
}
