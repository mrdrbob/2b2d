import Component from "../../../2B2D/Component";
import Vec2 from "../../../2B2D/Math/Vec2";

export interface BatComponent extends Component {
  name: 'Bat',
  transitions: Array<{ start: Vec2; end: Vec2; startTime: number; endTime: number; }>,
  time: number,
  totalTime: number
}

export default function Bat(bottom: Vec2, top: Vec2): BatComponent {
  return {
    name: 'Bat',
    transitions: [
      { start: bottom, end: bottom, startTime: 0, endTime: 1000 },
      { start: bottom, end: top, startTime: 1000, endTime: 2000 },
      { start: top, end: top, startTime: 2000, endTime: 3000 },
      { start: top, end: bottom, startTime: 3000, endTime: 4000 },
    ],
    time: 0,
    totalTime: 4000
  };
}