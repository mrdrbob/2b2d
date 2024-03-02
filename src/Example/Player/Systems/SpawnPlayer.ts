import LdtkData from "../../../2B2D/Assets/LdtkData";
import Animated from "../../../2B2D/Components/Animated";
import KineticBody from "../../../2B2D/Components/KineticBody";
import Position from "../../../2B2D/Components/Position";
import Sprite from "../../../2B2D/Components/Sprite";
import Tag from "../../../2B2D/Components/Tag";
import UseSpriteRenderer from "../../../2B2D/Components/UseSpriteRenderer";
import Velocity from "../../../2B2D/Components/Velocity";
import Weight from "../../../2B2D/Components/Weight";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import GameAssets from "../../GameAssets";
import { GameloopCleanupTag } from "../../GamePlugin";
import { GameStateResouce } from "../../GameStateResource";
import Layers from "../../Layers";
import Player from "../Components/Player";

export default function spawnPlayer(update:Update) {
  const gameState = update.resource<GameStateResouce>(GameStateResouce.name);
  const assets = update.assets();

  const ldtk = assets.assume<LdtkData>(GameAssets.LevelData.LdtkData.Handle);

  const levelName = `Level_${gameState.level}`;
  const level = ldtk.levels.find(x => x.identifier == levelName)!;
  const entities = level.layerInstances.find(x => x.__identifier == 'Entities')!;
  const player = entities.entityInstances.find(x => x.__identifier == 'Player_Spawn')!;
  const offset = new Vec2(level.pxWid, level.pxHei).scalarMultiply(-0.5);
  const position = new Vec2(player.px[0], level.pxHei - player.px[1]).add(offset);

  update.spawn([
    Position(position),
    Sprite(
      GameAssets.Characters.Texture.Handle,
      GameAssets.Characters.Atlas.Handle,
      Layers.Entities,
    ),
    UseSpriteRenderer(),
    Animated('Idle'),
    Velocity(Vec2.ZERO),
    KineticBody(new Vec2(8, 12)),
    Weight(-0.05),
    Player(),
    Tag(GameloopCleanupTag),
  ]);
}