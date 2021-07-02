import { ExpressionPart } from './ExpressionPart';
import { ExpressionPartType } from './ExpressionPartType';

/**
 * Part within an expression that represents a value.
 */
export interface ValuePart extends ExpressionPart {
	type: ExpressionPartType.Value;

	id: string;

	value: any;
}
