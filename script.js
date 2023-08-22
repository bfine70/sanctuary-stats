/*
 _____           _____ _    _ ____   ____          _____  _____  
|  __ \   /\    / ____| |  | |  _ \ / __ \   /\   |  __ \|  __ \ 
| |  | | /  \  | (___ | |__| | |_) | |  | | /  \  | |__) | |  | |
| |  | |/ /\ \  \___ \|  __  |  _ <| |  | |/ /\ \ |  _  /| |  | |
| |__| / ____ \ ____) | |  | | |_) | |__| / ____ \| | \ \| |__| |
|_____/_/    \_\_____/|_|  |_|____/ \____/_/    \_\_|  \_\_____/ 

*/

let bert;
let ernie;

async function parse() {
	console.log("Working");
	const response = await fetch("data.csv");
	const data = await response.text();
	Papa.parse(data, {
		dynamicTyping: true,
		header: true,
		complete: function (results, _) {
			bert = Birds.fromCSV(results.data);
			ernie = bert.copy();
			dropdowns();
			charts();
		}
	});
}

window.addEventListener("load", parse);

function reset() {
	bert = ernie.copy();
	charts();
}

function dropdowns() {
	const ids = ["start-date", "end-date"];
	const dates = bert.unique(["Date"]);
	for (const id of ids) {
		const select = document.getElementById(id);
		for (const date of dates) {
			const option = document.createElement("option");
			option.value = date;
			option.text = date;
			select.add(option);
		}
		select.selectedIndex = 0;
	}
} // TODO: end-date selected index -> max

function charts() {
	const start = document.getElementById("start-date").value;
	const end = document.getElementById("end-date").value;
	const filteredData = bert.filterby(row => {
		return row["Date"] >= start && row["Date"] <= end;
	});

	commanderBar(filteredData);
	playerBar(filteredData);
	archetypeCharts(filteredData);
	colorCharts(filteredData);
}

function snackbar(val) {
	const snackbar = document.getElementById("snackbar");
	snackbar.className = "show";
	snackbar.innerHTML = `Filtering by ${val}`;
	setTimeout(function () {
		snackbar.className = "hide";
		snackbar.innerHTML = "";
	}, 3000);
}

