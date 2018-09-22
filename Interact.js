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

// ---- IMPLEMENTATION ----

var textSize = 14; // text height
var spacing = 12;  // spacing between components

var r = Renderer('top left', { size: textSize, baseline: 'top' });

function widthOf(value) { return r.textWidth(JSON.stringify(value)); }

function metaWidth(value, nested) {
    var t = type(value);
    var a = (t === 'array'), o = (t === 'object');
    return (nested && (a||o)) ? 16 :
           (               a) ? (2 * spacing) + value.reduce((m, v) => Math.max(m, metaWidth(v, 1)), 0) :
           (               o) ? (2 * spacing) + keys(value).reduce((m, k) => Math.max(m, r.textWidth(k+' :: ') + metaWidth(value[k], 1)), 0)
                              : widthOf(value);
}

function metaHeight(value) {
    var t = type(value);
    var len = length(value);
    return (t === 'array' || t === 'object')
        ? (textSize + spacing) * Math.max(len, 1) + spacing
        : textSize;
}

function newContext(parent, values, args) {
    args = args || [];
    var allValues = [].concat([args], (values || []));
    var y = 0, h = 0;
    return {
        parent: parent || null,
        values: allValues,
        meta: {
            args  : args.concat(0).map(v => ({ x: spacing, y: (y = y + h + spacing), w: metaWidth(v), h: (h = metaHeight(v)) })).slice(0,-1),
            values: allValues     .map(v => ({ x: spacing, y: (y = y + h + spacing), w: metaWidth(v), h: (h = metaHeight(v)) }))
        }
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
    [123, "abc", true, null, [1,2,[3,4], {},'A','B'], {x:1, y:[], z:2234}, "foo"],
    ['arg1', 'arg2']
);
var mouse = { x: 0, y: 0 };

function getRenderingContent(value, meta) {
    var t = type(value);
    return (t === 'object') ? [['red rect',  meta.x, meta.y, meta.w, meta.h]] :
           (t === 'array' ) ? [['blue rect', meta.x, meta.y, meta.w, meta.h]]
                            : [['text', JSON.stringify(value), meta.x, meta.y]];
}

function renderContent() {
    var vals = view.values[0].concat(view.values);
    var meta = view.meta.args.concat(view.meta.values);
    r.render([].concat.apply([], vals.map((v, i) => getRenderingContent(v, meta[i])))
               .concat([['#0022CC line', mouse.x-10, mouse.y   , mouse.x+10, mouse.y   ],
                        ['#0022CC line', mouse.x   , mouse.y-10, mouse.x   , mouse.y+10]]));
}

r.onMouseMove(function mouseMoved(x, y) {
    mouse.x = x;
    mouse.y = y;
    renderContent();
});

function fitToWindow() { r.resize(window.innerWidth-4, window.innerHeight-4); }

var c = r.getCanvas();
c.style.cursor = 'none';
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
