// ! NOTICE ! //
// Big thanks to reisxd/revanced-builder (https://github.com/reisxd/revanced-builder)
// for multiple parts of this code, it's really useful for others!
// ! NOTICE ! //

import { load } from 'cheerio'
import fetch, { Response } from 'node-fetch'
import semverLessThan from 'semver/functions/lt'

import CustomErrorConstructor from '../util/CustomErrorConstructor'

export default class AppPackageScraper {
    static readonly baseDomain = 'https://apkmirror.com'
    static readonly excludableVersionsTitleList = ['wear os']

    constructor(private readonly options: AppPackageScraperOptions = {}) {}

    async fetchVersions(app: AppPackageScraperApp) {
        const isApp = (appName: keyof typeof AppPackageScraperApp) => this._isApp(appName, app)
        const throwBadFormattingError = function () { throw new AppPackageScraperError('INVALID_WEB_FORMAT') }

        const url = `${AppPackageScraper.baseDomain}/uploads/?appcategory=${
            isApp('YouTube') ? 'youtube' :
            isApp('YouTubeMusic') ? 'youtube-music' :
            isApp('Twitter') ? 'twitter' :
            isApp('Reddit') ? 'reddit' :
            isApp('WarnWetter') ? 'warnwetter' :
            isApp('TikTok') ? 'tik-tok' : (() => { throw new AppPackageScraperError('INVALID_APP', app) })()
        }`

        const response = await fetch(url, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
            }
        })

        this._checkRequest(response)

        const list = load(await response.text())(`#primary h5.appRowTitle.wrapText.marginZero.block-on-mobile`).get()
        const versions: AppPackageScraperAppVersion[] = []

        for (const element of list) {
            if (!element.attribs['title']) throwBadFormattingError()

            const title = element.attribs['title']!.toLowerCase()
            if (AppPackageScraper.excludableVersionsTitleList.some((string) => title.includes(string))) continue

            const unsafeVersion = title.split(' ')[1]
            if (!unsafeVersion) throwBadFormattingError()

            const match = unsafeVersion!.match(/^(\d+(?:\.\d+)?(?:\.\d+)?)(?:\-\w+)?$/)
            if (!match || !match[0]) throwBadFormattingError()
            
            const version = match![0]!
                .replace(/\.0(\d+)/g, '.$1')
                .replace(/^(\d+\.\d+)$/, '$1.0')
                .replace(/^(\d+)$/, '$1.0.0')

            versions.push({
                alpha: title.includes('alpha'),
                beta: title.includes('beta'),
                version: version
            })
        }

        return versions.sort((a, b) => semverLessThan(a.version, b.version) ? 1 : -1)
    }

    async fetchDownload(app: AppPackageScraperApp, version: string, arch?: ArchResolvable) {
        const isApp = (appName: keyof typeof AppPackageScraperApp) => this._isApp(appName, app)
        const throwBadFormattingError = function () { throw new AppPackageScraperError('INVALID_WEB_FORMAT') }

        const actualArch = arch || this.options.arch
        const urlVersion = version.replaceAll('.', '-')
        const url = `${AppPackageScraper.baseDomain}/apk/${this._appendVersioning(
            isApp('YouTube') ? 'google-inc/youtube/youtube' :
            isApp('YouTubeMusic') ? 'google-inc/youtube-music/youtube-music' :
            isApp('Twitter') ? 'twitter-inc/twitter/twitter' :
            isApp('Reddit') ? 'redditinc/reddit/reddit' :
            isApp('WarnWetter') ? 'deutscher-wetterdienst/warnwetter/warnwetter' :
            isApp('TikTok') ? 'tiktok-pte-ltd/tik-tok/tik-tok' : (() => { throw new AppPackageScraperError('INVALID_APP', app) })()
        , urlVersion)}`

        const response = await fetch(url, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
            }
        })

        const $ = load(await this._responseToText(response))
        const href = (actualArch && isApp('YouTubeMusic')) ?
            $(`div:contains("${actualArch}")`)
                .parent()
                .children('div[class^="table-cell rowheight"]')
                .first()
                .children('a[class="accent_color"]')
                .first()
                .attr('href')
        :
            $('span[class="apkm-badge"]')
                .first()
                .parent()
                .children('a[class="accent_color"]')
                .first()
                .attr('href')

        if (!href) throwBadFormattingError()

        const downloadPageBody = await this._responseToText(await fetch(`${AppPackageScraper.baseDomain}${href}`))

        const finalPageUrl = load(downloadPageBody)('a[class^="accent_bg btn btn-flat downloadButton"]').first().attr('href')
        if (!finalPageUrl) throwBadFormattingError()

        const finalPageBody = await this._responseToText(await fetch(`${AppPackageScraper.baseDomain}${finalPageUrl}`))
        const downloadUrl = `${AppPackageScraper.baseDomain}${load(finalPageBody)('a[rel="nofollow"]').first().attr('href')}`

        if (!downloadUrl) throw new AppPackageScraperError('DOWNLOAD_URL_UNAVAILABLE')
        return downloadUrl
    }

    private _isApp(entry: keyof typeof AppPackageScraperApp, value: AppPackageScraperApp) {
        return AppPackageScraperApp[entry] === value
    }

    private _checkRequest(res: Response) {
        if (!res.ok) throw new AppPackageScraperError('REQUEST_NOT_OK', res.status)
        return true
    }

    private _appendVersioning(url: string, version: string) {
        return `${url}-${version}-release`
    }
    
    private _responseToText(res: Response) {
        this._checkRequest(res)
        return res.text()
    }
}

export interface AppPackageScraperOptions {
    arch?: ArchResolvable
}

export interface AppPackageScraperAppVersion {
    beta: boolean
    alpha: boolean
    version: string
}

export type ArchResolvable = 'arm64-v8a' | 'armeabi-v7a' | 'x86_64' | 'x86'

export enum AppPackageScraperApp {
    YouTube,
    YouTubeMusic,
    Twitter,
    Reddit,
    WarnWetter,
    TikTok
}

const AppPackageScraperErrorMessages = {
    'INVALID_APP': (app?: AppPackageScraperApp) => `Invalid app ID '${app}', must be either ${Object.keys(AppPackageScraperApp).join(', ')}`,
    'REQUEST_NOT_OK': (code?: number) => `Host did not return an OK status code after fetching${!code ? `, status code was ${code}` : ''}`,
    'INVALID_WEB_FORMAT': 'Host may have changed website formatting, cannot scrape',
    'DOWNLOAD_URL_UNAVAILABLE': 'Download URL for this app is unavailable, try changing architecture and version'
} as const

const AppPackageScraperError = new CustomErrorConstructor(Error, AppPackageScraperErrorMessages).error