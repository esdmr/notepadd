@{%
	import {TimeZoneNode} from './rules/time-zone/ast.ts';
%}

@include "rules/time-zone/identifier/grammar.ne"
@include "rules/time-zone/offset/grammar.ne"
@include "rules/time-zone/utc/grammar.ne"
