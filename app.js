
console.log("Elastic");
console.log("=====================");

/*
TODO:
Check if return exact matches or partial matches
Search button
handle incorrect species names
rerun script on radiobutton change
refactor
*/

var options = {};

options.indexName = "baltic-aves";


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

		let comparisonTaxon = elasticData.hits.hits[0]._source[options.comparisonRank];
		options.comparisonTaxon = comparisonTaxon;

		console.log(comparisonTaxon);

		getHigherTaxon(comparisonTaxon);
	});
}

function getHigherTaxon(comparisonTaxon)
{
	console.log(options.comparisonRank);
	// First get species data
	let queryObject = {
    	"query" : {
        	"term" : {
        		
        	}
    	},
    	"aggregations" : {
    		"observationsPerMonth" : {
    			"terms" : {
    				"field" : "month",
    				"size" : 12
    			}
    		}
    	}
	};
	queryObject.query.term[options.comparisonRank] = comparisonTaxon; // Pre-ES6, see http://stackoverflow.com/questions/2274242/using-a-variable-for-a-key-in-a-javascript-object-literal

	let queryData = JSON.stringify(queryObject);
	console.log(queryData);

	$.ajax(getAjaxParams(queryData))
	.done(function(elasticData) {
		console.log(elasticData);

		// Highcharts
//		printHighchart(elasticData, comparisonTaxon);

		options.higherTaxonPerMonth = getObservationsPerMonth(elasticData); // Data to global var



		// Show count
		/*
		let count = elasticData.hits.total;
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted);
		*/

		getSpecies();

		
	});
}

function getSpecies() {
	let queryData = JSON.stringify({
    	"query" : {
        	"term" : {
        		"species" : options.species
        	}
    	},
    	"aggregations" : {
    		"observationsPerMonth" : {
    			"terms" : {
    				"field" : "month",
    				"size" : 12
    			}
    		}
    	}
	});
	console.log(queryData);

	$.ajax(getAjaxParams(queryData))
	.done(function(elasticData) {
		console.log(elasticData);

		let speciesPerMonth = getObservationsPerMonth(elasticData);

		// Calculate proportion of higher taxon observations
		for (var m = 1; m <= 12; m++) {
			speciesPerMonth[m] = speciesPerMonth[m] / options.higherTaxonPerMonth[m];
		}
		console.log(speciesPerMonth);

		printHighchart(speciesPerMonth, options.species, (options.species + " proportion of " + options.comparisonTaxon), "Proportion");

		// Show count
		let count = elasticData.hits.total;
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted);
	});
}

// Get summary of all data
function getAll() {
	$.ajax({
		method: "GET",
		url: "http://192.168.56.10:9200/baltic-aves/_search",
		beforeSend: function (xhr) {
		    xhr.setRequestHeader ("Authorization", "Basic " + btoa("elastic" + ":" + "changeme"));
		}
	})
	.done(function(elasticData) {
//		console.log( data );
		let count = elasticData.hits.total;
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted);
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
    				"field" : "month",
    				"size" : 12
    			}
    		}
    	}
	});
	console.log(queryData);

	$.ajax(getAjaxParams(queryData))
	.done(function(elasticData) {
		console.log(elasticData);

		// Highcharts
		let observationsPerMonth = getObservationsPerMonth(elasticData);
		printHighchart(observationsPerMonth, options.species, options.species, "Occurrences");

		// Show count
		let count = elasticData.hits.total;
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted);
	});
}

// -----------------------------------
// FORMAT DATA

// Create a Highchart
function printHighchart(observationsPerMonth, species, chartTitle, yAxisTitle)
{
//	let observationsPerMonth = getObservationsPerMonth(elasticData); // ABBA
	let data = getHighchartsDataSeries(observationsPerMonth, species);

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
	            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	            title: {
	            	text: 'Month'
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
	for (var m = 1; m <= 12; m++) {
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

	for (let m = 1; m <= 12; m++) {
		data.push(observationsPerMonth[m]);
	}

	series[0] = {
		"name" : seriesName,
		"data" : data
	};

	console.log(series);
	return series;
}
