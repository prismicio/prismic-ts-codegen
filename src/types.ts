import type {
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelSlice,
	SharedSliceModel,
} from "@prismicio/types";

export type PathElement<
	Model extends
		| CustomTypeModel
		| SharedSliceModel
		| CustomTypeModelField
		| CustomTypeModelSlice,
> = {
	id: string;
	model?: Model;
	label?: string;
};
