---
title: Dates and times
description: Values for capturing dates and times

layout: article

id: date-time
tags:
  - section

position: 2
---

# Dates and times

Ecolect supports capturing many different formats of dates and times,
including durations and intervals.

## Options

All date and time related values share a few options that can be used to
customize the parsing.

Option                  | Default      | Description
------------------------|--------------|-------------
`now`                   | `new Date()` | Date to use as a base for times and dates parsed
`weekStartsOn`          | `0` (Sunday) | The day the week starts on
`firstWeekContainsDate` | `1`          | The day of January which is always in the first week of the year

## Handling weeks

It's important to set `weekStartsOn` and `firstWeekContainsDate` to something
expected by the user. The default value for `weekStartsOn` is `0` which
indicates that weeks start on Sunday.

`firstWeekContainsDate` defaults to `1` which is commonly used in North America
and Islamic date systems. Countries that use this week numbering include
Canada, United States, India, Japan, Taiwan, Hong Kong, Macau, Israel,
Egypt, South Africa, the Phillippines and most of Latin America.

For EU countries most of them use Mondays as the start of the week and the ISO
week system. Settings `weekStartsOn` to `1` and `firstWeekContainsDate` to `4`
will set weeks to a style used in EU and most other European countries, most
of Acia and Oceania.

Middle Eastern countries commonly use Saturday as their first day of week and
a week numbering system where the first week of the year contains January 1st.
Set `weekStartsOn` to `6` and `firstWeekContainsDate` to `1` to use this
style of week.

For more information about week numbering see the [Week article on Wikipedia](https://en.wikipedia.org/wiki/Week#Week_numbering).

