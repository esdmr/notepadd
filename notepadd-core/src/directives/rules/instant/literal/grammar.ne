@{%
	import {InstantLiteralNode} from './rules/instant/literal/ast.ts';
%}

instant ->
	instant_literal
	{% $(InstantNode) %}

instant_literal ->
	plain_date
	plain_time
	time_zone:?
	{% $(InstantLiteralNode) %}
