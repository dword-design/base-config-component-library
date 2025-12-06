import getComponentConfig from '@dword-design/base-config-component'
import fs from 'fs-extra'
import pathLib from 'path'
import { defineBaseConfig, type Base, type Config } from '@dword-design/base';

import getEntry from './get-entry'

export default defineBaseConfig(function (this: Base, config: Config) {
  const componentConfig = getComponentConfig.call(this, config);
  return {
    ...componentConfig,
    prepare: async () => {
      await componentConfig.prepare();
      await fs.outputFile(pathLib.join(this.cwd, 'entry.ts'), getEntry({ cwd: this.cwd }));
    }
  };
});
