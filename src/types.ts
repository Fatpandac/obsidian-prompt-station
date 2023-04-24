/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

declare global {
	export type Prompt = {
		name: string;
		value: string;
	};

	export interface PromptStationSettings {
		openaiKey: string;
		basePath: string;
		prompts: Array<Prompt>;
	}

	export interface ReplaceSwitch {
		[key: string]: () => string;
	}
}
