import { createMockFactory } from "@prismicio/mock";
import * as v0_1_11 from "prismic-ts-codegen-v0-1-11";
import { test } from "vitest";

import * as src from "../src";

const mock = createMockFactory({ seed: import.meta.url });
const customTypeModels = Array.from({ length: 10 }, () =>
	mock.model.customType({
		fields: mock.model.buildMockGroupFieldMap(),
	}),
);
const sharedSliceModels = Array.from({ length: 10 }, () =>
	mock.model.sharedSlice({
		variations: [
			mock.model.sharedSliceVariation({
				primaryFields: mock.model.buildMockGroupFieldMap(),
				itemsFields: mock.model.buildMockGroupFieldMap(),
			}),
		],
	}),
);

test("cached", async ({ bench }) => {
	await bench.compare(
		bench("generate types (src)", () => {
			src.generateTypes({ customTypeModels, sharedSliceModels, cache: true });
		}),
		// No caching available
		bench("generate types (v0.1.11)", () => {
			v0_1_11.generateTypes({ customTypeModels, sharedSliceModels });
		}),
	);
});

test("uncached", async ({ bench }) => {
	await bench.compare(
		bench("generate types (src)", () => {
			src.generateTypes({ customTypeModels, sharedSliceModels, cache: false });
		}),
		// No caching available
		bench("generate types (v0.1.11)", () => {
			v0_1_11.generateTypes({ customTypeModels, sharedSliceModels });
		}),
	);
});
