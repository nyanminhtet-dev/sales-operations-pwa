# AGENTS.md — PK Counter Sales Staff PWA

## 1. Project purpose

This repository contains the separate, mobile-first Sales Staff Progressive Web App (PWA) for PK Counter Stock Management.

Sales staff use this app primarily on mobile devices while selling at booths, pop-up events, and other assigned selling locations. The app should make day-to-day selling tasks fast, clear, and reliable.

The PWA is a separate frontend from the existing Admin Dashboard. It should not reproduce the entire admin experience.

Primary workflows, subject to confirmed business requirements:
- Browse and search products and variants.
- Check prices and available stock.
- Create and complete sales.
- Review transaction history.
- Process authorized sales returns.
- Work with the correct assigned selling location when the backend/business rules require it.

Do not invent business rules, API endpoints, payment behavior, permissions, or offline guarantees. Ask for clarification or mark assumptions when requirements are missing.

## 2. Technology decisions

- Framework: Angular 16.
- Styling: Tailwind CSS, using a version and configuration compatible with the project.
- Language: TypeScript.
- Animation: GSAP, used intentionally for polished interaction and transitions.
- Routing: Angular Router.
- Forms: Angular Reactive Forms for complex or validated forms.
- Asynchronous work: RxJS and Angular services where appropriate.
- Icons: Lucide icons, consistently applied.
- Version control: Git.

### Dependency compatibility
- Respect Angular 16 as the chosen project version.
- Do not upgrade Angular or replace major dependencies unless explicitly asked.
- Check package compatibility before adding or upgrading dependencies.
- Prefer the smallest dependency set that solves the problem.
- Do not add a state-management library, component library, or PWA/offline package without a clear need and approval.

## 3. Architecture principles

- Use a feature-oriented, component-driven architecture.
- Keep components focused on one clear responsibility.
- Keep presentation separate from business logic and data access.
- Put API communication in dedicated services, not directly in templates or scattered across UI components.
- Keep shared UI components generic; keep feature-specific behavior in the relevant feature.
- Use lazy-loaded routes where they provide a meaningful benefit and fit the existing Angular setup.
- Follow the repository's existing structure when it is sound. Do not restructure unrelated code for a small feature.
- Avoid both giant components and unnecessary abstraction. Introduce abstractions when they reduce duplication or clarify responsibilities.
- Keep public component inputs, outputs, service methods, and other interfaces stable unless a change is necessary.

## 4. Frontend coding principles

### TypeScript
- Keep TypeScript strictness enabled where supported by the existing project configuration.
- Use `any` for application data flow, including API request/response payloads, service data, and data passed to components.
- Do not create model files, data interfaces, or data type definitions for these payloads. Keep other code typed where practical; this data-flow convention does not require disabling TypeScript strictness.
- Avoid unsafe type assertions and non-null assertions unless justified.
- Use clear, descriptive names; avoid cryptic abbreviations.
- Keep functions small enough to understand and test.

### Angular
- Follow Angular 16 conventions and the module/standalone approach already selected by the repository. Do not mix architectural styles arbitrarily.
- Use dependency injection rather than manually constructing services.
- Use `OnPush` change detection for suitable components when compatible with their state/update patterns.
- Use the `async` pipe or appropriate subscription cleanup patterns.
- Clean up subscriptions, listeners, observers, and other long-lived resources.
- Avoid business logic in templates.
- Use stable tracking for repeated collections.
- Use Reactive Forms for forms with meaningful validation or dynamic behavior.
- Display useful validation messages and preserve user input when practical.
- Do not manipulate the DOM directly unless necessary. If GSAP or a browser API requires DOM access, encapsulate it safely in the component/directive/service responsible for that behavior.

### HTML and accessibility
- Use semantic HTML elements.
- Provide accessible labels for inputs and meaningful accessible names for icon-only buttons.
- Support keyboard interaction and visible focus states.
- Do not use color alone to communicate status.
- Use buttons for actions and links for navigation.
- Ensure touch targets are comfortable for mobile use, aiming for approximately 44–48 CSS pixels where practical.
- Respect reduced-motion preferences.

### CSS and Tailwind
- Use Tailwind utilities for most styling and responsive behavior.
- Keep design decisions consistent through shared tokens/configuration rather than repeated arbitrary values.
- Avoid long, duplicated class lists when a clear reusable component or variant is justified.
- Do not introduce inline styles or custom CSS for something Tailwind already handles well.
- Use component-scoped CSS for cases that genuinely need it.
- Avoid broad global selectors that unexpectedly affect other features.
- Test small and large mobile layouts, plus tablet/desktop behavior.
- Design mobile-first; add larger-screen enhancements progressively.

