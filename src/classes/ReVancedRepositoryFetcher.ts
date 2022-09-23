import valid from 'semver/functions/valid.js'
import CustomErrorConstructor from '../util/CustomErrorConstructor.js'
import RepositoryReleasesFetcher, { RepositoryReleasesFetcherOptions } from './RepositoryReleasesFetcher.js'

export default class ReVancedRepositoryFetcher extends RepositoryReleasesFetcher {

    /**
     * Fetches releases from ReVanced-owned repositories.
     * @param options Configurations and options
     * @example
     * import { ReVancedRepositoryFetcher } from 'revanced-links'
     * 
     * const fetcher = new ReVancedRepositoryFetcher({
     *     repositoryName: 'revanced-manager',
     *     apiKey: 'secret123',
     *     dataPerPage: 10
     * })
     */
    constructor(options: ReVancedRepositoryFetcherOptions) {
        super({ repositoryOwner: 'revanced', ...options })
    }
}

export class ReVancedPatchesFetcher {
    private readonly _fetcher: ReVancedRepositoryFetcher
    private readonly _options: ReVancedRepositoryFetcherChildrenOptions

    /**
     * Fetches releases from the `revanced-patches` repository.
     * @param options Configurations and options
     */
    constructor(options: ReVancedRepositoryFetcherChildrenOptions = {}) {
        this._options = options
        this._fetcher = newFetcherInstanceForRepo('revanced-patches', this._options)
    }

    /**
     * Fetches releases from the `revanced-patches` repository.
     * @param page The page number to fetch
     * @returns An array of integrations release assets download URL
     */
    async fetch(page?: number): Promise<ReVancedPatchesRelease[]> {
        const releases = await this._fetcher.fetch(page)
        return releases.map(this._mapRelease)
    }

    /**
     * Fetches the latest release from the `revanced-patches` repository.
     * @returns Integrations release assets download URL
     */
    async fetchLatest(): Promise<ReVancedPatchesRelease> {
        return this._mapRelease(await this._fetcher.fetchLatest())
    }

    private _mapRelease(release: Awaited<ReturnType<RepositoryReleasesFetcher['fetchLatest']>>): ReVancedPatchesRelease {
        const { assets, tag_name: version, prerelease } = release
        const mappedAssets = Object.fromEntries(
            Object.entries(assets.map(asset => asset.browser_download_url))
                  .map(([ _, value ]) => [value.split('.').at(-1)!, value] as const)
        ) as unknown as ReVancedPatchesRelease['assets']
        const validatedVersion = valid(version)
        if (!validatedVersion && this._options.throwOnFailedValidation) throw new ReVancedRepositoryFetcherChildrenError('FAILED_TO_VALIDATE_VERSION', version)
        return { version: validatedVersion, assets: mappedAssets, tagName: version, prerelease }
    }
}

export class ReVancedCLIFetcher {
    private readonly _fetcher: ReVancedRepositoryFetcher
    private readonly _options: ReVancedRepositoryFetcherChildrenOptions

    /**
     * Fetches releases from the `revanced-cli` repository.
     * @param options Configurations and options
     */
    constructor(options: ReVancedRepositoryFetcherChildrenOptions = {}) {
        this._options = options
        this._fetcher = newFetcherInstanceForRepo('revanced-cli', this._options)
    }

    /**
     * Fetches releases from the `revanced-cli` repository.
     * @param page The page number to fetch
     * @returns An array of integrations release assets download URL
     */
    async fetch(page?: number): Promise<ReVancedRepositoryReleaseAssets[]> {
        const releases = await this._fetcher.fetch(page)
        return releases.map(({ tag_name: version, assets, prerelease }) => {
            const validatedVersion = valid(version)
            if (!validatedVersion && this._options.throwOnFailedValidation) throw new ReVancedRepositoryFetcherChildrenError('FAILED_TO_VALIDATE_VERSION', version)
            return { version: validatedVersion, assets: assets.map((asset) => asset.browser_download_url), tagName: version, prerelease }
        })
    }

    /**
     * Fetches the latest release from the `revanced-cli` repository.
     * @returns Integrations release assets download URL
     */
    async fetchLatest(): Promise<ReVancedRepositoryReleaseAssets> {
        return this._mapRelease(await this._fetcher.fetchLatest())
    }

