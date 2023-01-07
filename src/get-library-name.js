import parsePackagejsonName from 'parse-packagejson-name'
import { pascalCase } from 'pascal-case'

import getPackageName from './get-package-name.js'

export default () => {
  const packageName = getPackageName()

  return parsePackagejsonName(packageName).fullName |> pascalCase
}
