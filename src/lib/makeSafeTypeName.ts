export const makeSafeTypeName = (name: string) => {
	if (/^[0-9]/.test(name) ? "_" : "") {
		return `_${name}`;
	} else {
		return name;
	}
};
