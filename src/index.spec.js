import { Base } from '@dword-design/base'
import chdir from '@dword-design/chdir'
import { endent } from '@dword-design/functions'
import puppeteer from '@dword-design/puppeteer'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import fileUrl from 'file-url'
import fs from 'fs-extra'
import { Builder, Nuxt } from 'nuxt'
import outputFiles from 'output-files'

import self from './index.js'
import { vueCdnScript } from './variables.js'

export default tester(
  {
    components: async () => {
      await outputFiles({
        'pages/index.vue': endent`
          <template>
            <div class="tmp-component-library">
              <component1 />
              <component2 />
            </div>
          </template>

          <script>
          import { Component1, Component2 } from '../../tmp-component-library'

          export default {
            components: {
              Component1,
              Component2,
            },
          }
          </script>
        `,
      })

      const nuxt = new Nuxt()
      await new Builder(nuxt).build()
      await nuxt.listen()

      const browser = await puppeteer.launch()

      const page = await browser.newPage()
      try {
        await page.goto('http://localhost:3000')

        const component = await page.waitForSelector('.tmp-component-library')
        expect(await component.evaluate(el => el.innerText)).toEqual(
          'Hello world\nHello others',
        )
      } finally {
        await browser.close()
        await nuxt.close()
      }
    },
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
          import Vue from 'vue'
          import TmpComponentLibrary from '../../tmp-component-library'

          Vue.use(TmpComponentLibrary)
        `,
      })

      const nuxt = new Nuxt({ plugins: ['~/plugins/plugin.js'] })
      await new Builder(nuxt).build()
      await nuxt.listen()

      const browser = await puppeteer.launch()

      const page = await browser.newPage()
      try {
        await page.goto('http://localhost:3000')

        const component = await page.waitForSelector('.tmp-component-library')
        expect(await component.evaluate(el => el.innerText)).toEqual(
          'Hello world\nHello others',
        )
      } finally {
        await browser.close()
        await nuxt.close()
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
              new Vue({
                el: '#app',
                template: \`
                  <div class="tmp-component-library">
                    <component1 />
                    <component2 />
                  </div>
                \`
              })
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
  [
    {
      after: () => fs.remove('tmp-component-library'),
      before: async () => {
        await fs.mkdir('tmp-component-library')
        await chdir('tmp-component-library', async () => {
          await outputFiles({
            'package.json': JSON.stringify({ name: 'tmp-component-library' }),
            src: {
              'component1.vue': endent`
                <script>
                export default {
                  render: () => <div>Hello world</div>
                }
                </script>
              `,
              'component2.vue': endent`
                <script>
                export default {
                  render: () => <div>Hello others</div>
                }
                </script>
              `,
              'index.js': endent`
                export { default as Component1 } from './component1.vue'

                export { default as Component2 } from './component2.vue'
              `,
            },
          })
          await new Base(self).prepare()
          await self().commands.prepublishOnly()
        })
      },
    },
    testerPluginTmpDir(),
  ],
)
