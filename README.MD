Biodiversity Browser
====================

Tools to browse, analyze and visualize GBIF occurrence data from Elasticsearch.

Purposes:
- Show species occurrence trends over the years
- Show species phenology
- Show species distribution on a map
- Show basic metadata about the data (sources, higher classification)
- Demonstrate Elasticsearch's signifigance search, which could be used to pinpoint uncommon occurences of species
- Find out uncommon traits of the data

Ideas
-----

**Done**

- Species monthly chart
- Species yearly chart, compared to higher taxonomy
- Aggragation & interesting species for a given year & class and institution

**Todo**

- Clustered map


Technical Todo
--------------

- Elasticsearch on AWS or elsewhere? (11 GB index for 51M records) - with username management
- Map
- About page, documentation, help texts
- cache metadata (localstorage; update frequency?)
- Autocomplete species name (Elasticsearch suggestions?)
- Tabs for subtools/pages (browser history?)
- Templating (Handlebars/Ember)
- URL Routing (Ember?)
- Refactor names:
	- getmonths -> getperiods
	- get -> do
	- use same div for all results (chart/map/class)?

**Site logical structure draft:**

Site: total & data sources
- Species charts
- Species maps (remembers species selection)
- Classes (& significant species)
- About
