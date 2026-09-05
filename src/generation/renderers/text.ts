import { renderer, ValueRenderer } from '../ValueRenderer.js';

/**
 * Write free text as itself.
 *
 * @returns
 *   renderer for free text
 */
export function textRenderer(): ValueRenderer<string> {
	return renderer(value => [ String(value) ]);
}
