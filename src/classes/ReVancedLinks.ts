import AppPackageFetcher, { AppPackageFetcherOptions } from './AppPackageFetcher.js'
import ReVancedFetcher from './ReVancedFetcher.js'
import { ReVancedRepositoryFetcherChildrenOptions } from './ReVancedRepositoryFetcher.js'

export default class ReVancedLinks {
    private readonly _options: ReVancedLinksOptions
    readonly revanced: ReVancedFetcher
    readonly packages: AppPackageFetcher

    /**
     * The combined version of all utilities! **POWER!**
     * @param options Configurations and options
     */
    constructor(options: ReVancedLinksOptions = {}) {
        this._options = options
        this.revanced = new ReVancedFetcher(this._options.gitHubSettings)
        this.packages = new AppPackageFetcher(this._options.appFetcherSettings)
    }
}

export interface ReVancedLinksOptions {
    appFetcherSettings?: AppPackageFetcherOptions
    gitHubSettings?: ReVancedRepositoryFetcherChildrenOptions
}