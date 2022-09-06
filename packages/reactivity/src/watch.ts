import { isFunction, isObject } from "@vue/shared";
import { isReactive } from "./reactive";
import { ReactiveEffect } from "./effect";

export function watch(options:any,cb:Function){
  let getter: any
  let newValue: any
  let oldValue: any
  let cleanup: Function
  if(isFunction(options)){
    getter = options
  }else if(isReactive(options)){
    getter = () => traversal(options)
  }
  
  const onCleanup = (fn:Function)=>{
    cleanup = fn
  }

  const job = ()=>{
    newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }


  const effect = new ReactiveEffect(getter,job)
  oldValue = effect.run()

  
}

// 递归遍历对象的每个属性
function traversal(value:any, sets=new Set){
  // console.log('traversal start ... ', value)
  if(!isObject(value)) return value
  if(sets.has(value)){ // 避免循环引用 一个对象如果已经递归过了 直接退出
    console.log('对象如果已经递归过了 直接退出')
    return value
  }
  sets.add(value)
  for(let key in value){
    traversal(value[key],sets)
  }
  return value
}