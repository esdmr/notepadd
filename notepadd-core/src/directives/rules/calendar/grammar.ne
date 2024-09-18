@{%
	import {CalendarNode} from './rules/calendar/ast.ts';
%}

calendar ->
	%identifier
	(%dash %identifier {% (i) => i[1] %}):*
	{% $(CalendarNode) %}
