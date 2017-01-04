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
- Clustered map

**Could do**

- Filter by country
- Filter by years
- Filter by month (to find e.g. breeding observations)
- Show proportional numbers on map
- Linkable URL's

Technical Todo
--------------

MUST (before release)
- Browser requirements? (let?)

CHECK
- default size in geohash queries??
- making two queries on arrival?
- Set slowlog threshold / delete old log files (/var/log/elasticsearch)
- use elastic on port 80? (https://gist.github.com/m5m1th/6870a54717c0387468c3)

SHOULD
- Test more with Chrome, FF, IE, Edge
- Refactor navigation, modularize
- Repo documentation
- Autocomplete species name (Elasticsearch suggestions?)
- Addresses for tabs & species (+browser history?)
- Templating (Handlebars/Ember)
- Refactor names:
	- getmonths -> getperiods
	- get -> do
	- use same div for all results (chart/map/class)?
	- total -> info

NICE
- Logging
- Map circle color, proportional to doc_count?
- URL Routing (Ember?)
- Favicon
- Mobile...


**Site logical structure draft:**

Site: total & data sources
- Species charts
- Species maps (remembers species selection)
- Classes (& significant species)
- About

Logging
-----

Log files at /var/log/elasticsearch

**Enable slowlog:**

curl -XPUT http://USER:PASS@213.32.16.197:9200/se-all/_settings -d '{
	"index.search.slowlog.threshold.query.debug" : "100ms"
}'

**Disable slowlog:**

curl -XPUT http://USER:PASS@213.32.16.197:9200/se-all/_settings -d '{
	"index.search.slowlog.threshold.query.debug" : -1
}'
