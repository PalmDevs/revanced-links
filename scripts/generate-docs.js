import colors from 'ansi-colors'
import { execSync } from 'child_process'

console.log(colors.cyanBright('Generating documentation...'))
execSync('npx typedoc --out docs src/index.ts')