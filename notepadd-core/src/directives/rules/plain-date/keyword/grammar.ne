@{%
	import {PlainDateKeywordNode} from './rules/plain-date/keyword/ast.ts';
%}

plain_date ->
	plain_date_keyword
	{% $(PlainDateNode) %}

plain_date_keyword ->
	(
		%today {% nearley.id %} |
		%tomorrow {% nearley.id %}
	)
	{% $(PlainDateKeywordNode) %}
