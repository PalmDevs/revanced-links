// * Tests scripts from README.md

import { expect } from 'expect'
import { test } from 'uvu'
import { ReVancedLinks, App, AppPackageFetcher, APKMirrorScraper } from '../src/index.js'

test('fetches latest essentials for patching YouTube', async () => {
    const rl = new ReVancedLinks({
        appFetcherSettings: {
            arch: 'arm64-v8a'
        },
        gitHubSettings: {
            apiKey: process.env.GITHUB_KEY,
            dataPerPage: 10,
        }
    })

    const { patches, integrations, cli } = await rl.revanced.fetchLatestReleases()
    const youtube = await rl.packages.fetchLatestRelease(App.YouTube)

    expect([ patches, integrations, cli ].every(
        (links) => Array.isArray(links) ? 
            links.every(url => typeof url === 'string') :
            Object.keys(links).every(key => typeof links[key] === 'string')
    )).toBe(true)

    expect(typeof youtube).toBe('string')
})

test('scrapes patchable apps', async () => {
    const apf = new AppPackageFetcher({
        arch: 'arm64-v8a'
    })

    const appIDs = [App.YouTube, App.YouTubeMusic, App.Twitter, App.Reddit, App.WarnWetter, App.TikTok]
    const linkEntries = await Promise.all(appIDs.map(
        async (id) => {
            return [App[id], await apf.fetchLatestRelease(id)]
        }
    ))

    const links = Object.fromEntries(linkEntries) as { [K in Exclude<keyof typeof App, number>]: string }

    expect(Object.entries(links).every(([ key, value]) => typeof App[key] === 'number' && typeof value === 'string'))
})

test('scrapes unrelated packages', async () => {
    const ams = new APKMirrorScraper({
        arch: 'arm64-v8a'
    })

    const downloadURL = await ams.fetchDownload('google-inc/google-opinion-rewards', '2022082901')
    
    expect(typeof downloadURL).toBe('string')
})

test.run()