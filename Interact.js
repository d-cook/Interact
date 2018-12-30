// Paste "Renderer" code HERE from: https://github.com/d-cook/Render

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

function keys   (o) { return Object.keys(o||{}) || []; }
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
        keys.map((k, i) => obj[''+k] = truthy(values[i]) ? values[i] : null);
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
//   [Click]      Copy inner item out of container
//   [DELETE]     Delete selected item (and associated action)
//   [DRAG]       Drag container
//   [DragHandle] Resize selected container (handles appear on selected)
//                Scroll container view
//                Auto-size container (to fit contents)
//                Auto-layout container contents (with recursive auto-size?)
//   [Just type]  Edit values (a caret appears?) (as an action!)
//   [Just type]  Create new values at point of last click in selected item
//                Add arguments to a function (currying?) / create call-template from function

var textSize = 14; // text height
var spacing = 12;  // spacing between components
var rowSize = textSize + spacing;

var r = Renderer('top left', { size: textSize, baseline: 'top' });

function stringOf(value) {
    var t = type(value);
    return (t === 'string'  ) ? '"' + value.replace(/\t/g, '    ').replace(/\r?\n/g, '\n ') + '"' :
           (t !== 'function') ? String(value)
                              : String(value).replace(/^(function\s*(\w+)?\s*)?\(?([^\)]*)\)?\s*(\=\>|\{)(.|\s)*$/, "$2($3)")
                                             .replace(/\s/g, '')
                                             .replace(/^\(/, '[func](');
}

function createMeta(value, x, y, z, levels) {
    var t = type(value);
    var meta = { x: (x || 0), y: (y || 0), z: (z || 0) };
    if (t !== 'object' && t !== 'array') {
        var str = stringOf(value);
        meta.w = (t === 'string')
           ? str.split('\n').reduce((m, s) => Math.max(m, r.textWidth(s)), 0)
           : r.textWidth(str);
        meta.h = (t === 'string')
           ? textSize * str.split('\n').length
           : textSize;
        return meta;
    } else if (levels < 0) {
        meta.w = 16;
        meta.h = textSize;
        meta.state = 'collapsed';
    } else {
        var ks = keys(value);
        var h = spacing;
        var w = spacing;
        meta.children = object(ks, ks.map((k, i) => {
            var x = spacing + (t !== 'object' ? 0 : r.textWidth(k+' : '));
            var m = createMeta(value[k], x, h, i, (levels || 0) - 1);
            w = Math.max(w, m.x + m.w + spacing);
            h += m.h + spacing;
            return m;
        }));
        meta.w = w;
        meta.h = h;
        meta.state = 'expanded';
    }
    return meta;
}

function subMeta(meta, idx) {
    var m = (meta.children && meta.children[idx]);
    m = (m) ? Object.assign({}, m) : createMeta(null);
    m.x += meta.x;
    m.y += meta.y;
    return m;
}

function createView(func, args, parent) {
    var context = applyContext(func, args);
    if (!func.meta) { func.meta = createMeta(context.values, 0, 0, 0, 1); }
    return {
        func   : func,
        context: context,
        parent : parent,
        args   : args
    };
}

var rootFunc = {
    parent : null,
    args   : [],
    actions: [
        null, // Reassigned to the root context below
        lookupValue, lookupContext, lookup, evalCall, evalAction, apply,
        has, get, set, del, type, _if, and, or, array, object, keys, length, truthy, not,
        plus, minus, mult, div, mod, EQ, NE, LT, GT, LTE, GTE,
        slice, push, unshift, pop, shift, charAt, substring, _id
    ]
};
var root = createView(rootFunc, []);
root.context.values[1] = root.context; // Because it was undefined the first time

var viewFunc = {
    parent : root.context,
    args   : ['param1', 'param2'],
    actions: [
        123,
        "ab\tc\td\nefg\nhij\rklm\r\nnop",
        true,
        null,
        [[1, 16], "x", "y", "z"],
        [[1, 16], 1, [0], 2234],
        [[1, 16], 3, 4],
        [[1, 16], 1, 2, [0,6], {}, 'A', 'B', function foo(x,y){return x+y/10;}],
        [[1, 17], [0,5], [0,6]],
        "foo",
        function(){}
    ]
};
var view = createView(viewFunc, ['arg1', 'arg2'], root);

var mouse = { x: 0, y: 0, pressed: false, pressedX: 0, pressedY: 0, dragged: false };
var hoveredItem = -1;
var hoveredSubItem = -1;
var selectedItem = -1;

function getContent(value, meta, hovered, selected) {
    var t = type(value);
    var a = (t === 'array');
    var o = (t === 'object');
    var s = (t === 'string');
    var c = (meta.state === 'collapsed');
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
                .concat(a ? [] : []
                    .concat(keys(value).map((k, i) => ['#888888 text', k+' : ', meta.x+0 + spacing, meta.y + spacing + i * rowSize]))
                    .concat(keys(value).map((k, i) => ['#888888 text', k+' : ', meta.x+1 + spacing, meta.y + spacing + i * rowSize]))
                )
                .concat([].concat.apply([], keys(value).map(k =>
                    getContent(value[k], subMeta(meta, k), (hovered && hoveredSubItem === k))
                ))) :
        (s) ? stringOf(value).split('\n').map((s, i) => ['text', s, meta.x, meta.y + (textSize * i)])
            : [['text', stringOf(value), meta.x, meta.y]]
    );
}

