import Assets from "../../../Assets";
import LdtkData from "../../../Engine/Assets/Ldtk";
import Animated from "../../../Engine/Components/Animated";
import KineticBody from "../../../Engine/Components/KineticBody";
import Position from "../../../Engine/Components/Position";
import Sprite from "../../../Engine/Components/Sprite";
import Velocity from "../../../Engine/Components/Velocity";
import Weight from "../../../Engine/Components/Weight";
import Vec2 from "../../../Engine/Math/Vec2";
import AssetsResource from "../../../Engine/Resources/AssetsResource";
import Update from "../../../Engine/Update";
import Layers from "../../../Layers";
import { CleanupOnGameLoopExit } from "../../Components";
import { GameStateResource } from "../../Resources";
import { Player } from "../Components";

export default function spawnPlayer(update:Update) {
  /*
  update.spawn([
    new Debug(Vec2.ZERO, new Vec2(20, 20), [1, 0, 0, 0]),
  ]);
  */
  const gameState = update.resource<GameStateResource>(GameStateResource.NAME);
  const levelId = gameState.level;


  const assets = update.resource<AssetsResource>(AssetsResource.NAME);
  const ldtk = assets.assume<LdtkData>(Assets.PLATFORM_JSON);
  const levelName = `Level_${levelId}`;
  const level = ldtk.levels.find(x => x.identifier == levelName)!;
  const entities = level.layerInstances.find(x => x.__identifier == 'Entities')!;
  const player = entities.entityInstances.find(x => x.__identifier == 'Player_Spawn')!;
  const offset = new Vec2(level.pxWid, level.pxHei).scalarMultiply(-0.5);
  const position = new Vec2(player.px[0], level.pxHei - player.px[1]).add(offset);

  const sprite = new Sprite(Assets.CHARACTERS_TEXTURE, Assets.CHARACTERS_ATLAS, Layers.ENTITIES, '0');
  sprite.color = [1, 1, 1, 1];

  update.spawn([
    new Position(position.add(new Vec2(0, 20))),
    sprite,
    new Animated('Idle'),
    CleanupOnGameLoopExit.TAG,
    new Velocity(Vec2.ZERO),
    KineticBody.fromWH(8, 12),
    new Weight(-0.6),
    new Player(),
    // new Debug(position.add(new Vec2(0, 20)), new Vec2(8 * 2, 24), [0, 1.0, 1.0, 0.5]),
  ]);
}
