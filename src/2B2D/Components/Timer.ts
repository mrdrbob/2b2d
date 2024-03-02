import Component from "../Component";
import Signal from "../Signal";

export interface TimerComponent extends Component {
  name: 'Timer',
  totalTime: number,
  currentTime: number,
  completed: Signal | undefined
}

/** A Timer component countds down `totalTime` milliseconds, and then despawns the entity 
 * it's attached to. If `completed` is provided, that signal will be sent at the end of 
 * the timer's life. Most commonly paired with a `Tween` component to animate sprite 
 * properties, or as a simple delay.
 */
export default function Timer(totalTime: number, completed?: Signal): TimerComponent {
  return {
    name: 'Timer',
    totalTime,
    currentTime: 0,
    completed
  };
}
