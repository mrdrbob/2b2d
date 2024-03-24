import StateMachine from "../Components/StateMachine";
import Update from "../Update";


export default function UpdateStateMachines(update: Update) {
  const query = update.query([StateMachine.NAME]);
  for (const entity of query) {
    const [state] = entity.components as [StateMachine];

    state.update(update);
  }
}