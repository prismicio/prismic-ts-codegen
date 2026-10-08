import baseDedent from "dedent";

const baseDedentWithOptions = baseDedent.withOptions({ alignValues: true });

export function dedent(strings: TemplateStringsArray | string, ...values: unknown[]): string {
	if (typeof strings === "string") {
		return baseDedentWithOptions(strings);
	}

	// dedent reads `strings.raw` by default, which keeps escapes in string literals. Point `raw` at
	// the regular string segments instead, where escapes are already resolved.
	const resolved = Array.from(strings);
	return baseDedentWithOptions(Object.assign(resolved, { raw: resolved }), ...values);
}
