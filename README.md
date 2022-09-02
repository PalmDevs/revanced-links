# Revanced Download Links
A library to fetch latest ReVanced essentials and scrape app packages supported by ReVanced from APKMirror.

## Getting started
Head to your terminal and install the package
```sh
npm i https://github.com/PalmDevs/revanced-download-links
```
Here's an example snippet to get latest essentials for ReVanced app building.  
If you want the full documentation, you can go to [this section](DOCUMENTATION.md).
```js
import RDL from 'revanced-download-links'

// Creates a new instance of RDL
// All these options are optional
const rdl = new RDL({
    arch: '(device arch)',
    ghKey: '(github API key)'
})

// As easy as that, now just use it!
const { patches, integrations, cli } = await rdl.revanced.fetchLatestRelease()
const latestYouTubeAPK = await rdl.packages.fetchLatestRelease(App.YouTube)

// Do something with the links
console.log('Patches assets: ', patches)
console.log('Integration assets: ', integrations)
console.log('CLI assets: ', cli)
console.log('Latest YouTube package: ', latestYouTubeAPK)
```