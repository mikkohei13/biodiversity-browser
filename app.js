/*
NOTE: This is a proof of concept system that is still a work in progress. Future plans on code refactoring are listed in the README.MD file.
*/
"use strict";

let options = {};
    options.indexName = "se-all";

// Page load
$(document).ready(function() {
    options.activePage = "chartpage";
	$("body").attr("id", "chartpage");
	hideElement("#mymap");

	doTotalsSearch();

	// IE version check
	var version = detectIE();
	if (version !== false && version < 11)
	{
	  $("#heading").html("Note: this site doesn't work properly with Internet Explorer 10 or older.");
	}
	console.log(version);

//	options.species = "Luscinia luscinia"; getTaxon(); $("#heading").text("Debugging with " + options.species); return; // DEBUG
});


// -----------------------------------
// EVENTS

// Navigation
$("#nav a").click(function() {
	navigateTo(this.id);
});

// Species search (enter)
$("#species").keypress(function(event) {
	if (event.which == 13) {
		initSpeciesSearch();
	}
});

// Species search (button)
$( "#search" ).click(function() {
	initSpeciesSearch();
});

/*
Navigation logic: changing page clears results, but keeps form contents
Todo: Handlebars templates
*/
function navigateTo(id)
{
	// Change tab
	$(".active").removeClass("active");
	document.getElementById(id).className = "active";
//	$("#mymap").removeClass("active");	

	clearResults();

	console.log("Tab " + id);

	if ("chartpage" == id)
	{
		options.activePage = "chartpage";
		$("body").attr("id", "chartpage");
		doTotalsSearch();

		showElement("#namesearch");
		showElement("#comparison");
		showElement("#aggrtype");
		showElement("#container");
		hideElement("#mymap");
	}
	else if ("mappage" == id)
	{
		options.activePage = "mappage";
		$("body").attr("id", "mappage");
		$("#heading").html("");

		showElement("#namesearch");
		hideElement("#comparison");
		hideElement("#aggrtype");
		hideElement("#container");
		showElement("#mymap");

	    clearMap(); // this has to be done last, so that height adjustement goes right
	}
	else if ("classpage" == id)
	{
		options.activePage = "classpage";
		$("body").attr("id", "classpage");
		doClassSearch();

		hideElement("#namesearch");
		hideElement("#comparison");
		hideElement("#aggrtype");
		showElement("#container");
		hideElement("#mymap");
	}
	else if ("sourcepage" == id)
	{
		options.activePage = "sourcepage";
		$("body").attr("id", "sourcepage");
		doSourceSearch();

		hideElement("#namesearch");
		hideElement("#comparison");
		hideElement("#aggrtype");
		showElement("#container");
		hideElement("#mymap");
	}
	else if ("aboutpage" == id)
	{
		options.activePage = "aboutpage";
		$("body").attr("id", "aboutpage");
		$("#heading").html("About this site");

		hideElement("#namesearch");
		hideElement("#comparison");
		hideElement("#aggrtype");
		showElement("#container");
		hideElement("#mymap");

		updateTemplate("about-page", "container", {});
	}
}

function updateTemplate(sourceId, destinationId, context) {
	let source = $("#"+sourceId).html();
	let template = Handlebars.compile(source);
	let html = template(context);
	$("#"+destinationId).html(html);
}

function clearResults()
{
	$("#container").html("");
	$("#total").html("");
	$("#containerresults").remove();
}

function showElement(id)
{
	$(id).addClass("show");
	$(id).removeClass("hide");
}

function hideElement(id)
{
	$(id).addClass("hide");
	$(id).removeClass("show");
}

// -----------------------------------
// SPECIES SEARCH

function initSpeciesSearch()
{
	$("#ladda").html("<img src='media/spinner.svg'>");

	// if empty search
	if ($("#species").val() == "") {
		clearMap();
		doTotalsSearch();
	}
	else {
		if ("chartpage" == options.activePage) {
			doSpeciesChartSearch();
		}
		else if("mappage" == options.activePage) {
			initMap();
		}
	}
}

