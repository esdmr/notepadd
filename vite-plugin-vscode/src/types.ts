/* eslint-disable @typescript-eslint/member-ordering */
/**
 * These types are copied from the VS Code repository, because they are not
 * available *anywhere else* for some reason??
 *
 * @see {@link https://github.com/microsoft/vscode/blob/a5fbd748f168271d253fe046711d339a3bc11106/src/vs/workbench/services/extensions/common/extensionsRegistry.ts#L171 vscode://schemas/vscode-extensions}
 * @license MIT
 * @copyright 2015 - present Microsoft Corporation
 */
/***/

export type CoreSchemaMetaSchema =
	| {
			$id?: string;
			$schema?: string;
			$ref?: string;
			$comment?: string;
			title?: string;
			description?: string;
			default?: true;
			readOnly?: boolean;
			writeOnly?: boolean;
			examples?: Array<true>;
			multipleOf?: number;
			maximum?: number;
			exclusiveMaximum?: number;
			minimum?: number;
			exclusiveMinimum?: number;
			maxLength?: number;
			minLength?: number;
			pattern?: string;
			additionalItems?: CoreSchemaMetaSchema;
			items?:
				| CoreSchemaMetaSchema
				| [CoreSchemaMetaSchema, ...CoreSchemaMetaSchema[]];
			maxItems?: number;
			minItems?: number;
			uniqueItems?: boolean;
			contains?: CoreSchemaMetaSchema;
			maxProperties?: number;
			minProperties?: number;
			required?: string[];
			additionalProperties?: CoreSchemaMetaSchema;
			definitions?: Record<string, CoreSchemaMetaSchema>;
			properties?: Record<string, CoreSchemaMetaSchema>;
			patternProperties?: Record<string, CoreSchemaMetaSchema>;
			dependencies?: Record<string, CoreSchemaMetaSchema | string[]>;
			propertyNames?: CoreSchemaMetaSchema;
			const?: true;
			enum?: [true, ...unknown[]];
			type?:
				| (
						| 'array'
						| 'boolean'
						| 'integer'
						| 'null'
						| 'number'
						| 'object'
						| 'string'
				  )
				| [
						(
							| 'array'
							| 'boolean'
							| 'integer'
							| 'null'
							| 'number'
							| 'object'
							| 'string'
						),
						...Array<
							| 'array'
							| 'boolean'
							| 'integer'
							| 'null'
							| 'number'
							| 'object'
							| 'string'
						>,
				  ];
			format?: string;
			contentMediaType?: string;
			contentEncoding?: string;
			if?: CoreSchemaMetaSchema;
			then?: CoreSchemaMetaSchema;
			else?: CoreSchemaMetaSchema;
			allOf?: [CoreSchemaMetaSchema, ...CoreSchemaMetaSchema[]];
			anyOf?: [CoreSchemaMetaSchema, ...CoreSchemaMetaSchema[]];
			oneOf?: [CoreSchemaMetaSchema, ...CoreSchemaMetaSchema[]];
			not?: CoreSchemaMetaSchema;
			[k: string]: unknown;
	  }
	| boolean;

export type ActionOrSubmenu =
	| Action
	| {
			/**
			 * Identifier of the submenu to display in this item.
			 */
			submenu: string;
			/**
			 * Condition which must be true to show this item
			 */
			when?: string;
			/**
			 * Group into which this item belongs
			 */
			group?: string;
			[k: string]: unknown;
	  };

