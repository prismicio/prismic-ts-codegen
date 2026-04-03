export function buildUnion(types: string[]): string {
	return types.filter(Boolean).join(" | ") || "never";
}