function doSpeciesChartSearch()
{
	initAggregationParameters();
	options.species = capitalizeFirstLetter($("#species").val());

	let rank = $('input[name=rank]:checked').val();
	if (rank == "no") {
		getTaxon(species);		
	}
	else {
		options.comparisonRank = rank;
		getComparison();
	}
	$("#heading").text(options.species);
}

function initAggregationParameters()
{
	let aggrType = $('input[name=aggrtype]:checked').val();

	if ("year" == aggrType)
	{
		options.aggregateType = "year";
		options.periods = 52;
		options.begin = 1963;
		options.end = options.begin + options.periods - 1;
	}
	else // if (aggrtype == "month")
	{
		options.aggregateType = "month";
		options.periods = 12;
		options.begin = 1;
		options.end = options.begin + options.periods - 1;
	}
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

// -----------------------------------
// QUERY ELASTIC

function doClassSearch() {

	$("#container").html("<img src='media/spinner.svg'>");
	$("#heading").text("Total");

	let classCount = 50;

	let queryObject = {
		"size" : 0,
    	"aggregations" : {
    		"observationsPerClass" : {
    			"terms" : {
    				"field" : "class",
    				"size" : classCount
    			}
    		}
    	}
	};

	let callback = function(elasticData) {

		let html = "<h4>Top " + classCount + " classes:</h4><ol id='itemlist'>";
		let buckets = elasticData.aggregations.observationsPerClass.buckets;
		let topcount = 0;

		for (let i = 0; i < buckets.length; i++) {
//			console.log(buckets[i]);
			html += "<li data-item-name='" + buckets[i].key + "'>" + buckets[i].key + " (" + buckets[i].doc_count.toLocaleString() + ")<br>"; // templating would be nice...
			topcount = topcount + buckets[i].doc_count;
		}
		html += "</ol>";

		$("#container").html(html);

		// Show count
		let count = elasticData.hits.total;
		let countFormatted = count.toLocaleString();
//		$("#total").text(countFormatted + " occurrences, out of which " + Math.round(topcount / count * 100 * 10) / 10 + " % from these top classes:");
		updateTemplate("source-page", "total", {total: countFormatted, percent: (Math.round(topcount / count * 100 * 10) / 10) });

		// Significance query event handler
		$("#container").before("<div id='containerresults'></div>");
		$("#itemlist").on('click', function(event) {
			doSignifiganceQuery(event, "class");
		});
	};

	elasticQueryModule.query(queryObject, callback);
}

// todo: combine with class search function?
function doSourceSearch() {

	$("#container").html("<img src='media/spinner.svg'>");
	$("#heading").text("Total");

	let institutionCount = 100;

	let queryObject = {
		"size" : 0,
    	"aggregations" : {
    		"observationsPerInstitution" : {
    			"terms" : {
    				"field" : "institutioncode",
    				"size" : institutionCount
    			}
    		}
    	}
	};

	let callback = function(elasticData) {

		let html = "<h4>Top " + institutionCount + " institutions:</h4><ol id='itemlist'>";
		let buckets = elasticData.aggregations.observationsPerInstitution.buckets;
		let topcount = 0;

		for (let i = 0; i < buckets.length; i++) {
//			console.log(buckets[i]);
			html += "<li data-item-name='" + buckets[i].key + "'>" + buckets[i].key + " (" + buckets[i].doc_count.toLocaleString() + ")</li>"; // templating would be nice...
			topcount = topcount + buckets[i].doc_count;
		}
		html += "</ol>";

		$("#container").html(html);

		// Show count
		let count = elasticData.hits.total;
		let countFormatted = count.toLocaleString();
		//$("#total").text(countFormatted + " occurrences, out of which " + Math.round(topcount / count * 100 * 10) / 10 + " % from these top institutions:");
		updateTemplate("source-page", "total", {total: countFormatted, percent: (Math.round(topcount / count * 100 * 10) / 10) });

		// Significance query event handler
		$("#container").before("<div id='containerresults'></div>");
		$("#itemlist").on('click', function(event) {
			doSignifiganceQuery(event, "institutioncode");
		});
	};

	elasticQueryModule.query(queryObject, callback);
}

function doSignifiganceQuery(event, field) {
	let name = $(event.target).attr("data-item-name");
	$("#containerresults").html("");

	// todo: is async query ok? use promise??
	if ("class" == field)
	{
		for (let y = 2005; y <= 2015; y++) {
			significantSpecies(field, name, y);
		}
	}
	else if ("institutioncode" == field)
	{
		significantSpecies(field, name, "all years");
	}
}

function significantSpecies(field, name, year) {
	let queryObject = {
	    "query" :
	    {
	        "bool" :
	        {
	        	"must" :
	        	[
	        	]
	        }
	    },
	    "aggregations" : 
	    {
	        "significantResults" : 
	        {
	            "significant_terms" : 
	            {
	            	"field" : "species" 
	        	}
	        }
	    }
	}

	if ("class" == field)
	{
		queryObject.query.bool.must[0] = { "term" : {
			"class" : name
		} };
		queryObject.query.bool.must[1] = { "term" : {
			"year" : year
		} };
	}
	else if ("institutioncode" == field)
	{
		queryObject.query.bool.must[0] = { "term" : {
			"institutioncode" : name
		} };
	}

	let callback = function(elasticData) {
		console.log(elasticData);

		let html = "<p><strong>" + year + "</strong>: <br>";
		let buckets = elasticData.aggregations.significantResults.buckets;
		for (let i = 0; i < buckets.length; i++) {
			html += buckets[i].key + " (" + Math.round((buckets[i].doc_count / buckets[i].bg_count) * 100) + " %), "; // templating would be nice...
		}
		html += "<br>";

		$("#containerresults").prepend(html);
	};

	elasticQueryModule.query(queryObject, callback);
}

// Gets JSON for taxon query, which is aggregated & ranged based on global options
function getQueryObject(rank, taxon)
{
	let queryObject = {
		"size" : 0,
    	"query" :
    	{
    		"bool" :
    		{
    			"must":
    			[
 					{
		        		"term" :
		        		{
		        			// This is set automatically below
		        		}
    				},
		    		{
        				"range" :
        				{
		        			// This is set automatically below
        				}
    				}
    			]
    		}
    	},
    	"aggregations" :
    	{
    		"observationsPerMonth" :
    		{
    			"terms" :
    			{
    				"field" : options.aggregateType,
    				"size" : options.periods
    			}
    		}
    	}
	};
	// Pre-ES6, see http://stackoverflow.com/questions/2274242/using-a-variable-for-a-key-in-a-javascript-object-literal
	queryObject.query.bool.must[0].term[rank] = taxon;
	queryObject.query.bool.must[1].range[options.aggregateType] = {
		"gte" : options.begin,
		"lte" : options.end
	}

	return queryObject;
}

function getComparison()
{
	// First get species data
	let queryObject = {
		"size" : 1,
    	"query" : {
        	"term" : {
        		"species" : options.species
        	}
    	}
	};

	let callback = function(elasticData) {

		let count = elasticData.hits.total;
		if (0 == count)
		{
			$("#ladda").html("");
			$("#heading").text("Species not found");
			$("#total").text("");
			$("#container").html("");
			return;
		}

		options.comparisonTaxon = elasticData.hits.hits[0]._source[options.comparisonRank];

		getComparisonHigherTaxon();
	};

	elasticQueryModule.query(queryObject, callback);
}

function getComparisonHigherTaxon()
{
	// First get species data
	let queryObject = getQueryObject(options.comparisonRank, options.comparisonTaxon);

	let callback = function(elasticData) {
		options.higherTaxonPerMonth = getObservationsPerMonth(elasticData); // Data to global var
		getComparisonSpecies();
	};

	elasticQueryModule.query(queryObject, callback);
}

function getComparisonSpecies() {

	let queryObject = getQueryObject("species", options.species);

	let callback = function(elasticData) {

		let speciesPerMonth = getObservationsPerMonth(elasticData);

		speciesPerMonth = calculateProportions(speciesPerMonth);

		printHighchart(speciesPerMonth, options.species, (options.species + " % of " + options.comparisonTaxon), "%");

		// Show count
		let count = elasticData.hits.total;
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted + " occurrences");
	};

	elasticQueryModule.query(queryObject, callback);
}

