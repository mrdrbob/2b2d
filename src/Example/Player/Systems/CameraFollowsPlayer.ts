import { LevelsAsset } from "../../../2B2D/Assets/LevelsAsset";
import Position from "../../../2B2D/Components/Position";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import GameAssets from "../../GameAssets";
import GameStateResource from "../../GameStateResource";
import CameraParent from "../../Init/Components/CameraParent";
import Player from "../Components/Player";

let levelId: number | undefined = undefined;
let topLeft = Vec2.ZERO;
let bottomRight = Vec2.ZERO;

export default function CameraFollowsPlayer(update: Update) {
  const camera = update.ecs.single(CameraParent, Position);
  if (!camera)
    return;

  const player = update.ecs.single(Player, Position);
  if (!player)
    return;

  const [_c, cameraPos] = camera.components;
  const [_p, playerPos] = player.components;

  const gameState = update.resource(GameStateResource);
  const assets = update.assets();

  if (levelId != gameState.level) {
    const ldtk = assets.assume<LevelsAsset>(GameAssets.ldkt.handle);
    const levelName = `Level_${gameState.level}`;
    const level = ldtk.levels.get(levelName)!;

    const screenSize = Vec2.from(update.engine.rendering.width, update.engine.rendering.height)
      .scalarMultiply(0.125);
    const levelSize = level.size.scalarMultiply(0.5);

    topLeft = Vec2.ZERO.sub(levelSize).add(screenSize);
    bottomRight = Vec2.ZERO.add(levelSize).sub(screenSize);

    levelId = gameState.level;
  }

  const [_player, playerPosition] = player.components;
  const [_camera, cameraPosition] = camera.components;

  cameraPosition.position = playerPosition.position.max(topLeft).min(bottomRight);
}