export type BuiltinColor =
	| 'foreground'
	| 'disabledForeground'
	| 'errorForeground'
	| 'descriptionForeground'
	| 'icon.foreground'
	| 'focusBorder'
	| 'contrastBorder'
	| 'contrastActiveBorder'
	| 'selection.background'
	| 'textLink.foreground'
	| 'textLink.activeForeground'
	| 'textSeparator.foreground'
	| 'textPreformat.foreground'
	| 'textPreformat.background'
	| 'textBlockQuote.background'
	| 'textBlockQuote.border'
	| 'textCodeBlock.background'
	| 'sash.hoverBorder'
	| 'badge.background'
	| 'badge.foreground'
	| 'scrollbar.shadow'
	| 'scrollbarSlider.background'
	| 'scrollbarSlider.hoverBackground'
	| 'scrollbarSlider.activeBackground'
	| 'progressBar.background'
	| 'editor.background'
	| 'editor.foreground'
	| 'editorStickyScroll.background'
	| 'editorStickyScrollHover.background'
	| 'editorStickyScroll.border'
	| 'editorStickyScroll.shadow'
	| 'editorWidget.background'
	| 'editorWidget.foreground'
	| 'editorWidget.border'
	| 'editorWidget.resizeBorder'
	| 'editorError.background'
	| 'editorError.foreground'
	| 'editorError.border'
	| 'editorWarning.background'
	| 'editorWarning.foreground'
	| 'editorWarning.border'
	| 'editorInfo.background'
	| 'editorInfo.foreground'
	| 'editorInfo.border'
	| 'editorHint.foreground'
	| 'editorHint.border'
	| 'editorLink.activeForeground'
	| 'editor.selectionBackground'
	| 'editor.selectionForeground'
	| 'editor.inactiveSelectionBackground'
	| 'editor.selectionHighlightBackground'
	| 'editor.selectionHighlightBorder'
	| 'editor.findMatchBackground'
	| 'editor.findMatchForeground'
	| 'editor.findMatchHighlightBackground'
	| 'editor.findMatchHighlightForeground'
	| 'editor.findRangeHighlightBackground'
	| 'editor.findMatchBorder'
	| 'editor.findMatchHighlightBorder'
	| 'editor.findRangeHighlightBorder'
	| 'editor.hoverHighlightBackground'
	| 'editorHoverWidget.background'
	| 'editorHoverWidget.foreground'
	| 'editorHoverWidget.border'
	| 'editorHoverWidget.statusBarBackground'
	| 'editorInlayHint.foreground'
	| 'editorInlayHint.background'
	| 'editorInlayHint.typeForeground'
	| 'editorInlayHint.typeBackground'
	| 'editorInlayHint.parameterForeground'
	| 'editorInlayHint.parameterBackground'
	| 'editorLightBulb.foreground'
	| 'editorLightBulbAutoFix.foreground'
	| 'editorLightBulbAi.foreground'
	| 'editor.snippetTabstopHighlightBackground'
	| 'editor.snippetTabstopHighlightBorder'
	| 'editor.snippetFinalTabstopHighlightBackground'
	| 'editor.snippetFinalTabstopHighlightBorder'
	| 'diffEditor.insertedTextBackground'
	| 'diffEditor.removedTextBackground'
	| 'diffEditor.insertedLineBackground'
	| 'diffEditor.removedLineBackground'
	| 'diffEditorGutter.insertedLineBackground'
	| 'diffEditorGutter.removedLineBackground'
	| 'diffEditorOverview.insertedForeground'
	| 'diffEditorOverview.removedForeground'
	| 'diffEditor.insertedTextBorder'
	| 'diffEditor.removedTextBorder'
	| 'diffEditor.border'
	| 'diffEditor.diagonalFill'
	| 'diffEditor.unchangedRegionBackground'
	| 'diffEditor.unchangedRegionForeground'
	| 'diffEditor.unchangedCodeBackground'
	| 'widget.shadow'
	| 'widget.border'
	| 'toolbar.hoverBackground'
	| 'toolbar.hoverOutline'
	| 'toolbar.activeBackground'
	| 'breadcrumb.foreground'
	| 'breadcrumb.background'
	| 'breadcrumb.focusForeground'
	| 'breadcrumb.activeSelectionForeground'
	| 'breadcrumbPicker.background'
	| 'merge.currentHeaderBackground'
	| 'merge.currentContentBackground'
	| 'merge.incomingHeaderBackground'
	| 'merge.incomingContentBackground'
	| 'merge.commonHeaderBackground'
	| 'merge.commonContentBackground'
	| 'merge.border'
	| 'editorOverviewRuler.currentContentForeground'
	| 'editorOverviewRuler.incomingContentForeground'
	| 'editorOverviewRuler.commonContentForeground'
	| 'editorOverviewRuler.findMatchForeground'
	| 'editorOverviewRuler.selectionHighlightForeground'
	| 'problemsErrorIcon.foreground'
	| 'problemsWarningIcon.foreground'
	| 'problemsInfoIcon.foreground'
	| 'input.background'
	| 'input.foreground'
	| 'input.border'
	| 'inputOption.activeBorder'
	| 'inputOption.hoverBackground'
	| 'inputOption.activeBackground'
	| 'inputOption.activeForeground'
	| 'input.placeholderForeground'
	| 'inputValidation.infoBackground'
	| 'inputValidation.infoForeground'
	| 'inputValidation.infoBorder'
	| 'inputValidation.warningBackground'
	| 'inputValidation.warningForeground'
	| 'inputValidation.warningBorder'
	| 'inputValidation.errorBackground'
	| 'inputValidation.errorForeground'
	| 'inputValidation.errorBorder'
	| 'dropdown.background'
	| 'dropdown.listBackground'
	| 'dropdown.foreground'
	| 'dropdown.border'
	| 'button.foreground'
	| 'button.separator'
	| 'button.background'
	| 'button.hoverBackground'
	| 'button.border'
	| 'button.secondaryForeground'
	| 'button.secondaryBackground'
	| 'button.secondaryHoverBackground'
	| 'radio.activeForeground'
	| 'radio.activeBackground'
	| 'radio.activeBorder'
	| 'radio.inactiveForeground'
	| 'radio.inactiveBackground'
	| 'radio.inactiveBorder'
	| 'radio.inactiveHoverBackground'
	| 'checkbox.background'
	| 'checkbox.selectBackground'
	| 'checkbox.foreground'
	| 'checkbox.border'
	| 'checkbox.selectBorder'
	| 'keybindingLabel.background'
	| 'keybindingLabel.foreground'
	| 'keybindingLabel.border'
	| 'keybindingLabel.bottomBorder'
	| 'list.focusBackground'
	| 'list.focusForeground'
	| 'list.focusOutline'
	| 'list.focusAndSelectionOutline'
	| 'list.activeSelectionBackground'
	| 'list.activeSelectionForeground'
	| 'list.activeSelectionIconForeground'
	| 'list.inactiveSelectionBackground'
	| 'list.inactiveSelectionForeground'
	| 'list.inactiveSelectionIconForeground'
	| 'list.inactiveFocusBackground'
	| 'list.inactiveFocusOutline'
	| 'list.hoverBackground'
	| 'list.hoverForeground'
	| 'list.dropBackground'
	| 'list.dropBetweenBackground'
	| 'list.highlightForeground'
	| 'list.focusHighlightForeground'
	| 'list.invalidItemForeground'
	| 'list.errorForeground'
	| 'list.warningForeground'
	| 'listFilterWidget.background'
	| 'listFilterWidget.outline'
	| 'listFilterWidget.noMatchesOutline'
	| 'listFilterWidget.shadow'
	| 'list.filterMatchBackground'
	| 'list.filterMatchBorder'
	| 'list.deemphasizedForeground'
	| 'tree.indentGuidesStroke'
	| 'tree.inactiveIndentGuidesStroke'
	| 'tree.tableColumnsBorder'
	| 'tree.tableOddRowsBackground'
	| 'menu.border'
	| 'menu.foreground'
	| 'menu.background'
	| 'menu.selectionForeground'
	| 'menu.selectionBackground'
	| 'menu.selectionBorder'
	| 'menu.separatorBackground'
	| 'minimap.findMatchHighlight'
	| 'minimap.selectionOccurrenceHighlight'
	| 'minimap.selectionHighlight'
	| 'minimap.infoHighlight'
	| 'minimap.warningHighlight'
	| 'minimap.errorHighlight'
	| 'minimap.background'
	| 'minimap.foregroundOpacity'
	| 'minimapSlider.background'
	| 'minimapSlider.hoverBackground'
	| 'minimapSlider.activeBackground'
	| 'charts.foreground'
	| 'charts.lines'
	| 'charts.red'
	| 'charts.blue'
	| 'charts.yellow'
	| 'charts.orange'
	| 'charts.green'
	| 'charts.purple'
	| 'quickInput.background'
	| 'quickInput.foreground'
	| 'quickInputTitle.background'
	| 'pickerGroup.foreground'
	| 'pickerGroup.border'
	| 'quickInput.list.focusBackground'
	| 'quickInputList.focusForeground'
	| 'quickInputList.focusIconForeground'
	| 'quickInputList.focusBackground'
	| 'search.resultsInfoForeground'
	| 'searchEditor.findMatchBackground'
	| 'searchEditor.findMatchBorder'
	| 'multiDiffEditor.headerBackground'
	| 'multiDiffEditor.background'
	| 'multiDiffEditor.border'
	| 'symbolIcon.arrayForeground'
	| 'symbolIcon.booleanForeground'
	| 'symbolIcon.classForeground'
	| 'symbolIcon.colorForeground'
	| 'symbolIcon.constantForeground'
	| 'symbolIcon.constructorForeground'
	| 'symbolIcon.enumeratorForeground'
	| 'symbolIcon.enumeratorMemberForeground'
	| 'symbolIcon.eventForeground'
	| 'symbolIcon.fieldForeground'
	| 'symbolIcon.fileForeground'
	| 'symbolIcon.folderForeground'
	| 'symbolIcon.functionForeground'
	| 'symbolIcon.interfaceForeground'
	| 'symbolIcon.keyForeground'
	| 'symbolIcon.keywordForeground'
	| 'symbolIcon.methodForeground'
	| 'symbolIcon.moduleForeground'
	| 'symbolIcon.namespaceForeground'
	| 'symbolIcon.nullForeground'
	| 'symbolIcon.numberForeground'
	| 'symbolIcon.objectForeground'
	| 'symbolIcon.operatorForeground'
	| 'symbolIcon.packageForeground'
	| 'symbolIcon.propertyForeground'
	| 'symbolIcon.referenceForeground'
	| 'symbolIcon.snippetForeground'
	| 'symbolIcon.stringForeground'
	| 'symbolIcon.structForeground'
	| 'symbolIcon.textForeground'
	| 'symbolIcon.typeParameterForeground'
	| 'symbolIcon.unitForeground'
	| 'symbolIcon.variableForeground'
	| 'actionBar.toggledBackground'
	| 'editorHoverWidget.highlightForeground'
	| 'editor.lineHighlightBackground'
	| 'editor.lineHighlightBorder'
	| 'editor.rangeHighlightBackground'
	| 'editor.rangeHighlightBorder'
	| 'editor.symbolHighlightBackground'
	| 'editor.symbolHighlightBorder'
	| 'editorCursor.foreground'
	| 'editorCursor.background'
	| 'editorMultiCursor.primary.foreground'
	| 'editorMultiCursor.primary.background'
	| 'editorMultiCursor.secondary.foreground'
	| 'editorMultiCursor.secondary.background'
	| 'editorWhitespace.foreground'
	| 'editorLineNumber.foreground'
	| 'editorIndentGuide.background'
	| 'editorIndentGuide.activeBackground'
	| 'editorIndentGuide.background1'
	| 'editorIndentGuide.background2'
	| 'editorIndentGuide.background3'
	| 'editorIndentGuide.background4'
	| 'editorIndentGuide.background5'
	| 'editorIndentGuide.background6'
	| 'editorIndentGuide.activeBackground1'
	| 'editorIndentGuide.activeBackground2'
	| 'editorIndentGuide.activeBackground3'
	| 'editorIndentGuide.activeBackground4'
	| 'editorIndentGuide.activeBackground5'
	| 'editorIndentGuide.activeBackground6'
	| 'editorActiveLineNumber.foreground'
	| 'editorLineNumber.activeForeground'
	| 'editorLineNumber.dimmedForeground'
	| 'editorRuler.foreground'
	| 'editorCodeLens.foreground'
	| 'editorBracketMatch.background'
	| 'editorBracketMatch.border'
	| 'editorOverviewRuler.border'
	| 'editorOverviewRuler.background'
	| 'editorGutter.background'
	| 'editorUnnecessaryCode.border'
	| 'editorUnnecessaryCode.opacity'
	| 'editorGhostText.border'
	| 'editorGhostText.foreground'
	| 'editorGhostText.background'
	| 'editorOverviewRuler.rangeHighlightForeground'
	| 'editorOverviewRuler.errorForeground'
	| 'editorOverviewRuler.warningForeground'
	| 'editorOverviewRuler.infoForeground'
	| 'editorBracketHighlight.foreground1'
	| 'editorBracketHighlight.foreground2'
	| 'editorBracketHighlight.foreground3'
	| 'editorBracketHighlight.foreground4'
	| 'editorBracketHighlight.foreground5'
	| 'editorBracketHighlight.foreground6'
	| 'editorBracketHighlight.unexpectedBracket.foreground'
	| 'editorBracketPairGuide.background1'
	| 'editorBracketPairGuide.background2'
	| 'editorBracketPairGuide.background3'
	| 'editorBracketPairGuide.background4'
	| 'editorBracketPairGuide.background5'
	| 'editorBracketPairGuide.background6'
	| 'editorBracketPairGuide.activeBackground1'
	| 'editorBracketPairGuide.activeBackground2'
	| 'editorBracketPairGuide.activeBackground3'
	| 'editorBracketPairGuide.activeBackground4'
	| 'editorBracketPairGuide.activeBackground5'
	| 'editorBracketPairGuide.activeBackground6'
	| 'editorUnicodeHighlight.border'
	| 'editorUnicodeHighlight.background'
	| 'editor.placeholder.foreground'
	| 'diffEditor.move.border'
	| 'diffEditor.moveActive.border'
	| 'diffEditor.unchangedRegionShadow'
	| 'editorOverviewRuler.bracketMatchForeground'
	| 'editor.foldBackground'
	| 'editor.foldPlaceholderForeground'
	| 'editorGutter.foldingControlForeground'
	| 'editor.linkedEditingBackground'
	| 'editor.wordHighlightBackground'
	| 'editor.wordHighlightStrongBackground'
	| 'editor.wordHighlightTextBackground'
	| 'editor.wordHighlightBorder'
	| 'editor.wordHighlightStrongBorder'
	| 'editor.wordHighlightTextBorder'
	| 'editorOverviewRuler.wordHighlightForeground'
	| 'editorOverviewRuler.wordHighlightStrongForeground'
	| 'editorOverviewRuler.wordHighlightTextForeground'
	| 'peekViewTitle.background'
	| 'peekViewTitleLabel.foreground'
	| 'peekViewTitleDescription.foreground'
	| 'peekView.border'
	| 'peekViewResult.background'
	| 'peekViewResult.lineForeground'
	| 'peekViewResult.fileForeground'
	| 'peekViewResult.selectionBackground'
	| 'peekViewResult.selectionForeground'
	| 'peekViewEditor.background'
	| 'peekViewEditorGutter.background'
	| 'peekViewEditorStickyScroll.background'
	| 'peekViewResult.matchHighlightBackground'
	| 'peekViewEditor.matchHighlightBackground'
	| 'peekViewEditor.matchHighlightBorder'
	| 'editorMarkerNavigationError.background'
	| 'editorMarkerNavigationError.headerBackground'
	| 'editorMarkerNavigationWarning.background'
	| 'editorMarkerNavigationWarning.headerBackground'
	| 'editorMarkerNavigationInfo.background'
	| 'editorMarkerNavigationInfo.headerBackground'
	| 'editorMarkerNavigation.background'
	| 'editorSuggestWidget.background'
	| 'editorSuggestWidget.border'
	| 'editorSuggestWidget.foreground'
	| 'editorSuggestWidget.selectedForeground'
	| 'editorSuggestWidget.selectedIconForeground'
	| 'editorSuggestWidget.selectedBackground'
	| 'editorSuggestWidget.highlightForeground'
	| 'editorSuggestWidget.focusHighlightForeground'
	| 'editorSuggestWidgetStatus.foreground'
	| 'editorWatermark.foreground'
	| 'tab.activeBackground'
	| 'tab.unfocusedActiveBackground'
	| 'tab.inactiveBackground'
	| 'tab.unfocusedInactiveBackground'
	| 'tab.activeForeground'
	| 'tab.inactiveForeground'
	| 'tab.unfocusedActiveForeground'
	| 'tab.unfocusedInactiveForeground'
	| 'tab.hoverBackground'
	| 'tab.unfocusedHoverBackground'
	| 'tab.hoverForeground'
	| 'tab.unfocusedHoverForeground'
	| 'tab.border'
	| 'tab.lastPinnedBorder'
	| 'tab.activeBorder'
	| 'tab.unfocusedActiveBorder'
	| 'tab.activeBorderTop'
	| 'tab.unfocusedActiveBorderTop'
	| 'tab.selectedBorderTop'
	| 'tab.selectedBackground'
	| 'tab.selectedForeground'
	| 'tab.hoverBorder'
	| 'tab.unfocusedHoverBorder'
	| 'tab.dragAndDropBorder'
	| 'tab.activeModifiedBorder'
	| 'tab.inactiveModifiedBorder'
	| 'tab.unfocusedActiveModifiedBorder'
	| 'tab.unfocusedInactiveModifiedBorder'
	| 'editorPane.background'
	| 'editorGroup.emptyBackground'
	| 'editorGroup.focusedEmptyBorder'
	| 'editorGroupHeader.tabsBackground'
	| 'editorGroupHeader.tabsBorder'
	| 'editorGroupHeader.noTabsBackground'
	| 'editorGroupHeader.border'
	| 'editorGroup.border'
	| 'editorGroup.dropBackground'
	| 'editorGroup.dropIntoPromptForeground'
	| 'editorGroup.dropIntoPromptBackground'
	| 'editorGroup.dropIntoPromptBorder'
	| 'sideBySideEditor.horizontalBorder'
	| 'sideBySideEditor.verticalBorder'
	| 'panel.background'
	| 'panel.border'
	| 'panelTitle.activeForeground'
	| 'panelTitle.inactiveForeground'
	| 'panelTitle.activeBorder'
	| 'panelInput.border'
	| 'panel.dropBorder'
	| 'panelSection.dropBackground'
	| 'panelSectionHeader.background'
	| 'panelSectionHeader.foreground'
	| 'panelSectionHeader.border'
	| 'panelSection.border'
	| 'panelStickyScroll.background'
	| 'panelStickyScroll.border'
	| 'panelStickyScroll.shadow'
	| 'outputView.background'
	| 'outputViewStickyScroll.background'
	| 'banner.background'
	| 'banner.foreground'
	| 'banner.iconForeground'
	| 'statusBar.foreground'
	| 'statusBar.noFolderForeground'
	| 'statusBar.background'
	| 'statusBar.noFolderBackground'
	| 'statusBar.border'
	| 'statusBar.focusBorder'
	| 'statusBar.noFolderBorder'
	| 'statusBarItem.activeBackground'
	| 'statusBarItem.focusBorder'
	| 'statusBarItem.hoverBackground'
	| 'statusBarItem.hoverForeground'
	| 'statusBarItem.compactHoverBackground'
	| 'statusBarItem.prominentForeground'
	| 'statusBarItem.prominentBackground'
	| 'statusBarItem.prominentHoverForeground'
	| 'statusBarItem.prominentHoverBackground'
	| 'statusBarItem.errorBackground'
	| 'statusBarItem.errorForeground'
	| 'statusBarItem.errorHoverForeground'
	| 'statusBarItem.errorHoverBackground'
	| 'statusBarItem.warningBackground'
	| 'statusBarItem.warningForeground'
	| 'statusBarItem.warningHoverForeground'
	| 'statusBarItem.warningHoverBackground'
	| 'activityBar.background'
	| 'activityBar.foreground'
	| 'activityBar.inactiveForeground'
	| 'activityBar.border'
	| 'activityBar.activeBorder'
	| 'activityBar.activeFocusBorder'
	| 'activityBar.activeBackground'
	| 'activityBar.dropBorder'
	| 'activityBarBadge.background'
	| 'activityBarBadge.foreground'
	| 'activityBarTop.foreground'
	| 'activityBarTop.activeBorder'
	| 'activityBarTop.activeBackground'
	| 'activityBarTop.inactiveForeground'
	| 'activityBarTop.dropBorder'
	| 'activityBarTop.background'
	| 'profileBadge.background'
	| 'profileBadge.foreground'
	| 'statusBarItem.remoteBackground'
	| 'statusBarItem.remoteForeground'
	| 'statusBarItem.remoteHoverForeground'
	| 'statusBarItem.remoteHoverBackground'
	| 'statusBarItem.offlineBackground'
	| 'statusBarItem.offlineForeground'
	| 'statusBarItem.offlineHoverForeground'
	| 'statusBarItem.offlineHoverBackground'
	| 'extensionBadge.remoteBackground'
	| 'extensionBadge.remoteForeground'
	| 'sideBar.background'
	| 'sideBar.foreground'
	| 'sideBar.border'
	| 'sideBarTitle.background'
	| 'sideBarTitle.foreground'
	| 'sideBar.dropBackground'
	| 'sideBarSectionHeader.background'
	| 'sideBarSectionHeader.foreground'
	| 'sideBarSectionHeader.border'
	| 'sideBarActivityBarTop.border'
	| 'sideBarStickyScroll.background'
	| 'sideBarStickyScroll.border'
	| 'sideBarStickyScroll.shadow'
	| 'titleBar.activeForeground'
	| 'titleBar.inactiveForeground'
	| 'titleBar.activeBackground'
	| 'titleBar.inactiveBackground'
	| 'titleBar.border'
	| 'menubar.selectionForeground'
	| 'menubar.selectionBackground'
	| 'menubar.selectionBorder'
	| 'commandCenter.foreground'
	| 'commandCenter.activeForeground'
	| 'commandCenter.inactiveForeground'
	| 'commandCenter.background'
	| 'commandCenter.activeBackground'
	| 'commandCenter.border'
	| 'commandCenter.activeBorder'
	| 'commandCenter.inactiveBorder'
	| 'notificationCenter.border'
	| 'notificationToast.border'
	| 'notifications.foreground'
	| 'notifications.background'
	| 'notificationLink.foreground'
	| 'notificationCenterHeader.foreground'
	| 'notificationCenterHeader.background'
	| 'notifications.border'
	| 'notificationsErrorIcon.foreground'
	| 'notificationsWarningIcon.foreground'
	| 'notificationsInfoIcon.foreground'
	| 'window.activeBorder'
	| 'window.inactiveBorder'
	| 'chat.requestBorder'
	| 'chat.requestBackground'
	| 'chat.slashCommandBackground'
	| 'chat.slashCommandForeground'
	| 'chat.avatarBackground'
	| 'chat.avatarForeground'
	| 'simpleFindWidget.sashBorder'
	| 'commentsView.resolvedIcon'
	| 'commentsView.unresolvedIcon'
	| 'editorCommentsWidget.replyInputBackground'
	| 'editorCommentsWidget.resolvedBorder'
	| 'editorCommentsWidget.unresolvedBorder'
	| 'editorCommentsWidget.rangeBackground'
	| 'editorCommentsWidget.rangeActiveBackground'
	| 'editorGutter.commentRangeForeground'
	| 'editorOverviewRuler.commentForeground'
	| 'editorOverviewRuler.commentUnresolvedForeground'
	| 'editorGutter.commentGlyphForeground'
	| 'editorGutter.commentUnresolvedGlyphForeground'
	| 'debugToolBar.background'
	| 'debugToolBar.border'
	| 'debugIcon.startForeground'
	| 'editor.stackFrameHighlightBackground'
	| 'editor.focusedStackFrameHighlightBackground'
	| 'inlineChat.foreground'
	| 'inlineChat.background'
	| 'inlineChat.border'
	| 'inlineChat.shadow'
	| 'inlineChatInput.border'
	| 'inlineChatInput.focusBorder'
	| 'inlineChatInput.placeholderForeground'
	| 'inlineChatInput.background'
	| 'inlineChatDiff.inserted'
	| 'editorOverviewRuler.inlineChatInserted'
	| 'inlineChatDiff.removed'
	| 'editorOverviewRuler.inlineChatRemoved'
	| 'mergeEditor.change.background'
	| 'mergeEditor.change.word.background'
	| 'mergeEditor.changeBase.background'
	| 'mergeEditor.changeBase.word.background'
	| 'mergeEditor.conflict.unhandledUnfocused.border'
	| 'mergeEditor.conflict.unhandledFocused.border'
	| 'mergeEditor.conflict.handledUnfocused.border'
	| 'mergeEditor.conflict.handledFocused.border'
	| 'mergeEditor.conflict.handled.minimapOverViewRuler'
	| 'mergeEditor.conflict.unhandled.minimapOverViewRuler'
	| 'mergeEditor.conflictingLines.background'
	| 'mergeEditor.conflict.input1.background'
	| 'mergeEditor.conflict.input2.background'
	| 'settings.headerForeground'
	| 'settings.settingsHeaderHoverForeground'
	| 'settings.modifiedItemIndicator'
	| 'settings.headerBorder'
	| 'settings.sashBorder'
	| 'settings.dropdownBackground'
	| 'settings.dropdownForeground'
	| 'settings.dropdownBorder'
	| 'settings.dropdownListBorder'
	| 'settings.checkboxBackground'
	| 'settings.checkboxForeground'
	| 'settings.checkboxBorder'
	| 'settings.textInputBackground'
	| 'settings.textInputForeground'
	| 'settings.textInputBorder'
	| 'settings.numberInputBackground'
	| 'settings.numberInputForeground'
	| 'settings.numberInputBorder'
	| 'settings.focusedRowBackground'
	| 'settings.rowHoverBackground'
	| 'settings.focusedRowBorder'
	| 'scm.historyGraph.historyItemGroupLocal'
	| 'scm.historyGraph.historyItemGroupRemote'
	| 'scm.historyGraph.historyItemGroupBase'
	| 'scm.historyGraph.historyItemGroupHoverLabelForeground'
	| 'scm.historyGraph.green'
	| 'scm.historyGraph.red'
	| 'scm.historyGraph.yellow'
	| 'terminal.background'
	| 'terminal.foreground'
	| 'terminalCursor.foreground'
	| 'terminalCursor.background'
	| 'terminal.selectionBackground'
	| 'terminal.inactiveSelectionBackground'
	| 'terminal.selectionForeground'
	| 'terminalCommandDecoration.defaultBackground'
	| 'terminalCommandDecoration.successBackground'
	| 'terminalCommandDecoration.errorBackground'
	| 'terminalOverviewRuler.cursorForeground'
	| 'terminal.border'
	| 'terminalOverviewRuler.border'
	| 'terminal.findMatchBackground'
	| 'terminal.hoverHighlightBackground'
	| 'terminal.findMatchBorder'
	| 'terminal.findMatchHighlightBackground'
	| 'terminal.findMatchHighlightBorder'
	| 'terminalOverviewRuler.findMatchForeground'
	| 'terminal.dropBackground'
	| 'terminal.tab.activeBorder'
	| 'terminal.initialHintForeground'
	| 'terminalStickyScroll.background'
	| 'terminalStickyScrollHover.background'
	| 'terminalStickyScroll.border'
	| 'testing.iconFailed'
	| 'testing.iconErrored'
	| 'testing.iconPassed'
	| 'testing.runAction'
	| 'testing.iconQueued'
	| 'testing.iconUnset'
	| 'testing.iconSkipped'
	| 'testing.peekBorder'
	| 'testing.messagePeekBorder'
	| 'testing.peekHeaderBackground'
	| 'testing.messagePeekHeaderBackground'
	| 'testing.coveredBackground'
	| 'testing.coveredBorder'
	| 'testing.coveredGutterBackground'
	| 'testing.uncoveredBranchBackground'
	| 'testing.uncoveredBackground'
	| 'testing.uncoveredBorder'
	| 'testing.uncoveredGutterBackground'
	| 'testing.coverCountBadgeBackground'
	| 'testing.coverCountBadgeForeground'
	| 'testing.message.error.decorationForeground'
	| 'testing.message.error.lineBackground'
	| 'testing.message.info.decorationForeground'
	| 'testing.message.info.lineBackground'
	| 'testing.iconErrored.retired'
	| 'testing.iconFailed.retired'
	| 'testing.iconPassed.retired'
	| 'testing.iconQueued.retired'
	| 'testing.iconUnset.retired'
	| 'testing.iconSkipped.retired'
	| 'welcomePage.background'
	| 'welcomePage.tileBackground'
	| 'welcomePage.tileHoverBackground'
	| 'welcomePage.tileBorder'
	| 'welcomePage.progress.background'
	| 'welcomePage.progress.foreground'
	| 'walkthrough.stepTitle.foreground'
	| 'walkThrough.embeddedEditorBackground'
	| 'debugExceptionWidget.border'
	| 'debugExceptionWidget.background'
	| 'statusBar.debuggingBackground'
	| 'statusBar.debuggingForeground'
	| 'statusBar.debuggingBorder'
	| 'commandCenter.debuggingBackground'
	| 'editorGutter.modifiedBackground'
	| 'editorGutter.addedBackground'
	| 'editorGutter.deletedBackground'
	| 'minimapGutter.modifiedBackground'
	| 'minimapGutter.addedBackground'
	| 'minimapGutter.deletedBackground'
	| 'editorOverviewRuler.modifiedForeground'
	| 'editorOverviewRuler.addedForeground'
	| 'editorOverviewRuler.deletedForeground'
	| 'keybindingTable.headerBackground'
	| 'keybindingTable.rowsBackground'
	| 'debugIcon.breakpointForeground'
	| 'debugIcon.breakpointDisabledForeground'
	| 'debugIcon.breakpointUnverifiedForeground'
	| 'debugIcon.breakpointCurrentStackframeForeground'
	| 'debugIcon.breakpointStackframeForeground'
	| 'editor.inlineValuesForeground'
	| 'editor.inlineValuesBackground'
	| 'ports.iconRunningProcessForeground'
	| 'profiles.sashBorder'
	| 'debugTokenExpression.name'
	| 'debugTokenExpression.type'
	| 'debugTokenExpression.value'
	| 'debugTokenExpression.string'
	| 'debugTokenExpression.boolean'
	| 'debugTokenExpression.number'
	| 'debugTokenExpression.error'
	| 'debugView.exceptionLabelForeground'
	| 'debugView.exceptionLabelBackground'
	| 'debugView.stateLabelForeground'
	| 'debugView.stateLabelBackground'
	| 'debugView.valueChangedHighlight'
	| 'debugConsole.infoForeground'
	| 'debugConsole.warningForeground'
	| 'debugConsole.errorForeground'
	| 'debugConsole.sourceForeground'
	| 'debugConsoleInputIcon.foreground'
	| 'debugIcon.pauseForeground'
	| 'debugIcon.stopForeground'
	| 'debugIcon.disconnectForeground'
	| 'debugIcon.restartForeground'
	| 'debugIcon.stepOverForeground'
	| 'debugIcon.stepIntoForeground'
	| 'debugIcon.stepOutForeground'
	| 'debugIcon.continueForeground'
	| 'debugIcon.stepBackForeground'
	| 'scm.historyItemAdditionsForeground'
	| 'scm.historyItemDeletionsForeground'
	| 'scm.historyItemStatisticsBorder'
	| 'scm.historyItemSelectedStatisticsBorder'
	| 'extensionButton.background'
	| 'extensionButton.foreground'
	| 'extensionButton.hoverBackground'
	| 'extensionButton.separator'
	| 'extensionButton.prominentBackground'
	| 'extensionButton.prominentForeground'
	| 'extensionButton.prominentHoverBackground'
	| 'extensionIcon.starForeground'
	| 'extensionIcon.verifiedForeground'
	| 'extensionIcon.preReleaseForeground'
	| 'extensionIcon.sponsorForeground'
	| 'notebook.cellBorderColor'
	| 'notebook.focusedEditorBorder'
	| 'notebookStatusSuccessIcon.foreground'
	| 'notebookEditorOverviewRuler.runningCellForeground'
	| 'notebookStatusErrorIcon.foreground'
	| 'notebookStatusRunningIcon.foreground'
	| 'notebook.outputContainerBorderColor'
	| 'notebook.outputContainerBackgroundColor'
	| 'notebook.cellToolbarSeparator'
	| 'notebook.focusedCellBackground'
	| 'notebook.selectedCellBackground'
	| 'notebook.cellHoverBackground'
	| 'notebook.selectedCellBorder'
	| 'notebook.inactiveSelectedCellBorder'
	| 'notebook.focusedCellBorder'
	| 'notebook.inactiveFocusedCellBorder'
	| 'notebook.cellStatusBarItemHoverBackground'
	| 'notebook.cellInsertionIndicator'
	| 'notebookScrollbarSlider.background'
	| 'notebookScrollbarSlider.hoverBackground'
	| 'notebookScrollbarSlider.activeBackground'
	| 'notebook.symbolHighlightBackground'
	| 'notebook.cellEditorBackground'
	| 'notebook.editorBackground'
	| 'interactive.activeCodeBorder'
	| 'interactive.inactiveCodeBorder'
	| 'searchEditor.textInputBorder'
	| 'terminal.ansiBlack'
	| 'terminal.ansiRed'
	| 'terminal.ansiGreen'
	| 'terminal.ansiYellow'
	| 'terminal.ansiBlue'
	| 'terminal.ansiMagenta'
	| 'terminal.ansiCyan'
	| 'terminal.ansiWhite'
	| 'terminal.ansiBrightBlack'
	| 'terminal.ansiBrightRed'
	| 'terminal.ansiBrightGreen'
	| 'terminal.ansiBrightYellow'
	| 'terminal.ansiBrightBlue'
	| 'terminal.ansiBrightMagenta'
	| 'terminal.ansiBrightCyan'
	| 'terminal.ansiBrightWhite'
	| 'gitDecoration.addedResourceForeground'
	| 'gitDecoration.modifiedResourceForeground'
	| 'gitDecoration.deletedResourceForeground'
	| 'gitDecoration.renamedResourceForeground'
	| 'gitDecoration.untrackedResourceForeground'
	| 'gitDecoration.ignoredResourceForeground'
	| 'gitDecoration.stageModifiedResourceForeground'
	| 'gitDecoration.stageDeletedResourceForeground'
	| 'gitDecoration.conflictingResourceForeground'
	| 'gitDecoration.submoduleResourceForeground'
	| 'gitlens.gutterBackgroundColor'
	| 'gitlens.gutterForegroundColor'
	| 'gitlens.gutterUncommittedForegroundColor'
	| 'gitlens.trailingLineBackgroundColor'
	| 'gitlens.trailingLineForegroundColor'
	| 'gitlens.lineHighlightBackgroundColor'
	| 'gitlens.lineHighlightOverviewRulerColor'
	| 'gitlens.openAutolinkedIssueIconColor'
	| 'gitlens.closedAutolinkedIssueIconColor'
	| 'gitlens.closedPullRequestIconColor'
	| 'gitlens.openPullRequestIconColor'
	| 'gitlens.mergedPullRequestIconColor'
	| 'gitlens.unpublishedChangesIconColor'
	| 'gitlens.unpublishedCommitIconColor'
	| 'gitlens.unpulledChangesIconColor'
	| 'gitlens.decorations.addedForegroundColor'
	| 'gitlens.decorations.copiedForegroundColor'
	| 'gitlens.decorations.deletedForegroundColor'
	| 'gitlens.decorations.ignoredForegroundColor'
	| 'gitlens.decorations.modifiedForegroundColor'
	| 'gitlens.decorations.untrackedForegroundColor'
	| 'gitlens.decorations.renamedForegroundColor'
	| 'gitlens.decorations.branchAheadForegroundColor'
	| 'gitlens.decorations.branchBehindForegroundColor'
	| 'gitlens.decorations.branchDivergedForegroundColor'
	| 'gitlens.decorations.branchUpToDateForegroundColor'
	| 'gitlens.decorations.branchUnpublishedForegroundColor'
	| 'gitlens.decorations.branchMissingUpstreamForegroundColor'
	| 'gitlens.decorations.statusMergingOrRebasingConflictForegroundColor'
	| 'gitlens.decorations.statusMergingOrRebasingForegroundColor'
	| 'gitlens.decorations.workspaceRepoMissingForegroundColor'
	| 'gitlens.decorations.workspaceCurrentForegroundColor'
	| 'gitlens.decorations.workspaceRepoOpenForegroundColor'
	| 'gitlens.decorations.worktreeHasUncommittedChangesForegroundColor'
	| 'gitlens.decorations.worktreeMissingForegroundColor'
	| 'gitlens.graphLane1Color'
	| 'gitlens.graphLane2Color'
	| 'gitlens.graphLane3Color'
	| 'gitlens.graphLane4Color'
	| 'gitlens.graphLane5Color'
	| 'gitlens.graphLane6Color'
	| 'gitlens.graphLane7Color'
	| 'gitlens.graphLane8Color'
	| 'gitlens.graphLane9Color'
	| 'gitlens.graphLane10Color'
	| 'gitlens.graphChangesColumnAddedColor'
	| 'gitlens.graphChangesColumnDeletedColor'
	| 'gitlens.graphMinimapMarkerHeadColor'
	| 'gitlens.graphScrollMarkerHeadColor'
	| 'gitlens.graphMinimapMarkerUpstreamColor'
	| 'gitlens.graphScrollMarkerUpstreamColor'
	| 'gitlens.graphMinimapMarkerHighlightsColor'
	| 'gitlens.graphScrollMarkerHighlightsColor'
	| 'gitlens.graphMinimapMarkerLocalBranchesColor'
	| 'gitlens.graphScrollMarkerLocalBranchesColor'
	| 'gitlens.graphMinimapMarkerPullRequestsColor'
	| 'gitlens.graphScrollMarkerPullRequestsColor'
	| 'gitlens.graphMinimapMarkerRemoteBranchesColor'
	| 'gitlens.graphScrollMarkerRemoteBranchesColor'
	| 'gitlens.graphMinimapMarkerStashesColor'
	| 'gitlens.graphScrollMarkerStashesColor'
	| 'gitlens.graphMinimapMarkerTagsColor'
	| 'gitlens.graphScrollMarkerTagsColor'
	| 'gitlens.launchpadIndicatorMergeableColor'
	| 'gitlens.launchpadIndicatorMergeableHoverColor'
	| 'gitlens.launchpadIndicatorBlockedColor'
	| 'gitlens.launchpadIndicatorBlockedHoverColor'
	| 'gitlens.launchpadIndicatorAttentionColor'
	| 'gitlens.launchpadIndicatorAttentionHoverColor'
	| 'issues.newIssueDecoration'
	| 'issues.open'
	| 'issues.closed'
	| 'pullRequests.merged'
	| 'pullRequests.draft'
	| 'pullRequests.open'
	| 'pullRequests.closed'
	| 'pullRequests.notification'
	| 'clangd.inactiveRegions.background'
	| 'remoteHub.decorations.addedForegroundColor'
	| 'remoteHub.decorations.modifiedForegroundColor'
	| 'remoteHub.decorations.deletedForegroundColor'
	| 'remoteHub.decorations.submoduleForegroundColor'
	| 'remoteHub.decorations.conflictForegroundColor'
	| 'remoteHub.decorations.incomingAddedForegroundColor'
	| 'remoteHub.decorations.incomingModifiedForegroundColor'
	| 'remoteHub.decorations.incomingDeletedForegroundColor'
	| 'remoteHub.decorations.incomingRenamedForegroundColor'
	| 'remoteHub.decorations.possibleConflictForegroundColor'
	| 'remoteHub.decorations.ignoredResourceForeground'
	| 'remoteHub.decorations.workspaceRepositoriesView.hasUncommittedChangesForegroundColor'
	| 'rust_analyzer.syntaxTreeBorder'
	| 'markdown.extension.editor.codeSpan.background'
	| 'markdown.extension.editor.codeSpan.border'
	| 'markdown.extension.editor.formattingMark.foreground'
	| 'markdown.extension.editor.trailingSpace.background';

