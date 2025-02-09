@{%
	import {LinkTargetNode} from './rules/link-target/ast.ts';
%}

link_target -> %linkTarget {% $(LinkTargetNode) %}
