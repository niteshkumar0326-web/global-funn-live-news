import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { ink: "#071426", royal: "#102A56", gold: "#D4AF37", breaking: "#C62828" } } }, plugins: [] };
export default config;