## 5. UI/UX standards

- Prioritize the real-world selling workflow: quick product discovery, variant/quantity selection, cart review, payment recording, and transaction confirmation.
- Keep primary actions easy to reach on a phone.
- Avoid unnecessary steps, decorative clutter, and oversized dashboards.
- Use consistent spacing, typography, borders, radii, icon sizing, and status styles.
- Include loading, empty, error, success, and disabled states where relevant.
- Prevent accidental duplicate submissions while a transaction is being processed.
- Confirm destructive or financially consequential actions when appropriate.
- Do not display fake business data as if it were real. Clearly label mock data in prototypes.
- Ensure stock, prices, totals, and transaction statuses are presented clearly.
- Do not assume the app works offline. Offline sales and synchronization require explicit product requirements and conflict-handling design.

## 6. GSAP animation standards

- Use GSAP only when it improves clarity, feedback, or perceived smoothness.
- Keep animation short, purposeful, and unobtrusive; do not animate every element.
- Prioritize interaction responsiveness and accessibility over visual effects.
- Use GSAP context/scoped setup and revert or kill animations during Angular component/directive cleanup.
- Avoid conflicting GSAP animations and CSS transitions on the same property.
- Do not animate layout-heavy properties when transforms or opacity can achieve the same result.
- Respect `prefers-reduced-motion`; provide a reduced-motion or non-animated experience.
- Avoid introducing animation dependencies or plugins without approval.

## 7. API, data, and business rules

- Centralize HTTP communication in Angular services.
- Use environment configuration for base URLs; never hardcode environment-specific API hosts throughout components.
- Do not put secrets or private credentials in frontend code.
- Use `any` for request/response data and handle API errors deliberately.
- Represent loading, success, empty, and failure states in the UI.
- Do not trust the client to enforce stock availability, authorization, prices, totals, or transaction validity. The backend is authoritative.
- Avoid duplicate transaction submissions; follow backend-supported idempotency or transaction patterns when available.
- Respect authenticated user permissions and assigned selling locations.
- Do not log sensitive customer, authentication, or payment information.
- Do not invent API contracts. Inspect the available API documentation/code or ask for the contract.

## 8. State management

- Keep temporary UI state local to the component that owns it.
- Use services or an established shared-state approach when state must be shared across routes/features.
- Avoid duplicating the same source of truth in multiple components.
- Derive display values from authoritative state where practical.
- Handle loading and error states explicitly.
- Do not add a global state library unless complexity and requirements justify it.

## 9. Performance and reliability

- Keep the app responsive on common mobile devices and slower networks.
- Prefer lazy loading for larger feature areas where appropriate.
- Avoid unnecessary subscriptions, repeated API calls, large dependencies, and expensive template expressions.
- Optimize images and avoid loading assets that are not needed.
- Clean up event listeners, observers, timers, and animation timelines.
- Preserve user feedback during slow requests and provide retry options when appropriate.
- Do not claim offline capability unless it has been implemented and tested.

## 10. Testing and verification

For each meaningful change:
- Run the relevant Angular build or type checks available in the repository.
- Run existing tests that cover the changed behavior.
- Add or update tests for important business logic and regressions when practical.
- Check loading, empty, error, and success states.
- Verify mobile layouts and interactions, not just desktop.
- Report commands run and any checks that could not be completed.
- Never claim that a test or build passed unless it actually ran successfully.

## 11. Required Codex workflow

Before editing:
1. Inspect the relevant files and existing patterns.
2. Read this `AGENTS.md` and any more-specific `AGENTS.md` files in the affected directory.
3. Identify the requested outcome, constraints, and affected areas.
4. Ask a focused question if a missing requirement could materially change the implementation. Otherwise, state a reasonable assumption.

While implementing:
1. Make the smallest coherent change that solves the task.
2. Reuse established project patterns and components.
3. Keep changes within the requested scope.
4. Avoid unrelated refactors, dependency upgrades, and file churn.
5. Keep the implementation understandable and maintainable.

Before finishing:
1. Review the diff for mistakes and unrelated changes.
2. Run relevant checks where possible.
3. Summarize what changed and important implementation decisions.
4. State tests/builds run and their actual results.
5. Call out assumptions, follow-up work, or unresolved issues.

