# Contributing

This package is primarily maintained by [Prismic](https://prismic.io)[^1]. External contributions are welcome. Ask for help by [opening an issue](https://github.com/prismicio/prismic-ts-codegen/issues/new/choose), or request a review by opening a pull request.

## :gear: Setup

<!-- When applicable, list system requriements to work on the project. -->

The following setup is required to work on this project:

- Node.js
- npm CLI

## :memo: Project-specific notes

<!-- Share information about the repository. -->
<!-- What specific knowledge do contributors need? -->

> [!TIP]
> Please update this section with helpful notes for contributors.

#### Update type generation

- Types for fields are generated in `src/lib/buildFieldProperties.ts`. To modify a field’s type or add support for a new field type, edit the `buildFieldProperty` function.
- Types for shared slices are generated in `src/lib/buildSharedSliceType.ts`. It calls `buildFieldProperties` to build its fields.
- Types for custom types are generated in `src/lib/buildCustomTypeType.ts`. It calls `buildFieldProperties` to build its fields.
- `buildFieldProperty` is recursive. If a field type contains other fields, such as groups or slice zones, it will call `buildFieldProperty` again.

#### Write tests

- Any change to this library should be tested. A test can be as simple as ensuring a given model generates an expected type.
- Tests should be placed in the `test` directory using the existing file name convention.
- Tests are written using Vitest.
- Mock models should be generated using `@prismicio/mock`.

## :construction_worker: Develop

> [!NOTE]
> It's highly recommended to discuss your changes with the Prismic team before starting by [opening an issue](https://github.com/prismicio/prismic-ts-codegen/issues/new/choose).[^2]
>
> A short discussion can accellerate your work and ship it faster.

```sh
# Clone and prepare the project.
git clone git@github.com:prismicio/prismic-ts-codegen.git
cd prismic-ts-codegen
npm install

# Create a new branch for your changes (e.g. lh/fix-win32-paths).
git checkout -b <your-initials>/<feature-or-fix-description>

# Start the development watcher.
# Run this command while you are working on your changes.
npm run dev

# Build the project for production.
# Run this command when you want to see the production version.
npm run build

# Lint your changes before requesting a review. No errors are allowed.
npm run lint
# Some errors can be fixed automatically:
npm run lint -- --fix

# Format your changes before requesting a review. No errors are allowed.
npm run format

# Test your changes before requesting a review.
# All changes should be tested. No failing tests are allowed.
npm run test
# Run only unit tests (optionally in watch mode):
npm run unit
npm run unit:watch
# Run only type tests
npm run types
```

## :building_construction: Submit a pull request

> [!NOTE]
> Code will be reviewed by the Prismic team before merging.[^3]
>
> Request a review by opening a pull request.

```sh
# Open a pull request. This example uses the GitHub CLI.
gh pr create

# Someone from the Prismic team will review your work. This review will at
# least consider the PR's general direction, code style, and test coverage.

# When ready, PRs should be merged using the "Squash and merge" option.
```

## :rocket: Publish

> [!CAUTION]
> Publishing is restricted to the Prismic team.[^4]

```sh
# Checkout the master branch and pull the latest changes.
git checkout master
git pull

# Perform a dry-run and verify the output.
# If it looks good, release a new version.
npm run release:dry
npm run release

# Or release an alpha.
# Perform a dry-run and verify the output.
# If it looks good, release a new alpha version.
npm run release:alpha:dry
npm run release:alpha
```

[^1]: This package is maintained by the DevX team. Prismic employees can ask for help or a review in the [#team-devx](https://prismic-team.slack.com/archives/C014VAACCQL) Slack channel.
[^2]: Prismic employees are highly encouraged to discuss changes with the DevX team in the [#team-devx](https://prismic-team.slack.com/archives/C014VAACCQL) Slack channel before starting.
[^3]: Code should be reviewed by the DevX team before merging. Prismic employees can request a review in the [#team-devx](https://prismic-team.slack.com/archives/CPG31MDL1) Slack channel.
[^4]: Prismic employees can ask the DevX team for [npm](https://www.npmjs.com) publish access.
