import { ExpressionPartType } from './ExpressionPartType';
import { TextPosition } from './TextPosition';

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
