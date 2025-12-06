import { readPackageSync } from 'read-pkg'

export default ({ cwd = '.' }: { cwd?: string } = {}) => readPackageSync({ cwd }).name
