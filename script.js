let global;
let first;
let filters = [];
let second;

function reset() {
	filters = [];
	updateCharts();
}

function displaySnackbar(val) {
	const snackbar = document.getElementById("snackbar");
	snackbar.className = "show";
	snackbar.innerHTML = `Filtering by ${val}`;
	setTimeout(function () {
		snackbar.className = "hide";
		snackbar.innerHTML = "";
	}, 3000);
}

async function parse() {
	const response = await fetch("data.csv");
	const data = await response.text();
	Papa.parse(data, {
		dynamicTyping: true,
		header: true,
		complete: initialize
	});
}
window.addEventListener("load", parse);

function initialize(results, file) {
	const data = results.data;
	global = new Bird(data);
	updateDropdowns();
	updateCharts();
}

function updateDropdowns() {
	const dates = global["Date"].unique();
	const startElement = document.getElementById("start-date");
	const endElement = document.getElementById("end-date");
	for (const date of dates) {
		const startOption = document.createElement("option");
		startOption.value = date;
		startOption.text = date;
		startElement.add(startOption);
		const endOption = document.createElement("option");
		endOption.value = date;
		endOption.text = date;
		endElement.add(endOption);
	}
	startElement.selectedIndex = 0;
	endElement.selectedIndex = dates.length - 1;	
}

function updateCharts() {
	const startDate = document.getElementById("start-date").value;
	const endDate = document.getElementById("end-date").value;
	first = global.filterby(row => row["Date"] >= startDate && row["Date"] <= endDate);
	const n = filters.length;
	if (n === 0) {
		second = first;
	}
	if (n > 0) {
		var col = filters[0][0];
		var val = filters[0][1];
		second = first.filterby(row => row[col] === val);
	} 
	if (n > 1) {
		for (let i = 1; i < n; i++) {
			const filter = filters[i];
			var col = filter[0];
			var val = filter[1];
			second = second.filterby(row => row[col] === val);
		}
	}
	updateCommanderBar();
	updatePlayerBar();
	updateArchetypeCharts();
	updateColorCharts();
}

function updateCommanderBar() {
	let playerData = second.filterby(row => row["Player"] !== "Winner");
	let winnerData = second.filterby(row => row["Player"] === "Winner");
	let bird = new Bird();
	bird["Commander"] = playerData["Commander"].unique();
	bird["# Games"] = bird["Commander"].map(x => playerData["Commander"].countif(y => y === x));
	bird["# Wins"] = bird["Commander"].map(x => winnerData["Commander"].countif(y => y === x));
	bird["# Losses"] = bird.sub(["# Games", "# Wins"]);
	bird["Win %"] = bird.div(["# Wins", "# Games"]);
	bird = bird.sortby("Commander", -1);
	bird = bird.sortby("# Games", 1);
	bird = bird.sortby("# Wins", 1);
	bird = bird.tail(15);
	const pattern = /^(.*?)(?=\s\/\/|,).*(?<=\/\/\s)(.*?)(?=,|$).*$/;
	const replacement = "$1 // $2";
	bird["Commander Repl"] = bird["Commander"].replace(pattern, replacement);
	const maxGames = bird["# Games"].max();
	Plotly.newPlot("commander-bar", [{
		type: "bar",
		x: bird["# Wins"].toArray(),
		y: bird["Commander Repl"].toArray(),
		name: "# Wins",
		hovertemplate: "%{y}<br>%{x} (%{customdata:.1%})<extra></extra>",
		customdata: bird["Win %"].toArray(),
		orientation: "h",
		marker: {
			color: "rgb(3, 155, 229)"
		},
		textfont: { color: "white", family: "Arial" },
		hoverlabel: {
			bordercolor: "white",
			font: { color: "white", family: "Arial" },
		}
	}, {
		type: "bar",
		x: bird["# Losses"].toArray(),
		y: bird["Commander Repl"].toArray(),
		name: "# Losses",
		text: bird["Win %"].toArray(),
		textposition: "outside",
		texttemplate: "%{customdata:.1%}",
		hovertemplate: "%{y}<br>%{x} (%{customdata:.1%})<extra></extra>",
		customdata: bird["Win %"].toArray(),
		orientation: "h",
		marker: {
			color: "rgb(79, 195, 247)"
		},
		textfont: { color: "white", family: "Arial" },
		hoverlabel: {
			bordercolor: "black",
			font: { color: "black", family: "Arial" },
		}
	}], {
		barmode: "stack",
		legend: {
			font: {color: "white", family: "Arial"},
			traceorder: "normal",
			x: 1,
			xanchor: "right",
			y: 0,
			bgcolor: "rgba(0,0,0,0)"
		},
		margin: { l: 150, r: 25, b: 25, t: 25 },
		xaxis: {
			range: [0, (6 * maxGames) / 5],
			mirror: "ticks",
			gridcolor: "black",
			zerolinecolor: "white",
			linecolor: "black",
			tickfont: { color: "white", family: "Arial" },
		},
		yaxis: {
			dtick: 1,
			mirror: "ticks",
			linecolor: "black",
			tickfont: { color: "white", family: "Arial" }
		},
		paper_bgcolor: "#1e1e1e",
		plot_bgcolor: "#232323",
		hovermode: "closest",
		width: 480,
		height: 300
	}, {
		displayModeBar: false
	});
	const chart = document.getElementById("commander-bar");
	chart.on('plotly_click', function(data) {
		console.log(data);
		console.log(data.points);
		console.log(data.points[0]);
		console.log(data.points[0].pointIndex);
		console.log(data.points[0].pointIndex);
		const val = bird["Commander"][data.points[0].pointIndex];
		filters.push(["Commander", val]);
		displaySnackbar(val);
		updateCharts();
	});
}

