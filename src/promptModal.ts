import { App, SuggestModal, MarkdownView, Editor, Notice, PluginManifest } from "obsidian";
import { OpenAIApi } from "openai";
import { PromptCompiler } from "./promptCompiler";


export class PromptModal extends SuggestModal<Prompt> {
  manifest: PluginManifest;
  openai: OpenAIApi;
  prompts: Array<Prompt>;
  view: MarkdownView;
  editor: Editor;
  promptsCompiler: PromptCompiler;

  constructor(app: App, openai: OpenAIApi, prompts: Array<Prompt>, view: MarkdownView) {
    super(app);
    this.openai = openai;
    this.prompts = prompts;
    this.view = view;
    this.editor = view.editor;
    this.promptsCompiler = new PromptCompiler(app, view);
  }

  getSuggestions(query: string): Array<Prompt> {
    return this.prompts.filter((prompt) =>
      prompt.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  renderSuggestion(prompt: Prompt, el: HTMLElement) {
    el.createEl("div", { text: prompt.name });
    el.createEl("small", { text: prompt.value });
  }

  async onChooseSuggestion(prompt: Prompt) {
    const compliedPrompt = this.promptsCompiler.compiled(prompt);
    let result = ""

    try {
      const runningNotice = new Notice("Running prompt, please wait...");

      const completion = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: 'user',
            content: compliedPrompt
          }
        ]
      })
      result = completion.data.choices[0].message?.content || "";

      runningNotice.hide();
    } catch (error) {
      new Notice("Oops, something went wrong. Please check your OpenAI key and try again.");
    }

    this.editor.replaceRange(result, this.editor.getCursor());
  }
}