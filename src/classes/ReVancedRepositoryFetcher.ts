import { RestEndpointMethodTypes } from '@octokit/rest'
import RepositoryFetcher from './RepositoryFetcher'

export default class ReVancedRepositoryFetcher extends RepositoryFetcher {
    constructor(options: ReVancedRepositoryFetcherOptions) {
        super({ repositoryOwner: 'revanced', ...options })
    }
}

export class ReVancedPatchesFetcher {
    private readonly _fetcher: ReVancedRepositoryFetcher

    constructor(options: ReVancedRepositoryFetcherChildrenOptions = {}) {
        this._fetcher = newFetcherInstanceForRepo('revanced-patches', options)
    }

    async fetchReleases(page?: number): Promise<ReVancedPatchesAssets[]> {
        const releases = await this._fetcher.fetchReleases(page)
        return releases.map(release => release.assets).map(ReVancedPatchesFetcher.mapRelease)
    }

    async fetchLatestRelease(): Promise<ReVancedPatchesAssets> {
        const release = await this._fetcher.fetchLatestRelease()
        return ReVancedPatchesFetcher.mapRelease(release.assets)
    }

    static mapRelease(assets: RawReleaseAssets): ReVancedPatchesAssets {
        return Object.fromEntries(
            Object.entries(assets.map(asset => asset.browser_download_url))
                  .map(([ _, value ]) => [value.split('.').at(-1)!, value] as const)
        ) as unknown as ReVancedPatchesAssets
    }
}

export class ReVancedCLIFetcher {
    private readonly _fetcher: ReVancedRepositoryFetcher

    constructor(options: ReVancedRepositoryFetcherChildrenOptions = {}) {
        this._fetcher = newFetcherInstanceForRepo('revanced-cli', options)
    }

    async fetchReleases(page?: number): Promise<string[][]> {
        const releases = await this._fetcher.fetchReleases(page)
        return releases.map(release => release.assets.map(asset => asset.browser_download_url))
    }

    async fetchLatestRelease(): Promise<string[]> {
        const release = await this._fetcher.fetchLatestRelease()
        return release.assets.map(asset => asset.browser_download_url)
    }
}

export class ReVancedIntegrationsFetcher {
    private readonly _fetcher: ReVancedRepositoryFetcher

    constructor(options: ReVancedRepositoryFetcherChildrenOptions = {}) {
        this._fetcher = newFetcherInstanceForRepo('revanced-integrations', options)
    }

    async fetchReleases(page?: number): Promise<string[][]> {
        const releases = await this._fetcher.fetchReleases(page)
        return releases.map(release => release.assets.map(asset => asset.browser_download_url))
    }

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
    jar: string
    dex: string | never
    json: string | never
}

export interface ReVancedRepositoryFetcherChildrenOptions {
    apiKey?: string
    dataPerPage?: number
}

export interface ReVancedRepositoryFetcherOptions {
    repositoryName: string
    apiKey?: string
    dataPerPage?: number
}