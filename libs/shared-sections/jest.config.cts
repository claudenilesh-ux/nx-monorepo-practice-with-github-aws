module.exports = {
  displayName: 'shared-sections',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: { '^@nx-learning/shared-ui$': '<rootDir>/../shared-ui/src/index.ts' },
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', useESM: true }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/shared-sections'
};
