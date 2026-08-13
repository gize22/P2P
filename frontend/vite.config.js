import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 👈 ይህንን አስገባ

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 👈 ይህንን እዚህ አስገባ
  ],
})