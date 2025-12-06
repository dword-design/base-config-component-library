import endent from 'endent';

import getLibraryName from './get-library-name'

export default ({ cwd = '.' }: { cwd?: string } = {}) => {
  const libraryName = getLibraryName({ cwd })

  return endent`
    import type { App } from 'vue';

    import * as components from './src';

    const library = {
      install: (app: App) => {
        for (const [componentName, component] of Object.entries(components)) {
          app.component(componentName, component);
        }
      },
    };

    if (typeof globalThis !== 'undefined') {
      (globalThis as Record<string, unknown>).${libraryName} = library;
      for (const [componentName, component] of Object.entries(components)) {
        (globalThis as Record<string, unknown>)[componentName] = component;
      }
    }

    export default library;

    export * from './src';
  `
}
