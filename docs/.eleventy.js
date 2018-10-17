const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

/*
 * Set up Eleventy with the needed configuration.
 */
module.exports = config => {
	config.addPlugin(pluginSyntaxHighlight);

	config.addLayoutAlias('page', 'layouts/page.njk');
	config.addLayoutAlias('article', 'layouts/article.njk');

	config.addCollection('sections', c =>
		c.getFilteredByTag('section')
			.sort((a, b) => a.data.position - b.data.position)
	);

	config.addNunjucksFilter('sort_by_position', function(pages) {
		if(! pages) return pages;

		return pages.slice(0).sort((a, b) => {
			if(a.data.position == b.data.position) {
				return a.data.title.localeCompare(b.data.title);
			}

			return a.data.position - b.data.position
		});
	});

	return {
		templateFormats: [ 'md', 'njk', 'png', 'jpg' ],

		pathPrefix: '/',

		markdownTemplateEngine: 'njk',

		dir: {
			input: 'content',
			data: '../data',
			includes: '../includes',
			output: 'build'
		}
	};
};
