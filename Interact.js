// Paste "Renderer 1.1.0" code HERE ( https://github.com/d-cook/Render/releases/tag/1.1.0 )

// ------------------------
// ---- BASE FUNCTIONS ----
// ------------------------

function has (o, p   ) { try { return Object.prototype.hasOwnProperty.call(o, p); } catch(e) { return false; } }
function get (o, p   ) { return has(o, p) ? o[p] : null; }
function set (o, p, v) { var t = type(o); if (t === 'object' || t === 'array') { o[p] = v; } return v; }
function del (o, p   ) { var v = (has(o, p) ? o[p] : null); delete o[p]; return v; }

function type(o) {
    return (o === null || typeof o === 'undefined') ? 'null' :
           (Array.isArray(o)                      ) ? 'array'
                                                    : typeof o;
}

function _if (cond, T, F) {
    return apply(truthy(cond) ? T : F, [cond]);
}

function and (L, R) {
    if (arguments.length < 2 || not(L)) { return L; }
    var args = [apply(R, [])];
    args.push.apply(args, slice(arguments, 2));
    return and.apply(null, args);
}

function or (L, R) {
    if (arguments.length < 2 || truthy(L)) { return L; }
    var args = [apply(R, [])];
    args.push.apply(args, slice(arguments, 2));
    return or.apply(null, args);
}

function keys   (o) { return (type(o) === 'array') ? o.map((v, i) => i) : Object.keys(o||{}) || []; }
function values (o) { return keys(o).map((k, v) => o[k]); }
function length (o) { return(Object.keys(o||{}) || []).length; }
function truthy (v) { return v || v === 0 || v === ''; }
function not    (v) { return !truthy(v); }

function plus () { var r = arguments[0]; for(var i=1; i<arguments.length; i++) {       r +=      arguments[i];                 } return r;    }
function minus() { var r = arguments[0]; for(var i=1; i<arguments.length; i++) {       r -=      arguments[i];                 } return r;    }
function mult () { var r = arguments[0]; for(var i=1; i<arguments.length; i++) {       r *=      arguments[i];                 } return r;    }
function div  () { var r = arguments[0]; for(var i=1; i<arguments.length; i++) {       r /=      arguments[i];                 } return r;    }
function mod  () { var r = arguments[0]; for(var i=1; i<arguments.length; i++) {       r %=      arguments[i];                 } return r;    }
function EQ   () { var r = arguments[0]; for(var i=1; i<arguments.length; i++) { if (!(r ===(    arguments[i]))) return false; } return true; }
function NE   () { var r = arguments[0]; for(var i=1; i<arguments.length; i++) { if (!(r !==(    arguments[i]))) return false; } return true; }
function LT   () { var r = arguments[0]; for(var i=1; i<arguments.length; i++) { if (!(r <  (r = arguments[i]))) return false; } return true; }
function GT   () { var r = arguments[0]; for(var i=1; i<arguments.length; i++) { if (!(r >  (r = arguments[i]))) return false; } return true; }
function LTE  () { var r = arguments[0]; for(var i=1; i<arguments.length; i++) { if (!(r <= (r = arguments[i]))) return false; } return true; }
function GTE  () { var r = arguments[0]; for(var i=1; i<arguments.length; i++) { if (!(r >= (r = arguments[i]))) return false; } return true; }

function array () { return [].slice.apply(arguments); }
function object(keys, values) {
    var obj = Object.create(null);
    if (type(keys) === 'array' && type(values) === 'array') {
        keys.map((k, i) => obj[''+k] = values[i]);
    }
    return obj;
}

function slice  (a,b,e) { return (type(a) !== 'array') ? null : [].slice  .apply(a, [].slice.call(arguments, 1)); }
function push   (a    ) { return (type(a) !== 'array') ? null : [].push   .apply(a, [].slice.call(arguments, 1)); }
function unshift(a    ) { return (type(a) !== 'array') ? null : [].unshift.apply(a, [].slice.call(arguments, 1)); }
function pop    (a    ) { return (type(a) !== 'array') ? null : [].pop    .apply(a); }
function shift  (a    ) { return (type(a) !== 'array') ? null : [].shift  .apply(a); }

function charAt    (s,i  ) { return (type(s) !== 'string') ? null : s.charAt   (i   ); }
function substring (s,b,e) { return (type(s) !== 'string') ? null : s.substring(b, e); }

function _id(x) { return x; }

// -----------------------------
// ---- EVAL IMPLEMENTATION ----
// -----------------------------

