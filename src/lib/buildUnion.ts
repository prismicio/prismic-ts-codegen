export function buildUnion(types: string[]) {
	return types.filter(Boolean).join(" | ") || "never";
}
