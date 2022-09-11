// * Tests scripts from README.md

import { expect } from 'expect'
import { test } from 'uvu'
import { ReVancedLinks, App, AppPackageFetcher, APKMirrorScraper } from '../src/index.js'

test('get essentials from GitHub', async () => {
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

    expect([ patches, integrations, cli ].every(
        (links) => Array.isArray(links) ? 
            links.every(url => typeof url === 'string') :
            Object.keys(links).every(key => typeof links[key] === 'string')
    )).toBe(true)

    expect(typeof microG).toBe('string')
})

test('get YouTube and YouTube Music downloads', async () => {
    const apf = new AppPackageFetcher({
        arch: 'arm64-v8a'
    })

    const yt = await apf.fetchLatestStableRelease(App.YouTube)
    const ytm = await apf.fetchLatestStableRelease(App.YouTubeMusic)

    expect([ yt, ytm ].every(url => typeof url === 'string')).toBe(true)
})

test('scrapes unrelated packages', async () => {
    const ams = new APKMirrorScraper({
        arch: 'arm64-v8a'
    })

    const downloadURL = await ams.fetchDownload('google-inc/google-opinion-rewards', '2022082901')
    
    expect(typeof downloadURL).toBe('string')
})

test.run()