// Paste "Renderer" code HERE from: https://github.com/d-cook/Render

function has (o, p   ) { try { return Object.prototype.hasOwnProperty.call(o, p); } catch(e) { return false; } }
function get (o, p   ) { return has(o, p) ? o[p] : null; }
function set (o, p, v) { var t = type(o); if (t === 'object' || t === 'array') { o[p] = v; } return v; }
function del (o, p   ) { var v = (has(o, p) ? o[p] : null); delete o[p]; return v; }

function type(o) {
    return (o === null || typeof o === 'undefined') ? 'null' :
           Array.isArray(o)                         ? 'array'
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

function newObj ( ) { return Object.create(null); }
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

function slice  (a,b,e) { return (type(a) !== 'array') ? null : [].slice  .apply(a, [].slice.call(arguments, 1)); }
function push   (a    ) { return (type(a) !== 'array') ? null : [].push   .apply(a, [].slice.call(arguments, 1)); }
function unshift(a    ) { return (type(a) !== 'array') ? null : [].unshift.apply(a, [].slice.call(arguments, 1)); }
function pop    (a    ) { return (type(a) !== 'array') ? null : [].pop    .apply(a); }
function shift  (a    ) { return (type(a) !== 'array') ? null : [].shift  .apply(a); }

function charAt    (s,i  ) { return (type(s) !== 'string') ? null : s.charAt   (i   ); }
function substring (s,b,e) { return (type(s) !== 'string') ? null : s.substring(b, e); }

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
    var ctx = lookupContext(context, path[0]);
    var values = get(ctx, 'values') || ctx;
    return lookupValue(values, path.slice(1));
}

function evalObject(context, objTemplate) {
    var keys = Object.keys(objTemplate);
    var obj = {};
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        obj[k] = evalCalc(context, objTemplate[k]);
    }
    return obj;
}

function evalArray(context, arrayTemplate) {
    return arrayTemplate.map(a => evalCalc(context, a));
}

function evalCall(context, entries) {
    var lookups = entries.map(e => lookup(context, e));
    return (lookups.length > 1) ? apply(lookups[0], lookups.slice(1)) :
           (lookups.length > 0) ? lookups[0]
                                : null;
}

function evalCalc(context, calc) {
    var t = type(calc);
    return (t === 'null'  ) ? null :
           (t === 'object') ? evalObject(context, calc) :
           (t !== 'array' ) ? calc :
           (calc[0] !== 1 ) ? evalArray(context, calc.slice(1))
                            : evalCall(context, calc.slice(1));
}

function apply(func, args) {
    var tf = type(func);
    if (tf === 'function') { return func.apply(null, args); }
    if (tf !== 'object') { return null; }
    var result = null;
    var context = { values:[args], parent:func.parent };
    for (var i = 0; i < func.calcs.length; i++) {
        result = evalCalc(context, func.calcs[i]);
        context.values.push(result);
    }
    return result;
}

// -----------------------------
// ---- TOOL IMPLEMENTATION ----
// -----------------------------

var textSize = 14; // text height
var spacing = 12;  // spacing between components

var r = Renderer('top left', { size: textSize, baseline: 'top' });

