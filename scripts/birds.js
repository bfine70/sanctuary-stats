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

window.Birds = Birds;