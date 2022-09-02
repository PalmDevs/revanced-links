# Revanced Download Links
A library to fetch latest ReVanced essentials and scrape app packages supported by ReVanced from APKMirror.  
**THIS MODULE ONLY SUPPORTS ESM!** You could try compiling this to CommonJS yourself. There will be an official support soon.

## Getting started
Head to your terminal and install the package
```sh
npm i https://github.com/PalmDevs/revanced-download-links
```
Here's an example snippet to get latest essentials for ReVanced app building.  
If you want the full documentation, you can go to [this section](DOCUMENTATION.md).
```js
import RDL, { App } from 'revanced-download-links'

// Creates a new instance of RDL
// All the options are optional
const rdl = new RDL({
    appFetcherSettings: {
        arch: '(device arch)'
    },
    gitHubSettings: {
        apiKey: 'secret123',
        dataPerPage: 10,
    }
})

// As easy as that, now just use it!
const { patches, integrations, cli } = await rdl.revanced.fetchLatestRelease()
const latestYouTubeAPK = await rdl.packages.fetchLatestRelease(App.YouTube)

// Do something with the URLs
console.log('Patches assets:', patches)
console.log('Integration assets:', integrations)
console.log('CLI assets:', cli)
console.log('Latest YouTube package:', latestYouTubeAPK)
```