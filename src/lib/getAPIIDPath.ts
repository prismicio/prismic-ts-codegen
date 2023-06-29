import { FieldPath } from "../types";

type GetAPIIDPathArgs = {
	path: FieldPath;
};

export function getAPIIDPath(args: GetAPIIDPathArgs) {
	return args.path
		.map((element, i) => {
			if (
				element.model &&
				"type" in element.model &&
				(element.model.type === "Group" || element.model.type === "Slices")
			) {
				return `${element.id}[]`;
			} else {
				if (element.id === "items") {
					const previousElement = args.path[i - 1];

					if (
						(previousElement.model && "json" in previousElement.model) ||
						(previousElement.model &&
							"type" in previousElement.model &&
							previousElement.model.type === "SharedSlice")
					) {
						return `${element.id}[]`;
					}
				}

				return element.id;
			}
		})
		.join(".");
}
