import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import Game from "../scripts/Game.mjs";
import {
  BOARD_INITIAL_STATE,
  CROSS_SYMBOL,
  TAKEN_CELL_ERROR,
  ZERO_SYMBOL,
  FIRST_PLAYER_NAME,
  SECOND_PLAYER_NAME,
} from "../scripts/constants.mjs";
import Player from '../scripts/Player.mjs';

let game;
let player1;
let player2;

beforeEach(() => {
  player1 = new Player(FIRST_PLAYER_NAME, CROSS_SYMBOL);
  player2 = new Player(SECOND_PLAYER_NAME, ZERO_SYMBOL);
  game = new Game(player1, player2);
});

describe('Game module', () => {
  test('Should return empty game board: ', () => {
    const board = game.getState();

    expect(board).toEqual(BOARD_INITIAL_STATE);
  });

  test('Writes user\'s symbol in cell with given coordinates', () => {
    const x = 1;
    const y = 1;

    game.acceptUserMove(x, y);
    const board = game.getState();

    expect(board[x][y]).toEqual(CROSS_SYMBOL);
  });

  test('Throws an exception if user moves in taken cell', () => {
    const x = 2;
    const y = 2;

    game.acceptUserMove(x, y);
    const func = game.acceptUserMove.bind(game, x, y);

    expect(func).toThrow(TAKEN_CELL_ERROR);
  });

  test('Game saves first player\'s move in history', () => {
    const x = 1;
    const y = 1;

    game.acceptUserMove(x, y);
    const history = game.getMoveHistory();

    expect(history).toEqual([{ turn: FIRST_PLAYER_NAME, x, y }]);
  });

  test("Game saves both players moves in history", () => {
    const x = 1;
    const y = 1;

    game.acceptUserMove(2, 2);
    game.acceptUserMove(x, y);

    const history = game.getMoveHistory();

    expect(history).toEqual([{ turn: FIRST_PLAYER_NAME, x: 2, y: 2 }, { turn: SECOND_PLAYER_NAME, x, y }]);
  });

  it('Should handle game continuation', () => {
    expect(game.checkGame()).toEqual('continue');
    game.acceptUserMove(0, 0);
    expect(game.checkGame()).toEqual('continue');
  });

  it('Checks if user won by horizontal', () => {
    game.acceptUserMove(0, 0); // Player 1
    game.acceptUserMove(1, 0); // Player 2
    game.acceptUserMove(0, 1); // Player 1
    game.acceptUserMove(1, 1); // Player 2
    game.acceptUserMove(0, 2); // Player 1 (wins)
    expect(game.checkGame()).toEqual(`${player1.getName()} won!`);
  });

  it('Checks if user won by vertical', () => {
    game.acceptUserMove(0, 0); // Player 1
    game.acceptUserMove(0, 1); // Player 2
    game.acceptUserMove(1, 0); // Player 1
    game.acceptUserMove(1, 1); // Player 2
    game.acceptUserMove(2, 0); // Player 1 (wins)
    expect(game.checkGame()).toEqual(`${player1.getName()} won!`);
  });

  it('Checks if user won by a diagonal', () => {
    game.acceptUserMove(0, 0); // Player 1
    game.acceptUserMove(0, 1); // Player 2
    game.acceptUserMove(1, 1); // Player 1
    game.acceptUserMove(1, 0); // Player 2
    game.acceptUserMove(2, 2); // Player 1 (wins)
    expect(game.checkGame()).toEqual(`${player1.getName()} won!`);
  });

  it('Should detect a draw', () => {
    game.acceptUserMove(0, 0); // Player 1
    game.acceptUserMove(0, 1); // Player 2
    game.acceptUserMove(0, 2); // Player 1
    game.acceptUserMove(1, 2); // Player 2
    game.acceptUserMove(1, 0); // Player 1
    game.acceptUserMove(2, 0); // Player 2
    game.acceptUserMove(1, 1); // Player 1
    game.acceptUserMove(2, 2); // Player 2
    game.acceptUserMove(2, 1); // Player 1
    expect(game.checkGame()).toEqual('Nobody won');
  });
});

const fillCells = (game, config = {}) => {
  const { x = -1, y = -1 } = config;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i !== x || j !== y) game.acceptUserMove(i, j);
    }
  }
};

const count = (arr, symbol) =>
  arr.reduce((result, row) => {
    return row.reduce((count, el) => {
      return el === symbol ? ++count : count;
    }, result);
  }, 0);
