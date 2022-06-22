import type { CallSignatureDeclaration, InterfaceDeclaration } from "ts-morph";

type AddCreateClientCallSignatureConfig = {
	interface: InterfaceDeclaration;
	repositoryNameOrEndpointType: string;
};

export const addCreateClientCallSignature = (
	config: AddCreateClientCallSignatureConfig,
): CallSignatureDeclaration => {
	return config.interface.addCallSignature({
		parameters: [
			{
				name: "repositoryNameOrEndpoint",
				type: config.repositoryNameOrEndpointType,
			},
			{
				name: "options",
				type: "prismic.ClientConfig",
				hasQuestionToken: true,
			},
		],
		returnType: "prismic.Client<AllDocumentTypes>",
	});
};
