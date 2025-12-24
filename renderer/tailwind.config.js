/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Pure monochrome
                dark: {
                    bg: '#000000',
                    text: '#ffffff',
                    muted: '#888888',
                    border: '#222222',
                    hover: '#111111',
                },
                light: {
                    bg: '#ffffff',
                    text: '#000000',
                    muted: '#666666',
                    border: '#e0e0e0',
                    hover: '#f5f5f5',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.15s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};
