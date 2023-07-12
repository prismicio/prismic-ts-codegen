import type { CustomTypeModelFieldType } from "@prismicio/client";

export const CUSTOM_TYPES_DOCUMENTATION_URL =
	"https://prismic.io/docs/custom-types";

export const SHARED_SLICES_DOCUMENTATION_URL = "https://prismic.io/docs/slice";

export const FIELD_DOCUMENTATION_URLS: Record<
	Exclude<
		(typeof CustomTypeModelFieldType)[keyof typeof CustomTypeModelFieldType],
		"Range" | "Separator"
	>,
	string
> = {
	UID: "https://prismic.io/docs/field#uid",
	Boolean: "https://prismic.io/docs/field#boolean",
	Color: "https://prismic.io/docs/field#color",
	Date: "https://prismic.io/docs/field#date",
	Timestamp: "https://prismic.io/docs/field#timestamp",
	Number: "https://prismic.io/docs/field#number",
	Text: "https://prismic.io/docs/field#key-text",
	Select: "https://prismic.io/docs/field#select",
	StructuredText: "https://prismic.io/docs/field#rich-text-title",
	Image: "https://prismic.io/docs/field#image",
	Link: "https://prismic.io/docs/field#link-content-relationship",
	Embed: "https://prismic.io/docs/field#embed",
	GeoPoint: "https://prismic.io/docs/field#geopoint",
	Group: "https://prismic.io/docs/field#group",
	IntegrationFields: "https://prismic.io/docs/field#integration",
	Slices: "https://prismic.io/docs/field#slices",
	Choice: "https://prismic.io/docs/field#slices",
};
