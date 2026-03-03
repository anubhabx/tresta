import { nextJsConfig } from "@workspace/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
	...nextJsConfig,
	{
		rules: {
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						"@workspace/ui/src/*",
						"../../packages/ui/src/*",
						"../packages/ui/src/*"
					]
				}
			]
		}
	}
];
