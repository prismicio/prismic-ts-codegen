import { FieldPath } from "../types";

import { getHumanReadableModelName } from "./getHumanReadableModelName";

type GetHumanReadablePathArgs = {
	path: FieldPath;
};

export function getHumanReadablePath(args: GetHumanReadablePathArgs) {
	return args.path
		.map((element) => {
			if (element.label) {
				return element.label;
			} else if (element.model) {
				return getHumanReadableModelName({
					model: element.model,
					name: element.name,
				});
			} else {
				return element.name;
			}
		})
		.join(" → ");
}
