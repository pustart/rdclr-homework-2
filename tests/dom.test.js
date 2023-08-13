import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import jsdom from 'jsdom';
import Game from "../scripts/Game.mjs";
import DomController from "../scripts/Dom.controller.mjs";

const { JSDOM } = jsdom;
const dom = new JSDOM('<html><body id="root"></body></html>');

global.window = dom.window;
global.document = dom.window.document;

const createGame = (board) => new Game(board);

const createInstance = (game = {}) => {
  return new DomController({
    game: game,
    root: '#root'
  });
};

beforeEach(() => {
  window.alert = jest.fn();
});

afterEach(() => {
  document.body.innerHTML = '';
  window.alert.mockReset();
});

afterAll(() => {
  window.alert.mockRestore();
});


describe('DOM controller', () => {
  test('Creates empty table', () => {
    const domController = createInstance();
    domController.createTable();

    expect(document.querySelectorAll('table').length).toBe(1);
  });

  test('Creates table with 3 rows and 3 columns', () => {
    const domController = createInstance();

    domController.createTable(3, 3);

    expect(document.querySelectorAll('table').length).toBe(1);
    expect(document.querySelectorAll('tr').length).toBe(3);
    expect(document.querySelectorAll('td').length).toBe(9);
  });

  test('Remembers indices of last clicked cell', () => {
    const domController = createInstance();

    domController.createTable(3, 3);
    document.querySelector('table td').click();

    expect(domController.lastClickedIndices).toEqual([0, 0]);
  });

  test('Makes user move in game on cell click', () => {
    const gameMock = { acceptUserMove: jest.fn() };
    const domController = createInstance(gameMock);

    domController.createTable(3, 3);
    document.querySelector('table td').click();

    expect(domController.game.acceptUserMove).toHaveBeenCalled();
  });

  test("Checks initialization of table by game state", () => {
    const game = createGame();
    const domController = createInstance(game);

    domController.init();

    expect(document.querySelectorAll("table").length).toBe(1);
    expect(document.querySelectorAll("tr").length).toBe(3);
    expect(document.querySelectorAll("td").length).toBe(9);
  });

  test('Gets an alert when user makes move in taken cell', () => {
    const game = createGame();
    const domController = createInstance(game);

    domController.init();

    document.querySelector('table td').click();
    document.querySelector('table td').click();

    expect(window.alert).toHaveBeenCalled();
  });

  test('Redraws table on cell click', () => {
    const game = createGame();
    const domController = createInstance(game);

    domController.init();
    document.querySelector('table td').click();
    const text = document.querySelector('table td').textContent;

    expect(text).toEqual('×');
  });

  test('Makes computer move right after users move', () => {
    const game = createGame();
    const domController = createInstance(game);

    domController.init();
    document.querySelector('table td').click();
    const text = document.querySelector('table').textContent;

    expect(text.indexOf('o') > -1).toBe(true);
  });

  test('Creates status text below table if someone wins', () => {
    const game = createGame([
      ['×', '×', ''],
      ['', '', ''],
      ['', '', '']
    ]);

    const domController = createInstance(game);

    domController.init();
    document.querySelector('table tr:nth-child(1) td:nth-child(3)').click();

    const status = document.querySelector('#status');
    expect(status.textContent).toEqual('user won!');
  });

  test("Creates clear button if someone wins", () => {
    const game = createGame([
      ["×", "×", ""],
      ["", "", ""],
      ["", "", ""],
    ]);

    const domController = createInstance(game);

    domController.init();
    document.querySelector("table tr:nth-child(1) td:nth-child(3)").click();

    const button = document.querySelectorAll("button");
    expect(button.length).toBe(1);
  });

  test("Clears table on button click", () => {
    const game = createGame([
      ["×", "×", ""],
      ["", "", ""],
      ["", "", ""],
    ]);

    const domController = createInstance(game);

    domController.init();
    document.querySelector("table tr:nth-child(1) td:nth-child(3)").click();
    document.querySelector("button").click();

    expect(document.querySelector("table").textContent).toEqual("");
    expect(document.querySelectorAll("button").length).toBe(0);
  });
});
