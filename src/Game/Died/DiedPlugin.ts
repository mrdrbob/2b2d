import Assets from "../../Assets";
import Config from "../../Config";
import spawnCurtains from "../../Curtain/SpawnCurtains";
import Camera from "../../Engine/Components/Camera";
import Delay from "../../Engine/Components/Delay";
import Position from "../../Engine/Components/Position";
import Sprite from "../../Engine/Components/Sprite";
import Tag from "../../Engine/Components/Tag";
import Tween from "../../Engine/Components/Tween";
import GameEngineBuilder from "../../Engine/GameEngine";
import Vec2 from "../../Engine/Math/Vec2";
import AudioServerResource from "../../Engine/Resources/AudioServerResource";
import Update from "../../Engine/Update";
import Layers from "../../Layers";
import States from "../../States";
import { GameStateResource } from "../Resources";
import { closeCurtains, PlayerDiedEvent } from "../Systems";

export default function addDied(builder:GameEngineBuilder) {
  builder.systems.update(States.GAME, detectPlayerDied);
  builder.systems.enter(States.GAME_TO_DIED, spawnDeathCurtains);
  builder.systems.enter(States.DIED, spawnDeathScreen);
  builder.systems.enter(States.DIED, closeCurtains);
  builder.systems.enter(States.DIED_TO_GAME, spawnCurtainsToGoBackToGame);
  builder.systems.exit(States.DIED_TO_GAME, cleanUpResources);
}

function detectPlayerDied(update:Update) {
  const reader = update.event<PlayerDiedEvent>(PlayerDiedEvent.NAME);
  const event = reader.read();
  if (event.length == 0)
    return;
  
  const audio = update.resource<AudioServerResource>(AudioServerResource.NAME);
  audio.play(Assets.SOUND.DIED);

  const sprite = new Sprite(Assets.DEAD_PLAYER_TEXTURE, Assets.DEAD_PLAYER_ATLAS, Layers.ENTITIES, '0');
  const position = new Position(event[0].playerPosition);
  update.spawn([
    sprite,
    position,
    Tween.PositionAndAlpha(2000, position, sprite, position.pos.add(new Vec2(0, 50)), 0, Tween.DespawnAfter)
  ]);

  update.exitState(States.GAME);
  update.enterState(States.GAME_TO_DIED);
}

function spawnDeathCurtains(update:Update) {
  spawnCurtains(update, (args) => {
    args.update.exitState(States.GAME_TO_DIED);
    args.update.enterState(States.DIED);
    args.update.despawn(args.entity);
  });
}

function spawnDeathScreen(update:Update) {
  const camera = update.queryCached('spawnDeathScreen:camera', [ Camera.NAME, Position.NAME ]);
  const [ _, pos ] = camera[0].components as [ Camera, Position ];

  pos.pos = Vec2.ZERO;

  update.spawn([
    new Sprite(Assets.DEATH_SCREEN_TEXTURE, Assets.DEATH_SCREEN_ATLAS, Layers.BG, '0'),
    Position.fromXY(0, 0),
    new Tag('cleanup:died'),
  ]);
  update.spawn([
    new Delay(2000, spawnGhost),
  ]);
  update.spawn([
    new Delay(4000, spawnYouDied),
  ]);
  update.spawn([
    new Delay(6000, fadeOutYouDied),
  ]);
  update.spawn([
    new Delay(8000, (update) => {
      update.exitState(States.DIED);
      update.enterState(States.DIED_TO_GAME);
    })
  ]);
}

function spawnGhost(update:Update) {
  const sprite = new Sprite(Assets.DEAD_PLAYER_TEXTURE, Assets.DEAD_PLAYER_ATLAS, Layers.ENTITIES, '0').withColor(1, 1, 1, 0);
  const pos = Position.fromXY(0, -50);
  update.spawn([
    sprite,
    pos,
    Tween.PositionAndAlpha(3000, pos, sprite, pos.pos.add(new Vec2(0,150)), 0.4, Tween.DespawnAfter),
  ]);
}

function spawnYouDied(update:Update) {
  const sprite = new Sprite(Assets.YOU_DIED_TEXTURE, Assets.YOU_DIED_ATLAS, Layers.FG, '0').withColor(1, 1, 1, 0);
  const pos = Position.fromXY(0, -20);
  update.spawn([
    sprite,
    pos,
    Tween.PositionAndAlpha(1000, pos, sprite, new Vec2(0,20), 1, (_arg) => {  }),
    new Tag('you-died'),
  ]);
}

function fadeOutYouDied(update:Update) {
  const query = update.query([ 'you-died', Tween.NAME, Position.NAME, Sprite.NAME ]);
  
  const [ _tag, tween, pos, sprite ] = query[0].components as [ Tag, Tween, Position, Sprite ];

  tween.continuePositionAndAlpha(2000, pos, sprite, pos.pos.add(new Vec2(0, 20)), 0, Tween.DespawnAfter);
}

function spawnCurtainsToGoBackToGame(update:Update) {
  spawnCurtains(update, (args) => {
    const gameState = update.resource<GameStateResource>(GameStateResource.NAME);
    gameState.health = Config.MaxHealth;

    args.update.exitState(States.DIED_TO_GAME);
    args.update.enterState(States.GAME);
    args.update.despawn(args.entity);
  });
}

function cleanUpResources(update:Update) {
  const query = update.query(['cleanup:died']);
  for (const entity of query) {
    update.despawn(entity.entity);
  }
}