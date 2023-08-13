import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import Game from "../scripts/Game.mjs";
import GameBuilder from "./GameBuilder.mjs";
import {
  BOARD_INITIAL_STATE,
  CROSS_SYMBOL,
  TAKEN_CELL_ERROR,
  FULL_BOARD_ERROR,
  ZERO_SYMBOL,
  USER_NAME,
  BOT_NAME,
} from "../scripts/constants.mjs";

let game;

beforeEach(() => {
  game = new Game();
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

  test('Game saves user\'s move in history', () => {
    const x = 1;
    const y = 1;

    game.acceptUserMove(x, y);
    const history = game.getMoveHistory();

    expect(history).toEqual([{ turn: USER_NAME, x, y }]);
  });

  test('Game saves computer\'s move in history', () => {
    const mock = jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

    game.createBotMove();
    const history = game.getMoveHistory();

    expect(history).toEqual([{ turn: BOT_NAME, x: 1, y: 1 }]);
    mock.mockRestore();
  });

  test("Game saves 1 user's move and 1 computer's move in history", () => {
    const x = 1;
    const y = 1;

    game.acceptUserMove(x, y);
    game.createBotMove();
    const history = game.getMoveHistory();

    expect(history.length).toEqual(2);
    expect(history[0].turn).toEqual(USER_NAME);
    expect(history[1].turn).toEqual(BOT_NAME);
  });

  test('Computer moves in randomly chosen cell', () => {
    const mock = jest.spyOn(global.Math, 'random').mockReturnValue(0.5);

    game.createBotMove();
    const board = game.getState();

    expect(board[1][1]).toEqual(ZERO_SYMBOL);
    mock.mockRestore();
  });

  test('Computer moves in cell that is not taken', () => {
    fillCells(game, { x: 2, y: 2 });

    game.createBotMove();
    const board = game.getState();

    expect(count(board, CROSS_SYMBOL)).toBe(8);
    expect(count(board, ZERO_SYMBOL)).toBe(1);
    expect(board[2][2]).toEqual(ZERO_SYMBOL);
  });

  test('If there are no free cells computer throws an exception', () => {
    fillCells(game);

    const func = game.createBotMove.bind(game);
    expect(func).toThrow(FULL_BOARD_ERROR);
  });

  test('Checks if user won by horizontal', () => {
    const game = new GameBuilder()
      .withBoardState(
        `
        x x x
        . . .
        . . .`
      )
      .build();

    console.log(game.getState());

    const userWon = game.isWinner(USER_NAME);
    expect(userWon).toEqual(true);
  });

  test('Checks if user won by vertical', () => {
    const game = new GameBuilder()
      .withBoardState(`
      x . .
      x . .
      x . .`)
      .build();

    const userWon = game.isWinner(USER_NAME);
    expect(userWon).toEqual(true);
  });

  test('Checks if user won by main diagonal', () => {
    const game = new GameBuilder()
      .withBoardState(`
      x . .
      . x .
      . . x`)
      .build();

    const userWon = game.isWinner(USER_NAME);
    expect(userWon).toEqual(true);
  });

  test('Checks if user won by reversed diagonal', () => {
    const game = new GameBuilder()
      .withBoardState(`
      . . x
      . x .
      x . .`)
      .build();

    const userWon = game.isWinner(USER_NAME);
    expect(userWon).toEqual(true);
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
