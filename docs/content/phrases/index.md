---
title: Phrases

layout: article

id: phrases
tags:
  - section

position: 1
---

# Phrases

In addition to matching on various values Ecolect can help with matching
several phrases and mapping them to intents or actions. This functionality can
be used to build things such as:

* Voice interfaces
* Natural language command lines
* Search query builders

In Ecolect phrases are matched in a fuzzy way, meaning that some phrases will
match even if an exact match is not found. For example that if a phrase for
examples contains the word `cookies` it will match even if `cookie` is entered.

Phrase matching can also be run in two modes:

*
	Normal mode - Match a full expression to an intent, which is best used when
	building a bot or a voice interface.
*
	Partial mode - Match most of the expression, for example when building an 
	action launcher or a auto-complete for a search engine

## Intents

```javascript
const { intentsBuilder } = require('ecolect');

const en = require('ecolect/languages/en');
const { any } = require('ecolect/values');
```

## Actions

Actions are an extension to intents that makes it easier to register a handler
for per intent.

```javascript
const { actionsBuilder } = require('ecolect');

const en = require('ecolect/languages/en');
const { any } = require('ecolect/values');

const actions = actionsBuilder(en)
	.action()
		.handler(match => console.log('Executed action values were', match.values))
		.value('any', any())
		.phrase('Hello {any}')
		.done()
	.build();

// To get all matches use match:
const matches = await actions.match('Hello World!');
if(matches.best) {
	matches.best.activate();
}

// To run the best match automatically use handle:
await match = actions.handle('Hello World!');
```
