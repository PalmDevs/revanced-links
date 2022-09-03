import { Octokit } from '@octokit/rest'
import { RequestError } from '@octokit/request-error'
import CustomErrorConstructor from '../util/CustomErrorConstructor.js'

export default class RepositoryFetcher {
    private readonly _octokit: Octokit
    protected readonly _options: RepositoryFetcherOptions

    /**
     * @param options Configurations and options
     * @example
     * import { RepositoryFetcher } from 'revanced-links'
     * 
     * const fetcher = new RepositoryFetcher({
     *     repositoryOwner: 'PalmDevs',
     *     repositoryName: 'revanced-links'
     *     apiKey: 'secret123',
     *     dataPerPage: 10
     * })
     */
    constructor(options: RepositoryFetcherOptions) {
        this._options = options
        this._octokit = new Octokit({
            auth: this._options.apiKey
        })
    }

    /**
     * Fetches releases from the repository
     * @param page The page number to fetch
     * @returns An array of releases object
     * @example
     * import { RepositoryFetcher } from 'revanced-links'
     * 
     * const fetcher = new RepositoryFetcher({ ... })
     * const releases = await fetcher.fetchReleases()
     */
    async fetchReleases(page: number = 0) {
        try {
            const { data: releases } = await this._octokit.rest.repos.listReleases({
                owner: this._options.repositoryOwner,
                repo: this._options.repositoryName,
                per_page: this._options.dataPerPage ?? 100,
                page
            })

            return releases
        } catch (e: unknown) {
            this._handleRequestError(e)
        }
    }

    /**
     * Fetches the latest release from the repository
     * @returns A release object
     * @example
     * import { RepositoryFetcher } from 'revanced-links'
     * 
     * const fetcher = new RepositoryFetcher({ ... })
     * const releases = await fetcher.fetchLatestRelease()
     */
    async fetchLatestRelease() {
        try {
            const { data: release } = await this._octokit.rest.repos.getLatestRelease({
                owner: this._options.repositoryOwner,
                repo: this._options.repositoryName,
            })

            return release
        } catch(e: unknown) {
            this._handleRequestError(e)
        }
    }

    private _handleRequestError(e: unknown): never {
        if (!(e instanceof RequestError)) throw new RepositoryFetcherError('UNKNOWN_ERROR', e)
        if (e.status === 404) throw new RepositoryFetcherError('NOT_FOUND')
        if (e.status === 429) throw new RepositoryFetcherError('RATELIMITED', !!this._options.apiKey)
        if (e.status < 500 && e.status > 399) throw new RepositoryFetcherError('BAD_REQUEST', e.status)
        if (e.status > 499 && e.status < 600) throw new RepositoryFetcherError('BAD_HOST')
        throw new RepositoryFetcherError('UNKNOWN_REQUEST_ERROR', e)
    }
}

export interface RepositoryFetcherOptions {
    /**
     * Repository owner
     */
    repositoryOwner: string
    /**
     * Repository name
     */
    repositoryName: string
    /**
     * GitHub API key
     */
    apiKey?: string
    /**
     * Amount of releases (data) per page
     * GitHub uses pagination for their APIs
     */
    dataPerPage?: number
}

const RepositoryFetcherErrorMessages = {
    'UNKNOWN_ERROR': (e: unknown) => `Cannot identify the error, ${e}`,
    'UNKNOWN_REQUEST_ERROR': (e: RequestError) => `Cannot identify what's wrong, ${e}`,
    'NOT_FOUND': 'Repository not found',
    'BAD_REQUEST': (code: number) => `Bad request data, status code ${code}`,
    'RATELIMITED': (keyExists?: boolean) => `You are ratelimited from GitHub! ${keyExists ? 'You already have an API key, check your code if there is any non-ending loop' : 'Please make an API key'}`,
    'BAD_HOST': 'Host returned with a 5xx code'
} as const

const RepositoryFetcherError = new CustomErrorConstructor(Error, RepositoryFetcherErrorMessages).error