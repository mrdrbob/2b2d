import LdtkData from "../../2B2D/Assets/LdtkData";
import Builder from "../../2B2D/Builder";
import Component from "../../2B2D/Component";
import Position from "../../2B2D/Components/Position";
import Sprite from "../../2B2D/Components/Sprite";
import Timer from "../../2B2D/Components/Timer";
import UseSpriteRenderer from "../../2B2D/Components/UseSpriteRenderer";
import Vec2 from "../../2B2D/Math/Vec2";
import Update from "../../2B2D/Update";
import { CurtainsClosedSignal, closeCurtains, openCurtains } from "../Curtains/CurtainsPlugin";
import GameAssets from "../GameAssets";
import GameStateResouce from "../GameStateResource";
import { CameraParent, InitializationComplete } from "../Init/InitPlugin";
import Layers from "../Layers";
import PlayerTouchedFlag from "../Player/Signals/PlayerTouchedFlag";
import States from "../States";

const WinPluginFirstClose = 'WinPluginFirstClose';
const TransitionToNextPhase = 'TransitionToNextPhase';
const WinPluginSecondClose = 'WinPluginSecondClose';
const TransitionToMenu = 'TransitionToMenu';

const WinPluginCleanupTag = 'WinPluginCleanupTag';
const WinScreenState = 'WinScreenState';

const WinPluginName = 'WinPlugin';

export default function WinPlugin(builder: Builder) {
  builder.handle(PlayerTouchedFlag, playerTouchedFlag);
  builder.handleFrom(CurtainsClosedSignal, WinPluginFirstClose, beginTransitionToNextStage);
  builder.handleFrom(TransitionToNextPhase, WinPluginName, transitionToNextPhase);

  builder.handleFrom(WinPluginSecondClose, WinPluginName, secondCurtainClose);
  builder.handleFrom(CurtainsClosedSignal, TransitionToMenu, transtionToMenu);

  builder.cleanup(WinScreenState, WinPluginCleanupTag);
}

function playerTouchedFlag(update: Update) {
  closeCurtains(update, WinPluginFirstClose);
}

function beginTransitionToNextStage(update: Update) {
  // Allow everything to despawn
  update.exit(States.Gameloop);

  // A small delay to allow the commands to execute and despawn to happen.
  update.spawn([
    new Timer(100, { name: TransitionToNextPhase, sender: WinPluginName })
  ]);
}

function transitionToNextPhase(update: Update) {
  const gameState = update.resource<GameStateResouce>(GameStateResouce.NAME);
  gameState.level += 1;

  const assets = update.assets();
  const ldtk = assets.assume<LdtkData>(GameAssets.LevelData.LdtkData.Handle);

  if (gameState.level >= ldtk.levels.length) {
    // Reset the camera to 0, 0
    const camera = update.single([CameraParent, Position.NAME]);
    if (camera) {
      const [_cam, position] = camera.components as [Component, Position];
      position.pos = Vec2.ZERO;
    }

    // You win screen!
    update.spawn([
      new Sprite(
        GameAssets.WinScreen.Texture.Handle,
        GameAssets.WinScreen.Atlas.Handle,
        Layers.BG
      ),
      Position.fromXY(0, 0),
      UseSpriteRenderer,
      WinPluginCleanupTag
    ]);

    update.spawn([
      new Timer(2000, { name: WinPluginSecondClose, sender: WinPluginName })
    ]);

    update.enter(WinScreenState);
  } else {
    update.enter(States.Gameloop);
  }

  openCurtains(update);
}

function secondCurtainClose(update: Update) {
  closeCurtains(update, TransitionToMenu);
}

function transtionToMenu(update: Update) {
  update.exit(WinScreenState);
  update.signals.send(InitializationComplete);
}