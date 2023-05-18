import * as prismicCT from "@prismicio/custom-types-client";
import type { CustomTypeModel, SharedSliceModel } from "@prismicio/client";
import fg from "fast-glob";
import { readFileSync } from "fs";
import fetch from "node-fetch";

const isCustomTypeModel = (input: unknown): input is CustomTypeModel => {
	return typeof input === "object" && input !== null && "json" in input;
};

const isSharedSliceModel = (input: unknown): input is SharedSliceModel => {
	return typeof input === "object" && input !== null && "variations" in input;
};

const readJSONFromGlob = async <T>(globs: string): Promise<T[]> => {
	const paths = await fg(globs.split(",").map((path) => path.trim()));

	return paths.map((path) => {
		const raw = readFileSync(path, "utf8");

		return JSON.parse(raw);
	});
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

export const loadModels = async (
	config: LoadModelsConfig,
): Promise<LoadModelsReturnType> => {
	const customTypeModels: Record<string, CustomTypeModel> = {};
	const sharedSliceModels: Record<string, SharedSliceModel> = {};

	if ("customTypesAPIToken" in config) {
		const customTypesClient = prismicCT.createClient({
			repositoryName: config.repositoryName,
			token: config.customTypesAPIToken,
			fetch,
		});

		if (config.fetchFromRepository) {
			const [remoteCustomTypeModels, remoteSharedSliceModels] =
				await Promise.all([
					customTypesClient.getAllCustomTypes(),
					customTypesClient.getAllSharedSlices(),
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
