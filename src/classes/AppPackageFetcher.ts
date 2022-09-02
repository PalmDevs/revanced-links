// * This is a wrapper class for AppPackageScraper

import CustomErrorConstructor from '../util/CustomErrorConstructor'
import AppPackageScraper, { AppPackageScraperApp as App, AppPackageScraperAppVersion, ArchResolvable } from './AppPackageScraper'

// * So people don't go too low level with it
export default class AppPackageFetcher {
    private readonly _options: AppPackageFetcherOptions
    private readonly _scraper: AppPackageScraper

    constructor(options: AppPackageFetcherOptions = {}) {
        this._options = options
        this._scraper = new AppPackageScraper(this._options)
    }

    async fetchLatestVersion(app: App) {
        const versions = await this._fetchv(app)
        return versions.at(-1)
    }

    async fetchLatestStableVersion(app: App) {
        const versions = await this._fetchv(app)
        return versions.find((version) => !version.beta && !version.alpha)!
    }

    async fetchLatestRelease(app: App) {
        return await this._fetchd(app, await this._fetchf(app))
    }

    async fetchLatestStableRelease(app: App) {
        return await this._fetchd(app, await this._fetchf(app, false))
    }

    async fetchVersions(app: App) {
        return await this._scraper.fetchVersions(app)
    }

    async fetchDownload(app: App, version: string) {
        return await this._scraper.fetchDownload(app, version, this._options.arch)
    }

    private async _fetchf(app: App, latest: boolean = true) {
        const versionInfo = await this[latest ? 'fetchLatestVersion' : 'fetchLatestStableVersion'](app)
        if (!versionInfo) throw new AppPackageFetcherError('NO_VERSIONS_AVAILABLE')
        return versionInfo
    }

    private _fetchd(app: App, versionInfo: AppPackageScraperAppVersion) {
        return this._scraper.fetchDownload(app, versionInfo.version, this._options.arch)
    }

    private _fetchv(app: App) {
        return this._scraper.fetchVersions(app) 
    }
}

export { App as App, AppPackageScraperAppVersion as AppVersion, ArchResolvable }

export const AppPackageFetcherErrorMessages = {
    'NO_VERSIONS_AVAILABLE': 'No versions available'
} as const

export const AppPackageFetcherError = new CustomErrorConstructor(Error, AppPackageFetcherErrorMessages).error

export interface AppPackageFetcherOptions {
    arch?: ArchResolvable
}