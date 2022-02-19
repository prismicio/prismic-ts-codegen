import test from "ava";

import { parseSourceFile } from "./__testutils__/parseSourceFile";

import * as lib from "../src";

test('includes "DO NOT EDIT" header', (t) => {
	const res = lib.generateTypes();
	const file = parseSourceFile(res);

	const headerStatement = file.getStatementsWithComments()[0];

	t.is(headerStatement.getKindName(), "SingleLineCommentTrivia");
	t.regex(headerStatement.getText(), /DO NOT EDIT/);
});

test("imports @prismicio/types as prismicT", (t) => {
	const res = lib.generateTypes();
	const file = parseSourceFile(res);

	const importDeclaration =
		file.getImportDeclarationOrThrow("@prismicio/types");

	t.is(importDeclaration.getNamespaceImportOrThrow().getText(), "prismicT");
	t.true(importDeclaration.isTypeOnly());
});
