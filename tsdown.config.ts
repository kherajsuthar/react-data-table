import { defineConfig } from 'tsdown';
import fs from 'node:fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  onSuccess: async () => {
    try {
      if (fs.existsSync('dist/style.css')) {
        fs.copyFileSync('dist/style.css', 'dist/styles.css');
      }
      if (fs.existsSync('dist/index.d.mts')) {
        fs.copyFileSync('dist/index.d.mts', 'dist/index.d.ts');
      }
    } catch (e) {
      console.error('Error copying artifact aliases:', e);
    }
  },
});
