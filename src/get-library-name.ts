import { pascalCase } from 'change-case';
import parsePackagejsonName from 'parse-packagejson-name';

import getPackageName from './get-package-name';

export default ({ cwd = '.' }: { cwd?: string } = {}) => {
  const packageName = getPackageName({ cwd });
  return pascalCase(parsePackagejsonName(packageName).fullName);
};
