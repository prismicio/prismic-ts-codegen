import { defineSirocConfig } from "siroc";

export default defineSirocConfig({
	rollup: {
		output: {
			sourcemap: true,
		},
		esbuildOptions: {
			target: "es2020",
		},
	},
});
