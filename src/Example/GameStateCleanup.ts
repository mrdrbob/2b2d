import Component from "../2B2D/Components/Component";

export default class GameStateCleanup implements Component {
  static readonly NAME:string = 'GameStateCleanup';
  readonly name:string = GameStateCleanup.NAME;

  constructor() {}

  static readonly Tag:GameStateCleanup = new GameStateCleanup();
}