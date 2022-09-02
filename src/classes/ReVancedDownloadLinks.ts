import AppPackageFetcher from './AppPackageFetcher'
import { ArchResolvable } from './AppPackageScraper'
import ReVancedFetcher from './ReVancedFetcher'

export default class ReVancedDownloadLinks {
    private readonly _options: ReVancedDownloadLinksOptions
    readonly revanced: ReVancedFetcher
    readonly packages: AppPackageFetcher

    constructor(options: ReVancedDownloadLinksOptions = {}) {
        this._options = options
        this.revanced = new ReVancedFetcher(this._options)
        this.packages = new AppPackageFetcher(this._options.appFetcherSettings)
    }
}

export interface ReVancedDownloadLinksOptions {
    appFetcherSettings?: {
        arch?: ArchResolvable
    }
    gitHubSettings?: {
        apiKey?: string
        dataPerPage?: number
    }
}