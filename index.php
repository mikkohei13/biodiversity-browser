<!DOCTYPE html>
<html lang="en" class="no-js">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Biodiversity Browser</title>
		<link rel="shortcut icon" href="favicon.ico">

		<link href="https://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet">
		<link rel="stylesheet" href="media/app.css" media="all" />

	    <script src="node_modules/jquery/dist/jquery.min.js"></script>
	    <script src="node_modules/highcharts/highcharts.js"></script>

		</script>
	</head>
	<body>
		<header>
			<h1>Biodiversity Browser</h1>
			<span id="tagline">51+ million Swedish occurrence records from GBIF</span>
			<ul id="nav">
				<li><a href="#" id="chart" class="active">Species chart</a></li>
				<li><a href="#" id="map">Species map</a></li>
				<li><a href="#" id="class">Classes</a></li>
				<li><a href="#" id="about">About</a></li>
			</ul>
		</header>


<?php 
if ("significant" != $_GET['type']) {
?>
		<div id="form">

			<h4>Search for a species (scientific name):</h4>
			<div id="namesearch">
				<input type="text" id="species"></input>
				<button name="search" id="search">Search</button>
				<div id="ladda"></div>
			</div>

			<div id="comparison">
				Compare to<br>
				<label><input type="radio" name="rank" value="no" checked>No comparison</label><br>
				<label><input type="radio" name="rank" value="class">Class</label><br>
				<label><input type="radio" name="rank" value="order">Order</label><br>
				<label><input type="radio" name="rank" value="family">Family</label>
			</div>

			<div id="aggrtype">
				Aggregate by<br>
				<label><input type="radio" name="aggrtype" value="year" checked>Year</label><br>
				<label><input type="radio" name="aggrtype" value="month">Month</label>
			</div>

		</div>
<?php
}
?>
		<div id="content">

			<div id="results">
				<h2 id="query"></h2>
				<span id="total"></span>
				<div id="chart"></div>
				<div id="container"></div>
			</div>

		</div>

		<script src="elasticquery.js"></script>
		<script src="app.js"></script>
		</script>
	</body>
</html>
