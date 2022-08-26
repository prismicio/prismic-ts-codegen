import { pascalCase } from "./pascalCase";

type BuildSharedSliceInterfaceNamePartConfig = {
	id: string;
};

export const buildSharedSliceInterfaceNamePart = (
	config: BuildSharedSliceInterfaceNamePartConfig,
): string => {
	return pascalCase(`${config.id} Slice`);
};
