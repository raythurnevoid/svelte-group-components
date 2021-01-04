import createDevServerBaseConfig from "@raythurnevoid/svelte-template/webpack.config.devserver";
import createBaseConfig from "./webpack.config";

export default function config(env) {
	const baseDevServerConfig = createDevServerBaseConfig(env);
	const baseConfig = createBaseConfig(env);

	const config = {
		...baseDevServerConfig,
		...baseConfig,
	};

	return config;
}
