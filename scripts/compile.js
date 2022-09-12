import colors from 'ansi-colors'
import { execSync } from 'child_process'
import path from 'path'
import { exitWithError, optionExists } from './util.js'

const baseCommand = `npx tsc -p ${path.join(process.cwd(), 'tsconfig.json')}`

const compileESM = optionExists(/^--esm|-e$/i)
const genTypes = optionExists(/^--types|--type|-t$/i)

const noGenerating = !compileESM && !genTypes
if (noGenerating) exitWithError('Nothing to generate, exiting')

if (compileESM) {
    console.log(colors.cyanBright('Compiling for ESM...'))
    execSync(`${baseCommand} --outDir dist --module esnext`)
}

if (genTypes) {
    console.log(colors.cyanBright('Generating typings...'))
    execSync(`${baseCommand} --declaration --emitDeclarationOnly --declarationDir dist/types`)
}
