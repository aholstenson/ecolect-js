import { ExpressionPart } from './ExpressionPart';
import { ExpressionPartType } from './ExpressionPartType';

/**
 * Part within an expression that represents text.
 */
export interface TextPart extends ExpressionPart {
	type: ExpressionPartType.Text;

	value: string;
}
