import Builder from "../../2B2D/Builder";
import Position from "../../2B2D/Components/Position";
import Sprite from "../../2B2D/Components/Sprite";
import UseSpriteRenderer from "../../2B2D/Components/UseSpriteRenderer";
import Signal from "../../2B2D/Signal";
import Update from "../../2B2D/Update";
import { CurtainsClosedSignal, closeCurtains, openCurtains } from "../Curtains/CurtainsPlugin";
import GameAssets from "../GameAssets";
import { InitializationComplete } from "../Init/InitPlugin";
import Layers from "../Layers";

const WaitForInputState = 'WaitForInputState';
const MainMenuTag = 'MainMenuTag';

const MainMenuSender = 'MainMenuSender';
export const ExitMenuSignal = 'ExitMenuSignal';

export default function MainMenuPlugin(builder: Builder) {
  builder.handle(InitializationComplete, spawnMenu);
  builder.handle(CurtainsClosedSignal, exitMenu);

  builder.update(WaitForInputState, waitForInput);
}

function spawnMenu(update: Update) {
  update.spawn([
    new Sprite(
      GameAssets.Menu.Texture.Handle,
      GameAssets.Menu.Atlas.Handle,
      Layers.BG
    ),
    Position.fromXY(0, 0),
    UseSpriteRenderer,
    MainMenuTag,
  ]);

  update.enter(WaitForInputState);
}

function waitForInput(update: Update) {
  const keys = update.keys();

  if (keys.keyJustReleased(' ')) {
    update.exit(WaitForInputState);
    closeCurtains(update, MainMenuSender);
  }
}

function exitMenu(update: Update, signals: Signal[]) {
  if (signals[0].sender !== MainMenuSender)
    return;

  // Despawn the main menu graphic
  const query = update.query([MainMenuTag]);
  for (const entity of query) {
    update.despawn(entity.entity);
  }

  // Leave the menu state and let the main game loop know it's time to start.
  update.exit(WaitForInputState);
  update.signals.send(ExitMenuSignal);
  openCurtains(update);
}
