@{%
	import {AlarmNode} from './rules/directive/alarm/ast.ts';
%}

directive ->
	alarm
	comment:?
	{% $(DirectiveNode) %}

alarm ->
	%alarm
	(
		zdt_recurring {% nearley.id %} |
		zdt {% nearley.id %} |
		duration {% nearley.id %}
	)
	{% $(AlarmNode) %}
