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

MUST (before release)
- Test with FF, IE, Edge
- About page content
- Info texts

SHOULD
- Map
- Warming the index / cache <https://www.elastic.co/guide/en/elasticsearch/reference/current/shard-request-cache.html>
- Repo documentation
- Autocomplete species name (Elasticsearch suggestions?)
- Addresses for tabs (browser history?)
- Templating (Handlebars/Ember)
- Refactor names:
	- getmonths -> getperiods
	- get -> do
	- use same div for all results (chart/map/class)?

NICE

- URL Routing (Ember?)
- Favicon


**Site logical structure draft:**

Site: total & data sources
- Species charts
- Species maps (remembers species selection)
- Classes (& significant species)
- About
