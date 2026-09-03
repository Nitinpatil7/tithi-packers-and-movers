/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)",
          soft: "var(--color-primary-soft)",
        },
        bg: {
          page: "var(--color-bg-page)",
          white: "var(--color-bg-white)",
          section: "var(--color-bg-section)",
          elevated: "var(--color-bg-elevated)",
          border: "var(--color-bg-border)",
          hover: "var(--color-bg-hover)",
          // Keep dark aliases for any admin pages
          dark: "#0A0F1A",
          card: "#0F1724",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
        },
        service: {
          local: "var(--color-local)",
          intercity: "var(--color-intercity)",
          packing: "var(--color-packing)",
          commercial: "var(--color-commercial)",
        },
        status: {
          pending: "var(--color-pending)",
          confirmed: "var(--color-confirmed)",
          inprogress: "var(--color-in-progress)",
          completed: "var(--color-completed)",
          cancelled: "var(--color-cancelled)",
        },
        sky: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-xl': ['3.75rem', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        'display-lg': ['3.125rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.375rem', { lineHeight: '1.14', letterSpacing: '-0.018em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        '2xl': "var(--radius-2xl)",
      },
      backdropBlur: {
        glass: "20px",
      },
      boxShadow: {
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'card': 'var(--shadow-card)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'sky': 'var(--shadow-sky)',
        'sky-lg': '0 16px 40px rgba(14,165,233,0.35)',
        // Legacy aliases
        'orange': 'var(--shadow-sky)',
        'orange-lg': '0 16px 40px rgba(14,165,233,0.35)',
        'local': '0 8px 25px rgba(14,165,233,0.25)',
        'intercity': '0 8px 25px rgba(2,132,199,0.25)',
        'packing': '0 8px 25px rgba(56,189,248,0.25)',
        'commercial': '0 8px 25px rgba(125,211,252,0.25)',
      },
      animation: {
        'scroll-left': 'scrollLeft 35s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-slide-up': 'fadeSlideUp 0.6s ease-out forwards',
        'pulse-glow': 'pulseGlow 8s ease-in-out infinite',
      },
      backgroundImage: {
        'sky-gradient': 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
        'sky-gradient-soft': 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
        // Legacy aliases
        'orange-gradient': 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
        'hero-gradient': 'var(--color-bg-hero)',
        'section-gradient': 'var(--color-bg-section-grad)',
        'card-gradient': 'var(--color-bg-card-grad)',
      },
    },
  },
  plugins: [],
};
