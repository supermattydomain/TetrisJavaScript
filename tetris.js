var shapeBitmaps = new Array(7);
var shapeClasses = new Array(shapeBitmaps.length);

function TetrisBoard(width, height, div) {
	this.setDebug(true);
	// this.debugLog("TetrisBoard init");
	this.width = width;
	this.height = height;
	this.div = div;
	this.nextType = this.randomShapeType();
	this.createGrid();
	// this.debugLog("TetrisBoard end init");
}

TetrisBoard.prototype = {
	createGrid : function() {
		this.table = dce('table');
		setClass(this.table, 'board');
		this.div.appendChild(this.table);
		for (var row = 0; row < this.height; row++) {
			var rowElt = this.table.insertRow(-1);
			setClass(rowElt, 'board');
			for (var col = 0; col < this.width; col++) {
				var cellElt = rowElt.insertCell(-1);
				setClass(cellElt, 'empty');
				// cellElt.appendChild(dctn(' '));
			}
		}
	},
	getWidth: function() {
		return this.table.rows[0].cells.length;
	},
	getHeight: function() {
		return this.table.rows.length;
	},
	isEmpty: function(row, col) {
		return 'empty' == this.table.rows[row].cells[col].className;
	},
	setShape: function(row, col, type) {
		setClass(this.table.rows[row].cells[col], shapeClasses[type]);
	},
	randomShapeType: function() {
		var type = Math.round(Math.random() * shapeBitmaps.length - 0.5);
		// FIXME: Is Math.random strictly *between* 0 and 1?
		// FIXME: Does Math.round round halves up or down or towards zero or what?
		if (type < 0) {
			type = 0;
		}
		if (type >= shapeBitmaps.length) {
			type = shapeBitmaps.length - 1;
		}
		return type;
	},
	createShape: function() {
		var type = this.nextType;
		this.nextType = this.randomShapeType();
		this.currentShape = new Shape(this, 0, Math.round(this.getWidth() / 2 - shapeBitmaps[type][0].length / 2), type);
		return this.currentShape.show();
	},
	tick: function() {
		if (this.currentShape) {
			// this.debugLog('Current shape falling');
			this.currentShape.fall();
			return true;
		} else {
			// this.debugLog('Creating new shape');
			var ret = this.createShape();
			// this.debugLog('Created new shape');
			return ret;
		}
	},
	isRowFilled: function(row) {
		for (var col = 0; col < this.getWidth(); col++) {
			if (this.isEmpty(row, col)) {
				return false; // gap in this row
			}
		}
		return true;
	},
	setEmpty: function(row, col) {
		setClass(this.table.rows[row].cells[col], 'empty');
	},
	setRowEmpty: function(row) {
		for (var col = 0; col < this.getWidth(); col++) {
			this.setEmpty(row, col);
		}
	},
	clear: function() {
		this.currentShape = null;
		for (var row = 0; row < this.getHeight(); row++) {
			this.setRowEmpty(row);
		}
	},
	copyRow: function(srcRow, dstRow) {
		for (var col = 0; col < this.getWidth(); col++) {
			var srcCell = this.table.rows[srcRow].cells[col];
			var dstCell = this.table.rows[dstRow].cells[col];
			setClass(dstCell, srcCell.className);
		}
	},
	zapRow: function(row) {
		// this.debugLog('Zap row ' + row);
		for (/* NOP */; row > 0; row--) {
			this.copyRow(row - 1, row);
		}
		this.setRowEmpty(0);
	},
	zapFilledRows: function() {
		// this.debugLog('zapFilledRows');
		for (var row = this.getHeight() - 1; row >= 0; /* NOP */) {
			if (this.isRowFilled(row)) {
				this.zapRow(row);
			} else {
				row--;
			}
		}
	},
	drop: function() {
		if (!this.currentShape) {
			this.createShape();
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
	}
};

function Shape(board, row, col, type) {
	this.setDebug(true);
	this.board = board;
	this.row = row;
	this.col = col;
	this.type = type;
	this.rot = 0;
	this.bitmap = shapeBitmaps[this.type];
}

Shape.prototype = {
	empty: ' ',
	hide : function() {
		for ( var r = 0; r < this.bitmap.length; r++) {
			for ( var c = 0; c < this.bitmap[0].length; c++) {
				if (this.bitmap[r][c] != this.empty) {
					this.board.setEmpty(this.row + r, this.col + c);
				}
			}
		}
	},
	show: function() {
		// this.debugLog('Show shape');
		for (var r = 0; r < this.bitmap.length; r++) {
			for (var c = 0; c < this.bitmap[0].length; c++) {
				if (this.bitmap[r][c] != this.empty) {
					if (!this.board.isEmpty(this.row + r, this.col + c)) {
						// this.debugLog('Shape blocked in show at ' + this.row + ' + ' + r + ', ' + this.col + ' + ' + c);
						return false; // blocked
					}
					this.board.setShape(this.row + r, this.col + c, this.type);
				}
			}
		}
		return true;
	},
	rotate : function(clockwise) {
		debugLog('Rotate');
		var newRow;
		var newCol;
		var oldCol;
		var oldRow;
		var maxSize = Math.max(this.bitmap.length, this.bitmap[0].length);
		var newBitmap = new Array(maxSize);
		for (newRow = 0; newRow < newBitmap.length; newRow++) {
			newBitmap[newRow] = new Array(maxSize);
		}
		if (clockwise) {
			if (++this.rot > 3) {
				this.rot = 0;
			}
			// +row -> -col, newCol = inv(oldRow), oldRow = inv(newCol)
			// +col -> +row, newRow = oldCol, oldCol = newRow
			for (newRow = 0; newRow < newBitmap.length; newRow++) {
				for (newCol = 0; newCol < newBitmap[newRow].length; newCol++) {
					oldCol = newRow;
					oldRow = newBitmap[newRow].length - 1 - newCol;
					if (oldRow < 0 || oldRow >= this.bitmap.length || oldCol >= this.bitmap[oldRow].length) {
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
			for (newRow = 0; newRow < newBitmap.length; newRow++) {
				for (newCol = 0; newCol < newBitmap[newRow].length; newCol++) {
					oldCol = newBitmap.length - 1 - newRow;
					oldRow = newCol;
					if (oldCol < 0 || oldRow >= this.bitmap.length || oldCol >= this.bitmap[oldRow].length) {
						newBitmap[newRow][newCol] = this.empty;
					} else {
						newBitmap[newRow][newCol] = this.bitmap[oldRow][oldCol];
					}
				}
			}
		}
		// TODO: blocked checking for rotated shape bitmap
		this.hide();
		this.bitmap = newBitmap;
		this.show();
	},
	blockedDown: function() {
		// this.debugLog('blockedDown');
		var row;
		var col;
		for (col = 0; col < this.bitmap[0].length; col++) {
			// Find the bottom-most filled square in the shape's bitmap in this column 
			for (row = this.bitmap.length - 1; row >= 0; row--) {
				if (this.bitmap[row][col] != this.empty) {
					break;
				}
			}
			if (row < 0) {
				// this.debugLog('Column ' + col + ' is empty');
				continue; // empty column
			}
			if (this.row + row + 1 >= this.board.getHeight()) {
				// this.debugLog('Blocked by bottom of board');
				return true; // blocked by bottom of board
			}
			if (!this.board.isEmpty(this.row + row + 1, this.col + col)) {
				// this.debugLog('Blocked by existing square at ' + this.row + ' + ' + row + ' + 1 = ' + (this.row + row + 1) + ', ' + this.col + ' + ' + col + ' = ' + (this.col + col));
				return true; // blocked by existing square
			}
		}
		// this.debugLog('Not blocked');
		return false;
	},
	blockedRight: function() {
		// this.debugLog('blockedRight');
		var row;
		var col;
		for (row = 0; row < this.bitmap.length; row++) {
			// Find the right-most filled square in the shape's bitmap in this row
			for (col = this.bitmap[row].length - 1; col >= 0; col--) {
				if (this.bitmap[row][col] != this.empty) {
					break;
				}
			}
			if (col < 0) {
				// this.debugLog('Row ' + row + ' is empty');
				continue; // empty row
			}
			if (this.col + col + 1 >= this.board.getWidth()) {
				// this.debugLog('Blocked by right of board');
				return true; // blocked by right of board
			}
			if (!this.board.isEmpty(this.row + row, this.col + col + 1)) {
				// this.debugLog('Blocked by existing square at ' + this.row + ' + ' + row + ' = ' + (this.row + row) + ', ' + this.col + ' + ' + col + ' + 1 = ' + (this.col + col + 1));
				return true; // blocked by existing square
			}
		}
		// this.debugLog('Not blocked');
		return false;
	},
	blockedLeft: function() {
		// this.debugLog('blockedLeft');
		var row;
		var col;
		for (row = 0; row < this.bitmap.length; row++) {
			// Find the left-most filled square in the shape's bitmap in this row
			for (col = 0; col < this.bitmap[row].length; col++) {
				if (this.bitmap[row][col] != this.empty) {
					break;
				}
			}
			if (col >= this.bitmap[row].length) {
				// this.debugLog('Row ' + row + ' is empty');
				continue; // empty row
			}
			if (this.col + col - 1 < 0) {
				// this.debugLog('Blocked by left of board');
				return true; // blocked by left of board
			}
			if (!this.board.isEmpty(this.row + row, this.col + col - 1)) {
				// this.debugLog('Blocked by existing square at ' + this.row + ' + ' + row + ' = ' + (this.row + row) + ', ' + this.col + ' + ' + col + ' - 1 = ' + (this.col + col - 1));
				return true; // blocked by existing square
			}
		}
		// this.debugLog('Not blocked');
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

function NextShapeDisplay(div) {
	this.div = div;
	this.calcSize();
	this.createGrid();
}

NextShapeDisplay.prototype = {
	calcSize: function() {
		this.width = 0;
		this.height = 0;
		for (var type = 0; type < shapeBitmaps.length; type++) {
			if (shapeBitmaps[type].length > this.height) {
				this.height = shapeBitmaps[type].length;
			}
			for (var row = 0; row < shapeBitmaps[type].length; row++) {
				if (shapeBitmaps[type][row].length > this.width) {
					this.width = shapeBitmaps[type][row].length;
				}
			}
		}
	},
	createGrid: function() {
		this.table = dce('table');
		setClass(this.table, 'board');
		this.div.appendChild(this.table);
		for (var row = 0; row < this.height; row++) {
			var rowElt = this.table.insertRow(-1);
			setClass(rowElt, 'board');
			for (var col = 0; col < this.width; col++) {
				var cellElt = rowElt.insertCell(-1);
				setClass(cellElt, 'empty');
				// cellElt.appendChild(dctn(' '));
			}
		}
	},
	display: function(type) {
		this.clear();
		this.currentShape = new Shape(this, 0, 0, type);
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
		setClass(this.table.rows[row].cells[col], shapeClasses[type]);
	},
	setEmpty: function(row, col) {
		setClass(this.table.rows[row].cells[col], 'empty');
	},
	setRowEmpty: function(row) {
		for (var col = 0; col < this.getWidth(); col++) {
			this.setEmpty(row, col);
		}
	},
	clear: function() {
		this.currentShape = null;
		for (var row = 0; row < this.getHeight(); row++) {
			this.setRowEmpty(row);
		}
	}
};

shapeBitmaps[0] =
	[
	 'XX',
	 'XX',
	 ];
shapeClasses[0] = 'blue';

shapeBitmaps[1] =
	[
	 '  X  ',
	 '  X  ',
	 '  X  ',
	 '  X  '
	];
shapeClasses[1] = 'red';

shapeBitmaps[2] =
	[
	 ' X',
	 'XX',
	 'X '
	];
shapeClasses[2] = 'yellow';

shapeBitmaps[3] =
	[
	 'X ',
	 'XX',
	 ' X'
	];
shapeClasses[3] = 'magenta';

shapeBitmaps[4] =
	[
	 ' X ',
	 ' XX',
	 ' X '
	];
shapeClasses[4] = 'green';

shapeBitmaps[5] =
	[
	 ' X ',
	 ' X ',
	 ' XX'
	];
shapeClasses[5] = 'brightyellow';

shapeBitmaps[6] =
	[
	 ' X ',
	 ' X ',
	 'XX '
	];
shapeClasses[6] = 'brightblue';
