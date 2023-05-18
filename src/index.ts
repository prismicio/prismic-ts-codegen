export { generateTypes } from "./generateTypes";
export type { GenerateTypesConfig, TypesProvider } from "./generateTypes";

export { detectTypesProvider } from "./detectTypesProvider";
export type { DetectTypesProviderConfig } from "./detectTypesProvider";

// The CLI configuration type is exported at the root level for ease of access.
// It is not used in the the library's code.
export type { Config } from "./cli/types";
