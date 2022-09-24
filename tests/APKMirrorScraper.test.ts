import { expect } from 'expect'
import { test } from 'uvu'
import { APKMirrorScraper } from '../src/index.js'

test('should validate options correctly', () => {
    expect(() => {
        ['hi', 1, true, [], {}].forEach((arch) => 
            new APKMirrorScraper({
                // @ts-expect-error: Test validators
                arch
            })
        )
    }).toThrow(Error)
})

const ams = new APKMirrorScraper({
    arch: 'arm64-v8a'
})

// * I chose Google Opinion Rewards because it has the weirdest version names ever...

test('should fetch versions correctly', async () => {
    const versions = await ams.fetchVersions('google-inc/google-opinion-rewards')
    expect(versions.length).toBeGreaterThan(0)
    expect(versions.some(ver => ver.title.includes('2022082901'))).toBe(true)
})

test('should default to fallback arch correctly', async () => {
    const url = await ams.fetchDownload('etermax/trivia-crack', '3.181.1')
    expect(typeof url).toBe('string')
})

test('should fetch downloads correctly', async () => {
    const url = await ams.fetchDownload('google-inc/google-opinion-rewards', '2022082901')
    expect(url).toMatch(/https:\/\/apkmirror.com\/wp-content\/themes\/APKMirror\/download.php\?id=\d+&key=[a-z0-9]+/)
})

test.run()