function updatePlayerBar() {
	let playerData = second.filterby(row => row["Player"] !== "Winner");
	let winnerData = second.filterby(row => row["Player"] === "Winner");
	let bird = new Bird();
	bird["Player"] = second["Name"].unique();
	bird["# Games"] = bird["Player"].map(x => playerData["Name"].countif(y => y === x));
	bird["# Wins"] = bird["Player"].map(x => winnerData["Name"].countif(y => y === x));
	bird["# Losses"] = bird.sub(["# Games", "# Wins"]);
	bird["Win %"] = bird.div(["# Wins", "# Games"]);
	bird = bird.sortby("Player", -1);
	bird = bird.sortby("# Games", 1);
	bird = bird.sortby("# Wins", 1);
	bird = bird.tail(15);
	maxGames = bird["# Games"].max();
	Plotly.newPlot("player-bar", [{
		type: "bar",
		x: bird["# Wins"].toArray(),
		y: bird["Player"].toArray(),
		name: "# Wins",
		hovertemplate: "%{y}<br>%{x} (%{customdata:.1%})<extra></extra>",
		customdata: bird["Win %"].toArray(),
		orientation: "h",
		marker: {
			color: "rgb(3, 155, 229)"
		},
		textfont: { color: "white", family: "Arial" },
		hoverlabel: {
			bordercolor: "white",
			font: { color: "white", family: "Arial" },
		}
	}, {
		type: "bar",
		x: bird["# Losses"].toArray(),
		y: bird["Player"].toArray(),
		name: "# Losses",
		text: bird["Win %"].toArray(),
		textposition: "outside",
		texttemplate: "%{customdata:.1%}",
		hovertemplate: "%{y}<br>%{x} (%{customdata:.1%})<extra></extra>",
		customdata: bird["Win %"].toArray(),
		orientation: "h",
		marker: {
			color: "rgb(79, 195, 247)"
		},
		textfont: { color: "white", family: "Arial" },
		hoverlabel: {
			bordercolor: "black",
			font: { color: "black", family: "Arial" },
		}
	}], {
		barmode: "stack",
		legend: {
			font: {color: "white", family: "Arial"},
			traceorder: "normal",
			x: 1,
			xanchor: "right",
			y: 0,
			bgcolor: "rgba(0,0,0,0)"
		},
		margin: { l: 100, r: 25, b: 25, t: 25 },
		xaxis: {
			range: [0, (6 * maxGames) / 5],
			mirror: "ticks",
			gridcolor: "black",
			zerolinecolor: "white",
			linecolor: "black",
			tickfont: { color: "white", family: "Arial" },
		},
		yaxis: {
			dtick: 1,
			mirror: "ticks",
			linecolor: "black",
			tickfont: { color: "white", family: "Arial" }
		},
		paper_bgcolor: "#1e1e1e",
		plot_bgcolor: "#232323",
		hovermode: "closest",
		width: 480,
		height: 300
	}, {
		displayModeBar: false
	});
	const chart = document.getElementById("player-bar");
	chart.on('plotly_click', function(data) {
		const val = data.points[0].y;
		filters.push(["Name", val]);
		displaySnackbar(val);
		updateCharts();
	});
}

