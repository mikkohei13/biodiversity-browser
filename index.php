<!DOCTYPE html>
<html lang="en" class="no-js">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Biodiversity Browser</title>
		<link rel="shortcut icon" href="favicon.ico">
		<link rel="stylesheet" href="media/app.css" media="all" />

	    <script src="node_modules/jquery/dist/jquery.min.js"></script>
	    <script src="node_modules/highcharts/highcharts.js"></script>

		</script>
	</head>
	<body>
		<h1>Biodiversity Browser</h1>

		<div id="form">
			<input type="text" id="species"></input>
			<button name="search" id="search">Search</button>
			<div id="ladda"></div>

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

		<div id="results">
			<h2 id="query"></h2>
			<span id="total"></span>
			<div id="chart"></div>
			<div id="container"></div>
		</div>

		<script src="app.js">
		</script>
	</body>
</html>
