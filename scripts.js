(function($) {
	$(function() {
		var boardColumns = 10,
			boardRows = 20,
			stopGoButton = $('#stopGoButton'),
			resetButton = $('#resetButton'),
			nextShapeDisplay = new Tetris.NextShapeDisplay($('#nextShape')),
			boardDiv = $('#board'),
			board = new Tetris.Board(boardColumns, boardRows, boardDiv),
			speedSlider = $("#speedSlider");
		var keyHandlers = {
				32: function() { board.drop(); },
				37: function() { board.moveLeft(); },
				38: function() { board.rotate(false); },
				39: function() { board.moveRight(); },
				40: function() { board.fall(); }
		};
		$(document).on('keydown', function(event) {
			if (!board.isRunning()) {
				return false;
			}
			if ((event.which || event.keyCode) in keyHandlers) {
				keyHandlers[event.which || event.keyCode]();
				event.preventDefault();
				return true;
			}
			return false;
		});
		// When the stop/go button is pressed, toggle game running state.
		// Also move input focus off the button afterwards,
		// so a later spacebar press doesn't pause/resume the game again.
		stopGoButton.on('click', function() {
			board.toggleRunning();
			boardDiv.focus();
			// FIXME: If the document got focus, the browser wouldn't show an ugly
			// focus outline around the board.
			$(document).focus();
		});
		// When the reset button is clicked, stop the game and clear the board.
		// Again, move focus off the control afterwards.
		resetButton.on('click', function() {
			board.stop();
			stopGoButton.removeAttr("disabled");
			board.clear();
			boardDiv.focus();
			// FIXME: If the document got focus, the browser wouldn't show an ugly
			// focus outline around the board.
			$(document).focus();
		});
		// When the speed slider's value changes, change the board's speed.
		// Again, move focus off the control afterwards.
		speedSlider.slider({
			stop: function() {
				board.setDelay(Tetris.delay(speedSlider.slider("option", "value")));
				boardDiv.focus();
				// FIXME: If the document got focus, the browser wouldn't show an ugly
				// focus outline around the board.
				$(document).focus();
			}
		});
		// Increase speed when a row is filled
		boardDiv.on(Tetris.eventNames.rowsZapped, function(event, rowIndex) {
			Tetris.sounds.rowsZapped.play();
			var value = speedSlider.slider("option", "value");
			board.setDelay(Tetris.delay(value));
			speedSlider.slider("option", "value", value + 1);
		});
		// When board's next shape changes, display it in the next-shape display
		boardDiv.on(Tetris.eventNames.nextShapeChanged, function(event, nextShapeType) {
			nextShapeDisplay.display(nextShapeType);
		});
		// When there is no room to show a new shape, the game is over
		boardDiv.on(Tetris.eventNames.shapeShowBlocked, function(event) {
			board.stop();
			nextShapeDisplay.clear();
			stopGoButton.attr("disabled", "disabled");
			$().toastmessage('showNoticeToast', 'Game over');
		});
		// Update the UI when the board's state changes
		boardDiv.on(Tetris.eventNames.boardStarted, function() {
			stopGoButton.val('Pause');
		});
		boardDiv.on(Tetris.eventNames.boardStopped, function() {
			stopGoButton.val('Resume');
		});
		boardDiv.on(Tetris.eventNames.shapeFallBlocked, function() {
			Tetris.sounds.shapeFallBlocked.play();
		});
		board.setDelay(Tetris.delay(speedSlider.slider("option", "value")));
		$(document).focus();
		board.start();
	});
})(jQuery);
