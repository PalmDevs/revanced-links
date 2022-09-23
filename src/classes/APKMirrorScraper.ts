// ! NOTICE ! //
// Big thanks to reisxd/revanced-builder (https://github.com/reisxd/revanced-builder)
// for multiple parts of this code, it's really useful for others!
// ! NOTICE ! //

import { load } from 'cheerio'
import { Element, Text, ChildNode } from 'domhandler'
import fetch, { Response } from 'node-fetch'
import { KeysWith } from '../util/UtilTypes.js'
import CustomErrorConstructor from '../util/CustomErrorConstructor.js'
import { isNotEmptyArray } from '../util/Validator.js'


export default class APKMirrorScraper {
    static readonly BASE_DOMAIN = 'https://apkmirror.com'
    static readonly APK_ROUTE = `${APKMirrorScraper.BASE_DOMAIN}/apk`
    static readonly UPLOADS_ROUTE = `${APKMirrorScraper.BASE_DOMAIN}/uploads`

    static readonly ARCH_REGEX = /^arm64-v8a|armeabi-v7a|x86_64|x84$/
    static readonly EXTENDED_SEMVER_REGEX = /(?:.*?)((?:(?:[0-9]+)(?:\.[0-9]+)*(?:\-[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*)*)(?: +\- +[a-zA-Z0-9]+)?)/gi
    
    static readonly APP_CATEGORY_REGEX = /^[a-zA-Z-]+$/
    static readonly APP_ROUTE_REGEX = /^[a-zA-Z-]+\/[a-zA-Z-]+$/
    static readonly APP_CATEGORY_QUERY_STRING_REGEX = /\?appcategory=[a-zA-Z-]+/

    static readonly REQUEST_HEADERS = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
    }

    static readonly FALLBACK_ARCH = {
        'arm64-v8a': ['armeabi-v7a', 'universal'],
        'armeabi-v7a': ['universal'],
        'x86_64': ['x86', 'universal'],
        'x86': ['universal']
    }

    private readonly _options: APKMirrorScraperOptions

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
    constructor(options: APKMirrorScraperOptions = {}) {
        this._match(options.arch, 'options.arch', 'ARCH_REGEX')

        this._options = Object.assign<Omit<APKMirrorScraperOptions, `throwOn${'BadWebFormat' | 'FailedVersionValidation'}`>, APKMirrorScraperOptions>(
            { arch: 'arm64-v8a', useFallbackArch: true },
            options
        )
    }

    /**
     * Fetches versions for a specific app using an **app route**.
     * @param appRoute The app route to fetch
     * @returns App version data
     * @example
     * import { APKMirrorScraper } from 'revanced-links'
     * 
     * const ams = new APKMirrorScraper({ ... })
     * const versions = await ams.fetchVersions('google-inc/youtube-music')
     */
    async fetchVersions(appRoute: string, page = 0) {
        // @Validate
        this._match(appRoute, 'appRoute', 'APP_ROUTE_REGEX')

        const url = `${APKMirrorScraper.APK_ROUTE}/${appRoute}`
        const arb = await this._u2t(url)

        const $ = load(arb)
        const href = $('#primary div.table.noMargins div.table-row div.table-cell.center a.fontBlack').attr('href')
        if (!href) this.__twf()

        const matches = href.match(APKMirrorScraper.APP_CATEGORY_QUERY_STRING_REGEX)
        if (!matches || !matches[0]) this.__twr()

        const acUrl = `${APKMirrorScraper.UPLOADS_ROUTE}${page > 1 ? `page/${page}` : ''}/${matches[0]}`
        return await this._scrape(await this._req(acUrl))
    }

    /**
     * Fetches download URLs for an app using an **app route**.
     * @param appRoute The app route to fetch
     * @param version The version to fetch
     * @param arch Device architecture
     * @returns A download URL
     * @example
     * import { APKMirrorScraper } from 'revanced-links'
     * 
     * const ams = new APKMirrorScraper({ ... })
     * const url = await ams.fetchDownload('youtube-music', '5.24.50')
     */
    async fetchDownload(appRoute: string, version: string, arch?: ArchResolvable) {
        const actualArch = arch || this._options.arch

        // @Validate
        this._match(appRoute, 'appRoute', 'APP_ROUTE_REGEX')
        this._match(version, 'version', 'EXTENDED_SEMVER_REGEX')
        this._match(actualArch, 'arch', 'ARCH_REGEX')

        const url = `${APKMirrorScraper.APK_ROUTE}/${this._ver(appRoute, version)}`

        const $ = load(await this._u2t(url))
        // * Get any div that contains the device arch or is universal (if exact arch is not available)
        // * Or just fallback architectures if available
        let href = 
            $(`div:contains("${actualArch}")`)
                .parent()
                .children('div[class^="table-cell rowheight"]')
                .first()
                .children('a[class="accent_color"]')
                .first()
                .attr('href')
        
        if (!href) {
            for (const fa of APKMirrorScraper.FALLBACK_ARCH[actualArch!]) {
                const hr = $(`div:contains("${fa}")`)
                    .parent()
                    .children('div[class^="table-cell rowheight"]')
                    .first()
                    .children('a[class="accent_color"]')
                    .first()
                    .attr('href')
                if (!hr) continue
                href = hr
            }
        }
        

        if (!href) this.__twf()

        // * The redirect shenanigans

        const downloadPageBody = await this._u2t(`${APKMirrorScraper.BASE_DOMAIN}${href}`)

        const finalPageUrl = load(downloadPageBody)('a[class^="accent_bg btn btn-flat downloadButton"]').first().attr('href')
        if (!finalPageUrl) this.__twf()

        const finalPageBody = await this._u2t(`${APKMirrorScraper.BASE_DOMAIN}${finalPageUrl}`)
        const downloadUrl = `${APKMirrorScraper.BASE_DOMAIN}${load(finalPageBody)('a[rel="nofollow"]').first().attr('href')}`

        if (!downloadUrl) this.__twf()
        return downloadUrl
    }

