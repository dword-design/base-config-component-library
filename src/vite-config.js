import vue from '@vitejs/plugin-vue'
import P from 'path'

export default {
  build: {
    lib: {
      entry: P.join('src', 'entry.js'),
      fileName: format => {
        const postfix = (() => {
          switch (format) {
            case 'umd':
              return 'ssr'
            case 'iife':
              return 'min'
            default:
              return 'esm'
          }
        })()

        return `index${postfix ? `.${postfix}` : ''}.js`
      },
      formats: ['esm', 'umd', 'iife'],
      name: 'Lib',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  plugins: [vue()],
}
