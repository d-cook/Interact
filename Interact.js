function type(o) {
    return (o === null || typeof o === 'undefined') ? 'null' :
           Array.isArrray(o)                        ? 'array'
                                                    : typeof o;
}

function get(context, key) {
    return (context) ? context[key] : null;
}

function lookupValue(context, path) {
    return (path.length > 0) ? lookupValue(get(context, path[0]), path.slice(1))
                             : context;
}

function lookupContext(context, dist) {
    return (dist < 0) ? context.args || {} :
           (dist > 0) ? lookupContext(get(context, 'parent'), dist-1)
                      : context;
}

function lookup(context, path) {
    var ctx = lookupContext(context, path[0]);
    var values = get(ctx, 'values') || [];
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
    if (type(func) === 'function') { return func.apply(null, args); }
    var result = null;
    var context = { values:[], args:args, parent:func.parent };
    for (var i = 0; i < func.calcs.length; i++) {
        result = evalCalc(func, context, func.calcs[i]);
        context.values.push(result);
    }
    return result;
}

