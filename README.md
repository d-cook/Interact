# Interact
A tool for programming by interaction instead of "coding"

Imagine a "drawing" program where you "draw" by typing a series of commands, which you must submit all at once before you can see the resulting image (see [drw: a "useful tool"](https://programmingmadecomplicated.wordpress.com/2017/10/29/introducing-drw-a-useful-tool-to-solve-a-practical-problem/)). As backwards as that sounds, this is how traditional computer programming ("coding") works. This tool aims to fix that by allowing one to specify the actions of a program by *performing* them, rather than by typing textual commands. It's like "[Drawing Dynamic Visualizations](http://worrydream.com/DrawingDynamicVisualizationsTalk/)" for programming.

**Here's how it works:**

Program entities (numbers, text, lists, operations, etc.) are displayed as visual entities that can be created & modified interactively. Some operations (e.g. creating a new value, or inserting into a list) can be done by typing or drag-and-drop; and others by dragging values onto an "operation" entity, with the result of the operation (if there be any) appearing as a new entity.

All the user's actions are recorded with full undo/redo support. The user can extract steps from their past actions to create new "operation" entities. Parameters (arguments) can be added to that operation, and the steps can be edited to use those parameters. Thus, one is encouraged to experiment and explore manually, but can then "abstract" & generalize useful patterns into something repeatable (see "Create by abstracting" in [Learnable Programming](http://worrydream.com/LearnableProgramming/)).

Eventually, all the "operations" that make this tool work, will be available within the tool itself. This will allow the tool itself to be modified tool from within (and on the fly) to become whatever tool (or work in whatever way) is best for any scenario.

**Underlying Mechanics:**

(See also the [Grammar](https://github.com/d-cook/Interact/blob/master/Grammar.txt) of the description below)

A naive approach would be to keep a collection of the actual entities being manipulated, with a history of actions that references them directly. However, that would not work for a replayable (callable) functions, since the actual entities are different each time it is invoked. Thus, the tool keeps track of "placeholders" for entities that *might* exist at some point in time. Since all entities are created by some action, each action refers to its entities by referencing the actions from which those entities were created.

The resuling model is a list of "actions", with each action consisting of a list of "entries", and each entry being either an inline value (number, string, boolean, null), a object- or array-constructor (looks like an object or an array, except that each value in it is another "entry"), or the index of some other action from which to generate the entry (think of this as a "function call"). Every time the value of an action is computed, the resulting entity will be "cached", so that it does not have to be recomputed every time that that action is referenced by another action. (For now) this presents a pure-functional model.

Each "function" will contain a list of actions (as described), and when it is invoked (i.e. when another action refers to it, and that action is evaulated), a new set of entities will be created just for that invocation, each being the result of evaluating an action.

Each function will contain a reference to it's parent context, and thus be able to refer to entities in its parent scope. This is the same kind of "reference" that actions use to refer to entities. The function *itself* is an entity within some evaulation context.
