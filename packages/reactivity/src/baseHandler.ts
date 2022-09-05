import { isObject } from "@vue/shared"
import { reactive } from './reactive'
import { track, trigger } from "./effect"

export const enum ReactiveFlags {
  IS_REACTIVE = '__V__isReactive'
}

export const mutableHandlers = {
  get(target:any, key:any, receiver:any){ // 在代理对象上取值
    // console.log('proxy get ', key, target[key])
    if(key === ReactiveFlags.IS_REACTIVE){
      return true
    }
    track(target, 'get', key)
    let reslult = Reflect.get(target, key, receiver) // 为了使target内部的this指向receiver 也就是proxy自己
    if(isObject(reslult)){ // 如果是对象 进行深度代理
      return reactive(reslult)
    }
    return reslult
  },
  set(target:any, key:any, value:any, receiver:any){ // 在代理对象上设置值
    // console.log('proxy set', key, value)
    let oldValue = target[key]
    let result = Reflect.set(target, key, value, receiver) // 先设置值
    if(oldValue != value){ // 值更新了
      trigger(target, 'set', key, value, oldValue)
    }
    return result
  }
}
