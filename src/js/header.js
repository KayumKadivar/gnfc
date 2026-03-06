function renderHeader(config) {
  // Default configuration
  const title = config.title;
  const backLink = config.backLink || "#";
  const breadcrumbs = config.breadcrumbs || [];

  const searchPlaceholder = config.searchPlaceholder || "Search logbook...";

  // Helper to generate breadcrumbs HTML
  const breadcrumbsHTML = breadcrumbs.map((crumb, index) => {
    const isLast = index === breadcrumbs.length - 1;
    // Last item is non-clickable text (active page)
    if (isLast) {
      return `<span>${crumb.label}</span>`;
    }
    // Previous items are links + separator
    return `
            <a href="${crumb.href}" class="hover-color-blue transition-colors">${crumb.label}</a>
            <i class="ph-bold ph-caret-right font-13px"></i>
        `;
  }).join('');

  const html = `
    <header class="h-14 bg-white dark:bg-[#1a1d21] border-b border-gray-200 dark:border-[#2c3235] flex items-center justify-between px-6 shrink-0 z-20 relative shadow-md transition-colors duration-300">
      
      <!-- Left: Title & Breadcrumbs -->
      <div class="flex flex-col justify-center gap-0.5">
          <h1 class="font-15px fw-bold color-primary tracking-wide leading-tight">${title}</h1>
            <nav class="flex items-center gap-1.5 font-10px fw-bold color-label text-upper tracking-wider">
            ${breadcrumbsHTML}
          </nav>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-4">
        
        <!-- Search -->
        <div class="relative hidden md:block group">
          <i class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 color-hint group-focus-within-color-blue transition-colors"></i>
          <input type="text" placeholder="${searchPlaceholder}"
            class="bg-gray-50 dark:bg-[#0b0c0e] border border-gray-200 dark:border-[#2c3235] color-primary font-14px rounded-md pl-9 pr-10 h-9 w-64 focus:border-blue-500 dark:focus:border-gnfc-blue focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-gnfc-blue/20 focus:outline-none transition-all placeholder-dark-muted">
          <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
             <kbd class="hidden font-sans font-13px fw-bold color-hint bg-gray-100 dark:bg-[#1a1d21] border border-gray-200 dark:border-[#2c3235] px-1.5 py-0.5 rounded">AUTO</kbd>
          </div>
        </div>
        
        <div class="flex items-center gap-2">

        <!-- Utility Group -->
        <div class="flex items-center gap-2">
            <!-- Font Size -->
            <div class="flex items-center bg-gray-50 dark:bg-[#0b0c0e] border border-gray-200 dark:border-[#2c3235] rounded-md p-0.5">
                <button onclick="ThemeManager.decreaseFontSize()" class="w-7 h-7 flex items-center justify-center color-label hover-color-primary hover:bg-gray-200 dark:hover:bg-[#2c3235] rounded-sm transition-colors" title="Decrease Size">
                    <i class="ph-bold ph-text-aa font-13px scale-75"></i>
                </button>
                <div class="w-px h-3 bg-gray-200 dark:bg-[#2c3235]"></div>
                <button onclick="ThemeManager.increaseFontSize()" class="w-7 h-7 flex items-center justify-center color-label hover-color-primary hover:bg-gray-200 dark:hover:bg-[#2c3235] rounded-sm transition-colors" title="Increase Size">
                    <i class="ph-bold ph-text-aa font-15px"></i>
                </button>
            </div>

            <!-- Back Button -->
            <button onclick="window.location.href='${backLink}'"
              class="flex items-center gap-2 h-8 px-3.5 bg-gray-100 dark:bg-[#2c3235]/30 hover:bg-gray-200 dark:hover:bg-[#2c3235] border border-gray-200 dark:border-[#2c3235] font-14px fw-bold color-primary rounded-md transition-all">
              <i class="ph-bold ph-arrow-u-up-left"></i>
              <span>Back</span>
            </button>
        </div>

      </div>
    </header>
    `;

  const container = document.getElementById(config.containerId || 'header-container');
  if (container) {
    container.innerHTML = html;
  } else {
    console.error("Header container not found! Please add <div id='header-container'></div> where you want the header to appear.");
  }
}
