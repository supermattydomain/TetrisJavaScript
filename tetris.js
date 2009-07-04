function TetrisBoard(width, height, div) {
	this.setDebug(true);
	this.debugLog("TetrisBoard init");
	this.width = width;
	this.height = height;
	this.div = div;
	this.createGrid();
	this.debugLog("TetrisBoard end init");
}

Object.extend(TetrisBoard.prototype, {
	createGrid : function() {
		this.table = dce('table');
		setClass(this.table, 'board');
		this.div.appendChild(this.table);
		for ( var row = 0; row < this.height; row++) {
			var rowElt = this.table.insertRow(-1);
			setClass(rowElt, 'board');
			for ( var col = 0; col < this.width; col++) {
				var cellElt = rowElt.insertCell(-1);
				setClass(cellElt, 'empty');
				// cellElt.appendChild(dctn(' '));
			}
		}
	},
	getTable: function() {
		return this.table;
	}
});

var shapeBitmaps = [
[
 'XX',
 'XX',
 ],

[
 '  X ',
 '  X ',
 '  X ',
 '  X ',
],

[
 '  X ',
 ' XX ',
 ' X  ',
 '    ',
],

[
 ' X  ',
 ' XX ',
 '  X ',
 '    ',
],

[
 '    ',
 ' X  ',
 ' XX ',
 ' X  '
],

[
 ' X  ',
 ' X  ',
 ' XX ',
 '    ',
],

[
 '  X ',
 '  X ',
 ' XX ',
 '    ',
]

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

Object.extend(Shape.prototype, {
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
		var row;
		var col;
		var newBitmap = new Array(this.bitmap.length);
		for (row = 0; row < this.bitmap.length; row++) {
			newBitmap[row] = new Array(this.bitmap[row].length);
		}
		// FIXME: I have the sense of clockwise inverted, and I don't see how.
		if (!clockwise) {
			if (++this.rot > 3) {
				this.rot = 0;
			}
			// +row -> -col, newCol = inv(row)
			// +col -> +row, newRow = col
			for (row = 0; row < this.bitmap.length; row++) {
				for (col = 0; col < this.bitmap[row].length; col++) {
					newBitmap[row][col] = this.bitmap[col][this.bitmap.length - 1 - row];
				}
			}
		} else {
			// +row -> +col, newCol = row
			// +col -> -row, newRow = inv(col)
			if (--this.rot < 0) {
				this.rot = 3;
			}
			for (row = 0; row < this.bitmap.length; row++) {
				for (col = 0; col < this.bitmap[row].length; col++) {
					newBitmap[row][col] = this.bitmap[this.bitmap[row].length - 1 - col][row];
				}
			}
		}
		this.bitmap = newBitmap;
		this.show();
	}
});
