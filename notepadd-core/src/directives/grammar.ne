@{%
	import {lexer} from './lexer.ts';
%}

@preprocessor ts
@lexer lexer
@include "rules/grammar.ne"
