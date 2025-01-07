export abstract class SyntaxNode<Children extends readonly any[]> {
	declare private readonly _brand: 'SyntaxNode';
	constructor(protected readonly _children: Children) {}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	toJSON() {
		return {
			_type: this.constructor.name,
			...this,
			_children: undefined,
		};
	}
}

export type ChildNodesOf<T extends SyntaxNode<any>> =
	T extends SyntaxNode<infer T> ? T : never;

export function createPostProcess<Node extends SyntaxNode<any>>(
	Class: new (argument: ChildNodesOf<Node>) => Node,
) {
	return (argument: readonly [...ChildNodesOf<Node>, ...any[]]) =>
		new Class(argument as unknown as ChildNodesOf<Node>);
}
