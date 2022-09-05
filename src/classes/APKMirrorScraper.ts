// ! NOTICE ! //
// Big thanks to reisxd/revanced-builder (https://github.com/reisxd/revanced-builder)
// for multiple parts of this code, it's really useful for others!
// ! NOTICE ! //

import { load } from 'cheerio'
import { Element, Text, ChildNode } from 'domhandler'
import fetch, { Response } from 'node-fetch'
import semverLessThan from 'semver/functions/lt.js'
import CustomErrorConstructor from '../util/CustomErrorConstructor.js'
import { doesMatch, isNotEmptyArray } from '../util/Validator.js'

export const EXTENDED_SEMVER_REGEX = /(?:.*?)((?:(?:[0-9]+)(?:\.[0-9]+)*(?:\-[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*)*)(?: +\- +[a-zA-Z0-9]+)?)/gi
export const ARCH_REGEX = /^arm64-v8a|armeabi-v7a|x86_64|x84$/
export const APP_CATEGORY_REGEX = /^[a-zA-Z-]+$/
export const APP_ROUTE_REGEX = /^[a-zA-Z-]+\/[a-zA-Z-]+$/

export default class APKMirrorScraper {
    static readonly baseDomain = 'https://apkmirror.com'
    private readonly _options: APKMirrorScraperOptions

    constructor(options: APKMirrorScraperOptions) {
        if (!doesMatch(options.arch, ARCH_REGEX)) throw new APKMirrorScraperError('BAD_OPTIONS', 'options.arch', 'match', [ARCH_REGEX.source])

        this._options = Object.assign<APKMirrorScraperOptions, APKMirrorScraperOptions>(
            { arch: 'arm64-v8a' },
            options
        )
    }

    async fetchVersions(appCategory: string) {
        if (!doesMatch(appCategory, APP_CATEGORY_REGEX)) throw new APKMirrorScraperError('BAD_OPTIONS', 'appCategory', 'match', [APP_CATEGORY_REGEX.source])

        const url = `${APKMirrorScraper.baseDomain}/uploads/?appcategory=${appCategory}`
        const response = await fetch(url, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
            }
        })

        this._checkRequest(response)

        const versions = await this._scrapeFromResponse(response)
        return versions.sort((a, b) => semverLessThan(this._fixVersion(a.version), this._fixVersion(b.version)) ? -1 : 1)
    }

    async fetchVersionsFromAppRoute(appRoute: string) {
        if (!doesMatch(appRoute, APP_ROUTE_REGEX)) throw new APKMirrorScraperError('BAD_OPTIONS', 'appRoute', 'match', [APP_ROUTE_REGEX.source])

        const url = `${APKMirrorScraper.baseDomain}/apk/${appRoute}`
        const response = await fetch(url, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
            }
        })

        this._checkRequest(response)

        const versions = await this._scrapeFromResponse(response)
        return versions.sort((a, b) => semverLessThan(this._fixVersion(a.version), this._fixVersion(b.version)) ? -1 : 1)
    }

    async fetchDownload(appRoute: string, version: string, arch?: ArchResolvable) {
        if (!doesMatch(appRoute, APP_ROUTE_REGEX)) throw new APKMirrorScraperError('BAD_OPTIONS', 'appRoute', 'match', [APP_ROUTE_REGEX.source])
        if (!doesMatch(version, EXTENDED_SEMVER_REGEX)) throw new APKMirrorScraperError('BAD_OPTIONS', 'appRoute', 'match', [EXTENDED_SEMVER_REGEX.source])
        if (!doesMatch(arch, ARCH_REGEX)) throw new APKMirrorScraperError('BAD_OPTIONS', 'arch', 'match', [ARCH_REGEX.source])

        const actualArch = arch || this._options.arch
        const urlVersion = version.replaceAll('.', '-')
        const url = `${APKMirrorScraper.baseDomain}/apk/${this._appendVersioning(`${appRoute}/${appRoute.split('/').at(-1)}`, urlVersion)}`
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

        if (!href) throw new APKMirrorScraperError('INVALID_WEB_FORMAT')

        const downloadPageBody = await this._responseToText(await fetch(`${APKMirrorScraper.baseDomain}${href}`))

        const finalPageUrl = load(downloadPageBody)('a[class^="accent_bg btn btn-flat downloadButton"]').first().attr('href')
        if (!finalPageUrl) throw new APKMirrorScraperError('INVALID_WEB_FORMAT')

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
        return string.replace(/\.0([0-9]+)/g, '.$1')
            .replace(/^([0-9]+\.[0-9]+)(?:.*)$/, '$1.0')
            .replace(/^([0-9]+)(?:.*)$/, '$1.0.0')
    }

    private async _scrapeFromResponse(res: Response) {
        const nuke = () => { throw new APKMirrorScraperError('INVALID_WEB_FORMAT') }
        const isElement = (element: ChildNode | null | undefined): element is Element => element instanceof Element
        const isText = (element: ChildNode | null | undefined): element is Text => element instanceof Text

        const divs = load(await res.text())('#primary div.infoSlide.t-height').get()
        const versions = divs.map(div => {
            // Find anything that is a paragraph
            const p = div.children.find(child => {
                if (!isElement(child)) return false
                return child.name === 'p'
            })
            if (!isElement(p)) return nuke()

            // Inside that paragraph, find a span child with class name "infoSlide-value"
            const span = p.children.find(child => {
                if (!isElement(child)) return false
                return child.name === 'span' &&
                    child['attribs']?.['class'] === 'infoSlide-value'
            })
            if (!span || !isElement(span)) return nuke()

            // Access the text
            const element = span.children[0]
            if (!isText(element)) return nuke()

            const text = element.data.trim()
            const matches = text.match(EXTENDED_SEMVER_REGEX)
            if (!matches || !matches[0] || matches.length > 1) throw new APKMirrorScraperError('VERSION_UNMATCH')
            const sanatized = matches![0]!.replaceAll(' ', '').toLowerCase()

            return { version: sanatized, title: matches[0] }
        })

        return versions
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
    'DOWNLOAD_URL_UNAVAILABLE': 'Download URL for this app is unavailable, try changing architecture and version',
    'VERSION_UNMATCH': 'Version string format is not supported, please make an issue about this',
    'BAD_OPTIONS': (property?: string, what?: string, should?: string[]) => `Bad options${property ? ` for ${property}${isNotEmptyArray(should) ? `, must ${what} ${should!.join(', ')}` : ''}` : ''}`
} as const

const APKMirrorScraperError = new CustomErrorConstructor(Error, APKMirrorScraperErrorMessages).error