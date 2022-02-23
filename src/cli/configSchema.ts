import Joi from "joi";

import { Config } from "./types";

export const configSchema = Joi.object<Config>({
	repositoryName: Joi.string(),
	accessToken: Joi.string(),
	customTypesAPIToken: Joi.string(),

	output: Joi.string(),

	locales: Joi.alternatives(
		Joi.array().items(Joi.string().required()),
		Joi.object({
			ids: Joi.array().items(Joi.string().required()),
			fetchFromRepository: Joi.boolean(),
		}),
	),

	models: Joi.alternatives(
		Joi.array().items(Joi.string().required()),
		Joi.object({
			files: Joi.array().items(Joi.string().required()),
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
})
	.when(
		Joi.object({
			locales: Joi.object({
				fetchFromRepository: Joi.valid(true),
			}),
		}),
		{
			then: Joi.object({
				repositoryName: Joi.required(),
			}),
		},
	)
	.when(
		Joi.object({
			models: Joi.object({
				fetchFromRepository: Joi.valid(true),
			}),
		}),
		{
			then: Joi.object({
				repositoryName: Joi.required(),
				customTypesAPIToken: Joi.required(),
			}),
		},
	);