export type ExtensionManifest = {
	/**
	 * Engine compatibility.
	 */
	engines?: {
		/**
		 * For VS Code extensions, specifies the VS Code version that the extension is compatible with. Cannot be *. For example: ^0.10.5 indicates compatibility with a minimum VS Code version of 0.10.5.
		 */
		vscode?: string;
		[k: string]: unknown;
	};
	/**
	 * The publisher of the VS Code extension.
	 */
	publisher?: string;
	/**
	 * The display name for the extension used in the VS Code gallery.
	 */
	displayName?: string;
	/**
	 * The categories used by the VS Code gallery to categorize the extension.
	 */
	categories?: Array<
		| (
				| 'AI'
				| 'Azure'
				| 'Chat'
				| 'Data Science'
				| 'Debuggers'
				| 'Extension Packs'
				| 'Education'
				| 'Formatters'
				| 'Keymaps'
				| 'Language Packs'
				| 'Linters'
				| 'Machine Learning'
				| 'Notebooks'
				| 'Programming Languages'
				| 'SCM Providers'
				| 'Snippets'
				| 'Testing'
				| 'Themes'
				| 'Visualization'
				| 'Other'
		  )
		| 'Languages'
	>;
	/**
	 * Banner used in the VS Code marketplace.
	 */
	galleryBanner?: {
		/**
		 * The banner color on the VS Code marketplace page header.
		 */
		color?: string;
		/**
		 * The color theme for the font used in the banner.
		 */
		theme?: 'dark' | 'light';
		[k: string]: unknown;
	};
	/**
	 * All contributions of the VS Code extension represented by this package.
	 */
	contributes?: {
		configurationDefaults?: true;
		/**
		 * Contributes configuration settings.
		 */
		configuration?: Configuration | Configuration[];
		/**
		 * Contributes json schema configuration.
		 */
		jsonValidation?: Array<{
			/**
			 * The file pattern (or an array of patterns) to match, for example "package.json" or "*.launch". Exclusion patterns start with '!'
			 */
			fileMatch?: string | string[];
			/**
			 * A schema URL ('http:', 'https:') or relative path to the extension folder ('./').
			 */
			url?: string;
			[k: string]: unknown;
		}>;
		/**
		 * Contribute language models of a specific vendor.
		 */
		languageModels?: LanguageModel | LanguageModel[];
		/**
		 * Contributes a tool that can be invoked by a language model.
		 */
		languageModelTools?: Array<{
			/**
			 * A name for this tool which must be unique across all tools.
			 */
			name: string;
			/**
			 * A description of this tool that may be passed to a language model.
			 */
			description: string;
			/**
			 * A human-readable name for this tool that may be used to describe it in the UI.
			 */
			displayName?: string;
			/**
			 * A JSON schema for the parameters this tool accepts.
			 */
			parametersSchema?:
				| {
						$id?: string;
						$schema?: string;
						$ref?: string;
						$comment?: string;
						title?: string;
						description?: string;
						default?: true;
						readOnly?: boolean;
						writeOnly?: boolean;
						examples?: Array<true>;
						multipleOf?: number;
						maximum?: number;
						exclusiveMaximum?: number;
						minimum?: number;
						exclusiveMinimum?: number;
						maxLength?: number;
						minLength?: number;
						pattern?: string;
						additionalItems?: CoreSchemaMetaSchema;
						items?:
							| CoreSchemaMetaSchema
							| [CoreSchemaMetaSchema, ...CoreSchemaMetaSchema[]];
						maxItems?: number;
						minItems?: number;
						uniqueItems?: boolean;
						contains?: CoreSchemaMetaSchema;
						maxProperties?: number;
						minProperties?: number;
						required?: string[];
						additionalProperties?: CoreSchemaMetaSchema;
						definitions?: Record<string, CoreSchemaMetaSchema>;
						properties?: Record<string, CoreSchemaMetaSchema>;
						patternProperties?: Record<
							string,
							CoreSchemaMetaSchema
						>;
						dependencies?: Record<
							string,
							CoreSchemaMetaSchema | string[]
						>;
						propertyNames?: CoreSchemaMetaSchema;
						const?: true;
						enum?: [true, ...unknown[]];
						type?:
							| (
									| 'array'
									| 'boolean'
									| 'integer'
									| 'null'
									| 'number'
									| 'object'
									| 'string'
							  )
							| [
									(
										| 'array'
										| 'boolean'
										| 'integer'
										| 'null'
										| 'number'
										| 'object'
										| 'string'
									),
									...Array<
										| 'array'
										| 'boolean'
										| 'integer'
										| 'null'
										| 'number'
										| 'object'
										| 'string'
									>,
							  ];
						format?: string;
						contentMediaType?: string;
						contentEncoding?: string;
						if?: CoreSchemaMetaSchema;
						then?: CoreSchemaMetaSchema;
						else?: CoreSchemaMetaSchema;
						allOf?: [
							CoreSchemaMetaSchema,
							...CoreSchemaMetaSchema[],
						];
						anyOf?: [
							CoreSchemaMetaSchema,
							...CoreSchemaMetaSchema[],
						];
						oneOf?: [
							CoreSchemaMetaSchema,
							...CoreSchemaMetaSchema[],
						];
						not?: CoreSchemaMetaSchema;
						[k: string]: unknown;
				  }
				| boolean;
			/**
			 * Whether this tool can be invoked manually by the user through the chat UX.
			 */
			canBeInvokedManually?: boolean;
			/**
			 * An icon that represents this tool. Either a file path, an object with file paths for dark and light themes, or a theme icon reference, like `\$(zap)`
			 */
			icon?: string | ThemePath;
		}>;
		/**
		 * Contributes debug adapters.
		 */
		debuggers?: Array<{
			/**
			 * Unique identifier for this debug adapter.
			 */
			type?: string;
			/**
			 * Display name for this debug adapter.
			 */
			label?: string;
			/**
			 * Path to the debug adapter program. Path is either absolute or relative to the extension folder.
			 */
			program?: string;
			/**
			 * Optional arguments to pass to the adapter.
			 */
			args?: unknown[];
			/**
			 * Optional runtime in case the program attribute is not an executable but requires a runtime.
			 */
			runtime?: string;
			/**
			 * Optional runtime arguments.
			 */
			runtimeArgs?: unknown[];
			/**
			 * Mapping from interactive variables (e.g. ${action.pickProcess}) in `launch.json` to a command.
			 */
			variables?: Record<string, unknown>;
			/**
			 * Configurations for generating the initial 'launch.json'.
			 */
			initialConfigurations?: unknown[] | string;
			/**
			 * List of languages for which the debug extension could be considered the "default debugger".
			 */
			languages?: unknown[];
			/**
			 * Snippets for adding new configurations in 'launch.json'.
			 */
			configurationSnippets?: unknown[];
			/**
			 * JSON schema configurations for validating 'launch.json'.
			 */
			configurationAttributes?: Record<string, unknown>;
			/**
			 * Condition which must be true to enable this type of debugger. Consider using 'shellExecutionSupported', 'virtualWorkspace', 'resourceScheme' or an extension-defined context key as appropriate for this.
			 */
			when?: string;
			/**
			 * When this condition is true, this debugger type is hidden from the debugger list, but is still enabled.
			 */
			hiddenWhen?: string;
			/**
			 * Optional message to mark this debug type as being deprecated.
			 */
			deprecated?: string;
			/**
			 * Windows specific settings.
			 */
			windows?: {
				/**
				 * Runtime used for Windows.
				 */
				runtime?: string;
				[k: string]: unknown;
			};
			/**
			 * MacOS specific settings.
			 */
			osx?: {
				/**
				 * Runtime used for macOS.
				 */
				runtime?: string;
				[k: string]: unknown;
			};
			/**
			 * Linux specific settings.
			 */
			linux?: {
				/**
				 * Runtime used for Linux.
				 */
				runtime?: string;
				[k: string]: unknown;
			};
			/**
			 * UI strings contributed by this debug adapter.
			 */
			strings?: {
				/**
				 * When there are unverified breakpoints in a language supported by this debug adapter, this message will appear on the breakpoint hover and in the breakpoints view. Markdown and command links are supported.
				 */
				unverifiedBreakpoints?: string;
				[k: string]: unknown;
			};
		}>;
		/**
		 * Contributes breakpoints.
		 */
		breakpoints?: Array<{
			/**
			 * Allow breakpoints for this language.
			 */
			language?: string;
			/**
			 * Condition which must be true to enable breakpoints in this language. Consider matching this to the debugger when clause as appropriate.
			 */
			when?: string;
		}>;
		/**
		 * Contributes problem patterns
		 */
		problemPatterns?: Array<
			| {
					/**
					 * The regular expression to find an error, warning or info in the output.
					 */
					regexp?: string;
					/**
					 * Whether the pattern matches a location (file and line) or only a file.
					 */
					kind?: string;
					/**
					 * The match group index of the filename. If omitted 1 is used.
					 */
					file?: number;
					/**
					 * The match group index of the problem's location. Valid location patterns are: (line), (line,column) and (startLine,startColumn,endLine,endColumn). If omitted (line,column) is assumed.
					 */
					location?: number;
					/**
					 * The match group index of the problem's line. Defaults to 2
					 */
					line?: number;
					/**
					 * The match group index of the problem's line character. Defaults to 3
					 */
					column?: number;
					/**
					 * The match group index of the problem's end line. Defaults to undefined
					 */
					endLine?: number;
					/**
					 * The match group index of the problem's end line character. Defaults to undefined
					 */
					endColumn?: number;
					/**
					 * The match group index of the problem's severity. Defaults to undefined
					 */
					severity?: number;
					/**
					 * The match group index of the problem's code. Defaults to undefined
					 */
					code?: number;
					/**
					 * The match group index of the message. If omitted it defaults to 4 if location is specified. Otherwise it defaults to 5.
					 */
					message?: number;
					/**
					 * In a multi line matcher loop indicated whether this pattern is executed in a loop as long as it matches. Can only specified on a last pattern in a multi line pattern.
					 */
					loop?: boolean;
					/**
					 * The name of the problem pattern.
					 */
					name?: string;
			  }
			| {
					/**
					 * The name of the problem multi line problem pattern.
					 */
					name?: string;
					/**
					 * The actual patterns.
					 */
					patterns?: ProblemPattern[];
			  }
		>;
		/**
		 * Contributes problem matchers
		 */
		problemMatchers?: Array<{
			/**
			 * The name of a base problem matcher to use.
			 */
			base?: string;
			/**
			 * The owner of the problem inside Code. Can be omitted if base is specified. Defaults to 'external' if omitted and base is not specified.
			 */
			owner?: string;
			/**
			 * A human-readable string describing the source of this diagnostic, e.g. 'typescript' or 'super lint'.
			 */
			source?: string;
			/**
			 * The default severity for captures problems. Is used if the pattern doesn't define a match group for severity.
			 */
			severity?: 'error' | 'warning' | 'info';
			/**
			 * Controls if a problem reported on a text document is applied only to open, closed or all documents.
			 */
			applyTo?: 'allDocuments' | 'openDocuments' | 'closedDocuments';
			/**
			 * A problem pattern or the name of a contributed or predefined problem pattern. Can be omitted if base is specified.
			 */
			pattern?: string | ProblemPattern | ProblemPattern[];
			/**
			 * Defines how file names reported in a problem pattern should be interpreted. A relative fileLocation may be an array, where the second element of the array is the path of the relative file location. The search fileLocation mode, performs a deep (and, possibly, heavy) file system search within the directories specified by the include/exclude properties of the second element (or the current workspace directory if not specified).
			 */
			fileLocation?:
				| 'absolute'
				| 'relative'
				| 'autoDetect'
				| 'search'
				| [unknown]
				| [unknown, unknown];
			/**
			 * Patterns to track the begin and end of a matcher active on a background task.
			 */
			background?: {
				/**
				 * If set to true the background monitor is in active mode when the task starts. This is equals of issuing a line that matches the beginsPattern
				 */
				activeOnStart?: boolean;
				/**
				 * If matched in the output the start of a background task is signaled.
				 */
				beginsPattern?: string | BackgroundPattern;
				/**
				 * If matched in the output the end of a background task is signaled.
				 */
				endsPattern?: string | BackgroundPattern;
			};
			/**
			 * Patterns to track the begin and end of a watching matcher.
			 */
			watching?: {
				/**
				 * If set to true the watcher is in active mode when the task starts. This is equals of issuing a line that matches the beginPattern
				 */
				activeOnStart?: boolean;
				/**
				 * If matched in the output the start of a watching task is signaled.
				 */
				beginsPattern?: string | BackgroundPattern;
				/**
				 * If matched in the output the end of a watching task is signaled.
				 */
				endsPattern?: string | BackgroundPattern;
			};
			/**
			 * The name of the problem matcher used to refer to it.
			 */
			name?: string;
			/**
			 * A human readable label of the problem matcher.
			 */
			label?: string;
		}>;
		/**
		 * Contributes task kinds
		 */
		taskDefinitions?: Array<{
			/**
			 * The actual task type. Please note that types starting with a '$' are reserved for internal usage.
			 */
			type?: string;
			required?: string[];
			/**
			 * Additional properties of the task type
			 */
			properties?: Record<string, CoreSchemaMetaSchema>;
			when?: string;
		}>;
		/**
		 * Contributes terminal functionality.
		 */
		terminal?: {
			/**
			 * Defines additional terminal profiles that the user can create.
			 */
			profiles?: Array<{
				/**
				 * The ID of the terminal profile provider.
				 */
				id: string;
				/**
				 * Title for this terminal profile.
				 */
				title: string;
				/**
				 * A codicon, URI, or light and dark URIs to associate with this terminal type.
				 */
				icon?: string | ThemePath;
				[k: string]: unknown;
			}>;
			[k: string]: unknown;
		};
		/**
		 * Contributes terminal quick fixes.
		 */
		terminalQuickFixes?: Array<{
			/**
			 * The ID of the quick fix provider
			 */
			id: string;
			/**
			 * A regular expression or string to test the command line against
			 */
			commandLineMatcher: string;
			outputMatcher: {
				/**
				 * A regular expression or string to test the command line against
				 */
				lineMatcher: string;
				/**
				 * Where the search should begin in the buffer
				 */
				anchor: 'top' | 'bottom';
				/**
				 * The number of lines vertically from the anchor in the buffer to start matching against
				 */
				offset: number;
				/**
				 * The number of rows to match against, this should be as small as possible for performance reasons
				 */
				length: number;
				[k: string]: unknown;
			};
			/**
			 * The command exit result to match on
			 */
			commandExitResult: 'success' | 'error';
			/**
			 * The kind of the resulting quick fix. This changes how the quick fix is presented. Defaults to `"fix"`.
			 */
			kind?: 'default' | 'explain';
		}>;
		/**
		 * Contribute walkthroughs to help users getting started with your extension.
		 */
		walkthroughs?: Array<{
			/**
			 * Unique identifier for this walkthrough.
			 */
			id: string;
			/**
			 * Title of walkthrough.
			 */
			title: string;
			/**
			 * Relative path to the icon of the walkthrough. The path is relative to the extension location. If not specified, the icon defaults to the extension icon if available.
			 */
			icon?: string;
			/**
			 * Description of walkthrough.
			 */
			description: string;
			/**
			 * Walkthroughs that match one of these glob patterns appear as 'featured' in workspaces with the specified files. For example, a walkthrough for TypeScript projects might specify `tsconfig.json` here.
			 */
			featuredFor?: string[];
			/**
			 * Context key expression to control the visibility of this walkthrough.
			 */
			when?: string;
			/**
			 * Steps to complete as part of this walkthrough.
			 */
			steps: Array<{
				/**
				 * Unique identifier for this step. This is used to keep track of which steps have been completed.
				 */
				id: string;
				/**
				 * Title of step.
				 */
				title: string;
				/**
				 * Description of step. Supports ``preformatted``, __italic__, and **bold** text. Use markdown-style links for commands or external links: [Title](command:myext.command), [Title](command:toSide:myext.command), or [Title](https://aka.ms). Links on their own line will be rendered as buttons.
				 */
				description?: string;
				button?: Record<string, unknown>;
				/**
				 * Media to show alongside this step, either an image or markdown content.
				 */
				media:
					| {
							path?: Record<string, unknown>;
							/**
							 * Path to an image - or object consisting of paths to light, dark, and hc images - relative to extension directory. Depending on context, the image will be displayed from 400px to 800px wide, with similar bounds on height. To support HIDPI displays, the image will be rendered at 1.5x scaling, for example a 900 physical pixels wide image will be displayed as 600 logical pixels wide.
							 */
							image:
								| string
								| {
										/**
										 * Path to the image for dark themes, relative to extension directory.
										 */
										dark: string;
										/**
										 * Path to the image for light themes, relative to extension directory.
										 */
										light: string;
										/**
										 * Path to the image for hc themes, relative to extension directory.
										 */
										hc: string;
										/**
										 * Path to the image for hc light themes, relative to extension directory.
										 */
										hcLight: string;
										[k: string]: unknown;
								  };
							/**
							 * Alternate text to display when the image cannot be loaded or in screen readers.
							 */
							altText: string;
					  }
					| {
							/**
							 * Path to an svg, color tokens are supported in variables to support theming to match the workbench.
							 */
							svg: string;
							/**
							 * Alternate text to display when the image cannot be loaded or in screen readers.
							 */
							altText: string;
					  }
					| {
							path?: Record<string, unknown>;
							/**
							 * Path to the markdown document, relative to extension directory.
							 */
							markdown: string;
					  };
				/**
				 * Events that should trigger this step to become checked off. If empty or not defined, the step will check off when any of the step's buttons or links are clicked; if the step has no buttons or links it will check on when it is selected.
				 */
				completionEvents?: string[];
				/**
				 * Signal to mark step as complete.
				 */
				doneOn?: {
					/**
					 * Mark step done when the specified command is executed.
					 */
					command: string;
					[k: string]: unknown;
				};
				/**
				 * Context key expression to control the visibility of this step.
				 */
				when?: string;
				[k: string]: unknown;
			}>;
			[k: string]: unknown;
		}>;
		/**
		 * Contributes commands to the command palette.
		 */
		commands?: Command | Command[];
		/**
		 * Contributes submenu items to the editor
		 */
		submenus?: Array<{
			/**
			 * Identifier of the menu to display as a submenu.
			 */
			id: string;
			/**
			 * The label of the menu item which leads to this submenu.
			 */
			label: string;
			/**
			 * (Optional) Icon which is used to represent the submenu in the UI. Either a file path, an object with file paths for dark and light themes, or a theme icon references, like `\$(zap)`
			 */
			icon?: string | ThemePath;
			[k: string]: unknown;
		}>;
		/**
		 * Contributes menu items to the editor
		 */
		menus?: {
			commandPalette?: Action[];
			touchBar?: Action[];
			'editor/title'?: ActionOrSubmenu[];
			'editor/title/run'?: ActionOrSubmenu[];
			'editor/context'?: ActionOrSubmenu[];
			'editor/context/copy'?: ActionOrSubmenu[];
			'editor/context/share'?: ActionOrSubmenu[];
			'explorer/context'?: ActionOrSubmenu[];
			'explorer/context/share'?: ActionOrSubmenu[];
			'editor/title/context'?: ActionOrSubmenu[];
			'editor/title/context/share'?: ActionOrSubmenu[];
			'debug/callstack/context'?: ActionOrSubmenu[];
			'debug/variables/context'?: ActionOrSubmenu[];
			'debug/toolBar'?: ActionOrSubmenu[];
			'notebook/variables/context'?: ActionOrSubmenu[];
			'menuBar/home'?: Action[];
			'menuBar/edit/copy'?: ActionOrSubmenu[];
			'scm/title'?: ActionOrSubmenu[];
			'scm/sourceControl'?: ActionOrSubmenu[];
			'scm/sourceControl/title'?: ActionOrSubmenu[];
			'scm/resourceState/context'?: ActionOrSubmenu[];
			'scm/resourceFolder/context'?: ActionOrSubmenu[];
			'scm/resourceGroup/context'?: ActionOrSubmenu[];
			'scm/change/title'?: ActionOrSubmenu[];
			'scm/inputBox'?: ActionOrSubmenu[];
			'scm/historyItemChanges/title'?: ActionOrSubmenu[];
			'scm/historyItem/context'?: ActionOrSubmenu[];
			'scm/incomingChanges'?: ActionOrSubmenu[];
			'scm/incomingChanges/context'?: ActionOrSubmenu[];
			'scm/outgoingChanges'?: ActionOrSubmenu[];
			'scm/outgoingChanges/context'?: ActionOrSubmenu[];
			'scm/incomingChanges/allChanges/context'?: ActionOrSubmenu[];
			'scm/incomingChanges/historyItem/context'?: ActionOrSubmenu[];
			'scm/outgoingChanges/allChanges/context'?: ActionOrSubmenu[];
			'scm/outgoingChanges/historyItem/context'?: ActionOrSubmenu[];
			'statusBar/remoteIndicator'?: Action[];
			'terminal/context'?: ActionOrSubmenu[];
			'terminal/title/context'?: ActionOrSubmenu[];
			'view/title'?: ActionOrSubmenu[];
			'view/item/context'?: ActionOrSubmenu[];
			'comments/comment/editorActions'?: ActionOrSubmenu[];
			'comments/commentThread/title'?: ActionOrSubmenu[];
			'comments/commentThread/context'?: Action[];
			'comments/commentThread/additionalActions'?: Action[];
			'comments/commentThread/title/context'?: ActionOrSubmenu[];
			'comments/comment/title'?: ActionOrSubmenu[];
			'comments/comment/context'?: Action[];
			'comments/commentThread/comment/context'?: ActionOrSubmenu[];
			'commentsView/commentThread/context'?: ActionOrSubmenu[];
			'notebook/toolbar'?: ActionOrSubmenu[];
			'notebook/kernelSource'?: ActionOrSubmenu[];
			'notebook/cell/title'?: ActionOrSubmenu[];
			'notebook/cell/execute'?: ActionOrSubmenu[];
			'interactive/toolbar'?: ActionOrSubmenu[];
			'interactive/cell/title'?: ActionOrSubmenu[];
			'issue/reporter'?: ActionOrSubmenu[];
			'testing/item/context'?: ActionOrSubmenu[];
			'testing/item/gutter'?: ActionOrSubmenu[];
			'testing/profiles/context'?: ActionOrSubmenu[];
			'testing/item/result'?: ActionOrSubmenu[];
			'testing/message/context'?: ActionOrSubmenu[];
			'testing/message/content'?: ActionOrSubmenu[];
			'extension/context'?: ActionOrSubmenu[];
			'timeline/title'?: ActionOrSubmenu[];
			'timeline/item/context'?: ActionOrSubmenu[];
			'ports/item/context'?: ActionOrSubmenu[];
			'ports/item/origin/inline'?: ActionOrSubmenu[];
			'ports/item/port/inline'?: ActionOrSubmenu[];
			'file/newFile'?: Action[];
			'webview/context'?: ActionOrSubmenu[];
			'file/share'?: ActionOrSubmenu[];
			'editor/inlineCompletions/actions'?: Action[];
			'editor/inlineEdit/actions'?: Action[];
			'editor/content'?: ActionOrSubmenu[];
			'editor/lineNumber/context'?: ActionOrSubmenu[];
			'mergeEditor/result/title'?: ActionOrSubmenu[];
			'multiDiffEditor/resource/title'?: ActionOrSubmenu[];
			'diffEditor/gutter/hunk'?: ActionOrSubmenu[];
			'diffEditor/gutter/selection'?: ActionOrSubmenu[];
			/**
			 * Submenu
			 */
			[k: string]: unknown;
		};
		/**
		 * Contributes a Speech Provider
		 */
		speechProviders?: Array<{
			/**
			 * Unique name for this Speech Provider.
			 */
			name: string;
			/**
			 * A description of this Speech Provider, shown in the UI.
			 */
			description?: string;
		}>;
		/**
		 * Contributes language declarations.
		 */
		languages?: Array<{
			/**
			 * ID of the language.
			 */
			id?: string;
			/**
			 * Name aliases for the language.
			 */
			aliases?: string[];
			/**
			 * File extensions associated to the language.
			 */
			extensions?: string[];
			/**
			 * File names associated to the language.
			 */
			filenames?: string[];
			/**
			 * File name glob patterns associated to the language.
			 */
			filenamePatterns?: string[];
			/**
			 * Mime types associated to the language.
			 */
			mimetypes?: string[];
			/**
			 * A regular expression matching the first line of a file of the language.
			 */
			firstLine?: string;
			/**
			 * A relative path to a file containing configuration options for the language.
			 */
			configuration?: string;
			/**
			 * A icon to use as file icon, if no icon theme provides one for the language.
			 */
			icon?: {
				/**
				 * Icon path when a light theme is used
				 */
				light?: string;
				/**
				 * Icon path when a dark theme is used
				 */
				dark?: string;
				[k: string]: unknown;
			};
			[k: string]: unknown;
		}>;
		/**
		 * Contributes authentication
		 */
		authentication?: Array<{
			/**
			 * The id of the authentication provider.
			 */
			id?: string;
			/**
			 * The human readable name of the authentication provider.
			 */
			label?: string;
		}>;
		codeActions?: Array<{
			/**
			 * Language modes that the code actions are enabled for.
			 */
			languages: string[];
			actions: {
				kind: string;
				/**
				 * Label for the code action used in the UI.
				 */
				title: string;
				/**
				 * Description of what the code action does.
				 */
				description?: string;
				[k: string]: unknown;
			};
			[k: string]: unknown;
		}>;
		/**
		 * Contributed documentation.
		 */
		documentation?: {
			/**
			 * Contributed documentation for refactorings.
			 */
			refactoring?: Array<{
				/**
				 * Label for the documentation used in the UI.
				 */
				title: string;
				/**
				 * When clause.
				 */
				when: string;
				/**
				 * Command executed.
				 */
				command: string;
				[k: string]: unknown;
			}>;
			[k: string]: unknown;
		};
		/**
		 * Contributed views welcome content. Welcome content will be rendered in tree based views whenever they have no meaningful content to display, ie. the File Explorer when no folder is open. Such content is useful as in-product documentation to drive users to use certain features before they are available. A good example would be a `Clone Repository` button in the File Explorer welcome view.
		 */
		viewsWelcome?: Array<{
			view: string | ('explorer' | 'debug' | 'scm' | 'testing');
			/**
			 * Welcome content to be displayed. The format of the contents is a subset of Markdown, with support for links only.
			 */
			contents: string;
			/**
			 * Condition when the welcome content should be displayed.
			 */
			when?: string;
			/**
			 * Group to which this welcome content belongs. Proposed API.
			 */
			group?: string;
			/**
			 * Condition when the welcome content buttons and command links should be enabled.
			 */
			enablement?: string;
			[k: string]: unknown;
		}>;
		/**
		 * Contributes notebook document provider.
		 */
		notebooks?: Array<{
			/**
			 * Type of the notebook.
			 */
			type: string;
			/**
			 * Human readable name of the notebook.
			 */
			displayName: string;
			/**
			 * Set of globs that the notebook is for.
			 */
			selector: Array<{
				/**
				 * Glob that the notebook is enabled for.
				 */
				filenamePattern?: string;
				/**
				 * Glob that the notebook is disabled for.
				 */
				excludeFileNamePattern?: string;
				[k: string]: unknown;
			}>;
			priority?: 'default' | 'option';
			[k: string]: unknown;
		}>;
		/**
		 * Contributes notebook output renderer provider.
		 */
		notebookRenderer?: Array<
			{
				/**
				 * Unique identifier of the notebook output renderer.
				 */
				id: string;
				/**
				 * Human readable name of the notebook output renderer.
				 */
				displayName: string;
				dependencies?: string[];
				optionalDependencies?: string[];
				/**
				 * Defines how and if the renderer needs to communicate with an extension host, via `createRendererMessaging`. Renderers with stronger messaging requirements may not work in all environments.
				 */
				requiresMessaging?: 'always' | 'optional' | 'never';
				[k: string]: unknown;
			} & (
				| {
						/**
						 * Set of globs that the notebook is for.
						 */
						mimeTypes: string[];
						/**
						 * File to load in the webview to render the extension.
						 */
						entrypoint: string;
						[k: string]: unknown;
				  }
				| {
						/**
						 * File to load in the webview to render the extension.
						 */
						entrypoint: {
							/**
							 * Existing renderer that this one extends.
							 */
							extends: string;
							/**
							 * File to load in the webview to render the extension.
							 */
							path: string;
							[k: string]: unknown;
						};
						[k: string]: unknown;
				  }
			)
		>;
		/**
		 * Contributes notebook preloads.
		 */
		notebookPreload?: Array<{
			/**
			 * Type of the notebook.
			 */
			type: string;
			/**
			 * Path to file loaded in the webview.
			 */
			entrypoint: string;
			/**
			 * Paths to additional resources that should be allowed in the webview.
			 */
			localResourceRoots?: string[];
			[k: string]: unknown;
		}>;
		/**
		 * Contributed custom editors.
		 */
		customEditors?: Array<{
			viewType: string;
			/**
			 * Human readable name of the custom editor. This is displayed to users when selecting which editor to use.
			 */
			displayName: string;
			/**
			 * Set of globs that the custom editor is enabled for.
			 */
			selector: Array<{
				/**
				 * Glob that the custom editor is enabled for.
				 */
				filenamePattern?: string;
				[k: string]: unknown;
			}>;
			priority?: 'default' | 'option';
			[k: string]: unknown;
		}>;
		/**
		 * Contributes resource label formatting rules.
		 */
		resourceLabelFormatters?: Array<{
			/**
			 * URI scheme on which to match the formatter on. For example "file". Simple glob patterns are supported.
			 */
			scheme: string;
			/**
			 * URI authority on which to match the formatter on. Simple glob patterns are supported.
			 */
			authority?: string;
			/**
			 * Rules for formatting uri resource labels.
			 */
			formatting: {
				/**
				 * Label rules to display. For example: myLabel:/${path}. ${path}, ${scheme}, ${authority} and ${authoritySuffix} are supported as variables.
				 */
				label?: string;
				/**
				 * Separator to be used in the uri label display. '/' or '' as an example.
				 */
				separator?: string;
				/**
				 * Controls whether `${path}` substitutions should have starting separator characters stripped.
				 */
				stripPathStartingSeparator?: boolean;
				/**
				 * Controls if the start of the uri label should be tildified when possible.
				 */
				tildify?: boolean;
				/**
				 * Suffix appended to the workspace label.
				 */
				workspaceSuffix?: string;
				[k: string]: unknown;
			};
			[k: string]: unknown;
		}>;
		/**
		 * Contributes help information for Remote
		 */
		remoteHelp?: {
			/**
			 * The url, or a command that returns the url, to your project's Getting Started page, or a walkthrough ID contributed by your project's extension
			 */
			getStarted?:
				| string
				| {
						/**
						 * The ID of a Get Started walkthrough to open.
						 */
						id: string;
						[k: string]: unknown;
				  };
			/**
			 * The url, or a command that returns the url, to your project's documentation page
			 */
			documentation?: string;
			/**
			 * The url, or a command that returns the url, to your project's feedback reporter
			 */
			feedback?: string;
			/**
			 * The url, or a command that returns the url, to your project's issue reporter
			 */
			reportIssue?: string;
			/**
			 * The url, or a command that returns the url, to your project's issues list
			 */
			issues?: string;
			[k: string]: unknown;
		};
		/**
		 * Contributes items to the status bar.
		 */
		statusBarItems?: StatusBarItem | StatusBarItem[];
		/**
		 * Contributes textmate tokenizers.
		 */
		grammars?: Array<{
			/**
			 * Language identifier for which this syntax is contributed to.
			 */
			language?: string;
			/**
			 * Textmate scope name used by the tmLanguage file.
			 */
			scopeName: string;
			/**
			 * Path of the tmLanguage file. The path is relative to the extension folder and typically starts with './syntaxes/'.
			 */
			path: string;
			/**
			 * A map of scope name to language id if this grammar contains embedded languages.
			 */
			embeddedLanguages?: Record<string, unknown>;
			/**
			 * A map of scope name to token types.
			 */
			tokenTypes?: Record<string, 'string' | 'comment' | 'other'>;
			/**
			 * List of language scope names to which this grammar is injected to.
			 */
			injectTo?: string[];
			/**
			 * Defines which scope names contain balanced brackets.
			 */
			balancedBracketScopes?: string[];
			/**
			 * Defines which scope names do not contain balanced brackets.
			 */
			unbalancedBracketScopes?: string[];
			[k: string]: unknown;
		}>;
		debugVisualizers?: Array<{
			/**
			 * Name of the debug visualizer
			 */
			id: string;
			/**
			 * Condition when the debug visualizer is applicable
			 */
			when: string;
			[k: string]: unknown;
		}>;
		/**
		 * Contributes extension defined themable colors
		 */
		colors?: Array<{
			/**
			 * The identifier of the themable color
			 */
			id?: string;
			/**
			 * The description of the themable color
			 */
			description?: string;
			defaults?: {
				/**
				 * The default color for light themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default.
				 */
				light: BuiltinColor | string;
				/**
				 * The default color for dark themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default.
				 */
				dark: BuiltinColor | string;
				/**
				 * The default color for high contrast dark themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default. If not provided, the `dark` color is used as default for high contrast dark themes.
				 */
				highContrast?: BuiltinColor | string;
				/**
				 * The default color for high contrast light themes. Either a color value in hex (#RRGGBB[AA]) or the identifier of a themable color which provides the default. If not provided, the `light` color is used as default for high contrast light themes.
				 */
				highContrastLight?: BuiltinColor | string;
				[k: string]: unknown;
			};
			[k: string]: unknown;
		}>;
		/**
		 * Contributes extension defined themable icons
		 */
		icons?: Record<
			string,
			{
				/**
				 * The description of the themable icon
				 */
				description: string;
				/**
				 * The default of the icon. Either a reference to an extisting ThemeIcon or an icon in an icon font.
				 */
				default:
					| (
							| 'add'
							| 'plus'
							| 'gist-new'
							| 'repo-create'
							| 'lightbulb'
							| 'light-bulb'
							| 'repo'
							| 'repo-delete'
							| 'gist-fork'
							| 'repo-forked'
							| 'git-pull-request'
							| 'git-pull-request-abandoned'
							| 'record-keys'
							| 'keyboard'
							| 'tag'
							| 'git-pull-request-label'
							| 'tag-add'
							| 'tag-remove'
							| 'person'
							| 'person-follow'
							| 'person-outline'
							| 'person-filled'
							| 'git-branch'
							| 'git-branch-create'
							| 'git-branch-delete'
							| 'source-control'
							| 'mirror'
							| 'mirror-public'
							| 'star'
							| 'star-add'
							| 'star-delete'
							| 'star-empty'
							| 'comment'
							| 'comment-add'
							| 'alert'
							| 'warning'
							| 'search'
							| 'search-save'
							| 'log-out'
							| 'sign-out'
							| 'log-in'
							| 'sign-in'
							| 'eye'
							| 'eye-unwatch'
							| 'eye-watch'
							| 'circle-filled'
							| 'primitive-dot'
							| 'close-dirty'
							| 'debug-breakpoint'
							| 'debug-breakpoint-disabled'
							| 'debug-hint'
							| 'terminal-decoration-success'
							| 'primitive-square'
							| 'edit'
							| 'pencil'
							| 'info'
							| 'issue-opened'
							| 'gist-private'
							| 'git-fork-private'
							| 'lock'
							| 'mirror-private'
							| 'close'
							| 'remove-close'
							| 'x'
							| 'repo-sync'
							| 'sync'
							| 'clone'
							| 'desktop-download'
							| 'beaker'
							| 'microscope'
							| 'vm'
							| 'device-desktop'
							| 'file'
							| 'file-text'
							| 'more'
							| 'ellipsis'
							| 'kebab-horizontal'
							| 'mail-reply'
							| 'reply'
							| 'organization'
							| 'organization-filled'
							| 'organization-outline'
							| 'new-file'
							| 'file-add'
							| 'new-folder'
							| 'file-directory-create'
							| 'trash'
							| 'trashcan'
							| 'history'
							| 'clock'
							| 'folder'
							| 'file-directory'
							| 'symbol-folder'
							| 'logo-github'
							| 'mark-github'
							| 'github'
							| 'terminal'
							| 'console'
							| 'repl'
							| 'zap'
							| 'symbol-event'
							| 'error'
							| 'stop'
							| 'variable'
							| 'symbol-variable'
							| 'array'
							| 'symbol-array'
							| 'symbol-module'
							| 'symbol-package'
							| 'symbol-namespace'
							| 'symbol-object'
							| 'symbol-method'
							| 'symbol-function'
							| 'symbol-constructor'
							| 'symbol-boolean'
							| 'symbol-null'
							| 'symbol-numeric'
							| 'symbol-number'
							| 'symbol-structure'
							| 'symbol-struct'
							| 'symbol-parameter'
							| 'symbol-type-parameter'
							| 'symbol-key'
							| 'symbol-text'
							| 'symbol-reference'
							| 'go-to-file'
							| 'symbol-enum'
							| 'symbol-value'
							| 'symbol-ruler'
							| 'symbol-unit'
							| 'activate-breakpoints'
							| 'archive'
							| 'arrow-both'
							| 'arrow-down'
							| 'arrow-left'
							| 'arrow-right'
							| 'arrow-small-down'
							| 'arrow-small-left'
							| 'arrow-small-right'
							| 'arrow-small-up'
							| 'arrow-up'
							| 'bell'
							| 'bold'
							| 'book'
							| 'bookmark'
							| 'debug-breakpoint-conditional-unverified'
							| 'debug-breakpoint-conditional'
							| 'debug-breakpoint-conditional-disabled'
							| 'debug-breakpoint-data-unverified'
							| 'debug-breakpoint-data'
							| 'debug-breakpoint-data-disabled'
							| 'debug-breakpoint-log-unverified'
							| 'debug-breakpoint-log'
							| 'debug-breakpoint-log-disabled'
							| 'briefcase'
							| 'broadcast'
							| 'browser'
							| 'bug'
							| 'calendar'
							| 'case-sensitive'
							| 'check'
							| 'checklist'
							| 'chevron-down'
							| 'chevron-left'
							| 'chevron-right'
							| 'chevron-up'
							| 'chrome-close'
							| 'chrome-maximize'
							| 'chrome-minimize'
							| 'chrome-restore'
							| 'circle-outline'
							| 'circle'
							| 'debug-breakpoint-unverified'
							| 'terminal-decoration-incomplete'
							| 'circle-slash'
							| 'circuit-board'
							| 'clear-all'
							| 'clippy'
							| 'close-all'
							| 'cloud-download'
							| 'cloud-upload'
							| 'code'
							| 'collapse-all'
							| 'color-mode'
							| 'comment-discussion'
							| 'credit-card'
							| 'dash'
							| 'dashboard'
							| 'database'
							| 'debug-continue'
							| 'debug-disconnect'
							| 'debug-pause'
							| 'debug-restart'
							| 'debug-start'
							| 'debug-step-into'
							| 'debug-step-out'
							| 'debug-step-over'
							| 'debug-stop'
							| 'debug'
							| 'device-camera-video'
							| 'device-camera'
							| 'device-mobile'
							| 'diff-added'
							| 'diff-ignored'
							| 'diff-modified'
							| 'diff-removed'
							| 'diff-renamed'
							| 'diff'
							| 'diff-sidebyside'
							| 'discard'
							| 'editor-layout'
							| 'empty-window'
							| 'exclude'
							| 'extensions'
							| 'eye-closed'
							| 'file-binary'
							| 'file-code'
							| 'file-media'
							| 'file-pdf'
							| 'file-submodule'
							| 'file-symlink-directory'
							| 'file-symlink-file'
							| 'file-zip'
							| 'files'
							| 'filter'
							| 'flame'
							| 'fold-down'
							| 'fold-up'
							| 'fold'
							| 'folder-active'
							| 'folder-opened'
							| 'gear'
							| 'gift'
							| 'gist-secret'
							| 'gist'
							| 'git-commit'
							| 'git-compare'
							| 'compare-changes'
							| 'git-merge'
							| 'github-action'
							| 'github-alt'
							| 'globe'
							| 'grabber'
							| 'graph'
							| 'gripper'
							| 'heart'
							| 'home'
							| 'horizontal-rule'
							| 'hubot'
							| 'inbox'
							| 'issue-reopened'
							| 'issues'
							| 'italic'
							| 'jersey'
							| 'json'
							| 'kebab-vertical'
							| 'key'
							| 'law'
							| 'lightbulb-autofix'
							| 'link-external'
							| 'link'
							| 'list-ordered'
							| 'list-unordered'
							| 'live-share'
							| 'loading'
							| 'location'
							| 'mail-read'
							| 'mail'
							| 'markdown'
							| 'megaphone'
							| 'mention'
							| 'milestone'
							| 'git-pull-request-milestone'
							| 'mortar-board'
							| 'move'
							| 'multiple-windows'
							| 'mute'
							| 'no-newline'
							| 'note'
							| 'octoface'
							| 'open-preview'
							| 'package'
							| 'paintcan'
							| 'pin'
							| 'play'
							| 'run'
							| 'plug'
							| 'preserve-case'
							| 'preview'
							| 'project'
							| 'pulse'
							| 'question'
							| 'quote'
							| 'radio-tower'
							| 'reactions'
							| 'references'
							| 'refresh'
							| 'regex'
							| 'remote-explorer'
							| 'remote'
							| 'remove'
							| 'replace-all'
							| 'replace'
							| 'repo-clone'
							| 'repo-force-push'
							| 'repo-pull'
							| 'repo-push'
							| 'report'
							| 'request-changes'
							| 'rocket'
							| 'root-folder-opened'
							| 'root-folder'
							| 'rss'
							| 'ruby'
							| 'save-all'
							| 'save-as'
							| 'save'
							| 'screen-full'
							| 'screen-normal'
							| 'search-stop'
							| 'server'
							| 'settings-gear'
							| 'settings'
							| 'shield'
							| 'smiley'
							| 'sort-precedence'
							| 'split-horizontal'
							| 'split-vertical'
							| 'squirrel'
							| 'star-full'
							| 'star-half'
							| 'symbol-class'
							| 'symbol-color'
							| 'symbol-constant'
							| 'symbol-enum-member'
							| 'symbol-field'
							| 'symbol-file'
							| 'symbol-interface'
							| 'symbol-keyword'
							| 'symbol-misc'
							| 'symbol-operator'
							| 'symbol-property'
							| 'wrench'
							| 'wrench-subaction'
							| 'symbol-snippet'
							| 'tasklist'
							| 'telescope'
							| 'text-size'
							| 'three-bars'
							| 'thumbsdown'
							| 'thumbsup'
							| 'tools'
							| 'triangle-down'
							| 'triangle-left'
							| 'triangle-right'
							| 'triangle-up'
							| 'twitter'
							| 'unfold'
							| 'unlock'
							| 'unmute'
							| 'unverified'
							| 'verified'
							| 'versions'
							| 'vm-active'
							| 'vm-outline'
							| 'vm-running'
							| 'watch'
							| 'whitespace'
							| 'whole-word'
							| 'window'
							| 'word-wrap'
							| 'zoom-in'
							| 'zoom-out'
							| 'list-filter'
							| 'list-flat'
							| 'list-selection'
							| 'selection'
							| 'list-tree'
							| 'debug-breakpoint-function-unverified'
							| 'debug-breakpoint-function'
							| 'debug-breakpoint-function-disabled'
							| 'debug-stackframe-active'
							| 'circle-small-filled'
							| 'debug-stackframe-dot'
							| 'terminal-decoration-mark'
							| 'debug-stackframe'
							| 'debug-stackframe-focused'
							| 'debug-breakpoint-unsupported'
							| 'symbol-string'
							| 'debug-reverse-continue'
							| 'debug-step-back'
							| 'debug-restart-frame'
							| 'debug-alt'
							| 'call-incoming'
							| 'call-outgoing'
							| 'menu'
							| 'expand-all'
							| 'feedback'
							| 'git-pull-request-reviewer'
							| 'group-by-ref-type'
							| 'ungroup-by-ref-type'
							| 'account'
							| 'git-pull-request-assignee'
							| 'bell-dot'
							| 'debug-console'
							| 'library'
							| 'output'
							| 'run-all'
							| 'sync-ignored'
							| 'pinned'
							| 'github-inverted'
							| 'server-process'
							| 'server-environment'
							| 'pass'
							| 'issue-closed'
							| 'stop-circle'
							| 'play-circle'
							| 'record'
							| 'debug-alt-small'
							| 'vm-connect'
							| 'cloud'
							| 'merge'
							| 'export'
							| 'graph-left'
							| 'magnet'
							| 'notebook'
							| 'redo'
							| 'check-all'
							| 'pinned-dirty'
							| 'pass-filled'
							| 'circle-large-filled'
							| 'circle-large'
							| 'circle-large-outline'
							| 'combine'
							| 'gather'
							| 'table'
							| 'variable-group'
							| 'type-hierarchy'
							| 'type-hierarchy-sub'
							| 'type-hierarchy-super'
							| 'git-pull-request-create'
							| 'run-above'
							| 'run-below'
							| 'notebook-template'
							| 'debug-rerun'
							| 'workspace-trusted'
							| 'workspace-untrusted'
							| 'workspace-unknown'
							| 'terminal-cmd'
							| 'terminal-debian'
							| 'terminal-linux'
							| 'terminal-powershell'
							| 'terminal-tmux'
							| 'terminal-ubuntu'
							| 'terminal-bash'
							| 'arrow-swap'
							| 'copy'
							| 'person-add'
							| 'filter-filled'
							| 'wand'
							| 'debug-line-by-line'
							| 'inspect'
							| 'layers'
							| 'layers-dot'
							| 'layers-active'
							| 'compass'
							| 'compass-dot'
							| 'compass-active'
							| 'azure'
							| 'issue-draft'
							| 'git-pull-request-closed'
							| 'git-pull-request-draft'
							| 'debug-all'
							| 'debug-coverage'
							| 'run-errors'
							| 'folder-library'
							| 'debug-continue-small'
							| 'beaker-stop'
							| 'graph-line'
							| 'graph-scatter'
							| 'pie-chart'
							| 'bracket'
							| 'bracket-dot'
							| 'bracket-error'
							| 'lock-small'
							| 'azure-devops'
							| 'verified-filled'
							| 'newline'
							| 'layout'
							| 'layout-activitybar-left'
							| 'layout-activitybar-right'
							| 'layout-panel-left'
							| 'layout-panel-center'
							| 'layout-panel-justify'
							| 'layout-panel-right'
							| 'layout-panel'
							| 'layout-sidebar-left'
							| 'layout-sidebar-right'
							| 'layout-statusbar'
							| 'layout-menubar'
							| 'layout-centered'
							| 'target'
							| 'indent'
							| 'record-small'
							| 'error-small'
							| 'terminal-decoration-error'
							| 'arrow-circle-down'
							| 'arrow-circle-left'
							| 'arrow-circle-right'
							| 'arrow-circle-up'
							| 'layout-sidebar-right-off'
							| 'layout-panel-off'
							| 'layout-sidebar-left-off'
							| 'blank'
							| 'heart-filled'
							| 'map'
							| 'map-horizontal'
							| 'fold-horizontal'
							| 'map-filled'
							| 'map-horizontal-filled'
							| 'fold-horizontal-filled'
							| 'circle-small'
							| 'bell-slash'
							| 'bell-slash-dot'
							| 'comment-unresolved'
							| 'git-pull-request-go-to-changes'
							| 'git-pull-request-new-changes'
							| 'search-fuzzy'
							| 'comment-draft'
							| 'send'
							| 'sparkle'
							| 'insert'
							| 'mic'
							| 'thumbsdown-filled'
							| 'thumbsup-filled'
							| 'coffee'
							| 'snake'
							| 'game'
							| 'vr'
							| 'chip'
							| 'piano'
							| 'music'
							| 'mic-filled'
							| 'repo-fetch'
							| 'copilot'
							| 'lightbulb-sparkle'
							| 'robot'
							| 'sparkle-filled'
							| 'diff-single'
							| 'diff-multiple'
							| 'surround-with'
							| 'share'
							| 'git-stash'
							| 'git-stash-apply'
							| 'git-stash-pop'
							| 'vscode'
							| 'vscode-insiders'
							| 'code-oss'
							| 'run-coverage'
							| 'run-all-coverage'
							| 'coverage'
							| 'github-project'
							| 'map-vertical'
							| 'fold-vertical'
							| 'map-vertical-filled'
							| 'fold-vertical-filled'
							| 'go-to-search'
							| 'percentage'
							| 'sort-percentage'
							| 'attach'
							| 'dialog-error'
							| 'dialog-warning'
							| 'dialog-info'
							| 'dialog-close'
							| 'tree-item-expanded'
							| 'tree-filter-on-type-on'
							| 'tree-filter-on-type-off'
							| 'tree-filter-clear'
							| 'tree-item-loading'
							| 'menu-selection'
							| 'menu-submenu'
							| 'menubar-more'
							| 'scrollbar-button-left'
							| 'scrollbar-button-right'
							| 'scrollbar-button-up'
							| 'scrollbar-button-down'
							| 'toolbar-more'
							| 'quick-input-back'
							| 'drop-down-button'
							| 'symbol-customcolor'
							| 'workspace-unspecified'
							| 'git-fetch'
							| 'lightbulb-sparkle-autofix'
							| 'debug-breakpoint-pending'
							| 'widget-close'
							| 'goto-previous-location'
							| 'goto-next-location'
							| 'diff-review-insert'
							| 'diff-review-remove'
							| 'diff-review-close'
							| 'hover-increase-verbosity'
							| 'hover-decrease-verbosity'
							| 'parameter-hints-next'
							| 'parameter-hints-previous'
							| 'suggest-more-info'
							| 'diff-insert'
							| 'diff-remove'
							| 'gutter-lightbulb'
							| 'gutter-lightbulb-auto-fix'
							| 'gutter-lightbulb-sparkle'
							| 'gutter-lightbulb-aifix-auto-fix'
							| 'gutter-lightbulb-sparkle-filled'
							| 'folding-expanded'
							| 'folding-collapsed'
							| 'folding-manual-collapsed'
							| 'folding-manual-expanded'
							| 'find-collapsed'
							| 'find-expanded'
							| 'find-selection'
							| 'find-replace'
							| 'find-replace-all'
							| 'find-previous-match'
							| 'find-next-match'
							| 'marker-navigation-next'
							| 'marker-navigation-previous'
							| 'inline-suggestion-hints-next'
							| 'inline-suggestion-hints-previous'
							| 'extensions-warning-message'
							| 'notifications-clear'
							| 'notifications-clear-all'
							| 'notifications-hide'
							| 'notifications-expand'
							| 'notifications-collapse'
							| 'notifications-configure'
							| 'notifications-do-not-disturb'
							| 'default-view-icon'
							| 'chat-editor-label-icon'
							| 'review-comment-collapse'
							| 'debug-console-view-icon'
							| 'run-view-icon'
							| 'variables-view-icon'
							| 'watch-view-icon'
							| 'callstack-view-icon'
							| 'breakpoints-view-icon'
							| 'loaded-scripts-view-icon'
							| 'debug-gripper'
							| 'debug-run'
							| 'debug-configure'
							| 'debug-remove-config'
							| 'debug-collapse-all'
							| 'callstack-view-session'
							| 'debug-console-clear-all'
							| 'watch-expressions-remove-all'
							| 'watch-expression-remove'
							| 'watch-expressions-add'
							| 'watch-expressions-add-function-breakpoint'
							| 'watch-expressions-add-data-breakpoint'
							| 'breakpoints-remove-all'
							| 'breakpoints-activate'
							| 'debug-console-evaluation-input'
							| 'debug-console-evaluation-prompt'
							| 'debug-inspect-memory'
							| 'disassembly-editor-label-icon'
							| 'edit-sessions-view-icon'
							| 'extensions-view-icon'
							| 'extensions-manage'
							| 'extensions-clear-search-results'
							| 'extensions-refresh'
							| 'extensions-filter'
							| 'extensions-install-local-in-remote'
							| 'extensions-install-workspace-recommended'
							| 'extensions-configure-recommended'
							| 'extensions-sync-enabled'
							| 'extensions-sync-ignored'
							| 'extensions-remote'
							| 'extensions-install-count'
							| 'extensions-rating'
							| 'extensions-verified-publisher'
							| 'extensions-pre-release'
							| 'extensions-sponsor'
							| 'extensions-star-full'
							| 'extensions-star-half'
							| 'extensions-star-empty'
							| 'extensions-error-message'
							| 'extensions-info-message'
							| 'extension-workspace-trust'
							| 'extension-activation-time'
							| 'extensions-editor-label-icon'
							| 'runtime-extensions-editor-label-icon'
							| 'localHistory-icon'
							| 'localHistory-restore'
							| 'multi-diff-editor-label-icon'
							| 'notebook-kernel-select'
							| 'notebook-execute'
							| 'notebook-config'
							| 'notebook-execute-above'
							| 'notebook-execute-below'
							| 'notebook-stop'
							| 'notebook-delete-cell'
							| 'notebook-execute-all'
							| 'notebook-edit'
							| 'notebook-stop-edit'
							| 'notebook-move-up'
							| 'notebook-move-down'
							| 'notebook-clear'
							| 'notebook-split-cell'
							| 'notebook-state-success'
							| 'notebook-state-error'
							| 'notebook-state-pending'
							| 'notebook-state-executing'
							| 'notebook-collapsed'
							| 'notebook-expanded'
							| 'notebook-open-as-text'
							| 'notebook-revert'
							| 'notebook-render-output'
							| 'notebook-mimetype'
							| 'notebook-copy'
							| 'notebook-diff-editor-previous-change'
							| 'notebook-diff-editor-next-change'
							| 'settings-folder-dropdown'
							| 'settings-more-action'
							| 'keybindings-record-keys'
							| 'keybindings-sort'
							| 'keybindings-edit'
							| 'keybindings-add'
							| 'settings-edit'
							| 'settings-remove'
							| 'settings-discard'
							| 'preferences-clear-input'
							| 'preferences-filter'
							| 'preferences-open-settings'
							| 'remote-explorer-get-started'
							| 'remote-explorer-documentation'
							| 'remote-explorer-feedback'
							| 'remote-explorer-review-issues'
							| 'remote-explorer-report-issues'
							| 'remote-explorer-view-icon'
							| 'ports-view-icon'
							| 'private-ports-view-icon'
							| 'ports-forward-icon'
							| 'ports-stop-forward-icon'
							| 'ports-open-browser-icon'
							| 'ports-open-preview-icon'
							| 'ports-copy-address-icon'
							| 'ports-label-icon'
							| 'ports-forwarded-without-process-icon'
							| 'ports-forwarded-with-process-icon'
							| 'search-details'
							| 'search-see-more'
							| 'search-show-context'
							| 'search-hide-replace'
							| 'search-show-replace'
							| 'search-replace-all'
							| 'search-replace'
							| 'search-remove'
							| 'search-refresh'
							| 'search-collapse-results'
							| 'search-expand-results'
							| 'search-tree'
							| 'search-list'
							| 'search-clear-results'
							| 'search-view-icon'
							| 'search-new-editor'
							| 'search-open-in-file'
							| 'search-sparkle-filled'
							| 'search-sparkle-empty'
							| 'terminal-view-icon'
							| 'terminal-rename'
							| 'terminal-kill'
							| 'terminal-new'
							| 'terminal-configure-profile'
							| 'terminal-command-history-remove'
							| 'terminal-command-history-output'
							| 'terminal-command-history-fuzzy-search'
							| 'test-view-icon'
							| 'test-results-icon'
							| 'testing-run-icon'
							| 'testing-rerun-icon'
							| 'testing-run-all-icon'
							| 'testing-debug-all-icon'
							| 'testing-debug-icon'
							| 'testing-coverage-icon'
							| 'testing-coverage-all-icon'
							| 'testing-cancel-icon'
							| 'testing-filter'
							| 'testing-hidden'
							| 'testing-show-as-list-icon'
							| 'testing-update-profiles'
							| 'testing-refresh-tests'
							| 'testing-turn-continuous-run-on'
							| 'testing-turn-continuous-run-off'
							| 'testing-continuous-is-on'
							| 'testing-cancel-refresh-tests'
							| 'testing-coverage'
							| 'testing-was-covered'
							| 'testing-missing-branch'
							| 'testing-error-icon'
							| 'testing-failed-icon'
							| 'testing-passed-icon'
							| 'testing-queued-icon'
							| 'testing-skipped-icon'
							| 'testing-unset-icon'
							| 'getting-started-step-unchecked'
							| 'getting-started-step-checked'
							| 'callhierarchy-incoming'
							| 'callhierarchy-outgoing'
							| 'markers-view-multi-line-expanded'
							| 'markers-view-multi-line-collapsed'
							| 'tasks-list-configure'
							| 'tasks-remove'
							| 'find-filter'
							| 'auxiliarybar-right-layout-icon'
							| 'auxiliarybar-right-off-layout-icon'
							| 'auxiliarybar-left-layout-icon'
							| 'auxiliarybar-left-off-layout-icon'
							| 'keybindings-editor-label-icon'
							| 'settings-editor-label-icon'
							| 'breadcrumb-separator'
							| 'getting-started-setup'
							| 'getting-started-beginner'
							| 'theme-selection-manage-extension'
							| 'defaultProfile-icon'
							| 'settings-view-bar-icon'
							| 'settings-sync-view-icon'
							| 'panel-maximize'
							| 'panel-restore'
							| 'panel-close'
							| 'panel-layout-icon'
							| 'panel-layout-icon-off'
							| 'menuBar'
							| 'activity-bar-left'
							| 'activity-bar-right'
							| 'panel-left'
							| 'panel-left-off'
							| 'panel-right'
							| 'panel-right-off'
							| 'panel-bottom'
							| 'statusBar'
							| 'panel-align-left'
							| 'panel-align-right'
							| 'panel-align-center'
							| 'panel-align-justify'
							| 'fullscreen'
							| 'centerLayoutIcon'
							| 'zenMode'
							| 'configure-layout-icon'
							| 'view-pane-container-expanded'
							| 'view-pane-container-collapsed'
							| 'timeline-refresh'
							| 'timeline-pin'
							| 'timeline-unpin'
							| 'diff-editor-previous-change'
							| 'diff-editor-next-change'
							| 'diff-editor-toggle-whitespace'
							| 'workspace-trust-editor-label-icon'
							| 'accounts-view-bar-icon'
							| 'comments-view-icon'
							| 'refactor-preview-view-icon'
							| 'explorer-view-icon'
							| 'open-editors-view-icon'
							| 'markers-view-icon'
							| 'outline-view-icon'
							| 'output-view-icon'
							| 'source-control-view-icon'
							| 'timeline-view-icon'
							| 'timeline-open'
							| 'timeline-filter'
							| 'start-inline-chat'
							| 'search-editor-label-icon'
							| 'workspace-trust-banner'
							| 'workspace-trust-editor-check'
							| 'workspace-trust-editor-cross'
							| 'workspace-trust-editor-folder-picker'
							| 'workspace-trust-editor-edit-folder'
							| 'workspace-trust-editor-remove-folder'
							| 'gitlens-commit-horizontal'
							| 'gitlens-graph'
							| 'gitlens-next-commit'
							| 'gitlens-prev-commit-menu'
							| 'gitlens-prev-commit'
							| 'gitlens-compare-ref-working'
							| 'gitlens-branches-view'
							| 'gitlens-commit-view'
							| 'gitlens-commits-view'
							| 'gitlens-compare-view'
							| 'gitlens-contributors-view'
							| 'gitlens-history-view'
							| 'gitlens-history'
							| 'gitlens-remotes-view'
							| 'gitlens-repositories-view'
							| 'gitlens-search-view'
							| 'gitlens-stashes-view'
							| 'gitlens-stashes'
							| 'gitlens-tags-view'
							| 'gitlens-worktrees-view'
							| 'gitlens-gitlens'
							| 'gitlens-stash-pop'
							| 'gitlens-stash-save'
							| 'gitlens-unplug'
							| 'gitlens-open-revision'
							| 'gitlens-switch'
							| 'gitlens-expand'
							| 'gitlens-list-auto'
							| 'gitlens-repo-force-push'
							| 'gitlens-pinned-filled'
							| 'gitlens-clock'
							| 'gitlens-provider-azdo'
							| 'gitlens-provider-bitbucket'
							| 'gitlens-provider-gerrit'
							| 'gitlens-provider-gitea'
							| 'gitlens-provider-github'
							| 'gitlens-provider-gitlab'
							| 'gitlens-gitlens-inspect'
							| 'gitlens-workspaces-view'
							| 'gitlens-confirm-checked'
							| 'gitlens-confirm-unchecked'
							| 'gitlens-cloud-patch'
							| 'gitlens-cloud-patch-share'
							| 'gitlens-inspect'
							| 'gitlens-repository-filled'
							| 'gitlens-gitlens-filled'
							| 'gitlens-code-suggestion'
							| 'gitlens-diff-multiple'
							| 'gitlens-diff-single'
							| 'gitlens-repo-fetch'
							| 'gitlens-repo-pull'
							| 'gitlens-repo-push'
							| 'gitlens-provider-jira'
							| 'bg-leftup'
							| 'bg-leftdown'
							| 'bg-rightup'
							| 'bg-rightdown'
							| 'xo-logo'
					  )
					| {
							/**
							 * The path of the icon font that defines the icon.
							 */
							fontPath: string;
							/**
							 * The character for the icon in the icon font.
							 */
							fontCharacter: string;
							[k: string]: unknown;
					  };
				[k: string]: unknown;
			}
		>;
		/**
		 * Contributes semantic token types.
		 */
		semanticTokenTypes?: Array<{
			/**
			 * The identifier of the semantic token type
			 */
			id?: string;
			/**
			 * The super type of the semantic token type
			 */
			superType?: string;
			/**
			 * The description of the semantic token type
			 */
			description?: string;
			[k: string]: unknown;
		}>;
		/**
		 * Contributes semantic token modifiers.
		 */
		semanticTokenModifiers?: Array<{
			/**
			 * The identifier of the semantic token modifier
			 */
			id?: string;
			/**
			 * The description of the semantic token modifier
			 */
			description?: Record<string, unknown>;
			[k: string]: unknown;
		}>;
		/**
		 * Contributes semantic token scope maps.
		 */
		semanticTokenScopes?: Array<{
			/**
			 * Lists the languge for which the defaults are.
			 */
			language?: string;
			/**
			 * Maps a semantic token (described by semantic token selector) to one or more textMate scopes used to represent that token.
			 */
			scopes?: Record<string, string[]>;
			[k: string]: unknown;
		}>;
		/**
		 * Contributes textmate color themes.
		 */
		themes?: Array<{
			/**
			 * Id of the color theme as used in the user settings.
			 */
			id?: string;
			/**
			 * Label of the color theme as shown in the UI.
			 */
			label?: string;
			/**
			 * Base theme defining the colors around the editor: 'vs' is the light color theme, 'vs-dark' is the dark color theme. 'hc-black' is the dark high contrast theme, 'hc-light' is the light high contrast theme.
			 */
			uiTheme: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
			/**
			 * Path of the tmTheme file. The path is relative to the extension folder and is typically './colorthemes/awesome-color-theme.json'.
			 */
			path: string;
			[k: string]: unknown;
		}>;
		/**
		 * Contributes file icon themes.
		 */
		iconThemes?: Array<{
			/**
			 * Id of the file icon theme as used in the user settings.
			 */
			id: string;
			/**
			 * Label of the file icon theme as shown in the UI.
			 */
			label?: string;
			/**
			 * Path of the file icon theme definition file. The path is relative to the extension folder and is typically './fileicons/awesome-icon-theme.json'.
			 */
			path: string;
			[k: string]: unknown;
		}>;
		/**
		 * Contributes product icon themes.
		 */
		productIconThemes?: Array<{
			/**
			 * Id of the product icon theme as used in the user settings.
			 */
			id: string;
			/**
			 * Label of the product icon theme as shown in the UI.
			 */
			label?: string;
			/**
			 * Path of the product icon theme definition file. The path is relative to the extension folder and is typically './producticons/awesome-product-icon-theme.json'.
			 */
			path: string;
			[k: string]: unknown;
		}>;
		/**
		 * Contributes snippets.
		 */
		snippets?: Array<{
			/**
			 * Language identifier for which this snippet is contributed to.
			 */
			language?: string;
			/**
			 * Path of the snippets file. The path is relative to the extension folder and typically starts with './snippets/'.
			 */
			path?: string;
			[k: string]: unknown;
		}>;
		/**
		 * Contributes keybindings.
		 */
		keybindings?: Keybind | Keybind[];
		/**
		 * Contributes views containers to the editor
		 */
		viewsContainers?: {
			/**
			 * Contribute views containers to Activity Bar
			 */
			activitybar?: ViewContainer[];
			/**
			 * Contribute views containers to Panel
			 */
			panel?: ViewContainer[];
			[k: string]: unknown;
		};
		/**
		 * Contributes views to the editor
		 */
		views?: {
			/**
			 * Contributes views to Explorer container in the Activity bar
			 */
			explorer?: View[];
			/**
			 * Contributes views to Debug container in the Activity bar
			 */
			debug?: View[];
			/**
			 * Contributes views to SCM container in the Activity bar
			 */
			scm?: View[];
			/**
			 * Contributes views to Test container in the Activity bar
			 */
			test?: View[];
			/**
			 * Contributes views to Remote container in the Activity bar. To contribute to this container, enableProposedApi needs to be turned on
			 */
			remote?: Array<{
				/**
				 * Identifier of the view. This should be unique across all views. It is recommended to include your extension id as part of the view id. Use this to register a data provider through `vscode.window.registerTreeDataProviderForView` API. Also to trigger activating your extension by registering `onView:${id}` event to `activationEvents`.
				 */
				id: string;
				/**
				 * The human-readable name of the view. Will be shown
				 */
				name: string;
				/**
				 * Condition which must be true to show this view
				 */
				when?: string;
				/**
				 * Nested group in the viewlet
				 */
				group?: string;
				/**
				 * The name of the remote type associated with this view
				 */
				remoteName?: string | string[];
				[k: string]: unknown;
			}>;
			/**
			 * Contributes views to contributed views container
			 */
			[k: string]: unknown;
		};
		/**
		 * Contributes options for continuing the current edit session in a different environment
		 */
		continueEditSession?: Array<{
			/**
			 * Identifier of the command to execute. The command must be declared in the 'commands'-section and return a URI representing a different environment where the current edit session can be continued.
			 */
			command: string;
			/**
			 * Group into which this item belongs.
			 */
			group?: string;
			/**
			 * A fully qualified name for this item which is used for display in menus.
			 */
			qualifiedName?: string;
			/**
			 * The url, or a command that returns the url, to the option's documentation page.
			 */
			description?: string;
			/**
			 * Group into which this item belongs in the remote indicator.
			 */
			remoteGroup?: string;
			/**
			 * Condition which must be true to show this item.
			 */
			when?: string;
			[k: string]: unknown;
		}>;
		/**
		 * Contributes a chat participant
		 */
		chatParticipants?: Array<{
			/**
			 * A unique id for this chat participant.
			 */
			id: string;
			/**
			 * User-facing name for this chat participant. The user will use '@' with this name to invoke the participant. Name must not contain whitespace.
			 */
			name: string;
			fullName?: string;
			/**
			 * A description of this chat participant, shown in the UI.
			 */
			description?: string;
			/**
			 * Whether invoking the command puts the chat into a persistent mode, where the command is automatically added to the chat input for the next message.
			 */
			isSticky?: boolean;
			/**
			 * When the user clicks this participant in `/help`, this text will be submitted to the participant.
			 */
			sampleRequest?: string;
			/**
			 * A condition which must be true to enable this participant.
			 */
			when?: string;
			commands?: Array<{
				/**
				 * A short name by which this command is referred to in the UI, e.g. `fix` or * `explain` for commands that fix an issue or explain code. The name should be unique among the commands provided by this participant.
				 */
				name: string;
				/**
				 * A description of this command.
				 */
				description?: string;
				/**
				 * A condition which must be true to enable this command.
				 */
				when?: string;
				/**
				 * When the user clicks this command in `/help`, this text will be submitted to the participant.
				 */
				sampleRequest?: string;
				/**
				 * Whether invoking the command puts the chat into a persistent mode, where the command is automatically added to the chat input for the next message.
				 */
				isSticky?: boolean;
			}>;
		}>;
		/**
		 * Contributes localizations to the editor
		 */
		localizations?: Array<{
			/**
			 * Id of the language into which the display strings are translated.
			 */
			languageId: string;
			/**
			 * Name of the language in English.
			 */
			languageName?: string;
			/**
			 * Name of the language in contributed language.
			 */
			localizedLanguageName?: string;
			/**
			 * List of translations associated to the language.
			 */
			translations: Array<{
				/**
				 * Id of VS Code or Extension for which this translation is contributed to. Id of VS Code is always `vscode` and of extension should be in format `publisherId.extensionName`.
				 */
				id: string;
				/**
				 * A relative path to a file containing translations for the language.
				 */
				path: string;
				[k: string]: unknown;
			}>;
			[k: string]: unknown;
		}>;
		[k: string]: unknown;
	};
	/**
	 * Sets the extension to be flagged as a Preview in the Marketplace.
	 */
	preview?: boolean;
	enableProposedApi?: boolean;
	enabledApiProposals?: Array<
		| 'activeComment'
		| 'aiRelatedInformation'
		| 'aiTextSearchProvider'
		| 'aiTextSearchProviderNew'
		| 'attributableCoverage'
		| 'authGetSessions'
		| 'authLearnMore'
		| 'authSession'
		| 'canonicalUriProvider'
		| 'chatParticipantAdditions'
		| 'chatParticipantPrivate'
		| 'chatProvider'
		| 'chatTab'
		| 'chatVariableResolver'
		| 'codeActionAI'
		| 'codeActionRanges'
		| 'codiconDecoration'
		| 'commentReactor'
		| 'commentReveal'
		| 'commentThreadApplicability'
		| 'commentingRangeHint'
		| 'commentsDraftState'
		| 'contribAccessibilityHelpContent'
		| 'contribCommentEditorActionsMenu'
		| 'contribCommentPeekContext'
		| 'contribCommentThreadAdditionalMenu'
		| 'contribCommentsViewThreadMenus'
		| 'contribDiffEditorGutterToolBarMenus'
		| 'contribEditSessions'
		| 'contribEditorContentMenu'
		| 'contribIssueReporter'
		| 'contribLabelFormatterWorkspaceTooltip'
		| 'contribMenuBarHome'
		| 'contribMergeEditorMenus'
		| 'contribMultiDiffEditorMenus'
		| 'contribNotebookStaticPreloads'
		| 'contribRemoteHelp'
		| 'contribShareMenu'
		| 'contribSourceControlHistoryItemChangesMenu'
		| 'contribSourceControlHistoryItemGroupMenu'
		| 'contribSourceControlHistoryItemMenu'
		| 'contribSourceControlInputBoxMenu'
		| 'contribSourceControlTitleMenu'
		| 'contribStatusBarItems'
		| 'contribViewsRemote'
		| 'contribViewsWelcome'
		| 'createFileSystemWatcher'
		| 'customEditorMove'
		| 'debugVisualization'
		| 'defaultChatParticipant'
		| 'diffCommand'
		| 'diffContentOptions'
		| 'documentFiltersExclusive'
		| 'documentPaste'
		| 'editSessionIdentityProvider'
		| 'editorHoverVerbosityLevel'
		| 'editorInsets'
		| 'embeddings'
		| 'extensionRuntime'
		| 'extensionsAny'
		| 'externalUriOpener'
		| 'fileComments'
		| 'fileSearchProvider'
		| 'fileSearchProviderNew'
		| 'findFiles2'
		| 'findFiles2New'
		| 'findTextInFiles'
		| 'findTextInFilesNew'
		| 'fsChunks'
		| 'idToken'
		| 'inlineCompletionsAdditions'
		| 'inlineEdit'
		| 'interactive'
		| 'interactiveWindow'
		| 'ipc'
		| 'languageModelSystem'
		| 'languageStatusText'
		| 'lmTools'
		| 'mappedEditsProvider'
		| 'multiDocumentHighlightProvider'
		| 'newSymbolNamesProvider'
		| 'notebookCellExecution'
		| 'notebookCellExecutionState'
		| 'notebookControllerAffinityHidden'
		| 'notebookDeprecated'
		| 'notebookExecution'
		| 'notebookKernelSource'
		| 'notebookLiveShare'
		| 'notebookMessaging'
		| 'notebookMime'
		| 'notebookVariableProvider'
		| 'portsAttributes'
		| 'profileContentHandlers'
		| 'quickDiffProvider'
		| 'quickInputButtonLocation'
		| 'quickPickItemTooltip'
		| 'quickPickSortByLabel'
		| 'resolvers'
		| 'scmActionButton'
		| 'scmHistoryProvider'
		| 'scmMultiDiffEditor'
		| 'scmSelectedProvider'
		| 'scmTextDocument'
		| 'scmValidation'
		| 'shareProvider'
		| 'showLocal'
		| 'speech'
		| 'tabInputMultiDiff'
		| 'tabInputTextMerge'
		| 'taskPresentationGroup'
		| 'telemetry'
		| 'terminalDataWriteEvent'
		| 'terminalDimensions'
		| 'terminalExecuteCommandEvent'
		| 'terminalQuickFixProvider'
		| 'terminalSelection'
		| 'terminalShellIntegration'
		| 'testMessageStackTrace'
		| 'testObserver'
		| 'testRelatedCode'
		| 'textSearchCompleteNew'
		| 'textSearchProvider'
		| 'textSearchProviderNew'
		| 'timeline'
		| 'tokenInformation'
		| 'treeViewActiveItem'
		| 'treeViewMarkdownMessage'
		| 'treeViewReveal'
		| 'tunnelFactory'
		| 'tunnels'
		| 'workspaceTrust'
	>;
	api?: 'none';
	/**
	 * Activation events for the VS Code extension.
	 */
	activationEvents?: string[];
	/**
	 * Array of badges to display in the sidebar of the Marketplace's extension page.
	 */
	badges?: Array<{
		/**
		 * Badge image URL.
		 */
		url: string;
		/**
		 * Badge link.
		 */
		href: string;
		/**
		 * Badge description.
		 */
		description: string;
		[k: string]: unknown;
	}>;
	/**
	 * Controls the Markdown rendering engine used in the Marketplace. Either github (default) or standard.
	 */
	markdown?: 'github' | 'standard';
	/**
	 * Controls the Q&A link in the Marketplace. Set to marketplace to enable the default Marketplace Q & A site. Set to a string to provide the URL of a custom Q & A site. Set to false to disable Q & A altogether.
	 */
	qna?: ('marketplace' | false) | string;
	/**
	 * Dependencies to other extensions. The identifier of an extension is always ${publisher}.${name}. For example: vscode.csharp.
	 */
	extensionDependencies?: string[];
	/**
	 * A set of extensions that can be installed together. The identifier of an extension is always ${publisher}.${name}. For example: vscode.csharp.
	 */
	extensionPack?: string[];
	/**
	 * Define the kind of an extension. `ui` extensions are installed and run on the local machine while `workspace` extensions run on the remote.
	 */
	extensionKind?: Array<'ui' | 'workspace'>;
	/**
	 * Declare the set of supported capabilities by the extension.
	 */
	capabilities?: {
		/**
		 * Declares whether the extension should be enabled in virtual workspaces. A virtual workspace is a workspace which is not backed by any on-disk resources. When false, this extension will be automatically disabled in virtual workspaces. Default is true.
		 */
		virtualWorkspaces?:
			| boolean
			| {
					supported?: 'limited' | true | false;
					description?: string;
					[k: string]: unknown;
			  };
		/**
		 * Declares how the extension should be handled in untrusted workspaces.
		 */
		untrustedWorkspaces?: {
			supported: 'limited' | true | false;
			/**
			 * A list of configuration keys contributed by the extension that should not use workspace values in untrusted workspaces.
			 */
			restrictedConfigurations?: string[];
			description?: string;
			[k: string]: unknown;
		};
		[k: string]: unknown;
	};
	/**
	 * Specify the location from where users can sponsor your extension.
	 */
	sponsor?: {
		/**
		 * URL from where users can sponsor your extension. It must be a valid URL with a HTTP or HTTPS protocol. Example value: https://github.com/sponsors/nvaccess
		 */
		url?: string;
		[k: string]: unknown;
	};
	scripts?: {
		/**
		 * Script executed before the package is published as a VS Code extension.
		 */
		'vscode:prepublish'?: string;
		/**
		 * Uninstall hook for VS Code extension. Script that gets executed when the extension is completely uninstalled from VS Code which is when VS Code is restarted (shutdown and start) after the extension is uninstalled. Only Node scripts are supported.
		 */
		'vscode:uninstall'?: string;
		[k: string]: unknown;
	};
	/**
	 * The path to a 128x128 pixel icon.
	 */
	icon?: string;
	/**
	 * The relative path to a folder containing localization (bundle.l10n.*.json) files. Must be specified if you are using the vscode.l10n API.
	 */
	l10n?: string;
	pricing?: 'Free' | 'Trial';
	[k: string]: unknown;
};

