@{%
	import {EventNode} from './rules/directive/event/ast.ts';
%}

directive ->
	event
	comment:?
	{% $(DirectiveNode) %}

event ->
	%event
	(
		period_recurring {% nearley.id %} |
		period {% nearley.id %}
	)
	{% $(EventNode) %}
