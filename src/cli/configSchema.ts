import { z } from "zod";

export const configSchema = z.object({
	repositoryName: z.string().optional(),
	accessToken: z.string().optional(),
	customTypesAPIToken: z.string().optional(),

	output: z.string().optional(),

	typesProvider: z
		.enum(["@prismicio/client", "@prismicio/types"])
		.optional(),

	clientIntegration: z
		.object({
			includeCreateClientInterface: z.boolean().optional(),
			includeContentNamespace: z.boolean().optional(),
		})
		.optional(),

	locales: z
		.union([
			z.array(z.string()),
			z.object({
				ids: z.array(z.string()).optional(),
				fetchFromRepository: z.boolean().optional(),
			}),
		])
		.optional(),

	models: z
		.union([
			z.array(z.string()),
			z.object({
				files: z.array(z.string()).optional(),
				fetchFromRepository: z.boolean().optional(),
			}),
		])
		.optional(),

	fields: z
		.object({
			embed: z
				.object({
					providerTypes: z.record(z.string(), z.string()).optional(),
				})
				.optional(),
			integrationFields: z
				.object({
					catalogTypes: z.record(z.string(), z.string()).optional(),
				})
				.optional(),
		})
		.optional(),
});