export type Configuration = {
	/**
	 * A title for the current category of settings. This label will be rendered in the Settings editor as a subheading. If the title is the same as the extension display name, then the category will be grouped under the main extension heading.
	 */
	title?: string;
	/**
	 * When specified, gives the order of this category of settings relative to other categories.
	 */
	order?: number;
	/**
	 * Description of the configuration properties.
	 */
	properties?: Record<
		string,
		| {
				$id?: string;
				$schema?: string;
				$ref?: string;
				$comment?: string;
				title?: string;
				description?: string;
				default?: true;
				readOnly?: boolean;
				writeOnly?: boolean;
				examples?: Array<true>;
				multipleOf?: number;
				maximum?: number;
				exclusiveMaximum?: number;
				minimum?: number;
				exclusiveMinimum?: number;
				maxLength?: number;
				minLength?: number;
				pattern?: string;
				additionalItems?: CoreSchemaMetaSchema;
				items?:
					| CoreSchemaMetaSchema
					| [CoreSchemaMetaSchema, ...CoreSchemaMetaSchema[]];
				maxItems?: number;
				minItems?: number;
				uniqueItems?: boolean;
				contains?: CoreSchemaMetaSchema;
				maxProperties?: number;
				minProperties?: number;
				required?: string[];
				additionalProperties?: CoreSchemaMetaSchema;
				definitions?: Record<string, CoreSchemaMetaSchema>;
				properties?: Record<string, CoreSchemaMetaSchema>;
				patternProperties?: Record<string, CoreSchemaMetaSchema>;
				dependencies?: Record<string, CoreSchemaMetaSchema | string[]>;
				propertyNames?: CoreSchemaMetaSchema;
				const?: true;
				enum?: [true, ...unknown[]];
				type?:
					| (
							| 'array'
							| 'boolean'
							| 'integer'
							| 'null'
							| 'number'
							| 'object'
							| 'string'
					  )
					| [
							(
								| 'array'
								| 'boolean'
								| 'integer'
								| 'null'
								| 'number'
								| 'object'
								| 'string'
							),
							...Array<
								| 'array'
								| 'boolean'
								| 'integer'
								| 'null'
								| 'number'
								| 'object'
								| 'string'
							>,
					  ];
				format?: string;
				contentMediaType?: string;
				contentEncoding?: string;
				if?: CoreSchemaMetaSchema;
				then?: CoreSchemaMetaSchema;
				else?: CoreSchemaMetaSchema;
				allOf?: [CoreSchemaMetaSchema, ...CoreSchemaMetaSchema[]];
				anyOf?: [CoreSchemaMetaSchema, ...CoreSchemaMetaSchema[]];
				oneOf?: [CoreSchemaMetaSchema, ...CoreSchemaMetaSchema[]];
				not?: CoreSchemaMetaSchema;
				[k: string]: unknown;
		  }
		| boolean
		| {
				scope?:
					| 'application'
					| 'machine'
					| 'window'
					| 'resource'
					| 'language-overridable'
					| 'machine-overridable';
				/**
				 * Descriptions for enum values
				 */
				enumDescriptions?: string[];
				/**
				 * Descriptions for enum values in the markdown format.
				 */
				markdownEnumDescriptions?: string[];
				enumItemLabels?: string[];
				/**
				 * The description in the markdown format.
				 */
				markdownDescription?: string;
				/**
				 * If set, the property is marked as deprecated and the given message is shown as an explanation.
				 */
				deprecationMessage?: string;
				/**
				 * If set, the property is marked as deprecated and the given message is shown as an explanation in the markdown format.
				 */
				markdownDeprecationMessage?: string;
				/**
				 * When specified, controls the presentation format of the string setting.
				 */
				editPresentation?: 'singlelineText' | 'multilineText';
				/**
				 * When specified, gives the order of this setting relative to other settings within the same category. Settings with an order property will be placed before settings without this property set.
				 */
				order?: number;
				/**
				 * When enabled, Settings Sync will not sync the user value of this configuration by default.
				 */
				ignoreSync?: boolean;
				[k: string]: unknown;
		  }
	>;
	[k: string]: unknown;
};

