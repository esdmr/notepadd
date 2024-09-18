@{%
	import {InstantRecurringNode} from './rules/instant-recurring/ast.ts';
%}

instant_recurring ->
	instant:?
	%every duration
	(%until instant {% (i) => i[1] %}):?
	{% $(InstantRecurringNode) %}
