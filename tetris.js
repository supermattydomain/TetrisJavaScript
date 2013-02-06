var Tetris = {
		shapeBitmaps: undefined,
		shapeClasses: undefined
};

Tetris.TetrisBoard = function(width, height, div, input) {
	this.width = width;
	this.height = height;
	this.div = div;
	this.input = input;
	this.nextType = this.randomShapeType();
	this.createGrid();
	this.initEvents();
};

Tetris.TetrisBoard.prototype = {
	initRow : function(rowElt) {
		for ( var col = 0; col < this.width; col++) {
			var cellElt = rowElt.insertCell(-1);
			cellElt.className = 'empty';
			// cellElt.appendChild(dctn(' '));
		}
	},
	createGrid : function() {
		this.table = document.createElement('table');
		this.div.appendChild(this.table);
		for (var row = 0; row < this.height; row++) {
			var rowElt = this.table.insertRow(-1);
			this.initRow(rowElt);
		}
	},
	getWidth: function() {
		return this.table.rows[0].cells.length;
	},
	getHeight: function() {
		return this.table.rows.length;
	},
	isEmpty: function(row, col) {
		return $(this.table.rows[row].cells[col]).hasClassName('empty');
	},
	setShape: function(row, col, type) {
		this.table.rows[row].cells[col].className = Tetris.shapeClasses[type];
	},
	randomShapeType: function() {
		// XXX: For testing:
		// return 0;
		var type = Math.round(Math.random() * Tetris.shapeBitmaps.length - 0.5);
		// FIXME: Is Math.random strictly *between* 0 and 1?
		// FIXME: Does Math.round round halves up or down or towards zero or what?
		if (type < 0) {
			type = 0;
		}
		if (type >= Tetris.shapeBitmaps.length) {
			type = Tetris.shapeBitmaps.length - 1;
		}
		return type;
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
		for (var col = 0; col < this.getWidth(); col++) {
			if (this.isEmpty(row, col)) {
				return false; // gap in this row
			}
		}
		return true;
	},
	setEmpty: function(row, col) {
		this.table.rows[row].cells[col].className = 'empty';
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
			dstCell.className = srcCell.className;
		}
	},
	insertBlankRow : function() {
		rowElt = this.table.insertRow(0);
		this.initRow(rowElt);
	},
	zapRowPuff: function(rowIndex) {
		var rowElt = this.table.rows[rowIndex];
		var tthis = this;
		Effect.Puff(rowElt, {
			afterFinish : function() {
				tthis.table.deleteRow(rowIndex);
				tthis.insertBlankRow();
			}
		});
	},
	zapRowDelete: function(rowIndex) {
		this.table.deleteRow(rowIndex);
		this.insertBlankRow();
	},
	zapFilledRows: function() {
		/*
		// FIXME: if row deletion occurs under our feet,
		// decrementing the row index unconditionally
		// will cause us to miss zappable rows.
		for (var rowIndex = this.getHeight() - 1; rowIndex >= 0; rowIndex--) {
			if (this.isRowFilled(rowIndex)) {
				this.zapRowPuff(rowIndex);
			}
		}
		*/
		for (var rowIndex = this.getHeight() - 1; rowIndex >= 0; /* NOP */) {
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
		Event.observe(this.input, 'keydown', this.onKeyPress.bindAsEventListener(this));
		this.input.focus();
	},
	onKeyPress : function(event) {
		switch (event.keyCode) {
		case Event.KEY_LEFT:
			this.moveLeft();
			break;
		case Event.KEY_RIGHT:
			this.moveRight();
			break;
		case Event.KEY_UP:
			this.rotate(false);
			break;
		case Event.KEY_DOWN:
			this.fall();
			break;
		case 32: // FIXME: Literal ' ' doesn't work
			this.drop();
			break;
		case Event.KEY_RETURN:
			debug("Keypress: '" + event.keyCode + "'");
			break;
		case Event.KEY_TAB:
		case Event.KEY_ESC:
		default:
			// debug("Keypress: '" + event.keyCode + "'");
			return;
		}
		Event.stop(event);
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
	emptyAt: function(row, col) {
		return this.bitmap[row][col] == this.empty;
	},
	filledAt: function(row, col) {
		return !this.emptyAt(row, col);
	},
	hide : function() {
		for ( var r = 0; r < this.bitmap.length; r++) {
			for ( var c = 0; c < this.bitmap[0].length; c++) {
				if (this.filledAt(r, c)) {
					this.board.setEmpty(this.row + r, this.col + c);
				}
			}
		}
	},
	show: function() {
		for (var r = 0; r < this.bitmap.length; r++) {
			for (var c = 0; c < this.bitmap[0].length; c++) {
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
		for (var row = 0; row < newBitmap.length; row ++) {
			for (var col = 0; col < newBitmap[row].length; col++) {
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
		for (col = 0; col < this.bitmap[0].length; col++) {
			// Find the bottom-most filled square in the shape's bitmap in this column 
			for (row = this.bitmap.length - 1; row >= 0; row--) {
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
		for (row = 0; row < this.bitmap.length; row++) {
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
		for (row = 0; row < this.bitmap.length; row++) {
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
		this.table = document.createElement('table');
		this.div.appendChild(this.table);
		for (var row = 0; row < this.height; row++) {
			var rowElt = this.table.insertRow(-1);
			for (var col = 0; col < this.width; col++) {
				var cellElt = rowElt.insertCell(-1);
				cellElt.className = 'empty';
				// cellElt.appendChild(dctn(' '));
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
		this.table.rows[row].cells[col].className = Tetris.shapeClasses[type];
	},
	setEmpty: function(row, col) {
		this.table.rows[row].cells[col].className = 'empty';
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
