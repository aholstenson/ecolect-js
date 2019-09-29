import { TokenNode } from '../graph/TokenNode';
import { SubNode } from '../graph/SubNode';
import { ValueNode } from './ValueNode';
import { ValueParserNode } from './ValueParserNode';
import { Encounter } from '../graph/matching';
import { ExpressionPart } from './expression/ExpressionPart';
import { ExpressionPartType } from './expression/ExpressionPartType';
import { TextPart } from './expression/TextPart';
import { ValuePart } from './expression/ValuePart';
import { ResolvedIntent } from './ResolvedIntent';

/**
 * Refresh the expression by copying back values from the matches into the
 * expression and sub-expressions.
 */
export function refresh(v: ResolvedIntent) {
	for(const e of v.expression) {
		if(e.type === ExpressionPartType.Value) {
			const part: ValuePart = e as ValuePart;
			part.value = v.values.get(part.id);

			if(part.value && part.value.expression) {
				// The value has an expression - refresh it
				refresh(part.value);
			} else if(Array.isArray(part.value)) {
				// The value is an array, check if entries have expressions
				for(const e0 of part.value) {
					if(e0.expression) {
						refresh(e0);
					}
				}
			}
		}
	}
}

/**
 * Describe the expression for the given encounter.
 */
export function describe(encounter: Encounter): ExpressionPart[] {
	// Partial matching so expose the full expression that would match
	const path: (TextPart | ValuePart)[] = [];
	const text: string[] = [];

	const nodes = encounter.currentNodes;
	const tokens = encounter.currentTokens;

	const toPos = (c: number | null, p: number) => {
		if(c == null) c = encounter.currentIndex;
		let start = -1;
		let end = -1;
		for(let i=p; i<c; i++) {
			const t = encounter.tokens[i];
			if(! t) continue;

			if(start === -1) start = t.start;

			end = t.stop;
		}
		return {
			start: start,
			end: end
		};
	};

	/*
	 * Scan backward to find the SubNode (if any) that has requested
	 * this expression.
	 */
	let tokenStart = 0;
	for(let i=nodes.length-3 /* collector -> sub */; i>=0; i--) {
		if(nodes[i] instanceof SubNode) {
			tokenStart = i + 1;
			break;
		}
	}

	let startToken = tokens[tokenStart];
	for(let i=tokenStart; i<nodes.length; i++) {
		const node = nodes[i];

		if(node instanceof TokenNode) {
			text.push(node.token.raw);
		} else if(node instanceof ValueNode || node instanceof ValueParserNode) {
			if(text.length > 0) {
				path.push({
					type: ExpressionPartType.Text,
					value: text.join(' '),

					source: toPos(tokens[i], startToken)
				});

				text.length = 0;
			}

			path.push({
				type: ExpressionPartType.Value,

				id: node.id,
				value: undefined,

				source: toPos(tokens[i+1], tokens[i])
			});

			startToken = tokens[i+1];
		}
	}

	if(text.length > 0) {
		path.push({
			type: ExpressionPartType.Text,
			value: text.join(' '),

			source: toPos(null, startToken)
		});
	}

	return path;
}
