import {
	Editor,
	MarkdownView,
	Plugin,
} from "obsidian";
import { PromptModal } from "./promptModal";
import { Configuration, OpenAIApi } from "openai";
import { PromptStationSettingTab } from "./config";

const DEFAULT_SETTINGS: PromptStationSettings = {
	openaiKey: "",
	basePath: "",
	prompts: [],
};

export default class MyPlugin extends Plugin {
	settings: PromptStationSettings;
	openai: OpenAIApi;

	async onload() {
		await this.loadSettings();

		this.setupOpenAI();

		this.addCommand({
			id: "run-prompts-command",
			name: "Run Prompts",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				new PromptModal(
					this.app,
					this.openai,
					this.settings.prompts,
					view
				).open();
			},
		});

		this.addSettingTab(new PromptStationSettingTab(this.app, this));
	}

	setupOpenAI() {
		const configuration = new Configuration({
			apiKey: this.settings.openaiKey,
			basePath: this.settings.basePath,
		});
		this.openai = new OpenAIApi(configuration);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
