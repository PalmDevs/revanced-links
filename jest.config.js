/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      }
    ],
    "^.+\\.(js)$": "babel-jest",
  },
  transformIgnorePatterns: [],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  preset: 'ts-jest/presets/default-esm'
}