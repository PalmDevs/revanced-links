import { App, AppPackageFetcher } from '../index.js'

jest.setTimeout(15000)

const apf = new AppPackageFetcher({
    arch: 'arm64-v8a'
})

describe('should fetch versions correctly for YouTube', () => {
    const versions = apf.fetchVersions(App.YouTube)
    it('should have at least one version', async () => expect((await versions).length).toBeGreaterThan(0))
    it('should not have alpha version', async () => expect(!(await versions).every(version => version.alpha)).toBe(true))
})