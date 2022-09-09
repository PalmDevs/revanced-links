import { APKMirrorScraper } from './dist/esm/index.js'

const aps = new APKMirrorScraper({
    arch: 'arm64-v8a'
})

console.log(await aps.fetchDownload('google-inc/youtube', '17.35.35'))