import pathLib from 'node:path';

import { Base } from '@dword-design/base';
import { expect, test } from '@playwright/test';
import endent from 'endent';
import { execaCommand } from 'execa';
import fileUrl from 'file-url';
import getPort from 'get-port';
import nuxtDevReady from 'nuxt-dev-ready';
import outputFiles from 'output-files';
import kill from 'tree-kill-promise';

import { vueCdnScript } from './variables';

test('components', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'app/pages/index.vue': endent`
      <template>
        <div class="tmp-component-library">
          <component1 />
          <component2 />
        </div>
      </template>

      <script setup lang="ts">
      import { Component1, Component2 } from 'tmp-component-library';
      </script>
    `,
    'node_modules/tmp-component-library': {
      'package.json': JSON.stringify({ name: 'tmp-component-library' }),
      src: {
        'component1.vue': endent`
          <template>
            <div class="foo" />
          </template>
        `,
        'component2.vue': endent`
          <template>
            <div class="bar" />
          </template>
        `,
        'index.ts': endent`
          export { default as Component1 } from './component1.vue'

          export { default as Component2 } from './component2.vue'
        `,
      },
    },
  });

  const base = new Base(
    { name: '../../../../src' },
    { cwd: pathLib.join(cwd, 'node_modules', 'tmp-component-library') },
  );

  await base.prepare();
  await base.run('prepublishOnly');
  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: String(port) },
    reject: false,
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}`);

    await Promise.all([
      expect(page.locator('.tmp-component-library .foo')).toBeAttached(),
      expect(page.locator('.tmp-component-library .bar')).toBeAttached(),
    ]);
  } finally {
    await kill(nuxt.pid!);
  }
});

test('plugin', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    app: {
      'pages/index.vue': endent`
        <template>
          <div class="tmp-component-library">
            <component1 />
            <component2 />
          </div>
        </template>
      `,
      'plugins/plugin.js': endent`
        import TmpComponentLibrary from 'tmp-component-library';

        export default defineNuxtPlugin(nuxtApp => nuxtApp.vueApp.use(TmpComponentLibrary));
      `,
    },
    'node_modules/tmp-component-library': {
      'package.json': JSON.stringify({ name: 'tmp-component-library' }),
      src: {
        'component1.vue': endent`
          <template>
            <div class="foo" />
          </template>
        `,
        'component2.vue': endent`
          <template>
            <div class="bar" />
          </template>
        `,
        'index.ts': endent`
          export { default as Component1 } from './component1.vue'

          export { default as Component2 } from './component2.vue'
        `,
      },
    },
  });

  const base = new Base(
    { name: '../../../../src' },
    { cwd: pathLib.join(cwd, 'node_modules', 'tmp-component-library') },
  );

  await base.prepare();
  await base.run('prepublishOnly');
  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: String(port) },
    reject: false,
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}`);

    await Promise.all([
      expect(page.locator('.tmp-component-library .foo')).toBeAttached(),
      expect(page.locator('.tmp-component-library .bar')).toBeAttached(),
    ]);
  } finally {
    await kill(nuxt.pid!);
  }
});

test('script', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'index.html': endent`
      <body>
        ${vueCdnScript}
        <script src="./node_modules/tmp-component-library/dist/index.min.js"></script>

        <div id="app"></div>

        <script>
          const app = Vue.createApp({
            el: '#app',
            template: \`
              <div class="tmp-component-library">
                <component1 />
                <component2 />
              </div>
            \`
          })
          app.use(TmpComponentLibrary)
          app.mount('#app')
        </script>
      </body>
    `,
    'node_modules/tmp-component-library': {
      'package.json': JSON.stringify({ name: 'tmp-component-library' }),
      src: {
        'component1.vue': endent`
          <template>
            <div class="foo" />
          </template>
        `,
        'component2.vue': endent`
          <template>
            <div class="bar" />
          </template>
        `,
        'index.ts': endent`
          export { default as Component1 } from './component1.vue'

          export { default as Component2 } from './component2.vue'
        `,
      },
    },
  });

  const base = new Base(
    { name: '../../../../src' },
    { cwd: pathLib.join(cwd, 'node_modules', 'tmp-component-library') },
  );

  await base.prepare();
  await base.run('prepublishOnly');
  await page.goto(fileUrl(pathLib.join(cwd, 'index.html')));

  await Promise.all([
    expect(page.locator('.tmp-component-library .foo')).toBeAttached(),
    expect(page.locator('.tmp-component-library .bar')).toBeAttached(),
  ]);
});
