import { App, ButtonComponent, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./main";
import { ReplaceFlags } from "./replaceFlags";

export class PromptStationSettingTab extends PluginSettingTab {
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

		this.displaySetupAPIInfo(containerEl);
		this.displaySetupPrompts(containerEl);
	}

	displaySetupAPIInfo(containerEl: HTMLElement): void {
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

		const basePathDesc = document.createDocumentFragment();
		basePathDesc.append(
			"Enter your OpenAI base path here. ",
			basePathDesc.createEl("br"),
			"Default: https://api.openai.com/v1"
		);
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
	}

	displaySetupPrompts(containerEl: HTMLElement): void {
		containerEl.createEl("h2", {
			text: "Your prompts",
		});

		const promptsDesc = document.createDocumentFragment();
		promptsDesc.append(
			"Enter your prompts here, one per line. ",
			promptsDesc.createEl("br"),
			"There have some flags you can use in your prompts: ",
			promptsDesc.createEl("br"),
			promptsDesc.createEl("strong", {
				text: `{{${ReplaceFlags.CONTENT}}}`,
			}),
			" - The content of the current note",
			promptsDesc.createEl("br"),
			promptsDesc.createEl("strong", {
				text: `{{${ReplaceFlags.TAGS}}}`,
			}),
			" - All tags in the vault",
			promptsDesc.createEl("br"),
			promptsDesc.createEl("strong", {
				text: `{{${ReplaceFlags.DATE}[:format]}}`,
			}),
			" - The current date in the format specified if has format, format is optional, rules are the same as ",
			promptsDesc.createEl("a", {
				text: "dayjs",
				attr: {
					href: "https://day.js.org/docs/en/display/format",
					target: "_blank",
				},
			}),
			promptsDesc.createEl("br"),
			promptsDesc.createEl("strong", {
				text: `{{${ReplaceFlags.SELECTED}}}`,
			}),
			" - The selected text"
		);

		new Setting(containerEl)
			.setName("Prompts")
			.setDesc(promptsDesc)
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
