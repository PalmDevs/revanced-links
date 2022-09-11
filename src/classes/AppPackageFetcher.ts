// * This is a wrapper class for AppPackageScraper
// * So people don't go too low-level with it

import CustomErrorConstructor from '../util/CustomErrorConstructor.js'
import AppPackageScraper, { AppPackageScraperApp as App } from './AppPackageScraper.js'
import type { AppPackageScraperAppVersion, ArchResolvable } from './AppPackageScraper.js'

export default class AppPackageFetcher {
    private readonly _options: AppPackageFetcherOptions
    private readonly _scraper: AppPackageScraper

    /**
     * Fetches a ReVanced-support app package download URL.
     * @param options Configurations and options
     * @example
     * import { AppPackageFetcher } from 'revanced-links'
     * 
     * const fetcher = new AppPackageFetcher({
     *     arch: 'arm64-v8a'
     * })
     */
    constructor(options: AppPackageFetcherOptions = {}) {
        this._options = options
        this._scraper = new AppPackageScraper(this._options)
    }

    /**
     * Fetches the latest version available.
     * @param app The app to fetch 
     * @returns App version data
     * @example
     * import { AppPackageFetcher, App } from 'revanced-links'
     * 
     * const fetcher = new AppPackageFetcher({ ... })
     * const version = await fetcher.fetchLatestVersion(App.YouTube)
     */
    async fetchLatestVersion(app: App) {
        const versions = await this._fetchv(app)
        return versions[1]
    }

    /**
     * Fetches the latest stable *(non-beta, non-alpha)* version available.
     * @param app The app to fetch 
     * @returns App version data
     * @example
     * import { AppPackageFetcher, App } from 'revanced-links'
     * 
     * const fetcher = new AppPackageFetcher({ ... })
     * const version = await fetcher.fetchLatestStableVersion(App.YouTube)
     */
    async fetchLatestStableVersion(app: App) {
        const versions = await this._fetchv(app)
        return versions.find((version) => !version.beta && !version.alpha)!
    }

    /**
     * Fetches a download URL for the latest version of an app package.
     * @param app The app to fetch 
     * @returns A download URL
     * @example
     * import { AppPackageFetcher, App } from 'revanced-links'
     * 
     * const fetcher = new AppPackageFetcher({ ... })
     * const url = await fetcher.fetchLatestRelease(App.YouTube)
     */
    async fetchLatestRelease(app: App, arch?: ArchResolvable) {
        return await this._fetchd(app, await this._fetchf(app), arch)
    }

    /**
     * Fetches a download URL for the latest stable *(non-beta, non-alpha)* version of an app package.
     * @param app The app to fetch 
     * @returns A download URL
     * @example
     * import { AppPackageFetcher, App } from 'revanced-links'
     * 
     * const fetcher = new AppPackageFetcher({ ... })
     * const url = await fetcher.fetchLatestStableRelease(App.YouTube)
     */
    async fetchLatestStableRelease(app: App, arch?: ArchResolvable) {
        return await this._fetchd(app, await this._fetchf(app, false), arch)
    }

    /**
     * Fetches available app versions.
     * @param app The app to fetch 
     * @returns An array of app version data
     * @example
     * import { AppPackageFetcher, App } from 'revanced-links'
     * 
     * const fetcher = new AppPackageFetcher({ ... })
     * const versions = await fetcher.fetchVersions(App.YouTube)
     */
    async fetchVersions(app: App) {
        return await this._scraper.fetchVersions(app)
    }

    /**
     * Fetches a download URL for an app with a specific version.
     * @param app The app to fetch
     * @param version A version of the app to fetch
     * @returns A download URL
     * @example
     * import { AppPackageFetcher, App } from 'revanced-links'
     * 
     * const fetcher = new AppPackageFetcher({ ... })
     * const url = await fetcher.fetchDownload(App.YouTube, '17.33.42')
     */
    async fetchDownload(app: App, version: string, arch?: ArchResolvable) {
        return await this._scraper.fetchDownload(app, version, arch ?? this._options.arch)
    }

    private async _fetchf(app: App, latest: boolean = true) {
        const versionInfo = await this[latest ? 'fetchLatestVersion' : 'fetchLatestStableVersion'](app)
        if (!versionInfo) throw new AppPackageFetcherError('NO_VERSIONS_AVAILABLE')
        return versionInfo
    }

    private _fetchd(app: App, versionInfo: AppPackageScraperAppVersion, arch?: ArchResolvable) {
        return this._scraper.fetchDownload(app, versionInfo.version, arch ?? this._options.arch)
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
    /**
     * Device architecture
     */
    arch?: ArchResolvable
}