import colors from 'ansi-colors'
import fs from 'fs'
import path from 'path'
import { exitWithError, optionExists } from './_checkEnv.js'

const distPath = path.join(process.cwd(), 'dist')
const docsPath = path.join(process.cwd(), 'docs')

const cleanDist = optionExists(/^--dist|-c$/i)
const cleanDocs = optionExists(/^--docs|-d$/i)

if (!cleanDist && !cleanDocs) exitWithError('No options specified, nothing to clean')

if (cleanDist) {
    if (fs.existsSync(distPath)) {
        console.log(colors.cyanBright('Cleaning up distribution...'))
        try {
            fs.rmSync(distPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 3 })
        } catch (err) {
            console.log(colors.redBright('Distribution cleaning failed'))
            console.log(colors.red(err))
            process.exit(1)
        }
    } else console.log(colors.yellow('The distribution does not seem to exist, ignoring'))
}

if (cleanDocs) {
    if (fs.existsSync(docsPath)) {
        console.log(colors.cyanBright('Cleaning up documentation build...'))
        try {
            fs.rmSync(docsPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 3 })
        } catch (err) {
            console.log(colors.redBright('Documentation build cleaning failed'))
            console.log(colors.red(err))
            process.exit(1)
        }
    } else console.log(colors.yellow('The documentation build does not seem to exist, ignoring'))
}