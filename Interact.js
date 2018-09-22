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

function metaFor(values, ix, iy, dx, dy) {
    return values.map((v, i) => ({ x: (ix + i*dx), y: (iy + i*dy) }));
}

function newContext(parent, values, args) {
    args = args || [];
    var allValues = [].concat([args], (values || []));
    return {
        parent: parent || null,
        values: allValues,
        meta: {
            args  : metaFor(args     , 14, 14                , 0, 28),
            values: metaFor(allValues, 14, 28*(args.length+1), 0, 28)
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
    [123, "abc", true, null, [1,2,'A','B'], {x:11, y:22}, "foo"],
    ['arg1', 'arg2']
);
var mouse = { x: 0, y: 0 };

var r = Renderer('top left', { size: 14, baseline: 'top' });

function getRenderingContent(values, meta, vert) {
    meta = meta || metaFor(values, 5, 5, (vert ? 0 : 24), (vert ? 24 : 0));
    return values.map((v, i) => Object.assign({}, meta[i], { v: v, t: type(v) }))
                 .map(m => (m.t === 'object') ? ['circle',            m.x+8, m.y+7, 8     ] :
                           (m.t === 'array' ) ? ['rect',              m.x,   m.y-1, 22, 16]
                                              : ['text', String(m.v), m.x,   m.y          ]);
}

function renderContent() {
    r.render(
        getRenderingContent(
            view.values[0].concat(view.values),
            view.meta.args.concat(view.meta.values)
        ).concat([
            ['#0044CC line', mouse.x-10, mouse.y   , mouse.x+10, mouse.y   ],
            ['#0044CC line', mouse.x   , mouse.y-10, mouse.x   , mouse.y+10]
        ])
    );
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
