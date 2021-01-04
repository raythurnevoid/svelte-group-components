import createBaseConfig from "@raythurnevoid/svelte-template/webpack.config";

export default function config(env) {
	const baseConfig = createBaseConfig(env);

	return {
		...baseConfig,
	};
}
