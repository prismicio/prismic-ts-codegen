import type { CustomTypeModelFieldType } from "@prismicio/client";

export const BLANK_LINE_IDENTIFIER = "// ___BLANK_LINE_TO_BE_REPLACED___";

export const CUSTOM_TYPES_DOCUMENTATION_URL =
	"https://prismic.io/docs/core-concepts/custom-types";

export const SHARED_SLICES_DOCUMENTATION_URL =
	"https://prismic.io/docs/core-concepts/reusing-slices";

export const FIELD_DOCUMENTATION_URLS: Record<
	Exclude<
		(typeof CustomTypeModelFieldType)[keyof typeof CustomTypeModelFieldType],
		"Range" | "Separator"
	>,
	string
> = {
	UID: "https://prismic.io/docs/core-concepts/uid",
	Boolean: "https://prismic.io/docs/core-concepts/boolean",
	Color: "https://prismic.io/docs/core-concepts/color",
	Date: "https://prismic.io/docs/core-concepts/date",
	Timestamp: "https://prismic.io/docs/core-concepts/timestamp",
	Number: "https://prismic.io/docs/core-concepts/number",
	Text: "https://prismic.io/docs/core-concepts/key-text",
	Select: "https://prismic.io/docs/core-concepts/select",
	StructuredText: "https://prismic.io/docs/core-concepts/rich-text-title",
	Image: "https://prismic.io/docs/core-concepts/image",
	Link: "https://prismic.io/docs/core-concepts/link-content-relationship",
	Embed: "https://prismic.io/docs/core-concepts/embed",
	GeoPoint: "https://prismic.io/docs/core-concepts/geopoint",
	Group: "https://prismic.io/docs/core-concepts/group",
	IntegrationFields: "https://prismic.io/docs/core-concepts/integration-fields",
	Slices: "https://prismic.io/docs/core-concepts/slices",
	Choice: "https://prismic.io/docs/core-concepts/slices",
};
