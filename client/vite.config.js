import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [sveltekit()],
  
  resolve: {
    alias: {
        // Алиасы для Tauri модулей - перенаправляем на stub-модули в веб-сборке
        ...(process.env.TAURI_ENV_PLATFORM === undefined ? {
          '@tauri-apps/api/core': path.resolve(__dirname, './src/lib/tauri-stubs.ts'),
          '@tauri-apps/api/event': path.resolve(__dirname, './src/lib/tauri-stubs.ts'),
          '@tauri-apps/plugin-global-shortcut': path.resolve(__dirname, './src/lib/tauri-stubs.ts'),
          '@tauri-apps/plugin-notification': path.resolve(__dirname, './src/lib/tauri-stubs.ts'),
          '@tauri-apps/plugin-sql': path.resolve(__dirname, './src/lib/tauri-stubs.ts'),
          '@tauri-apps/plugin-store': path.resolve(__dirname, './src/lib/tauri-stubs.ts'),
          '@tauri-apps/plugin-window': path.resolve(__dirname, './src/lib/tauri-stubs.ts')
        } : {})
    }
  },


  // Определения для условной компиляции
  define: {
    __TAURI__: process.env.TAURI_ENV_PLATFORM !== undefined,
    __DEV__: process.env.NODE_ENV !== 'production'
  },

  // Настройки для development сервера
  server: {
    port: 3000,
    strictPort: false,
    proxy: process.env.NODE_ENV !== 'production' ? {
      // Прокси для API запросов в development режиме
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false
      }
    } : undefined
    },
  
    // Настройки сборки
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: process.env.NODE_ENV === 'production',

    rollupOptions: {
      // Внешние зависимости для Tauri сборки
      external: process.env.TAURI_ENV_PLATFORM !== undefined ? [
        '@tauri-apps/api/core',
        '@tauri-apps/api/event',
        '@tauri-apps/plugin-notification',
        '@tauri-apps/plugin-sql',
        '@tauri-apps/plugin-store',
        '@tauri-apps/plugin-window',
        '@tauri-apps/plugin-global-shortcut'
      ] : [
        // Для веб-сборки исключаем все Tauri модули
        '@tauri-apps/api/core',
        '@tauri-apps/api/event',
        '@tauri-apps/plugin-notification',
        '@tauri-apps/plugin-sql',
        '@tauri-apps/plugin-store',
        '@tauri-apps/plugin-window',
        '@tauri-apps/plugin-global-shortcut'
      ],

      output: process.env.TAURI_ENV_PLATFORM !== undefined ? {
        globals: {
          '@tauri-apps/api/core': 'tauriApiCore',
          '@tauri-apps/api/event': 'tauriApiEvent',
          '@tauri-apps/plugin-notification': 'tauriNotification',
          '@tauri-apps/plugin-sql': 'tauriSql',
          '@tauri-apps/plugin-store': 'tauriStore',
          '@tauri-apps/plugin-window': 'tauriWindow'
        }
      } : {
        // Обычная сборка для веба
        manualChunks: undefined
      }
    },

    // Target для Tauri
    target: process.env.TAURI_ENV_PLATFORM !== undefined ? 'esnext' : 'es2020'
  },

  // Оптимизации зависимостей
  optimizeDeps: {
    include: process.env.TAURI_ENV_PLATFORM !== undefined ? [] : ['svelte', 'svelte/internal', 'uuid'],
    exclude: process.env.TAURI_ENV_PLATFORM !== undefined ? [
      '@tauri-apps/api/core',
      '@tauri-apps/api/event',
      '@tauri-apps/plugin-notification',
      '@tauri-apps/plugin-sql',
      '@tauri-apps/plugin-store',
      '@tauri-apps/plugin-window',
      '@tauri-apps/plugin-global-shortcut'
    ] : [
      // Для веб-сборки исключаем все Tauri модули из оптимизации
      '@tauri-apps/api/core',
      '@tauri-apps/api/event',
      '@tauri-apps/plugin-notification',
      '@tauri-apps/plugin-sql',
      '@tauri-apps/plugin-store',
      '@tauri-apps/plugin-window',
      '@tauri-apps/plugin-global-shortcut'
    ]
  },

  // Настройки CSS
  css: {
    devSourcemap: false
  },

  // Environment variables
  envPrefix: ['VITE_', 'TAURI_'],

  // Base path для Tauri
  base: process.env.TAURI_ENV_PLATFORM !== undefined ? './' : '/'
})