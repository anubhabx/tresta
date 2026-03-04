import { nextJsConfig } from "@workspace/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
	...nextJsConfig,
	{
		files: ["**/*.{ts,tsx,js,mjs}"],
		rules: {
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						"@workspace/ui/src/**",
						"../../packages/ui/src/**",
						"../packages/ui/src/**"
					]
				}
			]
		}
	},
	{
		files: [
			"lib/**/*.{ts,tsx}",
			"hooks/**/*.{ts,tsx}",
			"store/**/*.{ts,tsx}",
			"components/testimonials/**/*.{ts,tsx}",
			"components/account-settings/**/*.{ts,tsx}"
		],
		rules: {
			"@typescript-eslint/no-explicit-any": "error"
		}
	}
];
