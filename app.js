
console.log("Elastic");
console.log("=====================");

/*
DOCS:
Objective: Show occurrence count data on single species, either absolute, or proportional to a higher taxon.
Most variables are handled with the globar object options. 
Variables regarding Highcharts are handled with function arguments, so that creating several charts is possible.

TODO:
Check how getting single species data works
Check if return exact matches or partial matches
Search button
Rerun script on radiobutton change
Modularize
Expand to yearly comparison
Documentation
License
Ladda

PROBLEM with yearly comparison: 
- Must define years to search

*/

var options = {};

options.indexName = "baltic-aves";
options.aggregateType = "year";
//options.aggregateType = "month";

if ("year" == options.aggregateType)
{
	options.periods = 10;
	options.begin = 1963;
	options.end = options.begin + options.periods;
}


// -----------------------------------
// EVENTS

// Page load
$(document).ready(function() {
	$("#query").text("Total");
	options.species = "Luscinia luscinia"; getTaxon(); $("#query").text("Debugging with " + options.species); return; // DEBUG
	getAll();
});

// Name search (enter)
$("#species").keypress(function(event) {
	if (event.which == 13) {
		options.species = $("#species").val();

		if (options.species == "") {
			$("#query").text("Total");
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
});

// -----------------------------------
// QUERY ELASTIC

function getAjaxParams(queryData) {
	return {
		method: "POST",
		url: "http://192.168.56.10:9200/" + options.indexName + "/_search",
		data: queryData,
		beforeSend: function (xhr) {
		    xhr.setRequestHeader ("Authorization", "Basic " + btoa("elastic" + ":" + "changeme"));
		}
	}	
}

function getComparison()
{
	// First get species data
	let queryData = JSON.stringify({
		"size" : 1,
    	"query" : {
        	"term" : {
        		"species" : options.species
        	}
    	}
	});
	console.log(queryData);

	$.ajax(getAjaxParams(queryData))
	.done(function(elasticData) {
		console.log(elasticData);

		let count = elasticData.hits.total;
		if (0 == count)
		{
			$("#total").text("Species not found");
			$("#container").html("");
			return;
		}

		options.comparisonTaxon = elasticData.hits.hits[0]._source[options.comparisonRank];

		getComparisonHigherTaxon();
	});
}

function getComparisonHigherTaxon()
{
	// First get species data
	let queryObject = {
    	"query" : {
        	"term" : {
        		// This is added later
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
	queryObject.query.term[options.comparisonRank] = options.comparisonTaxon; // Pre-ES6, see http://stackoverflow.com/questions/2274242/using-a-variable-for-a-key-in-a-javascript-object-literal

	let queryData = JSON.stringify(queryObject);
	console.log(queryData);

	$.ajax(getAjaxParams(queryData))
	.done(function(elasticData) {

		options.higherTaxonPerMonth = getObservationsPerMonth(elasticData); // Data to global var
		getComparisonSpecies();

	});
}

function getComparisonSpecies() {
	let queryData = JSON.stringify({
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
	});
	console.log(queryData);

	$.ajax(getAjaxParams(queryData))
	.done(function(elasticData) {
		console.log(elasticData);

		speciesPerMonth = getObservationsPerMonth(elasticData);
		console.log("LOG");
		console.log(speciesPerMonth);

		speciesPerMonth = calculateProportions(speciesPerMonth);

		printHighchart(speciesPerMonth, options.species, (options.species + " % of " + options.comparisonTaxon), "%");

		// Show count
		let count = elasticData.hits.total;
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted + " occurrences");
	});
}

// Calculate proportion of higher taxon observations
function calculateProportions(speciesPerMonth) {
	let roundness = 1000000;
	for (let m = options.begin; m <= options.end; m++) {
		speciesPerMonth[m] = speciesPerMonth[m] / options.higherTaxonPerMonth[m];
		speciesPerMonth[m] = Math.round(speciesPerMonth[m] * roundness) / (roundness / 100);
	}
	return speciesPerMonth;
}

// Get summary of all data
function getAll() {
	$.ajax({
		method: "GET",
		url: "http://192.168.56.10:9200/" + options.indexName + "/_search",
		beforeSend: function (xhr) {
		    xhr.setRequestHeader ("Authorization", "Basic " + btoa("elastic" + ":" + "changeme"));
		}
	})
	.done(function(elasticData) {
//		console.log( data );
		let count = elasticData.hits.total;
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted + " occurrences");
		$("#container").html("");
	});
}

function getTaxon() {
	let queryData = JSON.stringify({
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
	});
	console.log(queryData);

	$.ajax(getAjaxParams(queryData))
	.done(function(elasticData) {
		console.log(elasticData);

		let count = elasticData.hits.total;
		if (0 == count)
		{
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
	});
}

// -----------------------------------
// FORMAT DATA

// Create a Highchart
function printHighchart(observationsPerMonth, species, chartTitle, yAxisTitle)
{
	console.log(observationsPerMonth);

//	let observationsPerMonth = getObservationsPerMonth(elasticData); // ABBA
	let data = getHighchartsDataSeries(observationsPerMonth, species);

	let categories = [];

	for (let m = options.begin; m <= options.end; m++) {
		categories.push(m);
	}
	console.log(categories);

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

	console.log(series);
	return series;
}
