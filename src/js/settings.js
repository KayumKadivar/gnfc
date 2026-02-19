
document.addEventListener('DOMContentLoaded', () => {
    // Theme Handling
    const themeButtons = {
        light: document.getElementById('btn-theme-light'),
        dark: document.getElementById('btn-theme-dark'),
        system: document.getElementById('btn-theme-system')
    };

    function updateThemeUI(currentMode) {
        // Reset all buttons
        Object.values(themeButtons).forEach(btn => {
            if (!btn) return;
            // Remove active styles
            btn.classList.remove('border-gnfc-orange', 'bg-dark-header', 'shadow-lg', 'shadow-gnfc-orange/10');
            btn.classList.add('border-dark-border', 'hover:border-dark-muted', 'bg-dark-bg/50');

            // Allow pointer events
            btn.style.pointerEvents = 'auto';

            // Remove logic indicator if present (the little orange dot)
            const indicator = btn.querySelector('.absolute.top-2.right-2');
            if (indicator) indicator.remove();

            // Reset text weight
            const textDiv = btn.querySelector('.text-center');
            if (textDiv) {
                textDiv.classList.remove('fw-bold', 'color-primary');
                textDiv.classList.add('fw-medium', 'color-label');
            }

            // Reset icon color
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.remove('color-orange');
                icon.classList.add('color-label');
            }
        });

        // Apply active styles to current button
        const activeBtn = themeButtons[currentMode];
        if (activeBtn) {
            activeBtn.classList.remove('border-dark-border', 'hover:border-dark-muted', 'bg-dark-bg/50');
            activeBtn.classList.add('border-gnfc-orange', 'bg-dark-header', 'shadow-lg', 'shadow-gnfc-orange/10');

            // Add indicator
            const indicator = document.createElement('div');
            indicator.className = 'absolute top-2 right-2 w-2 h-2 rounded-full bg-gnfc-orange';
            activeBtn.prepend(indicator);

            // Bold text
            const textDiv = activeBtn.querySelector('.text-center');
            if (textDiv) {
                textDiv.classList.remove('fw-medium', 'color-label');
                textDiv.classList.add('fw-bold', 'color-primary');
            }

            // Active icon color
            const icon = activeBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('color-label');
                icon.classList.add('color-orange');
            }
        }
    }

    // Initialize Theme UI
    if (typeof ThemeManager !== 'undefined') {
        const currentSettings = ThemeManager.getSettings();
        updateThemeUI(currentSettings.mode);

        if (themeButtons.light) {
            themeButtons.light.addEventListener('click', () => {
                ThemeManager.setMode('light');
                updateThemeUI('light');
            });
        }

        if (themeButtons.dark) {
            themeButtons.dark.addEventListener('click', () => {
                ThemeManager.setMode('dark');
                updateThemeUI('dark');
            });
        }

        if (themeButtons.system) {
            themeButtons.system.addEventListener('click', () => {
                ThemeManager.setMode('system');
                updateThemeUI('system');
            });
        }

        // Listen for theme changes from other sources or system updates (though local updateThemeUI handles click immediate feedback)
        // If system mode changes effective theme, we might want to know? 
        // Currently updateThemeUI only cares about which BUTTON is active (mode), not the effective visual theme.
    }
});
