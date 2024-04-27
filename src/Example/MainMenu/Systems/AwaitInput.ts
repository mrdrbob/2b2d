import MappedInput from "../../../2B2D/Components/MappedInput";
import Update from "../../../2B2D/Update";
import Curtains from "../../Curtains/Curtains";
import PlayerActions from "../../PlayerActions";
import WaitForInputState from "../States/WaitForInputState";

export default function AwaitInput(update: Update) {
  const query = update.ecs.single(MappedInput);
  if (!query)
    return;

  const [input] = query.components;
  const isPressed = input.isPressed(update, PlayerActions.jump);
  if (!isPressed)
    return;

  update.schedule.exit(WaitForInputState);
  Curtains.Close(update, 'MainMenu');
}