function lookupContext(context, dist) {
    return (dist < 0) ? get(get(context, 'values'), 0) || [] :
           (dist > 0) ? lookupContext(get(context, 'parent'), dist-1)
                      : context;
}

function lookupValue(context, path) {
    return (path.length > 0) ? lookupValue(get(context, path[0]), path.slice(1))
                             : context;
}

function lookup(context, path) {
    if (type(path) !== 'array') { return path; }
    var ctx = lookupContext(context, path[0]);
    var values = (type(path[1]) === 'string') ? ctx
                                              : get(ctx, 'values') || ctx;
    return lookupValue(values, path.slice(1));
}

function evalCall(context, entries) {
    var lookups = entries.map(e => lookup(context, e));
    return (lookups.length > 1) ? apply(lookups[0], lookups.slice(1)) :
           (lookups.length > 0) ? lookups[0]
                                : null;
}

function evalAction(context, action) {
    return (type(action) === 'array') ? evalCall(context, action)
                                      : action;
}

function apply(func, args) {
    var vals = applyContext(func, args).values;
    return (vals.length > 1) ? vals[vals.length - 1] : null;
}

function applyContext(func, args) {
    var context = { values:[args], parent:func.parent };
    var vals = context.values;
    var tf = type(func);
    if (tf === 'function') { vals.push(func.apply(null, args)); }
    else if (tf !== 'object') { vals.push(null); }
    else { func.actions.map(a => vals.push(evalAction(context, a))); }
    return context;
}

// -----------------------------
// ---- TOOL IMPLEMENTATION ----
// -----------------------------

// TODO: Assign mouse/keyboard actions:
//   [Click]      Expand/Collapse nested items
//   [Dbl-Click]  Copy inner item out of container
//   [DELETE]     Delete selected item (and associated action)
//   [DRAG]       Drag container
//   [DragHandle] Resize selected container (handles appear on selected)
//                Scroll container view
//                Auto-size container (to fit contents)
//                Auto-layout container contents (with recursive auto-size?)
//   [Just type]  Edit values (a caret appears?) (as an action!)
//   [Just type]  Create new values at point of last click in selected item
//                Add arguments to a function (currying?) / create call-template from function

// Settings
var textSize = 14; // text height
var spacing = 12;  // spacing between components
var rowSize = textSize + spacing;

// Path to hovered/selected items
var hoveredItem = [];
var selectedItem = [];

// UI Renderer
var ui = Renderer('top left', { size: textSize, baseline: 'top' });

// Root view
var root = createView({
        parent : null,
        args   : [],
        actions: [
            null, // Reassigned to the root context below
            lookupValue, lookupContext, lookup, evalCall, evalAction, apply,
            has, get, set, del, type, _if, and, or, array, object, keys, length, truthy, not,
            plus, minus, mult, div, mod, EQ, NE, LT, GT, LTE, GTE,
            slice, push, unshift, pop, shift, charAt, substring, _id
        ]
    }, [], null);
    root.context.values[1] = root.context; // Because it was undefined the first time

// Active view
var view = createView({
        parent : root.context,
        args   : ['param1', 'param2'],
        actions: [
            123,
            "ab\tc\td\nefg\nhij\rklm\r\nnop",
            true,
            null,
            [[1, 16], "x", "y", "z"],
            [[1, 16], "(1,\n2,\n3)", [0], 2234],
            [[1, 16], 3, 4],
            [[1, 16], 1, 2, [0,6], {}, 'A', 'B', function foo(x,y){return x+y/10;}],
            [[1, 17], [0,5], [0,6]],
            "foo",
            function(){}
        ]
    }, ['arg1', 'arg2'], root);

function createView(func, args, parent) {
    var context = applyContext(func, args);
    if (!func.meta) { func.meta = createMeta(context.values, 1); }
    return {
        func   : func,
        context: context,
        parent : parent,
        args   : args
    };
}

function createMeta(value, levels, x, y, z) {
    var t = type(value);
    var meta = { x:(x||0), y:(y||0), z:(z||0) };
    if (t !== 'object' && t !== 'array') {
        var str = stringOf(value);
        meta.w = (t === 'string')
           ? str.split('\n').reduce((m, s) => Math.max(m, ui.textWidth(s)), 0)
           : ui.textWidth(str);
        meta.h = (t === 'string')
           ? textSize * str.split('\n').length
           : textSize;
        return meta;
    } else if (levels < 0) {
        meta.w = 16;
        meta.h = textSize;
        meta.state = 'collapsed';
    } else {
        var h = spacing;
        var w = spacing;
        var ks = keys(value);
        var vals = ks.map((k, i) => {
            var x = spacing + (t !== 'object' ? 0 : ui.textWidth(k+' : '));
            var m = createMeta(value[k], (levels || 0) - 1, x, h, i);
            w = Math.max(w, m.x + m.w + spacing);
            h += m.h + spacing;
            return m;
        });
        meta.children = (t === 'array') ? vals : object(ks, vals);
        meta.w = w;
        meta.h = h;
        meta.state = 'expanded';
    }
    return meta;
}

