import AppPackageFetcher, { App, AppPackageFetcherOptions, AppVersion, ArchResolvable } from './classes/AppPackageFetcher.js'
import RepositoryFetcher, { RepositoryFetcherOptions } from './classes/RepositoryFetcher.js'
import ReVancedDownloadLinks, { ReVancedDownloadLinksOptions } from './classes/ReVancedDownloadLinks.js'
import ReVancedFetcher, { ReVancedFetcherOptions } from './classes/ReVancedFetcher.js'
import { ReVancedCLIFetcher, ReVancedIntegrationsFetcher, ReVancedPatchesFetcher, ReVancedPatchesAssets, ReVancedRepositoryFetcherChildrenOptions } from './classes/ReVancedRepositoryFetcher.js'

export { ReVancedDownloadLinks, ReVancedDownloadLinksOptions }
export { AppPackageFetcher, AppPackageFetcherOptions, App, AppVersion, ArchResolvable }
export { RepositoryFetcher, RepositoryFetcherOptions }
export { ReVancedFetcher, ReVancedFetcherOptions }
export { ReVancedPatchesFetcher, ReVancedIntegrationsFetcher, ReVancedCLIFetcher, ReVancedPatchesAssets, ReVancedRepositoryFetcherChildrenOptions }