function valuesByZ() {
    return view.context.values
        .map((v, i) => ({ v: v, m: view.func.meta.children[i], i: i }))
        .sort((a, b) => (a.m.z || 0) - (b.m.z || 0));
}

function refreshView() {
    view = createView(view.func, view.args, view.parent);
    refreshMeta(view.context.values, view.func.meta);
}

function refreshMeta(value, meta) {
    if (meta.children) {
        var y = keys(meta.children)
            .map(k => meta.children[k])
            .reduce((h, m) => Math.max(h, m.y + m.h + spacing), meta.h);
        keys(value).map(k => {
            var m = meta.children[k];
            if (!m) {
                m = meta.children[k] = createMeta(value[k], spacing, y, 0, -1);
                y = m.y + m.h + spacing;
            }
            refreshMeta(value[k], m);
        });
    }
}

function renderContent() {
    r.render([].concat.apply([], valuesByZ().reverse().map(vmi =>
        getContent(vmi.v, vmi.m, hoveredItem === vmi.i, selectedItem === vmi.i)
    )));
}

function bringToFront(idx) {
    view.func.meta.children[idx].z = -1;
    valuesByZ().map((vmi, i) => vmi.m.z = i);
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

r.onMouseMove(function mouseMoved(x, y) {
    if (mouse.pressed) { mouse.dragged = true; }
    if (mouse.pressed && selectedItem >= 0) {
        var meta = view.func.meta.children[selectedItem];
        meta.x += x - mouse.x;
        meta.y += y - mouse.y;
    }
    mouse.x = x;
    mouse.y = y;
    hoveredSubItem = -1;
    hoveredItem = valuesByZ().reduce((h, vmi) => {
        var m = vmi.m;
        return (h < 0 && x >= m.x && x <= m.x + m.w && y >= m.y && y <= m.y + m.h) ? vmi.i : h;
    }, -1);
    var item = view.context.values[hoveredItem];
    var t = type(item);
    if (t === 'array' || t === 'object') {
        var meta = subMeta(view.func.meta, hoveredItem);
        hoveredSubItem = keys(meta.children).reduce((h, k) => {
            var m = subMeta(meta, k);
            return (h < 0 && x >= m.x && x <= m.x + m.w && y >= m.y && y <= m.y + m.h) ? k : h;
        }, -1);
    }
    renderContent();
});

r.onMouseDown(function mouseDown(x, y) {
    mouse.pressed = true;
    mouse.pressedX = x;
    mouse.pressedY = y;
    selectedItem = hoveredItem;
    if (selectedItem >= 0) { bringToFront(selectedItem); }
    renderContent();
});

r.onMouseUp(function mouseUp(x, y) {
    mouse.pressed = false;
    if (!mouse.dragged) { mouseClicked(x, y); }
    mouse.dragged = false;
    renderContent();
});

function mouseClicked(x, y) {
    if (hoveredSubItem !== -1) {
        var src = view.context.values[hoveredItem];
        var meta = view.func.meta.children[hoveredItem];
        var item = src[hoveredSubItem];
        addAction(
            [[1, 9], [0, hoveredItem], hoveredSubItem],
            createMeta(item, meta.x + meta.w + spacing, y, 0, 1)
        );
    }
}

function addAction(action, meta) {
    selectedItem = view.func.actions.reduce(
        (s, a, i) => (s < 0 && arrayMatch(a, action)) ? (i+1) : s,
        -1
    );
    if (selectedItem < 0) {
        selectedItem = view.context.values.length;
        view.func.actions.push(action);
        view.func.meta.children[selectedItem] = meta;
        refreshView();
    }
    bringToFront(selectedItem);
}

function fitToWindow() { r.resize(window.innerWidth-4, window.innerHeight-4); }

var c = r.getCanvas();
c.style.border = '2px solid red';
window.addEventListener('resize', fitToWindow);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(c);
fitToWindow();
renderContent();

// ---- TESTS ------

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