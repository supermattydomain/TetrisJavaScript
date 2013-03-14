jQuery(function() {
	(function($) {
		var width = 10,
			height = 20,
			interval = undefined,
			stopGoButton = $('#stopGoButton'),
			resetButton = $('#resetButton'),
			nextShapeDisplay = new Tetris.NextShapeDisplay($('#nextShapeDiv')),
			board = new Tetris.Board(width, height, $('#boardDiv'));
		function timerFunc() {
			clearInterval(interval);
			if (board.tick()) {
				nextShapeDisplay.display(board.nextType);
				interval = setInterval(timerFunc, Tetris.delay(board.getTicks()));
			} else {
				stopRunning();
			}
		}
		function startRunning() {
			interval = setInterval(timerFunc, Tetris.delay(board.getTicks()));
			stopGoButton.val('Pause');
		}
		function stopRunning() {
			clearInterval(interval);
			interval = undefined;
			stopGoButton.val('Go');
		}
		function toggleRunning() {
			if (interval) {
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
			board.clear();
		});
		startRunning();
	})(jQuery);
});
