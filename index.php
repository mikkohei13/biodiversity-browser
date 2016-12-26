<!DOCTYPE html>
<html lang="en" class="no-js">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Biodiversity Browser</title>
		<link rel="shortcut icon" href="favicon.ico">

		<style>
		.bar
		{
			display: block;
			background-color: #d00;
			height: 1em;
			margin: 2px;
		}
		#container
		{
			 width:100%;
			 height:400px;
		}
		</style>

	    <script src="node_modules/jquery/dist/jquery.min.js"></script>
	    <script src="node_modules/highcharts/highcharts.js"></script>

		</script>
	</head>
	<body>
		<h1>Biodiversity Browser</h1>

			<input type="text" id="species"></input><br>

			Compare to<br>
			<input type="radio" name="rank" value="no" checked>No comparison<br>
			<input type="radio" name="rank" value="class">Class<br>
			<input type="radio" name="rank" value="order">Order<br>
			<input type="radio" name="rank" value="family">Family<br>

			<div id="results">
				<h2 id="query"></h2>
				<span id="total"></span> records
				<div id="chart"></div>
				<div id="container"></div>
			</div>


		<script src="app.js">
		</script>
	</body>
</html>
