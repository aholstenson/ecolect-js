import type { ExpressionPart } from './ExpressionPart.js';
import type { ExpressionPartType } from './ExpressionPartType.js';

/**
 * Part within an expression that represents text.
 */
export interface TextPart extends ExpressionPart {
	type: ExpressionPartType.Text;

	value: string;
}
