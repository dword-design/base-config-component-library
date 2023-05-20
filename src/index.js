import componentConfig from '@dword-design/base-config-component'
import { outputFile, remove } from 'fs-extra'
import P from 'path'
import { build } from 'vite'

import getEntry from './get-entry.js'
import viteConfig from './vite-config.js'

export default config => ({
  ...componentConfig(config),
  commands: {
    ...componentConfig.commands,
    prepublishOnly: async (options = {}) => {
      options = { log: true, ...options }
      try {
        await outputFile(P.join('src', 'entry.js'), getEntry())
        await build({
          ...viteConfig,
          ...(!options.log && { logLevel: 'warn' }),
        })
      } finally {
        await remove(P.join('src', 'entry.js'))
      }
    },
  },
})
