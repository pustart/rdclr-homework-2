const USER_NAME = "user";
const BOT_NAME = "computer";
const CROSS_SYMBOL = "×";
const ZERO_SYMBOL = "o";
const DEFAULT_FIELD_SIZE = 3;
const BOARD_INITIAL_STATE = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""]
];
const TAKEN_CELL_ERROR = "Cell is already taken";
const FULL_BOARD_ERROR = "No cells available";
class DomController {
  constructor({ root, game: game2 }) {
    this.active = true;
    this.game = game2;
    this.rootNode = document.querySelector(root);
    this.lastClickedIndices = [-1, -1];
  }
  init() {
    const size = this.game.getSize();
    this.createTable(size, size);
  }
  createTable(rows = DEFAULT_FIELD_SIZE, cols = DEFAULT_FIELD_SIZE) {
    const child = document.createElement("table");
    this.rootNode.appendChild(child);
    const table = this.rootNode.querySelector("table");
    for (let i = 0; i < rows; i++) {
      const row = table.insertRow(i);
      for (let j = 0; j < cols; j++) {
        const cell = row.insertCell(j);
        cell.addEventListener("click", this._handleCellClick.bind(this, i, j));
      }
    }
  }
  clear() {
    this.game.clear();
    this.rootNode.innerHTML = "";
    this.active = true;
    this.init();
  }
  _handleCellClick(row, col) {
    this.lastClickedIndices = [row, col];
    try {
      this._makeUserMove(row, col);
      const state = this.game.checkGame();
      if (!this._checkContinue())
        return;
      this._makeBotMove();
      this._checkContinue();
    } catch (err) {
      window.alert(err.message);
    }
  }
  _checkContinue() {
    const state = this.game.checkGame();
    if (state !== "continue") {
      if (!this.active)
        return false;
      const status = this._createNode("div", {
        text: state,
        id: "status"
      });
      const clearButton = this._createNode("button", {
        text: "Play again"
      });
      clearButton.addEventListener("click", this.clear.bind(this));
      this.rootNode.appendChild(status);
      this.rootNode.appendChild(clearButton);
      this.active = false;
      return false;
    }
    return true;
  }
  _createNode(tag, config = {}) {
    const { text, id } = config;
    const node = document.createElement(tag);
    const txt = document.createTextNode(text);
    node.appendChild(txt);
    if (!!id)
      node.id = id;
    return node;
  }
  _makeUserMove(row, col) {
    this.game.acceptUserMove(row, col);
    this._redraw();
  }
  _makeBotMove() {
    this.game.createBotMove();
    this._redraw();
  }
  _redraw() {
    const board = this.game.getState();
    const table = this.rootNode.querySelector("table");
    board.forEach((row, i) => {
      row.forEach((col, j) => {
        table.querySelector(
          `tr:nth-child(${i + 1}) td:nth-child(${j + 1})`
        ).innerHTML = col;
      });
    });
  }
}
class Game {
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
  getSize() {
    return this._fieldSize;
  }
  getMoveHistory() {
    return this._history;
  }
  clear() {
    this._history = [];
    this._board = this._cloneBoardState(BOARD_INITIAL_STATE);
  }
  checkGame() {
    if (this.isWinner(this._userName))
      return `${this._userName} won!`;
    if (this.isWinner(this._botName))
      return `${this._botName} won!`;
    if (this._getFreeCellsCount() === 0)
      return `nobody won :–(`;
    return "continue";
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
      (res, i) => isEqual(i, 0) && isEqual(i, 1) && isEqual(i, 2) || res,
      false
    );
    const vertical = range.reduce(
      (res, i) => isEqual(0, i) && isEqual(1, i) && isEqual(2, i) || res,
      false
    );
    const diagonal = isEqual(0, 0) && isEqual(1, 1) && isEqual(2, 2) || isEqual(0, 2) && isEqual(1, 1) && isEqual(2, 0);
    return horizontal || vertical || diagonal || false;
  }
  _getSymbolForPlayer(player) {
    return player === this._userName ? this._userMoveSymbol : this._botMoveSymbol;
  }
  _checkCellEqual(symbol) {
    return (i, j) => this._board[i][j] === symbol;
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
      (total, row) => row.reduce((count, el) => el === "" ? ++count : count, total),
      0
    );
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
const game = new Game();
const dom = new DomController({
  root: "body",
  game
});
dom.init();
