// ! NOTICE ! //
// Big thanks to reisxd/revanced-builder (https://github.com/reisxd/revanced-builder)
// for multiple parts of this code, it's really useful for others!
// ! NOTICE ! //

import CustomErrorConstructor from '../util/CustomErrorConstructor.js'
import APKMirrorScraper, { APKMirrorScraperOptions, ArchResolvable } from './APKMirrorScraper.js'

export default class AppPackageScraper {
    static readonly baseDomain = 'https://apkmirror.com'
    static readonly excludableVersionsTitleList = ['wear os']
    private readonly _options: AppPackageScraperOptions
    private readonly _scraper: APKMirrorScraper

    constructor(options: AppPackageScraperOptions = {}) {
        this._options = options
        this._scraper = new APKMirrorScraper({ ...this._options })
    }

    async fetchVersions(app: AppPackageScraperApp): Promise<AppPackageScraperAppVersion[]> {
        const isApp = (appName: keyof typeof AppPackageScraperApp) => this._isApp(appName, app)
        const appCategory = 
            isApp('YouTube') ? 'youtube' :
            isApp('YouTubeMusic') ? 'youtube-music' :
            isApp('Twitter') ? 'twitter' :
            isApp('Reddit') ? 'reddit' :
            isApp('WarnWetter') ? 'warnwetter' :
            isApp('TikTok') ? 'tik-tok' : (() => { throw new AppPackageScraperError('INVALID_APP', app) })()

        const versions = await this._scraper.fetchVersions(appCategory)

        // * No need for sort, the utility function already sorted for us
        return versions.filter(version => AppPackageScraper.excludableVersionsTitleList.some(
            string => !version.title.toLowerCase().includes(string)
        )).map(version => {
            const title = version.title.toLowerCase()
            return {
                alpha: !!title.includes('alpha'),
                beta: !!title.includes('beta'),
                version: version.version
            }
        })
    }

    async fetchDownload(app: AppPackageScraperApp, version: string, arch?: ArchResolvable) {
        const isApp = (appName: keyof typeof AppPackageScraperApp) => this._isApp(appName, app)
        const appCategory = 
            isApp('YouTube') ? 'google-inc/youtube' :
            isApp('YouTubeMusic') ? 'google-inc/youtube-music' :
            isApp('Twitter') ? 'twitter-inc/twitter' :
            isApp('Reddit') ? 'redditinc/reddit' :
            isApp('WarnWetter') ? 'deutscher-wetterdienst/warnwetter' :
            isApp('TikTok') ? 'tiktok-pte-ltd/tik-tok' : (() => { throw new AppPackageScraperError('INVALID_APP', app) })()

        return await this._scraper.fetchDownload(appCategory, version, arch)
    }

    private _isApp(entry: keyof typeof AppPackageScraperApp, value: AppPackageScraperApp) {
        return AppPackageScraperApp[entry] === value
    }
}

export interface AppPackageScraperOptions extends APKMirrorScraperOptions {}

export interface AppPackageScraperAppVersion {
    beta: boolean
    alpha: boolean
    version: string
}

export { ArchResolvable }

export enum AppPackageScraperApp {
    YouTube,
    YouTubeMusic,
    Twitter,
    Reddit,
    WarnWetter,
    TikTok
}

const AppPackageScraperErrorMessages = {
    'INVALID_APP': (app?: AppPackageScraperApp) => `Invalid app ID '${app}'`,
} as const

const AppPackageScraperError = new CustomErrorConstructor(Error, AppPackageScraperErrorMessages).error