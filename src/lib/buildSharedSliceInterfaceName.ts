import { pascalCase } from "./pascalCase";

type BuildSharedSliceInterfaceNameConfig = {
	id: string;
};

export const buildSharedSliceInterfaceName = (
	config: BuildSharedSliceInterfaceNameConfig,
): string => {
	return pascalCase(`${config.id} SharedSlice`);
};
