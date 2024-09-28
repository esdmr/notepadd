@{%
	import {DurationDateNode} from './rules/duration/date/ast.ts';
%}

duration_date ->
	at_least_one_ordered_three[
		unsigned_integer %years {% nearley.id %},
		unsigned_integer %months {% nearley.id %},
		unsigned_integer %days {% nearley.id %}
	]
	{% $(DurationDateNode) %}
