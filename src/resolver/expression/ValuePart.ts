import type { ExpressionPart } from './ExpressionPart.js';
import type { ExpressionPartType } from './ExpressionPartType.js';

/**
 * Part within an expression that represents a value.
 */
export interface ValuePart extends ExpressionPart {
	type: ExpressionPartType.Value;

	id: string;

	value: any;
}
