
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  clearMocks: true,

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },

  transform: {
    "^.+\\.tsx?$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          "@babel/preset-typescript"
        ]
      }
    ]
  }
};
