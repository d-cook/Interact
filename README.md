# Interact
A tool for programming by interaction instead of textual code

Imagine a "drawing" program where you "draw" my typing a series of commands, which you must submit all at once before you can see the resulting image (see [drw: a "useful tool"](https://programmingmadecomplicated.wordpress.com/2017/10/29/introducing-drw-a-useful-tool-to-solve-a-practical-problem/)). As backwards as that sounds, this is how traditional computer programming ("coding") works. This tool aims to fix that by allowing one to perform and replay actions *as actions*, rather than describing the actions of a program through text. It's like "[Drawing Dynamic Visualizations](http://worrydream.com/DrawingDynamicVisualizationsTalk/)" for programming.

**Here's how it works:**

Program entities are displayed as objects in a UI, and are created, modified, composed, and executed via drag-and-drop (dnd) interactions. Drag multiple values onto a function, and the evaluated result pops out as another visual entity.

All actions taken by the user are remembered, with full undo/redo support. The user can select from previous actions (or perform new actions) and box them into a repayable function. The actions can be reviewed and modified, and concrete values replaced with expressions or placeholders (see "Create by abstracting" in [Learnable Programming](http://worrydream.com/LearnableProgramming/)). The new function can then be used immediately.

Functions keep track of their individual scopes and link to their parent's scopes, so nested functions can access entities in their parent (outer) contexts. Actions performed at the "top level" actually reside within a single top-level function with its own context.

Undoing, Redoing, and editing actions allows the user to explore freely: Evaluate things in place and inspect the result to see what they'll do; hard-coded a value by performing actions to generate it, and then replacing those actions with the generated value. Even the act of changing history an undoable action.

**Here are the mechanics that make it work:**

(See also the [Grammar](https://github.com/d-cook/Interact/blob/master/Grammar.txt) of the description below)

A naive approach would be to keep a collection of the actual entities being manipulated, with a history of actions that references them directly. However, that would not work for a replayable (callable) functions, since the actual entities are different each time it is invoked. Thus, the tool keeps track of "placeholders" for entities that *might* exist at some point in time. Since all entities are created by some action, each action refers to its entities by referencing the actions from which those entities were created.

The resuling model is a list of "actions", with each action consisting of a list of "entries", and each entry being either an inline value (number, string, boolean, null), a object- or array-constructor (looks like an object or an array, except that each value in it is another "entry"), or the index of some other action from which to generate the entry (think of this as a "function call"). Every time the value of an action is computed, the resulting entity will be "cached", so that it does not have to be recomputed every time that that action is referenced by another action. (For now) this presents a pure-functional model.

Each "function" will contain a list of actions (as described), and when it is invoked (i.e. when another action refers to it, and that action is evaulated), a new set of entities will be created just for that invocation, each being the result of evaluating an action.

Each function will contain a reference to it's parent context, and thus be able to refer to entities in its parent scope. This is the same kind of "reference" that actions use to refer to entities. The function *itself* is an entity within some evaulation context.
