import colors from 'ansi-colors'
import { execSync } from 'child_process'
import path from 'path'
import { exitWithError, optionExists } from './_checkEnv.js'

const baseCommand = `npx tsc -p ${path.join(process.cwd(), 'tsconfig.json')}`

const compileCJS = optionExists(/^--cjs|-c$/i)
const compileESM = optionExists(/^--esm|-e$/i)
const genTypes = optionExists(/^--types|--type|-t$/i)

const noGenerating = !compileCJS && !compileESM && !genTypes
const doCleanup = optionExists(/^--cleanup|--clean|--reset|--eject|-r$/i)

if (noGenerating && doCleanup) exitWithError('Please use `npm run cleanup --dist` instead to clean files')
if (noGenerating) exitWithError('Nothing to generate, exiting')

if (doCleanup) execSync('npm run cleanup --dist')

if (compileCJS) {
    console.log(colors.cyanBright('Compiling for CommonJS...'))
    execSync(`${baseCommand} --outDir dist/cjs --module commonjs`)
}

if (compileESM) {
    console.log(colors.cyanBright('Compiling for ESM...'))
    execSync(`${baseCommand} --outDir dist/esm --module esnext`)
}

if (genTypes) {
    console.log(colors.cyanBright('Generating typings...'))
    execSync(`${baseCommand} --declaration --emitDeclarationOnly --declarationDir dist/types`)
}