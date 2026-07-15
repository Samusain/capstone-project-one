import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/vitestSetup.js', './src/test/jestCompat.js'],
    pool: 'forks',
    fileParallelism: false,
    clearMocks: true,
    restoreMocks: true,
  },
})

