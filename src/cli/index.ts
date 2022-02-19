import { readFileSync, writeFileSync } from "fs";
import { resolve as resolvePath } from "path";
import fg from "fast-glob";
import meow from "meow";
import type { CustomTypeModel, SharedSliceModel } from "@prismicio/types";

import { generateTypes } from "../index";

const cli = meow(
	`
	Usage
	  $ prismic-ts-codegen

	Options
	  --customTypes, -c   Paths to Custom Type JSON models (supports globs)
	  --sharedSlices, -s  Paths to Shared Slice JSON models (supports globs)
	  --write, -w         Write generated types to a file
	`,
	{
		importMeta: import.meta,
		flags: {
			customTypes: {
				type: "string",
				alias: "c",
			},
			sharedSlices: {
				type: "string",
				alias: "s",
			},
			write: {
				type: "string",
				alias: "w",
			},
		},
	},
);

const readModelsFromGlobs = async <
	Model extends CustomTypeModel | SharedSliceModel,
>(
	globs: string,
): Promise<Model[]> => {
	const paths = await fg(globs.split(",").map((path) => path.trim()));

	return paths.map((path): Model => {
		const raw = readFileSync(path, "utf8");

		return JSON.parse(raw);
	});
};

const main = async () => {
	const customTypeModels = cli.flags.customTypes
		? await readModelsFromGlobs<CustomTypeModel>(cli.flags.customTypes)
		: [];

	const sharedSliceModels = cli.flags.sharedSlices
		? await readModelsFromGlobs<SharedSliceModel>(cli.flags.sharedSlices)
		: [];

	const types = generateTypes({
		customTypeModels,
		sharedSliceModels,
	});

	if (cli.flags.write) {
		writeFileSync(resolvePath(cli.flags.write), types);
	} else {
		process.stdout.write(types + "\n");
	}
};

main().catch((error) => console.error(error));
