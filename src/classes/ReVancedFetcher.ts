import { ReVancedLinksOptions } from './ReVancedLinks.js'
import { ReVancedCLIFetcher, ReVancedIntegrationsFetcher, ReVancedPatchesFetcher } from './ReVancedRepositoryFetcher.js'

export default class ReVancedFetcher {
    private readonly _options: ReVancedFetcherOptions
    readonly patches: ReVancedPatchesFetcher
    readonly integrations: ReVancedIntegrationsFetcher
    readonly cli: ReVancedCLIFetcher

    /**
     * Fetches ReVanced essentials releases
     * @param options Configurations and options
     * @example
     * import { ReVancedFetcher } from 'revanced-downloads-links'
     * 
     * const fetcher = new ReVancedFetcher({
     *     appFetcherSettings: { ... },
     *     gitHubSettings: { ... }
     * })
     */
    constructor(options: ReVancedFetcherOptions) {
        this._options = options
        this.patches = new ReVancedPatchesFetcher(this._options.gitHubSettings)
        this.integrations = new ReVancedIntegrationsFetcher(this._options.gitHubSettings)
        this.cli = new ReVancedCLIFetcher(this._options.gitHubSettings)
    }

    /**
     * Fetches the latest release of ReVanced essentials
     * @returns An object with values containing asset releases
     * @example
     * import { ReVancedFetcher } from 'revanced-downloads-links'
     * 
     * const fetcher = new ReVancedFetcher({ ... })
     * const latestReleases = await fetcher.fetchLatestReleases()
     */
    async fetchLatestReleases() {
        const [cli, patches, integrations] = await Promise.all([this.cli.fetchLatestRelease(), this.patches.fetchLatestRelease(), this.integrations.fetchLatestRelease()])
        return { cli, patches, integrations }
    }
}

export type ReVancedFetcherOptions = Omit<ReVancedLinksOptions, 'arch'>