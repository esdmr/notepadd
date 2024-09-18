@{%
	import {DurationNode} from './rules/duration/ast.ts';
%}

duration ->
	at_least_one_ordered_two[
		duration_date {% nearley.id %},
		duration_time {% nearley.id %}
	]
	{% $(DurationNode) %}

@include "rules/duration/date/grammar.ne"
@include "rules/duration/time/grammar.ne"
