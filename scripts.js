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
			if (board.tick()) {
				nextShapeDisplay.display(board.nextType);
			} else {
				stopRunning();
			}
		}
		function startRunning(delay) {
			interval = setInterval(timerFunc, delay);
			stopGoButton.val('Pause');
		}
		function stopRunning() {
			clearInterval(interval);
			interval = undefined;
			stopGoButton.val('Go');
		}
		function toggleRunning(delay) {
			if (interval) {
				stopRunning();
			} else {
				startRunning(delay);
			}
		}
		stopGoButton.on('click', function() {
			toggleRunning(1000);
		});
		resetButton.on('click', function() {
			stopRunning();
			board.clear();
		});
		startRunning(1000);
	})(jQuery);
});
