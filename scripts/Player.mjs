import { CROSS_SYMBOL } from './constants.mjs';

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

export default Player;
