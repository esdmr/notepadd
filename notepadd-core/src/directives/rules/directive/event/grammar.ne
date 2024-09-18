@{%
	import {EventNode} from './rules/directive/event/ast.ts';
%}

directive ->
	event
	{% $(DirectiveNode) %}

event ->
	%event
	(
		period_recurring {% nearley.id %} |
		period {% nearley.id %}
	)
	comment:?
	{% $(EventNode) %}
