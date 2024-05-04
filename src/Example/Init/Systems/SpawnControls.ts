import MappedInput from "../../../2B2D/Components/MappedInput";
import Update from "../../../2B2D/Update";
import PlayerActions from "../../PlayerActions";

// Spawning this as a global entity because there is only ever one player.
// If multiple concurrent players, spawn separate instances for each.
export default function SpawnControls(update: Update) {
  const input = MappedInput.build(0, b => {
    b.for(PlayerActions.jump, c => {
      c.keyboard(' ').keyboard('w').keyboard('W');
      c.button(0).button(1).button(2).button(3);
    });

    b.for(PlayerActions.left, c => {
      c.keyboard('ArrowLeft').keyboard('a').keyboard('A');
      c.negative(0, 0.25);
    });

    b.for(PlayerActions.right, c => {
      c.keyboard('ArrowRight').keyboard('d').keyboard('D');
      c.positive(0, 0.25);
    });
  });

  update.spawn(input);
}