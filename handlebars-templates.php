<script id="about-page" type="text/x-handlebars-template">
  <div id="about">
    <p>This Biodiversity Browser presents biodiversity occurrence data (observations, museum specimens etc.) from Sweden, Norway and Denmark. The data comes from the following GBIF downloads:</p>
    <ul>
    	<li><a href="http://doi.org/10.15468/dl.khgczw">http://doi.org/10.15468/dl.khgczw</a> (Sweden)</li>
    	<li><a href="http://doi.org/10.15468/dl.lcvgjh">http://doi.org/10.15468/dl.lcvgjh</a> (Norway)</li>
    	<li><a href="http://doi.org/10.15468/dl.7nngdw">http://doi.org/10.15468/dl.7nngdw</a> (Denmark)</li>
    </ul>

    <p>Majority of Finnish occurrence data is not currently (12/2016) available on GBIF, but will be added here later from <a href="https://beta.laji.fi/">FinBIF</a>.

    <p>The site is a work in progress. Currently there are tools for displaying: 

    <ul>
	    <li>Species records per year: absolute numbers, or proportionally to a higher taxon (class, order or family; for adjustement to changing observation effort over the years)</li>
	    <li>Species records per month: absolute numbers or proportionally
	    <li>Largest data sources, and search significant species from each</li>
	    <li>Largest classes, and search significant species from each per year</li>
	    <li>Aggregated species distribution maps (UNDER DEVELOPMENT)
    </ul>

    <p>The data is stored into an Elasticsearch server, which enables fast searches and aggregations. The browser connects directly to Elasticsearch and formats the results for displaying (with JavaScript, jQuery, Highcharts, Handlebars.js and Leaflet). <a href="https://github.com/mikkohei13/biodiversity-browser">Source code for the Biodiversity Browser is available on Github</a>.

    <p>Data was imported to Elasticsearch by my <a href="https://github.com/mikkohei13/darwincore-php">Darwincore-PHP toolset</a>. The 85+ million records took less than four hours to index, and take about 17 GB of hard disk space and 1-4 GB of memory (depending on caching and query load). This shows it's quite feasible to handle even hundreds of millions simple records with an reasonably inexpensive virtual server. 

    <p><em><a href="https://www.biomi.org/">Mikko Heikkinen / biomi.org</a></em>
  </div>
</script>