export type LanguageModel = {
	/**
	 * A globally unique vendor of language models.
	 */
	vendor?: string;
	[k: string]: unknown;
};

export type ThemePath = {
	/**
	 * Icon path when a light theme is used
	 */
	light?: string;
	/**
	 * Icon path when a dark theme is used
	 */
	dark?: string;
	[k: string]: unknown;
};

export type ProblemPattern = {
	/**
	 * The regular expression to find an error, warning or info in the output.
	 */
	regexp?: string;
	/**
	 * Whether the pattern matches a location (file and line) or only a file.
	 */
	kind?: string;
	/**
	 * The match group index of the filename. If omitted 1 is used.
	 */
	file?: number;
	/**
	 * The match group index of the problem's location. Valid location patterns are: (line), (line,column) and (startLine,startColumn,endLine,endColumn). If omitted (line,column) is assumed.
	 */
	location?: number;
	/**
	 * The match group index of the problem's line. Defaults to 2
	 */
	line?: number;
	/**
	 * The match group index of the problem's line character. Defaults to 3
	 */
	column?: number;
	/**
	 * The match group index of the problem's end line. Defaults to undefined
	 */
	endLine?: number;
	/**
	 * The match group index of the problem's end line character. Defaults to undefined
	 */
	endColumn?: number;
	/**
	 * The match group index of the problem's severity. Defaults to undefined
	 */
	severity?: number;
	/**
	 * The match group index of the problem's code. Defaults to undefined
	 */
	code?: number;
	/**
	 * The match group index of the message. If omitted it defaults to 4 if location is specified. Otherwise it defaults to 5.
	 */
	message?: number;
	/**
	 * In a multi line matcher loop indicated whether this pattern is executed in a loop as long as it matches. Can only specified on a last pattern in a multi line pattern.
	 */
	loop?: boolean;
};