function subMeta(meta, key) {
    var m = (meta.children && meta.children[key]);
    m = (m) ? Object.assign({}, m) : createMeta(null);
    m.x += meta.x;
    m.y += meta.y;
    return m;
}

function metasByZ(metas) {
    return keys(metas).map(k => ({ k:k, m:metas[k]}))
                      .sort((a, b) => a.m.z - b.m.z);
}

function stringOf(value) {
    var t = type(value);
    return (t === 'string'  ) ? '"' + value.replace(/\t/g, '    ').replace(/\r?\n/g, '\n ') + '"' :
           (t !== 'function') ? String(value)
                              : String(value).replace(/^(function\s*(\w+)?\s*)?\(?([^\)]*)\)?\s*(\=\>|\{)(.|\s)*$/, "$2($3)")
                                             .replace(/\s/g, '')
                                             .replace(/^\(/, '[func](');
}

function getContent(value, meta, hoverPath, selectPath) {
    var t = type(value);
    var a = (t === 'array');
    var o = (t === 'object');
    var s = (t === 'string');
    var c = (meta.state === 'collapsed');
    var hovered = (hoverPath && hoverPath.length === 0);
    var selected = (selectPath && selectPath.length === 0);
    return (
        (hovered || selected)
            ? [[(selected ? 'cyan' : '#FFEE44')+' filled rect', meta.x - 2, meta.y - 2, meta.w + 4, meta.h + 4]]
            : []
    )
    .concat([['white filled rect', meta.x, meta.y, meta.w, meta.h]])
    .concat(
     (c&&a) ? [['filled #EEEEEE rect', meta.x, meta.y, 16, textSize],
               ['black rect',          meta.x, meta.y, 16, textSize],
               ['filled #666666 rect', meta.x + 3, meta.y + meta.h - 6, 2, 2],
               ['filled #666666 rect', meta.x + 7, meta.y + meta.h - 6, 2, 2],
               ['filled #666666 rect', meta.x +11, meta.y + meta.h - 6, 2, 2]
              ] :
     (c&&o) ? [['filled #EEEEEE rect', meta.x, meta.y, 16, textSize],
               ['black rect',          meta.x, meta.y, 16, textSize],
               ['filled #666666 rect', meta.x + 4, meta.y + meta.h - 6, 2, 2],
               ['filled #666666 rect', meta.x + 4, meta.y + meta.h -10, 2, 2]
              ] :
     (a||o) ? [['rect', meta.x, meta.y, meta.w, meta.h]]
                .concat([].concat.apply([], metasByZ(meta.children).reverse().map(km => {
                    var k = km.k, m = subMeta(meta, k);
                    return getContent(value[k], m,
                            (hoverPath && hoverPath[0] === k) ? hoverPath.slice(1) : false,
                            (selectPath && selectPath[0] === k) ? selectPath.slice(1) : false
                        ).concat(a ? [] : [['#AA8844 text', k+' : ', meta.x + spacing + 0, m.y]])
                }))) :
        (s) ? stringOf(value).split('\n').map((s, i) => ['text', s, meta.x, meta.y + (textSize * i)])
            : [['text', stringOf(value), meta.x, meta.y]]
    );
}

function refreshView() {
    view = createView(view.func, view.args, view.parent);
}

function renderContent() {
    ui.render(getContent(view.context.values, view.func.meta, hoveredItem, selectedItem));
}

function bringToFront(metas, path) {
    if (metas && metas.length > 0 && path.length > 0) {
        metas[path[0]].z = -1;
        metasByZ(metas).map((km, i) => km.m.z = i);
        bringToFront(metas.children, path.slice(1));
    }
}

function arrayMatch(a1, a2) {
    var t1 = type(a1);
    var t2 = type(a2);
    return (t1 !== 'array' || t2 !== 'array')
        ? (a1 === a2)
        : (a1.length === a2.length) && a1.reduce(
            (m, v, i) => m && arrayMatch(v, a2[i]),
            true
        );
}

function getActionIndex(action) {
    return view.func.actions.reduce((idx, a, i) => (idx < 1 && arrayMatch(a, action)) ? i : idx, -1);
}

function addAction(action, meta) {
    view.func.actions.push(action);
    view.func.meta.children.push(meta || null);
}

function isOver(meta, x, y) {
    return (x >= meta.x && x <= meta.x + meta.w && y >= meta.y && y <= meta.y + meta.h);
}

function getKeyAt(metas, x, y) {
    return metasByZ(metas).reduce((i, km) => (i === null && isOver(km.m, x, y)) ? km.k : i, null);
}

function getItemAt(metas, x, y) {
    var k = getKeyAt(metas, x, y);
    var m = metas[k];
    return (k === null) ? [] :
           (m.children) ? [k].concat(getItemAt(m.children, x - m.x, y - m.y))
                        : [k];
}

// -- UI interactions --

function selectHoveredItem() {
    selectedItem = hoveredItem;
    bringToFront(view.func.meta.children, selectedItem);
}

function extractSelectedItem() {
    if (selectedItem.length > 1) {
        var last = selectedItem.length - 1;
        var action = [[1, 9], [0].concat(selectedItem.slice(0, last)), selectedItem[last]];
        var idx = getActionIndex(action) + 1;
        if (idx < 1) {
            idx = view.func.actions.length + 1;
            var item = selectedItem.reduce((v, h) => v[h], view.context.values);
            var outerMeta = view.func.meta.children[selectedItem[0]];
            var innerMeta = selectedItem.reduce((m, h) => subMeta(m, h), view.func.meta);
            addAction(action, createMeta(item, 0, outerMeta.x + outerMeta.w + spacing, innerMeta.y));
            refreshView();
        }
        selectedItem = [idx];
        bringToFront(view.func.meta.children, selectedItem);
    }
}

function moveSelectedItem(dx, dy) {
    if (selectedItem.length > 0) {
        var m = selectedItem.reduce((m, s) => m.children[s], view.func.meta);
        m.x += dx;
        m.y += dy;
    }
}

function setHoveredItems(x, y) {
    hoveredItem = getItemAt(view.func.meta.children, x, y);
}

// -- Initialize UI --

ui.onMouseUp(function onMouseUp(x, y) {
    renderContent();
});

ui.onMouseDown(function onMouseDown(x, y) {
    selectHoveredItem();
    renderContent();
});

ui.onMouseMove(function onMouseMove(x, y, prevX, prevY) {
    setHoveredItems(x, y);
    renderContent();
});

ui.onMouseDrag(function onMouseDrag(x, y, prevX, prevY) {
    moveSelectedItem(x - prevX, y - prevY);
    renderContent();
});

ui.onMouseClick(function onMouseClick(x, y, clicks) {
    if (clicks > 1) {
        // Double-Click
        extractSelectedItem();
    } else {
        // Single-Click
    }
    renderContent();
}, 350);

ui.fitToWindow(function onResize(w, h) {
    view.func.meta.w = w;
    view.func.meta.h = h;
    renderContent();
});

// ---------------
// ---- TESTS ----
// ---------------

function test(context, args) { console.log(apply(context, args)); }

test({parent:root.context, actions:[]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:[5]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:["test"]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:[0,1,2,3]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:[[[1,16],1,2,3]]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:[[[1,0]]]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:[[[1,22]]]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:[[[1,22],[-1,0],[-1,1]]]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:[[[1,22],[0,0,0],[-1,1]]]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:[[[1,22],[-1,1],[-1,2]]]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:[[[1,9]]]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:[[[1,9],[-1,3],[-1,2]]]}, [1,2,"foo",{foo:5}]);
test({parent:root.context, actions:[[[1,9],[-1,3],[-1,2]]]}, [1,2,"foo",{foo:5,x:7}]);
test({parent:root.context, actions:[[[1,9],[-1,3],[-1,2]]]}, [1,2,"x",{foo:5,x:7}]);
test({parent:root.context, actions:[[[1,9],[-1,3],[-1,2]]]}, [1,2,"xx",{foo:5,x:7}]);
test({parent:root.context, actions:[[5],[x=>x, [0]]]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:[[5],[x=>x, [0,1]]]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:[[5],[x=>x, [0,"values"]]]}, [1,2,"foo",{x:5}]);
test({parent:root.context, actions:[[5],[x=>x, [0,"parent"]]]}, [1,2,"foo",{x:5}]);