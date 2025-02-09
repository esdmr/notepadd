@{%
	import {createPostProcess as $} from './rules/ast.ts';
%}

at_least_one_ordered_two[X, Y] -> (
	$X $Y:? {% (i) => i %} |
	$Y {% (i) => [undefined, ...i] %}
) {% nearley.id %}

at_least_one_ordered_three[X, Y, Z] -> (
	$X $Y:? $Z:? {% (i) => i %} |
	$Y $Z:? {% (i) => [undefined, ...i] %} |
	$Z {% (i) => [undefined, undefined, ...i] %}
) {% nearley.id %}

@include "rules/directive/grammar.ne"
@include "rules/period-recurring/grammar.ne"
@include "rules/period/grammar.ne"
@include "rules/instant-recurring/grammar.ne"
@include "rules/instant/grammar.ne"
@include "rules/plain-date/grammar.ne"
@include "rules/calendar/grammar.ne"
@include "rules/plain-time/grammar.ne"
@include "rules/time-zone/grammar.ne"
@include "rules/duration/grammar.ne"
@include "rules/string/grammar.ne"
@include "rules/link-target/grammar.ne"
@include "rules/integer/grammar.ne"
@include "rules/number-sign/grammar.ne"
@include "rules/comment/grammar.ne"
