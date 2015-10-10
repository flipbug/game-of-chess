/**
 * Bot
 *
 * The ultimate chessbot!
 *
 * @author Daniel Milenkovic
 * @param {int} side
 * @param {int} difficulty
 */
function Bot(side, difficulty) {
	this.side = side;
	// todo: difficulty
	this.difficulty = difficulty;
	this.depthLimit = 5;
}

/**
 * Initialize bot
 *
 * @param  {Chess} chess
 */
Bot.prototype.init = function(chess) {
	this.chess = chess;

	// reference to chessboard and pieces
	this.board = chess.chessboard.board;
	this.pieces = chess.pieces;
}

/**
 * Make a move
 *
 * @return {boolean}
 */
Bot.prototype.makeMove = function() {
	var possibleMoves = this.getPossibleMoves(this.side);

	// clone the chessboard and pieces for simulation
	var simBoard = clone(this.board),
			simPieces = clone(this.pieces);
	var gameTree = this.generateGameTree(this.side, simPieces, simBoard, 0);

	console.log(gameTree);
	// var move = evaluateBestMove(gameTree);

	// go by chance ;)
	var move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
	if (chess.makeMove(move.moves[Math.floor(Math.random() * move.moves.length)], move.piece, true)) {
		return true;
	}

	//todo: alphabeta implementation

	return false;
}

/**
 * soon to be removed
 */
Bot.prototype.getPossibleMoves = function(side, board, depth) {
	var scope = this,
		possibleMoves = [];

	this.pieces[side].forEach(function(piece, index) {
		var moves = [],
			oldPos = {x: piece.x, y: piece.y};

		// iterate through every field to check if possible move
		for (var i = 0; i < scope.board.length; i++) {
			var row = scope.board[i];
			for (var j = 0; j < row.length; j++) {
				var newMove = {x: j, y: i, value: 0, nextMoves: []};
				// validate move
				if (newMove != oldPos && scope.chess.checkMove(newMove, piece)) {
					newMove.value = scope.evaluateMove(newMove);
					moves.push(newMove);
				}
			}
		}

		if (moves.length) {
			possibleMoves.push({
				piece: piece,
				moves: moves
			});
		}
	});

	return possibleMoves;
}

/**
 * Generate a tree from as many moves as possible
 *
 * The tree is generated by iterating recursively through every move, which is
 * a very intensive task, since there are so many posibillities
 *
 * @param  {int} side
 * @param  {Piece} pieces
 * @param  {array} board
 * @param  {int} currentDepth
 * @return {array}
 */
Bot.prototype.generateGameTree = function(side, pieces, board, currentDepth) {
	var scope = this,
		possibleMoves = [];

	// return if depth limit was reached
	if (currentDepth > this.depthLimit) {
		return null;
	}

	// get possible moves for every piece of current player
	pieces[side].forEach(function(piece, index) {
		var moves = [];
		// iterate through every field to check if possible move
		for (var i = 0; i < scope.board.length; i++) {
			var row = scope.board[i];
			for (var j = 0; j < row.length; j++) {
				var newMove = {x: j, y: i, value: 0, nextMoves: []};
				// validate move
				if (newMove.x != piece.x && newMove.y != piece.y && scope.chess.checkMove(newMove, piece)) {
					var tempState = scope.simulateMove(newMove, piece, pieces, board);
					newMove.value = tempState.value;
					// iterate into the future until depth limit is reached
					newMove.nextMoves = scope.generateGameTree(1 - side, tempState.pieces, tempState.board, ++currentDepth);
					moves.push(newMove);
				}
			}
		}

		if (moves.length) {
			possibleMoves.push({
				piece: piece,
				moves: moves
			});
		}
	});

	return possibleMoves;
}

/**
 * Simulate a single move
 *
 * @param  {Object} coords
 * @param  {Piece} piece
 * @param  {array} pieces
 * @param  {array} board
 * @return {Object}
 */
Bot.prototype.simulateMove = function(coords, piece, pieces, board) {
			var value = 0;
			var target = board[coords.y][coords.x];
			if (target) {
				value = target.value;
			}

			// update chessboard matrix
			board[piece.y][piece.x] = 0;
			board[coords.y][coords.x] = piece;

			piece.x = coords.x;
			piece.y = coords.y;

			return {
				value: value,
				board: board,
				pieces: pieces,
			}
}

Bot.prototype.evaluateMove = function() {}
