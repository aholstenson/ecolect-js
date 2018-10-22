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
* `5/8 2020`
* `2018-02-01`
* `in 2 days`
* `in 5 weeks`
* `2 months ago`
* `2 months from 2018-10-10`
* `2 weeks before today`
* `2m 1d`
* `in 2 years`
* `oct 10 in 2 years`
* `this Saturday`
* `first Sunday in Aug 2020`
* `jun of 2002`
* `this month in 2008`
* `last month of 2018`
* `end of September`
* `start of August 2010`

{% endcall %}
