
interface EffectImpl{
  deps: Array<any>;
  run: () => void
}



export let activeEffect: any = null //当前的effect对象
class ReactiveEffect implements EffectImpl{
  public parent = null
  public active = true
  public deps = [] // 记录对应的dep name:Set age;Set
  constructor(public fn: any) { // 类似this.fn = fn

  }
  run() {
    if (!this.active) { // 如果不是激活状态 直接执行fn 不进行依赖收集
      return this.fn()
    }
    // 准备进行依赖收集 核心是将当前的effect 与 稍后渲染的属性关联在一起
    try {
      this.parent = activeEffect
      activeEffect = this
      // 每次执行前 先清空deps中的effect
      clearupEffect(this)

      return this.fn() // 稍后进行取值操作会关联全局的 activeEffect
    } finally {
      activeEffect = this.parent
    }
  }
}

export function effect(fn: any) {
  // fn可以根据状态变化 重新执行 创建响应式effect
  const _effect = new ReactiveEffect(fn)
  // 默认执行一次
  _effect.run()
}

const taregtMap = new WeakMap() //属性记录effect 对象的某个属性 存在多个effect >>>> {对象：{name: Set, age: Set}}
export function track(taregt:object, type:string, key:string) {
  if(!activeEffect) return // 没有在effect中引用的属性 不做依赖收集
  let depsMap = taregtMap.get(taregt) // WeakMap有没有target对象作为的key
  if(!depsMap){
    depsMap = new Map()
    taregtMap.set(taregt, depsMap)
  }
  let dep = depsMap.get(key) // target上的key
  if(!dep){
    dep = new Set()
    depsMap.set(key, dep)
  }
  let shouldTrack = !dep.has(activeEffect) // deps中可有已收集的ffect
  if(shouldTrack){
    dep.add(activeEffect)
    activeEffect.deps.push(dep) // 让effect记录 他被哪些属性收集
  }
}

// 数据更新 触发effect执行
export function trigger(target:any, type:string, key:string, value:any, oldValue:any){
  const depsMap = taregtMap.get(target)
  if(!depsMap) return // 触发更新的值 不在effect（模板）中
  let effects = depsMap.get(key)
  // 将effects拷贝一份 不用关联引用
  effects = new Set(effects)
  effects.forEach((effect: EffectImpl)=> {
    if(effect === activeEffect) return // 避免重复调用（在effect中更新依赖的属性） 进入死循环
    effect.run()
  });

}

function clearupEffect(effect: EffectImpl){
  let { deps } = effect
  deps.forEach(item => {
    item.delete(effect)
  })
  effect.deps.length = 0
  // console.log('effect.deps ', deps)
}