## 12. Things Codex must not do without approval

- Upgrade Angular or replace the chosen stack.
- Add large dependencies or a new state-management solution.
- Invent backend endpoints, request/response shapes, or business rules.
- Implement offline sales without explicit requirements.
- Change authentication, authorization, or transaction semantics speculatively.
- Rewrite unrelated features or restructure the entire project for convenience.
- Remove existing functionality or tests without explaining why.
- Claim code was executed, tested, or verified when it was not.

## 13. Definition of done

A feature is ready when:
- It satisfies the requested behavior and known business rules.
- It follows this file and the repository's established conventions.
- It is usable on mobile and adapts to larger screens where required.
- It has appropriate loading, empty, error, and success states.
- It is accessible and does not rely on animation to communicate essential information.
- Relevant checks have run, or unrun checks are clearly disclosed.
- No unrelated changes or unexplained assumptions remain.


## Angular project architecture and folder conventions

Build and maintain the application using a **feature-oriented, module-based Angular 16 architecture**. Organize code by responsibility: application-wide infrastructure belongs in `core/`, business workflows belong in `features/`, and generic reusable UI belongs in `shared/`.

Use this baseline structure:

```text
src/
└── app/
    ├── core/
    │   ├── auth/
    │   ├── layout/
    │   ├── user/
    │   ├── api-base.ts
    │   └── core.module.ts
    ├── features/
    │   ├── dashboard/
    │   ├── login/
    │   ├── people/
    │   ├── products/
    │   ├── sales-purchases/
    │   ├── settings/
    │   └── warehouse-control/
    └── shared/
```

Treat this as the project's actual organization standard. Create and maintain folders according to these responsibilities, and add or omit feature folders based on the approved PK Counter Sales PWA requirements. Do not create empty folders or unused features just to complete the tree.

### `core/` — application-wide infrastructure

Code in `core/` supports the application as a whole and should not contain individual business-feature implementations.

- `auth/`: app-wide authentication services, route guards, and authorization infrastructure.
- `layout/`: the main application shell and shared navigation/layout elements, such as the header, navigation menu, and responsive content container.
- `user/`: current-user information, session profile, and user-context services used across features.
- `api-base.ts`: shared API base URL/configuration or base API utilities. Keep feature-specific API calls in the relevant feature.
- `core.module.ts`: the NgModule for core declarations/providers. Import `CoreModule` once in the root `AppModule`; avoid importing it into feature modules if doing so would create duplicate singleton providers.

Keep dependencies flowing in one direction: `core/` must not import from `features/`.

### `features/` — business features and workflows

Each feature folder owns the code for its own user-facing workflow. Keep feature-specific pages, components, services, and routing together within that feature. For major features, use a feature module and a feature routing module, and lazy-load the feature from the application router when appropriate.

#### Required feature folder organization

For every business feature that is implemented, organize its code using feature-owned folders. Use this structure as the convention, adapting names only when the existing feature has an established equivalent:

```text
features/<feature-name>/
├── pages/       # Routed page-level components for this feature
├── components/  # Feature-specific UI components used by its pages
├── services/    # Feature-specific API calls, data access, and workflow coordination
├── <feature-name>.module.ts
└── <feature-name>-routing.module.ts
```

Rules:
- Put every routed/page-level component in its own named folder under that feature's `pages/` folder. Keep its TypeScript, HTML, stylesheet, and tests together, for example `pages/booth-stock/booth-stock.component.ts`, `.html`, `.css`, and `.spec.ts`. Do not place page component files directly under `pages/` or at the feature root.
- Put feature-specific services in that feature's `services/` folder. API communication and business/data coordination belong in services, not in templates or scattered across page components.
- Put reusable only-within-this-feature UI in `components/`; put truly generic UI shared across features in `src/app/shared/`.
- Do not create `models/` folders or model files. Use `any` for feature data flow instead of introducing data models or interfaces.
- Create routing modules and other folders/files when the feature needs them. Do not create empty folders, placeholder services, or unused files solely to match the example.
- A service used app-wide belongs in the appropriate `core/` area; do not duplicate it inside every feature. A generic shared UI component does not belong in a feature's `components/` folder.
- When modifying an existing feature, inspect its current structure first and migrate files only when necessary for this convention; avoid unrelated refactors.

Use these feature responsibilities:

