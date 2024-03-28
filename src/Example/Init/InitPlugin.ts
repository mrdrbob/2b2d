import Builder from "../../2B2D/Builder";
import Camera from "../../2B2D/Components/Camera";
import Parent from "../../2B2D/Components/Parent";
import Position from "../../2B2D/Components/Position";
import Shaker from "../../2B2D/Components/Shaker";
import RenderGradients from "../../2B2D/Rendering/GradientRenderer";
import RenderSprites from "../../2B2D/Rendering/SpriteRenderer";
import RenderTilemaps from "../../2B2D/Rendering/TilemapRenderer";
import Update from "../../2B2D/Update";
import GameAssets from '../GameAssets';
import States from "../States";

// Useful for systems that require a camera to be spawned, but not necessarily assets loaded.
export const InitializationStarted = 'InitializationStarted';

// Really means all assets have been loaded.
export const InitializationComplete = 'InitializationComplete';

export const CameraParent = 'CameraParent';

export default function InitPlugin(builder: Builder) {
  builder.enter(States.Init, enterInit);
  builder.update(States.Init, waitForLoad);
}

function enterInit(update: Update) {
  const assets = update.assets();
  const audio = update.audio();

  // Handle to be used to move the camera around.
  const tag = update.spawn([
    Position.fromXY(0, 0),
    CameraParent
  ]);

  // A shaker to move things around
  const shaker = update.spawn([
    new Shaker(200, 5, 50),
    Position.fromXY(0, 0),
    new Parent(tag),
  ]);

  // Spawn a camera
  update.spawn([
    Position.fromXY(0, 0),
    Camera,
    new Parent(shaker),
  ]);

  // Add renderers
  update.addRenderer(RenderSprites);
  update.addRenderer(RenderGradients);
  update.addRenderer(RenderTilemaps);

  GameAssets.Init(assets, audio);

  update.signals.send(InitializationStarted);
}

function waitForLoad(update: Update) {
  const assets = update.assets();

  const allLoaded = GameAssets.IsLoaded(assets);

  if (allLoaded) {
    GameAssets.GenerateTilemaps(assets);

    update.exit(States.Init);
    update.signals.send(InitializationComplete);
  }
}