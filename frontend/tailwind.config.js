// File: frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
    // We still need to tell it which files to scan
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    // We still need to tell it to use 'class' for dark mode
    darkMode: "class",
    // That's it! Your index.css handles the rest.
}