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

export type FieldConfigs = {
	embed?: {
		providerTypes?: Record<string, string>;
	};
	integrationFields?: {
		catalogTypes?: Record<string, string>;
	};
};
