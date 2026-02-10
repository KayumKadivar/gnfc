// Shared Tailwind Configuration for GNFC Project
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace']
        },
        zIndex: {
            '9999': '9999',
        },
        colors: {
          dark: {
            // Using CSS variables defined in ThemeManager
            bg: 'var(--app-bg, #111217)',
            panel: 'var(--app-panel, #181b1f)',
            header: 'var(--app-panel-alt, #22252b)',
            border: 'var(--app-border, #2c3235)',
            text: 'var(--app-text, #ccccdd)',
            muted: 'var(--app-muted, #8e8e9e)'
          },
          gnfc: {
            orange: '#FF9900',
            blue: '#5794F2',
            green: '#73BF69',
            red: '#F2495C',
            purple: '#B794F4',
            navy: '#0f172a',
            slate: '#1e293b',
            teal: '#14b8a6',
            cyan: '#06b6d4',
            emerald: '#10b981',
            amber: '#f59e0b',
            rose: '#f43f5e'
          }
        },
        // Adding custom utilities
        boxShadow: {
            'gnfc-blue': '0 0 15px rgba(87, 148, 242, 0.2)',
            'gnfc-orange': '0 0 15px rgba(255, 153, 0, 0.2)',
        },
        animation: {
            'float': 'float 6s ease-in-out infinite',
            'gradient': 'gradient-shift 8s ease infinite',
        },
        keyframes: {
            float: {
                '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                '50%': { transform: 'translateY(-10px) rotate(2deg)' },
            },
            'gradient-shift': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' },
            }
        }
      }
    }
  };
}
