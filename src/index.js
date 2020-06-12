import nodeConfig from '@dword-design/base-config-node'
import depcheckConfig from '@dword-design/depcheck-config-vue'
import lint from './lint'

export default {
  ...nodeConfig,
  depcheckConfig,
  npmPublish: true,
  useJobMatrix: true,
  lint,
}
