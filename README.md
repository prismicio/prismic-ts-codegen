# @prismicio/ts-codegen

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![Conventional Commits][conventional-commits-src]][conventional-commits-href]
[![License][license-src]][license-href]

<!-- TODO: Replacing link to Prismic with [Prismic][prismic] is useful here -->

> ⚠ This project is in an experimental state. Use it at your own risk or stay tuned for the official release!

An experimental Prismic model-to-TypeScript-type generator.

- Converts Custom Type and Shared Slice models to TypeScript types
- Integrates with other Prismic TypeScript libraries
- Built on the [`@prismicio/types`][prismic-types] library

## Install

```bash
npm install --save-dev prismic-ts-codegen
```

## Usage

1. **Create a config file**

   To get started, create a `prismicCodegen.config.ts` file with the following command:

   ```bash
   npx prismic-ts-codegen init
   ```

2. **Configure your model paths**

   Next, add the paths to all of your Custom Type and Shared Slice models in your `prismicCodegen.config.ts` file (globs are supported):

   ```diff
     import type { Config } from "prismic-ts-codegen";

     const config: Config = {
       output: "./types.generated.ts",
   +   models: ["./customtypes/**/index.json", "./slices/**/model.json"],
     };

     export default config;
   ```

3. **Generate your types**

   Now, anytime you want to generate types, such as after updating your models, run the codegen process at the root of your project:

   ```bash
   npx prismic-ts-codegen
   ```

## Documentation

To discover what's new on this package check out [the changelog][changelog]. For full documentation, visit the [official Prismic documentation][prismic-docs].

## Contributing

Whether you're helping us fix bugs, improve the docs, or spread the word, we'd love to have you as part of the Prismic developer community!

**Asking a question**: [Open a new topic][forum-question] on our community forum explaining what you want to achieve / your question. Our support team will get back to you shortly.

**Reporting a bug**: [Open an issue][repo-bug-report] explaining your application's setup and the bug you're encountering.

**Suggesting an improvement**: [Open an issue][repo-feature-request] explaining your improvement or feature so we can discuss and learn more.

**Submitting code changes**: For small fixes, feel free to [open a pull request][repo-pull-requests] with a description of your changes. For large changes, please first [open an issue][repo-feature-request] so we can discuss if and how the changes should be implemented.

For more clarity on this project and its structure you can also check out the detailed [CONTRIBUTING.md][contributing] document.

## License

```
   Copyright 2013-2022 Prismic <contact@prismic.io> (https://prismic.io)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

<!-- Links -->

[prismic]: https://prismic.io
[prismic-types]: https://github.com/prismicio/prismic-types

<!-- TODO: Replace link with a more useful one if available -->

[prismic-docs]: https://prismic.io/docs
[changelog]: ./CHANGELOG.md
[contributing]: ./CONTRIBUTING.md

<!-- TODO: Replace link with a more useful one if available -->

[forum-question]: https://community.prismic.io
[repo-bug-report]: https://github.com/prismicio/prismic-typescript-generator/issues/new?assignees=&labels=bug&template=bug_report.md&title=
[repo-feature-request]: https://github.com/prismicio/prismic-typescript-generator/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=
[repo-pull-requests]: https://github.com/prismicio/prismic-typescript-generator/pulls

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/prismic-typescript-generator/latest.svg
[npm-version-href]: https://npmjs.com/package/prismic-typescript-generator
[npm-downloads-src]: https://img.shields.io/npm/dm/prismic-typescript-generator.svg
[npm-downloads-href]: https://npmjs.com/package/prismic-typescript-generator
[github-actions-ci-src]: https://github.com/prismicio/prismic-typescript-generator/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/prismicio/prismic-typescript-generator/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/github/prismicio/prismic-typescript-generator.svg
[codecov-href]: https://codecov.io/gh/prismicio/prismic-typescript-generator
[conventional-commits-src]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[conventional-commits-href]: https://conventionalcommits.org
[license-src]: https://img.shields.io/npm/l/prismic-typescript-generator.svg
[license-href]: https://npmjs.com/package/prismic-typescript-generator