// Calculate proportion of higher taxon observations
function calculateProportions(speciesPerMonth) {
	let roundness = 1000000;
	for (let m = options.begin; m <= options.end; m++) {
		speciesPerMonth[m] = speciesPerMonth[m] / options.higherTaxonPerMonth[m];
//		speciesPerMonth[m] = Math.round(speciesPerMonth[m] * roundness) / roundness * 100; // This results to multiple decimals due to decimal inaccuracy
		speciesPerMonth[m] = speciesPerMonth[m] * 100;
	}
	return speciesPerMonth;
}

// Get summary of all data
function doTotalsSearch() {
	$("#heading").text("Total");
	$("#container").html("");

	let queryObject = {};

	let callback = function(elasticData) {
		$("#container").html("");

		// Show count
		let count = elasticData.hits.total;
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted + " occurrences");
		$("#ladda").html("");
	};

	elasticQueryModule.query(queryObject, callback);
}

function getTaxon() {
	let queryObject = {
		"size" : 0,
    	"query" : {
        	"term" : {
        		"species" : options.species
        	}
    	},
    	"aggregations" : {
    		"observationsPerMonth" : {
    			"terms" : {
    				"field" : options.aggregateType,
    				"size" : options.periods
    			}
    		}
    	}
	};

	let callback = function(elasticData) {

		let count = elasticData.hits.total;
		if (0 == count)
		{
			$("#ladda").html("");
			$("#heading").text("Species not found");
			$("#total").text("");
			$("#container").html("");
			return;
		}

		// Highcharts
		let observationsPerMonth = getObservationsPerMonth(elasticData);
		printHighchart(observationsPerMonth, options.species, options.species, "Occurrences");

		// Show count
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted + " occurrences");
	};

	elasticQueryModule.query(queryObject, callback);
}

