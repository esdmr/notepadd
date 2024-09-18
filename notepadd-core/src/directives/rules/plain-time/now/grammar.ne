@{%
	import {PlainTimeNowNode} from './rules/plain-time/now/ast.ts';
%}

plain_time ->
	plain_time_now
	{% $(PlainTimeNode) %}

plain_time_now ->
	%this %time
	{% $(PlainTimeNowNode) %}
