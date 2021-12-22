import * as prismicT from "@prismicio/types";

type Simplify<T> = {
	[KeyType in keyof T]: T[KeyType];
};

/**
 * Item in *Page → Cards[]*
 *
 * - **Documentation**: https://prismic.io/docs/core-concepts/group
 */
interface PageDocumentDataCardsItem {
	/**
	 * Heading field in *Page → Cards[] → Heading*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: A short title for the card
	 * - **API ID Path**: `page.data.cards[].heading`
	 * - **Documentation**: https://prismic.io/docs/core-concepts/rich-text-title
	 *
	 * @example With `@prismicio/react`
	 *
	 * ```typescriptreact
	 * <PrismicRichText field={heading} />
	 * <PrismicText field={heading} />
	 * ```
	 *
	 * @example With `@prismicio/helpers`
	 *
	 * ```typescript
	 * const html = asHTML(heading);
	 * const text = asText(heading);
	 * ```
	 *
	 * @see https://prismic.io/docs/technical-reference/prismicio-react
	 * @see https://prismic.io/docs/technical-reference/prismicio-helpers
	 */
	heading: prismicT.TitleField;
}

/**
 * Content for Page documents.
 */
type PrismicPageData = {
	/**
	 * Cards field in *Page → Cards[]*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: `page.data.cards[]`
	 * - **Documentation**: https://prismic.io/docs/core-concepts/group
	 *
	 * @example
	 *
	 * ```typescriptreact
	 * <div>
	 * 	{cards.map((item) => (
	 * 		<Item item={item} />
	 * 	))}
	 * </div>;
	 * ```
	 *
	 * @see https://prismic.io/docs/technical-reference/prismicio-react
	 * @see https://prismic.io/docs/technical-reference/prismicio-helpers
	 */
	cards: prismicT.GroupField<Simplify<PageDocumentDataCardsItem>>;
};

/**
 * Page document from Prismic
 *
 * - **API ID**: `page`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/core-concepts/custom-types
 *
 * @example Query using `@prismicio/client`
 *
 * ```typescript
 * const documents = await client.getAllByType("page");
 * const document = await client.getByUID("page", "home");
 * ```
 *
 * @example Query using `@prismicio/react`
 *
 * ```typescript
 * const [documents] = useAllPrismicDocumentsByType("page");
 * const [document] = usePrismicDocumentByUID("page", "example-uid");
 * ```
 *
 * @see https://prismic.io/docs/technical-reference/prismicio-client
 * @see https://prismic.io/docs/technical-reference/prismicio-react
 */
export type PrismicPage<Lang = string> = prismicT.PrismicDocumentWithUID<
	PrismicPageData,
	"page",
	Lang
>;
