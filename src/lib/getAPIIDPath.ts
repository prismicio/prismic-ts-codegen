import { FieldPath } from "../types";

type GetAPIIDPathArgs = {
	path: FieldPath;
};

export function getAPIIDPath(args: GetAPIIDPathArgs) {
	let result = "";

	for (let i = 0; i < args.path.length; i++) {
		if (i > 0) {
			result += ".";
		}

		const element = args.path[i];

		if (
			element.model &&
			"type" in element.model &&
			(element.model.type === "Group" || element.model.type === "Slices")
		) {
			result += `${element.name}[]`;
		} else {
			if (element.name === "items") {
				const previousElement = args.path[i - 1];

				if (
					(previousElement.model && "json" in previousElement.model) ||
					(previousElement.model &&
						"type" in previousElement.model &&
						previousElement.model.type === "SharedSlice")
				) {
					result += `${element.name}[]`;

					continue;
				}
			}

			result += element.name;
		}
	}

	return result;
}
