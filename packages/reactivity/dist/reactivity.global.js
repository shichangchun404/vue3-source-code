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
    ReactiveEffect: () => ReactiveEffect,
    activeEffect: () => activeEffect,
    computed: () => computed,
    effect: () => effect,
    isReactive: () => isReactive,
    reactive: () => reactive,
    track: () => track,
    trackEffects: () => trackEffects,
    trigger: () => trigger,
    triggerEffects: () => triggerEffects,
    watch: () => watch
  });

  // packages/reactivity/src/effect.ts
  var activeEffect = null;
  var ReactiveEffect = class {
    constructor(fn, scheduler) {
      this.fn = fn;
      this.scheduler = scheduler;
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
        clearupEffect(this);
        return this.fn();
      } finally {
        activeEffect = this.parent;
      }
    }
    stop() {
      if (this.active) {
        this.active = false;
        clearupEffect(this);
      }
    }
  };
  function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    let runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
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
    trackEffects(dep);
  }
  function trackEffects(dep) {
    if (!activeEffect)
      return;
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
    let effects = depsMap.get(key);
    if (effects) {
      triggerEffects(effects);
    }
  }
  function triggerEffects(effects) {
    effects = new Set(effects);
    effects.forEach((effect2) => {
      if (effect2 === activeEffect)
        return;
      if (effect2.scheduler) {
        effect2.scheduler();
      } else {
        effect2.run();
      }
    });
  }
  function clearupEffect(effect2) {
    let { deps } = effect2;
    deps.forEach((item) => {
      item.delete(effect2);
    });
    effect2.deps.length = 0;
  }

  // packages/shared/src/index.ts
  var isObject = (val) => {
    return typeof val === "object" && val !== null;
  };
  var isFunction = (val) => {
    return typeof val === "function";
  };

  // packages/reactivity/src/baseHandler.ts
  var mutableHandlers = {
    get(target, key, receiver) {
      if (key === "__V__isReactive" /* IS_REACTIVE */) {
        return true;
      }
      track(target, "get", key);
      let reslult = Reflect.get(target, key, receiver);
      if (isObject(reslult)) {
        return reactive(reslult);
      }
      return reslult;
    },
    set(target, key, value, receiver) {
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
  function isReactive(value) {
    return value && value["__V__isReactive" /* IS_REACTIVE */];
  }

  // packages/reactivity/src/computed.ts
  var ComputedRefImpl = class {
    constructor(getter, setter) {
      this.setter = setter;
      this.dep = /* @__PURE__ */ new Set();
      this._dirty = true;
      this.effect = new ReactiveEffect(getter, () => {
        console.log("\u8BA1\u7B97\u5C5E\u6027\u4F9D\u8D56\u7684\u5C5E\u6027\u53D1\u751F\u53D8\u5316 ", this._dirty);
        if (!this._dirty) {
          this._dirty = true;
          triggerEffects(this.dep);
        }
      });
    }
    get value() {
      trackEffects(this.dep);
      console.log("get value", this._dirty);
      if (this._dirty) {
        this._dirty = false;
        this._value = this.effect.run();
      }
      return this._value;
    }
    set value(newValue) {
      this.setter(newValue);
    }
  };
  function computed(getterOrOptions) {
    let getter;
    let setter;
    const isGetter = isFunction(getterOrOptions);
    if (isGetter) {
      getter = getterOrOptions;
      setter = () => {
      };
    } else {
      getter = getterOrOptions.get;
      setter = getterOrOptions.set;
    }
    return new ComputedRefImpl(getter, setter);
  }

  // packages/reactivity/src/watch.ts
  function watch(options, cb) {
    let getter;
    let newValue;
    let oldValue;
    let cleanup;
    if (isFunction(options)) {
      getter = options;
    } else if (isReactive(options)) {
      getter = () => traversal(options);
    }
    const onCleanup = (fn) => {
      cleanup = fn;
    };
    const job = () => {
      newValue = effect2.run();
      cb(newValue, oldValue, onCleanup);
      oldValue = newValue;
    };
    const effect2 = new ReactiveEffect(getter, job);
    oldValue = effect2.run();
  }
  function traversal(value, sets = /* @__PURE__ */ new Set()) {
    if (!isObject(value))
      return value;
    if (sets.has(value)) {
      console.log("\u5BF9\u8C61\u5982\u679C\u5DF2\u7ECF\u9012\u5F52\u8FC7\u4E86 \u76F4\u63A5\u9000\u51FA");
      return value;
    }
    sets.add(value);
    for (let key in value) {
      traversal(value[key], sets);
    }
    return value;
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
