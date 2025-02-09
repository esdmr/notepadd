@{%
	import {StringNode} from './rules/string/ast.ts';
%}

string -> %string {% $(StringNode) %}
