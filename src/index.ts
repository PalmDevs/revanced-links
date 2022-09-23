import AppPackageScraper, { App, AppCategory } from './classes/AppPackageScraper.js'
import RepositoryReleasesFetcher from './classes/RepositoryReleasesFetcher.js'
import ReVancedLinks from './classes/ReVancedLinks.js'
import ReVancedFetcher from './classes/ReVancedFetcher.js'
import { ReVancedCLIFetcher, ReVancedIntegrationsFetcher, ReVancedPatchesFetcher } from './classes/ReVancedRepositoryFetcher.js'
import APKMirrorScraper from './classes/APKMirrorScraper.js'
import MicroGFetcher from './classes/MicroGFetcher.js'

import type { AppPackageScraperOptions, AppVersion, ArchResolvable } from './classes/AppPackageScraper.js'
import type { APKMirrorScraperAppVersion, APKMirrorScraperOptions } from './classes/APKMirrorScraper.js'
import type { RepositoryReleasesFetcherOptions } from './classes/RepositoryReleasesFetcher.js'
import type { ReVancedLinksOptions } from './classes/ReVancedLinks.js'
import type { ReVancedFetcherOptions } from './classes/ReVancedFetcher.js'
import type { ReVancedPatchesRelease, ReVancedRepositoryFetcherChildrenOptions } from './classes/ReVancedRepositoryFetcher.js'
import type { MicroGFetcherOptions } from './classes/MicroGFetcher.js'

export { MicroGFetcher, MicroGFetcherOptions }
export { ReVancedLinks, ReVancedLinksOptions }
export { APKMirrorScraper, APKMirrorScraperOptions, APKMirrorScraperAppVersion }
export { AppPackageScraper, AppPackageScraperOptions, App, AppVersion, AppCategory, ArchResolvable }
export { RepositoryReleasesFetcher, RepositoryReleasesFetcherOptions }
export { ReVancedFetcher, ReVancedFetcherOptions }
export { ReVancedPatchesFetcher, ReVancedIntegrationsFetcher, ReVancedCLIFetcher, ReVancedPatchesRelease, ReVancedRepositoryFetcherChildrenOptions }