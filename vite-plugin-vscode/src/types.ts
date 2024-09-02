/* eslint-disable @typescript-eslint/naming-convention */
/**
 * These types are copied from the VS Code repository, because they are not
 * available *anywhere else* for some reason??
 *
 * @license MIT
 * @copyright 2015 - present Microsoft Corporation
 */

// #region action
// https://github.com/microsoft/vscode/blob/32f955580047e7d80158d7712e0594c400d6241f/src/vs/platform/action/common/action.ts

export type ILocalizedString = {
	/**
	 * The localized value of the string.
	 */
	value: string;

	/**
	 * The original (non localized value of the string)
	 */
	original: string;
};

// #endregion
// #region environment
// https://github.com/microsoft/vscode/blob/32f955580047e7d80158d7712e0594c400d6241f/src/vs/platform/environment/common/environment.ts

/**
 * Type of extension.
 *
 * **NOTE**: This is defined in `platform/environment` because it can appear as a CLI argument.
 */
export type ExtensionKind = 'ui' | 'workspace' | 'web';

// #endregion
// #region extensions
// https://github.com/microsoft/vscode/blob/32f955580047e7d80158d7712e0594c400d6241f/src/vs/platform/extensions/common/extensions.ts

export type ICommand = {
	command: string;
	title: string | ILocalizedString;
	category?: string | ILocalizedString;
};

export type IDebugger = {
	label?: string;
	type: string;
	runtime?: string;
};

export type IGrammar = {
	language?: string;
};

export type IJSONValidation = {
	fileMatch: string | string[];
	url: string;
};

export type IKeyBinding = {
	command: string;
	key: string;
	when?: string;
	mac?: string;
	linux?: string;
	win?: string;
};

export type ILanguage = {
	id: string;
	extensions: string[];
	aliases: string[];
};

export type IMenu = {
	command: string;
	alt?: string;
	when?: string;
	group?: string;
};

export type ISnippet = {
	language: string;
};

export type ITheme = {
	label: string;
};

export type IViewContainer = {
	id: string;
	title: string;
};

export type IView = {
	id: string;
	name: string;
};

export type IColor = {
	id: string;
	description: string;
	defaults: {light: string; dark: string; highContrast: string};
};

export type IWebviewEditor = {
	viewType: string;
	priority: string;
	selector: Array<{
		filenamePattern?: string;
	}>;
};

export type ICodeActionContributionAction = {
	kind: string;
	title: string;
	description?: string;
};

export type ICodeActionContribution = {
	languages: string[];
	actions: ICodeActionContributionAction[];
};

export type IAuthenticationContribution = {
	id: string;
	label: string;
};

export type IWalkthroughStep = {
	id: string;
	title: string;
	description: string | undefined;
	media:
		| {
				image: string | {dark: string; light: string; hc: string};
				altText: string;
				markdown?: never;
				svg?: never;
		  }
		| {markdown: string; image?: never; svg?: never}
		| {svg: string; altText: string; markdown?: never; image?: never};
	completionEvents?: string[];
	/** @deprecated use `completionEvents: 'onCommand:...'` */
	doneOn?: {command: string};
	when?: string;
};

export type IWalkthrough = {
	id: string;
	title: string;
	icon?: string;
	description: string;
	steps: IWalkthroughStep[];
	featuredFor: string[] | undefined;
	when?: string;
};

export type IStartEntry = {
	title: string;
	description: string;
	command: string;
	when?: string;
	category: 'file' | 'folder' | 'notebook';
};

export type INotebookEntry = {
	type: string;
	displayName: string;
};

export type INotebookRendererContribution = {
	id: string;
	displayName: string;
	mimeTypes: string[];
};

export type IDebugVisualizationContribution = {
	id: string;
	when: string;
};

export type ITranslation = {
	id: string;
	path: string;
};

export type ILocalizationContribution = {
	languageId: string;
	languageName?: string;
	localizedLanguageName?: string;
	translations: ITranslation[];
	minimalTranslations?: Record<string, string>;
};

export type IExtensionContributions = {
	commands?: ICommand[];
	configuration?: any;
	debuggers?: IDebugger[];
	grammars?: IGrammar[];
	jsonValidation?: IJSONValidation[];
	keybindings?: IKeyBinding[];
	languages?: ILanguage[];
	menus?: Record<string, IMenu[]>;
	snippets?: ISnippet[];
	themes?: ITheme[];
	iconThemes?: ITheme[];
	productIconThemes?: ITheme[];
	viewsContainers?: Record<string, IViewContainer[]>;
	views?: Record<string, IView[]>;
	colors?: IColor[];
	localizations?: ILocalizationContribution[];
	customEditors?: IWebviewEditor[];
	codeActions?: ICodeActionContribution[];
	authentication?: IAuthenticationContribution[];
	walkthroughs?: IWalkthrough[];
	startEntries?: IStartEntry[];
	notebooks?: INotebookEntry[];
	notebookRenderer?: INotebookRendererContribution[];
	debugVisualizers?: IDebugVisualizationContribution[];
	chatParticipants?: Array<{id: string}>;
};

export type IExtensionCapabilities = {
	virtualWorkspaces?: ExtensionVirtualWorkspaceSupport;
	untrustedWorkspaces?: ExtensionUntrustedWorkspaceSupport;
};

export type LimitedWorkspaceSupportType = 'limited';
export type ExtensionUntrustedWorkspaceSupport =
	| {supported: true}
	| {supported: false; description: string}
	| {
			supported: LimitedWorkspaceSupportType;
			description: string;
			restrictedConfigurations?: string[];
	  };

export type ExtensionVirtualWorkspaceSupport =
	| boolean
	| {supported: true}
	| {supported: false | LimitedWorkspaceSupportType; description: string};

export type IRelaxedExtensionManifest = {
	name: string;
	displayName?: string;
	publisher: string;
	version: string;
	engines: {vscode: string};
	description?: string;
	main?: string;
	browser?: string;
	preview?: boolean;
	// For now this only supports pointing to l10n bundle files
	// but it will be used for package.l10n.json files in the future
	l10n?: string;
	icon?: string;
	categories?: string[];
	keywords?: string[];
	activationEvents?: string[];
	extensionDependencies?: string[];
	extensionPack?: string[];
	extensionKind?: ExtensionKind | ExtensionKind[];
	contributes?: IExtensionContributions;
	repository?: {url: string};
	bugs?: {url: string};
	originalEnabledApiProposals?: string[];
	enabledApiProposals?: string[];
	api?: string;
	scripts?: Record<string, string>;
	capabilities?: IExtensionCapabilities;
};

// #endregion
