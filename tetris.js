function TetrisBoard(width, height, div) {
	this.setDebug(true);
	this.debugLog("TetrisBoard init");
	this.width = width;
	this.height = height;
	this.div = div;
	this.createGrid(width, height, div);
	this.debugLog("TetrisBoard end init");
}

Object.extend(TetrisBoard.prototype, {
	createGrid : function(width, height, div) {
		var table = dce('table');
		setClass(table, 'board');
		div.appendChild(table);
		for ( var row = 0; row < height; row++) {
			var rowElt = table.insertRow(-1);
			setClass(rowElt, 'board');
			for ( var col = 0; col < width; col++) {
				var cellElt = rowElt.insertCell(-1);
				setClass(cellElt, 'empty');
				// cellElt.appendChild(dctn(' '));
	}
}
}
});

function Shape(row, col, type, rot) {
	this.row = row;
	this.col = col;
	this.type = type;
	this.rot = rot;
}

Object.extend(Shape.prototype, {
	rotate : function(clockwise) {
		if (clockwise) {
			if (++rot > 3) {
				rot = 0;
			}
		} else {
			if (--rot < 0) {
				rot = 3;
			}
		}
	}
});