export type BackgroundPattern = {
	/**
	 * The regular expression to detect the begin or end of a background task.
	 */
	regexp?: string;
	/**
	 * The match group index of the filename. Can be omitted.
	 */
	file?: number;
};

export type Command = {
	/**
	 * Identifier of the command to execute
	 */
	command: string;
	/**
	 * Title by which the command is represented in the UI
	 */
	title: string;
	shortTitle?: string;
	/**
	 * (Optional) Category string by which the command is grouped in the UI
	 */
	category?: string;
	/**
	 * (Optional) Condition which must be true to enable the command in the UI (menu and keybindings). Does not prevent executing the command by other means, like the `executeCommand`-api.
	 */
	enablement?: string;
	/**
	 * (Optional) Icon which is used to represent the command in the UI. Either a file path, an object with file paths for dark and light themes, or a theme icon references, like `\$(zap)`
	 */
	icon?: string | ThemePath;
	[k: string]: unknown;
};

export type Action = {
	/**
	 * Identifier of the command to execute. The command must be declared in the 'commands'-section
	 */
	command: string;
	/**
	 * Identifier of an alternative command to execute. The command must be declared in the 'commands'-section
	 */
	alt?: string;
	/**
	 * Condition which must be true to show this item
	 */
	when?: string;
	/**
	 * Group into which this item belongs
	 */
	group?: string;
	[k: string]: unknown;
};

