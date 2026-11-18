import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    cors: true,
    allowedHosts: true,
    strictPort: true,
    hmr: {
      overlay: false // Prevents modal error overlay from hanging remote screens
    },
    watch: {
      ignored: ['**/android/**', '**/dist/**', '**/*.apk', '**/serve-apk.cjs']
    }
  },
  build: {
    target: 'es2020',
    assetsDir: 'assets',
    sourcemap: false,
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/@dimforge/rapier3d-compat')) {
            return 'vendor-rapier';
          }
          if (id.includes('node_modules/gsap') || id.includes('node_modules/lucide')) {
            return 'vendor-ui';
          }
        }
      }
    }
  }
});
