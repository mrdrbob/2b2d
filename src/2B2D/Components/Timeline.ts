import Update from "../Update";
import Component from "./Component";

export interface TimelineStep {
  time: number,
  action: (update: Update) => void
}

export default class Timeline implements Component {
  static readonly NAME: string = 'Timeline';
  readonly name: string = Timeline.NAME;

  /** Creates a series of events to fire in sequence. Each step 
   * executes at a given time (roughly). Steps are NOT relative, but 
   * must be ordered correctly. Will despawn itself at the end of the 
   * list.
   */
  constructor(
    public steps: TimelineStep[]
  ) { }

  time: number = 0;
  step: number = -1;
}