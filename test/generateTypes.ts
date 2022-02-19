import test from "ava";

import * as lib from "../src";

test("outputs base types without models", (t) => {
	const res = lib.generateTypes();

	t.log(res);
});
