---
title: Date

layout: article

section: date-time
tags: date-time

position: 1
---

{% import "helpers.njk" as helpers %}

# Date

The date value captures the date of a single day and maps to a `DateValue`
object.

Usage:

```javascript
const { date } = require('ecolect/values');

// In a phrase
builder.value('idOfValue', date());

// As a matcher
const matcher = date().matcher(language);
await result = matcher('today');
```

## Playground

<div class="playground-date"></div>

## Examples

{% call helpers.examples('en') %}

* `today`
* `tomorrow`
* `yesterday`
* `may 8th 2020`

{% endcall %}