// -----------------------------------
// FORMAT DATA

// Create a Highchart
function printHighchart(observationsPerMonth, species, chartTitle, yAxisTitle)
{
	let data = getHighchartsDataSeries(observationsPerMonth, species);

	let categories = [];

	for (let m = options.begin; m <= options.end; m++) {
		categories.push(m);
	}

	$(function () { 
	    var myChart = Highcharts.chart('container', {
	        chart: {
	            type: 'column'
	        },
	        title: {
	            text: chartTitle
	        },
	        xAxis: {
//	            categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
//	            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
				categories: categories,
	            title: {
	            	text: options.aggregateType
	            }
	        },
	        yAxis: {
	            title: {
	                text: yAxisTitle
	            }
	        },
	        series: data,
	        plotOptions: {
	        	series: {
	        		animation: {
	        			duration: 10
	        		}
	        	}
	        }
	    });
	});

	$("#ladda").html("");
}

// Pick monthly values from elastic search results
function getObservationsPerMonth(elasticData)
{
	let monthlyBuckets = elasticData.aggregations.observationsPerMonth.buckets;
	let monthlyObservations = {};

	// Note this can't handle missing months
	for (var i = monthlyBuckets.length - 1; i >= 0; i--) {
		monthlyObservations[monthlyBuckets[i].key] = monthlyBuckets[i].doc_count;
	}

	monthlyObservations = fillMissingMonths(monthlyObservations);

	return monthlyObservations;
}

// Fills in missing (zero) monthly values and makes sure that the array is properly sorted
function fillMissingMonths(monthlyObservations)
{
	let filledMonthlyObservations = {};
	for (let m = options.begin; m <= options.end; m++) {
		if (undefined == monthlyObservations[m])
		{
			filledMonthlyObservations[m] = 0;
		}
		else
		{
			filledMonthlyObservations[m] = monthlyObservations[m];
		}
	}
	return filledMonthlyObservations;
}

// Format data into Highchart-compatible data series
function getHighchartsDataSeries(observationsPerMonth, seriesName)
{
	/*
	Example:
		series: [{
		    name: ''
		    data: []
		}]
	*/
	let series = [];
	let data = [];

	for (let m = options.begin; m <= options.end; m++) {
		data.push(observationsPerMonth[m]);
	}

	series[0] = {
		"name" : seriesName,
		"data" : data
	};

	return series;
}

