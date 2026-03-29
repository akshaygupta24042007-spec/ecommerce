import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler", { target: "19" }]
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  // @ts-expect-error ssgOptions is recognized by vite-react-ssg plugin, not Vite's built-in types
  ssgOptions: {
    mock: true,
    dirStyle: 'nested',
    entry: 'src/main.tsx',
  },
})