export type StatusBarItem = {
	id: string;
	/**
	 * The name of the entry, like 'Python Language Indicator', 'Git Status' etc. Try to keep the length of the name short, yet descriptive enough that users can understand what the status bar item is about.
	 */
	name: string;
	/**
	 * The text to show for the entry. You can embed icons in the text by leveraging the `$(<name>)`-syntax, like 'Hello $(globe)!'
	 */
	text: string;
	/**
	 * The tooltip text for the entry.
	 */
	tooltip?: string;
	/**
	 * The command to execute when the status bar entry is clicked.
	 */
	command?: string;
	/**
	 * The alignment of the status bar entry.
	 */
	alignment: 'left' | 'right';
	/**
	 * The priority of the status bar entry. Higher value means the item should be shown more to the left.
	 */
	priority?: number;
	/**
	 * Defines the role and aria label to be used when the status bar entry is focused.
	 */
	accessibilityInformation?: {
		/**
		 * The role of the status bar entry which defines how a screen reader interacts with it. More about aria roles can be found here https://w3c.github.io/aria/#widget_roles
		 */
		role?: string;
		/**
		 * The aria label of the status bar entry. Defaults to the entry's text.
		 */
		label?: string;
		[k: string]: unknown;
	};
	[k: string]: unknown;
};

