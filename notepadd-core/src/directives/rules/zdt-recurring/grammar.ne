@{%
	import {ZdtRecurringNode} from './rules/zdt-recurring/ast.ts';
%}

zdt_recurring ->
	zdt:?
	%every duration
	(%until zdt {% (i) => i[1] %}):?
	{% $(ZdtRecurringNode) %}
