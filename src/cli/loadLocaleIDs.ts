import * as prismic from "@prismicio/client";
import fetch from "node-fetch";

type LoadLocalesConfig =
	| {
			localeIDs?: string[];
	  }
	| {
			localeIDs?: string[];
			repositoryName: string;
			accessToken: string;
			fetchFromRepository?: boolean;
	  };

export const loadLocaleIDs = async (
	config: LoadLocalesConfig,
): Promise<string[]> => {
	const localeIDs = new Set<string>(config.localeIDs || []);

	if ("repositoryName" in config && config.fetchFromRepository) {
		const client = prismic.createClient(config.repositoryName, {
			accessToken: config.accessToken,
			fetch,
		});

		const repository = await client.getRepository();

		for (const language of repository.languages) {
			localeIDs.add(language.id);
		}
	}

	return [...localeIDs];
};
