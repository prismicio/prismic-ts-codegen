export type Config = {
	repositoryName?: string;
	accessToken?: string;
	customTypesAPIToken?: string;

	output?: string;

	locales?:
		| string[]
		| {
				ids?: string[];
				fetchFromRepository?: boolean;
		  };

	models?:
		| string[]
		| {
				files?: string[];
				fetchFromRepository?: boolean;
		  };

	fields?: {
		embed?: {
			providerTypes?: Record<string, string>;
		};
		integrationFields?: {
			catalogTypes?: Record<string, string>;
		};
	};
};
