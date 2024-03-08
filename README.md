# 2B2D

## What is 2B2D?

2B2D is a very simple 2D-only game engine heavily inspired by [Bevy](https://bevyengine.org/), written in Typescript, rendered in WebGPU, with no dependencies.

But really, it was my attempt to answer the question, "what does it take to make a very basic game engine from scratch." It's an academic exercise which is likely of little to no practical use.

## Example Game

This repo is both the game engine and an example game. V1 of the example game can be played on [Itch.io](https://mrdrbob.itch.io/2b2d-example-game) in modern browsers with WebGPU enabled.

![Screenshot of the 2B2D example game](docs/screen-shot.png?raw=true)

*Note*: This is V2 of the engine, which was a ground-up rewrite / refactor, but the playable game is roughly the same as the V1 demo above. I removed the menu music and the jiggle renderer in V2, but otherwise the game plays exactly the same.

## Who should use this?

Probably no one. You're welcome to toy with it, but you may run into bugs and performance issues. You may find some of the source code helpful to read, but keep in mind I barely understood what I was doing when I built this. Nothing here should be considered correct or best practice.

## Things it has:

* A rudimentary ECS system
* Layers (I considered Z-index sorting, but using explicit layers was just easier for now)
* Limited Aseprite support (via exported atlas JSON files)
* Basic LDTK support (currently only loads tilemaps with some caveats)
* Engine states (which determine which systems run)
* A *very* rudimentary AABB-based "physics" engine.

## Caveats and limitations

* Sprites are really basic. But now you can rotate them, so they've got that going for them, which is good.
* Currently, tilemaps require your tile source sprite to be a grid of square tiles with no spacing or padding between tiles. Annoying maybe, but makes rendering fast and easy.
* The ECS system relies heavily on caching the results of queries, so if you're frequently adding/remove components or entities, performance may degrade. Or it might not? I haven't benchmarked anything.
* Because of how tilemaps are drawn, you can't have maps bigger than 255 X 255 tiles. 65,025 tiles aught to be enough for anyone!  (If you need bigger, you could maybe stitch together several sub-tilemaps. Or use a proper engine.)
* The physics engine only has two body types: `StaticBody` which does not move, and `KenticBody` which does move but can't pass through any `StaticBody`. `KineticBody` entities, however, do not interact with each other and can pass through.
* Anchor points are always the center of the sprite. `(•_•) ( •_•)>⌐□-□ (⌐□_□)` Deal with it.

## How would I use this?

Clone this repo. Refer to the `Example` director for how to put something together, then create your own director, add your components, states, assets, etc. Update the `index.ts` to use your new game. Then:

`yarn dev`

The concepts are roughly:

* Components extend `Component` and contain data that could apply to entities.
* Entities are an identifier (number) and a collection of components that make up the data about the entity.
* States are a global resource that determine which systems run. You can have any number of states active at a given time. States have an "enter" schedule, "update" schedule, and "exit" schedule. The "enter" schedule runs systems for a single frame when the state is first started. "update" happens every frame until the state is over. "exit" runs for a single frame after the state has stopped. Hint: These are useful for spawning and despawning entities!
* Systems are functions that run every update during the state they're set to run in. Within the system you have access to queries, resources, states, signals, and commands.
* Queries get a list of entities and components that match a list of desired components. If your player character has a `Position`, `Velocity`, and `Player` component, you can query for those three items and get a list of all entities that have all three components currently registered to them (which would likely only be one entity, your player).
* Resources are basically global stores for values, data, etc. Assets for example are saved as a Resource.
* Commands give you a way to spawn/despawn entities outside of the normal frame loop, after all other systems have run. This way you can spawn or despawn something and not worry about systems that have yet to run being effected. (In a *good* ECS, you do this to allow multithreaded handling of systems, but this one is neither good nor does it support multithreading)
* Assets are files that are loaded at runtime. Out-of-the-box, the engine supports loading images, spite atlas JSON, arbitrary JSON, and audio. LDTK json assets can be turned into Tilemaps.
* Plugins are not exactly a first-class citizen, but you can bundle up registering your systems into separate methods and call those plugins (see: `GamePlugin.ts` or `InitPlugin.ts` for examples).
* A Renderer is a class that knows how to render something. The engine comes with three: one to render entities that have `Sprite`, `Position`, and `UseSpriteRenderer` components, another that renders entities that have both `Tilemap` and `Position` components, and a final one that renders items with `Gradient` and `Position` coordinates.
* Signals are basically events (but I called them signals to avoid constantly importing the DOM Event object by accident). You send a signal during a frame and it will be processed by handlers at the top of the next frame. Signal handlers are executed prior to other scheduled systems, though is possible to read events in a normal system to avoid this behavior if you really want.

Your best bet is to look through the files and folders in the `Example` directory for examples of usage. Everything in the `2B2D` folder is part of the core engine and should not contain any game-specific code.

## Anything notable?

* The tilemap renderer renders the entire tilemap in a single draw on a single quad. That's gotta' be fast, right?
* Sprites of the same texture on the same layer are batched. I assume that's a good performance thing.

## What things should I expect from the repo in the future?

* Abandonment when I get bored of this
* Post-processing?

## But... why?

All of my professional development work centers around the web. When you get right down to it, most of the programming I do is shuffling data from one place and format to another place and format. I still love it, but this was a nice diversion, challenging, and forced me to think differently as I faced problems that were quite different from my day-to-day.

Plus I was just curious about how graphics are actually drawn on a GPU. Now I have the foggiest idea.

## Acknowledgements

* Special thanks to [Nhawdge](https://github.com/Nhawdge) for coming up with the 2B2D name. Quote: "cause there are two b's in your first name. AND TWO DS IN YOUR LAST NAME. I'M GENIUS"
* Graphic assets used in the example game (`platform-bg-tiles.png`, `platform-characters.png`, and `platform-tiles.png`) are from the `Pixel Platformer` asset collection by [Kenny](https://www.kenney.nl/). License: [Creative Commons Zero, CC0](http://creativecommons.org/publicdomain/zero/1.0/).
