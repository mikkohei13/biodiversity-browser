"use strict";

var elasticQueryModule = (function () {
	// Gets connection parameters as jQuery-compatible object
	function getAjaxParams(queryData) {
		return {
			method: "POST",
			url: elasticUrl + options.indexName + "/_search",
			data: queryData,
			beforeSend: function (xhr) {
			    xhr.setRequestHeader ("Authorization", "Basic " + btoa(elasticUsername + ":" + elasticPassword));
			}
		}	
	}

	// Do Elasticsearch query using jQuery AJAX, call callback function
	function query(queryObject, callbackFunction)
	{
		let queryJSON = JSON.stringify(queryObject);
		$.ajax(getAjaxParams(queryJSON)).done(callbackFunction);
	}

	// Reveal public pointers to private functions and properties
	return {
		query : query
	};
})();