function updateArchetypeCharts() {
	let playerData = second.filterby(row => row["Player"] !== "Winner");
	let winnerData = second.filterby(row => row["Player"] === "Winner");
	let bird = new Bird();
	bird["Archetype"] = playerData["Archetype"].unique();
	bird["# Games"] = bird["Archetype"].map(x => playerData["Archetype"].countif(y => y === x));
	bird["# Wins"] = bird["Archetype"].map(x => winnerData["Archetype"].countif(y => y === x));
	bird["Game %"] = bird["# Games"].div(bird["# Games"].sum());
	bird["Win %"] = bird["# Wins"].div(bird["# Wins"].sum());
	bird["Winningness"] = bird.sub(["Win %", "Game %"]);
	bird = bird.sortby("Winningness", 1);
	const minWinningness = bird["Winningness"].min();
	const maxWinningness = bird["Winningness"].max();
	Plotly.newPlot("archetype-bar", [{
		type: "bar",
		x: bird["Winningness"].toArray(),
		y: bird["Archetype"].toArray(),
		text: bird["Winningness"].toArray(),
		textposition: "outside",
		texttemplate: "%{x:+.1%}",
		hovertemplate: "%{y}<br>%{customdata} (%{x:+.1%})<extra></extra>",
		customdata: bird["# Wins"].toArray(),
		orientation: "h",
		marker: {
			color: "rgb(39, 170, 226)"
		},
		textfont: { color: "white", family: "Arial" },
		hoverlabel: {
			bordercolor: "black",
			font: { color: "black", family: "Arial" },
		},
	}], {
		margin: {
			l: 75,
			r: 25,
			b: 25,
			t: 25,
		},
		xaxis: {
			range: [
				(6 * minWinningness - maxWinningness) / 5,
				(6 * maxWinningness - minWinningness) / 5
			],
			mirror: "ticks",
			gridcolor: "black",
			zerolinecolor: "white",
			linecolor: "black",
			tickfont: { color: "white", family: "Arial" },
			tickformat: "+.1%"
		},
		yaxis: {
			dtick: 1,
			mirror: "ticks",
			linecolor: "black",
			tickfont: { color: "white", family: "Arial" },
		},
		paper_bgcolor: "#1e1e1e",
		plot_bgcolor: "#232323",
		hovermode: "closest",
		width: 480,
		height: 300,
	}, {
		displayModeBar: false
	});
	const bar = document.getElementById("archetype-bar");
	bar.on('plotly_click', function(data) {
		var val = data.points[0].y;
		filters.push(["Archetype", val]);
		displaySnackbar(val);
		updateCharts();
	});
	bird = bird.sortby("# Games", -1);
	N = bird.length;
	const [chartColors, textColors] = generateColors([2, 136, 209], [129, 212, 250], N);
	Plotly.newPlot("archetype-pie", [{
		type: "pie",
		showlegend: false,
		values: bird["# Games"].toArray(),
		labels: bird["Archetype"].toArray(),
		textposition: "outside",
		texttemplate: "%{label}<br>%{percent:.1%}",
		hovertemplate: "%{label}<br>%{value} (%{percent:.1%})<extra></extra>",
		marker: {
			colors: chartColors,
			line: { color: "black", width: 1 }
		},
		textfont: { color: "white", family: "Arial" },
		direction: "clockwise",
		hole: 0.5,
		hoverlabel: {
			bordercolor: textColors,
			font: { color: textColors, family: "Arial" }
		},
		sort: false,
	}], {
		margin: { l: 50, r: 50, b: 50, t: 50 },
		paper_bgcolor: "#1e1e1e",
		width: 480,
		height: 300
	}, {
		displayModeBar: false
	});
	const pie = document.getElementById("archetype-pie");
	pie.on('plotly_click', function (data) {
		var val = data.points[0].label;
		filters.push(["Archetype", val]);
		displaySnackbar(val);
		updateCharts();
	});
}

