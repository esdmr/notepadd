@{%
	import {PeriodWithDurationNode} from './rules/period/with-duration/ast.ts';
%}

period ->
	period_with_duration
	{% $(PeriodNode) %}

period_with_duration ->
	instant
	%for duration
	{% $(PeriodWithDurationNode) %}
