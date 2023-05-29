import vue from '@vitejs/plugin-vue'
import P from 'path'

export default {
  build: {
    lib: {
      entry: P.join('src', 'entry.js'),
      fileName: format => `index.${format === 'iife' ? 'min' : 'esm'}.js`,
      formats: ['es', 'iife'],
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
