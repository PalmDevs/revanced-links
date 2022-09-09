import colors from 'ansi-colors'
import { spawn } from 'child_process'
import path from 'path'

const endsWithSlashScripts = new RegExp(`${path.delimiter}scripts$`)
const runningDirectly = endsWithSlashScripts.test(process.cwd())

if (runningDirectly) {
    console.log(colors.red(colors.bold(('Please do NOT run these scripts in the scripts directly!'))))
    console.log(colors.red('Use the package scripts instead, eg.'))
    console.log(colors.red(' - npm run build --cleanup\n - npm run cleanup --docs --dist'))
    process.exit(1)
}

export function optionExists(option) {
    return process.argv.some(arg => option.test(arg))
}

export function exitWithError(message) {
    console.error(colors.red(message))
    return process.exit(1)
}