function updateColorCharts() {
	let playerData = second.filterby(row => row["Player"] !== "Winner");
	let winnerData = second.filterby(row => row["Player"] === "Winner");
	let bird = new Bird();
	bird["Color"] = playerData["Color"].unique();
	bird["# Games"] = bird["Color"].map(x => playerData["Color"].countif(y => y === x));
	bird["# Wins"] = bird["Color"].map(x => winnerData["Color"].countif(y => y === x));
	bird["Game %"] = bird["# Games"].div(bird["# Games"].sum());
	bird["Win %"] = bird["# Wins"].div(bird["# Wins"].sum());
	bird["Winningness"] = bird.sub(["Win %", "Game %"]);
	bird = bird.sortby("Winningness", 1);
	const minWinningness = bird["Winningness"].min();
	const maxWinningness = bird["Winningness"].max();
	const threshold = bird["# Games"].sum() * 0.025; // Good number
	const other = bird["# Games"].sumif(val => val <= threshold);
	bird = bird.filterby(row => row["# Games"] >= threshold);
	Plotly.newPlot("color-bar", [{
		type: "bar",
		x: bird["Winningness"].toArray(),
		y: bird["Color"].toArray(),
		text: bird["Winningness"].toArray(),
		textposition: "outside",
		texttemplate: "%{x:+.1%}",
		hovertemplate: "%{y}<br>%{customdata} (%{x:+.1%})<extra></extra>",
		customdata: bird["# Wins"].toArray(),
		orientation: "h",
		marker: {
			color: "rgb(39, 170, 226)"
		},
		textfont: { color: "white", family: "Arial" },
		hoverlabel: {
			bordercolor: "black",
			font: { color: "black", family: "Arial" },
		},
	}], {
		margin: {
			l: 75,
			r: 25,
			b: 25,
			t: 25,
		},
		xaxis: {
			range: [
				(6 * minWinningness - maxWinningness) / 5,
				(6 * maxWinningness - minWinningness) / 5
			],
			mirror: "ticks",
			gridcolor: "black",
			zerolinecolor: "white",
			linecolor: "black",
			tickfont: { color: "white", family: "Arial" },
			tickformat: "+.1%"
		},
		yaxis: {
			dtick: 1,
			mirror: "ticks",
			linecolor: "black",
			tickfont: { color: "white", family: "Arial" },
		},
		paper_bgcolor: "#1e1e1e",
		plot_bgcolor: "#232323",
		hovermode: "closest",
		width: 480,
		height: 300,
	}, {
		displayModeBar: false
	});
	const bar = document.getElementById("color-bar");
	bar.on('plotly_click', function(data) {
		var val = data.points[0].y;
		filters.push(["Color", val]);
		displaySnackbar(val);
		updateCharts();
	});
	bird = bird.sortby("# Games", -1);
	if (other > 0) {
		bird.data.push({"Color": "Other", "# Games": other});
	}
	N = bird.length;
	const [chartColors, textColors] = generateColors([2, 136, 209], [129, 212, 250], N);
	Plotly.newPlot("color-pie", [{
		type: "pie",
		showlegend: false,
		values: bird["# Games"].toArray(),
		labels: bird["Color"].toArray(),
		textposition: "outside",
		texttemplate: "%{label}<br>%{percent:.1%}",
		hovertemplate: "%{label}<br>%{value} (%{percent:.1%})<extra></extra>",
		marker: {
			colors: chartColors,
			line: { color: "black", width: 1 }
		},
		textfont: { color: "white", family: "Arial" },
		direction: "clockwise",
		hole: 0.5,
		hoverlabel: {
			bordercolor: textColors,
			font: { color: textColors, family: "Arial" }
		},
		sort: false,
	}], {
		margin: { l: 50, r: 50, b: 50, t: 50 },
		paper_bgcolor: "#1e1e1e",
		width: 480,
		height: 300
	}, {
		displayModeBar: false
	});
	const pie = document.getElementById("color-pie");
	pie.on('plotly_click', function (data) {
		var val = data.points[0].label;
		filters.push(["Color", val]);
		displaySnackbar(val);
		updateCharts();
	});
}

/**
 * Generates a number of colors between two RGB values, inclusive.
 * @param {Array} color1 - The first color.
 * @param {Array} color2 - The second color.
 * @param {number} N - The number of colors to generate.
 * @returns {Array[]} A number of colors.
 */
function generateColors(color1, color2, N) {
	const chartColors = [];
	const textColors = [];
	for (let i = 0; i < N; i++) {
		const r = Math.round(color1[0] + (i / (N - 1)) * (color2[0] - color1[0]));
		const g = Math.round(color1[1] + (i / (N - 1)) * (color2[1] - color1[1]));
		const b = Math.round(color1[2] + (i / (N - 1)) * (color2[2] - color1[2]));
		chartColors.push(`rgb(${r}, ${g}, ${b})`);
		const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		textColors.push(lum > 0.5 ? 'black' : 'white');
	}
	return [chartColors, textColors];
}
