import colors from 'ansi-colors'
import { execSync } from 'child_process'
import { optionExists } from './_checkEnv.js'

if (optionExists(/^--cleanup|--clean|--reset|--eject|-r$/i)) execSync('npm run cleanup --docs')
console.log(colors.cyanBright('Generating documentation...'))
execSync('npx typedoc --out docs src/index.ts')