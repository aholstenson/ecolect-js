---
title: Custom value

layout: article

section: phrases
tags: phrases

position: 3
---

# Custom value

Custom values are supported and can be used to do things such as remote lookups.

```javascript
function matcher(encounter) {
	const text = encounter.text();
	if(encounter.partial) {
		// Partial matching
	} else {
		// Full matching
	}
}
```
