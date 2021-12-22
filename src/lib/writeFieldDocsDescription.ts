import type { CodeBlockWriter } from "ts-morph";

type BuildFieldDocsConfig = {
	writer: CodeBlockWriter;
	description?: string;
	fieldType?: string;
	defaultValue?: string | boolean;
	placeholder?: string;
	apiIDPath?: string;
	documentationURL?: string;
};

export const writeFieldDocsDescription = (
	config: BuildFieldDocsConfig,
): void => {
	if (config.description) {
		config.writer.writeLine(config.description);
	}

	config.writer.blankLineIfLastNot();

	if (config.fieldType) {
		config.writer.writeLine(`- **Field Type**: ${config.fieldType}`);
	}

	if (config.placeholder) {
		config.writer.writeLine(`- **Placeholder**: ${config.placeholder}`);
	}

	if (config.defaultValue !== undefined) {
		const stringifiedDefaultValue =
			typeof config.defaultValue === "boolean"
				? `${config.defaultValue}`
				: config.defaultValue;

		config.writer.writeLine(`- **Default Value**: ${stringifiedDefaultValue}`);
	}

	if (config.apiIDPath) {
		config.writer.writeLine(`- **API ID Path**: ${config.apiIDPath}`);
	}

	if (config.documentationURL) {
		config.writer.writeLine(`- **Documentation**: ${config.documentationURL}`);
	}
};
