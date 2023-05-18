import * as crypto from "crypto";
import * as tsm from "ts-morph";

const project = new tsm.Project({ useInMemoryFileSystem: true });

export const parseSourceFile = (sourceFileText: string): tsm.SourceFile => {
	const filePath =
		crypto.createHash("md5").update(sourceFileText).digest("hex") + ".ts";

	return project.createSourceFile(filePath, sourceFileText, {
		overwrite: true,
	});
};
