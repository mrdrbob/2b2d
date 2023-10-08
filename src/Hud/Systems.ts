import Assets from "../Assets";
import Camera from "../Engine/Components/Camera";
import Position from "../Engine/Components/Position";
import Sprite from "../Engine/Components/Sprite";
import AssetsResource from "../Engine/Resources/AssetsResource";
import KeysResource from "../Engine/Resources/KeysResource";
import Update from "../Engine/Update";
import { CleanupOnGameLoopExit } from "../Game/Components";
import { GameStateResource } from "../Game/Resources";
import Layers from "../Layers";
import States from "../States";
import { HealthDisplay } from "./Components";

const FULL_HEART = '72,36';
const HALF_HEART = '90,36';
const EMPTY_HEART = '108,36';

const cameraPosition = Position.fromXY(0, 0);

export function spawnCamera(update:Update) {
  update.spawn([
    Camera.TAG,
    cameraPosition
  ]);
  update.exitState(States.SPAWN_CAM);
  update.enterState(States.PRELOAD);
}

export function spawnHud(update:Update) {
  const t = update.resource<AssetsResource>(AssetsResource.NAME).get(Assets.PLATFORM_ATLAS.TILES);

  // /*
  update.spawn([
    new HealthDisplay(0, 1, 2),
    new Sprite(Assets.PLATFORM_TILES_TEXTURE, Assets.PLATFORM_ATLAS.TILES, Layers.HUD, FULL_HEART),
    Position.fromXY(-88, 65).follow(cameraPosition),
    CleanupOnGameLoopExit.TAG,
  ]);

  update.spawn([
    new HealthDisplay(2, 3, 4),
    new Sprite(Assets.PLATFORM_TILES_TEXTURE, Assets.PLATFORM_ATLAS.TILES, Layers.HUD, FULL_HEART),
    Position.fromXY(-68, 65).follow(cameraPosition),
    CleanupOnGameLoopExit.TAG,
  ]);

  update.spawn([
    new HealthDisplay(4, 5, 6),
    new Sprite(Assets.PLATFORM_TILES_TEXTURE, Assets.PLATFORM_ATLAS.TILES, Layers.HUD, FULL_HEART),
    Position.fromXY(-48, 65).follow(cameraPosition),
    CleanupOnGameLoopExit.TAG,
  ]);
  // */
}

export function bringThePain(update:Update) {
  const keys = update.resource<KeysResource>(KeysResource.NAME);
  if (keys.keyJustReleased('q')) {
    const state = update.resource<GameStateResource>(GameStateResource.NAME);
    state.health -= 1;
  }
}

export function updateHealthItems(update:Update) {
  const query = update.queryCached('updateHealthItems', [ HealthDisplay.name, Sprite.NAME ]);
  const gameState = update.resource<GameStateResource>(GameStateResource.NAME);
  const health = gameState.health;

  for (const entity of query) {
    const [ display, sprite ] = entity.components as [ HealthDisplay, Sprite ];

    sprite.frame = health <= display.empty ? EMPTY_HEART
                 : health == display.half ? HALF_HEART
                 : FULL_HEART;
  }
}