import Joi from "joi";

import { Config } from "./types";

export const configSchema = Joi.object<Config>({
	repositoryName: Joi.string()
		.when("locales.fetchFromRepository", {
			is: true,
			then: Joi.required(),
		})
		.when("models.fetchFromRepository", {
			is: true,
			then: Joi.required(),
		}),
	accessToken: Joi.string(),
	customTypesAPIToken: Joi.string(),

	output: Joi.string(),

	typesProvider: Joi.string().allow("@prismicio/client", "@prismicio/client"),

	clientIntegration: Joi.object({
		includeCreateClientInterface: Joi.boolean(),
		includeContentNamespace: Joi.boolean(),
	}),

	locales: Joi.alternatives(
		Joi.array().items(Joi.string().required()),
		Joi.object({
			ids: Joi.array().items(Joi.string().required()),
			fetchFromRepository: Joi.boolean(),
		}),
	),

	models: Joi.alternatives(
		Joi.array().items(Joi.string()),
		Joi.object({
			files: Joi.array().items(Joi.string()),
			fetchFromRepository: Joi.boolean(),
		}),
	),

	fields: Joi.object({
		embed: Joi.object({
			providerTypes: Joi.object().pattern(
				Joi.string(),
				Joi.string().required(),
			),
		}),
		integrationFields: Joi.object({
			catalogTypes: Joi.object().pattern(Joi.string(), Joi.string().required()),
		}),
	}),
});
