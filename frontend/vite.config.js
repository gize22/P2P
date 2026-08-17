import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 👈 ይህንን አስገባ

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
   darkMode: 'class', // 👈 ይህ መኖሩን አረጋግጥ
  theme: {
    extend: {},
  },
  plugins: [
    react(),
    tailwindcss(), // 👈 ይህንን እዚህ አስገባ
  ],
  server: {
    host: true, // 👈 ይህ በጣም አስፈላጊ ነው! ከኮምፒዩተር ውጭ (በስልክ ወይም በኔትወርክ) እንዲከፈት ያደርጋል።
    port: 5173
  }

})