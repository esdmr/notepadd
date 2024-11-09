@{%
	import {TimerNode} from './rules/directive/timer/ast.ts';
%}

directive ->
	timer
	comment:?
	{% $(DirectiveNode) %}

timer ->
	%timer
	duration
	{% $(TimerNode) %}
