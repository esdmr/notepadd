@{%
	import {PeriodRecurringNode} from './rules/period-recurring/ast.ts';
%}

period_recurring ->
	period
	%every duration
	(%until zdt {% (i) => i[1] %}):?
	{% $(PeriodRecurringNode) %}
