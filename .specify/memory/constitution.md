# DevTools Constitution

## Core Principles

### I. Tool-First Development
Every feature must be a self-contained, single-purpose developer utility. Each tool should solve one specific problem well, be independently usable, and require no external dependencies for core functionality. Tools must be accessible via direct URL routing for bookmarking and sharing.

### II. Client-Side Only (NON-NEGOTIABLE)
All processing must happen in the browser - no server-side dependencies, no data transmission to external services. User data never leaves their machine. Tools must work offline once loaded. This ensures privacy, security, and eliminates infrastructure costs.

### III. Instant Usability
Tools must be immediately functional without setup, configuration, or user accounts. No loading states for core functionality. Lazy loading acceptable only for tool components, not within tool operations. Results must be real-time where possible.

### IV. Responsive Design
All tools must work seamlessly across desktop, tablet, and mobile devices. Touch-friendly interfaces required. Keyboard shortcuts for power users. Dark/light theme support mandatory for developer comfort.

### V. Accessibility & Performance
WCAG 2.1 AA compliance minimum. Semantic HTML, proper ARIA labels, keyboard navigation. Bundle size optimization - lazy load tool components. Fast initial page load (<2s on 3G). No unnecessary re-renders or memory leaks.

## Technical Standards

### Technology Stack
- React 18+ with TypeScript for type safety
- Vite for build tooling and development server
- Tailwind CSS + Radix UI for consistent, accessible components
- Client-side routing with React Router
- State management with Jotai for tool-specific state
- ESLint + TypeScript for code quality

### Code Organization
- Each tool in separate `/pages/[category]/[tool]` directory
- Shared UI components in `/components/ui/`
- Tool registration in `toolConfig.ts` and `App.tsx` routing
- Utility functions in `/lib/` and `/utils/`
- No global state except theme and UI preferences

## Development Workflow

### Adding New Tools
1. Create tool component in appropriate category folder
2. Add route to `App.tsx` with lazy loading
3. Register in `toolConfig.ts` for navigation
4. Ensure responsive design and accessibility
5. Test across browsers and devices

### Quality Gates
- TypeScript compilation with no errors
- ESLint passing with project configuration
- Manual testing on mobile and desktop
- Accessibility audit with browser dev tools
- Performance check - no blocking operations

## Governance

This constitution defines the minimum viable standards for the DevTools static web app. All new tools and modifications must comply with these principles. The focus is on providing reliable, fast, privacy-respecting developer utilities that work everywhere.

**Version**: 1.0.0 | **Ratified**: 2025-09-15 | **Last Amended**: 2025-09-15
