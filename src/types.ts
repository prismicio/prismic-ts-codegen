import type {
	CustomTypeModel,
	CustomTypeModelField,
	CustomTypeModelSlice,
	SharedSliceModel,
} from "@prismicio/client";

export type PathElement<
	Model extends
		| CustomTypeModel
		| SharedSliceModel
		| CustomTypeModelField
		| CustomTypeModelSlice,
> = {
	name: string;
	model?: Model;
	label?: string;
};

export type FieldPath = [
	PathElement<CustomTypeModel | SharedSliceModel>,
	...PathElement<CustomTypeModelField | CustomTypeModelSlice>[],
];

export type AuxiliaryType = {
	code: string;
	name: string;
};

export type FieldConfigs = {
	embed?: {
		providerTypes?: Record<string, string>;
	};
	integrationFields?: {
		catalogTypes?: Record<string, string>;
	};
};
