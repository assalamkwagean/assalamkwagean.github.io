/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                slate: { 900: '#0f172a', 800: '#1e293b', 700: '#334155' },
                emerald: { 600: '#059669', 500: '#10b981', 400: '#34d399' }
            }
        },
    },
    plugins: [],
}
