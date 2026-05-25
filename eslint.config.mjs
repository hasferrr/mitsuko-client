import nextTypescript from "eslint-config-next/typescript"
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([...nextTypescript, ...nextVitals, {
  rules: {
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    '@next/next/no-img-element': 'off',
    'react-hooks/set-state-in-effect': 'off',
  },
}, {
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/components/link.tsx'],
  rules: {
    'no-restricted-imports': ['error', {
      paths: [{
        name: 'next/link',
        message: 'Use @/components/link instead to respect route-level prefetch policy.',
      }],
    }],
  },
}, globalIgnores([
  '.next/**',
  '.netlify/**',
  '.kilo/**',
  'out/**',
  'build/**',
  'next-env.d.ts',
  'src/components/ui/**/*',
])])

export default eslintConfig
