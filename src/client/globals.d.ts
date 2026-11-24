/**
 * 客户端类型补充：只放打包期才存在的模板块声明，不放任何运行时代码。
 *
 * 为什么要声明：`import CSS from './styles.css'` 在 bun 这边由
 * scripts/build-client.mjs 的 onLoad 插件改写成 `export default "<css 文本>"`，
 * 而 tsc 不认识 .css 模块，不声明就会报「找不到模块」。
 */
declare module '*.css' {
  const text: string
  export default text
}

/** 宿主注入的模块加载器（浏览器侧没有类型来源） */
interface Window {
  __ModuleLoader__?: {
    load: (def: { id: string; factory: (require: (id: string) => unknown) => unknown }) => void
  }
}
