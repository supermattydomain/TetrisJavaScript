/**
 * Generate a random integer between (and including) the two given numbers.
 * @param min The smallest value that should ever be returned. Must be >=0.
 * @param max The largest value that should ever be returned. Must be >min.
 * @returns A pseudo-random positive integer in the range [min..max]
 */
function randomBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var Tetris = {
	shapeBitmaps: undefined,
	shapeClasses: undefined
};

Tetris.TetrisBoard = function(width, height, div, input) {
	this.div = div;
	this.input = input;
	this.nextType = this.randomShapeType();
	this.createGrid(width, height);
	this.initEvents();
};

Tetris.TetrisBoard.prototype = {
	initRow: function(rowElt, width) {
		var col;
		for (col = 0; col < width; col++) {
			rowElt.append($('<td>').addClass('empty'));
		}
	},
	createGrid : function(width, height) {
		var row, rowElt;
		this.table = $('<table>');
		this.div.append(this.table);
		for (row = 0; row < height; row++) {
			rowElt = $('<tr>');
			this.initRow(rowElt, width);
			this.table.append(rowElt);
		}
	},
	cellAt: function(row, col) {
		return $(this.table[0].rows[row].cells[col]);
	},
	getWidth: function() {
		return this.table[0].rows[0].cells.length;
	},
	getHeight: function() {
		return this.table[0].rows.length;
	},
	isEmpty: function(row, col) {
		return this.cellAt(row, col).hasClass('empty');
	},
	setShape: function(row, col, type) {
		this.cellAt(row, col).attr('class', Tetris.shapeClasses[type]);
	},
	randomShapeType: function() {
		// XXX: For testing:
		// return 0;
		return randomBetween(0, Tetris.shapeBitmaps.length - 1);
	},
	createShape: function() {
		var type = this.nextType;
		this.nextType = this.randomShapeType();
		this.currentShape = new Tetris.Shape(this, 0, Math.round(this.getWidth() / 2 - Tetris.shapeBitmaps[type][0].length / 2), type);
		return this.currentShape.show();
	},
	tick: function() {
		if (this.currentShape) {
			this.currentShape.fall();
			return true;
		} else {
			var ret = this.createShape();
			return ret;
		}
	},
	isRowFilled: function(row) {
		var col;
		for (col = 0; col < this.getWidth(); col++) {
			if (this.isEmpty(row, col)) {
				return false; // gap in this row
			}
		}
		return true;
	},
	setEmpty: function(row, col) {
		this.cellAt(row, col).attr('class', 'empty');
	},
	setRowEmpty: function(row) {
		var col;
		for (col = 0; col < this.getWidth(); col++) {
			this.setEmpty(row, col);
		}
	},
	clear: function() {
		var row;
		this.currentShape = null;
		for (row = 0; row < this.getHeight(); row++) {
			this.setRowEmpty(row);
		}
	},
	insertBlankRow : function() {
		var rowElt = $('<tr>');
		this.initRow(rowElt, this.getWidth());
		this.table.prepend(rowElt);
	},
	zapRowDelete: function(rowIndex) {
		$(this.table[0].rows[rowIndex]).remove();
		this.insertBlankRow();
	},
	zapFilledRows: function() {
		var rowIndex;
		for (rowIndex = this.getHeight() - 1; rowIndex >= 0; /* NOP */) {
			if (this.isRowFilled(rowIndex)) {
				this.zapRowDelete(rowIndex);
				// continue to examine same row index, which is now new row
			} else {
				rowIndex--;
			}
		}
	},
	drop: function() {
		if (!this.currentShape) {
			this.createShape();
			return; // Don't drop a newly-created shape
		}
		this.currentShape.drop();
	},
	moveLeft: function() {
		if (!this.currentShape) {
			this.createShape();
		}
		this.currentShape.moveLeft();
	},
	moveRight: function() {
		if (!this.currentShape) {
			this.createShape();
		}
		this.currentShape.moveRight();
	},
	fall: function() {
		if (!this.currentShape) {
			this.createShape();
		}
		this.currentShape.fall();
	},
	rotate: function(clockwise) {
		if (!this.currentShape) {
			this.createShape();
		}
		this.currentShape.rotate(clockwise);
	},
	initEvents: function() {
		var handlers = {
			32: function() { this.drop(); },
			37: function() { this.moveLeft(); },
			38: function() { this.rotate(false); },
			39: function() { this.moveRight(); },
			40: function() { this.fall(); }
		}, tthis = this;
		this.input.focus().on('keypress', function(event) {
			if ((event.which || event.keyCode) in handlers) {
				return handlers[event.which || event.keyCode].apply(tthis);
			}
			console.log("Unhandled keypress", event);
		});
	}
};

