import packageName from 'depcheck-package-name';
import endent from 'endent';

export default endent`
  import vue from '${packageName`@vitejs/plugin-vue`}';
  import dts from '${packageName`vite-plugin-dts`}';
  import { defineConfig } from 'vite';

  export default defineConfig({
    build: {
      lib: {
        entry: 'entry.ts',
        fileName: format => \`index.\${format === 'iife' ? 'min' : 'esm'}.js\`,
        formats: ['es', 'iife'],
        name: 'Lib',
      },
      rollupOptions: { external: ['vue'], output: { globals: { vue: 'Vue' } } },
    },
    plugins: [vue(), dts()],
  });\n
`;
