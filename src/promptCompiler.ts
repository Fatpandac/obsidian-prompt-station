import { App, MarkdownView, PluginManifest } from "obsidian";
import { GetAllTagsInTheVault } from "./utils";

const enum ReplaceFlag {
	CONTENT = "content",
	TAGS = "tags",
}

export class PromptCompiler {
	app: App;
	manifest: PluginManifest;
	view: MarkdownView;

	constructor(app: App, view: MarkdownView) {
		this.app = app;
		this.view = view;
	}

	compiled(prompt: Prompt) {
		const replaceSwitch: ReplaceSwitch = {
			[ReplaceFlag.CONTENT]: () => {
        const content = this.view.editor.getValue();

        return content;
      },
			[ReplaceFlag.TAGS]: () => {
				const tags = new GetAllTagsInTheVault(
					this.app,
					this.manifest
				).pull();

				return tags.join(" ");
			},
		};

		return prompt.value.replace(/{{(.*?)}}/g, (_match, p1) =>
			replaceSwitch[p1]()
		);
	}
}
