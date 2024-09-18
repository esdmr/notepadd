@{%
	import {PlainDateLiteralNode} from './rules/plain-date/literal/ast.ts';
%}

plain_date ->
	plain_date_literal
	{% $(PlainDateNode) %}

plain_date_literal ->
	(calendar %dash {% nearley.id %}):?
	unsigned_integer %dash
	unsigned_integer %dash
	unsigned_integer
	{% $(PlainDateLiteralNode) %}
