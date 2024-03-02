import Builder from "../../2B2D/Builder";
import Component from "../../2B2D/Component";
import Camera from "../../2B2D/Components/Camera";
import Parent from "../../2B2D/Components/Parent";
import Position from "../../2B2D/Components/Position";
import Sprite, { SpriteComponent } from "../../2B2D/Components/Sprite";
import Tag from "../../2B2D/Components/Tag";
import UseSpriteRenderer from "../../2B2D/Components/UseSpriteRenderer";
import Update from "../../2B2D/Update";
import GameAssets from "../GameAssets";
import { GameloopCleanupTag } from "../GamePlugin";
import { GameStateResouce } from "../GameStateResource";
import Layers from "../Layers";
import States from "../States";

const Frame = {
  Full: '72,36',
  Half: '90,36',
  Empty: '108,36',
};

export default function HudPlugin(builder:Builder) {
  builder.enter(States.Gameloop, spawnHud);
  builder.update(States.Gameloop, updateHud);
}


interface HealthDisplayComponent extends Component {
  name: 'HealthDisplay',
  empty: number, // <= is empty
  half: number, // == is half
  full: number // >= is full
}

function spawnHud(update:Update) {
  const camera = update.single([ Camera.name, Position.name ]);
  if (!camera) {
    console.warn('HUD could not spawn. No camera');
    return;
  }

  update.spawn([
    { name: 'HealthDisplay', empty: 0, half: 1, full: 2 } as HealthDisplayComponent,
    Sprite(
      GameAssets.LevelData.Tiles.Texture.Handle, 
      GameAssets.LevelData.Tiles.Atlas.Handle, 
      Layers.Hud, 
      Frame.Empty
    ),
    Position.from_xy(-88, 65),
    Parent(camera.entity),
    Tag(GameloopCleanupTag),
    UseSpriteRenderer()
  ]);

  update.spawn([
    { name: 'HealthDisplay', empty: 2, half: 3, full: 4 } as HealthDisplayComponent,
    Sprite(
      GameAssets.LevelData.Tiles.Texture.Handle, 
      GameAssets.LevelData.Tiles.Atlas.Handle, 
      Layers.Hud, 
      Frame.Empty
    ),
    Position.from_xy(-68, 65),
    Parent(camera.entity),
    Tag(GameloopCleanupTag),
    UseSpriteRenderer()
  ]);

  update.spawn([
    { name: 'HealthDisplay', empty: 4, half: 5, full: 6 } as HealthDisplayComponent,
    Sprite(
      GameAssets.LevelData.Tiles.Texture.Handle, 
      GameAssets.LevelData.Tiles.Atlas.Handle, 
      Layers.Hud, 
      Frame.Empty
    ),
    Position.from_xy(-48, 65),
    Parent(camera.entity),
    Tag(GameloopCleanupTag),
    UseSpriteRenderer(),
  ]);
}

function updateHud(update:Update) {
  const query = update.query([ 'HealthDisplay', Sprite.name ]);
  const gameState = update.resource<GameStateResouce>(GameStateResouce.name);
  const health = gameState.health;

  for (const entity of query) {
    const [ display, sprite ] = entity.components as [ HealthDisplayComponent, SpriteComponent ];

    sprite.frame = health <= display.empty ? Frame.Empty
                 : health == display.half ? Frame.Half
                 : Frame.Full;
  }
}