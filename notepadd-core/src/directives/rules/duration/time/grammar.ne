@{%
	import {DurationTimeNode} from './rules/duration/time/ast.ts';
%}

duration_time ->
	at_least_one_ordered_three[
		signed_integer %hours {% nearley.id %},
		signed_integer %minutes {% nearley.id %},
		signed_integer %seconds {% nearley.id %}
	]
	{% $(DurationTimeNode) %}
