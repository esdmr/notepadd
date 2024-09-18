@{%
	import {PeriodNode} from './rules/period/ast.ts';
%}

@include "rules/period/whole-day/grammar.ne"
@include "rules/period/with-duration/grammar.ne"
@include "rules/period/with-end/grammar.ne"
