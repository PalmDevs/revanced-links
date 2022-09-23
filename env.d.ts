declare global {
    namespace NodeJS {
        interface ProcessEnv {
            GITHUB_KEY?: string
        }
    }
}