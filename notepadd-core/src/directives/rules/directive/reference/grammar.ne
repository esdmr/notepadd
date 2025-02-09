@{%
	import {ReferenceNode} from './rules/directive/reference/ast.ts';
%}

directive ->
	reference
	comment:?
	{% $(DirectiveNode) %}

reference ->
	%reference
	link_target
	{% $(ReferenceNode) %}
