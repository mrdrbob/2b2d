import Assets from "../Assets";
import { Curtain } from "../Curtain/Plugin";
import spawnCurtains from "../Curtain/SpawnCurtains";
import Component from "../Engine/Component";
import Camera from "../Engine/Components/Camera";
import Gradient from "../Engine/Components/Gradient";
import Position from "../Engine/Components/Position";
import Sprite from "../Engine/Components/Sprite";
import Tag from "../Engine/Components/Tag";
import GameEngineBuilder from "../Engine/GameEngine";
import Color from "../Engine/Math/Color";
import Vec2 from "../Engine/Math/Vec2";
import KeysResource from "../Engine/Resources/KeysResource";
import Update from "../Engine/Update";
import { closeCurtains } from "../Game/Systems";
import Layers from "../Layers";
import States from "../States";

// Components
export class DespawnOnExitMenu implements Component {
  public static readonly NAME:string = 'DespawnOnExitMenu';
  name() { return DespawnOnExitMenu.NAME; }

  private constructor() { }
  public static readonly TAG:DespawnOnExitMenu = new DespawnOnExitMenu();
}




// Systems
function spawnMenuGraphic(update:Update) {
  update.spawn([
    new Sprite(Assets.MENU_TEXTURE, Assets.MENU_ATLAS, Layers.BG, '0'),
    Position.fromXY(0, 0),
    DespawnOnExitMenu.TAG,
  ]);

  /*
  const sprite = new Sprite(Assets.CHARACTERS_TEXTURE, Assets.CHARACTERS_ATLAS, Layers.ENTITIES, '0');
  sprite.color = [1, 1, 1, 0.5];
  
  update.spawn([
    sprite,
    Position.fromXY(-20, 20),
    new DespawnOnExitMenu()
  ]);
  //*/
}

function waitForSpace(update:Update) {
  const keys = update.resource<KeysResource>(KeysResource.NAME);

  if (keys.keyJustReleased(' ')) {
    update.exitState(States.MAIN_MENU);
    update.enterState(States.MAIN_MENU_TO_GAME);
  }
}

function spawnClosingCurtains(update:Update) {
  spawnCurtains(update, (args) => {
    args.update.exitState(States.MAIN_MENU_TO_GAME);
    args.update.enterState(States.GAME);
    args.update.despawn(args.entity);
  });
}


function cleanup(update:Update) {
  const query = update.query([DespawnOnExitMenu.NAME]);
  for (const { entity } of query) {
    update.despawn(entity);
  }
}


// "Plugin"
export default function addMainMenu(builder:GameEngineBuilder) {
  builder.systems.enter(States.MAIN_MENU, closeCurtains);
  builder.systems.enter(States.MAIN_MENU, spawnMenuGraphic);
  builder.systems.update(States.MAIN_MENU, waitForSpace);
  builder.systems.enter(States.MAIN_MENU_TO_GAME, spawnClosingCurtains);
  builder.systems.exit(States.MAIN_MENU_TO_GAME, cleanup);
}
