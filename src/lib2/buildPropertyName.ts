export function buildPropertyName(name: string): string {
	return name.includes("-") || name.includes(":") || /^[0-9]/.test(name)
		? `"${name}"`
		: name;
}
