import { DEFAULT_FIELD_SIZE } from "./constants.mjs";

class DomController {
  constructor({ root, game }) {
    this.active = true;
    this.game = game;
    this.rootNode = document.querySelector(root);
    this.lastClickedIndices = [-1, -1];
  }

  init() {
    const size = this.game.getSize();
    this.createTable(size, size);
  }

  createTable(rows = DEFAULT_FIELD_SIZE, cols = DEFAULT_FIELD_SIZE) {
    const child = document.createElement('table');
    this.rootNode.appendChild(child);

    const table = this.rootNode.querySelector('table');

    for (let i = 0; i < rows; i++) {
      const row = table.insertRow(i);

      for (let j = 0; j < cols; j++) {
        const cell = row.insertCell(j);
        cell.addEventListener('click', this._handleCellClick.bind(this, i, j));
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
      if (!this._checkContinue()) return;

      //todo change bot to second user
      this._makeBotMove();
      this._checkContinue();
    } catch (err) {
      window.alert(err.message);
    }
  }

  _checkContinue() {
    const state = this.game.checkGame();

    if (state !== "continue") {
      if (!this.active) return false;

      const status = this._createNode("div", {
        text: state,
        id: "status",
      });

      const clearButton = this._createNode("button", {
        text: "Play again",
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

    if (!!id) node.id = id;
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

export default DomController;
