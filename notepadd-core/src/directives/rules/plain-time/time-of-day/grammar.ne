@{%
	import {PlainTimeOfDayNode} from './rules/plain-time/time-of-day/ast.ts';
%}

plain_time ->
	plain_time_of_day
	{% $(PlainTimeNode) %}

plain_time_of_day ->
	(
		%midnight {% nearley.id %} |
		%noon {% nearley.id %} |
		%morning {% nearley.id %} |
		%afternoon {% nearley.id %} |
		%evening {% nearley.id %}
	)
	{% $(PlainTimeOfDayNode) %}
