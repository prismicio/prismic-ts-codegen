import { createMockFactory } from "@prismicio/mock";
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

test("generate types", async ({ bench }) => {
	await bench.compare(
		bench("cached", () => {
			src.generateTypes({ customTypeModels, sharedSliceModels, cache: true });
		}),
		bench("uncached", () => {
			src.generateTypes({ customTypeModels, sharedSliceModels, cache: false });
		}),
	);
});