Tetris.Shape = function(board, row, col, type) {
	this.board = board;
	this.row = row;
	this.col = col;
	this.type = type;
	this.rot = 0;
	this.bitmap = Tetris.shapeBitmaps[this.type];
};

Tetris.Shape.prototype = {
	empty: ' ',
	getHeight: function() {
		return this.bitmap.length;
	},
	getWidth: function() {
		return this.bitmap[0].length;
	},
	emptyAt: function(row, col) {
		return this.bitmap[row][col] === this.empty;
	},
	filledAt: function(row, col) {
		return !this.emptyAt(row, col);
	},
	hide: function() {
		var r, c;
		for (r = 0; r < this.getHeight(); r++) {
			for (c = 0; c < this.getWidth(); c++) {
				if (this.filledAt(r, c)) {
					this.board.setEmpty(this.row + r, this.col + c);
				}
			}
		}
	},
	show: function() {
		var r, c;
		for (r = 0; r < this.getHeight(); r++) {
			for (c = 0; c < this.getWidth(); c++) {
				if (this.filledAt(r, c)) {
					if (!this.board.isEmpty(this.row + r, this.col + c)) {
						return false; // blocked
					}
					this.board.setShape(this.row + r, this.col + c, this.type);
				}
			}
		}
		return true;
	},
	rotate : function(clockwise) {
		var
			oldRow, oldCol, newRow, newCol,
			newBitmap = [];
		for (newRow = 0; newRow < this.bitmap[0].length; newRow++) {
			newBitmap[newRow] = [];
		}
		if (clockwise) {
			if (++this.rot > 3) {
				this.rot = 0;
			}
			// +row -> -col, newCol = inv(oldRow), oldRow = inv(newCol)
			// +col -> +row, newRow = oldCol, oldCol = newRow
			for (newRow = 0; newRow < this.getWidth(); newRow++) {
				for (newCol = 0; newCol < this.getHeight(); newCol++) {
					oldCol = newRow;
					oldRow = newBitmap[newRow].length - 1 - newCol;
					if (oldRow < 0 || oldRow >= this.getHeight() || oldCol >= this.bitmap[oldRow].length) {
						newBitmap[newRow][newCol] = this.empty;
					} else {
						newBitmap[newRow][newCol] = this.bitmap[oldRow][oldCol];
					}
				}
			}
		} else {
			// +row -> +col, newCol = oldRow, oldRow = newCol
			// +col -> -row, newRow = inv(oldCol), oldCol = inv(newRow)
			if (--this.rot < 0) {
				this.rot = 3;
			}
			for (newRow = 0; newRow < this.getWidth(); newRow++) {
				for (newCol = 0; newCol < this.getHeight(0); newCol++) {
					oldCol = newBitmap.length - 1 - newRow;
					oldRow = newCol;
					if (oldCol < 0 || oldRow >= this.getHeight() || oldCol >= this.bitmap[oldRow].length) {
						newBitmap[newRow][newCol] = this.empty;
					} else {
						newBitmap[newRow][newCol] = this.bitmap[oldRow][oldCol];
					}
				}
			}
		}
		this.hide();
		if (this.blockedRotate(newBitmap)) {
			this.show();
			return false;
		}
		this.bitmap = newBitmap;
		this.show();
		return true;
	},
	blockedRotate: function(newBitmap) {
		var row, col;
		for (row = 0; row < newBitmap.length; row ++) {
			for (col = 0; col < newBitmap[row].length; col++) {
				if (newBitmap[row][col] == this.empty) {
					continue; // This square empty in this shape
				}
				if (this.row + row < 0 || this.row + row >= this.board.getHeight()) {
					return true; // blocked by top or bottom edge of board
				}
				if (this.col + col < 0 || this.col + col >= this.board.getWidth()) {
					return true; // blocked by left or right edge of board
				}
				if (!this.board.isEmpty(this.row + row, this.col + col)) {
					return true; // blocked by existing square
				}
			}
		}
		return false;
	},
	blockedDown: function() {
		var row;
		var col;
		for (col = 0; col < this.getWidth(); col++) {
			// Find the bottom-most filled square in the shape's bitmap in this column 
			for (row = this.getHeight() - 1; row >= 0; row--) {
				if (this.bitmap[row][col] != this.empty) {
					break;
				}
			}
			if (row < 0) {
				continue; // empty column
			}
			if (this.row + row + 1 >= this.board.getHeight()) {
				return true; // blocked by bottom of board
			}
			if (!this.board.isEmpty(this.row + row + 1, this.col + col)) {
				return true; // blocked by existing square
			}
		}
		return false;
	},
	blockedRight: function() {
		var row;
		var col;
		for (row = 0; row < this.getHeight(); row++) {
			// Find the right-most filled square in the shape's bitmap in this row
			for (col = this.bitmap[row].length - 1; col >= 0; col--) {
				if (this.bitmap[row][col] != this.empty) {
					break;
				}
			}
			if (col < 0) {
				continue; // empty row
			}
			if (this.col + col + 1 >= this.board.getWidth()) {
				return true; // blocked by right of board
			}
			if (!this.board.isEmpty(this.row + row, this.col + col + 1)) {
				return true; // blocked by existing square
			}
		}
		return false;
	},
	blockedLeft: function() {
		var row;
		var col;
		for (row = 0; row < this.getHeight(); row++) {
			// Find the left-most filled square in the shape's bitmap in this row
			for (col = 0; col < this.bitmap[row].length; col++) {
				if (this.bitmap[row][col] != this.empty) {
					break;
				}
			}
			if (col >= this.bitmap[row].length) {
				continue; // empty row
			}
			if (this.col + col - 1 < 0) {
				return true; // blocked by left of board
			}
			if (!this.board.isEmpty(this.row + row, this.col + col - 1)) {
				return true; // blocked by existing square
			}
		}
		return false;
	},
	fall: function() {
		if (this.blockedDown()) {
			// No longer the current shape - now just an obstacle
			this.board.currentShape = null;
			this.board.zapFilledRows();
			return false;
		}
		this.hide();
		this.row++;
		this.show();
		return true;
	},
	moveLeft: function() {
		if (this.blockedLeft()) {
			return false;
		}
		this.hide();
		this.col--;
		this.show();
		return true;
	},
	moveRight: function() {
		if (this.blockedRight()) {
			return false;
		}
		this.hide();
		this.col++;
		this.show();
		return true;
	},
	drop: function() {
		while (this.fall()) {
			// NOP
		}
	}
};

