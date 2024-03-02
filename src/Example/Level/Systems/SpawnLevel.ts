import LdtkData from "../../../2B2D/Assets/LdtkData";
import AnimatedTilemap from "../../../2B2D/Components/AnimatedTilemap";
import CollsisionTarget from "../../../2B2D/Components/CollissionTarget";
import Position from "../../../2B2D/Components/Position";
import StaticBody from "../../../2B2D/Components/StaticBody";
import Tag from "../../../2B2D/Components/Tag";
import Tilemap from "../../../2B2D/Components/Tilemap";
import Update from "../../../2B2D/Update";
import processLdtkIntGrid from "../../../2B2D/Utils/LdtkUtilities";
import GameAssets from "../../GameAssets";
import { GameloopCleanupTag } from "../../GamePlugin";
import { GameStateResouce } from "../../GameStateResource";
import Layers from "../../Layers";
import { DeathTileTarget, FlagTileTarget } from "../LevelPlugin";

export default function SpawnLevel(update:Update) {
  const gameState = update.resource<GameStateResouce>(GameStateResouce.name);

  // Spawn background tilemap
  update.spawn([
    Tilemap(
      Layers.BG, 
      GameAssets.LevelData.Background.Texture.Handle, 
      GameAssets.LevelData.Background.Tilemap.Handle(gameState.level)
    ),
    Position.from_xy(0, 0),
    Tag(GameloopCleanupTag)
  ]);

  // The "middle" tiles
  update.spawn([
    Tilemap(
      Layers.BG, 
      GameAssets.LevelData.Tiles.Texture.Handle, 
      GameAssets.LevelData.Tiles.Tilemap.Handle(gameState.level, 0)
    ),
    Position.from_xy(0, 0),
    AnimatedTilemap(
      [GameAssets.LevelData.Tiles.Tilemap.Handle(gameState.level, 0), 
        GameAssets.LevelData.Tiles.Tilemap.Handle(gameState.level, 1)], 
      300
    ),
    Tag(GameloopCleanupTag)
  ]);

  // Foreground tiles
  update.spawn([
    Tilemap(
      Layers.BG, 
      GameAssets.LevelData.Tiles.Texture.Handle, 
      GameAssets.LevelData.Foreground.Tilemap.Handle(gameState.level)
    ),
    Position.from_xy(0, 0),
    Tag(GameloopCleanupTag)
  ]);

  const assets = update.assets();
  const ldtk = assets.assume<LdtkData>(GameAssets.LevelData.LdtkData.Handle);

  // Spawn all the static bodies
  const levelName = `Level_${gameState.level}`;
  processLdtkIntGrid(ldtk, levelName, 'Collisions', 1, (pos, size) => {
    update.spawn([
      Position(pos),
      StaticBody(size),
      Tag(GameloopCleanupTag)
    ]);
  });
  
  // Flag Tiles
  processLdtkIntGrid(ldtk, levelName, 'Collisions', 2, (pos, size) => {
    update.spawn([
      Position(pos),
      CollsisionTarget(FlagTileTarget, size),
      Tag(GameloopCleanupTag),
    ]);
  });

  // Death Tiles
  processLdtkIntGrid(ldtk, levelName, 'Collisions', 3, (pos, size) => {
    update.spawn([
      Position(pos),
      CollsisionTarget(DeathTileTarget, size),
      Tag(GameloopCleanupTag),
    ]);
  });
}