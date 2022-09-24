// ! NOTICE ! //
// Big thanks to reisxd/revanced-builder (https://github.com/reisxd/revanced-builder)
// for multiple parts of this code, it's really useful for others!
// ! NOTICE ! //

import semverLessThan from 'semver/functions/lt.js'
import CustomErrorConstructor from '../util/CustomErrorConstructor.js'
import APKMirrorScraper, { APKMirrorScraperAppVersion, APKMirrorScraperOptions } from './APKMirrorScraper.js'
import type { ArchResolvable } from './APKMirrorScraper.js'

export default class AppPackageScraper {
    static readonly baseDomain = 'https://apkmirror.com'
    static readonly excludableVersionsTitleList = ['wear os']
    private readonly _options: AppPackageScraperOptions
    private readonly _scraper: APKMirrorScraper

    constructor(options: AppPackageScraperOptions = {}) {
        this._options = options
        this._scraper = new APKMirrorScraper({ ...this._options })
    }

    /**
     * Fetches available app versions.
     * @param app The app to fetch 
     * @returns An array of app version data
     * @example
     * import { AppPackageScraper, App } from 'revanced-links'
     * 
     * const fetcher = new AppPackageScraper({ ... })
     * const versions = await fetcher.fetchVersions(App.YouTube)
     */
    async fetchVersions(app: App, page = 0) {
        const versions = await this._scraper.fetchVersions(AppPackageScraper.toAppCategory(app), page)

        return versions.sort(
            (a, b) => a.version && b.version && semverLessThan(this._fv(a.version), this._fv(b.version)) ? -1 : 1
        )
            .filter(version => 
                AppPackageScraper.excludableVersionsTitleList.some(
                    string => !version.title.toLowerCase().includes(string)
                )
            )
            .map(version => {
                const title = version.title.toLowerCase()
                return {
                    alpha: !!title.includes('alpha'),
                    beta: !!title.includes('beta'),
                    version: version.version,
                    title: version.title
                }
            })
    }

    /**
     * Fetches a download URL for an app with a specific version.
     * @param app The app to fetch
     * @param version A version of the app to fetch
     * @returns A download URL
     * @example
     * import { AppPackageScraper, App } from 'revanced-links'
     * 
     * const fetcher = new AppPackageScraper({ ... })
     * const url = await fetcher.fetchDownload(App.YouTube, '17.33.42')
     */
    async fetchDownload(app: App, version: string, arch?: ArchResolvable) {
        return await this._scraper.fetchDownload(AppPackageScraper.toAppCategory(app), version, arch)
    }

    /**
     * Fetches a download URL for the latest version of an app package.
     * @param app The app to fetch 
     * @returns A download URL
     * @example
     * import { AppPackageScraper, App } from 'revanced-links'
     * 
     * const fetcher = new AppPackageScraper({ ... })
     * const url = await fetcher.fetchLatestStableRelease(App.YouTube)
     */
    async fetchLatestRelease(app: App, arch?: ArchResolvable) {
        const version = (await this.fetchVersions(app))[0]?.version
        if (!version) return null
        return await this.fetchDownload(app, version, arch)
    }

    /**
     * Fetches a download URL for the latest stable *(non-beta, non-alpha)* version of an app package.
     * @param app The app to fetch 
     * @returns A download URL
     * @example
     * import { AppPackageScraper, App } from 'revanced-links'
     * 
     * const fetcher = new AppPackageScraper({ ... })
     * const url = await fetcher.fetchLatestStableRelease(App.YouTube)
     */
    async fetchLatestStableRelease(app: App, arch?: ArchResolvable) {
        const version = (await this.fetchVersions(app)).find(v => !(v.alpha || v.beta))?.version
        if (!version) return null
        return this.fetchDownload(app, version, arch)
    }

    /**
     * Converts `App` to `AppCategory`. Useful for those who wants to scrape using `APKMirrorScraper`.
     * @param app The app ID you want to convert
     * @returns App category
     * @example
     * import { AppPackageScraper, App } from 'revanced-links'
     * 
     * AppPackageScraper.toAppCategory(App.YouTube) // 'google-inc/youtube'
     */
    static toAppCategory(app: App) {
        if (App[app]) return AppCategory[App[app] as keyof typeof App]
        else throw new AppPackageScraperError('INVALID_APP', app)
    }

    private _fv(string: string) {
        return string.replace(/\.0([0-9]+)/g, '.$1')
            .replace(/^([0-9]+\.[0-9]+)(?:.*)$/, '$1.0')
            .replace(/^([0-9]+)(?:.*)$/, '$1.0.0')
    }   
}

export interface AppPackageScraperOptions extends APKMirrorScraperOptions {}

export interface AppVersion extends APKMirrorScraperAppVersion {
    /**
     * Whether this app release is a beta release
     */
    beta: boolean
    /**
     * Whether this app release is an alpha release
     */
    alpha: boolean
}

export { ArchResolvable }

export enum App {
    YouTube,
    YouTubeMusic,
    Twitter,
    Reddit,
    WarnWetter,
    TikTok
}

export enum AppCategory {
    YouTube = 'google-inc/youtube',
    YouTubeMusic = 'google-inc/youtube-music',
    Twitter = 'twitter-inc/twitter',
    Reddit = 'redditinc/reddit',
    WarnWetter = 'deutscher-wetterdienst/warnwetter',
    TikTok = 'tiktok-pte-ltd/tik-tok'
}

const AppPackageScraperErrorMessages = {
    'INVALID_APP': (app?: App) => `Invalid app ID '${app}'`,
    'NO_VERSIONS_AVAILABLE': 'No versions available'
} as const

const AppPackageScraperError = new CustomErrorConstructor(Error, AppPackageScraperErrorMessages).error