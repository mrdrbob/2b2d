import Builder from "../2B2D/Builder";

const Layers = {
  BG: 'BG',
  Tiles: 'Tiles',
  Entities: 'Entities',
  FG: 'FG',
  Hud: 'Hud',
  Curtains: 'Curtains',

  add: function (builder:Builder) {
    builder.layer(Layers.BG);
    builder.layer(Layers.Tiles);
    builder.layer(Layers.Entities);
    builder.layer(Layers.FG);
    builder.layer(Layers.Hud);
    builder.layer(Layers.Curtains);
  }
};

export default Layers;
