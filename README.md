# Interact
A tool for programming through interaction instead of "code"

Imagine a "drawing" program where you "draw" by typing a series of commands, which you must submit all at once before you can see the resulting image (see [drw: a "useful tool"](https://programmingmadecomplicated.wordpress.com/2017/10/29/introducing-drw-a-useful-tool-to-solve-a-practical-problem/)). As backwards as that sounds, this is how traditional computer programming ("coding") works. This tool aims to fix that by allowing one to specify the actions of a program by *performing* them, rather than by typing textual commands. It's like "[Drawing Dynamic Visualizations](http://worrydream.com/DrawingDynamicVisualizationsTalk/)" for programming.

**Here's how it works:**

Program entities (numbers, text, lists, functions, etc.) are displayed on a "canvas", and are created & edited through "drag & drop" interactions. All actions taken are displayed list alongside the canvas, with each showing what was done and the entities ("targets") that were involved. Previous actions can be extracted into a "function", which then appears as a new entity on the canvas. Action "targets" can be replaced with placeholders, which then become "parameters" of the function. The function can then be run at any time by dragging other entities onto the function (which fill the placeholders), with the result (if there be any) appearing as a new entity on the canvas. For example, drag 1 and 2 onto "plus" to get 3. (See also "Create by abstracting" in [Learnable Programming](http://worrydream.com/LearnableProgramming/)).

Eventually, all the "operations" that make this tool work, will be available within the tool itself. This will allow the tool itself to be modified tool from within (and on the fly) to become whatever tool (or work in whatever way) is best for any scenario.

**Underlying Mechanics:**

(See also the [Grammar](https://github.com/d-cook/Interact/blob/master/Grammar.txt) of the description below)

Each "operation" (function) contains a list of actions to be performed each time the operation is invoked. Each "action" stored as a list of values, where each "value" may be a simple value (e.g. a number), a list of other "values", an object (collection of named "values"), a reference to an "operation" (function), a reference so some other action (in which case the "value" is whatever would result from that other action), or a reference to one of the parameters (arguments) of the operation. The first value in an action specifies the operation to be performed, and the rest are the parameters (arguments) of that operation. An operation is evaluated by creating a new "context" entity, stepping through the actions in order, and storing the result of each action in that "context".

All actions taken by the user are added to some "operation" (function) as they occur. The user can "step out" of the current "operation" to save everything they have done as reusable operation, or step back "into" an operation and undo/redo to edit the actions.

Everything lives within some "context", including all operations. The actions within an operation may refer to entities *outside* of that operation (by referring to the actions that generated them), because the operation contains a link to its outer context.
