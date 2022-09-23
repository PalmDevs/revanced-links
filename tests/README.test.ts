// * Tests scripts from README.md

import { expect } from 'expect'
import { test } from 'uvu'
import { ReVancedLinks, App, AppPackageScraper, APKMirrorScraper } from '../src/index.js'
import { isString } from '../src/util/Validator.js'

test('should get essentials from GitHub correctly', async () => {
    const rl = new ReVancedLinks({
        appFetcherSettings: {
            arch: 'arm64-v8a'
        },
        gitHubSettings: {
            apiKey: process.env.GITHUB_KEY,
            dataPerPage: 10,
        }
    })

    const { patches, integrations, cli } = await rl.revanced.fetchLatest()
    const microG = await rl.microg.fetchLatest()

    expect([ patches, integrations, cli, microG ].every(
        (links) => Array.isArray(links.assets) ?
            links.assets.every(url => isString(url))
        :   Object.values(links.assets).every(url => isString(url))
    )).toBe(true)
})

test('should get YouTube and YouTube Music downloads correctly', async () => {
    const apf = new AppPackageScraper({
        arch: 'arm64-v8a'
    })

    const yt = await apf.fetchLatestStableRelease(App.YouTube)
    const ytm = await apf.fetchLatestStableRelease(App.YouTubeMusic)

    expect([ yt, ytm ].every(url => typeof url === 'string')).toBe(true)
})

test('should scrape unrelated packages correctly', async () => {
    const ams = new APKMirrorScraper({
        arch: 'arm64-v8a'
    })

    const downloadURL = await ams.fetchDownload('google-inc/google-opinion-rewards', '2022082901')
    
    expect(typeof downloadURL).toBe('string')
})

test.run()