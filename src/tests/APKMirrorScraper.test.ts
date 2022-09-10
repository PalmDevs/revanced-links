import { APKMirrorScraper } from '../index.js'

jest.setTimeout(15000)

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

test('should fetch versions correctly', async () => {
    const versions = await ams.fetchVersionsFromAppRoute('google-inc/youtube')
    expect(versions.length).toBeGreaterThan(0)
    expect(versions.some(ver => ver.title.includes('17.35.35'))).toBe(true)
})

test('should fetch downloads correctly', async () => {
    const url = await ams.fetchDownload('google-inc/youtube', '17.35.35')
    expect(url).toMatch(/https:\/\/apkmirror.com\/wp-content\/themes\/APKMirror\/download.php\?id=\d+&key=[a-z0-9]+/)
})