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
 '    ',
 ' XX ',
 ' XX ',
 '    '
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
 ' X  ',
 ' XX ',
 ' X  ',
 '    ',
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

function Shape(table, row, col, type, rot) {
	this.setDebug(true);
	this.table = table;
	this.row = row;
	this.col = col;
	this.type = type;
	this.rot = rot;
	this.bitmap = shapeBitmaps[this.type];
	this.show();
}

Object.extend(Shape.prototype, {
	hide: function() {
	},
	show: function() {
		this.debugLog(this.bitmap);
		for (var r = 0; r < this.bitmap.length; r++) {
			for (var c = 0; c < this.bitmap[0].length; c++) {
				var square = this.table.rows[this.row + r].cells[this.col + c];
				setClass(square, this.bitmap[r][c] != ' ' ? 'shape' : 'empty');
			}
		}
	},
	rotate : function(clockwise) {
		this.hide();
		if (clockwise) {
			if (++rot > 3) {
				rot = 0;
			}
		} else {
			if (--rot < 0) {
				rot = 3;
			}
		}
		this.show();
	}
});
