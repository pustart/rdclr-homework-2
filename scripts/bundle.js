const FIRST_PLAYER_NAME = "First player";
const SECOND_PLAYER_NAME = "Second player";
const CROSS_SYMBOL = "×";
const ZERO_SYMBOL = "o";
const DEFAULT_FIELD_SIZE = 3;
const BOARD_INITIAL_STATE = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""]
];
const TAKEN_CELL_ERROR = "Cell is already taken";
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
      this.game.clear();
      this.rootNode.innerHTML = "";
      this.active = true;
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
    if (this.isWinner(this._player1.getName()))
      return `${this._player1.getName()} won!`;
    if (this.isWinner(this._player2.getName()))
      return `${this._player2.getName()} won!`;
    if (this._getFreeCellsCount() === 0)
      return `Nobody won`;
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
  _switchPlayers() {
    if (this._currPlayer === this._player1) {
      this._currPlayer = this._player2;
    } else {
      this._currPlayer = this._player1;
    }
  }
  _getSymbolForPlayer(player) {
    return player === this._player1.getName() ? this._crossSymbol : this._zeroSymbol;
  }
  _checkCellEqual(symbol) {
    return (i, j) => this._board[i][j] === symbol;
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
class Player {
  constructor(name, symbol) {
    this._name = name;
    this._symbol = symbol || CROSS_SYMBOL;
  }
  getName() {
    return this._name;
  }
  getSymbol() {
    return this._symbol;
  }
}
const player1Name = prompt("Enter Player 1 name:") || FIRST_PLAYER_NAME;
const player2Name = prompt("Enter Player 2 name:") || SECOND_PLAYER_NAME;
const firstTurn = prompt("Enter name of player with first turn:") || FIRST_PLAYER_NAME;
let player1 = new Player(player1Name, CROSS_SYMBOL);
let player2 = new Player(player2Name, ZERO_SYMBOL);
if (firstTurn === player2Name) {
  player1 = new Player(player2Name, CROSS_SYMBOL);
  player2 = new Player(player1Name, ZERO_SYMBOL);
}
const game = new Game(player1, player2);
const dom = new DomController({
  root: "body",
  game
});
dom.init();
