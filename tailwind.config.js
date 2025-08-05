/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                inter: 'var(--font-inter)',
                rubik: 'var(--font-rubik)',
                merriweather: 'var(--font-merriweather)',
                jetbrains: 'var(--font-jetbrains-mono)',
                opensans: 'var(--font-open-sans)',
                sourcecode: 'var(--font-source-code-pro)',
            }
        }
    },
    plugins: []
}
