import { expect } from 'expect'
import { test } from 'uvu'
import { App, AppPackageScraper } from '../src/index.js'

const apf = new AppPackageScraper({
    arch: 'arm64-v8a'
})

const versions = await apf.fetchVersions(App.YouTube)
test('versions', () => expect(versions.length).toBeGreaterThan(0))
test('should not have alpha version', () => expect(versions.every(version => !version.alpha)).toBe(true))

test.run()