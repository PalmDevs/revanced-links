# ReVanced Links
A library to fetch latest ReVanced essentials and scrape app packages supported by ReVanced from APKMirror.

<details><summary><strong>Table of contents</strong></summary>

- [ReVanced Links](#revanced-links)
  - [Features](#features)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
    - [Get essentials from GitHub](#get-essentials-from-github)
    - [Get YouTube and YouTube Music downloads](#get-youtube-and-youtube-music-downloads)
    - [Scrape unrelated app packages (BETA)](#scrape-unrelated-app-packages-beta)
  - [Contribute](#contribute)
    - [Setting up the environment](#setting-up-the-environment)
    - [Scripts](#scripts)
    - [You're ready!](#youre-ready)
  - [Discussions](#discussions)

</details>

## Features
 - Feature-rich
 - Fast and efficient
 - Object-oriented
 - **Supports both ESM and CJS**
 - **ALL** Promise-based
 - [Documentation](https://palmdevs.github.io/revanced-links)

## Installation
Head to your terminal and install the package
```sh
npm install revanced-links
# or if you use yarn
yarn add revanced-links
```

## Getting Started
Here are some example snippets for you to get started.  
If you want the full documentation, please refer to [here](https://palmdevs.github.io/revanced-links/) instead.

### Get essentials from GitHub
```js
import { ReVancedLinks, App } from 'revanced-links'

// All these options are optional
const rl = new ReVancedLinks({
    appFetcherSettings: {
        arch: 'arm64-v8a'
    },
    gitHubSettings: {
        apiKey: 'secret123',
        dataPerPage: 10,
    }
})

const { patches, integrations, cli } = await rl.revanced.fetchLatestReleases()
const microG = await rl.microg.fetchLatestRelease()

// Do something with the URLs below...
```

### Get YouTube and YouTube Music downloads
```js
import { AppPackageFetcher, App } from 'revanced-links'

const apf = new AppPackageFetcher({
    arch: 'arm64-v8a'
})

const yt = await apf.fetchLatestStableRelease(App.YouTube)
const ytm = await apf.fetchLatestStableRelease(App.YouTubeMusic)

// ...
```

### Scrape unrelated app packages (BETA)
```js
import { APKMirrorScraper } from 'revanced-links'

const ams = new APKMirrorScraper({
    arch: 'arm64-v8a'
})

// WARNING: This fetches using app routes, no intended support for app categories yet
const url = await ams.fetchDownload('google-inc/google-opinion-rewards', '2022082901')

// ...
```

## Contribute
To contribute, fork the `main` branch and then make a pull request.  
Please note that some pull requests may not be merged.

### Setting up the environment
Make sure these are installed:
 - **Node.js Latest (18.x.x as of today)**
 - **Git**
 - IDE
 - GitHub Desktop (if you need it)

To clone this repository, you could use GitHub Desktop, or `git` in command-line
```sh
git clone https://github.com/PalmDevs/revanced-links
```
Then you'll need to install the development libraries
```sh
npm install
# or if you use yarn
yarn install
```

### Scripts
When there are scripts, there are productivity. Here's a list of scripts you should know about.  
**Note**: Anything ending in `:nc` means no-cleanup, this usually results in junk files and possibly weird errors.
  - `watch`, `start`, `start:nc`: Starts the development environment, your code will automatically compile on save
  - `compile`, `compile:nc`: Only compiles the code, doesn't make documentation
  - `docs`, `docs:nc`: Only makes documentation, doesn't compile code
  - `build`, `build:nc`: Builds both documentation and distribution
  - `cleanup`: This script is ran by other scripts, but this deletes `dist/` and `docs/`
  - `test`: Just tests the whole library

### You're ready!
You're ready to be cool like a hackerman. 😎  
Now you can brag to your non-programmer friends about it!

## Discussions
We have a Discord server for [NRVM builder](https://github.com/PalmDevs/nrvm) which is closely related to this project.  
You could join it with this [link](https://discord.gg/mHq2bTfeSa), there is a channel called **#revanced-links-discussions** specifically made for this purpose.