    private _mapRelease(release: Awaited<ReturnType<RepositoryReleasesFetcher['fetchLatest']>>) {
        const { tag_name: version, assets, prerelease } = release
        const validatedVersion = valid(version)
        if (!validatedVersion && this._options.throwOnFailedValidation) throw new ReVancedRepositoryFetcherChildrenError('FAILED_TO_VALIDATE_VERSION', version)
        return { version: validatedVersion, assets: assets.map((asset) => asset.browser_download_url), tagName: version, prerelease }
    }
}

export class ReVancedIntegrationsFetcher {
    private readonly _fetcher: ReVancedRepositoryFetcher
    private readonly _options: ReVancedRepositoryFetcherChildrenOptions

    /**
     * Fetches releases from the `revanced-integrations` repository.
     * @param options Configurations and options
     */
    constructor(options: ReVancedRepositoryFetcherChildrenOptions = {}) {
        this._options = options
        this._fetcher = newFetcherInstanceForRepo('revanced-integrations', this._options)
    }

    /**
     * Fetches releases from the `revanced-integrations` repository.
     * @param page The page number to fetch
     * @returns An array of integrations release assets download URL
     */
    async fetch(page?: number): Promise<ReVancedRepositoryReleaseAssets[]> {
        const releases = await this._fetcher.fetch(page)
        return releases.map(({ tag_name: version, assets, prerelease }) => {
            const validatedVersion = valid(version)
            if (!validatedVersion && this._options.throwOnFailedValidation) throw new ReVancedRepositoryFetcherChildrenError('FAILED_TO_VALIDATE_VERSION', version)
            return { version: validatedVersion, assets: assets.map((asset) => asset.browser_download_url), tagName: version, prerelease }
        })
    }

    /**
     * Fetches the latest release from the `revanced-integrations` repository.
     * @returns Integrations release assets download URL
     */
    async fetchLatest(): Promise<ReVancedRepositoryReleaseAssets> {
        return this._mapRelease(await this._fetcher.fetchLatest())
    }

    private _mapRelease(release: Awaited<ReturnType<RepositoryReleasesFetcher['fetchLatest']>>) {
        const { tag_name: version, assets, prerelease } = release
        const validatedVersion = valid(version)
        if (!validatedVersion && this._options.throwOnFailedValidation) throw new ReVancedRepositoryFetcherChildrenError('FAILED_TO_VALIDATE_VERSION', version)
        return { version: validatedVersion, assets: assets.map((asset) => asset.browser_download_url), tagName: version, prerelease }
    }
}

export function newFetcherInstanceForRepo(name: string, options: ReVancedRepositoryFetcherChildrenOptions = {}) {
    return new ReVancedRepositoryFetcher({ ...options, repositoryName: name })
}

const ReVancedRepositoryFetcherChildrenErrorMessages = {
    FAILED_TO_VALIDATE_VERSION: (v: string) => `Failed to validate version: ${v}`
}
const ReVancedRepositoryFetcherChildrenError = new CustomErrorConstructor(Error, ReVancedRepositoryFetcherChildrenErrorMessages).error

export interface ReVancedRepositoryReleaseAssets {
    /**
     * In case of failed validation and `throwOnFailedValidation` set to false, tag name will always be available for parsing
     */
    tagName: string
    /**
     * The version
     */
    version: string | null
    /**
     * An array of asset download URLs
     */
    assets: string[]
    /**
     * Whether this release is a pre-release
     */
    prerelease: boolean
}

export interface ReVancedPatchesRelease {
    /**
     * In case of failed validation and `throwOnFailedValidation` set to false, tag name will always be available for parsing
     */
    tagName: string
    /**
     * The version of the patches
     */
    version: string | null

    /**
     * An object with available file extension keys whose values are the download URLs of that specific file
     */
    assets: {
        /**
         * The JAR file download URL
         */
        jar: string
        /**
         * The DEX file download URL (this used to exist in older versions)
         */
        dex: string | never
        /**
         * The JSON file download URL (this does NOT exist in older versions)
         */
        json: string | never
    }
    /**
     * Whether this release is a pre-release
     */
    prerelease: boolean
}

export type ReVancedRepositoryFetcherChildrenOptions = Omit<ReVancedRepositoryFetcherOptions, 'repositoryName'> & { 
    /**
     * Whether to throw when failed validations happen
     * @default false
     */
    throwOnFailedValidation?: boolean 
}

export type ReVancedRepositoryFetcherOptions = Omit<RepositoryReleasesFetcherOptions, 'repositoryOwner'>