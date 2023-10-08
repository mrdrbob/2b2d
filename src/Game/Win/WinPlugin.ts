import Assets from "../../Assets";
import Config from "../../Config";
import spawnCurtains from "../../Curtain/SpawnCurtains";
import Camera from "../../Engine/Components/Camera";
import Delay from "../../Engine/Components/Delay";
import Position from "../../Engine/Components/Position";
import Sprite from "../../Engine/Components/Sprite";
import Tag from "../../Engine/Components/Tag";
import GameEngineBuilder from "../../Engine/GameEngine";
import Vec2 from "../../Engine/Math/Vec2";
import Update from "../../Engine/Update";
import Layers from "../../Layers";
import States from "../../States";
import { GameStateResource } from "../Resources";
import { closeCurtains } from "../Systems";

export default function addYouWinScreen(builder:GameEngineBuilder) {
  builder.systems.enter(States.YOU_WIN, spawnYouWin);
  builder.systems.enter(States.YOU_WIN, closeCurtains);
  builder.systems.exit(States.YOU_WIN_TO_MAIN_MENU, cleanupYouWin);
  builder.systems.enter(States.YOU_WIN_TO_MAIN_MENU, spawnYouWinToMenuCurtains);
}

function spawnYouWin(update:Update) {
  const camera = update.queryCached('spawnYouWin:camera', [ Camera.NAME, Position.NAME ]);
  const [ _, pos ] = camera[0].components as [ Camera, Position ];

  pos.pos = Vec2.ZERO;
  
  update.spawn([
    new Sprite(Assets.YOU_WIN_TEXTURE, Assets.YOU_WIN_ATLAS, Layers.BG, '0'),
    Position.fromXY(0, 0),
    new Tag('cleanup:won'),
  ]);

  update.spawn([
    new Delay(3000, (u) => {
      u.exitState(States.YOU_WIN);
      u.enterState(States.YOU_WIN_TO_MAIN_MENU);
    })
  ])
}

// TODO: Generalize this
function cleanupYouWin(update:Update) {
  const query = update.query(['cleanup:won']);
  for (const entity of query) {
    update.despawn(entity.entity);
  }
}

function spawnYouWinToMenuCurtains(update:Update) {
  const gameState = update.resource<GameStateResource>(GameStateResource.NAME);
  gameState.level = 0;
  gameState.health = Config.MaxHealth;

  spawnCurtains(update, (args) => {
    args.update.exitState(States.YOU_WIN_TO_MAIN_MENU);
    args.update.enterState(States.MAIN_MENU);
    args.update.despawn(args.entity);
  });
}