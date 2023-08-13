import {
  BOARD_INITIAL_STATE,
  CROSS_SYMBOL,
  TAKEN_CELL_ERROR,
  FULL_BOARD_ERROR,
  ZERO_SYMBOL,
  USER_NAME,
  BOT_NAME,
  DEFAULT_FIELD_SIZE,
} from "./constants.mjs";

export default class Game {
  constructor(board, fieldSize) {
    this._board = board || this._cloneBoardState(BOARD_INITIAL_STATE);
    this._fieldSize = fieldSize || DEFAULT_FIELD_SIZE;

    this._userMoveSymbol = CROSS_SYMBOL;
    this._botMoveSymbol = ZERO_SYMBOL;

    this._userName = USER_NAME;
    this._botName = BOT_NAME;

    this._history = [];
  }

  getState() {
    return this._board;
  }

  getMoveHistory() {
    return this._history;
  }

  acceptUserMove(x, y) {
    if (!this._isCellFree(x, y)) {
      return this._throwException(TAKEN_CELL_ERROR);
    }

    this._updateHistory(this._userName, x, y);
    this._updateBoard(x, y);
  }

  createBotMove() {
    if (this._getFreeCellsCount() === 0) {
      return this._throwException(FULL_BOARD_ERROR);
    }

    const [x, y] = this._getFreeRandomCoordinates();
    this._updateHistory(this._botName, x, y);
    this._updateBoard(x, y, this._botMoveSymbol);
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

  _getSymbolForPlayer(player) {
    return player === this._userName
      ? this._userMoveSymbol
      : this._botMoveSymbol;
  }

  _checkCellEqual(symbol) {
    return (i, j) =>
      this._board[i][j] === symbol;
  }

  _updateHistory(turn, x, y) {
    this._history.push({ turn, x, y });
  }

  _updateBoard(x, y, symbol = this._userMoveSymbol) {
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
