var shapeBitmaps = new Array(7);

function TetrisBoard(width, height, div) {
	this.setDebug(true);
	this.debugLog("TetrisBoard init");
	this.width = width;
	this.height = height;
	this.div = div;
	this.createGrid();
	this.debugLog("TetrisBoard end init");
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
	isEmptyCell: function(cell) {
		return cell.className == 'empty';
	},
	isEmpty: function(row, col) {
		return this.isEmptyCell(this.table.rows[row].cells[col]);
	},
	setEmpty: function(row, col) {
		setClass(this.table.rows[row].cells[col], 'empty');
	},
	setShape: function(row, col) {
		setClass(this.table.rows[row].cells[col], 'shape');
	},
	createShape: function() {
		var type = Math.round(Math.random() * shapeBitmaps.length - 0.5);
		// FIXME: Is Math.random strictly *between* 0 and 1?
		// FIXME: Does Math.round round halves up or down or towards zero or what?
		if (type < 0) {
			type = 0;
		}
		if (type >= shapeBitmaps.length) {
			type = shapeBitmaps.length - 1;
		}
		type = 0; // FIXME: For testing filled rows detection
		this.currentShape = new Shape(this, 0, this.getWidth() / 2 - shapeBitmaps[type][0].length / 2, type);
		this.currentShape.show();
	},
	isRowFilled: function(row) {
		for (var col = 0; col < this.getWidth(); col++) {
			if (this.isEmpty(row, col)) {
				return false; // gap in this row
			}
		}
		return true;
	},
	clearRow: function(row) {
		for (var col = 0; col < this.getWidth(); col++) {
			this.setEmpty(row, col);
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
		this.clearRow(0);
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
	}
};

function Shape(board, row, col, type) {
	// this.setDebug(true);
	this.board = board;
	this.row = row;
	this.col = col;
	this.type = type;
	this.rot = 0;
	this.bitmap = shapeBitmaps[this.type];
	this.show();
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
		// this.debugLog(this.bitmap);
		for (var r = 0; r < this.bitmap.length; r++) {
			for (var c = 0; c < this.bitmap[0].length; c++) {
				if (this.bitmap[r][c] != this.empty) {
					this.board.setShape(this.row + r, this.col + c);
				}
			}
		}
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
		// TODO: blocked checking of new bitmap
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

shapeBitmaps[0] =
	[
	 'XX',
	 'XX',
	 ];

shapeBitmaps[1] =
	[
	 '  X  ',
	 '  X  ',
	 '  X  ',
	 '  X  '
	];

shapeBitmaps[2] =
	[
	 ' X',
	 'XX',
	 'X '
	];

shapeBitmaps[3] =
	[
	 'X ',
	 'XX',
	 ' X'
	];

shapeBitmaps[4] =
	[
	 ' X ',
	 ' XX',
	 ' X '
	];

shapeBitmaps[5] =
	[
	 ' X ',
	 ' X ',
	 ' XX'
	];

shapeBitmaps[6] =
	[
	 ' X ',
	 ' X ',
	 'XX '
	];
