
/*
DOCS:
Objective: Show occurrence count data on single species, either absolute, or proportional to a higher taxon.
Most variables are handled with the globar object options. 
Variables regarding Highcharts are handled with function arguments, so that creating several charts is possible.

*/

"use strict";

let options = {};

function doInit()
{
	options.indexName = "se-all";

	let aggrType = $('input[name=aggrtype]:checked').val();

	if ("year" == aggrType)
	{
		options.aggregateType = "year";
		options.periods = 52;
		options.begin = 1963;
		options.end = options.begin + options.periods - 1;
	}
	else
	{
		options.aggregateType = "month";
		options.periods = 12;
		options.begin = 1;
		options.end = options.begin + options.periods - 1;
	}
}

// -----------------------------------
// EVENTS

// Page load
$(document).ready(function() {
	doInit();
	$("#query").text("Total");
//	options.species = "Luscinia luscinia"; getTaxon(); $("#query").text("Debugging with " + options.species); return; // DEBUG
	getAll();
});

// Species search (enter)
$("#species").keypress(function(event) {
	if (event.which == 13) {
		$("#ladda").html("<img src='media/spinner.svg'>");
		doInit();
		doSpeciesSearch();
	}
});

// Species search (button)
$( "#search" ).click(function() {
	$("#ladda").html("<img src='media/spinner.svg'>");
	doInit();
	doSpeciesSearch();
});

function doSpeciesSearch()
{
	options.species = $("#species").val();

	if (options.species == "") {
		$("#query").text("");
		$("#container").html("");
		getAll();
	}
	else {
		let rank = $('input[name=rank]:checked').val();
		if (rank == "no") {
			getTaxon(species);		
		}
		else {
			options.comparisonRank = rank;
			getComparison();
		}
		$("#query").text(options.species);
	}
}


// -----------------------------------
// QUERY ELASTIC

// Gets JSON for taxon query, which is aggregated & ranged based on global options
function getQueryObject(rank, taxon)
{
	let queryObject = {
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
			$("#total").text("Species not found");
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
function getAll() {

	let callback = function(elasticData) {
		let count = elasticData.hits.total;
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted + " occurrences");
		$("#ladda").html("");
	};

	elasticQueryModule.query({}, callback);
}

function getTaxon() {
	let queryObject = {
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
			$("#total").text("Species not found");
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
