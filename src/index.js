import componentConfig from '@dword-design/base-config-component'
import execa from 'execa'
import { outputFile, remove } from 'fs-extra'
import getPackageName from 'get-package-name'
import P from 'path'

import entry from './entry'

export default {
  ...componentConfig,
  commands: {
    ...componentConfig.commands,
    prepublishOnly: async () => {
      try {
        await outputFile(P.join('src', 'entry.js'), entry)
        await remove('dist')
        await execa(
          getPackageName(require.resolve('rollup')),
          [
            '--config',
            require.resolve('@dword-design/rollup-config-component'),
          ],
          {
            env: { NODE_ENV: 'production', stdio: 'inherit' },
          }
        )
      } finally {
        await remove(P.join('src', 'entry.js'))
      }
    },
  },
}
