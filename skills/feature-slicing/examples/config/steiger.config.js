// steiger.config.js
/**
 * Steiger configuration for Feature-Sliced Design linting.
 *
 * @description
 * Steiger is an architectural linter specifically designed for FSD projects.
 * This configuration enforces FSD conventions and catches common violations.
 *
 * Rules enabled:
 * - `no-public-api-sidestep`: Prevents importing from slice internals
 * - `no-layer-public-api`: Ensures layers have proper public API exports
 * - `no-cross-imports`: Prevents horizontal imports between slices at same layer
 * - `no-ui-in-app`: Prevents UI components in the app layer (app is for wiring)
 *
 * @example
 * ```bash
 * # Run Steiger to check FSD compliance
 * npx steiger ./src
 * ```
 *
 * @see https://github.com/feature-sliced/steiger
 */
module.exports = {
  /** Root directory of the FSD source code. */
  root: './src',

  /** FSD-specific linting rules. */
  rules: {
    /** Prevents bypassing slice public APIs. */
    'no-public-api-sidestep': 'error',

    /** Ensures each layer exports a proper public API. */
    'no-layer-public-api': ['error', { severity: 'error' }],

    /** Prevents imports between slices at the same layer level. */
    'no-cross-imports': 'error',

    /** Ensures the app layer only contains wiring, not UI components. */
    'no-ui-in-app': 'error',
  },
};
