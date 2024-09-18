@{%
	import {TimeZoneOffsetNode} from './rules/time-zone/offset/ast.ts';
%}

time_zone ->
	time_zone_offset
	{% $(TimeZoneNode) %}

time_zone_offset ->
	number_sign
	unsigned_integer %colon
	unsigned_integer
	{% $(TimeZoneOffsetNode) %}
