@{%
	import * as _ from './ast.ts';
	import {createPostProcess as $} from './ast.ts';
	import {lexer} from './lexer.ts';
%}

@preprocessor ts
@lexer lexer

# Macros

at_least_one_ordered_two[X, Y] -> (
	$X $Y:? {% (i) => i %} |
	$Y {% (i) => [undefined, ...i] %}
) {% nearley.id %}

at_least_one_ordered_three[X, Y, Z] -> (
	$X $Y:? $Z:? {% (i) => i %} |
	$Y $Z:? {% (i) => [undefined, ...i] %} |
	$Z {% (i) => [undefined, undefined, ...i] %}
) {% nearley.id %}

# Directives

directive ->
	(
		alarm {% nearley.id %} |
		timer {% nearley.id %} |
		event {% nearley.id %}
	)
	{% $(_.DirectiveNode) %}

alarm ->
	%alarm
	(
		instant_recurring {% nearley.id %} |
		instant {% nearley.id %} |
		duration {% nearley.id %}
	)
	comment:?
	{% $(_.AlarmNode) %}

timer ->
	%timer
	duration
	comment:?
	{% $(_.TimerNode) %}

event ->
	%event
	(
		period_recurring {% nearley.id %} |
		period {% nearley.id %}
	)
	comment:?
	{% $(_.EventNode) %}

# Date time

period_recurring ->
	period
	%every duration
	(%until instant {% (i) => i[1] %}):?
	{% $(_.PeriodRecurringNode) %}

period ->
	(
		period_with_duration {% nearley.id %} |
		period_with_end {% nearley.id %} |
		period_whole_day {% nearley.id %}
	)
	{% $(_.PeriodNode) %}

period_with_duration ->
	instant
	%for duration
	{% $(_.PeriodWithDurationNode) %}

period_with_end ->
	instant
	%until instant
	{% $(_.PeriodWithEndNode) %}

period_whole_day ->
	plain_date
	%whole %days
	time_zone:?
	{% $(_.PeriodWholeDayNode) %}

instant_recurring ->
	instant:?
	%every duration
	(%until instant {% (i) => i[1] %}):?
	{% $(_.InstantRecurringNode) %}

instant ->
	(
		instant_literal {% nearley.id %} |
		instant_later {% nearley.id %} |
		instant_now {% nearley.id %}
	)
	{% $(_.InstantNode) %}

instant_literal ->
	plain_date
	plain_time
	time_zone:?
	{% $(_.InstantLiteralNode) %}

instant_later ->
	plain_time
	time_zone:?
	{% $(_.InstantLaterNode) %}

instant_now ->
	%now
	time_zone:?
	{% $(_.InstantNowNode) %}

plain_date ->
	(
		plain_date_literal {% nearley.id %} |
		plain_date_keyword {% nearley.id %}
	)
	{% $(_.PlainDateNode) %}

plain_date_literal ->
	(calendar %dash {% nearley.id %}):?
	unsigned_integer %dash
	unsigned_integer %dash
	unsigned_integer
	{% $(_.PlainDateLiteralNode) %}

plain_date_keyword ->
	(
		%today {% nearley.id %} |
		%tomorrow {% nearley.id %}
	)
	{% $(_.PlainDateKeywordNode) %}

calendar ->
	%identifier
	(%dash %identifier {% (i) => i[1] %}):*
	{% $(_.CalendarNode) %}

plain_time ->
	(
		plain_time_literal {% nearley.id %} |
		plain_time_of_day {% nearley.id %} |
		plain_time_now {% nearley.id %}
	)
	{% $(_.PlainTimeNode) %}

plain_time_literal ->
	unsigned_integer %colon
	unsigned_integer
	{% $(_.PlainTimeLiteralNode) %}

plain_time_of_day ->
	(
		%midnight {% nearley.id %} |
		%noon {% nearley.id %} |
		%morning {% nearley.id %} |
		%afternoon {% nearley.id %} |
		%evening {% nearley.id %}
	)
	{% $(_.PlainTimeOfDayNode) %}

plain_time_now ->
	%this %time
	{% $(_.PlainTimeNowNode) %}

time_zone ->
	(
		time_zone_identifier {% nearley.id %} |
		offset {% nearley.id %}
	)
	{% $(_.TimeZoneNode) %}

time_zone_identifier ->
	%timeZoneIdentifier
	{% $(_.TimeZoneIdentifierNode) %}

offset ->
	(
		offset_local {% nearley.id %} |
		offset_utc {% nearley.id %}
	)
	{% $(_.OffsetNode) %}

offset_local ->
	number_sign
	unsigned_integer %colon
	unsigned_integer
	{% $(_.OffsetLocalNode) %}

offset_utc ->
	%z
	{% $(_.OffsetUtcNode) %}

duration ->
	at_least_one_ordered_two[
		duration_date {% nearley.id %},
		duration_time {% nearley.id %}
	]
	{% $(_.DurationNode) %}

duration_date ->
	at_least_one_ordered_three[
		signed_integer %years {% nearley.id %},
		signed_integer %months {% nearley.id %},
		signed_integer %days {% nearley.id %}
	]
	{% $(_.DurationDateNode) %}

duration_time ->
	at_least_one_ordered_three[
		signed_integer %hours {% nearley.id %},
		signed_integer %minutes {% nearley.id %},
		signed_integer %seconds {% nearley.id %}
	]
	{% $(_.DurationTimeNode) %}

# Primitives

signed_integer ->
	number_sign:?
	unsigned_integer
	{% $(_.SignedIntegerNode) %}

number_sign ->
	(
		%plus {% nearley.id %} |
		%dash {% nearley.id %}
	)
	{% $(_.NumberSignNode) %}

unsigned_integer ->
	%digits
	{% $(_.UnsignedIntegerNode) %}

comment ->
	comment_line:+
	{% $(_.CommentNode) %}

comment_line ->
	%commentLine
	{% $(_.CommentLineNode) %}
