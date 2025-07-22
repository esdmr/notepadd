@{%
	import {PeriodWithEndNode} from './rules/period/with-end/ast.ts';
%}

period ->
	period_with_end
	{% $(PeriodNode) %}

period_with_end ->
	zdt
	%until zdt
	{% $(PeriodWithEndNode) %}
