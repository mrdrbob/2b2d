import Shaker from "../../../2B2D/Components/Shaker";
import Update from "../../../2B2D/Update";

export default function ReactToHits(update:Update) {
  const entity = update.single([ Shaker.NAME ]);
  if (!entity)
    return;

  const [ shaker ] = entity.components as [ Shaker ];
  shaker.shake();
}