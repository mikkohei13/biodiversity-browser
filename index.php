<?php $version = "?v=" . date("YmdHis"); ?>
<!DOCTYPE html>
<html lang="en" class="no-js">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Biodiversity Browser</title>
		<link rel="shortcut icon" href="favicon.ico">

		<link href="https://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet">
		<link rel="stylesheet" href="media/app.css<?php echo $version; ?>" media="all" />
		<link rel="stylesheet" href="node_modules/leaflet/dist/leaflet.css" media="all" />

	    <script src="keys.js<?php echo $version; ?>"></script>
	    <script src="node_modules/jquery/dist/jquery.min.js"></script>
	    <script src="node_modules/highcharts/highcharts.js"></script>
	    <script src="node_modules/leaflet/dist/leaflet.js"></script>
	    <script src="node_modules/latlon-geohash/latlon-geohash.js"></script>

		</script>
	</head>
	<body>
		<header>
			<h1>Biodiversity Browser</h1>
			<span id="tagline">85+ million occurrence records from Scandinavia</span>
			<ul id="nav">
				<li><a href="#" id="chartpage" class="active">Species chart</a></li>
				<li><a href="#" id="mappage">Species map</a></li>
				<li><a href="#" id="classpage">Classes</a></li>
				<li><a href="#" id="sourcepage">Sources</a></li>
				<li><a href="#" id="aboutpage">About</a></li>
			</ul>
		</header>


<?php 
if ("significant" != $_GET['type']) {
?>
		<div id="form">

			<div id="namesearch">
				<h4>Search for a species (scientific name):</h4>
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
				<h2 id="heading"></h2>
				<span id="total"></span>
				<div id="mapid"></div>
				<div id="container"></div>
			</div>

		</div>

		<script src="elasticquery.js<?php echo $version; ?>"></script>
		<script src="app.js<?php echo $version; ?>"></script>
		</script>
	</body>
</html>
