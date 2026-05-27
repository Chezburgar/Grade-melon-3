/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: [
		"./node_modules/flowbite-react/**/*.js",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./context/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			background: "#000000",
			colors: {
				primary: {
					50:  "var(--primary-50,  #fff1f2)",
					100: "var(--primary-100, #ffe4e6)",
					200: "var(--primary-200, #fecdd3)",
					300: "var(--primary-300, #fda4af)",
					400: "var(--primary-400, #fb7185)",
					500: "var(--primary-500, #f43f5e)",
					600: "var(--primary-600, #e11d48)",
					700: "var(--primary-700, #be123c)",
					800: "var(--primary-800, #9f1239)",
					900: "var(--primary-900, #881337)",
					11:  "var(--primary-11,  #2247b3)",
				},
			},
		},
		fontFamily: {
			sans: ["Manrope", "sans-serif"],
		},
		screens: {
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
			"2col": "1170px",
			"3col": "1568px",
			"4col": "1972px",
			announcement: "413px",
		},
	},
	safelist: [
		{
			pattern: /(text|bg)-(green|blue|yellow|orange|red)-400/,
		},
		{
			pattern: /bg-gray-(50|100|700|800|900)/,
		},
	],
	plugins: [require("flowbite/plugin")],
};
