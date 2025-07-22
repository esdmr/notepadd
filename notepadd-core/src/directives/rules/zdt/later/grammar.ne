@{%
	import {ZdtLaterNode} from './rules/zdt/later/ast.ts';
%}

zdt ->
	zdt_later
	{% $(ZdtNode) %}

zdt_later ->
	plain_time
	time_zone:?
	{% $(ZdtLaterNode) %}
