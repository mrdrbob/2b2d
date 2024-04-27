import LdktLevelsAsset from "../../../2B2D/Assets/LdktLevelsAsset";
import AnimatedTilemap from "../../../2B2D/Components/AnimatedTilemap";
import CollisionTarget from "../../../2B2D/Components/CollisionTarget";
import Depth from "../../../2B2D/Components/Depth";
import Position from "../../../2B2D/Components/Position";
import StaticBody from "../../../2B2D/Components/StaticBody";
import Tilemap from "../../../2B2D/Components/Tilemap";
import AABB from "../../../2B2D/Math/AABB";
import Update from "../../../2B2D/Update";
import Depths from "../../Depths";
import GameAssets from "../../GameAssets";
import GameStateCleanup from "../../GameStateCleanup";
import GameStateResource from "../../GameStateResource";
import DeathTarget from "../DeathTarget";
import FlagTarget from "../FlagTarget";

export default function SpawnLevel(update: Update) {
  const gamestate = update.resource(GameStateResource);
  const assets = update.assets();

  const level = `Level_${gamestate.level}`;

  // Spawn the layers for the current level
  update.spawn(
    Position.from(0, 0),
    new Depth(Depths.BG),
    new Tilemap(GameAssets.ldkt.handle, level, 'Background'),
    GameStateCleanup.Tag
  );
  update.spawn(
    Position.from(0, 0),
    new Depth(Depths.Tiles),
    new Tilemap(GameAssets.ldkt.handle, level, 'Tiles'),
    new AnimatedTilemap(300),
    GameStateCleanup.Tag
  );
  update.spawn(
    Position.from(0, 0),
    new Depth(Depths.FG),
    new Tilemap(GameAssets.ldkt.handle, level, 'Foreground'),
    GameStateCleanup.Tag
  );

  // Spawn collision targets
  const ldtk = assets.assume<LdktLevelsAsset>(GameAssets.ldkt.handle);
  const tiles = ldtk.getIntGrid(level, 'Collisions');
  
  // Static bodies (that the player should not be able to pass through)
  const staticBodies = AABB.simplify(tiles.filter(x => x.type == 1).map(x => x.aabb));
  for (const tile of staticBodies) {
   update.spawn(
    new Position(tile.pos),
    new StaticBody(tile.size),
    GameStateCleanup.Tag
   );
  }

  // Our Flag Means YOU WIN!
  const flagTiles = AABB.simplify(tiles.filter(x => x.type == 2).map(x => x.aabb));
  for (const tile of flagTiles) {
   update.spawn(
    new Position(tile.pos),
    new CollisionTarget(FlagTarget, tile.size),
    GameStateCleanup.Tag
   );
  }

  // Water and bottomless pits = death
  const deathTiles = AABB.simplify(tiles.filter(x => x.type == 3).map(x => x.aabb));
  for (const tile of deathTiles) {
   update.spawn(
    new Position(tile.pos),
    new CollisionTarget(DeathTarget, tile.size),
    GameStateCleanup.Tag
   );
  }
}