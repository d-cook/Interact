// Paste "Renderer 1.1.1" code HERE ( https://github.com/d-cook/Render/releases/tag/1.1.1 )

// ----------------------
// ---- Console Info ----
// ----------------------

console.log("                                                                             ");
console.log("       .--------------------------------------\--\----------------------------.");
console.log("      /  .-----. .-.  .-. .-----. .-----. .--\--\.  .-----. .-----. .-----.  / ");
console.log("     /  '-. .-' /  | / / '-. .-' / .---' / .\-.\ / / .-. / / .---' '-. .-'  /  ");
console.log("    /    / /   / / |/ /   / /   / '---. / '\-'\_/ / '-' / / /       / /    /   ");
console.log("   /    / /   / /| / /   / /   / .---' / /\\ \\  / .-. / / /       / /    /    ");
console.log("  /  .-' '-. / / |  /   / /   / '---. / /\ /\ / / / / / / '---.   / /    /     ");
console.log(" /  '-----' '-'  '-'   '-'   '-----' '-'\ '\-' '-' '-' '-----'   '-'    /      ");
console.log("'--------------------------------------\--\----------------------------'       ");
console.log("                                                                             ");
console.log(' [Click]      Expand/Collapse item                                           ');
console.log(' [Dbl-Click]  Extract nested item                                            ');
console.log(' [Drag]       Move item                                                      ');
console.log('                                                                             ');
console.log(' [???]        Auto Cleanup (remove unused items)                             ');
console.log(' [???]        Delete item (remove/undo its "action")                         ');
console.log(' [???]        Auto Layout item contents                                      ');
console.log(' [???]        Edit item (opens a new "view")                                 ');
console.log(' [???]        Insert new item                                                ');
console.log('                                                                             ');

// TODO:
// #3 How to construct values?
//    - Type values into existence
//    - function invocations (drag -> template -> go!)
// #9 Visualize external/parent entites
//    - List parent values (tray, or as "inner" but marked). Or context values, which contains parent
//    - Show referenced external values
// #30 Multiple views
// #31 Views are editors

// ------------------------
// ---- BASE FUNCTIONS ----
// ------------------------

function _id(x) { return x; }

function has (o, p   ) { try { return Object.prototype.hasOwnProperty.call(o, p); } catch(e) { return false; } }
function get (o, p   ) { return has(o, p) ? o[p] : null; }
function set (o, p, v) { let t = type(o); if (t === 'object' || t === 'array') { o[p] = v; } return v; }
function del (o, p   ) { let v = (has(o, p) ? o[p] : null); delete o[p]; return v; }

function type(o) {
    return (o === null || typeof o === 'undefined') ? 'null' :
           (Array.isArray(o)                      ) ? 'array'
                                                    : typeof o;
}

function _if (cond, T, F   ) { return apply(truthy(cond) ? T : F, [cond]); }
function and (L, R, ...rest) { return (arguments.length < 2 || not   (L)) ? L : and(apply(R, []), ...rest); }
function or  (L, R, ...rest) { return (arguments.length < 2 || truthy(L)) ? L : or (apply(R, []), ...rest); }

function keys   (o) { return (type(o) === 'array') ? o.map((v, i) => i) : Object.keys(o||{}) || []; }
function values (o) { return keys(o).map((k, v) => o[k]); }
function length (o) { return(Object.keys(o||{}) || []).length; }
function truthy (v) { return v || v === 0 || v === ''; }
function not    (v) { return !truthy(v); }

function plus (x, ...rest) { return reduce(rest, (r,v) => r + v, x); }
function minus(x, ...rest) { return reduce(rest, (r,v) => r - v, x); }
function mult (x, ...rest) { return reduce(rest, (r,v) => r * v, x); }
function div  (x, ...rest) { return reduce(rest, (r,v) => r / v, x); }
function mod  (x, ...rest) { return reduce(rest, (r,v) => r % v, x); }
function EQ   (x, ...rest) { return reduce(rest, (r,v) => r && (v === x), true); }
function NE   (x, ...rest) { return reduce(rest, (r,v) => r && (v !== x), true); }
function LT   (x, ...rest) { return reduce(rest, (r,v) => r && (v <   x), true); }
function GT   (x, ...rest) { return reduce(rest, (r,v) => r && (v >   x), true); }
function LTE  (x, ...rest) { return reduce(rest, (r,v) => r && (v <=  x), true); }
function GTE  (x, ...rest) { return reduce(rest, (r,v) => r && (v >=  x), true); }

