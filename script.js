/*
 ____ _____ _____  _____   _____ 
|  _ \_   _|  __ \|  __ \ / ____|
| |_) || | | |__) | |  | | (___  
|  _ < | | |  _  /| |  | |\___ \ 
| |_) || |_| | \ \| |__| |____) |
|____/_____|_|  \_\_____/|_____/ 

*/

/**
 * A collection of data about birds.
 */
class Birds {
	/**
	 * Creates a new Birds object.
	 * @param {Object} data - An object with array values of uniform length.
	 */
	constructor(obj) {
		this.data = obj;
		this.index = Birds.index(this.data);
		this.columns = Object.keys(this.data);
		const n = this.index.length;
		const m = this.columns.length;
		this.size = [n, m];

		return new Proxy(this, {
			/**
			 * Intercepts property assignment on the Birds object.
			 * @param {Object} target - The target object.
			 * @param {string} prop - The property being assigned.
			 * @param {*} value - The value being assigned to the property.
			 */
			set(target, prop, value) {
				if (prop in target) {
					target[prop] = value;
				} else {
					target.data[prop] = value;
					target.index = Birds.index(target.data);
					target.columns = Object.keys(target.data);
					const n = target.index.length;
					const m = target.columns.length;
					target.size = [n, m];
				}
				return true;
			},

			/**
			 * Intercepts property access on the Birds object.
			 * @param {Object} target - The target object.
			 * @param {string} prop - The property being accessed.
			 */
			get(target, prop) {
				return prop in target ? target[prop] : target.data[prop];
			}
		});
	}

	/**
	 * Returns an array of indices for the rows in the data.
	 * @param {Object} data - The data.
	 * @returns {number[]} This indices.
	 */
	static index(data) {
		let result = 0;
		for (const column in data) {
			const col = data[column];
			const len = col.length;
			if (len > result) {
				result = len;
			}
		}
		return [...new Array(result).keys()];
	}

	/**
	 * Converts an array of objects to a Birds instance or an object of arrays.
	 * @param {Object[]} data - An array of objects.
	 * @param {boolean} [bird=true] - Whether to return a Birds instance.
	 * @returns {(Birds|Object)} A Birds instance or an object of arrays.
	 */
	static fromCSV(data, bird = true) {
		let columns = Object.keys(data[0]);
		let m = columns.length;
		let n = data.length;
		let result = {};
		for (let j = 0; j < m; j++) {
			let column = columns[j];
			result[column] = [];
			for (let i = 0; i < n; i++) {
				let row = data[i];
				result[column].push(row[column]);
			}
		}
		return bird ? new Birds(result) : result;
	}

	/**
	 * Creates a deep copy.
	 * @returns {Birds} The copy.
	 */
	copy() {
		const columns = this.columns;
		const [n, m] = this.size;
		let result = {};
		for (let j = 0; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			result[column] = [];
			for (let i = 0; i < n; i++) {
				const val = col[i];
				result[column].push(val);
			}
		}
		return new Birds(result);
	}

	/**
	 * Converts a Birds instance to an array of objects.
	 * @param {Function} [callback=(row) => true] - A callback function that takes an array and returns a boolean.
	 * @returns {Object[]} A array of objects.
	 */
	toCSV(callback = (row) => true) {
		const [n, m] = this.size;
		let result = [];
		for (let i = 0; i < n; i++) {
			let row = {};
			for (let j = 0; j < m; j++) {
				const column = this.columns[j];
				const col = this.data[column];
				row[column] = col[i];
			}
			if (callback(row)) {
				result.push(row);
			}
		}
		return result;
	}

	/**
	 * Calculates the element-wise sums of columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @returns {number[]} The element-wise sums.
	 */
	add(columns = this.columns) {
		const m = columns.length;
		const [n, _] = this.size;
		const result = new Array(n).fill(0);
		for (let j = 0; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			for (let i = 0; i < n; i++) {
				result[i] += col[i];
			}
		}
		return result;
	}

	/**
	 * Calculates the element-wise differences of columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @returns {number[]} The element-wise differences.
	 */
	subtract(columns = this.columns) {
		const m = columns.length;
		const [n, _] = this.size;
		const column = columns[0];
		const col = this.data[column];
		const result = [...col];
		for (let j = 1; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			for (let i = 0; i < n; i++) {
				result[i] -= col[i];
			}
		}
		return result;
	}

	/**
	 * Calculates the element-wise products of columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @returns {number[]} The element-wise products.
	 */
	multiply(columns = this.columns) {
		const m = columns.length;
		const [n, _] = this.size;
		const result = new Array(n).fill(1);
		for (let j = 0; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			for (let i = 0; i < n; i++) {
				result[i] *= col[i];
			}
		}
		return result;
	}

