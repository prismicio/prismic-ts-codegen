# prismic-ts-codegen

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![Conventional Commits][conventional-commits-src]][conventional-commits-href]
[![License][license-src]][license-href]

<!-- TODO: Replacing link to Prismic with [Prismic][prismic] is useful here -->

A Prismic model-to-TypeScript-type generator.

- Converts custom type and shared Slice models to TypeScript types
- Integrates with other Prismic TypeScript libraries
- Built upon the [`@prismicio/client`][prismic-client] library

## Install

```bash
npm install @prismicio/client
npm install --save-dev prismic-ts-codegen
```

## Usage

1. **Create a config file**

   To get started, create a `prismicCodegen.config.ts` file at the root of your project with the following command:

   ```bash
   npx prismic-ts-codegen init
   ```

2. **Configure your model paths**

   Next, add paths to all of your Custom Type and Shared Slice models in your `prismicCodegen.config.ts` file (globs are supported):

   ```diff
     // prismicCodegen.config.ts

     import type { Config } from "prismic-ts-codegen";

     const config: Config = {
       output: "./types.generated.ts",
   +   models: ["./customtypes/**/index.json", "./slices/**/model.json"],
     };

     export default config;
   ```

3. **Generate your types**

   Now, anytime you want to generate types, run the codegen tool:

   ```bash
   npx prismic-ts-codegen
   ```

   By default, your types will be exported from `types.generated.ts`.

## Documentation

### Configuration

`prismic-ts-codegen` is configured using a `prismicCodegen.config.ts` file. It must export a configuration object as the default export.

#### Interface

See the [`Config` TypeScript interface](./src/cli/types.ts) for a complete reference of each configuration property.

#### Full example

```typescript
// prismicCodegen.config.ts
import type { Config } from "prismic-ts-codegen";

const config: Config = {
	repositoryName: "nextjs-blog-demo",
	accessToken: "abc123xyz345",
	customTypesAPIToken: "abc123xyz345",

	output: "./types.generated.ts",

	clientIntegration: {
		includeCreateClientInterface: true,
	},

	locales: {
		ids: ["en-us", "fr-fr", "en-gb"],
		fetchFromRepository: true,
	},

	models: {
		files: ["./customtypes/**/index.json", "./slices/**/model.json"],
		fetchFromRepository: true,
	},

	fields: {
		embed: {
			providerTypes: {
				YouTube: 'import("./types").OEmbedYouTube',
				Twitter: 'import("./types").OEmbedTwitter',
				Vimeo: 'import("./types").OEmbedVimeo',
			},
		},
		integrationFields: {
			catalogTypes: {
				shop: 'import("./types").IntegrationFieldShop',
			},
		},
	},
};

export default config;
```

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
[prismic-client]: https://github.com/prismicio/prismic-client

<!-- TODO: Replace link with a more useful one if available -->

[prismic-docs]: https://prismic.io/docs
[changelog]: ./CHANGELOG.md
[contributing]: ./CONTRIBUTING.md

<!-- TODO: Replace link with a more useful one if available -->

[forum-question]: https://community.prismic.io
[repo-bug-report]: https://github.com/prismicio/prismic-ts-codegen/issues/new?assignees=&labels=bug&template=bug_report.md&title=
[repo-feature-request]: https://github.com/prismicio/prismic-ts-codegen/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=
[repo-pull-requests]: https://github.com/prismicio/prismic-ts-codegen/pulls

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/prismic-ts-codegen/latest.svg
[npm-version-href]: https://npmjs.com/package/prismic-ts-codegen
[npm-downloads-src]: https://img.shields.io/npm/dm/prismic-ts-codegen.svg
[npm-downloads-href]: https://npmjs.com/package/prismic-ts-codegen
[github-actions-ci-src]: https://github.com/prismicio/prismic-ts-codegen/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/prismicio/prismic-ts-codegen/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/github/prismicio/prismic-ts-codegen.svg
[codecov-href]: https://codecov.io/gh/prismicio/prismic-ts-codegen
[conventional-commits-src]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[conventional-commits-href]: https://conventionalcommits.org
[license-src]: https://img.shields.io/npm/l/prismic-ts-codegen.svg
[license-href]: https://npmjs.com/package/prismic-ts-codegen
