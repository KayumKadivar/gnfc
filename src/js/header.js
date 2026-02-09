function renderHeader(config) {
    // Default configuration
    const title = config.title;
    const backLink = config.backLink || "#";
    const breadcrumbs = config.breadcrumbs || [];

    // Helper to generate breadcrumbs HTML
    const breadcrumbsHTML = breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        // Last item is non-clickable text (active page)
        if (isLast) {
            return `<span>${crumb.label}</span>`;
        }
        // Previous items are links + separator
        return `
            <a href="${crumb.href}" class="hover:text-grafana-blue transition-colors">${crumb.label}</a>
            <i class="ph-bold ph-caret-right text-[10px]"></i>
        `;
    }).join('');

    const html = `
    <header class="h-14 bg-dark-panel border-b border-dark-border flex items-center justify-between px-6 shrink-0 z-10 transition-colors duration-300">
      <div class="flex items-center gap-3">
        <div class="flex flex-col">
          <h2 class="text-lg font-bold text-white tracking-tight leading-none">${title}</h2>
          <div class="flex items-center gap-1 text-xs text-dark-muted mt-1">
            ${breadcrumbsHTML}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative hidden md:block">
          <i class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted text-xs"></i>
          <input type="text" placeholder="Global Search..."
            class="bg-dark-panel border border-dark-border text-dark-text text-xs rounded-sm pl-8 pr-3 py-1.5 focus:border-grafana-blue focus:outline-none transition-colors w-48 lg:w-64 placeholder-dark-muted">
        </div>
        
        <!-- Font Size Controls -->
        <div class="flex items-center bg-dark-panel border border-dark-border rounded-sm">
            <button onclick="ThemeManager.decreaseFontSize()" class="w-8 h-8 flex items-center justify-center text-dark-text hover:text-white hover:bg-dark-border/50 transition-colors border-r border-dark-border" title="Decrease Font Size">
                <i class="ph-bold ph-minus text-xs"></i>
            </button>
            <div class="w-px h-4 bg-dark-border"></div>
            <button onclick="ThemeManager.increaseFontSize()" class="w-8 h-8 flex items-center justify-center text-dark-text hover:text-white hover:bg-dark-border/50 transition-colors" title="Increase Font Size">
                <i class="ph-bold ph-plus text-xs"></i>
            </button>
        </div>

        <button onclick="window.location.href='${backLink}'"
          class="flex items-center gap-1 bg-dark-panel border border-dark-border text-dark-text text-xs font-bold px-3 py-1.5 rounded-sm hover:text-white hover:border-grafana-blue transition-all align-middle">
          <i class="ph-bold ph-arrow-left"></i> Back
        </button>
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