function array (...args) { return args; }
function object(keys, values) {
    let obj = Object.create(null);
    if (type(keys) === 'array' && type(values) === 'array') {
        keys.map((k, i) => obj[''+k] = values[i]);
    }
    return obj;
}

function map      (a, ...rest) { return (type(a) !== 'array' ) ? null : a.map      (...rest); }
function filter   (a, ...rest) { return (type(a) !== 'array' ) ? null : a.filter   (...rest); }
function reduce   (a, ...rest) { return (type(a) !== 'array' ) ? null : a.reduce   (...rest); }
function slice    (a, ...rest) { return (type(a) !== 'array' ) ? null : a.slice    (...rest); }
function push     (a, ...rest) { return (type(a) !== 'array' ) ? null : a.push     (...rest); }
function unshift  (a, ...rest) { return (type(a) !== 'array' ) ? null : a.unshift  (...rest); }
function pop      (a, ...rest) { return (type(a) !== 'array' ) ? null : a.pop      (...rest); }
function shift    (a, ...rest) { return (type(a) !== 'array' ) ? null : a.shift    (...rest); }
function charAt   (s, ...rest) { return (type(s) !== 'string') ? null : s.charAt   (...rest); }
function substring(s, ...rest) { return (type(s) !== 'string') ? null : s.substring(...rest); }

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
    return (lookups.length > 0) ? apply(lookups[0], lookups.slice(1))
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
    if (tf === 'function') { vals.push(safeResult(func, args)); }
    else if (tf !== 'object') { vals.push(null); }
    else { func.actions.map(a => vals.push(safeResult(evalAction(context, a)))); }
    return context;
}

function safeResult(f, args) {
    try {
        let r = (args) ? f(...args) : f;
        return (type(r) === 'null') ? null : r;
    } catch (ex) {
        return safeResult((ex && ex.message) || ex);
    }
}

// -----------------------------
// ---- TOOL IMPLEMENTATION ----
// -----------------------------

// Settings
var textSize = 14; // text height
var spacing = 12;  // spacing between components
var rowSize = textSize + spacing;

// Path to hovered/selected items
var hoveredItem = [];
var selectedItem = [];

// UI Renderer
var ui = Renderer('top left', { size: textSize, baseline: 'top' });

var innerFunc = {
    parent : null, // rootContext will be inserted HERE
    args   : ['param1', 'param2'],
    actions: [
        123,
        "ab\tc\td\nefg\nhij\rklm\r\nnop",
        true,
        null,
        [[1, 16], "x", "y", "z"],
        [[1, 16], "(1,\n2,\n3)", [0], 2234],
        function foo(x,y){return x+y/10;},
        [[1, 17], [0,5], [0,6]],
        function(){},
        [[1]]
    ]
};
var rootFunc = { parent : null, args: [] };
rootFunc.actions = [
    _id, lookupValue, lookupContext, lookup, evalCall, evalAction, apply,
    has, get, set, del, type, _if, and, or, array, object, keys, length, truthy, not,
    plus, minus, mult, div, mod, EQ, NE, LT, GT, LTE, GTE,
    slice, push, unshift, pop, shift, charAt, substring,
    rootFunc, innerFunc
];

// Root context
var rootContext = innerFunc.parent = applyContext(rootFunc, []);

// Active view
var view = createView(innerFunc, ['arg1', 'arg2']);

function createView(func, args) {
    var context = applyContext(func, args);
    if (!func.meta) {
        var meta = refreshMeta(context.values, null, 2);
        func.meta = Object.assign(meta, { x: 0, y: 0, autoSize: false });
    }
    return {
        func   : func,
        context: context,
        args   : args
    };
}

