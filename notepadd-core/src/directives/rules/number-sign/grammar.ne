@{%
	import {NumberSignNode} from './rules/number-sign/ast.ts';
%}

number_sign ->
	(
		%plus {% nearley.id %} |
		%dash {% nearley.id %}
	)
	{% $(NumberSignNode) %}
