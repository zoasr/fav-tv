export const seo = ({
	title,
	description,
	keywords,
	image,
	canonical,
	author,
	robots,
	lang = "en",
	extra = [],
}: {
	title: string;
	description?: string;
	image?: string;
	keywords?: string;
	canonical?: string;
	author?: string;
	robots?: string;
	lang?: string;
	extra?: Array<Record<string, string>>;
}) => {
	const tags = [
		{ title },
		{ name: "description", content: description },
		{ name: "keywords", content: keywords },
		{ name: "author", content: author },
		{ name: "robots", content: robots },
		{ name: "language", content: lang },
		{ rel: "canonical", href: canonical },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{
			name: "twitter:card",
			content: image ? "summary_large_image" : "summary",
		},
		...(image
			? [
					{ name: "twitter:image", content: image },
					{ name: "og:image", content: image },
				]
			: []),
		{ name: "og:type", content: "website" },
		{ name: "og:title", content: title },
		{ name: "og:description", content: description },
		...extra,
	].filter((tag) =>
		Object.values(tag).every(
			(v) => v !== undefined && v !== null && v !== ""
		)
	);

	return tags;
};
