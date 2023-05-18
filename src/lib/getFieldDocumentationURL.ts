import type { CustomTypeModelField } from "@prismicio/client";

import { FIELD_DOCUMENTATION_URLS } from "../constants";

type GetFieldDocumentationURLConfig = {
	model: CustomTypeModelField;
};

export const getFieldDocumentationURL = (
	config: GetFieldDocumentationURLConfig,
): string | undefined => {
	return FIELD_DOCUMENTATION_URLS[
		config.model.type as keyof typeof FIELD_DOCUMENTATION_URLS
	];
};
