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

**Todo**

- Clustered map
- Interesting species for a give month/year (work in progress)
- Aggragation by data source (work in progress)

Technical Todo
--------------

- Elasticsearch on AWS or elsewhere? (11 GB index for 51M records) - with username management
- Tabs for subtools/pages (browser history?)
- Map
- Background info (modal/page)
- Async populating of significant species (promises or better UI)
- cache metadata (localstorage; update frequency?)
- Autocomplete species name (Elasticsearch suggestions?)
- Reorganize page update logic
- Templating (Handlebars/Ember)
- URL Routing (Ember?)

**Site logical structure draft:**

Site: total & data sources
- Species charts
- Species maps (remembers species selection)
- Classes (& significant species)
- About
