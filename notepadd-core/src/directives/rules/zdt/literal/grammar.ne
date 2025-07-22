@{%
	import {ZdtLiteralNode} from './rules/zdt/literal/ast.ts';
%}

zdt ->
	zdt_literal
	{% $(ZdtNode) %}

zdt_literal ->
	plain_date
	plain_time
	time_zone:?
	{% $(ZdtLiteralNode) %}
