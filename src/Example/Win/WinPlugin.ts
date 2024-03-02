import LdtkData from "../../2B2D/Assets/LdtkData";
import Builder from "../../2B2D/Builder";
import Position, { PositionComponent } from "../../2B2D/Components/Position";
import Sprite from "../../2B2D/Components/Sprite";
import Tag from "../../2B2D/Components/Tag";
import Timer from "../../2B2D/Components/Timer";
import UseSpriteRenderer from "../../2B2D/Components/UseSpriteRenderer";
import Update from "../../2B2D/Update";
import { CurtainsClosedSignal, closeCurtains, openCurtains } from "../Curtains/CurtainsPlugin";
import GameAssets from "../GameAssets";
import { GameStateResouce } from "../GameStateResource";
import Layers from "../Layers";
import PlayerTouchedFlag from "../Player/Signals/PlayerTouchedFlag";
import States from "../States";
import Camera from '../../2B2D/Components/Camera';
import Component from "../../2B2D/Component";
import Vec2 from "../../2B2D/Math/Vec2";
import { InitializationComplete } from "../Init/InitPlugin";

const WinPluginFirstClose = 'WinPluginFirstClose';
const TransitionToNextPhase = 'TransitionToNextPhase';
const WinPluginSecondClose = 'WinPluginSecondClose';
const TransitionToMenu = 'TransitionToMenu';

const WinPluginCleanupTag = 'WinPluginCleanupTag';
const WinScreenState = 'WinScreenState';

export default function WinPlugin(builder:Builder) {
  builder.handle(PlayerTouchedFlag, playerTouchedFlag);
  builder.handleFrom(CurtainsClosedSignal, WinPluginFirstClose, beginTransitionToNextStage);
  builder.handleFrom(TransitionToNextPhase, WinPlugin.name, transitionToNextPhase);

  builder.handleFrom(WinPluginSecondClose, WinPlugin.name, secondCurtainClose);
  builder.handleFrom(CurtainsClosedSignal, TransitionToMenu, transtionToMenu);

  builder.cleanup(WinScreenState, WinPluginCleanupTag);
}

function playerTouchedFlag(update:Update) {
  closeCurtains(update, WinPluginFirstClose);
}

function beginTransitionToNextStage(update:Update) {
  // Allow everything to despawn
  update.exit(States.Gameloop);

  // A small delay to allow the commands to execute and despawn to happen.
  update.spawn([
    Timer(100, { name: TransitionToNextPhase, sender: WinPlugin.name })
  ]);
}

function transitionToNextPhase(update:Update) {
  const gameState = update.resource<GameStateResouce>(GameStateResouce.name);
  gameState.level += 1;
  
  const assets = update.assets();
  const ldtk = assets.assume<LdtkData>(GameAssets.LevelData.LdtkData.Handle);

  if (gameState.level >= ldtk.levels.length) {
    // Reset the camera to 0, 0
    const camera = update.single([ Camera.name, Position.name ]);
    if (camera) {
      const [ _cam, position ] = camera.components as [ Component, PositionComponent ];
      position.pos = Vec2.ZERO;
    }

    // You win screen!
    update.spawn([
      Sprite(
        GameAssets.WinScreen.Texture.Handle,
        GameAssets.WinScreen.Atlas.Handle,
        Layers.BG
      ),
      Position.from_xy(0, 0),
      UseSpriteRenderer(),
      Tag(WinPluginCleanupTag)
    ]);

    update.spawn([
      Timer(2000, { name: WinPluginSecondClose, sender: WinPlugin.name })
    ]);

    update.enter(WinScreenState);
  } else {
    update.enter(States.Gameloop);
  }

  openCurtains(update);
}

function secondCurtainClose(update:Update) {
  closeCurtains(update, TransitionToMenu);
}

function transtionToMenu(update:Update) {
  update.exit(WinScreenState);
  update.signals.send(InitializationComplete);
}