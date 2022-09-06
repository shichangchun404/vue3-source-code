import { isObject } from "@vue/shared"
import { reactive } from "./reactive"
import { trackEffects, triggerEffects } from "./effect"


function toReactive(value:any){
  return isObject(value)? reactive(value) : value
}

class RefImpl{
  private dep = new Set
  private _value
  constructor(public rawValue:any){
    this._value = toReactive(rawValue)
  }

  get value(){
    trackEffects(this.dep)
    return this._value
  }
  set value(newValue){
    this._value = toReactive(newValue)
    triggerEffects(this.dep)
  }
}

export function ref(rawValue:any){
  return new RefImpl(rawValue)
}