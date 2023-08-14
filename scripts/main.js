import DomController from "./Dom.controller.mjs";
import Game from "./Game.mjs";
import Player from './Player.mjs';
import {
  FIRST_PLAYER_NAME,
  SECOND_PLAYER_NAME,
  CROSS_SYMBOL,
  ZERO_SYMBOL,
} from "./constants.mjs";

const player1Name = prompt("Enter Player 1 name: ") || FIRST_PLAYER_NAME;
const player2Name = prompt("Enter Player 2 name: ") || SECOND_PLAYER_NAME;

let player1 = new Player(player1Name, CROSS_SYMBOL);
let player2 = new Player(player2Name, ZERO_SYMBOL);

if (confirm(`${player1Name} will go first. `)) {
  player1 = new Player(player1Name, CROSS_SYMBOL);
  player2 = new Player(player2Name, ZERO_SYMBOL);
} else if (confirm(`${player2Name} will go first. `)) {
  player1 = new Player(player2Name, CROSS_SYMBOL);
  player2 = new Player(player1Name, ZERO_SYMBOL);
}

const game = new Game(player1, player2);
const dom = new DomController({
  root: 'body',
  game,
});

dom.init();