	/**
	 * Calculates the element-wise quotients of columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @returns {number[]} The element-wise quotients.
	 */
	divide(columns = this.columns) {
		const m = columns.length;
		const [n, _] = this.size;
		const column = columns[0];
		const col = this.data[column];
		const result = [...col];
		for (let j = 1; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			for (let i = 0; i < n; i++) {
				result[i] /= col[i];
			}
		}
		return result;
	}

	/**
	 * Finds the minimum value of columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @returns {number} The minimum value.
	 */
	min(columns = this.columns) {
		const m = columns.length;
		const [n, _] = this.size;
		let result = Infinity;
		for (let j = 0; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			for (let i = 0; i < n; i++) {
				const val = col[i];
				if (val < result) {
					result = val;
				}
			}
		}
		return result;
	}

	/**
	 * Finds the maximum value of columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @returns {number} The maximum value.
	 */
	max(columns = this.columns) {
		const m = columns.length;
		const [n, _] = this.size;
		let result = -Infinity;
		for (let j = 0; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			for (let i = 0; i < n; i++) {
				const val = col[i];
				if (val > result) {
					result = val;
				}
			}
		}
		return result;
	}

	/**
	 * Counts the number of values in columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @return {number} The number of values.
	 */
	count(columns = this.columns) {
		const m = columns.length;
		const [n, _] = this.size;
		return n * m;
	} // TODO: Don't count null or undefined values.

	/**
	 * Calculates the sum of columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @return {number} The sum.
	 */
	sum(columns = this.columns) {
		const m = columns.length;
		const [n, _] = this.size;
		let result = 0;
		for (let j = 0; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			for (let i = 0; i < n; i++) {
				result += col[i];
			}
		}
		return result;
	}

	/**
	 * Calculates the weights of values in columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @return {number} The weights.
	 */
	weights(columns = this.columns) {
		const m = columns.length;
		const [n, _] = this.size;
		const sum = this.sum(columns);
		let result = [];
		for (let j = 0; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			for (let i = 0; i < n; i++) {
				result.push(col[i] / sum);
			}
		}
		return result;
	}

	/**
	 * Calculates the average of columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @return {number} The average.
	 */
	average(columns = this.columns) {
		return this.sum(columns) / this.count(columns);
	}

	/**
	 * Calculates the total sum of squares of columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @return {number} The total sum of squares.
	 */
	tss(columns = this.columns) {
		const m = columns.length;
		const [n, _] = this.size;
		const average = this.average(columns);
		let result = 0;
		for (let j = 0; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			for (let i = 0; i < n; i++) {
				result += (col[i] - average) ** 2;
			}
		}
		return result;
	}

	/**
	 * Calculates the population variance of columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @param {boolean} [sample=false] - Whether to return the sample variance.
	 * @return {number} The population var.
	 */
	var(columns = this.columns, sample = false) {
		if (sample) {
			return this.tss(columns) / (this.count(columns) - 1);
		} else {
			return this.tss(columns) / this.count(columns);
		}
	}

	/**
	 * Calculates the population standard deviation of columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @param {boolean} [sample=false] - Whether to return the sample standard deviation.
	 * @return {number} The population standard deviation.
	 */
	stdev(columns = this.columns, sample = false) {
		return this.var(columns, sample) ** 0.5;
	}

	/**
	 * Replaces values of columns using a regular expression.
	 * @param {Array} [columns=this.columns] - The columns.
	 * @param {RegExp} pattern - A regular expression.
	 * @param {string} replacement - The replacement value.
	 * @returns {Array} The replaced columns.
	 */
	replace(columns = this.columns, pattern, replacement) {
		const m = columns.length;
		const [n, _] = this.size;
		let result = [];
		for (let j = 0; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			for (let i = 0; i < n; i++) {
				const val = col[i];
				if (val !== undefined && val !== null) {
					const repl = val.replace(pattern, replacement);
					result.push(repl);
				}
			}
		}
		return result;
	} // TODO: Add in-place argument. This should be single column?

	/**
	 * Finds the unique values of columns.
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @returns {Array} The unique values.
	 */
	unique(columns = this.columns) {
		const m = columns.length;
		const [n, _] = this.size;
		let result = new Set();
		for (let j = 0; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			for (let i = 0; i < n; i++) {
				const val = col[i];
				if (val !== undefined && val !== null) { // My preference.
					result.add(val);
				}
			}
		}
		return [...result];
	}

