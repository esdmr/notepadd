@{%
	import {InstantNowNode} from './rules/instant/now/ast.ts';
%}

instant ->
	instant_now
	{% $(InstantNode) %}

instant_now ->
	%now
	time_zone:?
	{% $(InstantNowNode) %}
