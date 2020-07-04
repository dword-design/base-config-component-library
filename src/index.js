import nodeConfig from '@dword-design/base-config-node'
import depcheckParserSass from '@dword-design/depcheck-parser-sass'
import depcheckParserVue from 'depcheck-parser-vue'

import lint from './lint'

export default {
  ...nodeConfig,
  depcheckConfig: {
    parsers: {
      '*.scss': depcheckParserSass,
      '*.vue': depcheckParserVue,
    },
  },
  lint,
  npmPublish: true,
  useJobMatrix: true,
}
