@{%
	import {TimeZoneIdentifierNode} from './rules/time-zone/identifier/ast.ts';
%}

time_zone ->
	time_zone_identifier
	{% $(TimeZoneNode) %}

time_zone_identifier ->
	%timeZoneIdentifier
	{% $(TimeZoneIdentifierNode) %}
