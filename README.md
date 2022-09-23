# ReVanced Links
A library to fetch latest ReVanced essentials and scrape any app packages from APKMirror.  
- **👋 Hey there! Please read [this section](#cons) before using this library!**

<details><summary><strong>Table of contents</strong></summary>

- [ReVanced Links](#revanced-links)
  - [Features](#features)
  - [Cons](#cons)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
    - [Get essentials from GitHub](#get-essentials-from-github)
    - [Get YouTube and YouTube Music downloads](#get-youtube-and-youtube-music-downloads)
    - [Scrape unrelated app packages (BETA)](#scrape-unrelated-app-packages-beta)
  - [Contribute](#contribute)
    - [Setting up the environment](#setting-up-the-environment)
      - [Update your environment variables](#update-your-environment-variables)
    - [Scripts](#scripts)
    - [You're ready!](#youre-ready)
  - [Discussions](#discussions)

</details>

## Features
 - Feature-rich
 - Fast and efficient
 - Object-oriented
 - **ALL** Promise-based
 - [Documentation](https://palmdevs.github.io/revanced-links)

## Cons
 - Only supports ESM, due to `node-fetch@3` dropping support for CommonJS

## Installation
Head to your terminal and install the package
```sh
npm install revanced-links
# or if you use yarn
yarn add revanced-links
```

## Getting Started
Here are some examples for you to get started.  
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

const { patches, integrations, cli } = await rl.revanced.fetchLatest()
const microG = await rl.microg.fetchLatest()

// Do something with the URLs below...
```

### Get YouTube and YouTube Music downloads
```js
import { AppPackageScraper, App } from 'revanced-links'

const aps = new AppPackageScraper({
    arch: 'arm64-v8a'
})

const yt = await aps.fetchLatestStableRelease(App.YouTube)
const ytm = await aps.fetchLatestStableRelease(App.YouTubeMusic)

// ...
```

### Scrape unrelated app packages (BETA)
```js
import { APKMirrorScraper } from 'revanced-links'

const ams = new APKMirrorScraper({
    arch: 'arm64-v8a'
})

const url = await ams.fetchDownload('google-inc/google-opinion-rewards', '2022082901')

// ...
```

## Contribute
To contribute, fork the `main` branch *(and ONLY the `main` branch)* and then make a pull request with modifications.  
Please note that some pull requests may not be merged.

### Setting up the environment
**BOLD** means required.

Make sure these are installed:
 - **Node.js Latest (v18+ as of today)**
 - **Git**
 - IDE
 - GitHub Desktop

To clone this repository, you could use GitHub Desktop, or `git` in command-line.
```sh
git clone https://github.com/PalmDevs/revanced-links
```
Then you'll need to install the development libraries
```sh
npm install
# or if you use yarn
yarn install
```
#### Update your environment variables
See the `.env.example` file for more information.

### Scripts
There are scripts! Here's a list of scripts you should know about.  
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
You could join it with this [link](https://discord.gg/mHq2bTfeSa), there is a forum channel called **#rvl-lib-forums** specifically made for this purpose.
