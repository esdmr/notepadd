@{%
	import {TimeZoneUtcNode} from './rules/time-zone/utc/ast.ts';
%}

time_zone ->
	time_zone_utc
	{% $(TimeZoneNode) %}

time_zone_utc ->
	%z
	{% $(TimeZoneUtcNode) %}
