import type { ExpressionPartType } from './ExpressionPartType.js';
import type { TextPosition } from './TextPosition.js';

export interface ExpressionPart {
	/**
	 * Type of the part.
	 */
	type: ExpressionPartType;

	/**
	 * The location of this part within the source text.
	 */
	source: TextPosition;
}
