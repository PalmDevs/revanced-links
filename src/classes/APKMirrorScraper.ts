// ! NOTICE ! //
// Big thanks to reisxd/revanced-builder (https://github.com/reisxd/revanced-builder)
// for multiple parts of this code, it's really useful for others!
// ! NOTICE ! //

import { load } from 'cheerio'
import { Element, Text, ChildNode } from 'domhandler'
import fetch, { Response } from 'node-fetch'
import CustomErrorConstructor from '../util/CustomErrorConstructor.js'
import { isNotEmptyArray } from '../util/Validator.js'

export const REQUEST_HEADERS = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
}
export const EXTENDED_SEMVER_REGEX = /(?:.*?)((?:(?:[0-9]+)(?:\.[0-9]+)*(?:\-[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*)*)(?: +\- +[a-zA-Z0-9]+)?)/gi
export const ARCH_REGEX = /^arm64-v8a|armeabi-v7a|x86_64|x84$/
export const APP_CATEGORY_REGEX = /^[a-zA-Z-]+$/
export const APP_ROUTE_REGEX = /^[a-zA-Z-]+\/[a-zA-Z-]+$/

export default class APKMirrorScraper {
    static readonly baseDomain = 'https://apkmirror.com'
    private readonly _options: Required<APKMirrorScraperOptions>

    /**
     * Fetches and scrapes various information from APKMirror.
     * @param options Configurations and options
     * @example
     * import { APKMirrorScraper } from 'revanced-links'
     * 
     * const ams = new APKMirrorScraper({
     *     arch: 'arm64-v8a'
     * })
     */
    constructor(options: APKMirrorScraperOptions) {
        this._checkMatch(options.arch, 'options.arch', ARCH_REGEX)

        this._options = Object.assign<{ arch: ArchResolvable }, APKMirrorScraperOptions>(
            { arch: 'arm64-v8a' },
            options
        )
    }

    /**
     * Fetches versions for a specific app using an app category.
     * *An app category is almost-like the package name, each app must have a different package name.*
     * @param appCategory The app category to fetch
     * @returns App version data
     * @example
     * import { APKMirrorScraper } from 'revanced-links'
     * 
     * const ams = new APKMirrorScraper({ ... })
     * const versions = await ams.fetchVersions('youtube-music')
     */
    async fetchVersions(appCategory: string) {
        // @Validate
        this._checkMatch(appCategory, 'appCategory', APP_CATEGORY_REGEX)

        const url = `${APKMirrorScraper.baseDomain}/uploads/?appcategory=${appCategory}`
        const response = await fetch(url, {
            headers: REQUEST_HEADERS
        })

        this._checkRequest(response)

        return await this._scrapeFromResponse(response)
    }

    /**
     * Fetches versions for a specific app using an app route.
     * *An app route is almost-like GitHub repository names, each user (publisher) cannot have the same route for different apps.*
     * *But, you can have the same route if the publisher is a different organization.*
     * @param appRoute The app route to fetch
     * @returns App version data
     * @example
     * import { APKMirrorScraper } from 'revanced-links'
     * 
     * const ams = new APKMirrorScraper({ ... })
     * const versions = await ams.fetchVersionsFromAppRoute('google-inc/youtube-music')
     */
    async fetchVersionsFromAppRoute(appRoute: string) {
        // @Validate
        this._checkMatch(appRoute, 'appRoute', APP_ROUTE_REGEX)

        const url = `${APKMirrorScraper.baseDomain}/apk/${appRoute}`
        const response = await fetch(url, {
            headers: REQUEST_HEADERS
        })

        this._checkRequest(response)

        return await this._scrapeFromResponse(response)
    }

    /**
     * Fetches download URLs for an app using an **app route**.
     * *There is no confirmed support for app categories.*
     * @param appRoute The app route to fetch
     * @param version The version to fetch
     * @param arch Device architecture
     * @returns A download URL
     * @example
     * import { APKMirrorScraper } from 'revanced-links'
     * 
     * const ams = new APKMirrorScraper({ ... })
     * const url = await ams.fetchDownload('youtube-music', '5.23.50')
     */
    async fetchDownload(appRoute: string, version: string, arch?: ArchResolvable) {
        const actualArch = arch || this._options.arch

        // @Validate
        this._checkMatch(appRoute, 'appRoute', APP_ROUTE_REGEX)
        this._checkMatch(version, 'version', EXTENDED_SEMVER_REGEX)
        this._checkMatch(actualArch, 'arch', ARCH_REGEX)

        // * APKMirror URLs uses dashes instead of dots
        const urlVersion = version.replaceAll('.', '-')
        // * The split-repeating part is required due to APKMirror link formats being... weird
        const url = `${APKMirrorScraper.baseDomain}/apk/${this._appendVersioning(`${appRoute}/${appRoute.split('/').at(-1)}`, urlVersion)}`
        const response = await fetch(url, {
            headers: REQUEST_HEADERS
        })

        const $ = load(await this._responseToText(response))
        // * Get any div that contains the device arch or is universal (if exact arch is not available)
        // * Or just don't... and default it to something else, if unavailable
        const href = 
            $(`div:contains("${actualArch}")`)
                .parent()
                .children('div[class^="table-cell rowheight"]')
                .first()
                .children('a[class="accent_color"]')
                .first()
                .attr('href')
        ??
            $(`div:contains("universal")`)
                .parent()
                .children('div[class^="table-cell rowheight"]')
                .first()
                .children('a[class="accent_color"]')
                .first()
                .attr('href')

        if (!href) throw new APKMirrorScraperError('INVALID_WEB_FORMAT')

        // * The redirect shenanigans

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

    private async _scrapeFromResponse(res: Response) {
        const nuke = () => { throw new APKMirrorScraperError('INVALID_WEB_FORMAT') }
        const isElement = (element: ChildNode | null | undefined): element is Element => element instanceof Element
        const isText = (element: ChildNode | null | undefined): element is Text => element instanceof Text

        // * List all elements which is an info slide
        const infoSlides = load(await res.text())('#primary div.infoSlide.t-height').get()
        const versions = infoSlides.map(slide => {

            // * Find anything that is a paragraph
            const p = slide.children.find(child => {
                if (!isElement(child)) return false
                return child.name === 'p'
            })

            if (!isElement(p)) return nuke()

            // * Inside that paragraph, find a span child with class name "infoSlide-value"
            const span = p.children.find(child => {
                if (!isElement(child)) return false
                return child.name === 'span' &&
                    child['attribs']?.['class'] === 'infoSlide-value'
            })
            if (!span || !isElement(span)) return nuke()

            // * Find the first text inside, needs to be validated 2 times because,
            // * <Array>.find() does not automatically throw an error when something is not found
            const element = span.children.find(child => isText(child))
            if (!isText(element)) return nuke()

            // * Trim spaces in front and behind of the versions and try to match it with the extended semver regex
            const text = element.data.trim()
            const matches = text.match(EXTENDED_SEMVER_REGEX)
            if (!matches || !matches[0] || matches.length > 1) throw new APKMirrorScraperError('VERSION_UNMATCH')

            // * Sanatize the version (to match usable URL version)
            const sanatized = matches[0].replaceAll(' ', '').toLowerCase()
            return { version: sanatized, title: matches[0] }
        })

        return versions
    }

    private _checkMatch(something: any, property: string, ...regexes: RegExp[]) {
        if (!regexes.every(r => r.test(something))) throw new APKMirrorScraperError('BAD_OPTIONS', property, 'match', regexes.map(r => r.source))
    }
}

export interface APKMirrorScraperOptions {
    /**
     * Device architecture
     */
    arch?: ArchResolvable
}

export interface APKMirrorScraperAppVersion {
    /**
     * Actual version given by APKMirror
     */
    title: string
    /**
     * Sanatized version, can be used with the `semver` package for many operations
     */
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