import { afterEach, expect, it, vi } from "vitest";

import { createRequire } from "node:module";

import { detectTypesProvider } from "../src";

vi.mock("node:module", async () => {
	return {
		createRequire: vi.fn(),
	};
});

afterEach(() => {
	vi.mocked(createRequire).mockClear();
});

it('returns "@prismicio/client" if @prismicio/client@>=7 can be resolved', async () => {
	vi.mocked(createRequire).mockImplementationOnce(() => {
		const require = (id: string) => {
			if (id === "@prismicio/client/package.json") {
				return {
					version: "7.0.0",
				};
			}

			throw new Error("not implemented");
		};

		require.resolve = (id: string) => {
			if (id === "@prismicio/client") {
				return "__stub__";
			}

			throw new Error("not implemented");
		};

		return require as unknown as NodeRequire;
	});

	expect(await detectTypesProvider()).toBe("@prismicio/client");
});

it('returns "@prismicio/types" if @prismicio/client@>=7 cannot be resolved and @prismicio/types can be resolved', async () => {
	vi.mocked(createRequire).mockImplementationOnce(() => {
		const require = () => {
			throw new Error("not implemented");
		};

		require.resolve = (id: string) => {
			if (id === "@prismicio/types") {
				return "__stub__";
			}

			throw new Error("not implemented");
		};

		return require as unknown as NodeRequire;
	});

	expect(await detectTypesProvider()).toBe("@prismicio/types");
});

it("returns undefined if a types provider cannot be found", async () => {
	vi.mocked(createRequire).mockImplementationOnce(() => {
		const require = () => {
			throw new Error("not implemented");
		};

		require.resolve = () => {
			throw new Error("not implemented");
		};

		return require as unknown as NodeRequire;
	});

	expect(await detectTypesProvider()).toBe(undefined);
});

it("can be configured with a cwd to set `require`'s base path", async () => {
	vi.mocked(createRequire).mockImplementationOnce(() => {
		const require = () => {
			throw new Error("not implemented");
		};

		require.resolve = () => {
			throw new Error("not implemented");
		};

		return require as unknown as NodeRequire;
	});

	const cwd = "__stub__";

	await detectTypesProvider({ cwd });

	expect(createRequire).toHaveBeenCalledWith(cwd);
});
