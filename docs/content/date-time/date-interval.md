---
title: Date Interval

layout: article

section: date-time
tags: date-time

position: 3
---

{% import "helpers.njk" as helpers %}

# Date Interval

The date interval value captures a range between two dates.

Usage:

```javascript
const { dateInterval } = require('ecolect/values');

// In a phrase
builder.value('idOfValue', dateInterval());

// As a matcher
const matcher = dateInterval().matcher(language);
await result = matcher('this month');
```

## Playground

<div class="playground-date-interval"></div>

## Examples

{% call helpers.examples('en') %}

* `today`
* `tomorrow`
* `yesterday`
* `may 8th 2020`
* `this month`

{% endcall %}
