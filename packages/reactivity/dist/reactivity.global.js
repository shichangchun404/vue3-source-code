"use strict";
var VueReactivity = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/reactivity/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    activeEffect: () => activeEffect,
    effect: () => effect,
    reactive: () => reactive,
    track: () => track,
    trigger: () => trigger
  });

  // packages/reactivity/src/effect.ts
  var activeEffect = null;
  var ReactiveEffect = class {
    constructor(fn) {
      this.fn = fn;
      this.parent = null;
      this.active = true;
      this.deps = [];
    }
    run() {
      if (!this.active) {
        return this.fn();
      }
      try {
        this.parent = activeEffect;
        activeEffect = this;
        return this.fn();
      } finally {
        activeEffect = this.parent;
      }
    }
  };
  function effect(fn) {
    const _effect = new ReactiveEffect(fn);
    _effect.run();
  }
  var taregtMap = /* @__PURE__ */ new WeakMap();
  function track(taregt, type, key) {
    if (!activeEffect)
      return;
    let depsMap = taregtMap.get(taregt);
    if (!depsMap) {
      depsMap = /* @__PURE__ */ new Map();
      taregtMap.set(taregt, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
      dep = /* @__PURE__ */ new Set();
      depsMap.set(key, dep);
    }
    let shouldTrack = !dep.has(activeEffect);
    if (shouldTrack) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
    }
  }
  function trigger(target, type, key, value, oldValue) {
    const depsMap = taregtMap.get(target);
    if (!depsMap)
      return;
    const effects = depsMap.get(key);
    effects.forEach((effect2) => {
      if (effect2 === activeEffect)
        return;
      effect2.run();
    });
  }

  // packages/shared/src/index.ts
  var isObject = (val) => {
    return typeof val === "object" && val !== null;
  };

  // packages/reactivity/src/baseHandler.ts
  var mutableHandlers = {
    get(target, key, receiver) {
      console.log("proxy get ", key, target[key]);
      if (key === "__V__isReactive" /* IS_REACTIVE */) {
        return true;
      }
      track(target, "get", key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      console.log("proxy set", key, value);
      let oldValue = target[key];
      let result = Reflect.set(target, key, value, receiver);
      if (oldValue != value) {
        trigger(target, "set", key, value, oldValue);
      }
      return result;
    }
  };

  // packages/reactivity/src/reactive.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (!isObject(target)) {
      return;
    }
    if (reactiveMap.get(target)) {
      return reactiveMap.get(target);
    }
    if (target["__V__isReactive" /* IS_REACTIVE */]) {
      return target;
    }
    let proxy = new Proxy(target, mutableHandlers);
    reactiveMap.set(target, proxy);
    return proxy;
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
