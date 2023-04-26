import { App, MarkdownView, PluginManifest } from "obsidian";
import { GetAllTagsInTheVault } from "./utils";
import { ReplaceFlags } from "./replaceFlags";
import dayjs from "dayjs";

export class PromptCompiler {
	app: App;
	manifest: PluginManifest;
	view: MarkdownView;

	constructor(app: App, view: MarkdownView) {
		this.app = app;
		this.view = view;
	}

	private replaceSwitch: ReplaceSwitch = {
		[ReplaceFlags.CONTENT]: (_match) => this.view.editor.getValue(),
		[ReplaceFlags.TAGS]: (_match) =>
			new GetAllTagsInTheVault(this.app, this.manifest).pull().join(" "),
		[ReplaceFlags.DATE]: (match) => {
			const format = match.split(":")[1];
			const date = dayjs().format(format);

			return date;
		},
		[ReplaceFlags.SELECTED]: (_match) => this.view.editor.getSelection(),
	};

	compiled(prompt: Prompt) {
		return prompt.value.replace(/{{(.*?)}}/g, (match, p1) => {
			const flag = p1.split(":")[0] as ReplaceFlags;

			return flag in this.replaceSwitch ? this.replaceSwitch[flag](p1) : match;
		});
	}
}
