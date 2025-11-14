import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Create a separate chunk for Firebase, which is a large dependency.
          if (id.includes('firebase')) {
            return 'vendor-firebase';
          }
          // Create a chunk for other node_modules dependencies.
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600, // Slightly increase the warning limit as a safety margin.
  },
});
