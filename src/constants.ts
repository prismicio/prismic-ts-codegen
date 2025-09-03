import { CustomTypeModelFieldType } from "@prismicio/client";

export const CUSTOM_TYPES_DOCUMENTATION_URL =
	"https://prismic.io/docs/content-modeling";

export const SHARED_SLICES_DOCUMENTATION_URL = "https://prismic.io/docs/slices";

export const FIELD_DOCUMENTATION_URLS = {
	UID: "https://prismic.io/docs/fields/uid",
	Boolean: "https://prismic.io/docs/fields/boolean",
	Color: "https://prismic.io/docs/fields/color",
	Date: "https://prismic.io/docs/fields/date",
	Timestamp: "https://prismic.io/docs/fields/timestamp",
	Number: "https://prismic.io/docs/fields/number",
	Text: "https://prismic.io/docs/fields/text",
	Select: "https://prismic.io/docs/fields/select",
	StructuredText: "https://prismic.io/docs/fields/rich-text",
	Image: "https://prismic.io/docs/fields/image",
	Link: {
		contentRelationship: "https://prismic.io/docs/fields/content-relationship",
		link: "https://prismic.io/docs/fields/link",
		linkToMedia: "https://prismic.io/docs/fields/link-to-media",
	},
	Embed: "https://prismic.io/docs/fields/embed",
	GeoPoint: "https://prismic.io/docs/fields/geopoint",
	Table: "https://prismic.io/docs/fields/table",
	Group: "https://prismic.io/docs/fields/repeatable-group",
	IntegrationFields: "https://prismic.io/docs/fields/integration",
	Slices: "https://prismic.io/docs/slices",
	Choice: "https://prismic.io/docs/slices",
} satisfies Record<
	Exclude<
		(typeof CustomTypeModelFieldType)[keyof typeof CustomTypeModelFieldType],
		"Range" | "Separator"
	>,
	string | Record<string, string>
>;
