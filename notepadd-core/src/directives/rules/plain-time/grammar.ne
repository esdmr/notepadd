@{%
	import {PlainTimeNode} from './rules/plain-time/ast.ts';
%}

@include "rules/plain-time/literal/grammar.ne"
@include "rules/plain-time/now/grammar.ne"
@include "rules/plain-time/time-of-day/grammar.ne"