function stringOf(value) {
    var t = type(value);
    return (t === 'string'  ) ? '"' + value.replace(/\t/g, '    ').replace(/\r?\n/g, '\n ') + '"' :
           (t !== 'function') ? String(value)
                              : String(value).replace(/^(function\s*(\w+)?\s*)?\(?([^\)]*)\)?\s*(\=\>|\{).*$/, "$2($3)")
                                             .replace(/\s/g, '')
                                             .replace(/^\(/, '[func](');
}

function metaWidth(value, nested) {
    var t = type(value);
    var a = (t === 'array'), o = (t === 'object'), s = (t === 'string');
    var n = nested && (a||o);
    return (n) ? 16 :
           (a) ? (2 * spacing) + value.reduce((m, v) => Math.max(m, metaWidth(v, 1)), 0) :
           (o) ? (2 * spacing) + keys(value).reduce((m, k) => Math.max(m, r.textWidth(k+' : ') + metaWidth(value[k], 1)), 0) :
           (s) ? stringOf(value).split('\n').reduce((m, s) => Math.max(m, r.textWidth(s)), 0)
               : r.textWidth(stringOf(value));
}

function metaHeight(value) {
    var t = type(value);
    var len = length(value);
    var ao = (t === 'array' || t === 'object'), s = (t === 'string');
    return (ao) ? (textSize + spacing) * Math.max(len, 1) + spacing :
           ( s) ? textSize * stringOf(value).split('\n').length
                : textSize;
}

function newContext(parent, values, args) {
    args = args || [];
    var allValues = [].concat([args], (values || []));
    var y = 0, h = 0;
    return {
        parent: parent || null,
        values: allValues,
        meta: allValues.map(v => ({
            x: spacing,
            y: (y = y + h + spacing),
            w: metaWidth(v),
            h: (h = metaHeight(v))
        }))
    };
}

var root = newContext(null, [
    root, // root is undefined at this point, so it must be set again below
    lookupValue, lookupContext, lookup, evalObject, evalArray, evalCall, evalCalc, apply,
    has, get, set, del, type, _if, and, or, newObj, keys, length, truthy, not,
    plus, minus, mult, div, mod, EQ, NE, LT, GT, LTE, GTE,
    slice, push, unshift, pop, shift, charAt, substring,
]);
root.values[1] = root; // Because it was undefined the first time

var view = newContext(
    root,
    [123, "ab\tc\td\nefg\nhij\rklm\r\nnop", true, null, [1,2,[3,4], {},'A','B', function foo(x,y){return x+y/10;}], {x:1, y:[], z:2234}, "foo", function(){}],
    ['arg1', 'arg2']
);

var mouse = { x: 0, y: 0, pressed: false, pressedX: 0, pressedY: 0 };
var hoveredItem = -1;
var selectedItem = -1;

function getContent(value, meta, idx) {
    var nested = !(idx >= 0); // because (undefined < 0) is false
    var t = type(value);
    var a = (t === 'array'), o = (t === 'object'), s = (t === 'string');
    var na = (nested && a), no = (nested && o);
    var selected = (selectedItem === idx);
    return (
        (selected || hoveredItem === idx)
            ? [[(selected ? 'cyan' : 'yellow') +
                     ' filled rect', meta.x - 2, meta.y - 2, meta.w + 4, meta.h + 4],
               ['white filled rect', meta.x + 3, meta.y + 3, meta.w - 6, meta.h - 6]]
            : []
    ).concat(
       (na) ? [['filled #EEEEEE rect', meta.x, meta.y, meta.w, meta.h],
               ['black rect', meta.x, meta.y, meta.w, meta.h],
               ['filled #666666 rect', meta.x + 3, meta.y + meta.h - 6, 2, 2],
               ['filled #666666 rect', meta.x + 7, meta.y + meta.h - 6, 2, 2],
               ['filled #666666 rect', meta.x +11, meta.y + meta.h - 6, 2, 2]
              ] :
       (no) ? [['filled #EEEEEE rect', meta.x, meta.y, meta.w, meta.h],
               ['black rect', meta.x, meta.y, meta.w, meta.h],
               ['filled #666666 rect', meta.x + 4, meta.y + meta.h - 6, 2, 2],
               ['filled #666666 rect', meta.x + 4, meta.y + meta.h -10, 2, 2]
              ] :
        (a) ? [['rect', meta.x, meta.y, meta.w, meta.h]]
                .concat(
                    [].concat.apply([],
                        value.map((v, i) =>
                            getContent(v, {
                                x: meta.x + spacing,
                                y: meta.y + spacing + i * (textSize + spacing),
                                w: metaWidth(v, 1),
                                h: textSize
                            })
                        )
                    )
                ) :
        (o) ? [['rect', meta.x, meta.y, meta.w, meta.h]]
                .concat(keys(value).map((k, i) => ['#888888 text', k+' : ', meta.x+0 + spacing, meta.y + spacing + i * (textSize + spacing)]))
                .concat(keys(value).map((k, i) => ['#888888 text', k+' : ', meta.x+1 + spacing, meta.y + spacing + i * (textSize + spacing)]))
                .concat(
                    [].concat.apply([],
                        keys(value).map((k, i) =>
                            getContent(value[k], {
                                x: meta.x + spacing + r.textWidth(k+' : ', 1),
                                y: meta.y + spacing + i * (textSize + spacing),
                                w: metaWidth(value[k], 1),
                                h: textSize
                            })
                        )
                    )
                ) :
        (s) ? stringOf(value).split('\n').map((s, i) => ['text', s, meta.x, meta.y + (textSize * i)])
            : [['text', stringOf(value), meta.x, meta.y]]
    );
}

function renderContent() {
    r.render([].concat.apply([], view.values.map((v, i) => getContent(v, view.meta[i], i))));
}

r.onMouseMove(function mouseMoved(x, y) {
    mouse.x = x;
    mouse.y = y;
    hoveredItem = view.values.reduce((h, v, i) => {
        var m = view.meta[i];
        return (h < 0 && x >= m.x && x <= m.x + m.w && y >= m.y && y <= m.y + m.h) ? i : h;
    }, -1);
    renderContent();
});

r.onMouseDown(function mouseDown(x, y) {
    mouse.pressed = true;
    mouse.pressedX = x;
    mouse.pressedY = y;
    selectedItem = hoveredItem;
    renderContent();
});

r.onMouseUp(function mouseUp(x, y) {
    mouse.pressed = false;
    renderContent();
});

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

test({parent:root, calcs:[]}, [1,2,"foo",{x:5}]);
test({parent:root, calcs:[5]}, [1,2,"foo",{x:5}]);
test({parent:root, calcs:["test"]}, [1,2,"foo",{x:5}]);
test({parent:root, calcs:[0,1,2,3]}, [1,2,"foo",{x:5}]);
test({parent:root, calcs:[[0,1,2,3]]}, [1,2,"foo",{x:5}]);
test({parent:root, calcs:[[1,[1,0]]]}, [1,2,"foo",{x:5}]);
test({parent:root, calcs:[[1,[1,23]]]}, [1,2,"foo",{x:5}]);
test({parent:root, calcs:[[1,[1,23],[-1,0],[-1,1]]]}, [1,2,"foo",{x:5}]);
test({parent:root, calcs:[[1,[1,23],[0,0,0],[-1,1]]]}, [1,2,"foo",{x:5}]);
test({parent:root, calcs:[[1,[1,23],[-1,1],[-1,2]]]}, [1,2,"foo",{x:5}]);
test({parent:root, calcs:[[1,[1,11]]]}, [1,2,"foo",{x:5}]);
test({parent:root, calcs:[[1,[1,11],[-1,3],[-1,2]]]}, [1,2,"foo",{foo:5}]);
test({parent:root, calcs:[[1,[1,11],[-1,3],[-1,2]]]}, [1,2,"foo",{foo:5,x:7}]);
test({parent:root, calcs:[[1,[1,11],[-1,3],[-1,2]]]}, [1,2,"x",{foo:5,x:7}]);
test({parent:root, calcs:[[1,[1,11],[-1,3],[-1,2]]]}, [1,2,"xx",{foo:5,x:7}]);
