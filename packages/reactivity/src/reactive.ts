import { isObject } from "@vue/shared";
import { mutableHandlers, ReactiveFlags } from "./baseHandler";

const reactiveMap = new WeakMap() // key是对象


export function reactive(target:any){
  if(!isObject(target)){
    return 
  }

  if(reactiveMap.get(target)){ // 同一个对象 只做一次代理
    return reactiveMap.get(target)
  }

  if(target[ReactiveFlags.IS_REACTIVE]){ //如果是代理对象 直接返回自己
    return target
  }

  let proxy:any = new Proxy(target, mutableHandlers)
  reactiveMap.set(target, proxy)

  return proxy
}

export function isReactive(value:any){
  return value && value[ReactiveFlags.IS_REACTIVE]
}