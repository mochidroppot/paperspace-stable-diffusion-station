# Storybook Setup

This project includes Storybook for component development and documentation.

## Getting Started

### Running Storybook

```bash
npm run storybook
```

This will start Storybook on `http://localhost:6006`

### Building Storybook

```bash
npm run build-storybook
```

## UI Components

The following UI components have stories available:

- **Button** - Various button variants and sizes
- **Card** - Card layouts with headers, content, and footers
- **Badge** - Badge variants and styles
- **Progress** - Progress bars with different values and sizes

## Story Structure

Stories are located in `src/components/ui/*.stories.tsx` and follow the Storybook 7+ format with:

- TypeScript support
- Tailwind CSS styling
- Accessibility testing with `@storybook/addon-a11y`
- Interactive controls for component props
- Auto-generated documentation

## Configuration

- **Main config**: `.storybook/main.ts`
- **Preview config**: `.storybook/preview.ts`
- **Tailwind CSS**: Imported via `../src/index.css`

## Addons

- `@storybook/addon-docs` - Auto-generated documentation
- `@storybook/addon-a11y` - Accessibility testing
- `@storybook/addon-vitest` - Component testing integration
- `@chromatic-com/storybook` - Visual testing and collaboration