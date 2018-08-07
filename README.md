# Interact
A tool for programming by interaction instead by coding

Imagine if a drawing-program required you to type out operations as text, and then run them to see the result, rather than just "drawing" the picture directly (see [drw: a "useful tool"](https://programmingmadecomplicated.wordpress.com/2017/10/29/introducing-drw-a-useful-tool-to-solve-a-practical-problem/)). That is the backward way in which traditional computer programming works.

My idea is to create a tool where programming is not done by writing instructions for the actions to perform (aka coding), but by *performing* the actions as a user, and then replaying & editing them visually. Like [Drawing Dynamic Visualizations](http://worrydream.com/DrawingDynamicVisualizationsTalk/), but for programming instead of a drawing.

**Here's how it works:**

Program entities are displayed as objects in a UI, and are created, modified, composed, and executed via drag-and-drop (dnd) interactions. Drag multiple values onto a function, and the evaluated result pops out as another visual entity.

All actions taken by the user are remembered, with full undo/redo support. The user can select from previous actions (or perform new actions) and box them into a repayable function. The actions can be reviewed and modified, and concrete values replaced with expressions or placeholders (see "Create by abstracting" in [Learnable Programming](http://worrydream.com/LearnableProgramming/)). The new function can then be used immediately.

Functions keep track of their individual scopes and link to their parent's scopes, so nested functions can access entities in their parent (outer) contexts. Actions performed at the "top level" actually reside within a single top-level function with its own context.

Undoing, Redoing, and editing actions allows the user to explore freely: Evaluate things in place and inspect the result to see what they'll do; hard-coded a value by performing actions to generate it, and then replacing those actions with the generated value. Even the act of changing history an undoable action.

**Here are the mechanics that make it work:**

I'll add more to this later.
