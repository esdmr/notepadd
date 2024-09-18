@{%
	import {PeriodWholeDayNode} from './rules/period/whole-day/ast.ts';
%}

period ->
	period_whole_day
	{% $(PeriodNode) %}

period_whole_day ->
	plain_date
	%whole %days
	time_zone:?
	{% $(PeriodWholeDayNode) %}
