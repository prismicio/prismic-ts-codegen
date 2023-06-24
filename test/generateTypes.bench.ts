import { bench } from "vitest";

import * as latest from "prismic-ts-codegen-latest";
import { createMockFactory } from "@prismicio/mock";

import * as src from "../src";

const mock = createMockFactory({ seed: import.meta.url });
const customTypeModels = Array.from({ length: 5 }, () =>
	mock.model.customType({
		fields: mock.model.buildMockGroupFieldMap(),
	}),
);
const sharedSliceModels = Array.from({ length: 5 }, () =>
	mock.model.sharedSlice({
		variations: [
			mock.model.sharedSliceVariation({
				primaryFields: mock.model.buildMockGroupFieldMap(),
				itemsFields: mock.model.buildMockGroupFieldMap(),
			}),
		],
	}),
);

bench("generate types (src)", () => {
	src.generateTypes({ customTypeModels, sharedSliceModels });
});

bench("generate types (latest)", () => {
	latest.generateTypes({ customTypeModels, sharedSliceModels });
});
