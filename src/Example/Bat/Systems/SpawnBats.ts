import LdtkData from "../../../2B2D/Assets/LdtkData";
import Animated from "../../../2B2D/Components/Animated";
import Position from "../../../2B2D/Components/Position";
import Sprite from "../../../2B2D/Components/Sprite";
import Tag from "../../../2B2D/Components/Tag";
import UseSpriteRenderer from "../../../2B2D/Components/UseSpriteRenderer";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import Enemy from "../../Enemy/Components/Enemy";
import GameAssets from "../../GameAssets";
import { GameloopCleanupTag } from "../../GamePlugin";
import GameStateResouce from "../../GameStateResource";
import Layers from "../../Layers";
import Bat from "../Components/Bat";

export default function SpawnBats(update:Update) {
  const gameState = update.resource<GameStateResouce>(GameStateResouce.NAME);
  const assets = update.assets();
  const ldtk = assets.assume<LdtkData>(GameAssets.LevelData.LdtkData.Handle);

  const levelId = gameState.level;
  const levelName = `Level_${levelId}`;
  const level = ldtk.levels.find(x => x.identifier == levelName)!;
  const entities = level.layerInstances.find(x => x.__identifier == 'Entities')!;
  const enemies = entities.entityInstances.filter(x => x.__identifier == 'Enemy_Spawn')!;
  const offset = new Vec2(level.pxWid, level.pxHei).scalarMultiply(-0.5);
  
  for (const enemy of enemies) {
    const position = new Vec2(enemy.px[0], level.pxHei - enemy.px[1]).add(offset);

    update.spawn([
      new Sprite(
        GameAssets.Characters.Texture.Handle,
        GameAssets.Characters.Atlas.Handle,
        Layers.Entities,
        '4'
      ),
      new Animated('FlyEnemy'),
      new Position(position),
      new Bat(position, position.add(new Vec2(0, 50))),
      new Enemy(1, new Vec2(8, 6)),
      GameloopCleanupTag,
      UseSpriteRenderer
    ]);
  }
}