    private _ver(route: string, version: string) {
        // * APKMirror URLs uses dashes instead of dots
        // * The split-repeating part is required due to APKMirror link formats being... weird
        return `${route}/${route.split('/').at(-1)}-${version.replaceAll('.', '-')}-release`
    }
    
    private _match(something: any, property: string, ...regexes: KeysWith<typeof APKMirrorScraper, RegExp>[]) {
        for (const key of regexes) {
            const regex = APKMirrorScraper[key]
            if (!regex.test(something)) throw new APKMirrorScraperError('BAD_OPTIONS', property, 'match', [regex.source])
        }
        return true
    }

    private async _req(url: string) {
        const res = await fetch(url, {
            headers: APKMirrorScraper.REQUEST_HEADERS
        })

        if (!res.ok) throw new APKMirrorScraperError('REQUEST_NOT_OK', res.status)
        return res
    }

    private async _u2t(url: string) {
        const res = await this._req(url)

        return await res.text()
    }

    private async _scrape(res: Response): Promise<APKMirrorScraperAppVersion[]> {
        const { throwOnFailedVersionValidation: TOFV, throwOnBadWebFormat: TOFW } = this._options

        const isElement = (element: ChildNode | null | undefined): element is Element => element instanceof Element
        const isText = (element: ChildNode | null | undefined): element is Text => element instanceof Text

        // * List all elements which is an info slide
        const infoSlides = load(await res.text())('#primary div.infoSlide.t-height').get()
        const versions: APKMirrorScraperAppVersion[] = []

        for (const slide of infoSlides) {

            // * Find anything that is a paragraph
            const p = slide.children.find(child => {
                if (!isElement(child)) return false
                return child.name === 'p'
            })

            if (!isElement(p)) {
                if (TOFW) this.__twf()
                continue
            }

            // * Inside that paragraph, find a span child with class name "infoSlide-value"
            const span = p.children.find(child => {
                return isElement(child) && child.name === 'span' &&
                    child['attribs']?.['class'] === 'infoSlide-value'
            })

            if (!span || !isElement(span)) {
                if (TOFW) this.__twf()
                continue
            }

            // * Find the first text inside, needs to be validated 2 times because,
            // * <Array>.find() does not automatically throw an error when something is not found
            const element = span.children.find(child => isText(child))
            if (!isText(element)) {
                if (TOFW) this.__twf()
                continue
            }

            // * Trim spaces in front and behind of the versions and try to match it with the extended semver regex
            const text = element.data.trim()
            const matches = text.match(APKMirrorScraper.EXTENDED_SEMVER_REGEX)
            if (!matches || !matches[0] || matches.length > 1) {
                if (TOFV) this.__tv()
                continue
            }

            // * Sanatize the version (to match usable URL version)
            const sanatized = matches[0] ? matches[0].replaceAll(' ', '').toLowerCase() : null
            versions.push({ title: matches[0], version: sanatized })
        }

        return versions
    }

    private __tv(): never {
        throw new APKMirrorScraperError('VERSION_UNMATCH')
    }

    private __twf(): never {
        this.__twf()
    }

    private __twr(): never {
        throw new APKMirrorScraperError('INVALID_WEB_ROUTE')
    }
}

export interface APKMirrorScraperOptions {
    /**
     * Device architecture
     * @default "arm64-v8a"
     */
    arch?: ArchResolvable
    /**
     * Whether to throw when failed version validations while fetching versions happen.
     * **ERRORS WILL STILL THROW**! If the scraper cannot find a single version.
     * @default false
     */
    throwOnFailedVersionValidation?: boolean
    /**
     * Whether to throw when receiving bad web formatting while fetching versions.
     * **ERRORS WILL STILL THROW**! If the scraper cannot find a single version.
     * @default false
     */
    throwOnBadWebFormat?: boolean
    /**
     * Whether to use any other architecture that supports the same instruction sets
     */
    useFallbackArch?: boolean
}

export interface APKMirrorScraperAppVersion {
    /**
     * Actual version given by APKMirror, if `throwOnFailedValidation` is set to `false`, it will always be available while `versionData.version` will be `null`
     */
    title: string
    /**
     * Sanatized version, can be used with the `semver` package for many operations
     */
    version: string | null
}

export type ArchResolvable = 'arm64-v8a' | 'armeabi-v7a' | 'x86_64' | 'x86'

const APKMirrorScraperErrorMessages = {
    'REQUEST_NOT_OK': (code?: number) => `Host did not return an OK status code after fetching${code ? `, status code was ${code}` : ''}`,
    'INVALID_WEB_FORMAT': 'Host may have changed website formatting, cannot scrape',
    'INVALID_WEB_ROUTE': 'Host may have changed website routing configuration, cannot scrape',
    'VERSION_UNMATCH': 'Version string format is not supported, please make an issue about this',
    'BAD_OPTIONS': (property?: string, what?: string, should?: string[]) => `Bad options${property ? ` for ${property}${isNotEmptyArray(should) ? `, must ${what} ${should!.join(', ')}` : ''}` : ''}`
} as const

const APKMirrorScraperError = new CustomErrorConstructor(Error, APKMirrorScraperErrorMessages).error