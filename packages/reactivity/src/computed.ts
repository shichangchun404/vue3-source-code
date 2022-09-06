import { isFunction } from "@vue/shared";
import { ReactiveEffect, trackEffects, triggerEffects } from './effect'

class ComputedRefImpl{
  public effect
  public dep = new Set
  public _value:any
  public _dirty = true
  public _v_isRef = true
  constructor(getter:any, public setter:any){
    this.effect = new ReactiveEffect(getter,()=>{
      console.log('计算属性依赖的属性发生变化 ',this._dirty)
      // 当计算属性依赖的属性发生变化 执行此调度函数
      if(!this._dirty){
        this._dirty = true
        // 实现触发更新
        triggerEffects(this.dep)
      }
    })
  }
  // 类中的属性访问器 底层时Object.defineProperty
  get value(){
    // 计算属性取值时 进行[计算属性对应的effect]依赖收集 类似proxy中的getter
    trackEffects(this.dep)
    console.log('get value',this._dirty)
    if(this._dirty){
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
  set value(newValue){
    this.setter(newValue)
  }
  
}

export function computed(getterOrOptions:any){
  let getter
  let setter 
  const isGetter = isFunction(getterOrOptions)
  if(isGetter){
    getter = getterOrOptions
    setter = ()=>{}
  }else{
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter,setter)
}