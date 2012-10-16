
// TODO dependent properties
// TODO custom property observer definition

var WeakMap = require("collections/weak-map");
var bind = require("./bind");
var compute = require("./compute");
var observe = require("./observe");
var Properties = require("./properties");

var bindingsForObject = new WeakMap();
var owns = Object.prototype.hasOwnProperty;

exports.create = create;
function create(prototype, properties, descriptors) {
    var self = Object.create(prototype);
    define(self, properties, descriptors);
    return self;
}

exports.define = define;
function define(object, properties, descriptors) {
    if (descriptors) {
        for (var name in descriptors) {
            defineBinding(object, name, descriptors[name]);
        }
    }
    if (properties) {
        for (var name in properties) {
            object[name] = properties[name];
        }
    }
}

exports.defineBinding = defineBinding;
function defineBinding(object, name, descriptor) {
    var cancel = noop;
    if (descriptor[constructor]) {
        object = object.constructor;
    }
    var bindingsForName = getBindings(object);
    if ("<-" in descriptor || "<->" in descriptor || "compute" in descriptor) {
        cancelBinding(object, name);
        descriptor.target = object;
        if ("compute" in descriptor) {
            descriptor.cancel = compute(object, name, descriptor);
        } else {
            descriptor.cancel = bind(object, name, descriptor);
        }
        bindingsForName[name] = descriptor;
    } else {
        if (!("get" in descriptor) && !("set" in descriptor) && !("writable" in descriptor)) {
            descriptor.writable = true;
        }
        if (!("configurable" in descriptor)) {
            descriptor.configurable = true;
        }
        if (!("enumerable" in descriptor)) {
            descriptor.enumerable = true;
        }
        Object.defineProperty(object, name, descriptor);
    }
}

exports.getBindings = getBindings;
function getBindings(object) {
    if (!bindingsForObject.has(object)) {
        bindingsForObject.set(object, {});
    }
    return bindingsForObject.get(object);
}

exports.getBinding = getBinding;
function getBinding(object, name) {
    var bindingsForName = getBindings(object);
    return bindingsForName[name];
}

exports.cancelBindings = cancelBindings;
function cancelBindings(object) {
    var bindings = getBindings(object);
    for (var name in bindings) {
        cancelBinding(object, name);
    }
}

exports.cancelBinding = cancelBinding;
function cancelBinding(object, name) {
    var bindings = getBindings(object);
    if (!bindings[name])
        return;
    var binding = bindings[name];
    if (binding && binding.cancel) {
        binding.cancel();
        delete bindings[name];
    }
}

function noop () {}

