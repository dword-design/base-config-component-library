import componentConfig from '@dword-design/base-config-component'
import packageName from 'depcheck-package-name'
import { execa } from 'execa'
import { outputFile, remove } from 'fs-extra'
import { createRequire } from 'module'
import P from 'path'

import entry from './entry.js'

const _require = createRequire(import.meta.url)

export default config => ({
  ...componentConfig(config),
  commands: {
    ...componentConfig.commands,
    prepublishOnly: async () => {
      try {
        await outputFile(P.join('src', 'entry.js'), entry)
        await remove('dist')
        await execa(
          'rollup',
          [
            '--config',
            _require.resolve(
              packageName`@dword-design/rollup-config-component`,
            ),
          ],
          {
            env: { NODE_ENV: 'production' },
            stdio: 'inherit',
          },
        )
      } finally {
        await remove(P.join('src', 'entry.js'))
      }
    },
  },
  supportedNodeVersions: [14, 16],
})
