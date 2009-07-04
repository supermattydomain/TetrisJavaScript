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
	getTable: function() {
		return this.table;
	}
};

var shapeBitmaps = new Array(7);

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
 '  X',
 ' XX',
 ' X '
];

shapeBitmaps[3] =
[
 ' X ',
 ' XX',
 '  X'
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

function Shape(table, row, col, type) {
	this.setDebug(true);
	this.table = table;
	this.row = row;
	this.col = col;
	this.type = type;
	this.rot = 0;
	this.bitmap = shapeBitmaps[this.type];
	this.show();
}

Shape.prototype = {
	hide : function() {
		for ( var r = 0; r < this.bitmap.length; r++) {
			for ( var c = 0; c < this.bitmap[0].length; c++) {
				if (this.bitmap[r][c] != ' ') {
					var square = this.table.rows[this.row + r].cells[this.col + c];
					setClass(square, 'empty');
				}
			}
		}
	},
	show: function() {
		// this.debugLog(this.bitmap);
		for (var r = 0; r < this.bitmap.length; r++) {
			for (var c = 0; c < this.bitmap[0].length; c++) {
				var square = this.table.rows[this.row + r].cells[this.col + c];
				if (this.bitmap[r][c] != ' ') {
					setClass(square, 'shape');
				}
			}
		}
	},
	rotate : function(clockwise) {
		debugLog('Rotate');
		this.hide();
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
						newBitmap[newRow][newCol] = ' ';
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
						newBitmap[newRow][newCol] = ' ';
					} else {
						newBitmap[newRow][newCol] = this.bitmap[oldRow][oldCol];
					}
				}
			}
		}
		this.bitmap = newBitmap;
		this.show();
	}
};
