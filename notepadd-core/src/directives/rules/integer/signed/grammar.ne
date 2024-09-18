@{%
	import {SignedIntegerNode} from './rules/integer/signed/ast.ts';
%}

signed_integer ->
	number_sign:?
	unsigned_integer
	{% $(SignedIntegerNode) %}
