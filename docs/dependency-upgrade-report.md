# Dependency Upgrade Report

## Package Changes
| Package | Old Version | New Version | Reason |
| --- | --- | --- | --- |
| next | 14.2.5 | ^16.0.6 | Align with Next.js 16 release for React 19 support. |
| react | 18.3.1 | ^19.2.0 | Match React 19 requirement. |
| react-dom | 18.3.1 | ^19.2.0 | Match React 19 runtime. |
| firebase | ^11.0.2 | ^12.6.0 | Adopt Firebase Web SDK v12. |
| tailwindcss | ^3.4.14 | ^4.1.17 | Move to Tailwind CSS 4. |
| @tailwindcss/postcss | – | ^4.1.17 | Required PostCSS plugin for Tailwind 4. |
| postcss | ^8.4.47 | ^8.5.6 | Match Tailwind 4/PostCSS 8.5 toolchain. |
| typescript | ^5.6.3 | ^5.9.3 | Track TypeScript 5.9. |
| vitest | ^2.1.3 | ^4.0.14 | Update to Vitest 4. |
| @vitejs/plugin-react | ^4.3.1 | ^5.1.1 | Keep Vite plugin in sync with Vitest/Vite versions. |
| @testing-library/react | ^16.1.0 | ^16.3.0 | React 19 compatible RTL. |
| @testing-library/user-event | – | latest | Add RTL companion for user interactions. |
| @types/react | ^18.3.11 | ^19.2.7 | Match React 19 types. |
| @types/react-dom | ^18.3.0 | ^19.2.3 | Match React DOM 19 types. |
| eslint | ^8.57.1 | ^9.39.1 | Upgrade to ESLint 9 flat config. |
| eslint-config-next | ^14.2.5 | ^16.0.6 | Match Next.js 16 lint rules. |
| @next/eslint-plugin-next | – | ^16.0.6 | Explicit Next.js ESLint plugin for flat config. |
| firebase-admin | ^12.7.0 | ^13.6.0 | Keep admin SDK current. |
| firebase-functions | ^5.1.2 | ^7.0.0 | Use supported Cloud Functions SDK. |

## Removed Packages
- autoprefixer: Tailwind CSS 4 ships its own PostCSS plugin, so standalone autoprefixer was removed from the build pipeline.

## Config Migrations
- Tailwind CSS: switched global styles to the Tailwind v4 `@import "tailwindcss";` directive and replaced the PostCSS plugin stack with `@tailwindcss/postcss`.
- ESLint: replaced the legacy `.eslintrc.json` with an ESLint 9 flat config based on `eslint-config-next`, retaining project-specific console and link rules.
- Vitest: added path alias resolution for `@/` imports and updated the test script to run Vitest in single-run mode.
- Next.js/TypeScript: moved `typedRoutes` to the top-level Next config and set TypeScript to use `moduleResolution: "bundler"` for Next 16 compatibility.
