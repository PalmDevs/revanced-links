import AppPackageFetcher, { AppPackageFetcherOptions } from './AppPackageFetcher.js'
import ReVancedFetcher from './ReVancedFetcher.js'
import { ReVancedRepositoryFetcherChildrenOptions } from './ReVancedRepositoryFetcher.js'

export default class ReVancedDownloadLinks {
    private readonly _options: ReVancedDownloadLinksOptions
    readonly revanced: ReVancedFetcher
    readonly packages: AppPackageFetcher

    /**
     * The combined version of all utilities! **POWER!**
     * @param options Configurations and options
     */
    constructor(options: ReVancedDownloadLinksOptions = {}) {
        this._options = options
        this.revanced = new ReVancedFetcher(this._options)
        this.packages = new AppPackageFetcher(this._options.appFetcherSettings)
    }
}

export interface ReVancedDownloadLinksOptions {
    appFetcherSettings?: AppPackageFetcherOptions
    gitHubSettings?: ReVancedRepositoryFetcherChildrenOptions
}