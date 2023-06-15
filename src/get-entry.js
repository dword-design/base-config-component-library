import { endent } from '@dword-design/functions'

import getLibraryName from './get-library-name.js'

export default () => {
  const libraryName = getLibraryName()

  return endent`
    import * as components from './index.js'

    const library = {
      install: app => {
        for (const [componentName, component] of Object.entries(components)) {
          app.component(componentName, component)
        }
      },
    }

    if (typeof window !== 'undefined') {
      window.${libraryName} = library
      for (const [componentName, component] of Object.entries(components)) {
        window[componentName] = component
      }
    }

    export default library

    export * from '.'
  `
}
