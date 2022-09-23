import AppPackageScraper, { AppPackageScraperOptions } from './AppPackageScraper.js'
import MicroGFetcher from './MicroGFetcher.js'
import ReVancedFetcher from './ReVancedFetcher.js'
import { ReVancedRepositoryFetcherChildrenOptions } from './ReVancedRepositoryFetcher.js'

export default class ReVancedLinks {
    private readonly _options: ReVancedLinksOptions
    readonly revanced: ReVancedFetcher
    readonly packages: AppPackageScraper
    readonly microg: MicroGFetcher

    /**
     * The combined version of all utilities! **POWER!**
     * @param options Configurations and options
     */
    constructor(options: ReVancedLinksOptions = {}) {
        this._options = options
        this.revanced = new ReVancedFetcher(this._options.gitHubSettings)
        this.packages = new AppPackageScraper(this._options.appFetcherSettings)
        this.microg = new MicroGFetcher(this._options.gitHubSettings)
    }
}

export interface ReVancedLinksOptions {
    /**
     * Configuration for APKMirror scrapers
     */
    appFetcherSettings?: AppPackageScraperOptions
    /**
     * Configuration for repository fetchers
     */
    gitHubSettings?: ReVancedRepositoryFetcherChildrenOptions
}