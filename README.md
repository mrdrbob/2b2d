# ![2B2D](docs/2b2d.gif?raw=true)

## What is 2B2D?

2B2D is a simple, 2D-only game engine heavily inspired by [Bevy](https://bevyengine.org/), written in Typescript, rendered in WebGPU, with no dependencies. It's meant for small, simple games.

Some features of the engine:

* Purely ECS-driven.
* Works (somewhat) well with LDtk and Aseprite
* Supports TypeScript and browsers with WebGPU support.
* Has a limited, rudimentary AABB-based physics system—just about enough to support a Mario-style platformer game.
* MIT Licensed.

## Example Game

Included in this repo is an example game (in the `Example` folder).

![Screenshot of the 2B2D example game](docs/screen-shot.png?raw=true)

You can also play on [Itch.io](https://mrdrbob.itch.io/2b2d-example-game).

## Developing a Game

If you'd like to develop your own game in 2B2D:

1. Fork this repository.
2. Delete the `src/Example` folder.
3. Create your new game in whatever folder you like and update `src/index.ts` to point to it.
4. Install dependencies: `yarn install`
5. Develop: `yarn dev`
6. When you're ready to publish, `yarn build` and deploy the `dist` folder to your host.

P.S. If you're forking this repo to make your own game, consider replacing the README to talk about your game instead of 2B2D, just for clarity's sake.

## Concepts

**Plugins** - Games are generally organized into plugins. Plugins are really just functions that schedule systems, handle signals, and often include other plugins. For example:

```
// An initialization plugin
export default function InitPlugin(builder: Builder) {
  builder.schedule.enter(InitState, LoadAssets);
  builder.schedule.update(InitState, AwaitLoaded);
}
```

This plugin tells the engine to execute the `LoadAssets` system when the `InitState` state is entered. Then, the engine will execute the `AwaitLoaded` system every frame until the `InitState` state exits.

**Systems** - Systems are just functions that can be scheduled. Some systems run every frame of a state, some only run one frame (when the state enters or exits), and some respond to signals. For example:

```
const logo = 'logo' as Handle;

export default function LoadAssets(update: Update) {
  const assets = update.assets();

  assets.add(TextureAsset.loadSingleSprite(logo, 'assets/logo.png'));
}

export default function AwaitLoaded(update: Update) {
  const assets = update.assets();
  const isLoaded = assets.loaded([logo]);
  if (isLoaded) {
    update.schedule.exit(InitState);
    update.signals.send(new LoadedSignal('InitPlugin'));
  }
}
```

The `LoadAssets` system begins to load the logo texture. It executes one frame when the `InitState` enters.

The `AwaitLoaded` system checks to see if the logo is loaded every frame during the `InitState` state (except the enter and exit frames). Once the texture is loaded, it exits the `InitState` and sends a `LoadedSignal` signal.

**Signals** - Signals are events. They can either be a class that implements the `Signal` interface, or just a string if there is no data to convey. For example:

```
export default class LoadedSignal implements Signal {
  static readonly NAME:string = 'LoadedSignal';
  readonly name:string = LoadedSignal.NAME;

  constructor(public sender:string) { }
}
```

If `sender` wasn't necessary, one could also just use a string as a signal:

```
export default 'LoadedSignal';
```

The signal can be handled in a plugin. For example:

```
export default function GamePlugin(builder: Builder) {
  builder.startState(InitState);

  builder.signals.handle(LoadedSignal, (update: Update, signals: LoadedSignal[]) => {
    update.schedule.enter(MenuState);
  });
  builder.schedule.enter(MenuState, SpawnLogo);
  builder.schedule.exit(MenuState, DespawnLogo);
}
```

This handler receives the `LoadedSignal` and enters the `MenuState` state. Note: the system doesn't use the signal data for anything; the `signals` argument could have been omitted. Also I generally keep systems in separate files, but they can be inlined as in above.

**States** - States determine scheduling of systems. Every state goes through three phases:

1. One frame of `enter` state.
2. Frames of `update` state until the state is exited.
2. One frame of `exit` state.

Enter states are often used to spawn entities. Exit states are often used to despawn entities.

**Entities and Components** - An entity is a collection of Components. Components are facts about a given entity. An entity can be made up of any number of different components and behavior is often driven by what components an entity has. Components implement the `Component` interface. 2B2D comes with a number of components by default, but you will define custom components as well. For example:

```
export default class Logo implements Component {
  static readonly NAME:string = 'Logo';
  readonly name:string = Logo.NAME;

  constructor(
    public timeRemaining: number
  ) { }
}

export function SpawnLogo(update: Update) {
  update.spawn(
    new Sprite(logo),
    new Position(Vec2.ZERO),
    new Logo(1000)
  );
}

export function WaitForLogo(update: Update) {
  const query = update.ecs.single(Logo);
  if (!query)
    return;

  const [ logo ] = query.components;
  logo.timeRemaining -= update.delta;
  if (logo.timeRemaining < 0) {
    update.schedule.exit(MenuState);
  }
}

export function DespawnLogo(update: Update) {
  const query = update.ecs.single(Logo);
  if (!query)
    return;
  update.despawn(query.entity);
}
```

You can query for entities by querying for any entity that matches a list of components. In the above example, we're only matching one component (`Logo`), but you can query for multiple, `update.ecs.single(Sprite, Position, Logo)`, and only entities with all the components will be returned.

The above examples are querying for a single component (`update.ecs.single`), but you can query for all matching entities `update.ecs.query`.

You then destrucutre the `.components` of each result to get the component values. For a contrived example:

```
const query = update.ecs.query(Sprite, Position, Logo);
for (const item of query) {
  const [ sprite, position, logo ] = item.components;
  sprite.tag = 'Idle';
  position.position = position.position.add(new Vec2(0, 1));
  logo.timeRemaining = logo.timeRemaining - update.delta;
}
```

**Resources** - Resources are global object that only ever have one instance, effectively a singleton. Assets are stored in the `AssetsResource`. Input is handled through the `KeysResource`. Sound is managed through the `AudioResource`. You can also create and register custom resources:

```
export default class GameStateResource implements Resource {
  static readonly NAME:string = 'GameStateResource';
  readonly name:string = GameStateResource.NAME;
 
  public level: number = Config.StartLevelId;
  public health: number = Config.MaxHealth;
}

export function GamePlugin(builder: Builder) {
  builder.resource(new GameStateResource());

  builder.handle(PlayerHurtSignal, HandlePlayerHurt);
}

export function HandlePlayerHurt(update: Update) {
  const gameState = update.resource(GameStateResource);
  gameState.health -= 1;
  // TODO: Death logic
}
```

This documentation is far from complete. Your best bet is to read through the `Example` folder and see how things are done. You can comment out each plugin in the `GamePlugin` plugin (except `InitPlugin`) to see how it effects the game.

## Important Caveats

* The source textures for tilemaps do not currently support padding or spacing between tiles.
* Levels in LDtk should be aligned to the grid. Sometimes the levels get off the grid spacing a bit, and it can confuse the position of colliders and entities.
* The physics engine only has two body types: `StaticBody` which does not move, and `KenticBody` which does move but can't pass through any `StaticBody`. `KineticBody` entities, however, do not interact with each other and can pass through.
* Anchor points are always the center of the objects.
* Spawns, Despawns, and Signal emissions are handled after all the normal systems have executed, meaning that these effectively take effect the frame after they are called.
* 2B2D was developed and is maintained by one guy with no formal background in game development, as a hobby project. Basically I got curious about how GPUs worked and ended up writing a game engine. Use at your own risk.

## Performance Considerations

This engine has not been heavily performance tested, though there was an attempt to be a reasonable balance between performance and ergonomics. Some things to keep in mind:

* Items in the same render order with the same texture can usually be rendered in the same draw call. It's probably better to have a sprite sheet with lots of sprites in a single texture than a bunch of individual files.
* ECS queries are cached. Spawning, despawning, or adding/removing components will clear the cache, so it's best to avoid doing those operations frequently. Maybe keep a pool of entities with `Visible` components to hide/show as necessary if you've got a large swarm of frequently appearing/disappearing objects.
* Tilemaps can be drawn in a single call and are generally more performant than spawning individual sprites for each tile.

## Depth and RenderOrder

By default, all sprites are drawn at a depth of `0.5`. You can control this by adding a `Depth` component to your sprite entity. Valid depth values must be below one and greater than zero (anything outside this range will not appear). Higher numbers are "further back", smaller numbers are closer to the camera ("on top").

Depth is handled by a depth stencil on the GPU. For fully opaque/transparent objects, this just works. For semi-opaque objects, you will want to use a `RenderOrder` component to force the object on top (nearer the camera) to render after any objects it renders on top of. (If a semi-transparent object renders first, you'll see the background through it because of how the depth stencil works). Entities with no `RenderOrder` component are rendered first, then entities are rendered in the order set by the `engine.rendering.renderOrder` array.

## Acknowledgements

* Special thanks to [Nhawdge](https://github.com/Nhawdge) for coming up with the 2B2D name. Quote: "cause there are two b's in your first name. AND TWO DS IN YOUR LAST NAME. I'M GENIUS"
* Graphic assets used in the example game (`platform-bg-tiles.png`, `platform-characters.png`, and `platform-tiles.png`) are from the `Pixel Platformer` asset collection by [Kenny](https://www.kenney.nl/). License: [Creative Commons Zero, CC0](http://creativecommons.org/publicdomain/zero/1.0/).
