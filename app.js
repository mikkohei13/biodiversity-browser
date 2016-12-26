
console.log("Elastic");
console.log("=====================");

/*
Check if return exact matches or partial matches
*/

$(document).ready(function() {
	$("#query").text("Total");
	getAll();
	let debugName = "Luscinia luscinia"; dataQuery(debugName); $("#query").text("Debugging with " + debugName); // DEBUG
});

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
	.done(function(dataobject) {
		console.log(dataobject);

		// Show monthly distribution
		let observationsPerMonth = getObservationsPerMonth(dataobject);
		printMontlhyChart(observationsPerMonth);

		// Show count
		let count = dataobject.hits.total;
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted);
	});
}

function printMontlhyChart(observationsPerMonth)
{
	console.log("-----");
	let html = "<!-- Monthly chart: -->\n";

	for (var m = 1; m <= 12; m++) {
		let count = observationsPerMonth[m];
		let width;

		// Handle missing months
/*		if (undefined == count)
		{
			count = 0;
		}
		*/
		width = count / 100;

		html = html + "<span style='width: " + width + "px;' class='bar month" + m + "'>&nbsp;</span>" + count + "\n";
	}
	console.log(html);
	$("#container").html(html);
}

function getObservationsPerMonth(dataobject)
{
	let monthlyBuckets = dataobject.aggregations.observationsPerMonth.buckets;
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

function getSpecies(species) {
	$.ajax({
		method: "GET",
		url: "http://192.168.56.10:9200/baltic-aves/_search?q=species:" + species,
		beforeSend: function (xhr) {
		    xhr.setRequestHeader ("Authorization", "Basic " + btoa("elastic" + ":" + "changeme"));
		}
	})
	.done(function(data) {
//		console.log( data );
		let count = data.hits.total;
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted);
	});
}

function getAll(species) {
	$.ajax({
		method: "GET",
		url: "http://192.168.56.10:9200/baltic-aves/_search",
		beforeSend: function (xhr) {
		    xhr.setRequestHeader ("Authorization", "Basic " + btoa("elastic" + ":" + "changeme"));
		}
	})
	.done(function(data) {
//		console.log( data );
		let count = data.hits.total;
		let countFormatted = count.toLocaleString();
		$("#total").text(countFormatted);
	});
}
