/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: "app",
      preset: "jest-expo",
      testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
      setupFiles: ["<rootDir>/jest.setup.app.js"],
      moduleNameMapper: {
        "^react-native-vector-icons$": "@expo/vector-icons",
        "^react-native-vector-icons/(.*)": "@expo/vector-icons/$1",
        "\\.css$": "<rootDir>/jest.cssStub.js",
      },
    },
    {
      displayName: "api",
      testEnvironment: "node",
      testMatch: ["<rootDir>/api/**/*.test.ts"],
      setupFiles: ["<rootDir>/jest.setup.api.js"],
      transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/api/tsconfig.json" }],
      },
    },
  ],
};
