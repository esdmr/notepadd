@{%
	import * as _ from './ast.ts';
	import {lexer} from './lexer.ts';
%}

@preprocessor ts
@lexer lexer

# Macros

at_least_one_ordered_two[X, Y] -> (
	$X $Y:? {% (i) => i.flat() %} |
	$Y {% (i) => [undefined, i[0]].flat() %}
) {% nearley.id %}

at_least_one_ordered_three[X, Y, Z] -> (
	$X $Y:? $Z:? {% (i) => i.flat() %} |
	$Y $Z:? {% (i) => [undefined, i[0]].flat() %} |
	$Z {% (i) => [undefined, undefined, i[0]].flat() %}
) {% nearley.id %}

# Directives

directive -> alarm {% nearley.id %} | timer {% nearley.id %} | event {% nearley.id %}

alarm -> %alarm abs_date_time_maybe_recurring_instant comment:? {% _.builder(_.AlarmNode) %}

timer -> %timer rel_date_time comment:? {% _.builder(_.TimerNode) %}

event -> %event abs_date_time_maybe_recurring_period comment:? {% _.builder(_.EventNode) %}

# Date time

abs_date_time_maybe_recurring_period -> abs_date_time_period %every rel_date_time (
	%until abs_date_time_instant
):? {% _.builder(_.AbsoluteDateTimeRecurringPeriodNode) %}
abs_date_time_maybe_recurring_period -> abs_date_time_period {% nearley.id %}

abs_date_time_period -> abs_date_time_instant %for rel_date_time {%
	_.builder(_.AbsoluteDateTimePeriodWithDurationNode)
%}
abs_date_time_period -> abs_date_time_instant %until abs_date_time_instant {%
	_.builder(_.AbsoluteDateTimePeriodWithEndNode)
%}
abs_date_time_period -> abs_date %whole %days {% _.builder(_.AbsoluteDateTimePeriodWholeDayNode) %}

abs_date_time_maybe_recurring_instant -> abs_date_time_instant:? %every rel_date_time (
	%until abs_date_time_instant
):? {% _.builder(_.AbsoluteDateTimeRecurringInstantNode) %}
abs_date_time_maybe_recurring_instant -> abs_date_time_instant {% nearley.id %}

abs_date_time_instant -> abs_date abs_time {%
	_.builder(_.AbsoluteDateTimeInstantExactNode)
%}
abs_date_time_instant -> abs_time {% _.builder(_.AbsoluteDateTimeInstantContextualNode) %}
abs_date_time_instant -> rel_date_time {%
	_.builder(_.AbsoluteDateTimeInstantContextualNode)
%}
abs_date_time_instant -> %now {% _.builder(_.AbsoluteDateTimeInstantContextualNode) %}

abs_date -> (
	calendar %dash
):? unsigned_integer %dash unsigned_integer %dash unsigned_integer {%
	_.builder(_.AbsoluteDateExactNode)
%}
abs_date -> %today {% _.builder(_.AbsoluteDateContextualNode) %}
abs_date -> %tomorrow {% _.builder(_.AbsoluteDateContextualNode) %}

calendar -> %identifier {% _.builder(_.CalendarNode) %}

abs_time -> unsigned_integer %colon unsigned_integer offset:? {%
	_.builder(_.AbsoluteTimeExactNode)
%}
abs_time -> abs_time_of_day offset:? {% _.builder(_.AbsoluteTimeStaticNode) %}
abs_time -> %this %time {% _.builder(_.AbsoluteTimeContextualNode) %}

abs_time_of_day -> %midnight {% _.builder(_.AbsoluteTimeOfDayNode) %}
abs_time_of_day -> %noon {% _.builder(_.AbsoluteTimeOfDayNode) %}
abs_time_of_day -> %morning {% _.builder(_.AbsoluteTimeOfDayNode) %}
abs_time_of_day -> %afternoon {% _.builder(_.AbsoluteTimeOfDayNode) %}
abs_time_of_day -> %evening {% _.builder(_.AbsoluteTimeOfDayNode) %}

offset -> plus_minus unsigned_integer %colon unsigned_integer {%
	_.builder(_.LocalOffsetNode)
%}
offset -> %z {% _.builder(_.UtcOffsetNode) %}

rel_date_time -> at_least_one_ordered_two[
	rel_date,
	rel_time
] {% _.builder(_.RelativeDateTimeNode) %}

rel_date -> at_least_one_ordered_three[
	signed_integer %years {% (i) => i[0] %},
	signed_integer %months {% (i) => i[0] %},
	signed_integer %days {% (i) => i[0] %}
] {% _.builder(_.RelativeDateNode) %}

rel_time -> at_least_one_ordered_three[
	signed_integer %hours {% (i) => i[0] %},
	signed_integer %minutes {% (i) => i[0] %},
	signed_integer %seconds {% (i) => i[0] %}
] {% _.builder(_.RelativeTimeNode) %}

# Primitives

signed_integer -> plus_minus:? unsigned_integer {% _.builder(_.SignedIntegerNode) %}

plus_minus -> %plus {% nearley.id %}
plus_minus -> %dash {% nearley.id %}

unsigned_integer -> %digits {% _.builder(_.UnsignedIntegerNode) %}

comment -> comment_line:+ {% _.builder(_.CommentNode) %}

comment_line -> %commentLine {% _.builder(_.CommentLineNode) %}
