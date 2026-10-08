import { readFileSync } from "fs";

import type { CustomTypeModel, SharedSliceModel } from "@prismicio/client";
import { glob } from "tinyglobby";

const isCustomTypeModel = (input: unknown): input is CustomTypeModel => {
	return typeof input === "object" && input !== null && "json" in input;
};

const isSharedSliceModel = (input: unknown): input is SharedSliceModel => {
	return typeof input === "object" && input !== null && "variations" in input;
};

const readJSONFromGlob = async <T>(globs: string): Promise<T[]> => {
	const paths = await glob(
		globs.split(",").map((path) => path.trim()),
		{ expandDirectories: false },
	);

	return paths.map((path) => {
		const raw = readFileSync(path, "utf8");

		return JSON.parse(raw);
	});
};

const fetchCustomTypesAPI = async <T>(
	path: string,
	config: { repositoryName: string; customTypesAPIToken: string },
): Promise<T[]> => {
	const res = await fetch(new URL(path, "https://customtypes.prismic.io/"), {
		headers: {
			repository: config.repositoryName,
			Authorization: `Bearer ${config.customTypesAPIToken}`,
		},
	});

	if (!res.ok) {
		throw new Error(
			`Failed to fetch models from the Custom Types API (${res.status}): ${await res.text()}`,
		);
	}

	return await res.json();
};

type LoadModelsConfig =
	| {
			localPaths?: string[];
	  }
	| {
			localPaths?: string[];
			repositoryName: string;
			customTypesAPIToken: string;
			fetchFromRepository?: boolean;
	  };

type LoadModelsReturnType = {
	customTypeModels: CustomTypeModel[];
	sharedSliceModels: SharedSliceModel[];
};

export const loadModels = async (config: LoadModelsConfig): Promise<LoadModelsReturnType> => {
	const customTypeModels: Record<string, CustomTypeModel> = {};
	const sharedSliceModels: Record<string, SharedSliceModel> = {};

	if ("customTypesAPIToken" in config) {
		if (config.fetchFromRepository) {
			const [remoteCustomTypeModels, remoteSharedSliceModels] = await Promise.all([
				fetchCustomTypesAPI<CustomTypeModel>("customtypes", config),
				fetchCustomTypesAPI<SharedSliceModel>("slices", config),
			]);

			for (const customTypeModel of remoteCustomTypeModels) {
				customTypeModels[customTypeModel.id] = customTypeModel;
			}
			for (const sharedSliceModel of remoteSharedSliceModels) {
				sharedSliceModels[sharedSliceModel.id] = sharedSliceModel;
			}
		}
	}

	if (config.localPaths) {
		const models = (
			await Promise.all(config.localPaths.map((glob) => readJSONFromGlob(glob)))
		).flat();

		for (const model of models) {
			if (isCustomTypeModel(model)) {
				customTypeModels[model.id] = model;
			} else if (isSharedSliceModel(model)) {
				sharedSliceModels[model.id] = model;
			}
		}
	}

	return {
		customTypeModels: Object.values(customTypeModels).sort((a, b) => {
			return a.id.localeCompare(b.id);
		}),
		sharedSliceModels: Object.values(sharedSliceModels).sort((a, b) => {
			return a.id.localeCompare(b.id);
		}),
	};
};
