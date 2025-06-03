declare module 'icon:*' {
	import type {ThemeIcon} from 'vscode';

	const icon: string | ThemeIcon | {light?: string; dark?: string};
	export default icon;
}
