import Component from "../Component";
import Signal from "../Signal";

export default class Timer implements Component {
  static readonly NAME:string = 'Timer';
  readonly name:string = Timer.NAME;

  /** A Timer component countds down `totalTime` milliseconds, and then despawns the entity 
   * it's attached to. If `completed` is provided, that signal will be sent at the end of 
   * the timer's life. Most commonly paired with a `Tween` component to animate sprite 
   * properties, or as a simple delay.
   */
  constructor(
    public totalTime: number, 
    public completed?: Signal
  ) {}

  currentTime:number = 0;
}
