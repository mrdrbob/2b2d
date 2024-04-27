import Builder from "../../2B2D/Builder";
import CurtainMovementCompleteSignal from "../Curtains/Signals/CurtainMovementCompleteSignal";
import LogoCompleteSignal from "../Logo/Signals/LogoCompleteSignal";
import WinScreenExitSignal from "../Win/Signals/WinScreenExitSignal";
import MenuCleanup from "./Components/MenuCleanup";
import MainMenuState from "./States/MainMenuState";
import WaitForInputState from "./States/WaitForInputState";
import AwaitInput from "./Systems/AwaitInput";
import ExitMenuState from "./Systems/ExitMenuState";
import SpawnMenu from "./Systems/SpawnMenu";
import StartAwaitInput from "./Systems/StartAwaitInput";

export default function MainMenuPlugin(builder: Builder) {
  builder.signals.handle(LogoCompleteSignal, SpawnMenu);
  builder.signals.handle(WinScreenExitSignal, SpawnMenu);

  builder.signals.handle(CurtainMovementCompleteSignal, StartAwaitInput);
  builder.signals.handle(CurtainMovementCompleteSignal, ExitMenuState);

  builder.schedule.update(WaitForInputState, AwaitInput);

  builder.schedule.cleanup(MainMenuState, MenuCleanup);
}