Tetris.NextShapeDisplay = function(div) {
	this.div = div;
	this.calcSize();
	this.createGrid();
};

Tetris.NextShapeDisplay.prototype = {
	calcSize: function() {
		this.width = 0;
		this.height = 0;
		for (var type = 0; type < Tetris.shapeBitmaps.length; type++) {
			if (Tetris.shapeBitmaps[type].length > this.height) {
				this.height = Tetris.shapeBitmaps[type].length;
			}
			for (var row = 0; row < Tetris.shapeBitmaps[type].length; row++) {
				if (Tetris.shapeBitmaps[type][row].length > this.width) {
					this.width = Tetris.shapeBitmaps[type][row].length;
				}
			}
		}
	},
	createGrid: function() {
		var row, col, rowElt, cellElt;
		this.table = $('<table>');
		this.div.append(this.table);
		for (row = 0; row < this.height; row++) {
			rowElt = $('<tr>');
			this.table.append(rowElt);
			for (col = 0; col < this.width; col++) {
				cellElt = $('<td>');
				cellElt.addClass('empty');
				rowElt.append(cellElt);
			}
		}
	},
	display: function(type) {
		this.clear();
		this.currentShape = new Tetris.Shape(this, 0, 0, type);
		this.currentShape.show();
	},
	isEmpty: function(row, col) {
		return true;
	},
	getHeight: function() {
		return this.height;
	},
	getWidth: function() {
		return this.width;
	},
	// TODO: Factor out remaining methods into superclass
	setShape: function(row, col, type) {
		this.cellAt(row, col).attr('class', Tetris.shapeClasses[type]);
	},
	cellAt: function(row, col) {
		return $(this.table[0].rows[row].cells[col]);
	},
	setEmpty: function(row, col) {
		this.cellAt(row, col).attr('class', 'empty');
	},
	setRowEmpty: function(row) {
		for (var col = 0; col < this.getWidth(); col++) {
			this.setEmpty(row, col);
		}
	},
	clear: function() {
		var row;
		this.currentShape = null;
		for (row = 0; row < this.getHeight(); row++) {
			this.setRowEmpty(row);
		}
	}
};

Tetris.shapeBitmaps = [
                	[
                	 'XX',
                	 'XX',
                	 ],
                	[
                	 '  X  ',
                	 '  X  ',
                	 '  X  ',
                	 '  X  '
                	],
                	[
                	 ' X',
                	 'XX',
                	 'X '
                	],
                	[
                	 'X ',
                	 'XX',
                	 ' X'
                	],
                	[
                	 ' X ',
                	 ' XX',
                	 ' X '
                	],
                	[
                	 ' X ',
                	 ' X ',
                	 ' XX'
                	],
                	[
                	 ' X ',
                	 ' X ',
                	 'XX '
                	]
                ];

Tetris.shapeClasses = [ 'blue', 'red', 'yellow', 'magenta', 'green', 'brightyellow', 'brightblue' ];
