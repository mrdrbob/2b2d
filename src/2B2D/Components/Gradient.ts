import Component from "../Component";
import Color from "../Math/Color";
import Vec2 from "../Math/Vec2";

export interface GradientComponent extends Component {
  name: 'Gradient',
  layer:string, 
  nw:Color, 
  ne:Color, 
  sw:Color, 
  se:Color, 
  size:Vec2
}

/** Generates a gradient. Colors are given for each corner. */
function Gradient(layer:string, nw:Color, ne:Color, sw:Color, se:Color, size:Vec2) : GradientComponent {
  return {
    name: 'Gradient',
    layer,
    nw, ne, 
    sw, se, 
    size
  };
}

export default Gradient;