export type Keybind = {
	/**
	 * Identifier of the command to run when keybinding is triggered.
	 */
	command?: string;
	/**
	 * Arguments to pass to the command to execute.
	 */
	args?: Record<string, unknown>;
	/**
	 * Key or key sequence (separate keys with plus-sign and sequences with space, e.g. Ctrl+O and Ctrl+L L for a chord).
	 */
	key?: string;
	/**
	 * Mac specific key or key sequence.
	 */
	mac?: string;
	/**
	 * Linux specific key or key sequence.
	 */
	linux?: string;
	/**
	 * Windows specific key or key sequence.
	 */
	win?: string;
	/**
	 * Condition when the key is active.
	 */
	when?: string;
	[k: string]: unknown;
};

export type ViewContainer = {
	/**
	 * Unique id used to identify the container in which views can be contributed using 'views' contribution point
	 */
	id: string;
	/**
	 * Human readable string used to render the container
	 */
	title: string;
	/**
	 * Path to the container icon. Icons are 24x24 centered on a 50x40 block and have a fill color of 'rgb(215, 218, 224)' or '#d7dae0'. It is recommended that icons be in SVG, though any image file type is accepted.
	 */
	icon: string;
	[k: string]: unknown;
};

export type View = {
	type?: 'tree' | 'webview';
	id: string;
	/**
	 * The human-readable name of the view. Will be shown
	 */
	name: string;
	/**
	 * Condition which must be true to show this view
	 */
	when?: string;
	/**
	 * Path to the view icon. View icons are displayed when the name of the view cannot be shown. It is recommended that icons be in SVG, though any image file type is accepted.
	 */
	icon?: string;
	/**
	 * Human-readable context for when the view is moved out of its original location. By default, the view's container name will be used.
	 */
	contextualTitle?: string;
	/**
	 * Initial state of the view when the extension is first installed. Once the user has changed the view state by collapsing, moving, or hiding the view, the initial state will not be used again.
	 */
	visibility?: 'visible' | 'hidden' | 'collapsed';
	/**
	 * The initial size of the view. The size will behave like the css 'flex' property, and will set the initial size when the view is first shown. In the side bar, this is the height of the view. This value is only respected when the same extension owns both the view and the view container.
	 */
	initialSize?: number;
	accessibilityHelpContent?: string;
	[k: string]: unknown;
};
