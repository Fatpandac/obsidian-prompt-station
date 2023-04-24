import {
	App,
	ButtonComponent,
	Editor,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { PromptModal } from "./promptModal";
import { Configuration, OpenAIApi } from "openai";

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

	onunload() {}

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

class PromptStationSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", {
			text: "Prompt Station Plugin - Settings",
		});

		new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc("Enter your OpenAI API key here.")
			.addText((text) =>
				text
					.setPlaceholder("API key")
					.setValue(this.plugin.settings.openaiKey)
					.onChange(async (value) => {
						this.plugin.settings.openaiKey = value;
						await this.plugin.saveSettings();
					})
			);

		const basePathDesc = document.createDocumentFragment()
		basePathDesc.append(
			"Enter your OpenAI base path here. ",
			basePathDesc.createEl("br"),
			"Default: https://api.openai.com/v1"
		)
		new Setting(containerEl)
			.setName("OpenAI Base Path(Optional)")
			.setDesc(basePathDesc)
			.addText((text) =>
				text
					.setPlaceholder("Base path")
					.setValue(this.plugin.settings.basePath)
					.onChange(async (value) => {
						this.plugin.settings.basePath = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h2", {
			text: "Your prompts",
		});

		new Setting(containerEl)
			.setName("Prompts")
			.setDesc("Enter your prompts here, one per line.")
			.addButton((button: ButtonComponent) => {
				button
					.setTooltip("Add a new prompt")
					.setButtonText("+")
					.onClick(async () => {
						const prompts = this.plugin.settings.prompts;
						prompts.push({
							name: "",
							value: "",
						});
						await this.plugin.saveSettings();
						this.display();
					});
			});

		this.plugin.settings.prompts.map((prompt, index) => {
			new Setting(containerEl)
				.addText((text) => {
					text.setValue(prompt.name)
						.setPlaceholder("Prompt name")
						.onChange(async (value) => {
							console.log(this.plugin.settings.prompts);
							this.plugin.settings.prompts[index].name = value;
							console.log(this.plugin.settings.prompts);
							await this.plugin.saveSettings();
						});
				})
				.addTextArea((text) => {
					text.setValue(prompt.value)
						.setPlaceholder("Prompt content")
						.onChange(async (value) => {
							this.plugin.settings.prompts[index].value = value;
							await this.plugin.saveSettings();
						});
				})
				.addExtraButton((button) => {
					button
						.setTooltip("Delete this prompt")
						.setIcon("trash")
						.onClick(async () => {
							const prompts = this.plugin.settings.prompts;
							prompts.splice(index, 1);
							await this.plugin.saveSettings();
							this.display();
						});
				})
				.infoEl.remove();
		});
	}
}
