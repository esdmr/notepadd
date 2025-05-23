import path from 'node:path';
import {ThemeIcon, TreeItem, TreeItemCollapsibleState, type Uri} from 'vscode';
import type {DirectivesSortBy} from '../view/directives.ts';
import type {BridgeFile} from './file.ts';

export class BridgeDirectory extends TreeItem {
	readonly href: string;
	readonly children = new Map<string, BridgeDirectory | BridgeFile>();
	readonly orders = new Map<string, number>();

	constructor(readonly uri: Uri) {
		super(uri, TreeItemCollapsibleState.Expanded);
		this.href = uri.toString(true);
		this.iconPath = ThemeIcon.Folder;
	}

	updateOrder(sortBy: DirectivesSortBy): void {
		switch (sortBy) {
			case 'timeAscending':
			case 'timeDescending': {
				for (const [key, child] of this.children) {
					child.updateOrder(sortBy);

					this.orders.set(key, Math.min(...child.orders.values()));
				}

				break;
			}

			case 'orderAscending':
			case 'orderDescending': {
				const orders = [...this.children].sort(
					([a, x], [b, y]) =>
						Number(y instanceof BridgeDirectory) -
							Number(x instanceof BridgeDirectory) ||
						a.localeCompare(b),
				);

				for (const [order, [key, value]] of orders.entries()) {
					value.updateOrder(sortBy);

					this.orders.set(
						key,
						order * (sortBy === 'orderDescending' ? -1 : 1),
					);
				}

				break;
			}
		}
	}

	getChildren(): Array<BridgeDirectory | BridgeFile> {
		return [...this.children]
			.sort(([a], [b]) => this.orders.get(a)! - this.orders.get(b)!)
			.map(([, v]) => v);
	}
}
