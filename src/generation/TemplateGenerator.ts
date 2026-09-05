import { Language } from '../language/index.js';
import { MatchOptions } from '../matching/index.js';

import { GenerateOptions } from './GenerateOptions.js';
import { joinTemplate } from './join.js';
import { Template } from './Template.js';
import { RenderContext, ValueRenderer } from './ValueRenderer.js';
import { definedKeys, valuesEqual } from './valuesEqual.js';

/**
 * The most ways a single value is written before moving on to another way of
 * writing the phrase.
 */
const MAX_PER_VALUE = 8;

/**
 * The number of texts tried when the caller does not say.
 */
const DEFAULT_MAX_CANDIDATES = 25;

/**
 * How far ahead a text is read a second time to find out if it means the same
 * thing whenever it is read. Longer than a year, so that texts about days,
 * weeks, months, quarters and years all come out differently.
 */
const STABILITY_SHIFT = 400 * 24 * 60 * 60 * 1000;

/**
 * Read a text back and return the values it resolves to, or `null` if it does
 * not mean what it is being read for.
 */
export type Verification = (text: string, options: MatchOptions) => Promise<object | null>;

/**
 * A value written as text, together with the identifier of the value.
 */
interface RenderedValue {
	readonly id: string;
	readonly texts: readonly string[];
}

/**
 * Generator that writes a text by filling in one of the ways a phrase can be
 * written and then reading the text back to check that it means what it was
 * written to mean.
 */
export class TemplateGenerator {
	private readonly language: Language;
	private readonly templates: readonly Template[];
	private readonly renderers: ReadonlyMap<string, ValueRenderer<any>>;
	private readonly verify: Verification;

	public constructor(
		language: Language,
		templates: readonly Template[],
		renderers: ReadonlyMap<string, ValueRenderer<any>>,
		verify: Verification
	) {
		this.language = language;
		this.templates = templates;
		this.renderers = renderers;
		this.verify = verify;
	}

	/**
	 * Write the given values as text.
	 *
	 * @param values -
	 *   the values to write
	 * @param options -
	 *   options for this generation
	 * @param limit -
	 *   the number of texts to return
	 * @returns
	 *   the texts that were written and read back as the given values, best
	 *   text first
	 */
	public async generate(values: object, options: GenerateOptions, limit: number): Promise<string[]> {
		const ids = definedKeys(values);

		const matchOptions = toMatchOptions(options);
		const now = options.now ?? new Date();
		matchOptions.now = now;

		const context: RenderContext = {
			language: this.language,
			options: matchOptions,
			now: now
		};

		const casing = options.casing ?? 'phrase';
		const stable = options.stable ?? true;
		let budget = options.maxCandidates ?? DEFAULT_MAX_CANDIDATES;

		const found: string[] = [];
		const tried = new Set<string>();

		for(const template of this.templates) {
			if(budget <= 0) break;
			if(! sameValues(template.values, ids)) continue;

			const rendered = await this.renderValues(template, values, context);
			if(! rendered) continue;

			for(const combination of combinations(rendered)) {
				if(budget <= 0) break;

				const text = joinTemplate(template, combination, casing);
				if(text === '' || tried.has(text)) continue;

				tried.add(text);
				budget--;

				if(await this.check(text, values, matchOptions, stable, now)) {
					found.push(text);
					if(found.length >= limit) return found;

					// This phrase has been written, the rest are other phrases
					break;
				}
			}
		}

		return found;
	}

	/**
	 * Write every value a template needs.
	 *
	 * @param template -
	 *   the template being written
	 * @param values -
	 *   the values to write
	 * @param context -
	 *   what the renderers are told about the text
	 * @returns
	 *   the ways each value can be written, or `null` if a value can not be
	 *   written at all
	 */
	private async renderValues(
		template: Template,
		values: any,
		context: RenderContext
	): Promise<RenderedValue[] | null> {
		const result: RenderedValue[] = [];

		for(const id of template.values) {
			const renderer = this.renderers.get(id);
			if(! renderer) return null;

			const texts = (await renderer.render(values[id], context))
				.filter(text => text !== '')
				.slice(0, MAX_PER_VALUE);

			if(texts.length === 0) return null;

			result.push({ id: id, texts: texts });
		}

		return result;
	}

	/**
	 * Read a text back and check that it means the given values.
	 *
	 * @param text -
	 *   the text to check
	 * @param values -
	 *   the values the text was written for
	 * @param options -
	 *   the options to read the text with
	 * @param stable -
	 *   if the text also has to mean the same thing when it is read later
	 * @param now -
	 *   the time the text is read at
	 * @returns
	 *   `true` if the text means the values
	 */
	private async check(
		text: string,
		values: object,
		options: MatchOptions,
		stable: boolean,
		now: Date
	): Promise<boolean> {
		const read = await this.verify(text, options);
		if(! read || ! valuesEqual(read, values)) return false;

		if(stable) {
			/*
			 * Read the text again as if a long time had passed. A text such
			 * as `today` resolves to another day and is dropped, which is
			 * what keeps a generated link pointing at the same thing.
			 */
			const later = await this.verify(text, {
				...options,
				now: new Date(now.getTime() + STABILITY_SHIFT)
			});

			if(! later || ! valuesEqual(later, values)) return false;
		}

		return true;
	}
}

/**
 * Get if a template writes exactly the given values.
 *
 * @param templateValues -
 *   the values the template writes
 * @param ids -
 *   the identifiers of the values to write
 * @returns
 *   `true` if the template writes those values and no others
 */
function sameValues(templateValues: readonly string[], ids: readonly string[]): boolean {
	if(templateValues.length !== ids.length) return false;

	for(const id of ids) {
		if(! templateValues.includes(id)) return false;
	}

	return true;
}

/**
 * Get the options to read a text with, leaving out the options that only
 * apply while writing it.
 *
 * @param options -
 *   the options of the generation
 * @returns
 *   options for reading a text
 */
function toMatchOptions(options: GenerateOptions): MatchOptions {
	const result: GenerateOptions = { ...options };

	delete result.stable;
	delete result.casing;
	delete result.maxCandidates;

	return result;
}

/**
 * Walk the ways the values of a template can be written together, starting
 * with the best way of writing each of them.
 *
 * @param values -
 *   the ways each value can be written
 * @returns
 *   the combinations, as the text of each value keyed by its identifier
 */
function* combinations(values: readonly RenderedValue[]): Generator<Map<string, string>> {
	const at = new Array(values.length).fill(0);

	for(;;) {
		const combination = new Map<string, string>();
		for(let i=0; i<values.length; i++) {
			combination.set(values[i].id, values[i].texts[at[i]]);
		}

		yield combination;

		// Step the last value first, so the best way of writing it is kept
		let i = values.length - 1;
		for(; i>=0; i--) {
			at[i]++;
			if(at[i] < values[i].texts.length) break;

			at[i] = 0;
		}

		if(i < 0) return;
	}
}
