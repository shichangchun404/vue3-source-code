import { isArray, isObject } from "@vue/shared"
import { reactive } from "./reactive"
import { trackEffects, triggerEffects } from "./effect"


function toReactive(value:any){
  return isObject(value)? reactive(value) : value
}

class RefImpl{
  private dep = new Set
  private _value
  public _v_isRef = true
  constructor(public rawValue:any){
    this._value = toReactive(rawValue)
  }

  get value(){
    trackEffects(this.dep)
    return this._value
  }
  set value(newValue){
    if(newValue !== this.rawValue){
      this._value = toReactive(newValue)
      triggerEffects(this.dep)
      this.rawValue = newValue
    }
    
  }
}

// 为了满足基本数据类型的依赖收集与响应式 返回一个RefImpl对象 通过.value取值触发依赖收集
// 对对象做了兼融处理
export function ref(rawValue:any){
  return new RefImpl(rawValue)
}

class ObjectRefImpl{
  constructor(public target:any, public key:any){}
  get value(){
    return this.target[this.key]
  }
  set value(newValue){
    this.target[this.key] = newValue
  }
}

// 返回一个新的对象 每个value的值是一个ObjectRefImpl 是对响应式对象做一层代理
export function toRefs(target:any){
  let result:any = isArray(target) ? new Array(target.length): {}
  for(let key in target){
    result[key] = toRef(target,key)
  }
  return result
}

export function toRef(target:any, key:any){
  return new ObjectRefImpl(target, key)
} 