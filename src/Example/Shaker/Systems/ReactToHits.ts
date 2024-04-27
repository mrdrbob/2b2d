import Shaker from "../../../2B2D/Components/Shaker";
import Update from "../../../2B2D/Update";

export default function ReactToHits(update:Update) {
  const entity = update.ecs.single(Shaker);
  if (!entity)
    return;

  const [ shaker ] = entity.components;
  shaker.shake();
}