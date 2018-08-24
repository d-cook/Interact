# Interact
A tool for programming through interaction instead of "code"

Imagine a "drawing" program where you "draw" by typing a series of commands, which you must submit all at once before you can see the resulting image (see [drw: a "useful tool"](https://programmingmadecomplicated.wordpress.com/2017/10/29/introducing-drw-a-useful-tool-to-solve-a-practical-problem/)). As backwards as that sounds, this is how traditional computer programming ("coding") works. This tool aims to fix that by allowing one to specify the actions of a program by *performing* them, rather than by typing textual commands. It's like "[Drawing Dynamic Visualizations](http://worrydream.com/DrawingDynamicVisualizationsTalk/)" for programming.

**Here's how it works:**

Program entities (numbers, text, lists, functions, etc.) are displayed on a "canvas", and are created & edited through "drag & drop" interactions. All actions taken are displayed list alongside the canvas, with each showing what was done and the entities ("targets") that were involved. Previous actions can be extracted into a "function", which then appears as a new entity on the canvas. Action "targets" can be replaced with placeholders, which then become "parameters" of the function. The function can then be run at any time by dragging other entities onto the function (which fill the placeholders), with the result (if there be any) appearing as a new entity on the canvas. For example, drag 1 and 2 onto "plus" to get 3. (See also "Create by abstracting" in [Learnable Programming](http://worrydream.com/LearnableProgramming/)).

Eventually, all the "operations" that make this tool work, will be available within the tool itself. This will allow the tool itself to be modified tool from within (and on the fly) to become whatever tool (or work in whatever way) is best for any scenario.

See the [Grammar](https://github.com/d-cook/Interact/blob/master/Grammar.txt) for an explanation of the underlying mechanics.
