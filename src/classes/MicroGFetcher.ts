import valid from 'semver/functions/valid.js'
import CustomErrorConstructor from '../util/CustomErrorConstructor.js'
import RepositoryReleasesFetcher from './RepositoryReleasesFetcher.js'
import { ReVancedRepositoryFetcherChildrenOptions, ReVancedRepositoryReleaseAssets } from './ReVancedRepositoryFetcher.js'

export default class MicroGFetcher {
    private readonly _fetcher: RepositoryReleasesFetcher
    private readonly _options: MicroGFetcherOptions

    /**
     * Fetches releases from the `VancedMicroG` repository.
     * @param options Configurations and options
     */
    constructor(options: MicroGFetcherOptions = {}) {
        this._options = Object.assign<MicroGFetcherOptions, MicroGFetcherOptions>({ throwOnFailedValidation: false }, options)
        this._fetcher = new RepositoryReleasesFetcher({
            repositoryName: 'VancedMicroG',
            repositoryOwner: 'TeamVanced',
            ...this._options
        })
    }

    /**
     * Fetches releases from the `VancedMicroG` repository.
     * @param page The page number to fetch
     * @returns An array of MicroG release data objects
     */
    async fetch(page?: number): Promise<MicroGReleaseAssets[]> {
        const releases = await this._fetcher.fetch(page)
        return releases.map(this._mapRelease)
    }

    /**
     * Fetches the latest release from the `VancedMicroG` repository.
     * @returns MicroG release data object
     */
    async fetchLatest(): Promise<MicroGReleaseAssets> {
        return this._mapRelease(await this._fetcher.fetchLatest())
    }

    private _mapRelease(release: Awaited<ReturnType<RepositoryReleasesFetcher['fetchLatest']>>) {
        const { tag_name: version, assets, prerelease } = release
        const validatedVersion = valid(version)
        if (!validatedVersion && this._options.throwOnFailedValidation) throw new MicroGFetcherError('FAILED_TO_VALIDATE_VERSION', version)
        return { version: validatedVersion, assets: assets.map((asset) => asset.browser_download_url), tagName: version, prerelease }
    }
}

export type MicroGFetcherOptions = ReVancedRepositoryFetcherChildrenOptions
export type MicroGReleaseAssets = ReVancedRepositoryReleaseAssets

const MicroGFetcherErrorMessages = {
    FAILED_TO_VALIDATE_VERSION: (v: string) => `Failed to validate version: ${v}`
}
const MicroGFetcherError = new CustomErrorConstructor(Error, MicroGFetcherErrorMessages).error