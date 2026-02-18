const ThemeManager = {
    storageKey: 'gnfc_theme_settings',

    defaults: {
        fontSize: 18,
        mode: 'light',
        // bgColor: '#111217',
        // panelColor: '#181b1f',
    },

    modes: {
        dark: {
            name: 'Dark',
            bg: '#111217',
            panel: '#181b1f',
            panelAlt: '#22252b',
            border: '#2c3235',
            text: '#ffffff',
            textStrong: '#ffffff',
            muted: '#a3a3a3',
            sidebar: '#0b0c0e',
            sidebarBorder: '#2c3235',
        },
        light: {
            name: 'Light',
            bg: '#f4f7fb',
            panel: '#ffffff',
            panelAlt: '#edf2f8',
            border: '#d6deea',
            text: '#000000',
            textStrong: '#000000',
            muted: '#4b5563',
            white: '#ffffff',
            sidebar: '#ffffff',
            sidebarBorder: '#d6deea',
        },
    },

    init() {
        this.applySettings();
    },

    getSettings() {
        let parsed = {};

        try {
            const stored = localStorage.getItem(this.storageKey);
            parsed = stored ? JSON.parse(stored) || {} : {};
        } catch (e) {
            parsed = {};
        }

        const merged = { ...this.defaults, ...parsed };
        if (merged.mode !== 'dark' && merged.mode !== 'light') {
            merged.mode = this.inferModeFromLegacySettings(merged);
        }

        const palette = this.getPalette(merged.mode);
        merged.fontSize = this.sanitizeFontSize(merged.fontSize);
        merged.bgColor = this.isValidHex(merged.bgColor) ? merged.bgColor : palette.bg;
        merged.panelColor = this.isValidHex(merged.panelColor) ? merged.panelColor : palette.panel;

        return merged;
    },

    saveSettings(settings) {
        const normalized = this.normalizeSettings(settings);
        localStorage.setItem(this.storageKey, JSON.stringify(normalized));
        this.applySettings();
    },

    setMode(mode) {
        const palette = this.getPalette(mode);
        if (!palette) return;

        const next = this.getSettings();
        next.mode = mode;
        next.bgColor = palette.bg;
        next.panelColor = palette.panel;
        this.saveSettings(next);
    },

    normalizeSettings(settings = {}) {
        const mode = settings.mode === 'light' ? 'light' : settings.mode === 'dark' ? 'dark' : this.defaults.mode;
        const palette = this.getPalette(mode);

        return {
            ...this.defaults,
            ...settings,
            mode,
            fontSize: this.sanitizeFontSize(settings.fontSize),
            bgColor: this.isValidHex(settings.bgColor) ? settings.bgColor : palette.bg,
            panelColor: this.isValidHex(settings.panelColor) ? settings.panelColor : palette.panel,
        };
    },

    applySettings() {
        const settings = this.getSettings();
        const palette = this.getPalette(settings.mode);
        const fontScale = settings.fontSize / this.defaults.fontSize;

        document.documentElement.classList.toggle('dark', settings.mode === 'dark');
        document.documentElement.setAttribute('data-theme-mode', settings.mode);
        document.documentElement.style.colorScheme = settings.mode;
        document.documentElement.style.fontSize = `${settings.fontSize}px`;

        this.injectColorOverrides({
            mode: settings.mode,
            bgColor: settings.bgColor,
            panelColor: settings.panelColor,
            palette,
            fontScale,
        });
    },

    injectColorOverrides(theme) {
        // Load typography.css once
        if (!document.getElementById('typography-css')) {
            const link = document.createElement('link');
            link.id = 'typography-css';
            link.rel = 'stylesheet';
            link.href = '/src/css/typography.css';
            document.head.appendChild(link);
        }

        let styleTag = document.getElementById('theme-overrides');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'theme-overrides';
            document.head.appendChild(styleTag);
        }

        const pxScaleRules = [8, 9, 10, 11, 12, 13, 14, 15, 16]
            .map((size) => `[class~="text-[${size}px]"] { font-size: calc(${size}px * var(--app-font-scale)) !important; }`)
            .join('\n');

        // Typography color vars based on theme mode
        const isDark = theme.mode === 'dark';
        const typoVars = isDark ? `
                --typo-primary: #ffffff;
                --typo-secondary: #d1d5db;
                --typo-label: #9ca3af;
                --typo-hint: #6b7280;
                --typo-blue: #5794F2;
                --typo-orange: #FF9900;
                --typo-green: #73BF69;
                --typo-red: #F2495C;
                --typo-purple: #B794F4;
                --typo-teal: #14b8a6;
                --typo-cyan: #06b6d4;
                --typo-amber: #f59e0b;
        ` : `
                --typo-primary: #111827;
                --typo-secondary: #374151;
                --typo-label: #4b5563;
                --typo-hint: #6b7280;
                --typo-blue: #2563eb;
                --typo-orange: #d97706;
                --typo-green: #059669;
                --typo-red: #dc2626;
                --typo-purple: #7c3aed;
                --typo-teal: #0d9488;
                --typo-cyan: #0891b2;
                --typo-amber: #d97706;
        `;

        // Boost muted color for better readability
        const boostedMuted = isDark ? '#d1d5db' : '#374151';

        styleTag.textContent = `
            :root {
                --app-bg: ${theme.bgColor};
                --app-panel: ${theme.panelColor};
                --app-panel-alt: ${theme.palette.panelAlt};
                --app-border: ${theme.palette.border};
                --app-text: ${theme.palette.text};
                --app-text-strong: ${theme.palette.textStrong};
                --app-muted: ${boostedMuted};
                --app-sidebar: ${theme.palette.sidebar};
                --app-sidebar-border: ${theme.palette.sidebarBorder};
                --app-font-scale: ${theme.fontScale};
                ${typoVars}
            }

            body {
                background-color: var(--app-bg) !important;
                color: var(--app-text);
            }

            /* --- Tailwind Font Size Overrides for Accessibility --- */
            .text-xs  { font-size: 14px !important; }
            .text-sm  { font-size: 15px !important; }
            .text-base { font-size: 16px !important; }
            [class~="text-[9px]"]  { font-size: 12px !important; }
            [class~="text-[10px]"] { font-size: 13px !important; }
            [class~="text-[11px]"] { font-size: 14px !important; }

            ${pxScaleRules}

            .bg-dark-bg { background-color: var(--app-bg) !important; }
            .bg-dark-panel { background-color: var(--app-panel) !important; }
            .bg-dark-header { background-color: var(--app-panel-alt) !important; }
            .border-dark-border { border-color: var(--app-border) !important; }
            .text-dark-text { color: var(--app-text) !important; }
            .text-dark-muted { color: var(--app-muted) !important; }
            .placeholder-dark-muted::placeholder { color: var(--app-muted) !important; }

            [class~="bg-[#111217]"] { background-color: var(--app-bg) !important; }
            [class~="bg-[#111217]/50"] { background-color: var(--app-panel-alt) !important; }
            [class~="bg-[#181b1f]"],
            [class~="bg-[#181B1F]"] { background-color: var(--app-panel) !important; }
            [class~="bg-[#1a1d1f]"],
            [class~="bg-[#1e2126]"],
            [class~="bg-[#22252b]"],
            [class~="bg-[#22252B]"] { background-color: var(--app-panel-alt) !important; }
            [class~="bg-[#0b0c0e]"],
            [class~="bg-[#0B0C0E]"] { background-color: var(--app-sidebar) !important; }

            [class~="border-[#2c3235]"],
            [class~="border-[#2C3235]"],
            [class~="border-[#0b0c0e]"],
            [class~="border-[#0B0C0E]"] { border-color: var(--app-border) !important; }

            [class~="text-[#c7d0d9]"],
            [class~="text-[#ccccdd]"],
            [class~="text-[#CCCCDD]"] { color: var(--app-text) !important; }
            [class~="text-[#8e8e9e]"],
            [class~="text-[#8E8E9E]"] { color: var(--app-muted) !important; }

            [class~="hover:bg-[#181b1f]"]:hover,
            [class~="hover:bg-[#22252b]"]:hover,
            [class~="hover:bg-[#2c3235]"]:hover {
                background-color: var(--app-panel-alt) !important;
            }

            [class~="hover:bg-white\\/5"]:hover,
            [class~="hover:bg-dark-border\\/50"]:hover {
                background-color: var(--app-panel-alt) !important;
            }

            html[data-theme-mode="light"] tr[class~="hover:bg-white\\/5"]:hover,
            html[data-theme-mode="light"] tr[class~="hover:bg-dark-border\\/50"]:hover {
                background: linear-gradient(90deg, rgba(37, 99, 235, 0.08), rgba(14, 165, 233, 0.04)) !important;
                box-shadow: inset 2px 0 0 rgba(37, 99, 235, 0.5);
            }

            html[data-theme-mode="light"] tr[class~="hover:bg-white\\/5"]:hover td,
            html[data-theme-mode="light"] tr[class~="hover:bg-dark-border\\/50"]:hover td {
                border-color: rgba(148, 163, 184, 0.45) !important;
            }

            [class~="hover:text-white"]:hover {
                color: var(--app-text-strong);
            }

            html[data-theme-mode="light"] .text-white {
                color: var(--app-text-strong);
            }

            html[data-theme-mode="dark"] .bg-slate-50,
            html[data-theme-mode="dark"] .bg-slate-100,
            html[data-theme-mode="dark"] .bg-white,
            html[data-theme-mode="dark"] .bg-white\\/95 {
                background-color: var(--app-panel) !important;
            }
            html[data-theme-mode="dark"] .bg-slate-900,
            html[data-theme-mode="dark"] .bg-slate-950\\/30,
            html[data-theme-mode="dark"] .bg-slate-950\\/40,
            html[data-theme-mode="dark"] .bg-slate-950\\/50,
            html[data-theme-mode="dark"] .bg-slate-950\\/60 {
                background-color: var(--app-sidebar) !important;
            }

            html[data-theme-mode="dark"] .border-slate-100,
            html[data-theme-mode="dark"] .border-slate-200,
            html[data-theme-mode="dark"] .border-white\\/10 {
                border-color: var(--app-border) !important;
            }

            html[data-theme-mode="dark"] .text-slate-900,
            html[data-theme-mode="dark"] .text-slate-800,
            html[data-theme-mode="dark"] .text-slate-700,
            html[data-theme-mode="dark"] .text-slate-600 {
                color: var(--app-text) !important;
            }
            html[data-theme-mode="dark"] .text-slate-500,
            html[data-theme-mode="dark"] .text-slate-400,
            html[data-theme-mode="dark"] .text-slate-300 {
                color: var(--app-muted) !important;
            }

            html[data-theme-mode="dark"] body[class*="bg-gradient-to-br"],
            html[data-theme-mode="dark"] [class~="bg-gradient-to-br"] {
                background-image: none !important;
                background-color: var(--app-bg) !important;
            }

            ::-webkit-scrollbar-track {
                background: var(--app-bg) !important;
            }
            ::-webkit-scrollbar-thumb {
                background: var(--app-border) !important;
            }
        `;
    },

    getPalette(mode) {
        return this.modes[mode] || this.modes.dark;
    },

    sanitizeFontSize(size) {
        const numeric = Number.parseInt(size, 10);
        if (!Number.isFinite(numeric)) return this.defaults.fontSize;
        return Math.min(24, Math.max(12, numeric));
    },

    isValidHex(value) {
        return typeof value === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(value.trim());
    },

    inferModeFromLegacySettings(settings) {
        const rgb = this.hexToRgb(settings.bgColor || this.defaults.bgColor);
        if (!rgb) return this.defaults.mode;
        const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
        return luminance > 0.6 ? 'light' : 'dark';
    },

    hexToRgb(hex) {
        if (typeof hex !== 'string') return null;
        let clean = hex.trim().replace('#', '');
        if (clean.length === 3) {
            clean = clean.split('').map((ch) => ch + ch).join('');
        }
        if (clean.length < 6) return null;
        const value = clean.slice(0, 6);
        if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
        return {
            r: parseInt(value.slice(0, 2), 16),
            g: parseInt(value.slice(2, 4), 16),
            b: parseInt(value.slice(4, 6), 16),
        };
    },
    increaseFontSize() {
        const current = this.getSettings();
        const newSize = Math.min(28, current.fontSize + 1); // Max 24px
        if (newSize !== current.fontSize) {
            this.saveSettings({ ...current, fontSize: newSize });
        }
    },

    decreaseFontSize() {
        const current = this.getSettings();
        const newSize = Math.max(12, current.fontSize - 1); // Min 12px
        if (newSize !== current.fontSize) {
            this.saveSettings({ ...current, fontSize: newSize });
        }
    },
};

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

ThemeManager.init();
