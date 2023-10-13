import Assets from "../../Assets";
import LdtkData from "../../Engine/Assets/Ldtk";
import AnimatedTilemap from "../../Engine/Components/AnimatedTilemap";
import Position from "../../Engine/Components/Position";
import StaticBody from "../../Engine/Components/StaticBody";
import Tilemap from "../../Engine/Components/Tilemap";
import GameEngineBuilder from "../../Engine/GameEngine";
import AssetsResource from "../../Engine/Resources/AssetsResource";
import Update from "../../Engine/Update";
import { processLdtkIntGrid } from "../../Engine/Utils/LdtkUtils";
import Layers from "../../Layers";
import States from "../../States";
import { CleanupOnGameLoopExit } from "../Components";
import { FlagCollider } from "../Flag/Components";
import { GameStateResource } from "../Resources";
import { WaterCollider } from "../Water/Components";


// Systems
function spawnLevel(update:Update) {
  const gameState = update.resource<GameStateResource>(GameStateResource.NAME);
  const levelId = gameState.level;

  update.spawn([
    new Tilemap(Layers.BG, Assets.PLATFORM_BG_TEXTURE, Assets.PLATFORM_TILEMAPS.BG_TILES + levelId.toString(), Assets.PLATFORM_ATLAS.BG),
    Position.fromXY(0, 0),
    CleanupOnGameLoopExit.TAG,
  ]);

  update.spawn([
    new Tilemap(Layers.TILES, Assets.PLATFORM_TILES_TEXTURE, Assets.PLATFORM_TILEMAPS.TILES[0] + levelId.toString(), Assets.PLATFORM_ATLAS.TILES),
    new AnimatedTilemap([Assets.PLATFORM_TILEMAPS.TILES[0] + levelId.toString(), Assets.PLATFORM_TILEMAPS.TILES[1] + levelId.toString()], 200),
    Position.fromXY(0, 0),
    CleanupOnGameLoopExit.TAG,
  ]);

  update.spawn([
    new Tilemap(Layers.FG, Assets.PLATFORM_TILES_TEXTURE, Assets.PLATFORM_TILEMAPS.FG_TILES + levelId.toString(), Assets.PLATFORM_ATLAS.TILES),
    Position.fromXY(0, 0),
    CleanupOnGameLoopExit.TAG,
  ]);

  const assets = update.resource<AssetsResource>(AssetsResource.NAME);
  const ldtk = assets.assume<LdtkData>(Assets.PLATFORM_JSON);
  const levelName = `Level_${levelId}`;

  // Static Bodies
  processLdtkIntGrid(ldtk, levelName, 'Collisions', 1, (pos, size) => {
    update.spawn([
      new Position(pos),
      new StaticBody(size.scalarMultiply(0.5)),
      CleanupOnGameLoopExit.TAG,
    ])
  });

  // The flag
  processLdtkIntGrid(ldtk, levelName, 'Collisions', 2, (pos, size) => {
    update.spawn([
      new Position(pos),
      new FlagCollider(size.scalarMultiply(0.5)),
      CleanupOnGameLoopExit.TAG,
    ])
  });

  // Death
  processLdtkIntGrid(ldtk, levelName, 'Collisions', 3, (pos, size) => {
    update.spawn([
      new Position(pos),
      new WaterCollider(size.scalarMultiply(0.5)),
      CleanupOnGameLoopExit.TAG,
    ])
  });
}

export default function addLevel(builder:GameEngineBuilder) {
  builder.systems.enter(States.GAME, spawnLevel);
}
