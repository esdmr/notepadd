@{%
	import {UnsignedIntegerNode} from './rules/integer/unsigned/ast.ts';
%}

unsigned_integer ->
	%digits
	{% $(UnsignedIntegerNode) %}
