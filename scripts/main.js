import DomController from "./Dom.controller.mjs";
import Game from "./Game.mjs";

const game = new Game();
const dom = new DomController({
  root: 'body',
  game,
});

dom.init();
