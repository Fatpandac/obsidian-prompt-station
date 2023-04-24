import {
	App,
	CachedMetadata,
	Plugin,
	PluginManifest,
	TFile,
	getAllTags,
} from "obsidian";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function uniqueArray(array: any[]) {
	return [...new Set(array)];
}

/**
 * Copy this code from
 * https://github.com/farux/obsidian-auto-note-mover/blob/631c4bec47adfd45a2d83ab886dbeaaa97504977/suggests/tag-suggest.ts#L5-L28
 * Author: farux
 */
export class GetAllTagsInTheVault extends Plugin {
	fileArray: TFile[];
	fileCache: (CachedMetadata | null)[];
	tagArray: (string[] | null)[];
	tagArrayJoin: string;
	tagArraySplit: string[];
	tagArrayFilter: string[];
	tagList: string[];

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.fileArray = this.app.vault.getMarkdownFiles();
		this.fileCache = this.fileArray.map((value) =>
			this.app.metadataCache.getFileCache(value)
		);
		this.tagArray = this.fileCache.map(
			(value) => value && getAllTags(value)
		);
		this.tagArrayJoin = this.tagArray.join();
		this.tagArraySplit = this.tagArrayJoin.split(",");
		this.tagArrayFilter = this.tagArraySplit.filter(Boolean);
		this.tagList = [...new Set(this.tagArrayFilter)];
	}

	pull(): string[] {
		return this.tagList;
	}
}
