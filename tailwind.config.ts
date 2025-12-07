import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Space Mono', 'monospace'],
        sans: ['JetBrains Mono', 'Space Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        priority: {
          high: "hsl(var(--priority-high))",
          medium: "hsl(var(--priority-medium))",
          low: "hsl(var(--priority-low))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "var(--radius)",
      },
      borderWidth: {
        DEFAULT: "var(--border-width)",
        "0": "0",
        "2": "2px",
        "3": "3px",
        "4": "4px",
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px hsl(var(--foreground))",
        "brutal-sm": "2px 2px 0px 0px hsl(var(--foreground))",
        "brutal-lg": "6px 6px 0px 0px hsl(var(--foreground))",
        "brutal-accent": "4px 4px 0px 0px hsl(var(--accent))",
        "brutal-success": "4px 4px 0px 0px hsl(var(--success))",
        "brutal-destructive": "4px 4px 0px 0px hsl(var(--destructive))",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-scale": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(100%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        "check-bounce": {
          "0%": { transform: "scale(0)" },
          "50%": { transform: "scale(1.3)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        "number-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "hover-lift": {
          "0%": { transform: "translateY(0)", boxShadow: "4px 4px 0px 0px hsl(var(--foreground))" },
          "100%": { transform: "translateY(-2px) translateX(-2px)", boxShadow: "6px 6px 0px 0px hsl(var(--foreground))" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "fade-in-scale": "fade-in-scale 0.2s ease-out forwards",
        "slide-in": "slide-in 0.3s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "slide-up": "slide-up 0.3s ease-out",
        shake: "shake 0.3s ease-in-out",
        "check-bounce": "check-bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "number-pop": "number-pop 0.3s ease-out",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
        "hover-lift": "hover-lift 0.2s ease-out forwards",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