- `dashboard/`: the signed-in sales staff home page and useful daily sales overview.
- `login/`: login pages and login-specific UI/workflow. App-wide authentication infrastructure stays in `core/auth/`.
- `people/`: customer/person lookup or workflows only when required by the approved sales-staff use cases.
- `products/`: product and variant browsing, search, and authorized price/stock visibility.
- `sales-purchases/`: sales creation, cart/line-item handling, payment recording, and sales transaction workflows. Add purchase or stock-receiving screens only if sales staff are explicitly required to perform them.
- `settings/`: staff-accessible account or application preferences only.
- `warehouse-control/`: only the warehouse/location information or selection that sales staff are permitted to access. Admin inventory adjustment and warehouse-management controls do not belong in the sales PWA unless explicitly authorized by requirements.

Implement sales returns in the feature/routing location defined by the approved requirements. If returns are part of the sales workflow, keep them inside `sales-purchases/`; create a separate `returns/` feature only if it provides a distinct workflow that warrants its own module. Never implement the same return workflow twice.

### `shared/` — generic reusable UI and utilities

Place genuinely reusable, business-agnostic UI components, directives, pipes, and shared modules here—for example, a generic confirmation dialog, loading indicator, form-field wrapper, or reusable button.

- Keep components used by only one feature inside that feature.
- Do not put API/business workflows or feature-specific state in `shared/`.
- Avoid turning `shared/` into a miscellaneous dumping ground.

### Rules for adding and changing code

1. Inspect the existing structure before creating files; reuse the established conventions.
2. Keep Angular 16 and the existing NgModule-based architecture. Do not migrate to standalone components unless explicitly requested.
3. Keep components focused and move API calls/data coordination into services rather than templates.
4. Use lazy-loaded feature modules for major business areas where appropriate.
5. Avoid circular dependencies. Features may depend on `core/` and `shared/`; `core/` must not depend on features.
6. Keep feature routes, modules, services, and components inside the owning feature unless they are genuinely app-wide or reusable. Use `any` for data flow; do not add model files or folders.
7. Use consistent Angular naming conventions and avoid unnecessary abstraction layers.
8. Create only features required by the approved product requirements; do not scaffold unused pages, services, modules, or placeholder files.


## Tailwind CSS and clean-code standards

Tailwind CSS is the primary styling system for this project. Prefer Tailwind utility classes in Angular templates for layout, spacing, typography, colors, borders, responsive behavior, and component states.

### Tailwind configuration and light theme

- Use Tailwind CSS v3, compatible with the existing Angular 16 project.
- Configure Tailwind content scanning to include `./src/**/*.{html,ts}`.
- Keep the application's default theme light. Do not introduce dark-mode variants, a theme toggle, or dark-theme infrastructure unless explicitly requested.
- Define reusable brand colors and design tokens in `tailwind.config.js` under `theme.extend`; use semantic names where practical (for example, `brand`, `brand-soft`, `surface`, `page`, `text-primary`, `text-muted`, and `border`).
- Establish the visual direction around a clean white/light-gray interface with restrained YG-esports-inspired purple accents. Use purple for primary actions, selected navigation, focus states, and small emphasis areas; avoid excessive glow or decorative effects.
- Use consistent spacing, border radii, shadows, and typography. Prefer shared tokens over repeating arbitrary color values throughout templates.
- Keep `src/styles.css` for Tailwind directives, global resets/base styles, font setup, and truly global rules. Do not use it as a dumping ground for feature-specific styles.
- Ensure Tailwind's `content` paths cover Angular HTML templates and TypeScript files so utility classes are generated correctly.
- Do not add a Tailwind plugin, CSS framework, or component library without a clear requirement and approval.

### Clean code and styling rules

- Prefer Tailwind utilities over custom CSS. Add component CSS only when utilities cannot express the styling cleanly or when a small, reusable custom pattern genuinely improves maintainability.
- Do not use long, duplicated class strings across many components when a shared component or a small, well-justified abstraction would improve consistency.
- Do not create abstraction layers solely to avoid a few utility classes. Keep markup readable and components focused.
- Avoid excessive arbitrary values such as `w-[397px]` or `text-[#...]` when a shared design token or standard utility is suitable. Arbitrary values are acceptable only when the design genuinely requires them.
- Do not put business logic in templates or styling files. Keep component logic in TypeScript and business/API coordination in services.
- Use semantic HTML and accessible labels, visible focus states, appropriate contrast, and touch-friendly controls for mobile users.
- Build mobile-first, then add responsive variants for larger screens where needed.
- Keep animations restrained and purposeful. Use GSAP only for interactions that benefit from motion; do not animate every element.
- Remove unused classes, dead CSS, redundant wrappers, and unused imports when changing code.
- Avoid `!important` unless there is a documented, unavoidable reason.
- Before adding new global styles or design tokens, inspect the existing configuration and reuse or refine it rather than duplicating it.

