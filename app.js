
console.log("Elastic");
console.log("=====================");

/*
TODO:
Check if return exact matches or partial matches
Search button
*/

// -----------------------------------
// EVENTS

// Page load
$(document).ready(function() {
	$("#query").text("Total");
	getAll();
	let debugName = "Luscinia luscinia"; dataQuery(debugName); $("#query").text("Debugging with " + debugName); // DEBUG
});

// Name search (enter)
$("#species").keypress(function(event) {
	if (event.which == 13) {
		let species = $("#species").val();
		if (species == "")
		{
			$("#query").text("Total");
			getAll();
		}
		else
		{
			$("#query").text(species);
//			getSpecies(species); // OLD function call
			dataQuery(species); // NEW function call
		}
//		console.log(species);
	}
});

// -----------------------------------
// QUERY ELASTIC

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

function dataQuery(species) {
	let queryData = JSON.stringify({
    	"query" : {
        	"term" : {
        		"species" : species
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

	$.ajax({
		method: "POST",
		url: "http://192.168.56.10:9200/baltic-aves/_search",
		data: queryData,
		beforeSend: function (xhr) {
		    xhr.setRequestHeader ("Authorization", "Basic " + btoa("elastic" + ":" + "changeme"));
		}
	})
	.done(function(elasticData) {
		console.log(elasticData);

		let observationsPerMonth = getObservationsPerMonth(elasticData);

		// Highcharts
		printHighchart(observationsPerMonth, species);

		// Show count
		let count = elasticData.hits.total;
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted);
	});
}

// -----------------------------------
// FORMAT DATA

function getObservationsPerMonth(elasticData)
{
	let monthlyBuckets = elasticData.aggregations.observationsPerMonth.buckets;
	let monthlyObservations = {};

	console.log(monthlyBuckets);

	// Note this can't handle missing months
	for (var i = monthlyBuckets.length - 1; i >= 0; i--) {
		monthlyObservations[monthlyBuckets[i].key] = monthlyBuckets[i].doc_count;
	}

//	console.log(monthlyObservations);
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

// Highcharts
function printHighchart(observationsPerMonth, species)
{
	let data = getHighchartsDataSeries(observationsPerMonth, species);

	$(function () { 
	    var myChart = Highcharts.chart('container', {
	        chart: {
	            type: 'column'
	        },
	        title: {
	            text: species
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
	                text: 'Observations'
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
