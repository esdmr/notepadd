@{%
	import {DurationDateNode} from './rules/duration/date/ast.ts';
%}

duration_date ->
	at_least_one_ordered_three[
		signed_integer %years {% nearley.id %},
		signed_integer %months {% nearley.id %},
		signed_integer %days {% nearley.id %}
	]
	{% $(DurationDateNode) %}
