import Builder from "../../2B2D/Builder";
import Component from "../../2B2D/Component";
import Camera from "../../2B2D/Components/Camera";
import Gradient from "../../2B2D/Components/Gradient";
import Parent from "../../2B2D/Components/Parent";
import Position, { PositionComponent } from "../../2B2D/Components/Position";
import Tag from "../../2B2D/Components/Tag";
import Timer, { TimerComponent } from "../../2B2D/Components/Timer";
import Visible, { VisibleComponent } from "../../2B2D/Components/Visible";
import Color from "../../2B2D/Math/Color";
import Vec2 from "../../2B2D/Math/Vec2";
import Signal from "../../2B2D/Signal";
import Update from "../../2B2D/Update";
import { InitializationComplete, InitializationStarted } from "../Init/InitPlugin";
import Layers from "../Layers";
import States from "../States";

let SCREEN_SIZE = Vec2.ZERO;
const ParentTag = 'Curtains';
const CurtainOpenerTag = 'CurtainOpenerTag';
const CurtainCloserTag = 'CurtainCloserTag';

export const CurtainsClosedSignal = 'CurtainsClosed';
export const CurtainsOpenedSignal = 'CurtainsOpened';

export default function CurtainsPlugin(builder:Builder) {
  // builder.enter(States.Init, initializeCurtains);
  builder.handle(InitializationStarted, initializeCurtains);
  builder.handle(InitializationComplete, initializationComplete);

  builder.handle(CurtainsOpenedSignal, hideCurtains);

  builder.always(curtainsOpen);
  builder.always(curtainsClose);
}


// Spawn the curtains, made up of three gradients, all attached to a 
// parent object. Spawn the curtains such that the "black" part is fully
// covering the screen during the initial load.
function initializeCurtains(update: Update) {
  // Need to reach deep to get the screen size
  SCREEN_SIZE = new Vec2(update.data.rendering.width, update.data.rendering.height)
    .scalarMultiply(2 / update.data.rendering.zoom);

  const camera = update.single([ Camera.name ]);
  if (!camera) {
    console.warn('Could not spawn curtains without camera');
    return;
  }

  // First spawn a parent object that can be used for positioning and visibility
  const parent = update.spawn([
    Parent(camera.entity),
    Position.from_xy(0, 0),
    Tag(ParentTag),
    Visible(true)
  ]);

  // Top of the curtain
  update.spawn([
    Gradient(Layers.Curtains, Color.Black(1), Color.Black(1), Color.Black(0), Color.Black(0), SCREEN_SIZE),
    Position.from_xy(0, SCREEN_SIZE.y),
    Parent(parent)
  ]);

  // Middle of the curtain
  update.spawn([
    Gradient(Layers.Curtains, Color.Black(1), Color.Black(1), Color.Black(1), Color.Black(1), SCREEN_SIZE),
    Position.from_xy(0, 0),
    Parent(parent)
  ]);
  
  // Bottom of the curtain
  update.spawn([
    Gradient(Layers.Curtains, Color.Black(0), Color.Black(0), Color.Black(1), Color.Black(1), SCREEN_SIZE),
    Position.from_xy(0, -SCREEN_SIZE.y),
    Parent(parent)
  ]);
}

// Handles the initialization complete signal.
// Tweens the curtain to move down, out of site.
function initializationComplete(update:Update) {
  openCurtains(update);
}

// Tweens the curtains down, out of sight.
function curtainsOpen(update: Update) {
  const timerQuery = update.single([ CurtainOpenerTag, Timer.name ]);
  if (!timerQuery)
    return;

  const curtainQuery = update.single([ ParentTag, Position.name ]);
  if (!curtainQuery)
    return;

  const [ _timer, timer ] = timerQuery.components as [ Component, TimerComponent ];
  const progress = timer.currentTime / timer.totalTime;


  const [ _tag, position ] = curtainQuery.components as [ Component, PositionComponent ];
  const start = 0;
  const dest = -SCREEN_SIZE.y * 2;
  const len = dest - start;
  const pos = (len * progress) + start;

  position.pos = new Vec2(position.pos.x, pos);
}

// Tweens the curtains down, into sight.
function curtainsClose(update: Update) {
  const timerQuery = update.single([ CurtainCloserTag, Timer.name ]);
  if (!timerQuery)
    return;

  const curtainQuery = update.single([ ParentTag, Position.name ]);
  if (!curtainQuery)
    return;

  const [ _timer, timer ] = timerQuery.components as [ Component, TimerComponent ];
  const progress = timer.currentTime / timer.totalTime;

  const [ _tag, position ] = curtainQuery.components as [ Component, PositionComponent ];
  const start = SCREEN_SIZE.y * 2;
  const dest = 0;
  const len = dest - start;
  const pos = (len * progress) + start;

  position.pos = new Vec2(position.pos.x, pos);
}

// Once the curtains are out of site, then can be hidden so we're not
// rendering stuff off-screen.
function hideCurtains(update: Update) {
  const curtain = update.single([ ParentTag, Visible.name ]);
  if (!curtain)
    return;

  const [ _tag, visible ] = curtain.components as [ Component, VisibleComponent ];

  visible.visible = false;
}

export function openCurtains(update: Update, sender?:string) {
  // Tween curtains down, hiden them when no longer visible, send signal
  // if appropriate.
  update.spawn([
    Timer(1000, { name: CurtainsOpenedSignal, sender }),
    Tag(CurtainOpenerTag)
  ]);
}

export function closeCurtains(update:Update, sender?:string) {
   // Make sure curtains are visible and appropriately placed.
  const curtain = update.single([ ParentTag, Visible.name, Position.name ]);
  if (!curtain)
    return;

  const [ _tag, visible, position ] = curtain.components as [ Component, VisibleComponent, PositionComponent ];
  position.pos = new Vec2(position.pos.x, SCREEN_SIZE.y * 2);
  visible.visible = true;

  // Now tween down into view
  update.spawn([
    Timer(1000, { name: CurtainsClosedSignal, sender }),
    Tag(CurtainCloserTag)
  ]);
}