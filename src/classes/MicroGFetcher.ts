import RepositoryFetcher from './RepositoryFetcher.js'
import { ReVancedLinksOptions } from './ReVancedLinks.js'

export default class MicroGFetcher {
    private readonly _fetcher: RepositoryFetcher

    /**
     * Fetches releases from the `VancedMicroG` repository.
     * @param options Configurations and options
     */
    constructor(options: MicroGFetcherOptions = {}) {
        this._fetcher = new RepositoryFetcher({
            repositoryName: 'VancedMicroG',
            repositoryOwner: 'TeamVanced',
            ...options
        })
    }

    /**
     * Fetches releases from the `VancedMicroG` repository.
     * @param page The page number to fetch
     * @returns An array of CLI release assets download URL
     */
    async fetchReleases(page?: number): Promise<string[][]> {
        const releases = await this._fetcher.fetchReleases(page)
        return releases.map(release => release.assets.map(asset => asset.browser_download_url))
    }

    /**
     * Fetches the latest release from the `VancedMicroG` repository.
     * @returns CLI release assets download URL
     */
    async fetchLatestRelease(): Promise<string[]> {
        const release = await this._fetcher.fetchLatestRelease()
        return release.assets.map(asset => asset.browser_download_url)
    }
}

export type MicroGFetcherOptions = ReVancedLinksOptions['gitHubSettings']