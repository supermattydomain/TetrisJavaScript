jQuery(function() {
	(function($) {
		var boardColumns = 10,
			boardRows = 20,
			interval = undefined,
			stopGoButton = $('#stopGoButton'),
			resetButton = $('#resetButton'),
			nextShapeDisplay = new Tetris.NextShapeDisplay($('#nextShape')),
			boardDiv = $('#board'),
			board = new Tetris.Board(boardColumns, boardRows, boardDiv),
			speedSlider = $("#speedSlider");
		function timerFunc() {
			board.tick();
			if (isRunning()) {
				clearInterval(interval);
				interval = setInterval(timerFunc, Tetris.delay(speedSlider.slider("option", "value")));
			}
		}
		function startRunning() {
			clearInterval(interval);
			interval = setInterval(timerFunc, Tetris.delay(speedSlider.slider("option", "value")));
			stopGoButton.val('Pause');
		}
		function stopRunning() {
			clearInterval(interval);
			interval = undefined;
			stopGoButton.val('Go');
		}
		function isRunning() {
			return !!interval;
		}
		function toggleRunning() {
			if (isRunning()) {
				stopRunning();
			} else {
				startRunning();
			}
		}
		function focusBoard() {
			boardDiv.focus();
		}
		var keyHandlers = {
				32: function() { board.drop(); },
				37: function() { board.moveLeft(); },
				38: function() { board.rotate(false); },
				39: function() { board.moveRight(); },
				40: function() { board.fall(); }
		};
		$(document).on('keydown', function(event) {
			if (!isRunning()) {
				return false;
			}
			if ((event.which || event.keyCode) in keyHandlers) {
				keyHandlers[event.which || event.keyCode]();
				event.preventDefault();
				return true;
			}
			return false;
		});
		// When the stop/go button is clicked, toggle game running state
		stopGoButton.on('click', function() {
			toggleRunning();
			focusBoard();
		});
		// When the reset button is clicked, stop the game and clear the board
		resetButton.on('click', function() {
			stopRunning();
			stopGoButton.removeAttr("disabled");
			board.clear();
			focusBoard();
		});
		// Ensure that keyboard focus remains with board, rather than some other keyboard-sensitive widget.
		boardDiv.on("blur", focusBoard);
		speedSlider.slider({ stop: focusBoard });
		// Increase speed when a row is filled
		boardDiv.on(Tetris.eventNames.rowZapped, function(event, rowIndex) {
			speedSlider.slider("option", "value", speedSlider.slider("option", "value") + 1);
		});
		// When board's next shape changes, display it in the next-shape display
		boardDiv.on(Tetris.eventNames.nextShapeChanged, function(event, nextShapeType) {
			nextShapeDisplay.display(nextShapeType);
		});
		// When there is no room to show a new shape, the game is over
		boardDiv.on(Tetris.eventNames.shapeShowBlocked, function(event) {
			stopRunning();
			nextShapeDisplay.clear();
			stopGoButton.attr("disabled", "disabled");
		});
		startRunning();
	})(jQuery);
});
