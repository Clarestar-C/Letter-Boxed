import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: 'Letter-Boxed', // 👈 Replace with your exact repo name (case-sensitive)
})