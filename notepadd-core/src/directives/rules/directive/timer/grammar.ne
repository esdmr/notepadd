@{%
	import {TimerNode} from './rules/directive/timer/ast.ts';
%}

directive ->
	timer
	{% $(DirectiveNode) %}

timer ->
	%timer
	duration
	comment:?
	{% $(TimerNode) %}
