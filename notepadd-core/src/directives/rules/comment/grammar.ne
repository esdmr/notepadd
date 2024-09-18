@{%
	import {CommentNode} from './rules/comment/ast.ts';
%}

comment ->
	comment_line:+
	{% $(CommentNode) %}

comment_line ->
	%commentLine
	{% nearley.id %}
