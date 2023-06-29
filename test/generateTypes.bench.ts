import { bench } from "vitest";

import * as v0_1_11 from "prismic-ts-codegen-v0-1-11";
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

bench("generate types (src)", async () => {
	await src.generateTypes({ customTypeModels, sharedSliceModels });
});

bench("generate types (latest)", async () => {
	v0_1_11.generateTypes({ customTypeModels, sharedSliceModels });
});