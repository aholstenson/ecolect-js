import type { Intent } from '../IntentsBuilder.js';
import { Language } from '../language/index.js';
import { rendererFor, Value } from '../values/base.js';

import { GenerateOptions } from './GenerateOptions.js';
import { TemplateGenerator } from './TemplateGenerator.js';
import { ValueRenderer } from './ValueRenderer.js';

/**
 * Writes the text that a set of values would be matched from. This is the
 * other direction of a matcher: values go in and the text a user would have
 * written comes out.
 *
 * Every text this returns has been read back and resolved to the values it
 * was written for, so text that would mean something else is never returned.
 */
export interface Generator<Values extends object> {
	/**
	 * Write the given values as text.
	 *
	 * @param values -
	 *   the values to write
	 * @param options -
	 *   options for this generation
	 * @returns
	 *   the text, or `null` if the values can not be written as text that
	 *   reads back as them
	 */
	generate(values: Values, options?: GenerateOptions): Promise<string | null>;

	/**
	 * Write the given values as text in every way the phrases allow. Use this
	 * to let a user pick between the ways of saying the same thing.
	 *
	 * @param values -
	 *   the values to write
	 * @param options -
	 *   options for this generation
	 * @returns
	 *   the texts, best text first
	 */
	generateAll(values: Values, options?: GenerateOptions): Promise<string[]>;
}

/**
 * The values of the intent with the given identifier.
 */
export type IntentValues<Intents extends Intent<any, any>, Id extends string> =
	Extract<Intents, { id: Id }> extends { values: infer V } ? V : never;

/**
 * Writes the text that an intent and its values would be matched from.
 */
export interface IntentGenerator<Intents extends Intent<any, any>> {
	/**
	 * Write the given intent as text.
	 *
	 * @param id -
	 *   the intent to write
	 * @param values -
	 *   the values of the intent
	 * @param options -
	 *   options for this generation
	 * @returns
	 *   the text, or `null` if the intent can not be written as text that
	 *   reads back as it
	 */
	generate<Id extends Intents['id']>(
		id: Id,
		values?: IntentValues<Intents, Id>,
		options?: GenerateOptions
	): Promise<string | null>;

	/**
	 * Write the given intent as text in every way its phrases allow.
	 *
	 * @param id -
	 *   the intent to write
	 * @param values -
	 *   the values of the intent
	 * @param options -
	 *   options for this generation
	 * @returns
	 *   the texts, best text first
	 */
	generateAll<Id extends Intents['id']>(
		id: Id,
		values?: IntentValues<Intents, Id>,
		options?: GenerateOptions
	): Promise<string[]>;
}

/**
 * The number of texts asked for when every text is wanted.
 */
const NO_LIMIT = Number.MAX_SAFE_INTEGER;

/**
 * Generator for a single set of phrases.
 */
export class PhraseGenerator<Values extends object> implements Generator<Values> {
	private readonly generator: TemplateGenerator;

	public constructor(generator: TemplateGenerator) {
		this.generator = generator;
	}

	public async generate(values: Values = {} as Values, options: GenerateOptions = {}): Promise<string | null> {
		const result = await this.generator.generate(values, options, 1);
		return result[0] ?? null;
	}

	public generateAll(values: Values = {} as Values, options: GenerateOptions = {}): Promise<string[]> {
		return this.generator.generate(values, options, NO_LIMIT);
	}
}

/**
 * Generator for a set of intents.
 */
export class IntentsGenerator<Intents extends Intent<any, any>> implements IntentGenerator<Intents> {
	private readonly generators: ReadonlyMap<string, TemplateGenerator>;

	public constructor(generators: ReadonlyMap<string, TemplateGenerator>) {
		this.generators = generators;
	}

	public async generate<Id extends Intents['id']>(
		id: Id,
		values: IntentValues<Intents, Id> = {} as any,
		options: GenerateOptions = {}
	): Promise<string | null> {
		const result = await this.generatorFor(id).generate(values as object, options, 1);
		return result[0] ?? null;
	}

	public generateAll<Id extends Intents['id']>(
		id: Id,
		values: IntentValues<Intents, Id> = {} as any,
		options: GenerateOptions = {}
	): Promise<string[]> {
		return this.generatorFor(id).generate(values as object, options, NO_LIMIT);
	}

	/**
	 * Get the generator for an intent.
	 *
	 * @param id -
	 *   the identifier of the intent
	 * @returns
	 *   the generator
	 */
	private generatorFor(id: string): TemplateGenerator {
		const generator = this.generators.get(id);
		if(! generator) {
			throw new Error('No intent with the identifier `' + id + '` has been added');
		}

		return generator;
	}
}

/**
 * Get the renderers for a set of values, leaving out the values that can not
 * be written as text.
 *
 * @param values -
 *   the types of the values, keyed by their identifier
 * @param language -
 *   the language the text is written in
 * @returns
 *   the renderers, keyed by the identifier of the value
 */
export function renderersFor(
	values: ReadonlyMap<string, Value<any>>,
	language: Language
): Map<string, ValueRenderer<any>> {
	const result = new Map<string, ValueRenderer<any>>();

	for(const [ id, type ] of values) {
		const renderer = rendererFor(type, language);
		if(renderer) {
			result.set(id, renderer);
		}
	}

	return result;
}
