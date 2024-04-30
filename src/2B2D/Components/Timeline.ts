import Update from "../Update";
import Component from "./Component";

export interface TimelineStep {
  time: number,
  action: (update: Update) => void
}

export default class Timeline implements Component {
  static readonly NAME: string = 'Timeline';
  readonly name: string = Timeline.NAME;

  constructor(
    public steps: TimelineStep[]
  ) { }

  time: number = 0;
  step: number = -1;
}