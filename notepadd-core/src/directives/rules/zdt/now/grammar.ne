@{%
	import {ZdtNowNode} from './rules/zdt/now/ast.ts';
%}

zdt ->
	zdt_now
	{% $(ZdtNode) %}

zdt_now ->
	%now
	time_zone:?
	{% $(ZdtNowNode) %}
