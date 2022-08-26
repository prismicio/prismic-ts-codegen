# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.3](https://github.com/prismicio/prismic-ts-codegen/compare/v0.1.2...v0.1.3) (2022-08-26)


### Features

* support models with IDs starting with a number ([#30](https://github.com/prismicio/prismic-ts-codegen/issues/30)) ([c2edb0a](https://github.com/prismicio/prismic-ts-codegen/commit/c2edb0a2c696a07afd61fcbe23e49e40ccf3bf61))


### Chore

* **deps:** upgrade dependencies ([27d332f](https://github.com/prismicio/prismic-ts-codegen/commit/27d332f64c50f330a6d938356f42014932caba22))

### [0.1.2](https://github.com/prismicio/prismic-ts-codegen/compare/v0.1.1...v0.1.2) (2022-08-06)


### Refactor

* use `ImageField<never>` rather than `ImageField<null>` ([#26](https://github.com/prismicio/prismic-ts-codegen/issues/26)) ([9960678](https://github.com/prismicio/prismic-ts-codegen/commit/9960678e39fc9bbe184111a74f423f9d7b53a732))

### [0.1.1](https://github.com/prismicio/prismic-ts-codegen/compare/v0.1.0...v0.1.1) (2022-08-04)


### Bug Fixes

* support fields with a name starting with a number ([#25](https://github.com/prismicio/prismic-ts-codegen/issues/25)) ([a7b25b5](https://github.com/prismicio/prismic-ts-codegen/commit/a7b25b59f56738378b7c9d194c70baa9ca93a2b7))

## [0.1.0](https://github.com/prismicio/prismic-ts-codegen/compare/v0.0.7...v0.1.0) (2022-07-08)


### ⚠ BREAKING CHANGES

* update `@prismicio/types` to `v0.2.0` (#23)

### Features

* update `@prismicio/types` to `v0.2.0` ([#23](https://github.com/prismicio/prismic-ts-codegen/issues/23)) ([31d7a4f](https://github.com/prismicio/prismic-ts-codegen/commit/31d7a4f6b94e820ab5c25abfe54d18c77cea46dc))

### [0.0.7](https://github.com/prismicio/prismic-ts-codegen/compare/v0.0.6...v0.0.7) (2022-06-30)


### Bug Fixes

* **cli:** config schema to support `clientIntegration.includeCreateClientInterface` option ([#22](https://github.com/prismicio/prismic-ts-codegen/issues/22)) ([ff676ae](https://github.com/prismicio/prismic-ts-codegen/commit/ff676ae161def02c5eaa4e94c6446892f3405e9f))


### Documentation

* remove experimental warning ([d3365fe](https://github.com/prismicio/prismic-ts-codegen/commit/d3365fe592984db1afaf5d47371362bb5368a614))


### Chore

* **deps:** upgrade dependencies ([2a1cdaa](https://github.com/prismicio/prismic-ts-codegen/commit/2a1cdaa0a71bf4396b02e982b0e779cd670289e2))

### [0.0.6](https://github.com/prismicio/prismic-ts-codegen/compare/v0.0.5...v0.0.6) (2022-06-23)


### Bug Fixes

* **cli:** use the `fields` property when generating types ([#19](https://github.com/prismicio/prismic-ts-codegen/issues/19)) ([00efdde](https://github.com/prismicio/prismic-ts-codegen/commit/00efdde9f32b7094b36ca95f6a2d4e1ab7dc5b61))

### [0.0.5](https://github.com/prismicio/prismic-ts-codegen/compare/v0.0.4...v0.0.5) (2022-06-22)


### Features

* integrate generated types into `@prismicio/client` automatically ([#14](https://github.com/prismicio/prismic-ts-codegen/issues/14)) ([e0d47ab](https://github.com/prismicio/prismic-ts-codegen/commit/e0d47abd73281e09e394679a342c7994cb97d4fc))

### [0.0.4](https://github.com/prismicio/prismic-ts-codegen/compare/v0.0.3...v0.0.4) (2022-06-01)


### Features

* add a Custom Type field's tab name to its description ([#13](https://github.com/prismicio/prismic-ts-codegen/issues/13)) ([29c3151](https://github.com/prismicio/prismic-ts-codegen/commit/29c31514649ec57fae041acc0e97c45d8a3a254f))

### [0.0.3](https://github.com/prismicio/prismic-ts-codegen/compare/v0.0.2...v0.0.3) (2022-05-19)


### Features

* export Slice and Group types ([#10](https://github.com/prismicio/prismic-ts-codegen/issues/10)) ([69cffa3](https://github.com/prismicio/prismic-ts-codegen/commit/69cffa35a66c7bc0c8142cacb1a3415f62549ffd))


### Bug Fixes

* **cli:** load models in a deterministic order (alphabetical by ID) ([#9](https://github.com/prismicio/prismic-ts-codegen/issues/9)) ([4d692d9](https://github.com/prismicio/prismic-ts-codegen/commit/4d692d92192f588aad5d9c08d8774178d0ddb57c))
* support fields with hyphenated API IDs ([#7](https://github.com/prismicio/prismic-ts-codegen/issues/7)) ([c666987](https://github.com/prismicio/prismic-ts-codegen/commit/c66698769b899db488d5e28efb87469d6e7f3459))


### Documentation

* configuration ([3db9932](https://github.com/prismicio/prismic-ts-codegen/commit/3db993280d3f40c8ef2b8597ab8e2eea8e354291))


### Chore

* add `@prismicio/types` as a peer dependency ([60ddef7](https://github.com/prismicio/prismic-ts-codegen/commit/60ddef794159545492a66592ac75f0c0094e9f73))
* **deps:** upgrade dependencies ([ef569b2](https://github.com/prismicio/prismic-ts-codegen/commit/ef569b287551cbaeed0e226d6599be14ae7e37d9))
* **deps:** upgrade dependencies ([0953400](https://github.com/prismicio/prismic-ts-codegen/commit/0953400db747a111fa68385a518ae190da1d929f))
* remove `examples` directory ([c94f3cc](https://github.com/prismicio/prismic-ts-codegen/commit/c94f3ccde5c3513684224ca439b1e585fc21af65))

### [0.0.2](https://github.com/prismicio/prismic-ts-codegen/compare/v0.0.1...v0.0.2) (2022-02-23)


### Features

* add `init` CLI command ([#4](https://github.com/prismicio/prismic-ts-codegen/issues/4)) ([f7da732](https://github.com/prismicio/prismic-ts-codegen/commit/f7da73209bbc115372d4df210e7a6c096838b612))
* configure CLI with config file ([#3](https://github.com/prismicio/prismic-ts-codegen/issues/3)) ([75c92bc](https://github.com/prismicio/prismic-ts-codegen/commit/75c92bcd97c36c898457dd0db4ece6f4fc2d78a2))
* only export a `generateTypes()` function ([933b0c3](https://github.com/prismicio/prismic-ts-codegen/commit/933b0c31937a9e1b7e8f845c1f87a8c770e33729))
* support custom Embed data with provider-specific types ([#1](https://github.com/prismicio/prismic-ts-codegen/issues/1)) ([6889b29](https://github.com/prismicio/prismic-ts-codegen/commit/6889b293364ebab26a55b7707c84b2ff196f61e4))
* support custom Integration Fields data with catalog-specific types ([#2](https://github.com/prismicio/prismic-ts-codegen/issues/2)) ([3854af9](https://github.com/prismicio/prismic-ts-codegen/commit/3854af9025e393e6ab2fa1534b4f9070567cbf5b))
* support lang configuration ([8aa8b35](https://github.com/prismicio/prismic-ts-codegen/commit/8aa8b350d92c20b3394828a0f10ac5ad87ac1165))


### Bug Fixes

* error with PrismicDocument type parameter ([fef6edc](https://github.com/prismicio/prismic-ts-codegen/commit/fef6edc082b2f178270e76f8e6d5bb1a9fdf6d27))
* typo in Shared Slice item TSDoc ([f8faa8e](https://github.com/prismicio/prismic-ts-codegen/commit/f8faa8ea773f718e74116712d5fbb669fc23eb36))
* update non-editable file header message ([f98e12d](https://github.com/prismicio/prismic-ts-codegen/commit/f98e12deaa3a9cf284921bdfc9140311d41bf240))


### Documentation

* mention default codegen file ([cb2af53](https://github.com/prismicio/prismic-ts-codegen/commit/cb2af53889419db4ffc5fd7307ab3676eac520fe))
* reword steps ([bb635f1](https://github.com/prismicio/prismic-ts-codegen/commit/bb635f1a5c7bd7f53599f4cf01e9a4b51752599d))
* update usage section ([35e69b9](https://github.com/prismicio/prismic-ts-codegen/commit/35e69b9f3767cbe9eecd0bf6f5d2346824d96427))


### Chore

* **deps:** update dependencies ([06354fa](https://github.com/prismicio/prismic-ts-codegen/commit/06354fae386021878c748181abeff6ef5acbc1f7))
* rename package to prismic-ts-codegen ([cd7c002](https://github.com/prismicio/prismic-ts-codegen/commit/cd7c00202b753b045ff2e57d484e40c9ae4b439d))
* rename repo ([a772e2c](https://github.com/prismicio/prismic-ts-codegen/commit/a772e2c6c3535ffd010bc9572b6a1fbb4a88df0e))
* update package infrastructure ([a288428](https://github.com/prismicio/prismic-ts-codegen/commit/a2884284a96ba09e062f750ef77393fe2a7d7989))
* update package rename in all files ([22cb235](https://github.com/prismicio/prismic-ts-codegen/commit/22cb235fe23c10c2b3d822077dc932eda6358944))

### 0.0.1 (2021-12-22)


### Features

* add basic CLI ([f9b1f63](https://github.com/prismicio/prismic-ts-codegen/commit/f9b1f636b3a5d266c066f48532ef8ab6f96d2d16))
* add comprehensive TSDocs to output ([61be837](https://github.com/prismicio/prismic-ts-codegen/commit/61be8373e8a76638e7632f9cd86de87320fa3afa))
* add Shared Slice support ([a04019b](https://github.com/prismicio/prismic-ts-codegen/commit/a04019baee3e51e12e7a60aaae2e72e3d67f8beb))
* init ([d74c88e](https://github.com/prismicio/prismic-ts-codegen/commit/d74c88e1bad9355838e377e2bae8b844430641e0))


### Refactor

* use direct interface maniulation ([6ff6a78](https://github.com/prismicio/prismic-ts-codegen/commit/6ff6a7868e350764181f6d8780ceae9cda7ed4a1))


### Documentation

* add CLI example ([3faf25c](https://github.com/prismicio/prismic-ts-codegen/commit/3faf25cf141fcad93b3d3fbbc0b4b02a9fc99d32))


### Chore

* do not track bin dir ([cb07ab1](https://github.com/prismicio/prismic-ts-codegen/commit/cb07ab1287477cb15890a82fe450fa0008fbc714))
* update package info ([24dc879](https://github.com/prismicio/prismic-ts-codegen/commit/24dc8795c4d5beae330c9181d9e9a30cfb74f276))