function commanderBar(data) {
	let elmo = data.filterby(row => row["Player"] !== "Winner");
	let abby = data.filterby(row => row["Player"] === "Winner");

	let bigBird = new Birds({});
	bigBird["Commander"] = elmo.unique(["Commander"]);
	bigBird["# Games"] = bigBird["Commander"].map(value => elmo.countif(["Commander"], val => val === value));
	bigBird["# Wins"] = bigBird["Commander"].map(value => abby.countif(["Commander"], val => val === value));
	bigBird["# Losses"] = bigBird.subtract(["# Games", "# Wins"]);
	bigBird["Win %"] = bigBird.divide(['# Wins', '# Games']);

	// pattern = /^(.*?)(?=\s\/\/|,).*(?<=\/\/\s)(.*?)(?=,|$).*$/;
	// replacement = "$1 // $2";
	// bert["Commander"] = bert.replace(["Commander"], pattern, replacement);

	bigBird = bigBird.sortby("Commander", -1)
	bigBird = bigBird.sortby("# Games", 1);
	bigBird = bigBird.sortby("# Wins", 1);
	bigBird = bigBird.tail(15);

	maxGames = bigBird.max(["# Games"]);

	Plotly.newPlot("commander-bar", [{
		type: "bar",
		x: bigBird["# Wins"],
		y: bigBird["Commander"],
		name: "# Wins",
		hovertemplate: "%{y}<br>%{x} (%{customdata:.1%})<extra></extra>",
		customdata: bigBird["Win %"],
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
		x: bigBird["# Losses"],
		y: bigBird["Commander"],
		name: "# Losses",
		text: bigBird["Win %"],
		textposition: "outside",
		texttemplate: "%{customdata:.1%}",
		hovertemplate: "%{y}<br>%{x} (%{customdata:.1%})<extra></extra>",
		customdata: bigBird["Win %"],
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
	chart.on('plotly_click', function (data) {
		const val = data.points[0].y;
		bert = bert.filterby(row => row["Commander"] === val);
		snackbar(val);
		charts();
	});
}

function playerBar(data) {
	let elmo = data.filterby(row => row["Player"] !== "Winner");
	let abby = data.filterby(row => row["Player"] === "Winner");

	let bigBird = new Birds({});
	bigBird["playerValues"] = elmo.unique(["Name"]);
	bigBird["playerCounts"] = bigBird["playerValues"].map(value => elmo.countif(["Name"], val => val === value));
	bigBird["winnerCounts"] = bigBird["playerValues"].map(value => abby.countif(["Name"], val => val === value));
	bigBird["loserCounts"] = bigBird.subtract(["playerCounts", "winnerCounts"])
	bigBird["winPercent"] = bigBird.divide(['winnerCounts', 'playerCounts']);

	bigBird = bigBird.sortby("playerValues", -1)
	bigBird = bigBird.sortby("playerCounts", 1);
	bigBird = bigBird.sortby("winnerCounts", 1);
	bigBird = bigBird.tail(15);

	maxGames = bigBird.max(["playerCounts"]);

	Plotly.newPlot("player-bar", [{
		type: "bar",
		x: bigBird["winnerCounts"],
		y: bigBird["playerValues"],
		name: "# Wins",
		hovertemplate: "%{y}<br>%{x} (%{customdata:.1%})<extra></extra>",
		customdata: bigBird["winPercent"],
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
		x: bigBird["loserCounts"],
		y: bigBird["playerValues"],
		name: "# Losses",
		text: bigBird["winPercent"],
		textposition: "outside",
		texttemplate: "%{customdata:.1%}",
		hovertemplate: "%{y}<br>%{x} (%{customdata:.1%})<extra></extra>",
		customdata: bigBird["winPercent"],
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
	chart.on('plotly_click', function (data) {
		var val = data.points[0].y;
		bert = bert.filterby(row => row["Name"] == val);
		snackbar(val);
		charts();
	});
}

function archetypeCharts(data) {
	let elmo = data.filterby(row => row["Player"] !== "Winner");
	let abby = data.filterby(row => row["Player"] === "Winner");

	let bird = new Birds({});
	bird["playerValues"] = elmo.unique(["Archetype"]);
	bird["playerCounts"] = bird["playerValues"].map(value => elmo.countif(["Archetype"], val => val === value));
	bird["winnerCounts"] = bird["playerValues"].map(value => abby.countif(["Archetype"], val => val === value));
	bird["playerPros"] = bird.weights(["playerCounts"]);
	bird["winnerPros"] = bird.weights(["winnerCounts"]);
	bird["winningness"] = bird.subtract(["winnerPros", "playerPros"]);

	bird = bird.sortby('winningness');

	const minWinningness = bird.min(['winningness']);
	const maxWinningness = bird.max(['winningness']);

	Plotly.newPlot("archetype-bar", [{
		type: "bar",
		x: bird["winningness"],
		y: bird["playerValues"],
		text: bird["winningness"],
		textposition: "outside",
		texttemplate: "%{x:+.1%}",
		hovertemplate: "%{y}<br>%{customdata} (%{x:+.1%})<extra></extra>",
		customdata: bird["winnerCounts"],
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
	bar.on('plotly_click', function (data) {
		var val = data.points[0].y;
		bert = bert.filterby(row => row["Archetype"] == val);
		snackbar(val);
		charts();
	});

	bird = bird.sortby("playerCounts", -1);

	N = bird.size[0];
	const [chartColors, textColors] = generateColors([2, 136, 209], [129, 212, 250], N);

	Plotly.newPlot("archetype-pie", [{
		type: "pie",
		showlegend: false,
		values: bird["playerCounts"],
		labels: bird["playerValues"],
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
		bert = bert.filterby(row => row["Archetype"] == val);
		snackbar(val);
		charts();
	});
}

function colorCharts(data) {
	let elmo = data.filterby(row => row["Player"] !== "Winner");
	let abby = data.filterby(row => row["Player"] === "Winner");

	let bigBird = new Birds({});
	bigBird["playerValues"] = data.unique(["Color"]);
	bigBird["playerCounts"] = bigBird["playerValues"].map(value => elmo.countif(["Color"], val => val === value));
	bigBird["winnerCounts"] = bigBird["playerValues"].map(value => abby.countif(["Color"], val => val === value));
	bigBird["playerPros"] = bigBird.weights(["playerCounts"]);
	bigBird["winnerPros"] = bigBird.weights(["winnerCounts"]);
	bigBird["winningness"] = bigBird.subtract(["winnerPros", "playerPros"]);

	bigBird = bigBird.sortby('winningness');

	const minWinningness = bigBird.min(['winningness']);
	const maxWinningness = bigBird.max(['winningness']);

	const threshold = bigBird.sum(['playerCounts']) * 0.025; // feels good
	const otherCount = bigBird.sumif(["playerCounts"], val => val <= threshold, ["playerCounts"]);
	bigBird = bigBird.filterby(row => row["playerCounts"] > threshold);

	Plotly.newPlot("color-bar", [{
		type: "bar",
		x: bigBird["winningness"],
		y: bigBird["playerValues"],
		text: bigBird["winningness"],
		textposition: "outside",
		texttemplate: "%{x:+.1%}",
		hovertemplate: "%{y}<br>%{customdata} (%{x:+.1%})<extra></extra>",
		customdata: bigBird["winnerCounts"],
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
		margin: { l: 75, r: 25, b: 25, t: 25 },
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

	const bar = document.getElementById("color-bar");
	bar.on('plotly_click', function (data) {
		var val = data.points[0].y;
		bert = bert.filterby(row => row["Color"] == val);
		snackbar(val);
		charts();
	});

	bigBird = bigBird.sortby("playerCounts", -1);
	if (otherCount > 0) {
		bigBird["playerValues"] = bigBird["playerValues"].concat("Other");
		bigBird["playerCounts"] = bigBird["playerCounts"].concat(otherCount);
	}

	const N = bigBird.size[0];
	const [chartColors, textColors] = generateColors([2, 119, 189], [179, 229, 252], N);

	Plotly.newPlot("color-pie", [{
		type: "pie",
		showlegend: false,
		values: bigBird["playerCounts"],
		labels: bigBird["playerValues"],
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
		bert = bert.filterby(row => row["Color"] == val);
		snackbar(val);
		charts();
	});

}

/*
 ______ _    _ _   _  _____ _______ _____ ____  _   _  _____
|  ____| |  | | \ | |/ ____|__   __|_   _/ __ \| \ | |/ ____|
| |__  | |  | |  \| | |       | |    | || |  | |  \| | (___
|  __| | |  | | . ` | |       | |    | || |  | | . ` |\___ \
| |    | |__| | |\  | |____   | |   _| || |__| | |\  |____) |
|_|     \____/|_| \_|\_____|  |_|  |_____\____/|_| \_|_____/

*/

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
