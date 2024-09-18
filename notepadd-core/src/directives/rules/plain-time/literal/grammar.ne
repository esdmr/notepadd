@{%
	import {PlainTimeLiteralNode} from './rules/plain-time/literal/ast.ts';
%}

plain_time ->
	plain_time_literal
	{% $(PlainTimeNode) %}

plain_time_literal ->
	unsigned_integer %colon
	unsigned_integer
	{% $(PlainTimeLiteralNode) %}