function refreshMeta(value, meta, levels) {
    if (type(levels) !== 'number') { levels = 1; }
    var t = type(value);
    meta = Object.assign({ x: 0, y: 0, z: 0, autoSize: true }, meta || {});
    if (t !== 'object' && t !== 'array') {
        var str = stringOf(value);
        meta.w = (t === 'string')
           ? str.split('\n').reduce((m, s) => Math.max(m, ui.textWidth(s)), 0)
           : ui.textWidth(str);
        meta.h = (t === 'string')
           ? textSize * str.split('\n').length
           : textSize;
    } else if (meta.state === 'collapsed' || (!meta.state && levels < 1)) {
        meta.w = 16;
        meta.h = textSize;
        meta.state = 'collapsed';
    } else {
        var ch = meta.children || [];
        var h = values(ch).reduce((h, m) => Math.max(h, m.y + m.h + spacing), spacing);
        var ks = keys(value);
        var tw = ks.map(t === 'array' ? k => 0 : k => ui.textWidth(k+' : '));
        var vals = ks.map((k, i) => {
            var m = refreshMeta(
                value[k],
                ch[k] || {
                    x: spacing + tw[i],
                    y: h,
                    z: i
                },
                (levels - 1)
            );
            if (!ch[k]) { h = m.y + m.h + spacing; }
            return m;
        });
        meta.children = (t === 'array') ? vals : object(ks, vals);
        if (meta.autoSize) {
            var min = (a, b) => Math.min(a, b);
            var x = vals.map((m, i) => m.x - spacing - tw[i]).reduce(min, Infinity);
            var y = vals.map((m, i) => m.y - spacing - 00000).reduce(min, Infinity);
            if (x !== Infinity) { vals.map(m => m.x -= x); meta.x += x; }
            if (y !== Infinity) { vals.map(m => m.y -= y); meta.y += y; }
            meta.w = vals.reduce((w, m) => Math.max(w, m.x + m.w + spacing), spacing);
            meta.h = vals.reduce((h, m) => Math.max(h, m.y + m.h + spacing), spacing);
        }
        meta.state = 'expanded';
    }
    return meta;
}

function subMeta(meta, key) {
    var m = (meta.children && meta.children[key]);
    m = (m) ? Object.assign({}, m) : refreshMeta(null);
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
                                             .replace(/\.\.\./g, '..')
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
                        ).concat(a ? [] : [['#AA8844 text', k+' : ', m.x - spacing - ui.textWidth(k+':') + 0, m.y]])
                }))) :
        (s) ? stringOf(value).split('\n').map((s, i) => ['text', s, meta.x, meta.y + (textSize * i)])
            : [['text', stringOf(value), meta.x, meta.y]]
    );
}

function refreshView() {
    view = createView(view.func, view.args);
    var w = view.func.meta.w; // Keep width set by window
    var h = view.func.meta.h; // Keep height set by window
    var meta = refreshMeta(view.context.values, view.func.meta);
    view.func.meta = Object.assign(meta, { w: w, h: h });
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
           (m.children) ? [k, ...getItemAt(m.children, x - m.x, y - m.y)]
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
        var action = [[1, 9], [0, ...selectedItem.slice(0, last)], selectedItem[last]];
        var idx = getActionIndex(action) + 1;
        if (idx < 1) {
            idx = view.func.actions.length + 1;
            var item = selectedItem.reduce((v, s) => v[s], view.context.values);
            var outerMeta = view.func.meta.children[selectedItem[0]];
            var innerMeta = selectedItem.reduce((m, s) => subMeta(m, s), view.func.meta);
            addAction(action, refreshMeta(item, { x: outerMeta.x + outerMeta.w + spacing, y: innerMeta.y }));
            refreshView();
        }
        selectedItem = [idx];
        bringToFront(view.func.meta.children, selectedItem);
    }
}

function expandSelectedItem() {
    if (selectedItem.length > 1) {
        var meta = selectedItem.reduce((m, s) => m.children[s], view.func.meta);
        if (meta.state === 'collapsed') {meta.state = 'expanded'; }
        else if (meta.state === 'expanded') { meta.state = 'collapsed'; }
        bringToFront(view.func.meta.children, selectedItem);
        refreshView();
    }
}

function moveSelectedItem(dx, dy) {
    if (selectedItem.length > 0) {
        var m = selectedItem.reduce((m, s) => m.children[s], view.func.meta);
        m.x += dx;
        m.y += dy;
        refreshView();
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
        expandSelectedItem();
    }
    renderContent();
}, 285);

ui.fitToWindow(function onResize(w, h) {
    view.func.meta.w = w;
    view.func.meta.h = h;
    renderContent();
});

// ---------------
// ---- TESTS ----
// ---------------

