<!DOCTYPE html>
<html lang="en" class="no-js">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Biodiversity Browser</title>

		<style>
		.bar {
			display: block;
			background-color: #d00;
			height: 1em;
			margin: 2px;
		}
		</style>

	    <script src="http://code.jquery.com/jquery-3.1.1.min.js">

		</script>
	</head>
	<body>
		<h1>Biodiversity Browser</h1>

			<input type="text" id="species"></input>
			<div id="results">
				<h2 id="query"></h2>
				<span id="total"></span> records
				<div id="chart"></div>
			</div>


		<script src="main.js">
		</script>
	</body>
</html>
