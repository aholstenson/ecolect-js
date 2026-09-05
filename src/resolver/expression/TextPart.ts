import { ExpressionPart } from './ExpressionPart.js';
import { ExpressionPartType } from './ExpressionPartType.js';

/**
 * Part within an expression that represents text.
 */
export interface TextPart extends ExpressionPart {
	type: ExpressionPartType.Text;

	value: string;
}
