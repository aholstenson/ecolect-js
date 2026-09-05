import { KnownGraphs } from '../../language/index.js';
import { textsFor } from '../invertGraph.js';
import { renderer, ValueRenderer } from '../ValueRenderer.js';

/**
 * Write a boolean with the words the language has for it, such as `true` or
 * `yes`.
 *
 * @returns
 *   renderer for booleans
 */
export function booleanRenderer(): ValueRenderer<boolean> {
	return renderer((value, context) => {
		const graph = context.language.findGraph(KnownGraphs.Boolean);
		return textsFor(graph, other => other === value);
	});
}
