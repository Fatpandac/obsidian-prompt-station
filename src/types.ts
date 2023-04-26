/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

declare global {
	let __DEV__: boolean

	export type Prompt = {
		name: string;
		value: string;
	};

	export interface PromptStationSettings {
		openaiKey: string;
		basePath: string;
		prompts: Array<Prompt>;
	}

	export type ReplaceSwitch = {
		[key: string]: (match: string) => string;
	}
}
