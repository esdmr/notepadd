import {ThemeIcon, TreeItem, TreeItemCollapsibleState, Uri} from 'vscode';
import type {DirectivesSortBy} from '../view/directives.ts';
import type {BridgeDirective} from './directive.ts';

export class BridgeFile extends TreeItem {
	readonly href: string;
	readonly children = new Map<string, BridgeDirective>();
	readonly orders = new Map<string, number>();

	constructor(readonly uri: Uri) {
		super(uri, TreeItemCollapsibleState.Expanded);
		this.href = uri.toString(true);
		this.iconPath = ThemeIcon.File;
	}

	updateOrder(sortBy: DirectivesSortBy) {
		for (const [key, child] of this.children) {
			switch (sortBy) {
				case 'timeAscending':
				case 'timeDescending': {
					const order =
						child.lastState?.instance.next?.toInstant()
							.epochMilliseconds ?? -1;

					this.orders.set(
						key,
						order * (sortBy === 'timeDescending' ? -1 : 1),
					);

					break;
				}

				case 'orderAscending':
				case 'orderDescending': {
					const uri = Uri.parse(key, true);

					const order = uri.fragment.startsWith('C')
						? Number.parseInt(uri.fragment.slice(1), 10)
						: -1;

					this.orders.set(
						key,
						order * (sortBy === 'orderDescending' ? -1 : 1),
					);

					break;
				}
			}
		}
	}

	getChildren() {
		return [...this.children]
			.sort(([a], [b]) => this.orders.get(a)! - this.orders.get(b)!)
			.map(([, v]) => v);
	}
}
