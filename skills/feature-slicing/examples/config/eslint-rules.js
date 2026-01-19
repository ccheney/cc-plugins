// .eslintrc.js - FSD import rules
/**
 * ESLint configuration for enforcing Feature-Sliced Design import rules.
 *
 * @description
 * This configuration prevents architectural violations in FSD projects:
 *
 * 1. **No deep imports into slices**: Forces use of public APIs (index.ts)
 *    instead of reaching into internal slice structure.
 *
 * 2. **No upward imports**: Prevents lower layers from importing higher layers.
 *    The layer hierarchy (bottom to top): shared → entities → features →
 *    widgets → pages → app.
 *
 * @example
 * ```js
 * // These imports would trigger errors:
 * import { User } from 'entities/user/model/types';  // deep import
 * import { Header } from 'app/layout';               // upward import
 *
 * // These are allowed:
 * import { User } from 'entities/user';              // public API
 * import { Button } from 'shared/ui';                // lower layer
 * ```
 *
 * @see https://feature-sliced.design/docs/reference/isolation
 */
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          // Forbid deep imports into slices
          'entities/*/*',
          'features/*/*',
          'widgets/*/*',
          'pages/*/*',
          // Forbid upward imports
          {
            group: ['app/*'],
            message: 'Cannot import from app layer in lower layers',
          },
        ],
      },
    ],
  },
};
