# Interact
A tool for programming by interaction instead of "coding"

Imagine a "drawing" program where you "draw" by typing a series of commands, which you must submit all at once before you can see the resulting image (see [drw: a "useful tool"](https://programmingmadecomplicated.wordpress.com/2017/10/29/introducing-drw-a-useful-tool-to-solve-a-practical-problem/)). As backwards as that sounds, this is how traditional computer programming ("coding") works. This tool aims to fix that by allowing one to specify the actions of a program by *performing* them, rather than by typing textual commands. It's like "[Drawing Dynamic Visualizations](http://worrydream.com/DrawingDynamicVisualizationsTalk/)" for programming.

**Here's how it works:**

Program entities (numbers, text, lists, operations, etc.) are displayed as visual entities that can be created & modified interactively. Some operations (e.g. creating a new value, or inserting into a list) can be done by typing or drag-and-drop; and others by dragging values onto an "operation" entity, with the result of the operation (if there be any) appearing as a new entity.

All the user's actions are recorded with full undo/redo support. The user can extract steps from their past actions to create new "operation" entities. Parameters (arguments) can be added to that operation, and the steps can be edited to use those parameters. Thus, one is encouraged to experiment and explore manually, but can then "abstract" & generalize useful patterns into something repeatable (see "Create by abstracting" in [Learnable Programming](http://worrydream.com/LearnableProgramming/)).

Eventually, all the "operations" that make this tool work, will be available within the tool itself. This will allow the tool itself to be modified tool from within (and on the fly) to become whatever tool (or work in whatever way) is best for any scenario.

**Underlying Mechanics:**

(See also the [Grammar](https://github.com/d-cook/Interact/blob/master/Grammar.txt) of the description below)

Each "operation" (function) contains a list of actions to be performed each time the operation is invoked. Each "action" stored as a list of values, where each "value" may be a simple value (e.g. a number), a list of other "values", an object (collection of named "values"), a reference to an "operation" (function), a reference so some other action (in which case the "value" is whatever would result from that other action), or a reference to one of the parameters (arguments) of the operation. The first value in an action specifies the operation to be performed, and the rest are the parameters (arguments) of that operation. An operation is evaluated by creating a new "context" entity, stepping through the actions in order, and storing the result of each action in that "context".

All actions taken by the user are added to some "operation" (function) as they occur. The user can "step out" of the current "operation" to save everything they have done as reusable operation, or step back "into" an operation and undo/redo to edit the actions.

Everything lives within some "context", including all operations. The actions within an operation may refer to entities *outside* of that operation (by referring to the actions that generated them), because the operation contains a link to its outer context.
