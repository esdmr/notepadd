@{%
	import {DurationTimeNode} from './rules/duration/time/ast.ts';
%}

duration_time ->
	at_least_one_ordered_three[
		unsigned_integer %hours {% nearley.id %},
		unsigned_integer %minutes {% nearley.id %},
		unsigned_integer %seconds {% nearley.id %}
	]
	{% $(DurationTimeNode) %}
