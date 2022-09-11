import { RestEndpointMethodTypes } from '@octokit/rest'
import RepositoryFetcher from './RepositoryFetcher.js'

export default class ReVancedRepositoryFetcher extends RepositoryFetcher {

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

    /**
     * Fetches releases from the `revanced-patches` repository.
     * @param options Configurations and options
     */
    constructor(options: ReVancedRepositoryFetcherChildrenOptions = {}) {
        this._fetcher = newFetcherInstanceForRepo('revanced-patches', options)
    }

    /**
     * Fetches releases from the `revanced-patches` repository.
     * @param page The page number to fetch
     * @returns An array of patches release assets objects
     */
    async fetchReleases(page?: number): Promise<ReVancedPatchesAssets[]> {
        const releases = await this._fetcher.fetchReleases(page)
        return releases.map(release => release.assets).map(this._mapRelease)
    }

    /**
     * Fetches the latest release from the `revanced-patches` repository.
     * @returns A patches release asset object
     */
    async fetchLatestRelease(): Promise<ReVancedPatchesAssets> {
        const release = await this._fetcher.fetchLatestRelease()
        return this._mapRelease(release.assets)
    }

    private _mapRelease(assets: RawReleaseAssets): ReVancedPatchesAssets {
        return Object.fromEntries(
            Object.entries(assets.map(asset => asset.browser_download_url))
                  .map(([ _, value ]) => [value.split('.').at(-1)!, value] as const)
        ) as unknown as ReVancedPatchesAssets
    }
}

export class ReVancedCLIFetcher {
    private readonly _fetcher: ReVancedRepositoryFetcher

    /**
     * Fetches releases from the `revanced-cli` repository.
     * @param options Configurations and options
     */
    constructor(options: ReVancedRepositoryFetcherChildrenOptions = {}) {
        this._fetcher = newFetcherInstanceForRepo('revanced-cli', options)
    }

    /**
     * Fetches releases from the `revanced-cli` repository.
     * @param page The page number to fetch
     * @returns An array of CLI release assets download URL
     */
    async fetchReleases(page?: number): Promise<string[][]> {
        const releases = await this._fetcher.fetchReleases(page)
        return releases.map(release => release.assets.map(asset => asset.browser_download_url))
    }

    /**
     * Fetches the latest release from the `revanced-cli` repository.
     * @returns CLI release assets download URL
     */
    async fetchLatestRelease(): Promise<string[]> {
        const release = await this._fetcher.fetchLatestRelease()
        return release.assets.map(asset => asset.browser_download_url)
    }
}

export class ReVancedIntegrationsFetcher {
    private readonly _fetcher: ReVancedRepositoryFetcher

    /**
     * Fetches releases from the `revanced-integrations` repository.
     * @param options Configurations and options
     */
    constructor(options: ReVancedRepositoryFetcherChildrenOptions = {}) {
        this._fetcher = newFetcherInstanceForRepo('revanced-integrations', options)
    }

    /**
     * Fetches releases from the `revanced-integrations` repository.
     * @param page The page number to fetch
     * @returns An array of integrations release assets download URL
     */
    async fetchReleases(page?: number): Promise<string[][]> {
        const releases = await this._fetcher.fetchReleases(page)
        return releases.map(release => release.assets.map(asset => asset.browser_download_url))
    }

    /**
     * Fetches the latest release from the `revanced-integrations` repository.
     * @returns Integrations release assets download URL
     */
    async fetchLatestRelease(): Promise<string[]> {
        const release = await this._fetcher.fetchLatestRelease()
        return release.assets.map(asset => asset.browser_download_url)
    }
}

export function newFetcherInstanceForRepo(name: string, options: ReVancedRepositoryFetcherChildrenOptions = {}) {
    return new ReVancedRepositoryFetcher({ repositoryName: name, ...options })
}

export type RawReleaseAssets = RestEndpointMethodTypes["repos"]["listReleases"]["response"]["data"][number]["assets"]

export interface ReVancedPatchesAssets {
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

export interface ReVancedRepositoryFetcherChildrenOptions {
    /**
     * GitHub API key
     */
    apiKey?: string
    /**
     * Amount of releases (data) per page
     * GitHub uses pagination for their APIs
     */
    dataPerPage?: number
}

export interface ReVancedRepositoryFetcherOptions {
    /**
     * Repository name (github.com/revanced MUST have this repository)
     */
    repositoryName: string
    /**
     * GitHub API key
     */
    apiKey?: string
    /**
     * Amount of releases (data) per page
     * GitHub uses pagination for their APIs
     */
    dataPerPage?: number
}