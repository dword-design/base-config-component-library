import { Base } from '@dword-design/base'
import endent from 'endent';
import { execaCommand } from 'execa'
import fileUrl from 'file-url'
import fs from 'fs-extra'
import nuxtDevReady from 'nuxt-dev-ready'
import outputFiles from 'output-files'
import kill from 'tree-kill-promise'
import { test, expect } from '@playwright/test';
import pathLib, { resolve } from 'node:path';
import getPort from 'get-port';

import self from '.'
import { vueCdnScript } from './variables'

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
      }
    }
  })

  const base = new Base(
    { name: '../../../../src' },
    { cwd: pathLib.join(cwd, 'node_modules', 'tmp-component-library') },
  );

  await base.prepare();
  await base.run('prepublishOnly');
  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', { env: { PORT: String(port), NODE_ENV: '' }, reject: false, cwd, stdio: 'inherit' });
  try {
    await nuxtDevReady(port)
    await page.goto(`http://localhost:${port}`)
    await Promise.all([
      expect(page.locator('.tmp-component-library .foo')).toBeAttached(),
      expect(page.locator('.tmp-component-library .bar')).toBeAttached(),
    ])
  } finally {
    await kill(nuxt.pid!)
  }
});

/*export default tester(
  {
    plugin: async () => {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <div class="tmp-component-library">
              <component1 />
              <component2 />
            </div>
          </template>
        `,
        'plugins/plugin.js': endent`
          import TmpComponentLibrary from '../../tmp-component-library'

          export default defineNuxtPlugin(nuxtApp => nuxtApp.vueApp.use(TmpComponentLibrary))
        `,
      })

      const nuxt = execaCommand('nuxt dev')

      const browser = await puppeteer.launch()

      const page = await browser.newPage()
      try {
        await nuxtDevReady()
        await page.goto('http://localhost:3000')

        const component = await page.waitForSelector('.tmp-component-library')
        expect(await component.evaluate(el => el.innerText)).toEqual(
          'Hello world\nHello others',
        )
      } finally {
        await browser.close()
        await kill(nuxt.pid)
      }
    },
    script: async () => {
      await fs.outputFile(
        'index.html',
        endent`
          <body>
            ${vueCdnScript}
            <script src="../tmp-component-library/dist/index.min.js"></script>

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
      )

      const browser = await puppeteer.launch()

      const page = await browser.newPage()
      try {
        await page.goto(fileUrl('index.html'))

        const component = await page.waitForSelector('.tmp-component-library')
        expect(await component.evaluate(el => el.innerText)).toEqual(
          'Hello world\nHello others',
        )
      } finally {
        await browser.close()
      }
    },
  },
)*/
