import { defineConfig } from 'vite';
import istanbul from 'vite-plugin-istanbul';

// tell vite how to use nyc for code coverage instrumentation

export default defineConfig({
  build: { sourcemap: true },
  plugins: [
    istanbul({
      include: ['src/**/*'],
      exclude: ['node_modules'],
      requireEnv: false,
    }),
  ],
});