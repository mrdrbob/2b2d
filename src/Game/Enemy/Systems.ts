import Assets from "../../Assets";
import LdtkData from "../../Engine/Assets/Ldtk";
import Animated from "../../Engine/Components/Animated";
import Position from "../../Engine/Components/Position";
import Sprite from "../../Engine/Components/Sprite";
import Tween from "../../Engine/Components/Tween";
import Vec2 from "../../Engine/Math/Vec2";
import AssetsResource from "../../Engine/Resources/AssetsResource";
import AudioServerResource from "../../Engine/Resources/AudioServerResource";
import Update from "../../Engine/Update";
import Layers from "../../Layers";
import { CleanupOnGameLoopExit } from "../Components";
import { GameStateResource } from "../Resources";
import { PlayerEnemyCollisionEvent } from "../Systems";
import { Bat, Enemy } from "./Components";

export function spawnEnemies(update:Update) {
  const gameState = update.resource<GameStateResource>(GameStateResource.NAME);
  const assets = update.resource<AssetsResource>(AssetsResource.NAME);
  const ldtk = assets.assume<LdtkData>(Assets.PLATFORM_JSON);

  const levelId = gameState.level;
  const levelName = `Level_${levelId}`;
  const level = ldtk.levels.find(x => x.identifier == levelName)!;
  const entities = level.layerInstances.find(x => x.__identifier == 'Entities')!;
  const enemies = entities.entityInstances.filter(x => x.__identifier == 'Enemy_Spawn')!;
  const offset = new Vec2(level.pxWid, level.pxHei).scalarMultiply(-0.5);
  

  for (const enemy of enemies) {
    const position = new Vec2(enemy.px[0], level.pxHei - enemy.px[1]).add(offset);

    update.spawn([
      new Sprite(Assets.CHARACTERS_TEXTURE, Assets.CHARACTERS_ATLAS, Layers.ENTITIES, '4'),
      new Animated('FlyEnemy'),
      new Position(position),
      new Bat(position, position.add(new Vec2(0, 50))),
      new Enemy(1, new Vec2(8, 6)),
      CleanupOnGameLoopExit.TAG
    ]);
  }
}

export function batsFly(update:Update) {
  const query = update.queryCached('batsFly', [ Bat.NAME, Position.NAME ]);

  for (const entity of query) {
    const [ bat, position ] = entity.components as [ Bat, Position ];

    bat.time += update.deltaTime();
    while (bat.time >= bat.totalTime) {
      bat.time -= bat.totalTime;
    }

    const currentTransition = bat.transitions.find(x => bat.time >= x.startTime && bat.time < x.endTime);
    if (!currentTransition)
      continue;

    const diff = currentTransition.end.sub(currentTransition.start);
    if (diff.x == 0 && diff.y == 0) {
      position.pos = currentTransition.start;
      continue;
    }

    const time = bat.time - currentTransition.startTime;
    const totalTime = currentTransition.endTime - currentTransition.startTime;
    const progress = diff.scalarMultiply(time / totalTime);
    position.pos = currentTransition.start.add(progress);
  }
}

export function detectStomps(update:Update) {
  const reader = update.event<PlayerEnemyCollisionEvent>(PlayerEnemyCollisionEvent.NAME);
  const audio = update.resource<AudioServerResource>(AudioServerResource.NAME);

  for (const event of reader.read()) {
    if (!event.fromAbove)
      continue;

    audio.play(Assets.SOUND.DROP);
    update.despawn(event.enemy);
    
    const [ position ] = update.getEntityComponents(event.enemy, [ Position.NAME ]) as [ Position ];

    // Yikes, I don't love this.
    const globalPosition = position.globalPosition();
    const sprite =  new Sprite(Assets.CHARACTERS_TEXTURE, Assets.CHARACTERS_ATLAS, Layers.ENTITIES, '5').withColor(1, 0, 0, 1);
    const newPosition = new Position(globalPosition);
    update.spawn([
      sprite,
      newPosition,
      Tween.PositionAndAlpha(1000, newPosition, sprite, globalPosition.add(new Vec2(0, 50)), 0, Tween.DespawnAfter),
    ]);
  }
}