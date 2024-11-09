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
		instant_recurring {% nearley.id %} |
		instant {% nearley.id %} |
		duration {% nearley.id %}
	)
	{% $(AlarmNode) %}
