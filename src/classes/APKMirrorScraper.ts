// ! NOTICE ! //
// Big thanks to reisxd/revanced-builder (https://github.com/reisxd/revanced-builder)
// for multiple parts of this code, it's really useful for others!
// ! NOTICE ! //

import { load } from 'cheerio'
import fetch, { Response } from 'node-fetch'
import semverLessThan from 'semver/functions/lt.js'
import CustomErrorConstructor from '../util/CustomErrorConstructor.js'

export const EXTENDED_SEMVER_REGEX = /([0-9]+)(\.([0-9]+))?(\.([0-9]+))?(?:-((?:0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:[0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?/gm

export default class APKMirrorScraper {
    static readonly baseDomain = 'https://apkmirror.com'

    constructor(private readonly options: APKMirrorScraperOptions = {}) {}

    async fetchVersions(appCategory: string) {
        const throwBadFormattingError = function () { throw new APKMirrorScraperError('INVALID_WEB_FORMAT') }
        const url = `${APKMirrorScraper.baseDomain}/uploads/?appcategory=${appCategory}`

        const response = await fetch(url, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
            }
        })

        this._checkRequest(response)

        const list = load(await response.text())(`#primary h5.appRowTitle.wrapText.marginZero.block-on-mobile`).get()
        const versions: APKMirrorScraperAppVersion[] = []

        console.log(appCategory, 0)

        for (const element of list) {
            if (!element.attribs['title']) throwBadFormattingError()

            const title = element.attribs['title']
            console.log(appCategory, 1, title)
            const match = title!.match(EXTENDED_SEMVER_REGEX)
            if (!match || !match[0]) throwBadFormattingError()

            console.log(match![0])

            versions.push({
                version: match![0]!,
                title: title!
            })
        }

        return versions.sort((a, b) => semverLessThan(this._fixVersion(a.version), this._fixVersion(b.version)) ? 1 : -1)
    }

    async fetchDownload(appCategory: string, version: string, arch?: ArchResolvable) {
        const throwBadFormattingError = function () { throw new APKMirrorScraperError('INVALID_WEB_FORMAT') }

        const actualArch = arch || this.options.arch
        const urlVersion = version.replaceAll('.', '-')
        console.log(this._appendVersioning(appCategory, urlVersion))
        const url = `${APKMirrorScraper.baseDomain}/apk/${this._appendVersioning(appCategory, urlVersion)}`

        const response = await fetch(url, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
            }
        })

        const $ = load(await this._responseToText(response))
        const href = 
            ($(`div:contains("${actualArch}")`) ?? $(`div:contains("universal")`))
                .parent()
                .children('div[class^="table-cell rowheight"]')
                .first()
                .children('a[class="accent_color"]')
                .first()
                .attr('href')
        ??
            $('span[class="apkm-badge"]')
                .first()
                .parent()
                .children('a[class="accent_color"]')
                .first()
                .attr('href')

        if (!href) throwBadFormattingError()

        const downloadPageBody = await this._responseToText(await fetch(`${APKMirrorScraper.baseDomain}${href}`))

        const finalPageUrl = load(downloadPageBody)('a[class^="accent_bg btn btn-flat downloadButton"]').first().attr('href')
        if (!finalPageUrl) throwBadFormattingError()

        const finalPageBody = await this._responseToText(await fetch(`${APKMirrorScraper.baseDomain}${finalPageUrl}`))
        const downloadUrl = `${APKMirrorScraper.baseDomain}${load(finalPageBody)('a[rel="nofollow"]').first().attr('href')}`

        if (!downloadUrl) throw new APKMirrorScraperError('DOWNLOAD_URL_UNAVAILABLE')
        return downloadUrl
    }

    private _checkRequest(res: Response) {
        if (!res.ok) throw new APKMirrorScraperError('REQUEST_NOT_OK', res.status)
        return true
    }

    private _appendVersioning(url: string, version: string) {
        return `${url}-${version}-release`
    }
    
    private _responseToText(res: Response) {
        this._checkRequest(res)
        return res.text()
    }

    private _fixVersion(string: string) {
        return string.replace(/\.0(\d+)/g, '.$1')
            .replace(/^(\d+\.\d+)$/, '$1.0')
            .replace(/^(\d+)$/, '$1.0.0')
    }
}

export interface APKMirrorScraperOptions {
    arch?: ArchResolvable
}

export interface APKMirrorScraperAppVersion {
    title: string
    version: string
}

export type ArchResolvable = 'arm64-v8a' | 'armeabi-v7a' | 'x86_64' | 'x86'

const APKMirrorScraperErrorMessages = {
    'REQUEST_NOT_OK': (code?: number) => `Host did not return an OK status code after fetching${code ? `, status code was ${code}` : ''}`,
    'INVALID_WEB_FORMAT': 'Host may have changed website formatting, cannot scrape',
    'DOWNLOAD_URL_UNAVAILABLE': 'Download URL for this app is unavailable, try changing architecture and version'
} as const

const APKMirrorScraperError = new CustomErrorConstructor(Error, APKMirrorScraperErrorMessages).error