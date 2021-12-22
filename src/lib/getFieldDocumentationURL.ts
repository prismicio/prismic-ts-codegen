import type { CustomTypeModelField } from "@prismicio/types";

import { FIELD_DOCUMENTATION_URLS } from "../constants";

type GetFieldDocumentationURLConfig = {
	model: CustomTypeModelField;
};

export const getFieldDocumentationURL = (
	config: GetFieldDocumentationURLConfig,
): string => {
	return FIELD_DOCUMENTATION_URLS[config.model.type];
};
