import { TypesProvider } from "../generateTypes";

/**
 * Configuration to control the generated types.
 */
export type Config = {
	/**
	 * The name of the Prismic repository.
	 */
	repositoryName?: string;

	/**
	 * The access token for the Prismic repository. If the repository is private
	 * and `locales.fetchFromRepository` is `true`, providing a token is
	 * required.
	 */
	accessToken?: string;

	/**
	 * The Custom Types API token for the Prismic repository. If
	 * `models.fetchFromRepository` is `true`, providing a token is required.
	 */
	customTypesAPIToken?: string;

	/**
	 * The file path where the generated types will be saved. This path is
	 * relative to where the command is called.
	 */
	output?: string;

	/**
	 * The package that provides TypeScript types for Prismic data. Most projects
	 * will not need to configure this option.
	 *
	 * @defaultValue Automatically detected using the project's `package.json`.
	 */
	typesProvider?: TypesProvider;

	/**
	 * Configuration for automatic `@prismicio/client` integration.
	 */
	clientIntegration?: {
		/**
		 * Determines if a `@prismicio/client` integration with automatic typing
		 * should be included in the output.
		 *
		 * If set to `true`, Prismic clients will automatically be typed with the
		 * generated Custom Types and Slices.
		 *
		 * **Note**: If your project queries content from multiple Prismic
		 * repositories, set `includeCreateClientInterface` to `true` for the
		 * primary repository and `false` or any other repository. The generated
		 * `AllDocumentTypes` type for non-primary repositories can be provided to
		 * `@prismicio/client`'s `creatClient()` function as its only type parameter
		 * to type the client.
		 *
		 * @defaultValue `true`
		 */
		includeCreateClientInterface?: boolean;

		/**
		 * Determines if a `@prismicio/client` namespace named `Content` containing
		 * all Document and Slice types should be included in the output.
		 *
		 * If set to `true`, a `Content` namespace from `@prismicio/client` will be
		 * available to import to easily access types for your Prismic repository
		 * content.
		 *
		 * **Note**: If your project queries content from multiple Prismic
		 * repositories, set `includeContentNamespace` to `true` for the primary
		 * repository and `false` or any other repository. Types for non-primary
		 * repositories should be imported directly from the generated file rather
		 * than via the `Content` namespace.
		 *
		 * @defaultValue `true`
		 */
		includeContentNamespace?: boolean;
	};

	/**
	 * Configuration for languages for the Prismic repository.
	 *
	 * It can be configured by providing an array of locale IDs configured for the
	 * repository or an object with finer control.
	 *
	 * @example
	 *
	 * ```ts
	 * ["en-us", "fr-fr"];
	 * ```
	 *
	 * @example
	 *
	 * ```ts
	 * {
	 * 	"ids": ["en-us", "fr-fr"],
	 * 	"fetchFromRepository": true
	 * }
	 * ```
	 */
	locales?:
		| string[]
		| {
				/**
				 * A list of locales configured for the Prismic repository. This is used
				 * to type a document's `lang` property.
				 *
				 * @example
				 *
				 * ```ts
				 * ["en-us", "fr-fr"];
				 * ```
				 */
				ids?: string[];

				/**
				 * Determines if the Prismic repository's locales should be fetched from
				 * the repository's API.
				 */
				fetchFromRepository?: boolean;
		  };

	/**
	 * Configuration for Custom Type and Slice models for the Prismic repository.
	 *
	 * It can be configured by providing an array of file paths to Custom Type and
	 * Slice JSON models or an object with finer control.
	 */
	models?:
		| string[]
		| {
				/**
				 * A list of file paths to Custom Type and Slice models. Globs are
				 * supported.
				 */
				files?: string[];

				/**
				 * Determines if the Prismic repository's Custom Type and Slice models
				 * should be fetched from the repository's API.
				 *
				 * `customTypesAPIToken` must be provided if set to `true`.
				 */
				fetchFromRepository?: boolean;
		  };

	/**
	 * Configuration for types generated for fields.
	 */
	fields?: {
		/**
		 * Configuration for Embed fields.
		 */
		embed?: {
			/**
			 * An object mapping oEmbed providers to their type. The type should be
			 * provided as a string and is added directly into the generated types.
			 *
			 * @example
			 *
			 * ```ts
			 * {
			 * 	"YouTube": "import('./types').OEmbedYouTube"
			 * 	"Twitter": "import('./types').OEmbedTwitter"
			 * 	"Vimeo": "import('./types').OEmbedVimeo"
			 * }
			 * ```
			 */
			providerTypes?: Record<string, string>;
		};

		/**
		 * Configuration for Integration Fields.
		 */
		integrationFields?: {
			/**
			 * An object mapping catalog IDs to their type. The type should be
			 * provided as a string and is added directly into the generated types.
			 *
			 * @example
			 *
			 * ```ts
			 * {
			 * 	"shopify_products": "import('./types').IntegrationFieldShopifyProduct"
			 * 	"mux_videos": "import('./types').IntegrationFieldMuxVideo"
			 * }
			 * ```
			 */
			catalogTypes?: Record<string, string>;
		};
	};
};