### Layout implementation discipline

- Build and verify the shared app shell before implementing Home page content.
- The app shell may include the shared header, routed page outlet, and persistent bottom navigation.
- Do not implement Home cards, sales KPIs, recent transactions, banners, or other Home-specific sections while the layout-only milestone is in progress.
- Keep the layout responsive and ensure the routed content has enough bottom padding so the persistent navigation does not cover page content.
- Do not invent live data, API integrations, authentication behavior, or location-switching behavior for a visual layout milestone. Use only the minimum placeholder content required to verify the shell.
- Verify the Angular build after making changes and report any unresolved errors rather than claiming success without checking.


## Angular Page Folder Organization — STRICT RULE

This rule is mandatory for all Angular features and pages. Do not deviate from it.

### 1. One Page, One Folder

Every page component MUST have its own dedicated folder inside the feature's `pages/` directory.

**Required structure:**

```text
pages/
├── booth-stock/
│   ├── booth-stock.component.ts
│   ├── booth-stock.component.html
│   ├── booth-stock.component.css
│   └── booth-stock.component.spec.ts
├── check-out/
│   ├── check-out.component.ts
│   ├── check-out.component.html
│   ├── check-out.component.css
│   └── check-out.component.spec.ts
└── stock-movement-history/
    ├── stock-movement-history.component.ts
    ├── stock-movement-history.component.html
    ├── stock-movement-history.component.css
    └── stock-movement-history.component.spec.ts
```

### 2. No Page Files Directly Inside `pages/`

NEVER place page component files directly inside the `pages/` directory.

Forbidden:

```text
pages/
├── booth-stock.component.ts
├── booth-stock.component.html
├── check-out.component.ts
├── check-out.component.html
└── stock-movement-history.component.ts
```

Every page MUST be grouped into its own named folder.

### 3. Keep Page Files Together

For each page, keep its related files in the same directory:

- Component TypeScript
- Component HTML template
- Component CSS stylesheet
- Component spec/test file, when present or required by project conventions
- Other page-specific files, if necessary

Use the existing component naming convention consistently.

### 4. Component Styles Must Stay Local

Each page MUST use its own component stylesheet. Do not move page-specific styles into global stylesheets or another page's CSS.

Follow the project's existing Angular component metadata conventions and preserve the correct relative paths for `templateUrl` and `styleUrls`.

### 5. Components Are Not Pages

Keep reusable UI components inside the feature's `components/` directory, organized into dedicated subfolders when appropriate.

For example:

```text
booth-stock/
├── components/
│   ├── product-card/
│   │   ├── product-card.component.ts
│   │   ├── product-card.component.html
│   │   └── product-card.component.css
│   └── ...
└── pages/
    ├── booth-stock/
    └── check-out/
```

Do not put reusable components inside `pages/` simply because a page uses them.

### 6. Mandatory Rules When Creating or Refactoring Pages

Before creating or modifying a page:

1. Inspect the existing feature folder structure.
2. Create or reuse the page's dedicated folder.
3. Keep all page-specific files inside that folder.
4. Update imports, lazy-loaded routes, module declarations, tests, and relative file references affected by any file move.
5. Follow the existing project conventions for Angular modules and routing.
6. Never leave duplicate or obsolete page files after refactoring.

### 7. Existing Violations Must Be Fixed When Working in That Feature

If a feature contains page component files directly inside `pages/`, move them into their respective page folders when implementing or refactoring that feature.

Update all affected references and verify that the application still builds.

Do not perform unrelated, large-scale file reorganizations outside the scope of the task.

### 8. Final Verification

Before completing a task, verify that:

- Every page has its own folder.
- No page component files remain directly inside `pages/`.
- Component templates and styles resolve correctly.
- Angular routes and module declarations still work.
- The available build and relevant tests pass.

**Priority:** This organization rule is mandatory. Convenience, speed, or generating fewer folders is not a valid reason to violate it.
