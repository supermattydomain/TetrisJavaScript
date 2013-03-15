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
			clearInterval(interval);
			if (board.tick()) {
				nextShapeDisplay.display(board.nextType);
				interval = setInterval(timerFunc, Tetris.delay(speedSlider.slider("option", "value")));
			} else {
				stopRunning();
				nextShapeDisplay.clear();
				stopGoButton.attr("disabled", "disabled");
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
		stopGoButton.on('click', function() {
			toggleRunning();
		});
		resetButton.on('click', function() {
			stopRunning();
			stopGoButton.removeAttr("disabled");
			board.clear();
		});
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
		// Ensure that keyboard focus remains with board, rather than some other keyboard-sensitive widget.
		function focusBoard() {
			boardDiv.focus();
		}
		boardDiv.on("blur", focusBoard);
		speedSlider.slider({ stop: focusBoard });
		// Increase speed when a row is filled
		boardDiv.on(Tetris.eventNames.rowFilled, function() {
			speedSlider.slider("option", "value", speedSlider.slider("option", "value") + 1);
		});
		startRunning();
	})(jQuery);
});
