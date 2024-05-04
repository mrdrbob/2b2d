import Timeline from "../Components/Timeline";
import Update from "../Update";

export default function UpdateTimelines(update: Update) {
  const query = update.ecs.query(Timeline);
  for (const entity of query) {
    const [timeline] = entity.components;

    timeline.time += update.delta;
    const lastExpectedStep = timeline.steps.findLastIndex(x => x.time < timeline.time);

    for (let x = timeline.step + 1; x <= lastExpectedStep; x++) {
      timeline.steps[x].action(update);
      timeline.step = x;
    }

    if (timeline.step == timeline.steps.length - 1) {
      update.despawn(entity.entity);
    }
  }
}