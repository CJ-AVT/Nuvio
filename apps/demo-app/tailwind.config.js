/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    // Workspace overlay ships pre-built JS; Tailwind must see its class names or utilities are purged.
    "../../packages/overlay/src/**/*.{ts,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
