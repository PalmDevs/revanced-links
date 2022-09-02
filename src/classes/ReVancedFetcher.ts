import { ReVancedDownloadLinksOptions } from './ReVancedDownloadLinks'
import { ReVancedCLIFetcher, ReVancedIntegrationsFetcher, ReVancedPatchesFetcher } from './ReVancedRepositoryFetcher'

export default class ReVancedFetcher {
    private readonly _options: ReVancedFetcherOptions
    readonly patches: ReVancedPatchesFetcher
    readonly integrations: ReVancedIntegrationsFetcher
    readonly cli: ReVancedCLIFetcher

    constructor(options: ReVancedFetcherOptions) {
        this._options = options
        this.patches = new ReVancedPatchesFetcher(this._options.gitHubSettings)
        this.integrations = new ReVancedIntegrationsFetcher(this._options.gitHubSettings)
        this.cli = new ReVancedCLIFetcher(this._options.gitHubSettings)
    }

    async fetchLatestRelease() {
        const [cli, patches, integrations] = await Promise.all([this.cli.fetchLatestRelease(), this.patches.fetchLatestRelease(), this.integrations.fetchLatestRelease()])
        return { cli, patches, integrations }
    }
}

type ReVancedFetcherOptions = Omit<ReVancedDownloadLinksOptions, 'arch'>