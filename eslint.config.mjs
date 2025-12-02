import nextConfig from 'eslint-config-next';

const config = [
  {
    ignores: ['.next/**', 'node_modules/**']
  },
  ...nextConfig,
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@next/next/no-html-link-for-pages': 'off'
    }
  }
];

export default config;