(function runTests() {
    let errs = [];

    function str(x, d) {
        let t = type(x);
        let s = (
           (d >= 10         ) ? '...' :
           (t === 'array'   ) ? '[' + x.map(v => str(v, (d||0)+1)).join(',') + ']' :
           (t === 'object'  ) ? '{' + keys(x).map(k => k + ':' + str(x[k], (d||0)+1)).join(',') + '}' :
           (t === 'function') ? String(x).replace(/(\n|\s)+/g, ' ') :
           (t === 'string'  ) ? '"' + x + '"'
                              : String(x)
        ).replace(/\n/, '');
        return (s.length > 150) ? s.substring(0, 147) + '...' : s;
    }

    function eq(a, b) {
        let ta = type(a), tb = type(b);
        return (a === b) || (
            (ta === tb) && (
                (ta === 'array' ) ? a.reduce((e, v, i) => e && eq(v, b[i]), true) :
                (ta === 'object') ? keys(a).concat(keys(b)).reduce((e, k) => e && eq(a[k], b[k]), true)
                                  : str(a) === str(b)
            )
       );
    }

    function test(actions, args, expected) {
        let result = apply({ parent:rootContext, actions }, args);
        let unQ = s => str(s).replace(/^\"|\"$/g, '')
        if (!eq(unQ(result), unQ(expected))) {
            errs.push('TEST FAILED:' +
                         '\n  actions : ' + str(actions ) +
                         '\n  args    : ' + str(args    ) +
                         '\n  expected: ' + str(expected) +
                         '\n  result  : ' + str(result  ));
        }
    }

    test([                        ], [1,2,"foo", {x:5      }], null);
    test([5                       ], [1,2,"foo", {x:5      }], 5);
    test(["test"                  ], [1,2,"foo", {x:5      }], 'test');
    test([0,1,2,3                 ], [1,2,"foo", {x:5      }], 3);
    test([[[1,16],1,2,3]          ], [1,2,"foo", {x:5      }], [1,2,3]);
    test([[[1,1],[1,0]]           ], [1,2,"foo", {x:5      }], []);
    test([[[1,1],[1,22]]          ], [1,2,"foo", {x:5      }], plus);
    test([[[1,22],[-1,0],[-1,1]]  ], [1,2,"foo", {x:5      }], 3);
    test([[[1,22],[0,0,0],[-1,1]] ], [1,2,"foo", {x:5      }], 3);
    test([[[1,22],[-1,1],[-1,2]]  ], [1,2,"foo", {x:5      }], '2foo');
    test([[[1,1],[1,9]]           ], [1,2,"foo", {x:5      }], get);
    test([[[1,9],[-1,3],[-1,2]]   ], [1,2,"foo", {foo:5    }], 5);
    test([[[1,9],[-1,3],[-1,2]]   ], [1,2,"foo", {foo:5,x:7}], 5);
    test([[[1,9],[-1,3],[-1,2]]   ], [1,2,"x"  , {foo:5,x:7}], 7);
    test([[[1,9],[-1,3],[-1,2]]   ], [1,2,"xx" , {foo:5,x:7}], null);
    test([[5],[x=>x, [0]]         ], [1,2,"foo", {x:5      }], '[[1,2,"foo",{x:5}],null,[[1,2,"foo",{x:5}],null,[[1,2,"foo",{x:5}],null,[[1,2,"foo",{x:5}],null,[[1,2,"foo",{x:5}],null,[[1,2,"foo",{x:5}],null,[[1...');
    test(['!',[x=>x, [0,1]]       ], [1,2,"foo", {x:5      }], '!');
    test([[5],[x=>x, [0,"values"]]], [1,2,"foo", {x:5      }], '[[1,2,"foo",{x:5}],null,[[1,2,"foo",{x:5}],null,[[1,2,"foo",{x:5}],null,[[1,2,"foo",{x:5}],null,[[1,2,"foo",{x:5}],null,[[1,2,"foo",{x:5}],null,[[1...');
    test([[5],[x=>x, [0,"parent"]]], [1,2,"foo", {x:5      }], rootContext);

    if (errs.length > 0) {
        function desc(o) {
            let t = type(o);
            return (t === 'object'  ) ? '{..}' :
                   (t === 'array'   ) ? '[..]' :
                   (t !== 'function') ? o
                                      : String(o).replace(/\n|\r/g, '')
                                                 .replace(/^\s*function\s*/, '')
                                                 .replace(/\s*\(.*$/g, '');
        }
        console.warn(rootFunc.actions.reduce((m, a, i) => m + '\n ' + (i < 9 ? ' ' : '') + (i+1) + ': ' + desc(a), 'Actions:'));
        errs.map(e => console.error(e));
    }
}());