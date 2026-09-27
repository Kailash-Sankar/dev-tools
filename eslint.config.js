import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'specs'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // shadcn/ui primitives intentionally co-locate a component with its
    // cva() variant map (buttonVariants, sidebarMenuButtonVariants, ...), and
    // the sidebar exports its context hook alongside its components. That
    // trips react-refresh, but splitting them would fight the upstream
    // component format. Allow the pattern in this directory only.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // These two export a Provider alongside its matching hook, which is the
    // conventional React context layout (and what shadcn ships). The rule
    // exists to catch *accidental* mixed exports that break fast refresh; a
    // context file is an intentional, coherent unit.
    files: [
      'src/components/theme-provider.tsx',
      'src/components/command-palette-context.tsx',
      'src/components/help-dialog-context.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
)
