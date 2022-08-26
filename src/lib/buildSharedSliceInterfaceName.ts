import { makeSafeTypeName } from "./makeSafeTypeName";
import { pascalCase } from "./pascalCase";

type BuildSharedSliceInterfaceNameConfig = {
	id: string;
};

export const buildSharedSliceInterfaceName = (
	config: BuildSharedSliceInterfaceNameConfig,
): string => {
	return makeSafeTypeName(pascalCase(`${config.id} Slice`));
};
