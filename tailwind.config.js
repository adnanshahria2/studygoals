/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    primary: '#000000',
                    secondary: '#0a0a0a',
                    card: '#111111',
                    hover: '#1a1a1a',
                },
                accent: {
                    blue: '#3b82f6',
                    green: '#22c55e',
                    red: '#ef4444',
                    gold: '#f59e0b',
                    purple: '#a855f7',
                    cyan: '#06b6d4',
                    pink: '#ec4899',
                    orange: '#f97316',
                },
                border: {
                    DEFAULT: '#262626',
                    light: '#404040',
                }
            },
            boxShadow: {
                'glow-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
                'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
                'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
                'glow-gold': '0 0 20px rgba(245, 158, 11, 0.3)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' },
                }
            }
        },
    },
    plugins: [],
}
