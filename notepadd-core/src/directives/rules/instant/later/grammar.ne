@{%
	import {InstantLaterNode} from './rules/instant/later/ast.ts';
%}

instant ->
	instant_later
	{% $(InstantNode) %}

instant_later ->
	plain_time
	time_zone:?
	{% $(InstantLaterNode) %}
