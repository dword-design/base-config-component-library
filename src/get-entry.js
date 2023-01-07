import { endent } from '@dword-design/functions'

import getLibraryName from './get-library-name.js'

export default () => {
  const libraryName = getLibraryName()

  return endent`
    import * as components from '.'

    const install = app => {
      if (install.installed) return;
      install.installed = true;
      Object.entries(components).forEach(([componentName, component]) => {
        app.component(componentName, component);
      });
    };

    const library = { install }

    if (typeof window !== 'undefined') {
      window.${libraryName} = library
      Object.entries(components).forEach(([componentName, component]) => {
        window[componentName] = component
      }
    }

    export default library

    export * from '.'
  `
}
