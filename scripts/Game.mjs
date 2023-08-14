import {
  BOARD_INITIAL_STATE,
  CROSS_SYMBOL,
  TAKEN_CELL_ERROR,
  FULL_BOARD_ERROR,
  ZERO_SYMBOL,
  DEFAULT_FIELD_SIZE,
} from "./constants.mjs";

export default class Game {
  constructor(firstPlayer, secondPlayer, board, fieldSize) {
    this._board = board || this._cloneBoardState(BOARD_INITIAL_STATE);
    this._fieldSize = fieldSize || DEFAULT_FIELD_SIZE;

    this._crossSymbol = CROSS_SYMBOL;
    this._zeroSymbol = ZERO_SYMBOL;

    this._player1 = firstPlayer;
    this._player2 = secondPlayer;

    this._currPlayer = firstPlayer;

    this._history = [];
  }

  getCurrPlayer() {
    return this._currPlayer;
  }

  getPlayers() {
    return [this._player1, this._player2];
  }

  getState() {
    return this._board;
  }

  getSize() {
    return this._fieldSize;
  }

  getMoveHistory() {
    return this._history;
  }

  clear() {
    this._history = [];
    this._currPlayer = this._player1;
    this._board = this._cloneBoardState(BOARD_INITIAL_STATE);
  }

  checkGame() {
    if (this.isWinner(this._player1.getName())) return `${this._player1.getName()} won!`;
    if (this.isWinner(this._player2.getName())) return `${this._player2.getName()} won!`;
    if (this._getFreeCellsCount() === 0) return `Nobody won`;
    return "continue";
  }

  acceptUserMove(x, y) {
    if (!this._isCellFree(x, y)) {
      return this._throwException(TAKEN_CELL_ERROR);
    }

    this._updateHistory(this._currPlayer.getName(), x, y);
    this._updateBoard(x, y, this._currPlayer.getSymbol());
    this._switchPlayers();
  }

  isWinner(player) {
    const symbol = this._getSymbolForPlayer(player);
    const range = [...Array(this._fieldSize).keys()];
    const isEqual = this._checkCellEqual(symbol);

    const horizontal = range.reduce(
      (res, i) => (isEqual(i, 0) && isEqual(i, 1) && isEqual(i, 2)) || res,
      false
    );

    const vertical = range.reduce(
      (res, i) => (isEqual(0, i) && isEqual(1, i) && isEqual(2, i)) || res,
      false
    );

    const diagonal =
      (isEqual(0, 0) && isEqual(1, 1) && isEqual(2, 2)) ||
      (isEqual(0, 2) && isEqual(1, 1) && isEqual(2, 0));

    return horizontal || vertical || diagonal || false;
  }

  _switchPlayers() {
    if (this._currPlayer === this._player1) {
      this._currPlayer = this._player2;
    } else {
      this._currPlayer = this._player1;
    }
  }

  _getSymbolForPlayer(player) {
    return player === this._player1.getName()
      ? this._crossSymbol
      : this._zeroSymbol;
  }

  _checkCellEqual(symbol) {
    return (i, j) =>
      this._board[i][j] === symbol;
  }

  _updateHistory(turn, x, y) {
    this._history.push({ turn, x, y });
  }

  _updateBoard(x, y, symbol = this._crossSymbol) {
    this._board[x][y] = symbol;
  }

  _cloneBoardState(board) {
    return JSON.parse(JSON.stringify(board));
  }

  _getFreeRandomCoordinates() {
    let x = this._getRandomCoordinate();
    let y = this._getRandomCoordinate();

    while (!!this._board[x][y]) {
      x = this._getRandomCoordinate();
      y = this._getRandomCoordinate();
    }

    return [x, y];
  }

  _getFreeCellsCount() {
    return this._board.reduce(
      (total, row) =>
        row.reduce((count, el) => (el === "" ? ++count : count), total), 0);
  }

  _getRandomCoordinate() {
    return Math.floor(Math.random() * (this._fieldSize - 0));
  }

  _isCellFree(x, y) {
    return !this._board[x][y];
  }

  _throwException(msg) {
    throw new Error(msg);
  }
}
