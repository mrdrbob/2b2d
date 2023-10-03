import { Curtain } from "../Curtain/Plugin";
import Vec2 from "../Engine/Math/Vec2";
import Update from "../Engine/Update";

export function closeCurtains(update:Update) {
  const topCurtain = update.query([ Curtain.NAME, 'curtain:top' ])[0].components[0] as Curtain;
  topCurtain.continue(new Vec2(0, -150), 1000, Curtain.DespawnAfter);

  const middleCurtain = update.query([ Curtain.NAME, 'curtain:middle' ])[0].components[0] as Curtain;
  middleCurtain.continue(new Vec2(0, -300), 1000, Curtain.DespawnAfter);
}