	/**
	 * Counts the number of values in columns based on some condition(s).
	 * @param {string[]} [columns=this.columns] - The columns.
	 * @param {Function} callback - A function that takes a value and returns a boolean.
	 * @return {number} The number of values.
	 */
	countif(columns = this.columns, callback) {
		const m = columns.length;
		const [n, _] = this.size;
		let result = 0;
		for (let j = 0; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			for (let i = 0; i < n; i++) {
				const val = col[i];
				if (callback(val)) {
					result++;
				}
			}
		}
		return result;
	}

	/**
	 * Sums the values in columns that meet some condition(s).
	 * @param {string[]} columns - The columns to evaluate.
	 * @param {Function} callback - A function that takes a value and returns a boolean.
	 * @param {string[]} [sumColumns=this.columns] - The columns to sum.
	 * @return {number} The sum of values.
	 */
	sumif(columns, callback, sumColumns) {
		const m = columns.length;
		const [n, _] = this.size;
		let result = 0;
		for (let j = 0; j < m; j++) {
			const column = columns[j];
			const col = this.data[column];
			const sumColumn = sumColumns[j];
			const sumCol = this.data[sumColumn];
			for (let i = 0; i < n; i++) {
				const val = col[i];
				const sumVal = sumCol[i]
				if (callback(val)) {
					result += sumVal;
				}
			}
		}
		return result;
	}

	/**
	 * Sorts the data by a column.
	 * @param {string} key - The column.
	 * @param {number} [ascending=1] - The sort order: 1 for ascending, -1 for descending.
	 * @param {boolean} [inplace=false] - Whether to sort the data in-place.
	 * @returns {Birds} The sorted data.
	 */
	sortby(column, ascending = 1, inplace = false) {
		const [n, m] = this.size;
		const indices = [...this.index];
		const col = this.data[column];
		indices.sort((a, b) => {
			if (col[a] > col[b]) return ascending;
			if (col[a] < col[b]) return -ascending;
			return 0;
		});
		if (inplace) {
			for (let j = 0; j < m; j++) {
				const column = this.columns[j];
				const col = this.data[column];
				let temp = [];
				for (let i = 0; i < n; i++) {
					const index = indices[i];
					temp.push(col[index]);
				}
				this.data[column] = temp;
			}
			return this;
		} else {
			let result = {};
			for (let j = 0; j < m; j++) {
				const column = this.columns[j];
				const col = this.data[column];
				let temp = [];
				for (let i = 0; i < n; i++) {
					const index = indices[i];
					temp.push(col[index]);
				}
				result[column] = temp;
			}
			return new Birds(result);
		}
	} // TODO: Too verbose.

	/**
	 * Filters the data based on some condition(s).
	 * @param {Function} callback - A callback function that takes an array and returns a boolean.
	 * @param {boolean} [inplace=false] - Whether to filter the data in-place.
	 * @returns {Birds} The filtered data.
	 */
	filterby(callback, inplace = false) {
		const data = this.toCSV(callback);
		if (inplace) {
			this.data = Birds.fromCSV(data, false);
			this.index = Birds.index(this.data);
			this.columns = Object.keys(this.data);
			const n = this.index.length;
			const m = this.columns.length;
			this.size = [n, m];
			return this;
		} else {
			return Birds.fromCSV(data, true);
		}
	}

	/**
	 * Slices the first n rows.
	 * @param {number} rows - The number of rows.
	 * @param {boolean} [inplace=false] - Whether to slice the data in-place.
	 * @returns {Birds} The sliced data.
	 */
	head(rows, inplace = false) {
		const [totalRows, m] = this.size;
		let n = rows <= totalRows ? rows : totalRows;
		let result = {};
		for (let j = 0; j < m; j++) {
			const column = this.columns[j];
			const col = this.data[column];
			result[column] = col.slice(0, n);
		}
		if (inplace) {
			this.data = result;
			this.index = Birds.index(this.data);
			this.columns = Object.keys(this.data);
			this.size = [n, m];
			return this;
		} else {
			return new Birds(result);
		}
	}

	/**
	 * Slices the last n rows.
	 * @param {number} rows - The number of rows.
	 * @param {boolean} [inplace=false] - Whether to slice the data in-place.
	 * @returns {Birds} The sliced data.
	 */
	tail(rows, inplace = false) {
		const [totalRows, m] = this.size;
		let n = rows <= totalRows ? rows : totalRows;
		let result = {};
		for (let j = 0; j < m; j++) {
			const column = this.columns[j];
			const col = this.data[column];
			result[column] = col.slice(totalRows - n);
		}
		if (inplace) {
			this.data = result;
			this.index = Birds.index(this.data);
			this.columns = Object.keys(this.data);
			this.size = [n, m];
			return this;
		} else {
			return new Birds(result);
		}
	}

} // TODO: Update bird.size on bird[column].push(val)

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
