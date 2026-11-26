// dsh-tencent-meeting · 浏览器半（由 scripts/build-client.mjs 生成，勿手改）
// 形态：宿主 __ModuleLoader__ 信封 + factory 内 return module.exports
window.__ModuleLoader__.load({ id: "dsh-tencent-meeting", factory: (require) => {
  'use strict'
  var module = { exports: {} }
  var exports = module.exports
  var __create = Object.create;
  var __getProtoOf = Object.getPrototypeOf;
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  function __accessProp(key) {
    return this[key];
  }
  var __toESMCache_node;
  var __toESMCache_esm;
  var __toESM = (mod, isNodeMode, target) => {
    var canCache = mod != null && typeof mod === "object";
    if (canCache) {
      var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
      var cached = cache.get(mod);
      if (cached)
        return cached;
    }
    target = mod != null ? __create(__getProtoOf(mod)) : {};
    const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
    for (let key of __getOwnPropNames(mod))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: __accessProp.bind(mod, key),
          enumerable: true
        });
    if (canCache)
      cache.set(mod, to);
    return to;
  };
  var __toCommonJS = (from) => {
    var entry = (__moduleCache ??= new WeakMap).get(from), desc;
    if (entry)
      return entry;
    entry = __defProp({}, "__esModule", { value: true });
    if (from && typeof from === "object" || typeof from === "function") {
      for (var key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(entry, key))
          __defProp(entry, key, {
            get: __accessProp.bind(from, key),
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
          });
    }
    __moduleCache.set(from, entry);
    return entry;
  };
  var __moduleCache;
  var __returnValue = (v) => v;
  function __exportSetter(name, newValue) {
    this[name] = __returnValue.bind(null, newValue);
  }
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {
        get: all[name],
        enumerable: true,
        configurable: true,
        set: __exportSetter.bind(all, name)
      });
  };

  // src/client/index.tsx
  var exports_client = {};
  __export(exports_client, {
    inject: () => inject,
    default: () => client_default,
    apply: () => apply
  });
  module.exports = __toCommonJS(exports_client);
  var React45 = __toESM(require("react"));

  // src/client/styles.css
  var styles_default = `/*\r
   * 腾讯会议面板 · 全部样式。\r
   *\r
   * 纪律（违反即返工）：\r
   *  1. 颜色只写 var(--dsw-alias-*, #兜底)：令牌在就跟宿主主题走，令牌改名最坏是外观降级，不会看不见；\r
   *  2. 字重只有 400 / 500，没有 600 / 700（宿主界面本身也只有这两档）；\r
   *  3. 布局用 grid / flex + min-width:0，窄面板（≤900px）单列，宽了才上两栏；\r
   *  4. 每个可点元素都有 :focus-visible；prefers-reduced-motion 下动效全关；\r
   *  5. 无 emoji，图形一律内联 SVG。\r
   */\r
  \r
  .tm-surface {\r
    position: relative;\r
    display: flex;\r
    flex-direction: column;\r
    height: 100%;\r
    min-height: 0;\r
    width: 100%;\r
    min-width: 0;\r
    overflow: hidden;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    background: var(--dsw-alias-bg-base, #fff);\r
    font-size: 14px;\r
    line-height: 1.6;\r
    /* 断点跟着「面板宽度」走，不跟窗口走：宿主能把面板拖到 380px，\r
       用 @media 时窗口还是 1440，两栏会被判成宽屏、挤成一坨。\r
       容器查询让同一份样式在「整页」和「侧栏」两种挂载方式下都对。 */\r
    container-type: inline-size;\r
    container-name: tm;\r
    -webkit-font-smoothing: antialiased;\r
  }\r
  \r
  .tm-surface *,\r
  .tm-surface *::before,\r
  .tm-surface *::after {\r
    box-sizing: border-box;\r
  }\r
  \r
  .tm-surface button {\r
    font: inherit;\r
    color: inherit;\r
    touch-action: manipulation;\r
  }\r
  \r
  .tm-surface input,\r
  .tm-surface textarea {\r
    font: inherit;\r
    color: inherit;\r
  }\r
  \r
  .tm-surface :focus-visible {\r
    outline: 2px solid var(--dsw-alias-brand-primary, #2563eb);\r
    outline-offset: 2px;\r
    border-radius: 6px;\r
  }\r
  \r
  /* ── 通用容器 ── */\r
  \r
  .tm-scroll {\r
    flex: 1;\r
    min-height: 0;\r
    overflow: auto;\r
    scrollbar-gutter: stable;\r
  }\r
  \r
  .tm-pad {\r
    padding: 16px 18px;\r
  }\r
  \r
  .tm-stack {\r
    display: flex;\r
    flex-direction: column;\r
    gap: 8px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-row {\r
    display: flex;\r
    align-items: center;\r
    gap: 8px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-row-between {\r
    display: flex;\r
    align-items: center;\r
    justify-content: space-between;\r
    gap: 12px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-grow {\r
    flex: 1;\r
    min-width: 0;\r
  }\r
  \r
  .tm-shrink0 {\r
    flex: none;\r
  }\r
  \r
  .tm-muted {\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
  }\r
  \r
  .tm-caption {\r
    color: var(--dsw-alias-label-tertiary, #9ca3af);\r
    font-size: 12px;\r
  }\r
  \r
  /* 所有会出现在同一条竖线上的数字都用等宽数字，避免「8 位变 9 位」时整行跳位 */\r
  .tm-kv dd,\r
  .tm-caption,\r
  .tm-version-num,\r
  .tm-empty-desc,\r
  .tm-output-body {\r
    font-variant-numeric: tabular-nums;\r
  }\r
  \r
  /* 实时同步档位徽标：只有形状+文字，不靠颜色单独表意 */\r
  .tm-sync-badge {\r
    display: inline-flex;\r
    align-items: center;\r
    gap: 6px;\r
    font-size: 12px;\r
    line-height: 18px;\r
    padding: 1px 8px;\r
    border-radius: 999px;\r
    border: 1px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    white-space: nowrap;\r
  }\r
  \r
  .tm-sync-badge .tm-led {\r
    width: 6px;\r
    height: 6px;\r
    border-radius: 50%;\r
    background: var(--dsw-alias-state-idle-primary, #9ca3af);\r
    flex: 0 0 auto;\r
  }\r
  \r
  .tm-sync-badge.is-live {\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    border-color: var(--dsw-alias-border-l2, #e5e7eb);\r
  }\r
  \r
  .tm-sync-badge.is-live .tm-led {\r
    background: var(--dsw-alias-state-success-primary, #059669);\r
  }\r
  \r
  .tm-sync-badge.is-degraded {\r
    color: var(--dsw-alias-state-warn-label, #b45309);\r
    border-color: var(--dsw-alias-state-warn-primary, #f59e0b);\r
  }\r
  \r
  .tm-sync-badge.is-degraded .tm-led {\r
    background: var(--dsw-alias-state-warn-primary, #f59e0b);\r
  }\r
  \r
  .tm-strong {\r
    font-weight: 500;\r
  }\r
  \r
  .tm-title {\r
    font-size: 16px;\r
    font-weight: 500;\r
    margin: 0;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  .tm-subtitle {\r
    font-size: 12px;\r
    margin: 2px 0 0;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
  }\r
  \r
  .tm-section-title {\r
    font-size: 12px;\r
    font-weight: 500;\r
    letter-spacing: 0.02em;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    margin: 0;\r
  }\r
  \r
  .tm-sep {\r
    height: 0;\r
    border: 0;\r
    border-top: 0.5px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));\r
    margin: 0;\r
  }\r
  \r
  /* ── 按钮 ── */\r
  \r
  .tm-btn {\r
    display: inline-flex;\r
    align-items: center;\r
    justify-content: center;\r
    gap: 6px;\r
    height: 34px;\r
    padding: 0 14px;\r
    border-radius: 8px;\r
    border: 0.5px solid transparent;\r
    background: transparent;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    font-size: 13px;\r
    font-weight: 500;\r
    cursor: pointer;\r
    white-space: nowrap;\r
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;\r
  }\r
  \r
  .tm-btn:disabled {\r
    cursor: default;\r
    opacity: 0.5;\r
  }\r
  \r
  .tm-btn.is-primary {\r
    background: var(--dsw-alias-button-primary-fill, #0f1115);\r
    color: var(--dsw-alias-label-primary-foreground, #fff);\r
    border-color: transparent;\r
  }\r
  \r
  /* 悬停要「更深一档」：原来用 button-primary-dimmed（浅色下是 #ebeef2），\r
     黑底白字的按钮一悬停整块翻白、白字消失。 */\r
  .tm-btn.is-primary:hover:not(:disabled) {\r
    background: var(--dsw-alias-button-primary-hover, #43454a);\r
    color: var(--dsw-alias-label-primary-foreground, #fff);\r
  }\r
  \r
  .tm-btn.is-ghost {\r
    background: var(--dsw-alias-bg-base, #fff);\r
    border-color: var(--dsw-alias-border-l2, #d1d5db);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  .tm-btn.is-ghost:hover:not(:disabled) {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
  }\r
  \r
  .tm-btn.is-subtle {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
    border-color: transparent;\r
  }\r
  \r
  .tm-btn.is-subtle:hover:not(:disabled) {\r
    background: var(--dsw-alias-interactive-bg-active, rgba(38, 49, 72, 0.1));\r
  }\r
  \r
  .tm-btn.is-text {\r
    height: 26px;\r
    padding: 0 6px;\r
    color: var(--dsw-alias-link, #4176e6);\r
    font-size: 12px;\r
  }\r
  \r
  .tm-btn.is-text:hover:not(:disabled) {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
  }\r
  \r
  .tm-btn.is-danger {\r
    background: var(--dsw-alias-state-error-primary, #dc2626);\r
    color: var(--dsw-alias-label-primary-foreground, #fff);\r
  }\r
  \r
  .tm-btn.is-danger:hover:not(:disabled) {\r
    filter: brightness(0.94);\r
  }\r
  \r
  .tm-btn.is-sm {\r
    height: 28px;\r
    padding: 0 10px;\r
    font-size: 12px;\r
    border-radius: 7px;\r
  }\r
  \r
  .tm-btn.is-lg {\r
    height: 38px;\r
    padding: 0 18px;\r
    font-size: 14px;\r
  }\r
  \r
  .tm-btn.is-block {\r
    width: 100%;\r
  }\r
  \r
  .tm-iconbtn {\r
    display: inline-flex;\r
    align-items: center;\r
    justify-content: center;\r
    width: 28px;\r
    height: 28px;\r
    padding: 0;\r
    border: none;\r
    border-radius: 7px;\r
    background: transparent;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    cursor: pointer;\r
    flex: none;\r
  }\r
  \r
  .tm-iconbtn:hover:not(:disabled) {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  .tm-iconbtn:disabled {\r
    cursor: default;\r
    opacity: 0.5;\r
  }\r
  \r
  /* ── 表单 ── */\r
  \r
  .tm-field {\r
    display: grid;\r
    gap: 5px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-label {\r
    font-size: 12px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
  }\r
  \r
  .tm-label .tm-req {\r
    color: var(--dsw-alias-state-error-primary, #dc2626);\r
    margin-left: 2px;\r
  }\r
  \r
  .tm-input,\r
  .tm-textarea {\r
    width: 100%;\r
    min-width: 0;\r
    padding: 7px 10px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #d1d5db);\r
    border-radius: 8px;\r
    background: var(--dsw-alias-bg-base, #fff);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    font-size: 13px;\r
  }\r
  \r
  .tm-input::placeholder,\r
  .tm-textarea::placeholder {\r
    color: var(--dsw-alias-label-caption, #9ca3af);\r
  }\r
  \r
  .tm-input:disabled,\r
  .tm-textarea:disabled {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
    cursor: default;\r
  }\r
  \r
  .tm-textarea.is-auto {\r
    resize: none;\r
    overflow-y: auto;\r
    min-height: 46px;\r
  }\r
  \r
  .tm-textarea {\r
    resize: vertical;\r
    min-height: 68px;\r
    line-height: 1.6;\r
  }\r
  \r
  .tm-hint {\r
    font-size: 11px;\r
    line-height: 1.6;\r
    color: var(--dsw-alias-label-tertiary, #9ca3af);\r
  }\r
  \r
  .tm-hint.is-warn {\r
    display: block;\r
    padding: 7px 10px;\r
    border-radius: 7px;\r
    border-left: 2px solid var(--dsw-alias-state-warn-primary, #f59e0b);\r
    background: var(--dsw-alias-state-warn-tertiary, #fef5e7);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  .tm-hint.is-err {\r
    color: var(--dsw-alias-state-error-primary, #dc2626);\r
  }\r
  \r
  .tm-grid2 {\r
    display: grid;\r
    grid-template-columns: minmax(0, 1fr);\r
    gap: 10px;\r
  }\r
  \r
  @container tm-dialog (min-width: 560px) {\r
    .tm-grid2 {\r
      grid-template-columns: repeat(2, minmax(0, 1fr));\r
    }\r
  }\r
  \r
  .tm-grid3 {\r
    display: grid;\r
    grid-template-columns: minmax(0, 1fr);\r
    gap: 10px;\r
  }\r
  \r
  @container tm-dialog (min-width: 560px) {\r
    .tm-grid3 {\r
      grid-template-columns: repeat(3, minmax(0, 1fr));\r
    }\r
  }\r
  \r
  /* ── 卡片 / 徽标 / 键值 ── */\r
  \r
  .tm-card {\r
    border: 0.5px solid var(--dsw-alias-border-l3, #e5e7eb);\r
    border-radius: 10px;\r
    background: var(--dsw-alias-bg-layer-1, #fff);\r
    min-width: 0;\r
  }\r
  \r
  .tm-card-h {\r
    display: flex;\r
    align-items: center;\r
    justify-content: space-between;\r
    gap: 10px;\r
    padding: 10px 12px;\r
    border-bottom: 0.5px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));\r
    min-width: 0;\r
  }\r
  \r
  .tm-card-b {\r
    padding: 12px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-kv {\r
    display: grid;\r
    grid-template-columns: minmax(76px, auto) minmax(0, 1fr);\r
    gap: 6px 12px;\r
    align-items: baseline;\r
    min-width: 0;\r
  }\r
  \r
  .tm-kv dt {\r
    font-size: 12px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    margin: 0;\r
  }\r
  \r
  .tm-kv dd {\r
    margin: 0;\r
    min-width: 0;\r
    font-size: 13px;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    overflow-wrap: anywhere;\r
  }\r
  \r
  .tm-badge {\r
    display: inline-flex;\r
    align-items: center;\r
    gap: 5px;\r
    height: 20px;\r
    padding: 0 7px;\r
    border-radius: 5px;\r
    font-size: 11px;\r
    font-weight: 500;\r
    line-height: 1;\r
    white-space: nowrap;\r
    border: 0.5px solid transparent;\r
    font-variant-numeric: tabular-nums;\r
  }\r
  \r
  /* 语义徽标：底色用会跟主题翻转的「三级淡底」，文字一律主文字色，不再额外挂小圆点。\r
     原来把 state-*-secondary 当底色、state-*-primary 当文字，两个都是亮色实心\r
     （#4ed17e 压 #22c55e），浅色主题下对比度只有 1.3:1，深色主题更是绿上叠绿。 */\r
  \r
  .tm-badge.is-muted {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
  }\r
  \r
  .tm-badge.is-brand {\r
    background: var(--dsw-alias-state-business-tertiary, #e4edfd);\r
    color: var(--dsw-alias-state-business-primary, #4176e6);\r
  }\r
  \r
  .tm-badge.is-ok {\r
    background: var(--dsw-alias-state-success-tertiary, #e6faed);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  .tm-badge.is-warn {\r
    background: var(--dsw-alias-state-warn-tertiary, #fef5e7);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  .tm-badge.is-err {\r
    background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #dc2626) 12%, transparent);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  /* ── 提示条 ── */\r
  \r
  .tm-banner {\r
    display: flex;\r
    align-items: flex-start;\r
    gap: 8px;\r
    padding: 9px 12px;\r
    border-radius: 8px;\r
    font-size: 12px;\r
    line-height: 1.6;\r
    min-width: 0;\r
  }\r
  \r
  /* 错误条：不要用高饱和整块红——那块红比内容还抢眼，看着像系统崩了。\r
     底色走中性（fill-l1），红只出现在左边框和图标上，做冗余强化。 */\r
  .tm-banner.is-err {\r
    background: var(--dsw-alias-interactive-bg-hover-solid, #f1f3f5);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    border-left: 2px solid var(--dsw-alias-state-error-primary, #dc2626);\r
  }\r
  \r
  .tm-banner.is-err .tm-banner-icon {\r
    color: var(--dsw-alias-state-error-primary, #b91c1c);\r
    flex: none;\r
    margin-top: 1px;\r
  }\r
  \r
  /* ── 过渡与加载：数据的等待必须看得见 ── */\r
  \r
  @keyframes tmFadeIn {\r
    from {\r
      opacity: 0;\r
      transform: translateY(3px);\r
    }\r
    to {\r
      opacity: 1;\r
      transform: none;\r
    }\r
  }\r
  \r
  .tm-fade-in {\r
    animation: tmFadeIn 0.22s ease backwards;\r
  }\r
  \r
  /* 三档节奏：\r
     - 整块切换（右侧详情、页签面板）用 tmRise：位移 6px + 淡入，能看出「换了一屏」但不晃；\r
     - 单行出现（列表插入、展开更多）用 tmRowIn：位移 2px，一屏几十行也不会一起飞；\r
     - 弹窗收尾用 tmPopOut / tmFadeOut：只缩 1%，重心稳。\r
     时长全部压在 120–240ms：超过 300ms 会被感知成「卡了一下」。 */\r
  @keyframes tmRise {\r
    from {\r
      opacity: 0;\r
      transform: translateY(6px);\r
    }\r
    to {\r
      opacity: 1;\r
      transform: none;\r
    }\r
  }\r
  \r
  @keyframes tmRowIn {\r
    from {\r
      opacity: 0;\r
      transform: translateY(2px);\r
    }\r
    to {\r
      opacity: 1;\r
      transform: none;\r
    }\r
  }\r
  \r
  @keyframes tmPopOut {\r
    from {\r
      opacity: 1;\r
      transform: translate(-50%, -50%) scale(1);\r
    }\r
    to {\r
      opacity: 0;\r
      transform: translate(-50%, calc(-50% + 4px)) scale(0.99);\r
    }\r
  }\r
  \r
  @keyframes tmFadeOut {\r
    from {\r
      opacity: 1;\r
    }\r
    to {\r
      opacity: 0;\r
    }\r
  }\r
  \r
  /* 骨架屏：比转圈更能说明「这里将要出现什么」 */\r
  @keyframes tmShimmer {\r
    0% {\r
      background-position: -240px 0;\r
    }\r
    100% {\r
      background-position: 240px 0;\r
    }\r
  }\r
  \r
  .tm-skeleton {\r
    border-radius: 6px;\r
    background: linear-gradient(\r
      90deg,\r
      var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.04)) 0%,\r
      var(--dsw-alias-interactive-bg-active, rgba(38, 49, 72, 0.1)) 50%,\r
      var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.04)) 100%\r
    );\r
    background-size: 480px 100%;\r
    animation: tmShimmer 1.15s linear infinite;\r
  }\r
  \r
  .tm-skeleton-row {\r
    display: flex;\r
    align-items: center;\r
    gap: 8px;\r
    padding: 9px 8px;\r
  }\r
  \r
  .tm-skeleton-line {\r
    height: 9px;\r
    border-radius: 4px;\r
  }\r
  \r
  /* 等待提示：细进度条，不明显但要能看见「在动」 */\r
  @keyframes tmSlide {\r
    0% {\r
      transform: translateX(-100%);\r
    }\r
    100% {\r
      transform: translateX(320%);\r
    }\r
  }\r
  \r
  .tm-progress {\r
    position: relative;\r
    height: 2px;\r
    overflow: hidden;\r
    border-radius: 2px;\r
    background: var(--dsw-alias-bg-skeleton, rgba(0, 0, 0, 0.05));\r
  }\r
  \r
  .tm-progress::after {\r
    content: '';\r
    position: absolute;\r
    inset: 0 auto 0 0;\r
    width: 30%;\r
    border-radius: 2px;\r
    background: var(--dsw-alias-brand-primary, #2563eb);\r
    animation: tmSlide 1.05s ease-in-out infinite;\r
  }\r
  \r
  @media (prefers-reduced-motion: reduce) {\r
    .tm-fade-in,\r
    .tm-skeleton,\r
    .tm-progress::after,\r
    .tm-led.is-live {\r
      animation: none !important;\r
    }\r
  }\r
  \r
  /* 警告条与错误条同一套纪律：极淡底 + 左侧色条 + 深色正文。\r
     原来把 warn-primary(#f59e0b) 直接当 11–12px 正文色压在淡黄底上，对比度 2.2:1 读不清。 */\r
  .tm-banner.is-warn {\r
    background: var(--dsw-alias-state-warn-tertiary, #fef5e7);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    border-left: 2px solid var(--dsw-alias-state-warn-primary, #f59e0b);\r
  }\r
  \r
  .tm-banner.is-warn .tm-banner-icon {\r
    color: var(--dsw-alias-state-warn-label, #dd8629);\r
    flex: none;\r
    margin-top: 1px;\r
  }\r
  \r
  /* 提示条右侧的重试按钮统一垂直居中，不要顶着第一行文字 */\r
  .tm-banner .tm-shrink0:last-child {\r
    align-self: center;\r
  }\r
  \r
  /* 错误的视觉规范见文件上方 .tm-banner.is-err（中性底 + 左侧红条）。\r
     这里不再覆盖，否则又变回整块高饱和红。 */\r
  \r
  .tm-banner .tm-grow {\r
    overflow-wrap: anywhere;\r
  }\r
  \r
  /* ── 主页：两栏 ── */\r
  \r
  .tm-home {\r
    display: flex;\r
    flex-direction: column;\r
    flex: 1;\r
    min-height: 0;\r
    /* 整页不滚：列表自己滚、详情自己滚。\r
       以前这里是 auto，窄面板下变成「外层滚动 + 内层滚动」两层滚动条，\r
       选完一场还要往下滚才看得到详情。 */\r
    overflow: hidden;\r
  }\r
  \r
  .tm-col-left {\r
    display: flex;\r
    flex-direction: column;\r
    min-width: 0;\r
    min-height: 0;\r
    flex: none;\r
    /* 单列时列表最多占 45% 高，剩下的留给详情，详情不会被挤到屏幕外。\r
       必须用百分比而不是 vh：vh 跟着窗口走，面板嵌进短侧栏时列表会吃掉整屏，\r
       详情被压到看不见——用户以为「点了没反应」。 */\r
    max-height: min(45%, 380px);\r
    border-bottom: 0.5px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));\r
  }\r
  \r
  .tm-col-right {\r
    display: flex;\r
    flex-direction: column;\r
    flex: 1;\r
    min-width: 0;\r
    min-height: 0;\r
    overflow: hidden;\r
  }\r
  \r
  @container tm (min-width: 901px) {\r
    .tm-home {\r
      flex-direction: row;\r
    }\r
  \r
    .tm-col-left {\r
      flex: 0 0 320px;\r
      min-width: 280px;\r
      max-height: none;\r
      border-bottom: 0;\r
      border-right: 0.5px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));\r
    }\r
  }\r
  \r
  .tm-col-head {\r
    display: flex;\r
    align-items: flex-start;\r
    justify-content: space-between;\r
    gap: 10px;\r
    padding: 14px 16px 10px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-left-body {\r
    flex: 1;\r
    min-height: 0;\r
    overflow: auto;\r
    padding: 0 12px 12px;\r
    display: flex;\r
    flex-direction: column;\r
    gap: 10px;\r
  }\r
  \r
  .tm-group-title {\r
    font-size: 11px;\r
    font-weight: 500;\r
    letter-spacing: 0.04em;\r
    color: var(--dsw-alias-label-tertiary, #9ca3af);\r
    margin: 6px 0 0;\r
    padding: 0 4px;\r
  }\r
  \r
  .tm-upcoming {\r
    display: grid;\r
    gap: 2px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-upcoming-item {\r
    display: flex;\r
    align-items: flex-start;\r
    gap: 8px;\r
    width: 100%;\r
    padding: 8px 8px;\r
    border: 0.5px solid transparent;\r
    border-radius: 8px;\r
    background: transparent;\r
    text-align: left;\r
    cursor: pointer;\r
    min-width: 0;\r
    /* 新插入的行（展开更多 / 同步回来）淡入；已在 DOM 里的行不会重放，所以不会闪 */\r
    animation: tmRowIn 0.18s ease both;\r
    transition: background-color 0.12s ease, border-color 0.12s ease;\r
  }\r
  \r
  .tm-upcoming-item:hover {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
  }\r
  \r
  .tm-upcoming-item.is-active {\r
    background: var(--dsw-alias-interactive-bg-active, rgba(38, 49, 72, 0.1));\r
    border-color: var(--dsw-alias-brand-primary, #2563eb);\r
  }\r
  \r
  /* 今日用量：中性底色的小胶囊，只在快用完 / 用完时换色，且同时有文字说明 */\r
  .tm-quota {\r
    font-size: 11px;\r
    line-height: 18px;\r
    padding: 0 7px;\r
    border-radius: 999px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    color: var(--dsw-alias-label-tertiary, #9ca3af);\r
    white-space: nowrap;\r
    font-variant-numeric: tabular-nums;\r
  }\r
  \r
  .tm-quota.is-low {\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    border-color: var(--dsw-alias-state-warn-primary, #d97706);\r
  }\r
  \r
  .tm-quota.is-out {\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    border-color: var(--dsw-alias-state-error-primary, #dc2626);\r
  }\r
  \r
  /* 切换会议：整块淡入 + 轻微上移，避免「旧的瞬间消失」。 */\r
  .tm-detail {\r
    animation: tmRise 0.22s cubic-bezier(0.22, 0.61, 0.36, 1) backwards;\r
  }\r
  \r
  /* 页签切换：Radix 只保留激活的内容节点，所以这里挂动画等于「每次切换都淡入」 */\r
  .tm-tabpanel > [role='tabpanel'] {\r
    animation: tmRise 0.2s cubic-bezier(0.22, 0.61, 0.36, 1) backwards;\r
  }\r
  \r
  /* 左侧列表工具条：搜索 + 只看有转写 */\r
  .tm-list-toolbar {\r
    display: flex;\r
    align-items: center;\r
    gap: 6px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-list-toolbar .tm-input {\r
    flex: 1;\r
    min-width: 0;\r
  }\r
  \r
  .tm-led {\r
    width: 7px;\r
    height: 7px;\r
    margin-top: 8px;\r
    border-radius: 50%;\r
    flex: none;\r
    background: var(--dsw-alias-state-idle-primary, #9ca3af);\r
  }\r
  \r
  .tm-led.is-live {\r
    background: var(--dsw-alias-state-success-primary, #059669);\r
    position: relative;\r
  }\r
  \r
  .tm-led.is-live::after {\r
    content: '';\r
    position: absolute;\r
    inset: -4px;\r
    border-radius: 50%;\r
    border: 1px solid var(--dsw-alias-state-success-primary, #059669);\r
    animation: tmBreathe 1.9s ease-in-out infinite;\r
  }\r
  \r
  @keyframes tmBreathe {\r
    0%,\r
    100% {\r
      opacity: 0.12;\r
      transform: scale(0.7);\r
    }\r
    50% {\r
      opacity: 0.55;\r
      transform: scale(1);\r
    }\r
  }\r
  \r
  .tm-item-text {\r
    min-width: 0;\r
    display: grid;\r
    gap: 1px;\r
  }\r
  \r
  .tm-item-name {\r
    font-size: 13px;\r
    font-weight: 500;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    overflow: hidden;\r
    text-overflow: ellipsis;\r
    white-space: nowrap;\r
  }\r
  \r
  .tm-item-meta {\r
    display: flex;\r
    align-items: center;\r
    flex-wrap: wrap;\r
    gap: 2px 8px;\r
    font-size: 11px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    min-width: 0;\r
    font-variant-numeric: tabular-nums;\r
  }\r
  \r
  .tm-item-meta > span {\r
    min-width: 0;\r
    overflow: hidden;\r
    text-overflow: ellipsis;\r
    white-space: nowrap;\r
  }\r
  \r
  .tm-left-foot {\r
    display: flex;\r
    align-items: center;\r
    gap: 8px;\r
    padding: 10px 14px;\r
    border-top: 0.5px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));\r
    font-size: 12px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    min-width: 0;\r
  }\r
  \r
  .tm-led-text {\r
    min-width: 0;\r
    overflow: hidden;\r
    text-overflow: ellipsis;\r
    white-space: nowrap;\r
  }\r
  \r
  .tm-right-head {\r
    display: flex;\r
    flex-wrap: wrap;\r
    align-items: center;\r
    justify-content: space-between;\r
    gap: 10px;\r
    padding: 14px 18px 10px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-sync {\r
    display: flex;\r
    align-items: center;\r
    gap: 8px;\r
    min-width: 0;\r
    flex-wrap: wrap;\r
  }\r
  \r
  .tm-list {\r
    display: flex;\r
    flex-direction: column;\r
    gap: 2px;\r
    padding: 0 10px 10px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-list-row {\r
    display: flex;\r
    align-items: center;\r
    gap: 10px;\r
    width: 100%;\r
    padding: 9px 10px;\r
    border: 0.5px solid transparent;\r
    border-radius: 8px;\r
    background: transparent;\r
    text-align: left;\r
    cursor: pointer;\r
    min-width: 0;\r
  }\r
  \r
  .tm-list-row:hover {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
  }\r
  \r
  .tm-list-row.is-active {\r
    background: var(--dsw-alias-interactive-bg-active, rgba(38, 49, 72, 0.1));\r
  }\r
  \r
  .tm-list-title {\r
    font-size: 13px;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    overflow: hidden;\r
    text-overflow: ellipsis;\r
    white-space: nowrap;\r
  }\r
  \r
  .tm-list-sub {\r
    display: flex;\r
    align-items: center;\r
    gap: 8px;\r
    font-size: 11px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    min-width: 0;\r
  }\r
  \r
  .tm-list-foot {\r
    display: flex;\r
    align-items: center;\r
    justify-content: space-between;\r
    gap: 10px;\r
    padding: 10px 18px 14px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-empty {\r
    display: grid;\r
    gap: 4px;\r
    padding: 26px 16px;\r
    text-align: center;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
  }\r
  \r
  .tm-empty-title {\r
    font-size: 13px;\r
    font-weight: 500;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    margin: 0;\r
  }\r
  \r
  .tm-empty-desc {\r
    font-size: 12px;\r
    margin: 0;\r
    line-height: 1.7;\r
  }\r
  \r
  .tm-empty-acts {\r
    display: flex;\r
    justify-content: center;\r
    gap: 8px;\r
    margin-top: 8px;\r
  }\r
  \r
  /* ── 引导屏 ── */\r
  \r
  .tm-guide {\r
    display: flex;\r
    flex-direction: column;\r
    align-items: center;\r
    justify-content: center;\r
    flex: 1;\r
    min-height: 0;\r
    overflow: auto;\r
    padding: 32px 24px;\r
    text-align: center;\r
  }\r
  \r
  .tm-guide-inner {\r
    width: min(520px, 100%);\r
    display: grid;\r
    gap: 0;\r
    justify-items: center;\r
  }\r
  \r
  .tm-guide-ico {\r
    width: 56px;\r
    height: 56px;\r
    border-radius: 14px;\r
    display: inline-flex;\r
    align-items: center;\r
    justify-content: center;\r
    margin-bottom: 14px;\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
    color: var(--dsw-alias-brand-primary, #2563eb);\r
    border: 0.5px solid var(--dsw-alias-border-l3, #e5e7eb);\r
  }\r
  \r
  .tm-guide-ico.is-warn {\r
    color: var(--dsw-alias-state-warn-primary, #b45309);\r
    background: var(--dsw-alias-state-warn-tertiary, #fffbeb);\r
  }\r
  \r
  .tm-guide-title {\r
    font-size: 17px;\r
    font-weight: 500;\r
    margin: 0;\r
  }\r
  \r
  .tm-guide-desc {\r
    font-size: 13px;\r
    line-height: 1.8;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    margin: 6px 0 0;\r
  }\r
  \r
  .tm-guide-acts {\r
    display: flex;\r
    flex-wrap: wrap;\r
    gap: 8px;\r
    justify-content: center;\r
    margin-top: 20px;\r
  }\r
  \r
  .tm-guide-code {\r
    margin-top: 18px;\r
    width: 100%;\r
    text-align: left;\r
    border: 0.5px solid var(--dsw-alias-border-l3, #e5e7eb);\r
    border-radius: 8px;\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
    padding: 10px 12px;\r
    display: grid;\r
    gap: 4px;\r
  }\r
  \r
  .tm-guide-code code {\r
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
    font-size: 12px;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    overflow-wrap: anywhere;\r
  }\r
  \r
  .tm-version-row {\r
    display: flex;\r
    align-items: center;\r
    gap: 10px;\r
    justify-content: center;\r
    margin-top: 12px;\r
    flex-wrap: wrap;\r
    font-size: 12px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
  }\r
  \r
  .tm-version-num {\r
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\r
    font-size: 12px;\r
    padding: 1px 6px;\r
    border-radius: 4px;\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  /* ── 详情页 ── */\r
  \r
  .tm-detail {\r
    display: flex;\r
    flex-direction: column;\r
    flex: 1;\r
    min-height: 0;\r
    min-width: 0;\r
    overflow: hidden;\r
  }\r
  \r
  .tm-detail-head {\r
    display: flex;\r
    align-items: flex-start;\r
    gap: 10px;\r
    padding: 12px 18px 8px;\r
    border-bottom: 0.5px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));\r
    min-width: 0;\r
  }\r
  \r
  .tm-detail-title {\r
    font-size: 16px;\r
    font-weight: 500;\r
    margin: 0;\r
    min-width: 0;\r
    overflow: hidden;\r
    text-overflow: ellipsis;\r
    white-space: nowrap;\r
  }\r
  \r
  .tm-detail-meta {\r
    display: flex;\r
    flex-wrap: wrap;\r
    align-items: center;\r
    gap: 8px;\r
    margin-top: 3px;\r
    font-size: 12px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    min-width: 0;\r
  }\r
  \r
  .tm-detail-body {\r
    display: flex;\r
    flex-direction: column;\r
    flex: 1;\r
    min-height: 0;\r
    overflow: hidden;\r
  }\r
  \r
  @container tm (min-width: 901px) {\r
    .tm-detail-body {\r
      flex-direction: row;\r
    }\r
  }\r
  \r
  .tm-detail-main {\r
    display: flex;\r
    flex-direction: column;\r
    flex: 1;\r
    min-width: 0;\r
    min-height: 0;\r
    overflow: hidden;\r
  }\r
  \r
  .tm-tabpanel {\r
    flex: 1;\r
    min-height: 0;\r
    overflow: auto;\r
    padding: 14px 18px 28px;\r
    scrollbar-gutter: stable;\r
  }\r
  \r
  /* 右侧目录：常驻占位、悬停浮出、不覆盖正文 */\r
  \r
  .tm-toc {\r
    display: none;\r
  }\r
  \r
  @container tm (min-width: 901px) {\r
    .tm-toc {\r
      display: flex;\r
      flex-direction: column;\r
      flex: 0 0 200px;\r
      width: 200px;\r
      min-width: 0;\r
      border-left: 0.5px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));\r
      padding: 12px 8px;\r
      overflow: auto;\r
      scrollbar-gutter: stable;\r
    }\r
  }\r
  \r
  .tm-toc-head {\r
    font-size: 11px;\r
    font-weight: 500;\r
    letter-spacing: 0.04em;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    padding: 0 6px 6px;\r
  }\r
  \r
  .tm-toc-panel {\r
    display: grid;\r
    gap: 1px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-toc-group {\r
    display: grid;\r
    gap: 1px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-toc-grouphead {\r
    display: flex;\r
    align-items: center;\r
    gap: 4px;\r
    width: 100%;\r
    padding: 4px 6px;\r
    border: none;\r
    border-radius: 6px;\r
    background: transparent;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    font-size: 11px;\r
    font-weight: 500;\r
    text-align: left;\r
    cursor: pointer;\r
    min-width: 0;\r
  }\r
  \r
  .tm-toc-grouphead:hover {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  .tm-toc-item {\r
    display: block;\r
    width: 100%;\r
    padding: 4px 6px 4px 14px;\r
    border: none;\r
    border-radius: 6px;\r
    background: transparent;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    font-size: 12px;\r
    text-align: left;\r
    cursor: pointer;\r
    min-width: 0;\r
    overflow: hidden;\r
    text-overflow: ellipsis;\r
    white-space: nowrap;\r
  }\r
  \r
  .tm-toc-item:hover {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  .tm-toc-item.is-on {\r
    color: var(--dsw-alias-brand-primary, #2563eb);\r
    background: var(--dsw-alias-interactive-bg-active, rgba(38, 49, 72, 0.1));\r
  }\r
  \r
  /* ── 页签 ── */\r
  \r
  .tm-tabs-root {\r
    display: flex;\r
    flex-direction: column;\r
    flex: 1;\r
    min-height: 0;\r
    min-width: 0;\r
  }\r
  \r
  .tm-tablist {\r
    display: flex;\r
    flex-wrap: wrap;\r
    gap: 0 2px;\r
    padding: 0 18px;\r
    border-bottom: 0.5px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));\r
    overflow-x: auto;\r
    scrollbar-width: none;\r
    flex: none;\r
  }\r
  \r
  .tm-tablist::-webkit-scrollbar {\r
    display: none;\r
  }\r
  \r
  .tm-tab {\r
    appearance: none;\r
    border: none;\r
    background: none;\r
    cursor: pointer;\r
    padding: 9px 10px;\r
    font-size: 13px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    border-bottom: 2px solid transparent;\r
    white-space: nowrap;\r
    flex: none;\r
    transition: color 0.12s ease, border-color 0.12s ease;\r
  }\r
  \r
  .tm-tab:hover:not(:disabled) {\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  .tm-tab[data-state='active'] {\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    border-bottom-color: var(--dsw-alias-brand-primary, #2563eb);\r
    font-weight: 500;\r
  }\r
  \r
  .tm-tab:disabled {\r
    color: var(--dsw-alias-label-caption, #9ca3af);\r
    cursor: default;\r
  }\r
  \r
  /* ── 参会人 ── */\r
  \r
  .tm-people {\r
    display: grid;\r
    gap: 2px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-person {\r
    animation: tmRowIn 0.16s ease both;\r
    display: grid;\r
    grid-template-columns: 36px minmax(0, 1fr) auto;\r
    grid-template-rows: auto auto;\r
    column-gap: 10px;\r
    row-gap: 0;\r
    align-items: center;\r
    padding: 8px 8px;\r
    border-radius: 8px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-person:hover {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
  }\r
  \r
  .tm-avatar {\r
    grid-row: 1 / span 2;\r
    width: 36px;\r
    height: 36px;\r
    border-radius: 50%;\r
    display: inline-flex;\r
    align-items: center;\r
    justify-content: center;\r
    background: var(--dsw-alias-interactive-bg-active, rgba(38, 49, 72, 0.1));\r
    color: var(--dsw-alias-brand-primary, #2563eb);\r
    font-size: 13px;\r
    font-weight: 500;\r
    flex: none;\r
  }\r
  \r
  .tm-person-main {\r
    display: flex;\r
    align-items: baseline;\r
    gap: 8px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-person-name {\r
    font-size: 13px;\r
    font-weight: 500;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    overflow: hidden;\r
    text-overflow: ellipsis;\r
    white-space: nowrap;\r
  }\r
  \r
  .tm-person-org {\r
    font-size: 11px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    overflow: hidden;\r
    text-overflow: ellipsis;\r
    white-space: nowrap;\r
    min-width: 0;\r
  }\r
  \r
  .tm-person-view {\r
    grid-column: 2;\r
    font-size: 11px;\r
    line-height: 1.6;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    min-width: 0;\r
    overflow-wrap: anywhere;\r
  }\r
  \r
  .tm-person-acts {\r
    grid-column: 3;\r
    grid-row: 1 / span 2;\r
    display: flex;\r
    align-items: center;\r
    gap: 2px;\r
    flex: none;\r
  }\r
  \r
  /* ── 正文内容（逐字稿 / 纪要） ── */\r
  \r
  .tm-content {\r
    display: grid;\r
    gap: 2px;\r
    max-width: 860px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-chunk {\r
    animation: tmRowIn 0.16s ease both;\r
    display: grid;\r
    grid-template-columns: minmax(0, 1fr);\r
    gap: 1px;\r
    padding: 6px 8px;\r
    border-radius: 6px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-chunk:target,\r
  .tm-chunk.is-on {\r
    background: var(--dsw-alias-interactive-bg-active, rgba(38, 49, 72, 0.1));\r
  }\r
  \r
  .tm-chunk-meta {\r
    display: flex;\r
    align-items: baseline;\r
    gap: 8px;\r
    font-size: 11px;\r
    color: var(--dsw-alias-label-tertiary, #9ca3af);\r
    min-width: 0;\r
  }\r
  \r
  .tm-speaker {\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    font-weight: 500;\r
    font-size: 12px;\r
  }\r
  \r
  .tm-chunk-text {\r
    font-size: 13px;\r
    line-height: 1.75;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    overflow-wrap: anywhere;\r
    white-space: pre-wrap;\r
    margin: 0;\r
  }\r
  \r
  .tm-plain {\r
    font-size: 13px;\r
    line-height: 1.8;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    white-space: pre-wrap;\r
    overflow-wrap: anywhere;\r
    margin: 0;\r
    max-width: 860px;\r
  }\r
  \r
  /* ── 会后产出 ── */\r
  \r
  .tm-outputs {\r
    display: grid;\r
    grid-template-columns: minmax(0, 1fr);\r
    gap: 10px;\r
  }\r
  \r
  @container tm (min-width: 720px) {\r
    .tm-outputs {\r
      grid-template-columns: repeat(2, minmax(0, 1fr));\r
    }\r
  }\r
  \r
  .tm-output {\r
    display: flex;\r
    flex-direction: column;\r
    gap: 6px;\r
    padding: 12px;\r
    border: 0.5px solid var(--dsw-alias-border-l3, #e5e7eb);\r
    border-radius: 10px;\r
    min-width: 0;\r
    background: var(--dsw-alias-bg-layer-1, #fff);\r
  }\r
  \r
  .tm-output-title {\r
    font-size: 13px;\r
    font-weight: 500;\r
    margin: 0;\r
  }\r
  \r
  .tm-output-body {\r
    font-size: 12px;\r
    line-height: 1.75;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    white-space: pre-wrap;\r
    overflow-wrap: anywhere;\r
    max-height: 260px;\r
    overflow: auto;\r
    margin: 0;\r
  }\r
  \r
  /* AI 生成中的笔：必须动（静态就是 BUG） */\r
  \r
  .tm-pen {\r
    color: var(--dsw-alias-brand-primary, #2563eb);\r
    animation: tmPenFade 1.6s ease-in-out infinite;\r
  }\r
  \r
  .tm-pen path {\r
    stroke-dasharray: 22;\r
    stroke-dashoffset: 22;\r
    animation: tmPenDraw 1.1s ease-in-out infinite;\r
  }\r
  \r
  @keyframes tmPenDraw {\r
    0% {\r
      stroke-dashoffset: 22;\r
    }\r
    55%,\r
    100% {\r
      stroke-dashoffset: 0;\r
    }\r
  }\r
  \r
  @keyframes tmPenFade {\r
    0%,\r
    100% {\r
      opacity: 0.55;\r
    }\r
    50% {\r
      opacity: 1;\r
    }\r
  }\r
  \r
  /* ── 加载中转圈 ── */\r
  \r
  .tm-spinner {\r
    width: 13px;\r
    height: 13px;\r
    flex: none;\r
    border-radius: 50%;\r
    border: 2px solid var(--dsw-alias-border-l3, #e5e7eb);\r
    border-top-color: var(--dsw-alias-brand-primary, #2563eb);\r
    animation: tmSpin 0.7s linear infinite;\r
  }\r
  \r
  @keyframes tmSpin {\r
    to {\r
      transform: rotate(360deg);\r
    }\r
  }\r
  \r
  .tm-loading-row {\r
    display: flex;\r
    align-items: center;\r
    gap: 8px;\r
    padding: 16px 8px;\r
    font-size: 12px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
  }\r
  \r
  /* 整页只有一行「正在检测…」时居中显示：\r
     原来它贴在 1136×808 空白区的左上角，第一眼像渲染失败了。 */\r
  .tm-scroll > .tm-loading-row:only-child {\r
    height: 100%;\r
    flex-direction: column;\r
    justify-content: center;\r
    align-items: center;\r
    gap: 10px;\r
    font-size: 13px;\r
  }\r
  \r
  /* ── 弹窗（Radix Dialog） ── */\r
  \r
  .tm-overlay {\r
    position: fixed;\r
    inset: 0;\r
    z-index: 60;\r
    background: var(--dsw-alias-bg-mask-3, rgba(0, 0, 0, 0.48));\r
    animation: tmFade 0.16s ease-out both;\r
  }\r
  \r
  .tm-dialog {\r
    /* 弹窗 portal 到 body，不在 .tm-surface 容器内：自己声明一个容器，\r
       里面的两列/三列排版才能继续按「弹窗宽度」判断断点。 */\r
    container-type: inline-size;\r
    container-name: tm-dialog;\r
    position: fixed;\r
    z-index: 61;\r
    left: 50%;\r
    top: 50%;\r
    transform: translate(-50%, -50%);\r
    width: min(560px, calc(100vw - 32px));\r
    max-height: calc(100vh - 48px);\r
    display: flex;\r
    flex-direction: column;\r
    background: var(--dsw-alias-bg-base, #fff);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    border-radius: 14px;\r
    box-shadow: 0 20px 56px rgba(16, 24, 40, 0.26);\r
    overflow: hidden;\r
    animation: tmPop 0.18s cubic-bezier(0.16, 0.84, 0.32, 1) both;\r
  }\r
  \r
  .tm-dialog.is-wide {\r
    width: min(720px, calc(100vw - 32px));\r
  }\r
  \r
  @keyframes tmFade {\r
    from {\r
      opacity: 0;\r
    }\r
    to {\r
      opacity: 1;\r
    }\r
  }\r
  \r
  @keyframes tmPop {\r
    from {\r
      opacity: 0;\r
      transform: translate(-50%, calc(-50% + 8px)) scale(0.99);\r
    }\r
    to {\r
      opacity: 1;\r
      transform: translate(-50%, -50%) scale(1);\r
    }\r
  }\r
  \r
  /* 关闭也要有动画：原来只有进场，点 × 时弹窗是「啪」一下消失的。\r
     Radix 的 Presence 会等 animationend 再卸载，所以 data-state=closed 上挂关键帧就能生效。 */\r
  .tm-dialog[data-state='closed'] {\r
    animation: tmPopOut 0.14s ease-in both;\r
  }\r
  \r
  .tm-overlay[data-state='closed'] {\r
    animation: tmFadeOut 0.14s ease-in both;\r
  }\r
  \r
  .tm-sel-content[data-state='closed'],\r
  .tm-menu-content[data-state='closed'] {\r
    animation: tmFadeOut 0.12s ease-in both;\r
  }\r
  \r
  .tm-dialog-h {\r
    display: flex;\r
    align-items: flex-start;\r
    gap: 10px;\r
    padding: 14px 16px 10px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-dialog-title {\r
    font-size: 15px;\r
    font-weight: 500;\r
    margin: 0;\r
    min-width: 0;\r
  }\r
  \r
  .tm-dialog-desc {\r
    font-size: 12px;\r
    line-height: 1.7;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    margin: 3px 0 0;\r
  }\r
  \r
  .tm-dialog-b {\r
    padding: 0 16px 12px;\r
    overflow: auto;\r
    min-height: 0;\r
    display: grid;\r
    gap: 12px;\r
  }\r
  \r
  .tm-dialog-f {\r
    display: flex;\r
    align-items: center;\r
    justify-content: space-between;\r
    gap: 10px;\r
    padding: 11px 16px;\r
    border-top: 0.5px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));\r
    background: var(--dsw-alias-bg-layer-1, #fafafa);\r
    min-width: 0;\r
  }\r
  \r
  .tm-dialog-f .tm-grow {\r
    font-size: 11px;\r
    color: var(--dsw-alias-label-tertiary, #9ca3af);\r
  }\r
  \r
  .tm-dialog-acts {\r
    display: flex;\r
    gap: 8px;\r
    flex: none;\r
    flex-wrap: wrap;\r
    justify-content: flex-end;\r
  }\r
  \r
  /* ── 建会弹窗步骤 ── */\r
  \r
  .tm-steps {\r
    display: flex;\r
    align-items: center;\r
    gap: 6px;\r
    flex-wrap: wrap;\r
    min-width: 0;\r
  }\r
  \r
  .tm-step {\r
    display: inline-flex;\r
    align-items: center;\r
    gap: 5px;\r
    font-size: 11px;\r
    color: var(--dsw-alias-label-tertiary, #9ca3af);\r
  }\r
  \r
  .tm-step-num {\r
    width: 16px;\r
    height: 16px;\r
    border-radius: 50%;\r
    display: inline-flex;\r
    align-items: center;\r
    justify-content: center;\r
    font-size: 10px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #d1d5db);\r
    color: inherit;\r
  }\r
  \r
  .tm-step.is-on {\r
    color: var(--dsw-alias-brand-primary, #2563eb);\r
  }\r
  \r
  .tm-step.is-on .tm-step-num {\r
    border-color: var(--dsw-alias-brand-primary, #2563eb);\r
    background: var(--dsw-alias-brand-primary, #2563eb);\r
    color: var(--dsw-alias-label-primary-inverted, #fff);\r
  }\r
  \r
  .tm-step.is-done .tm-step-num {\r
    border-color: var(--dsw-alias-state-success-primary, #059669);\r
    color: var(--dsw-alias-state-success-primary, #059669);\r
  }\r
  \r
  .tm-types {\r
    display: grid;\r
    grid-template-columns: minmax(0, 1fr);\r
    gap: 8px;\r
  }\r
  \r
  /* 5 张卡放进 2 列时，最后一张单独占半行像没画完；奇数个就让它通栏 */\r
  .tm-types > :last-child:nth-child(odd) {\r
    grid-column: 1 / -1;\r
  }\r
  \r
  @container tm-dialog (min-width: 560px) {\r
    .tm-types {\r
      grid-template-columns: repeat(2, minmax(0, 1fr));\r
    }\r
  }\r
  \r
  .tm-type-card {\r
    display: flex;\r
    align-items: flex-start;\r
    gap: 10px;\r
    padding: 11px 12px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    border-radius: 10px;\r
    background: var(--dsw-alias-bg-base, #fff);\r
    text-align: left;\r
    cursor: pointer;\r
    min-width: 0;\r
  }\r
  \r
  .tm-type-card:hover {\r
    border-color: var(--dsw-alias-brand-primary, #2563eb);\r
    background: var(--dsw-alias-interactive-bg-active, rgba(38, 49, 72, 0.1));\r
  }\r
  \r
  .tm-type-ico {\r
    width: 30px;\r
    height: 30px;\r
    border-radius: 8px;\r
    display: inline-flex;\r
    align-items: center;\r
    justify-content: center;\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    flex: none;\r
  }\r
  \r
  .tm-type-name {\r
    font-size: 13px;\r
    font-weight: 500;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  .tm-type-desc {\r
    font-size: 11px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    line-height: 1.6;\r
  }\r
  \r
  /* ── 标签输入 ── */\r
  \r
  .tm-tagbox {\r
    display: flex;\r
    flex-wrap: wrap;\r
    align-items: center;\r
    gap: 6px;\r
    padding: 6px 8px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #d1d5db);\r
    border-radius: 8px;\r
    background: var(--dsw-alias-bg-base, #fff);\r
    min-width: 0;\r
  }\r
  \r
  .tm-tagbox:focus-within {\r
    border-color: var(--dsw-alias-brand-primary, #2563eb);\r
  }\r
  \r
  .tm-tagbox input {\r
    flex: 1;\r
    min-width: 90px;\r
    border: none;\r
    outline: none;\r
    background: transparent;\r
    font-size: 13px;\r
    padding: 2px 0;\r
  }\r
  \r
  .tm-tag-chip {\r
    display: inline-flex;\r
    align-items: center;\r
    gap: 3px;\r
    height: 22px;\r
    padding: 0 4px 0 7px;\r
    border-radius: 5px;\r
    background: var(--dsw-alias-interactive-bg-active, rgba(38, 49, 72, 0.1));\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    font-size: 12px;\r
    max-width: 100%;\r
  }\r
  \r
  .tm-tag-chip span {\r
    overflow: hidden;\r
    text-overflow: ellipsis;\r
    white-space: nowrap;\r
  }\r
  \r
  .tm-tag-x {\r
    display: inline-flex;\r
    align-items: center;\r
    justify-content: center;\r
    width: 16px;\r
    height: 16px;\r
    border: none;\r
    border-radius: 4px;\r
    background: transparent;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    cursor: pointer;\r
    flex: none;\r
  }\r
  \r
  .tm-tag-x:hover {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  /* ── 预览表 ── */\r
  \r
  .tm-preview {\r
    display: grid;\r
    gap: 0;\r
    border: 0.5px solid var(--dsw-alias-border-l3, #e5e7eb);\r
    border-radius: 10px;\r
    overflow: hidden;\r
  }\r
  \r
  .tm-preview-row {\r
    display: grid;\r
    grid-template-columns: minmax(88px, 34%) minmax(0, 1fr);\r
    gap: 10px;\r
    padding: 7px 11px;\r
    border-top: 0.5px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));\r
    font-size: 12px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-preview-row:first-child {\r
    border-top: 0;\r
  }\r
  \r
  .tm-preview-row dt {\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    margin: 0;\r
  }\r
  \r
  .tm-preview-row dd {\r
    margin: 0;\r
    min-width: 0;\r
    overflow-wrap: anywhere;\r
  }\r
  \r
  .tm-preview-row:nth-child(even) {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
  }\r
  \r
  /* ── 下拉（原生 select，设置页用） ── */\r
  \r
  .tm-sel-wrap {\r
    position: relative;\r
    display: block;\r
  }\r
  \r
  .tm-sel-trigger {\r
    display: inline-flex;\r
    align-items: center;\r
    justify-content: space-between;\r
    gap: 8px;\r
    width: 100%;\r
    min-width: 0;\r
    height: 32px;\r
    padding: 0 30px 0 9px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #d1d5db);\r
    border-radius: 8px;\r
    background: var(--dsw-alias-bg-base, #fff);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    font-size: 13px;\r
    font-family: inherit;\r
    cursor: pointer;\r
    text-align: left;\r
    appearance: none;\r
    -webkit-appearance: none;\r
  }\r
  \r
  .tm-sel-trigger:hover:not(:disabled) {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
  }\r
  \r
  .tm-sel-trigger:disabled {\r
    opacity: 0.55;\r
    cursor: default;\r
  }\r
  \r
  .tm-sel-arrow {\r
    position: absolute;\r
    right: 9px;\r
    top: 50%;\r
    transform: translateY(-50%);\r
    display: inline-flex;\r
    color: var(--dsw-alias-label-tertiary, #9ca3af);\r
    pointer-events: none;\r
  }\r
  \r
  .tm-sel-content {\r
    z-index: 70;\r
    min-width: var(--radix-select-trigger-width);\r
    max-height: min(320px, var(--radix-select-content-available-height, 320px));\r
    overflow: hidden;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    border-radius: 9px;\r
    background: var(--dsw-alias-bg-base, #fff);\r
    box-shadow: 0 12px 32px rgba(16, 24, 40, 0.18);\r
    animation: tmFade 0.12s ease-out both;\r
  }\r
  \r
  .tm-sel-viewport {\r
    padding: 4px;\r
    overflow: auto;\r
    max-height: 300px;\r
  }\r
  \r
  .tm-sel-item {\r
    display: flex;\r
    align-items: center;\r
    gap: 6px;\r
    padding: 6px 8px;\r
    border-radius: 6px;\r
    font-size: 13px;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    cursor: pointer;\r
    outline: none;\r
    user-select: none;\r
    min-width: 0;\r
  }\r
  \r
  .tm-sel-item[data-highlighted] {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
  }\r
  \r
  .tm-sel-item[data-disabled] {\r
    color: var(--dsw-alias-label-caption, #9ca3af);\r
    cursor: default;\r
  }\r
  \r
  .tm-sel-item-text {\r
    min-width: 0;\r
    overflow: hidden;\r
    text-overflow: ellipsis;\r
    white-space: nowrap;\r
  }\r
  \r
  .tm-menu-content {\r
    z-index: 70;\r
    min-width: 168px;\r
    padding: 4px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    border-radius: 9px;\r
    background: var(--dsw-alias-bg-base, #fff);\r
    box-shadow: 0 12px 32px rgba(16, 24, 40, 0.18);\r
    animation: tmFade 0.12s ease-out both;\r
  }\r
  \r
  .tm-menu-item {\r
    display: flex;\r
    align-items: center;\r
    gap: 7px;\r
    padding: 6px 8px;\r
    border-radius: 6px;\r
    font-size: 13px;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    cursor: pointer;\r
    outline: none;\r
    user-select: none;\r
  }\r
  \r
  .tm-menu-item[data-highlighted] {\r
    background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\r
  }\r
  \r
  .tm-menu-item[data-disabled] {\r
    color: var(--dsw-alias-label-caption, #9ca3af);\r
    cursor: default;\r
  }\r
  \r
  .tm-menu-item.is-danger {\r
    color: var(--dsw-alias-state-error-primary, #dc2626);\r
  }\r
  \r
  .tm-menu-sep {\r
    height: 1px;\r
    margin: 4px 2px;\r
    background: var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));\r
  }\r
  \r
  .tm-menu-label {\r
    padding: 5px 8px 3px;\r
    font-size: 11px;\r
    color: var(--dsw-alias-label-tertiary, #9ca3af);\r
  }\r
  \r
  /* ── 开关 / 复选（Radix Switch + 原生 checkbox） ── */\r
  \r
  .tm-switch-row {\r
    display: flex;\r
    align-items: flex-start;\r
    justify-content: space-between;\r
    gap: 12px;\r
    padding: 8px 0;\r
    min-width: 0;\r
  }\r
  \r
  .tm-switch-text {\r
    min-width: 0;\r
  }\r
  \r
  .tm-switch-title {\r
    font-size: 13px;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  .tm-switch-desc {\r
    font-size: 11px;\r
    line-height: 1.6;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    margin-top: 1px;\r
  }\r
  \r
  .tm-switch {\r
    position: relative;\r
    width: 36px;\r
    height: 20px;\r
    flex: none;\r
    border-radius: 10px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #d1d5db);\r
    background: var(--dsw-alias-interactive-bg-active, rgba(38, 49, 72, 0.1));\r
    cursor: pointer;\r
    padding: 0;\r
    transition: background 0.15s ease, border-color 0.15s ease;\r
  }\r
  \r
  .tm-switch[data-state='checked'] {\r
    background: var(--dsw-alias-brand-primary, #2563eb);\r
    border-color: var(--dsw-alias-brand-primary, #2563eb);\r
  }\r
  \r
  .tm-switch:disabled {\r
    opacity: 0.5;\r
    cursor: default;\r
  }\r
  \r
  .tm-switch-thumb {\r
    display: block;\r
    width: 16px;\r
    height: 16px;\r
    border-radius: 50%;\r
    background: var(--dsw-alias-label-primary-foreground, #fff);\r
    transform: translateX(2px);\r
    transition: transform 0.15s ease;\r
    will-change: transform;\r
  }\r
  \r
  .tm-switch[data-state='checked'] .tm-switch-thumb {\r
    transform: translateX(18px);\r
  }\r
  \r
  .tm-check {\r
    width: 14px;\r
    height: 14px;\r
    flex: none;\r
    accent-color: var(--dsw-alias-brand-primary, #2563eb);\r
    margin: 2px 0 0;\r
    cursor: pointer;\r
  }\r
  \r
  /* ── Toast ── */\r
  \r
  .tm-toasts {\r
    position: fixed;\r
    left: 50%;\r
    bottom: 24px;\r
    transform: translateX(-50%);\r
    z-index: 80;\r
    display: grid;\r
    gap: 8px;\r
    justify-items: center;\r
    pointer-events: none;\r
    width: min(460px, calc(100vw - 32px));\r
  }\r
  \r
  .tm-toast {\r
    display: flex;\r
    align-items: flex-start;\r
    gap: 8px;\r
    padding: 9px 13px;\r
    border-radius: 9px;\r
    font-size: 12.5px;\r
    line-height: 1.6;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    background: var(--dsw-alias-bg-base, #fff);\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    box-shadow: 0 10px 28px rgba(16, 24, 40, 0.16);\r
    pointer-events: auto;\r
    max-width: 100%;\r
    overflow-wrap: anywhere;\r
    animation: tmToastIn 0.16s ease-out both;\r
  }\r
  \r
  .tm-toast.is-err {\r
    border-color: var(--dsw-alias-state-error-secondary, #fecaca);\r
    color: var(--dsw-alias-state-error-primary, #b91c1c);\r
  }\r
  \r
  .tm-toast.is-ok {\r
    border-color: var(--dsw-alias-state-success-secondary, #a7f3d0);\r
    color: var(--dsw-alias-state-success-primary, #047857);\r
  }\r
  \r
  @keyframes tmToastIn {\r
    from {\r
      opacity: 0;\r
      transform: translateY(8px);\r
    }\r
    to {\r
      opacity: 1;\r
      transform: none;\r
    }\r
  }\r
  \r
  /* ── 设置页 ── */\r
  \r
  .tm-settings {\r
    display: flex;\r
    flex-direction: column;\r
    flex: 1;\r
    min-height: 0;\r
  }\r
  \r
  .tm-settings-inner {\r
    width: 100%;\r
    max-width: 680px;\r
    display: grid;\r
    gap: 14px;\r
    min-width: 0;\r
    /* 真正的滚动容器：宿主设置节可能只给固定高度并裁掉溢出，\r
       所以这里必须自己接管滚动，否则内容一旦超过就再也拉不动。 */\r
    flex: 1;\r
    min-height: 0;\r
    max-height: calc(100vh - 24px);\r
    overflow-y: auto;\r
    overscroll-behavior: contain;\r
    padding: 18px 20px 36px;\r
  }\r
  \r
  .tm-settings-head {\r
    display: flex;\r
    flex-wrap: wrap;\r
    align-items: flex-start;\r
    justify-content: space-between;\r
    gap: 10px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-settings-sec {\r
    display: grid;\r
    gap: 10px;\r
    padding: 12px;\r
    min-width: 0;\r
  }\r
  \r
  .tm-settings-sec-title {\r
    font-size: 13px;\r
    font-weight: 500;\r
    margin: 0;\r
  }\r
  \r
  /* 空态与产出卡出现时也走一次淡入：列表清空后文字凭空出现会显得突兀 */\r
  .tm-empty {\r
    animation: tmRowIn 0.2s ease both;\r
  }\r
  \r
  .tm-output {\r
    animation: tmRowIn 0.18s ease both;\r
  }\r
  \r
  /* ── 窄面板（面板宽 ≤900）：单列 + 收紧间距 + 页签收紧，保证最后一项不被裁掉 ── */\r
  @container tm (max-width: 900px) {\r
    .tm-col-head {\r
      padding: 12px 12px 8px;\r
    }\r
  \r
    .tm-left-body {\r
      padding: 0 10px 10px;\r
      gap: 8px;\r
    }\r
  \r
    .tm-right-head {\r
      padding: 12px 12px 8px;\r
      /* 窄面板下标题与操作分成两行：原来按钮竖着居中在标题和副标题之间，读起来是断的 */\r
      flex-direction: column;\r
      align-items: stretch;\r
      gap: 8px;\r
    }\r
  \r
    .tm-sync {\r
      justify-content: flex-start;\r
    }\r
  \r
    /* 窄的时候把「上次同步 xx:xx」让位给按钮，别让同步按钮被挤到第二行 */\r
    .tm-sync .tm-caption {\r
      display: none;\r
    }\r
  \r
    .tm-detail-head {\r
      padding: 10px 12px 8px;\r
      flex-wrap: wrap;\r
    }\r
  \r
    .tm-tab {\r
      padding: 8px 9px;\r
    }\r
  \r
    .tm-tabpanel {\r
      padding: 12px 12px 22px;\r
    }\r
  \r
    .tm-list-foot {\r
      padding: 8px 12px 10px;\r
    }\r
  \r
    .tm-guide {\r
      padding: 24px 16px;\r
    }\r
  \r
    .tm-empty {\r
      padding: 22px 12px;\r
    }\r
  }\r
  \r
  /* ── 减少动态效果 ── */\r
  \r
  @media (prefers-reduced-motion: reduce) {\r
    .tm-surface *,\r
    .tm-surface *::before,\r
    .tm-surface *::after {\r
      animation-duration: 0.001ms !important;\r
      animation-iteration-count: 1 !important;\r
      transition-duration: 0.001ms !important;\r
      scroll-behavior: auto !important;\r
    }\r
  \r
    .tm-led.is-live::after {\r
      display: none;\r
    }\r
  \r
    .tm-pen,\r
    .tm-pen path {\r
      animation: none !important;\r
    }\r
  }\r
  \r
  /* ── 长列表折叠 ── */\r
  \r
  .tm-reveal {\r
    display: flex;\r
    align-items: center;\r
    gap: 4px;\r
    padding: 2px 6px 6px;\r
    flex-wrap: wrap;\r
  }\r
  \r
  /* ── 页签不可用原因（屏内说明，不靠悬停） ── */\r
  \r
  .tm-tab-reason {\r
    margin: 0 0 10px;\r
    padding: 7px 10px;\r
    border-radius: 8px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    border-left: 2px solid var(--dsw-alias-state-warn-primary, #d97706);\r
    background: var(--dsw-alias-interactive-bg-hover, #f7f8fa);\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    font-size: 12px;\r
    line-height: 1.6;\r
  }\r
  \r
  /* ── 搜索框：输入即过滤，带清空按钮 ── */\r
  \r
  .tm-search {\r
    position: relative;\r
    flex: 1;\r
    min-width: 0;\r
    display: flex;\r
    align-items: center;\r
  }\r
  \r
  .tm-search .tm-input {\r
    width: 100%;\r
    padding-right: 24px;\r
  }\r
  \r
  .tm-search-clear {\r
    position: absolute;\r
    right: 6px;\r
    top: 50%;\r
    transform: translateY(-50%);\r
    width: 16px;\r
    height: 16px;\r
    display: grid;\r
    place-items: center;\r
    border: 0;\r
    border-radius: 999px;\r
    background: transparent;\r
    color: var(--dsw-alias-label-tertiary, #9ca3af);\r
    font-size: 14px;\r
    line-height: 1;\r
    cursor: pointer;\r
  }\r
  \r
  .tm-search-clear:hover {\r
    background: var(--dsw-alias-interactive-bg-active, #eef0f4);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  .tm-search-clear:focus-visible {\r
    outline: 2px solid var(--dsw-alias-brand-primary, #2563eb);\r
    outline-offset: 1px;\r
  }\r
  \r
  /* ── 额度用满的全局提示（不是每条都报，而是一次说清） ── */\r
  \r
  .tm-quota-banner {\r
    display: flex;\r
    flex-wrap: wrap;\r
    align-items: flex-start;\r
    gap: 8px;\r
    margin: 0 0 10px;\r
    padding: 9px 12px;\r
    border-radius: 8px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    border-left: 2px solid var(--dsw-alias-state-warn-primary, #d97706);\r
    background: var(--dsw-alias-interactive-bg-hover, #f7f8fa);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    font-size: 12px;\r
    line-height: 1.6;\r
  }\r
  \r
  .tm-quota-banner .tm-grow {\r
    flex: 1 1 8rem;\r
    min-width: 0;\r
    overflow-wrap: anywhere;\r
  }\r
  \r
  .tm-quota-banner .tm-banner-icon {\r
    flex: none;\r
    margin-top: 1px;\r
    color: var(--dsw-alias-state-warn-primary, #d97706);\r
  }\r
  \r
  /* ── 建会弹窗：更多选项（放底部的纯文字开关，不做大按钮）── */\r
  \r
  .tm-more-toggle {\r
    display: inline-flex;\r
    align-items: center;\r
    gap: 4px;\r
    padding: 2px 0;\r
    border: 0;\r
    background: none;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    font-size: 12px;\r
    cursor: pointer;\r
  }\r
  \r
  .tm-more-toggle .tm-chevron {\r
    transition: transform 0.15s ease;\r
  }\r
  \r
  .tm-more-toggle[aria-expanded='true'] .tm-chevron {\r
    transform: rotate(180deg);\r
  }\r
  \r
  /* 产出正文元信息条：令牌底色，避免再光着一段灰 */\r
  .tm-output-metabar {\r
    padding: 8px 12px;\r
    border-radius: 8px;\r
    background: var(--dsw-alias-fill-l2, #f3f4f6);\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    font-size: 12px;\r
    line-height: 1.6;\r
  }\r
  \r
  .tm-more-toggle:hover {\r
    color: var(--dsw-alias-brand-primary, #2563eb);\r
    text-decoration: underline;\r
  }\r
  \r
  .tm-more-toggle:focus-visible {\r
    outline: 2px solid var(--dsw-alias-brand-primary, #2563eb);\r
    outline-offset: 2px;\r
    border-radius: 4px;\r
  }\r
  \r
  .tm-more-body {\r
    display: grid;\r
    gap: 12px;\r
    margin-top: 10px;\r
    padding-top: 12px;\r
    border-top: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
  }\r
  \r
  /* ── 会后产出：卡片可点 + 全屏预览 ── */\r
  \r
  .tm-output.is-clickable {\r
    cursor: pointer;\r
  }\r
  \r
  .tm-output.is-clickable:hover {\r
    border-color: var(--dsw-alias-border-l2, #d1d5db);\r
    background: var(--dsw-alias-interactive-bg-hover, #f7f8fa);\r
  }\r
  \r
  .tm-output.is-clickable:focus-visible {\r
    outline: 2px solid var(--dsw-alias-brand-primary, #2563eb);\r
    outline-offset: 2px;\r
  }\r
  \r
  .tm-outview {\r
    position: absolute;\r
    inset: 0;\r
    z-index: 70;\r
    display: flex;\r
    flex-direction: column;\r
    background: var(--dsw-alias-bg-base, #fff);\r
    animation: tmFadeIn 0.16s ease backwards;\r
  }\r
  \r
  .tm-outview-bar {\r
    display: flex;\r
    align-items: center;\r
    gap: 8px;\r
    padding: 10px 16px;\r
    border-bottom: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    background: var(--dsw-alias-bg-base, #fff);\r
    flex: none;\r
  }\r
  \r
  .tm-outview-title {\r
    font-size: 14px;\r
    font-weight: 500;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
  }\r
  \r
  .tm-outview-body {\r
    flex: 1;\r
    min-height: 0;\r
    overflow: auto;\r
    padding: 24px 20px 48px;\r
    background: var(--dsw-alias-fill-l2, #f3f4f6);\r
  }\r
  \r
  .tm-outview-page {\r
    max-width: 760px;\r
    margin: 0 auto;\r
    padding: 28px 32px;\r
    background: var(--dsw-alias-bg-base, #fff);\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    border-radius: 12px;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    font-size: 14px;\r
    line-height: 1.75;\r
    overflow-wrap: anywhere;\r
  }\r
  \r
  .tm-outview-page h1 {\r
    font-size: 21px;\r
    margin: 0 0 10px;\r
  }\r
  \r
  .tm-outview-page h2 {\r
    font-size: 16px;\r
    margin: 20px 0 8px;\r
    padding-bottom: 6px;\r
    border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.06));\r
  }\r
  \r
  .tm-outview-page p {\r
    margin: 8px 0;\r
  }\r
  \r
  .tm-outview-page ul,\r
  .tm-outview-page ol {\r
    margin: 8px 0;\r
    padding-left: 22px;\r
  }\r
  \r
  .tm-outview-page li {\r
    margin: 4px 0;\r
  }\r
  \r
  .tm-outview-page blockquote {\r
    margin: 10px 0;\r
    padding: 8px 12px;\r
    border-left: 3px solid var(--dsw-alias-state-warn-primary, #d97706);\r
    background: var(--dsw-alias-state-warn-tertiary, #fffbeb);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    border-radius: 0 6px 6px 0;\r
  }\r
  \r
  .tm-outview-page code {\r
    background: var(--dsw-alias-fill-l2, #f3f4f6);\r
    padding: 1px 5px;\r
    border-radius: 4px;\r
    font-size: 13px;\r
  }\r
  \r
  .tm-outview-page a {\r
    color: var(--dsw-alias-brand-primary, #2563eb);\r
  }\r
  \r
  /* ── 粘贴弹窗：别让长文把框撑破 ── */\r
  \r
  .tm-dialog-b > * {\r
    min-width: 0;\r
    max-width: 100%;\r
  }\r
  \r
  .tm-textarea {\r
    box-sizing: border-box;\r
    resize: vertical;\r
    overflow-wrap: anywhere;\r
  }\r
  \r
  .tm-field {\r
    max-width: 100%;\r
  }\r
  \r
  /* 顶栏只剩同步控件后，靠右放（原来左边是标题，space-between 刚好；现在得自己顶到右边） */\r
  .tm-right-head > .tm-sync {\r
    margin-left: auto;\r
  }\r
  \r
  /* 弹窗/预览 portal 到 body，不在 .tm-surface 作用域内：\r
     盒模型必须在这里也声明一遍，否则 100% 宽度 + 内边距会溢出边框（粘贴原文弹窗错位的根因）。 */\r
  .tm-dialog,\r
  .tm-dialog *,\r
  .tm-dialog *::before,\r
  .tm-dialog *::after,\r
  .tm-outview,\r
  .tm-outview *,\r
  .tm-outview *::before,\r
  .tm-outview *::after {\r
    box-sizing: border-box;\r
  }\r
  \r
  /* ── 更多操作：面板内原生弹层（Radix Menu portal 出 shadow 会失样式失位，改自建） ── */\r
  \r
  .tm-menu-wrap {\r
    position: relative;\r
    display: inline-flex;\r
  }\r
  \r
  .tm-popmenu {\r
    position: absolute;\r
    right: 0;\r
    top: calc(100% + 6px);\r
    min-width: 172px;\r
    padding: 4px;\r
    background: var(--dsw-alias-bg-base, #fff);\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    border-radius: 10px;\r
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.14);\r
    z-index: 55;\r
    animation: tmFadeIn 0.14s ease backwards;\r
  }\r
  \r
  .tm-popmenu-label {\r
    padding: 6px 10px 3px;\r
    font-size: 11px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
  }\r
  \r
  .tm-popmenu-item {\r
    display: block;\r
    width: 100%;\r
    text-align: left;\r
    padding: 7px 10px;\r
    border: 0;\r
    border-radius: 7px;\r
    background: none;\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    font-size: 13px;\r
    cursor: pointer;\r
  }\r
  \r
  .tm-popmenu-item:hover:not(:disabled) {\r
    background: var(--dsw-alias-interactive-bg-hover, #f7f8fa);\r
  }\r
  \r
  .tm-popmenu-item:focus-visible {\r
    outline: 2px solid var(--dsw-alias-brand-primary, #2563eb);\r
    outline-offset: -2px;\r
  }\r
  \r
  .tm-popmenu-item:disabled {\r
    opacity: 0.45;\r
    cursor: default;\r
  }\r
  \r
  .tm-popmenu-item.is-danger {\r
    color: var(--dsw-alias-state-error-primary, #dc2626);\r
  }\r
  \r
  /* ── 复盘卡片：判定面板 + 步骤条 ── */\r
  \r
  .tm-review-plan {\r
    display: grid;\r
    gap: 6px;\r
    padding: 10px 12px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    border-radius: 10px;\r
    background: var(--dsw-alias-fill-l2, #f7f8fa);\r
  }\r
  \r
  .tm-select {\r
    width: auto;\r
    min-width: 8em;\r
    padding: 4px 8px;\r
  }\r
  \r
  .tm-missing {\r
    display: grid;\r
    gap: 2px;\r
  }\r
  \r
  .tm-steps {\r
    display: flex;\r
    align-items: center;\r
    gap: 8px;\r
    flex-wrap: wrap;\r
    padding: 8px 0;\r
  }\r
  \r
  .tm-step {\r
    font-size: 12px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
  }\r
  .tm-step.is-done { color: var(--dsw-alias-label-primary, #1f2937); }\r
  .tm-step.is-now { color: var(--dsw-alias-brand-primary, #2563eb); }\r
  \r
  /* 复盘第二步：选类型（点按优先，不用下拉） */\r
  \r
  .tm-type-grid {\r
    display: flex;\r
    flex-wrap: wrap;\r
    gap: 6px;\r
  }\r
  \r
  .tm-type-chip {\r
    padding: 4px 10px;\r
    border-radius: 999px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    background: var(--dsw-alias-bg-base, #fff);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    font-size: 12px;\r
    cursor: pointer;\r
  }\r
  \r
  .tm-type-chip:hover { border-color: var(--dsw-alias-brand-primary, #2563eb); }\r
  \r
  .tm-type-chip.is-on {\r
    background: var(--dsw-alias-brand-primary, #2563eb);\r
    color: #fff;\r
    border-color: transparent;\r
  }\r
  \r
  .tm-type-chip:focus-visible {\r
    outline: 2px solid var(--dsw-alias-brand-primary, #2563eb);\r
    outline-offset: 1px;\r
  }\r
  \r
  /* 面板内 AI 对话窗 */\r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  /* 会后产出：上方菜单 + 下方整份文档 */\r
  \r
  .tm-output-menu {\r
    display: flex;\r
    gap: 6px;\r
    flex-wrap: wrap;\r
  }\r
  \r
  .tm-output-tab {\r
    display: inline-flex;\r
    align-items: center;\r
    gap: 6px;\r
    height: 30px;\r
    padding: 0 12px;\r
    border-radius: 10px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    background: var(--dsw-alias-bg-base, #fff);\r
    color: var(--dsw-alias-label-primary, #1f2937);\r
    font-size: 13px;\r
    cursor: pointer;\r
  }\r
  \r
  .tm-output-tab:hover { border-color: var(--dsw-alias-brand-primary, #2563eb); }\r
  \r
  .tm-output-tab.is-on {\r
    background: var(--dsw-alias-interactive-bg-active, rgba(38, 49, 72, 0.1));\r
    border-color: transparent;\r
    font-weight: 500;\r
  }\r
  \r
  .tm-dot {\r
    width: 5px;\r
    height: 5px;\r
    margin-left: 2px;\r
    border-radius: 50%;\r
    display: inline-block;\r
  }\r
  \r
  .tm-dot.is-ok { background: #22c55e; }\r
  \r
  .tm-output-doc .tm-output-body {\r
    max-height: none;\r
    overflow: visible;\r
    line-height: 1.7;\r
  }\r
  \r
  /* 产出文档区：宽度自适应（预览弹层仍限宽） */\r
  \r
  .tm-output-rendered.tm-outview-page {\r
    max-width: 860px;\r
    margin: 0;\r
    width: 100%;\r
    box-sizing: border-box;\r
  }\r
  \r
  /* 对话窗：主流 AI 对话样式 */\r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  @keyframes tmTyping {\r
    0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }\r
    30% { transform: translateY(-3px); opacity: 1; }\r
  }\r
  \r
  /* 悬浮提问条 + 右侧对话面板 */\r
  \r
  .tm-dock {\r
    position: sticky;\r
    bottom: 12px;\r
    z-index: 30;\r
    margin: 12px auto 0;\r
    max-width: 760px;\r
    padding: 10px 12px;\r
    border-radius: 14px;\r
    background: var(--dsw-alias-bg-base, #fff);\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    box-shadow: 0 8px 24px rgba(15,23,42,0.10);\r
  }\r
  \r
  .tm-dock-suggest { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }\r
  \r
  .tm-dock-input { display: flex; gap: 6px; }\r
  \r
  \r
  \r
  /* 标题可点修改 */\r
  .tm-title-edit {\r
    display: inline-flex;\r
    align-items: center;\r
    gap: 6px;\r
    padding: 0;\r
    border: none;\r
    background: transparent;\r
    color: inherit;\r
    font: inherit;\r
    font-weight: inherit;\r
    text-align: left;\r
    cursor: pointer;\r
    border-radius: 6px;\r
  }\r
  \r
  .tm-title-edit:hover .tm-detail-title { text-decoration: underline; }\r
  .tm-title-edit svg { opacity: 0.55; flex: none; }\r
  .tm-title-edit:hover svg { opacity: 1; }\r
  \r
  /* 邀请文案回显 */\r
  .tm-invite-text {\r
    margin: 0;\r
    padding: 10px 12px;\r
    border-radius: 8px;\r
    background: var(--dsw-alias-bg-layer-1, #f9fafb);\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    font-size: 12px;\r
    line-height: 1.6;\r
    white-space: pre-wrap;\r
    word-break: break-word;\r
    max-height: 40vh;\r
    overflow: auto;\r
  }\r
  \r
  /* 生成中进度 */\r
  .tm-gen-progress {\r
    display: flex;\r
    flex-direction: column;\r
    align-items: flex-start;\r
    gap: 8px;\r
    padding: 10px 12px;\r
    border-radius: 10px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    background: var(--dsw-alias-bg-layer-1, #f9fafb);\r
  }\r
  \r
  /* 进度条自己不再留底距：外层 flex gap 已经管间距 */\r
  .tm-gen-progress .tm-gen-bar {\r
    margin-bottom: 0;\r
    width: 100%;\r
  }\r
  \r
  .tm-gen-steps {\r
    display: flex;\r
    gap: 6px;\r
    margin-bottom: 8px;\r
  }\r
  \r
  .tm-gen-step {\r
    font-size: 12px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    animation: tmGenPulse 1.35s ease-in-out infinite;\r
  }\r
  \r
  .tm-gen-step:nth-child(2) { animation-delay: 0.45s; }\r
  .tm-gen-step:nth-child(3) { animation-delay: 0.9s; }\r
  \r
  @keyframes tmGenPulse {\r
    0%, 100% { opacity: 0.35; }\r
    50% { opacity: 1; color: var(--dsw-alias-brand-primary, #2563eb); }\r
  }\r
  \r
  .tm-gen-bar {\r
    height: 4px;\r
    border-radius: 999px;\r
    overflow: hidden;\r
    background: var(--dsw-alias-fill-l2, #e5e7eb);\r
    margin-bottom: 8px;\r
  }\r
  \r
  .tm-gen-bar > span {\r
    display: block;\r
    height: 100%;\r
    width: 40%;\r
    border-radius: 999px;\r
    background: var(--dsw-alias-brand-primary, #2563eb);\r
    animation: tmGenSlide 1.1s ease-in-out infinite;\r
  }\r
  \r
  @keyframes tmGenSlide {\r
    0% { transform: translateX(-110%); }\r
    100% { transform: translateX(280%); }\r
  }\r
  \r
  /* 顶栏：同步 hover 浮层 + 实时同步小点 */\r
  .tm-sync-wrap { position: relative; }\r
  \r
  .tm-sync-pop {\r
    position: absolute;\r
    top: calc(100% + 6px);\r
    left: 0;\r
    z-index: 60;\r
    min-width: 220px;\r
    padding: 8px 10px;\r
    border-radius: 10px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    background: var(--dsw-alias-bg-overlay, #fff);\r
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);\r
    font-size: 12px;\r
    line-height: 1.5;\r
    color: var(--dsw-alias-label-primary, #111827);\r
    opacity: 0;\r
    visibility: hidden;\r
    transform: translateY(-2px);\r
    transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;\r
  }\r
  \r
  .tm-sync-wrap.is-open .tm-sync-pop {\r
    opacity: 1;\r
    visibility: visible;\r
    transform: none;\r
  }\r
  \r
  .tm-sync-pop-row + .tm-sync-pop-row { margin-top: 4px; }\r
  \r
  .tm-live-dot {\r
    display: inline-flex;\r
    align-items: center;\r
    gap: 5px;\r
    font-size: 12px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
  }\r
  \r
  .tm-live-dot.is-off { color: var(--dsw-alias-state-error-primary, #dc2626); }\r
  \r
  /* AI 对话窗底部模型选择按钮 */\r
  \r
  \r
  \r
  \r
  \r
  /* 筛选下拉的勾选位 */\r
  .tm-check {\r
    display: inline-block;\r
    width: 14px;\r
    color: var(--dsw-alias-brand-primary, #2563eb);\r
  }\r
  \r
  @keyframes tmSlideIn { from { transform: translateX(16px); opacity: 0; } to { transform: none; opacity: 1; } }\r
  \r
  \r
  /* 面板本体：作为布局列，撑满高度，不再 fixed */\r
  \r
  \r
  \r
  \r
  /* 头部模型徽标（参考媒体工作台右侧栏：标题 + 模型 + 右上角关闭） */\r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  /* ── 反馈修正（2026-11-17）──\r
     1 面板避开 DSH 标题栏，关闭按钮移到左上，不再被右上角窗控压住\r
     2 消息区撑满，输入框与快捷项锚在面板下方（常规 AI 对话布局）\r
     3 悬浮条不再整条卡片化：只有输入胶囊是实心，快捷项变小字无底色 */\r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  \r
  .tm-dock {\r
    padding: 0;\r
    background: transparent;\r
    border: none;\r
    box-shadow: none;\r
  }\r
  \r
  .tm-dock-suggest {\r
    gap: 4px;\r
    margin-bottom: 6px;\r
    padding-left: 6px;\r
  }\r
  \r
  .tm-dock-chip {\r
    border: none;\r
    background: transparent;\r
    padding: 2px 6px;\r
    font-size: 12px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    cursor: pointer;\r
  }\r
  \r
  .tm-dock-chip:hover { color: var(--dsw-alias-brand-primary, #2563eb); }\r
  \r
  .tm-dock-input {\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    border-radius: 999px;\r
    background: var(--dsw-alias-bg-base, #fff);\r
    padding: 5px 5px 5px 14px;\r
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);\r
  }\r
  \r
  .tm-dock-input input {\r
    border: none;\r
    background: transparent;\r
    box-shadow: none;\r
  }\r
  \r
  /* ── 右上角三件套：模型 / 设置 / 助手（2026-11-18）──\r
     全部放在面板自己的顶栏，绝不碰 DSH 窗口标题栏，从根上避开窗控重叠。 */\r
  \r
  .tm-topbar-tools {\r
    display: flex;\r
    align-items: center;\r
    gap: 6px;\r
    flex: none;\r
  }\r
  \r
  .tm-topbar-btn {\r
    display: inline-flex;\r
    align-items: center;\r
    gap: 5px;\r
    height: 30px;\r
    padding: 0 10px;\r
    border-radius: 999px;\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    background: var(--dsw-alias-bg-base, #fff);\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    font-size: 12px;\r
    line-height: 1;\r
    cursor: pointer;\r
    transition: background .15s ease, color .15s ease, border-color .15s ease, transform .1s ease;\r
  }\r
  \r
  .tm-topbar-btn:hover {\r
    background: var(--dsw-alias-fill-l2, #f3f4f6);\r
    color: var(--dsw-alias-label-primary, #111827);\r
  }\r
  \r
  .tm-topbar-btn:active { transform: scale(.96); }\r
  \r
  \r
  \r
  /* 助手按钮：底色跟随主题表面色，文字/图标用品牌色。\r
     之前用品牌色做底，主题品牌色偏黑时会变成黑底黑字（实测反馈）。 */\r
  .tm-topbar-assistant {\r
    border-color: var(--dsw-alias-border-l2, #e5e7eb);\r
    background: var(--dsw-alias-bg-base, #fff);\r
    color: var(--dsw-alias-brand-primary, #2563eb);\r
  }\r
  \r
  .tm-topbar-assistant:hover {\r
    background: var(--dsw-alias-bg-layer-1, #f3f4f6);\r
    color: var(--dsw-alias-brand-primary, #2563eb);\r
    filter: none;\r
  }\r
  \r
  \r
  /* 模型选择弹窗 */\r
  .tm-model-alert {\r
    display: flex;\r
    align-items: center;\r
    gap: 8px;\r
    padding: 8px 10px;\r
    border-radius: 8px;\r
    background: var(--dsw-alias-fill-l2, #f3f4f6);\r
    font-size: 12px;\r
  }\r
  \r
  .tm-model-pick {\r
    display: grid;\r
    gap: 14px;\r
    max-height: 60vh;\r
    overflow-y: auto;\r
  }\r
  \r
  .tm-model-group-title {\r
    font-size: 12px;\r
    color: var(--dsw-alias-label-secondary, #6b7280);\r
    margin-bottom: 6px;\r
  }\r
  \r
  .tm-model-options {\r
    display: flex;\r
    flex-wrap: wrap;\r
    gap: 6px;\r
  }\r
  \r
  .tm-model-option {\r
    border: 0.5px solid var(--dsw-alias-border-l2, #e5e7eb);\r
    background: var(--dsw-alias-bg-base, #fff);\r
    color: var(--dsw-alias-label-primary, #111827);\r
    border-radius: 8px;\r
    padding: 6px 10px;\r
    font-size: 12px;\r
    cursor: pointer;\r
    transition: background .15s ease, border-color .15s ease;\r
  }\r
  \r
  .tm-model-option:hover { background: var(--dsw-alias-fill-l2, #f3f4f6); }\r
  \r
  .tm-model-option.is-on {\r
    border-color: var(--dsw-alias-brand-primary, #2563eb);\r
    background: var(--dsw-alias-fill-l3, #eef2ff);\r
    color: var(--dsw-alias-brand-primary, #2563eb);\r
  }\r
  \r
  /* 窄屏：三件套只留图标，模型标签隐藏，避免顶栏挤爆 */\r
  @container tm (max-width: 30rem) {\r
    \r
    .tm-topbar-btn { padding: 0 8px; }\r
  }\r
  }\r
  `;

  // src/client/app.tsx
  var React43 = __toESM(require("react"));

  // src/shared/types.ts
  var OUTPUT_KINDS = ["insight", "minutes-company", "minutes-investor", "review", "qa"];
  var OUTPUT_LABELS = {
    insight: "会议洞察分析",
    "minutes-company": "公司视角纪要",
    "minutes-investor": "投资人视角纪要",
    review: "复盘报告",
    qa: "问答清单"
  };
  function emptyStates() {
    return {
      replay: "none",
      transcript: "none",
      minutes: "waiting",
      timeline: "waiting",
      gen: { insight: "idle", company: "idle", investor: "idle", review: "idle", qa: "idle" },
      tabs: { transcriptDisabled: false, minutesDisabled: false, qaDisabled: false },
      tabReasons: { transcript: "", minutes: "", qa: "" },
      disabledReason: "",
      blocker: null
    };
  }
  var WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  function pad(n) {
    return String(n).padStart(2, "0");
  }
  function parseDate(iso) {
    if (!iso)
      return null;
    const t = Date.parse(iso);
    return Number.isNaN(t) ? null : new Date(t);
  }
  function dayKey(d) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }
  function formatRelativeRange(startIso, endIso, now = new Date) {
    const s = parseDate(startIso);
    const e = parseDate(endIso);
    if (!s)
      return startIso || "";
    const hm = `${pad(s.getHours())}:${pad(s.getMinutes())}`;
    const endHm = e ? ` – ${pad(e.getHours())}:${pad(e.getMinutes())}` : "";
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dayKey(s) === dayKey(now))
      return `今天 ${hm}${endHm}`;
    if (dayKey(s) === dayKey(tomorrow))
      return `明天 ${hm}${endHm}`;
    if (dayKey(s) === dayKey(yesterday))
      return `昨天 ${hm}${endHm}`;
    const md = `${pad(s.getMonth() + 1)}-${pad(s.getDate())}`;
    if (s.getFullYear() === now.getFullYear() && Math.abs(s.getTime() - now.getTime()) < 7 * 86400000) {
      return `${md} ${WEEKDAYS[s.getDay()]} ${hm}${endHm}`;
    }
    return `${md} ${hm}${endHm}`;
  }
  function formatAbsoluteRange(startIso, endIso) {
    const s = parseDate(startIso);
    const e = parseDate(endIso);
    if (!s)
      return `${startIso || ""} – ${endIso || ""}`;
    const so = `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())} ${pad(s.getHours())}:${pad(s.getMinutes())}`;
    if (!e)
      return so;
    const sameDay = dayKey(s) === dayKey(e);
    const eo = sameDay ? `${pad(e.getHours())}:${pad(e.getMinutes())}` : `${e.getFullYear()}-${pad(e.getMonth() + 1)}-${pad(e.getDate())} ${pad(e.getHours())}:${pad(e.getMinutes())}`;
    return `${so} – ${eo}`;
  }
  function isLive(m, now = Date.now()) {
    const s = Date.parse(m.startTime);
    const e = Date.parse(m.endTime);
    if (Number.isNaN(s) || Number.isNaN(e))
      return false;
    return now >= s && now < e;
  }
  function isEnded(m, now = Date.now()) {
    const e = Date.parse(m.endTime);
    return !Number.isNaN(e) && now >= e;
  }
  function formatWaited(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `已等待 ${m} 分 ${pad(s)} 秒` : `已等待 ${s} 秒`;
  }
  function formatMeetingCode(code) {
    const c = String(code || "").replace(/\D/g, "");
    if (c.length !== 9)
      return code || "";
    return `${c.slice(0, 3)} ${c.slice(3, 6)} ${c.slice(6)}`;
  }

  // src/client/lib/api.ts
  var API_BASE = "/tmeet/api";

  class ApiError extends Error {
    code;
    status;
    constructor(message, code, status) {
      super(message);
      this.name = "ApiError";
      this.code = code;
      this.status = status;
    }
  }
  function errorText(e) {
    if (e instanceof ApiError)
      return e.message;
    if (e instanceof Error && e.message)
      return e.message;
    return typeof e === "string" && e ? e : "请求没成功，稍后再点一次。";
  }
  function mergeSignal(a, b) {
    if (!a)
      return b;
    if (!b)
      return a;
    const ctrl = new AbortController;
    const on = () => ctrl.abort();
    if (a.aborted || b.aborted)
      ctrl.abort();
    else {
      a.addEventListener("abort", on, { once: true });
      b.addEventListener("abort", on, { once: true });
    }
    return ctrl.signal;
  }
  async function request(path, opts = {}) {
    const url = buildUrl(path, opts.query);
    const timeoutMs = opts.timeoutMs ?? 30000;
    const timeoutCtrl = new AbortController;
    const timer = setTimeout(() => timeoutCtrl.abort(), timeoutMs);
    const signal = mergeSignal(opts.signal, timeoutCtrl.signal);
    let res;
    try {
      res = await fetch(url, {
        method: opts.method ?? "GET",
        headers: opts.body === undefined ? undefined : { "content-type": "application/json" },
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        credentials: "same-origin",
        signal
      });
    } catch (e) {
      if (e?.name === "AbortError") {
        if (opts.signal?.aborted)
          throw e;
        throw new ApiError("这个请求等得太久，没等到回话。可以再试一次。", "timeout", 0);
      }
      throw new ApiError("连不上面板的本地服务，确认 DSH 还在运行。", "network", 0);
    } finally {
      clearTimeout(timer);
    }
    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
    if (!res.ok) {
      const payload = data ?? {};
      const message = typeof payload.error === "string" && payload.error ? payload.error : `请求失败（HTTP ${res.status}）`;
      const code = typeof payload.code === "string" && payload.code ? payload.code : `http-${res.status}`;
      throw new ApiError(message, code, res.status);
    }
    return data;
  }
  function buildUrl(path, query) {
    const url = `${API_BASE}${path}`;
    if (!query)
      return url;
    const parts = [];
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "")
        continue;
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    }
    return parts.length ? `${url}?${parts.join("&")}` : url;
  }
  function getStatus(signal) {
    return request("/status", { signal });
  }
  function installCli(version, signal) {
    return request("/setup/install", {
      method: "POST",
      body: { confirm: true, ...version ? { version } : {} },
      signal
    });
  }
  function getInstallStatus(signal) {
    return request("/setup/install-status", { signal });
  }
  function getCliLatestVersion(signal) {
    return request("/setup/cli-version", { signal });
  }
  function startAuth(switchAccount = false, signal) {
    return request("/auth/start", {
      method: "POST",
      body: switchAccount ? { switchAccount: true } : {},
      signal
    });
  }
  function pollAuth(signal) {
    return request("/auth/poll", { signal });
  }
  function cancelAuth() {
    return request("/auth/cancel", { method: "POST", body: {} });
  }
  function logout(purgeLocal, signal) {
    return request("/auth/logout", {
      method: "POST",
      body: { confirm: true, purgeLocal },
      signal
    });
  }
  function listMeetings(query, signal) {
    return request("/meetings", {
      query: {
        scope: query.scope ?? "ended",
        limit: query.limit,
        q: query.q,
        onlyTranscript: query.onlyTranscript ? 1 : undefined,
        refresh: query.refresh ? 1 : undefined,
        before: query.before
      },
      signal
    });
  }
  var detailMemo = new Map;
  var contentMemo = new Map;
  function cachedMeeting(id) {
    return detailMemo.get(id) ?? null;
  }
  function cachedContent(id, kind) {
    return contentMemo.get(`${id}:${kind}`) ?? null;
  }
  function getMeeting(id, signal) {
    return request("/meeting", { query: { id }, signal }).then((d) => {
      detailMemo.set(id, d);
      return d;
    });
  }
  function getStates(id, signal) {
    return request("/meeting/states", { query: { id }, signal });
  }
  function getContent(id, kind, force = false, signal) {
    return request("/meeting/content", {
      query: { id, kind, force: force ? 1 : undefined },
      signal
    }).then((v) => {
      if (!v.empty)
        contentMemo.set(`${id}:${kind}`, v);
      return v;
    });
  }
  function getParticipants(id, signal) {
    return request("/meeting/participants", { query: { id }, signal });
  }
  function mutateParticipants(id, action, names) {
    return request("/meeting/participants", {
      method: "POST",
      body: { id, action, names }
    });
  }
  function recognizeParticipants(id) {
    return request("/meeting/participants/recognize", { method: "POST", body: { id }, timeoutMs: 180000 });
  }
  function getOutputs(id, signal) {
    return request("/meeting/outputs", { query: { id }, signal });
  }
  function generateOutput(id, kind, opts) {
    return request("/meeting/output", {
      method: "POST",
      body: { id, kind, action: "generate", type: opts?.type },
      timeoutMs: 30000
    });
  }
  function cancelOutput(id, kind) {
    return request("/meeting/output", {
      method: "POST",
      body: { id, kind, action: "cancel" },
      timeoutMs: 15000
    });
  }
  function deleteOutput(id, kind) {
    return request("/meeting/output", {
      method: "POST",
      body: { id, kind, action: "delete" },
      timeoutMs: 15000
    });
  }
  function outputStatus(id, signal) {
    return request("/meeting/output-status", { query: { id }, signal });
  }
  function prepareChatSession(id) {
    return request("/meeting/chat-session", { method: "POST", body: { id } });
  }
  function seedChat(id, sessionId) {
    return request("/meeting/chat-seed", {
      method: "POST",
      body: { id, sessionId }
    });
  }
  function getReviewPlan(id, type, signal) {
    return request("/meeting/review-plan", { query: { id, type }, signal });
  }
  function getInviteText(id, signal) {
    return request("/meeting/invite-text", { query: { id }, signal });
  }
  function getInvitees(id, signal) {
    return request("/meeting/invitees", { query: { id }, signal });
  }
  function mutateInvitees(id, action, openIds) {
    return request("/meeting/invitees", {
      method: "POST",
      body: { confirm: true, id, action, openIds }
    });
  }
  function updateMeeting(id, patch, confirm) {
    return request("/meeting/update", { method: "POST", body: { confirm, id, patch } });
  }
  function saveSubject(id, subject) {
    return request("/meeting/subject", { method: "POST", body: { id, subject } });
  }
  function openReplay(id) {
    return request("/meeting/replay", { method: "POST", body: { id } });
  }
  function createMeeting(form, confirm) {
    return request("/meeting/create", { method: "POST", body: { form, confirm } });
  }
  function cancelMeeting(id, confirm) {
    return request("/meeting/cancel", {
      method: "POST",
      body: { id, confirm }
    });
  }
  function getSettings(signal) {
    return request("/settings", { signal });
  }
  function saveSettings(patch) {
    return request("/settings", { method: "POST", body: patch });
  }
  function clearCache() {
    return request("/cache/clear", { method: "POST", body: {} });
  }
  async function copyText(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
  function listPasted(id) {
    return request("/meeting/pasted", { query: { id } });
  }
  function savePasted(input) {
    return request("/meeting/pasted", {
      method: "POST",
      body: input
    });
  }
  function applyPermission(meetingRecordId, commit, meetingId) {
    return request("/meeting/permission", {
      method: "POST",
      body: { meetingRecordId, commit, confirm: true, id: meetingId }
    });
  }
  function refreshMeeting(id) {
    return request("/events/refresh", { method: "POST", body: { id } });
  }
  function subscribeEvents(onEvent, onOpen, onError) {
    const es = new EventSource(`${API_BASE}/events/stream`, { withCredentials: true });
    es.addEventListener("hello", () => onOpen?.());
    const known = ["meeting.started", "meeting.end", "meeting.canceled", "recording.completed", "smart.transcripts", "smart.minutes", "manual.refresh", "meeting.created", "meeting.updated"];
    for (const key of known) {
      es.addEventListener(key, (ev) => {
        try {
          onEvent(JSON.parse(ev.data));
        } catch {}
      });
    }
    es.onerror = () => onError?.();
    return () => es.close();
  }

  // src/client/lib/hooks.ts
  var import_react = require("react");
  function useStatus() {
    const [status, setStatus] = import_react.useState(null);
    const [error, setError] = import_react.useState(null);
    const [loading, setLoading] = import_react.useState(true);
    const aliveRef = import_react.useRef(true);
    const refresh = import_react.useCallback(async () => {
      setLoading(true);
      try {
        const next = await getStatus(AbortSignal.timeout(25000));
        if (!aliveRef.current)
          return;
        setStatus(next);
        setError(null);
      } catch (e) {
        if (!aliveRef.current)
          return;
        setError(errorText(e));
      } finally {
        if (aliveRef.current)
          setLoading(false);
      }
    }, []);
    import_react.useEffect(() => {
      aliveRef.current = true;
      refresh();
      return () => {
        aliveRef.current = false;
      };
    }, [refresh]);
    return { status, error, loading, refresh };
  }
  var HISTORY_LIMIT = 30;
  function split(meetings) {
    const live = [];
    const upcoming = [];
    const ended = [];
    const now = Date.now();
    for (const m of meetings) {
      if (isLive(m, now))
        live.push(m);
      else if (isEnded(m, now))
        ended.push(m);
      else
        upcoming.push(m);
    }
    return { live, upcoming, ended };
  }
  var listMemo = {
    history: [],
    near: [],
    syncedAt: null,
    seeded: false
  };
  function useMeetings(onlyTranscript) {
    const [history, setHistory] = import_react.useState(() => listMemo.history);
    const [near, setNear] = import_react.useState(() => listMemo.near);
    const [hasMore, setHasMore] = import_react.useState(false);
    const [syncedAt, setSyncedAt] = import_react.useState(() => listMemo.syncedAt);
    const [loading, setLoading] = import_react.useState(!listMemo.seeded);
    const [loadingMore, setLoadingMore] = import_react.useState(false);
    const [error, setError] = import_react.useState(null);
    const [hiddenByFilter, setHiddenByFilter] = import_react.useState(0);
    const aliveRef = import_react.useRef(true);
    const exhaustedRef = import_react.useRef(false);
    const daySyncTriedRef = import_react.useRef(false);
    const load = import_react.useCallback(async (mode) => {
      if (mode === "earlier")
        setLoadingMore(true);
      else if (!history.length && !near.length)
        setLoading(true);
      try {
        const [endedPayload, nearPayload] = await Promise.all([
          listMeetings({
            scope: "ended",
            limit: HISTORY_LIMIT,
            onlyTranscript: onlyTranscript || undefined,
            refresh: mode === "refresh",
            before: mode === "earlier" ? earliest(history) : undefined
          }),
          mode === "earlier" ? Promise.resolve(null) : listMeetings({ scope: "upcoming", limit: 20, refresh: mode === "refresh" })
        ]);
        if (!aliveRef.current)
          return;
        const endedList = endedPayload.meetings ?? [];
        const wiped = Boolean(endedPayload.error) && endedList.length === 0;
        if (mode === "earlier") {
          if (!wiped) {
            const merged = mergeById(history, endedList);
            setHistory(merged);
            Object.assign(listMemo, { history: merged, seeded: true });
            if (endedList.length === 0)
              exhaustedRef.current = true;
            setHasMore(!exhaustedRef.current && endedList.length >= HISTORY_LIMIT);
          }
        } else if (!wiped) {
          exhaustedRef.current = false;
          setHistory(endedList);
          Object.assign(listMemo, { history: endedList, seeded: true });
          setHasMore(Boolean(endedPayload.hasMore) || endedList.length >= HISTORY_LIMIT);
        }
        if (!wiped)
          setSyncedAt(endedPayload.syncedAt ?? null);
        if (!wiped && endedPayload.syncedAt)
          listMemo.syncedAt = endedPayload.syncedAt;
        if (mode === "initial" && !daySyncTriedRef.current) {
          daySyncTriedRef.current = true;
          const synced = endedPayload.syncedAt;
          const sameDay = Boolean(synced) && new Date(String(synced)).toDateString() === new Date().toDateString();
          if (!sameDay)
            load("refresh");
        }
        if (nearPayload && !nearPayload.error) {
          setNear(nearPayload.meetings ?? []);
          Object.assign(listMemo, { near: nearPayload.meetings ?? [], seeded: true });
        }
        if (onlyTranscript) {
          const all = await listMeetings({ scope: "ended", limit: HISTORY_LIMIT });
          if (!aliveRef.current)
            return;
          const total = (all.meetings ?? []).length;
          setHiddenByFilter(Math.max(0, total - endedList.length));
        } else {
          setHiddenByFilter(0);
        }
        const errText = endedPayload.error || endedPayload.partial ? endedPayload.error ?? "" : "";
        setError(errText || null);
      } catch (e) {
        if (!aliveRef.current)
          return;
        setError(errorText(e));
      } finally {
        if (aliveRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    }, [history, onlyTranscript]);
    import_react.useEffect(() => {
      aliveRef.current = true;
      load("initial");
      return () => {
        aliveRef.current = false;
      };
    }, [onlyTranscript]);
    const sync = import_react.useCallback(async () => {
      await load("refresh");
    }, [load]);
    const loadEarlier = import_react.useCallback(async () => {
      await load("earlier");
    }, [load]);
    const reload = import_react.useCallback(async () => {
      await load("initial");
    }, [load]);
    const { live, upcoming } = split(near);
    return {
      history,
      upcoming,
      live,
      hasMore,
      syncedAt,
      loading,
      loadingMore,
      error,
      hiddenByFilter,
      sync,
      loadEarlier,
      reload
    };
  }
  function earliest(list) {
    let min = null;
    for (const m of list) {
      const t = Date.parse(m.startTime);
      if (Number.isNaN(t))
        continue;
      if (min === null || t < min)
        min = t;
    }
    return min === null ? undefined : new Date(min).toISOString();
  }
  function mergeById(base, extra) {
    const seen = new Set(base.map((m) => m.meetingId));
    const out = [...base];
    for (const m of extra) {
      if (seen.has(m.meetingId))
        continue;
      seen.add(m.meetingId);
      out.push(m);
    }
    return out.sort((a, b) => (Date.parse(b.startTime) || 0) - (Date.parse(a.startTime) || 0));
  }
  function useAuthPoll(active) {
    const [phase, setPhase] = import_react.useState("idle");
    const [waitedSeconds, setWaited] = import_react.useState(0);
    const [reason, setReason] = import_react.useState("");
    const [url, setUrl] = import_react.useState("");
    const [nonce, setNonce] = import_react.useState(0);
    import_react.useEffect(() => {
      if (!active) {
        setPhase("idle");
        setWaited(0);
        setReason("");
        setUrl("");
        return;
      }
      let alive = true;
      let timer = null;
      const started = Date.now();
      setPhase("waiting");
      setWaited(0);
      const poll = async () => {
        try {
          const p = await pollAuth();
          if (!alive)
            return;
          if (p.url)
            setUrl(p.url);
          const secs = Math.max(0, Math.floor((p.waitedMs ?? Date.now() - started) / 1000));
          setWaited(secs);
          if (p.state === "done") {
            setPhase("done");
            return;
          }
          if (p.state === "failed") {
            setPhase("failed");
            setReason(p.reason || "授权没走完就断了，可以重新生成链接再试。");
            return;
          }
          timer = setTimeout(() => void poll(), 2000);
        } catch (e) {
          if (!alive)
            return;
          setPhase("failed");
          setReason(errorText(e));
        }
      };
      poll();
      return () => {
        alive = false;
        if (timer)
          clearTimeout(timer);
      };
    }, [active, nonce]);
    return {
      phase,
      waitedSeconds,
      reason,
      url,
      restart: () => setNonce((n) => n + 1)
    };
  }
  function useInstallProgress(active) {
    const [message, setMessage] = import_react.useState("");
    const [done, setDone] = import_react.useState(false);
    import_react.useEffect(() => {
      if (!active) {
        setMessage("");
        setDone(false);
        return;
      }
      let alive = true;
      let timer = null;
      const poll = async () => {
        try {
          const s = await getInstallStatus();
          if (!alive)
            return;
          setMessage(s.lastMessage || "");
          if (!s.installing) {
            setDone(Boolean(s.lastMessage));
            return;
          }
        } catch {}
        timer = setTimeout(() => void poll(), 1500);
      };
      poll();
      return () => {
        alive = false;
        if (timer)
          clearTimeout(timer);
      };
    }, [active]);
    return { message, done };
  }

  // src/client/lib/use-live.ts
  var import_react2 = require("react");
  function useLiveSync(options) {
    const [state, setState] = import_react2.useState("off");
    const [lastAt, setLastAt] = import_react2.useState(null);
    const [lastMeetingId, setLastMeetingId] = import_react2.useState(null);
    const [lastStates, setLastStates] = import_react2.useState(null);
    const handlerRef = import_react2.useRef(options.onEvent);
    handlerRef.current = options.onEvent;
    const enabled = options.enabled;
    import_react2.useEffect(() => {
      if (!enabled) {
        setState("off");
        return;
      }
      setState("connecting");
      const close = subscribeEvents((e) => {
        if (e.degraded) {
          setState("degraded");
          return;
        }
        setState("live");
        setLastAt(e.at);
        setLastMeetingId(e.meetingId || null);
        setLastStates(e.states ?? null);
        handlerRef.current(e);
      }, () => setState("live"), () => setState((s) => s === "degraded" ? s : "degraded"));
      return close;
    }, [enabled]);
    return { state, lastAt, lastMeetingId, lastStates };
  }

  // src/client/detail.tsx
  var React39 = __toESM(require("react"));

  // src/client/lib/markdown.ts
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function inline(s) {
    return s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  }
  function renderMarkdown(source) {
    const lines = String(source ?? "").split(/\r?\n/);
    const out = [];
    let list = null;
    const closeList = () => {
      if (list) {
        out.push(list === "ul" ? "</ul>" : "</ol>");
        list = null;
      }
    };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) {
        closeList();
        continue;
      }
      const h = /^(#{1,4})\s+(.*)$/.exec(line);
      if (h) {
        closeList();
        const level = h[1].length;
        out.push(`<h${level}>${inline(escapeHtml(h[2]))}</h${level}>`);
        continue;
      }
      if (/^(&gt;|>)\s?/.test(line)) {
        closeList();
        out.push(`<blockquote>${inline(escapeHtml(line.replace(/^(&gt;|>)\s?/, "")))}</blockquote>`);
        continue;
      }
      const ul = /^[-*]\s+/.test(line);
      const ol = /^\d+[.、]\s+/.test(line);
      if (ul || ol) {
        const want = ul ? "ul" : "ol";
        if (list !== want) {
          closeList();
          out.push(want === "ul" ? "<ul>" : "<ol>");
          list = want;
        }
        const body = line.replace(/^([-*]|\d+[.、])\s+/, "");
        out.push(`<li>${inline(escapeHtml(body))}</li>`);
        continue;
      }
      closeList();
      out.push(`<p>${inline(escapeHtml(line))}</p>`);
    }
    closeList();
    return out.join(`
  `);
  }
  function splitDocHead(source, fallbackTitle) {
    const lines = String(source ?? "").split(/\r?\n/);
    let i = 0;
    while (i < lines.length && !lines[i].trim())
      i++;
    let title = fallbackTitle;
    const h = i < lines.length ? /^#\s+(.*)$/.exec(lines[i].trim()) : null;
    if (h) {
      title = h[1].trim();
      i++;
    }
    const quotes = [];
    for (;; ) {
      let j = i;
      while (j < lines.length && !lines[j].trim())
        j++;
      const line = j < lines.length ? lines[j].trim() : "";
      if (/^(&gt;|>)\s?/.test(line)) {
        quotes.push(line.replace(/^(&gt;|>)\s?/, ""));
        i = j + 1;
        continue;
      }
      break;
    }
    const sub = [];
    const fields = [];
    for (const q of quotes) {
      for (const seg of q.split(" · ")) {
        const at = seg.indexOf("：");
        if (at > 0 && at <= 8)
          fields.push([seg.slice(0, at).trim(), seg.slice(at + 1).trim()]);
        else if (seg.trim())
          sub.push(seg.trim());
      }
    }
    return { title, sub, fields, body: lines.slice(i).join(`
  `) };
  }
  function markSources(html) {
    return html.replace(/【(引用|转写|概括|推断·[高中低])】/g, (_all, tag) => {
      const cls = tag === "引用" ? "q" : tag === "转写" ? "t" : tag === "概括" ? "g" : "i";
      return `<span class="mk mk-${cls}">${tag}</span>`;
    });
  }
  function formatGeneratedAt(iso) {
    const t = Date.parse(iso);
    if (!Number.isFinite(t))
      return "";
    const d = new Date(t);
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  var DOC_CSS = `
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    html { -webkit-text-size-adjust: 100%; }
    body {
      margin: 0;
      padding: 40px 20px 64px;
      background: #f2f4f8;
      color: #1c2534;
      font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC",
        -apple-system, "Segoe UI", Roboto, sans-serif;
      font-size: 15.5px;
      line-height: 1.85;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    .doc {
      max-width: 780px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #e4e8ef;
      border-radius: 14px;
      box-shadow: 0 1px 2px rgba(16, 24, 40, .04), 0 16px 40px -16px rgba(16, 24, 40, .10);
      overflow: hidden;
    }
    .doc-head { padding: 44px 48px 24px; border-bottom: 1px solid #eef1f6; }
    .doc-kicker {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 16px;
      font-size: 12px; letter-spacing: .16em; color: #8a94a6;
    }
    .doc-kicker::before { content: ""; width: 18px; height: 2px; border-radius: 2px; background: #2f5fd0; }
    .doc-title {
      margin: 0 0 10px;
      font-size: 26px; line-height: 1.4; font-weight: 650; letter-spacing: .01em; color: #141b28;
    }
    .doc-sub { margin: 0 0 20px; font-size: 14px; color: #5b6b82; }
    .doc-meta {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px 24px; margin: 0; padding-top: 16px; border-top: 1px dashed #e8ecf3;
    }
    .doc-meta-item { display: flex; gap: 8px; align-items: baseline; min-width: 0; }
    .doc-meta-item dt { flex: none; font-size: 12.5px; color: #8a94a6; }
    .doc-meta-item dd { margin: 0; font-size: 13.5px; font-weight: 500; color: #2a3547; overflow-wrap: anywhere; }
    .doc-body { padding: 10px 48px 40px; }
    .doc-body h2 {
      margin: 34px 0 12px; padding-left: 12px;
      border-left: 3px solid #2f5fd0; line-height: 1.45;
      font-size: 18px; font-weight: 650; color: #182030;
    }
    .doc-body h3 { margin: 24px 0 10px; font-size: 15.5px; font-weight: 650; color: #1c2534; }
    .doc-body h4 { margin: 20px 0 8px; font-size: 14.5px; font-weight: 650; color: #1c2534; }
    .doc-body p { margin: 10px 0; }
    .doc-body ul, .doc-body ol { margin: 10px 0; padding-left: 24px; }
    .doc-body li { margin: 6px 0; }
    .doc-body li::marker { color: #2f5fd0; }
    .doc-body strong { font-weight: 650; color: #141b28; }
    .doc-body blockquote {
      margin: 16px 0; padding: 12px 16px;
      background: #f7f9fc; border-left: 3px solid #c3ccd9; border-radius: 0 8px 8px 0;
      color: #3b4759;
    }
    .doc-body code {
      padding: 2px 6px; border-radius: 6px; background: #f4f6f9;
      font-size: .9em; color: #334155;
    }
    .doc-body a { color: #2f5fd0; text-decoration: none; border-bottom: 1px solid rgba(47, 95, 208, .3); }
    .doc-body hr { margin: 28px 0; border: 0; border-top: 1px solid #eef1f6; }
    .mk {
      display: inline-block; margin-right: 4px; padding: 1px 7px;
      border-radius: 999px; font-size: 11.5px; line-height: 1.7; font-weight: 600;
      vertical-align: 1px; letter-spacing: .02em;
    }
    .mk-q { background: #eef3fe; color: #2b57b8; }
    .mk-t { background: #e9f6f4; color: #1f7a6d; }
    .mk-g { background: #f1f3f6; color: #5b6b82; }
    .mk-i { background: #fdf4e5; color: #a1681a; }
    .doc-foot {
      display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
      padding: 16px 48px; border-top: 1px solid #eef1f6; background: #fafbfd;
      color: #8a94a6; font-size: 12.5px;
    }
    @media (max-width: 640px) {
      body { padding: 16px 10px 40px; }
      .doc { border-radius: 10px; }
      .doc-head { padding: 28px 22px 16px; }
      .doc-title { font-size: 21px; }
      .doc-body { padding: 4px 22px 28px; }
      .doc-foot { padding: 14px 22px; }
    }
    @media print {
      body { padding: 0; background: #fff; }
      .doc { max-width: 100%; border: 0; border-radius: 0; box-shadow: none; }
      .doc-body { padding: 0 6px; }
      .doc-foot { background: #fff; }
      .doc-body h2, .doc-body h3 { break-after: avoid; }
      .doc-body li, .doc-body blockquote { break-inside: avoid; }
    }
    @page { margin: 16mm; }
  `;
  function markdownToHtmlDocument(source, title, meta = {}) {
    const head = splitDocHead(source, title);
    const body = markSources(renderMarkdown(head.body));
    const sub = head.sub.length ? `<p class="doc-sub">${head.sub.map((s) => escapeHtml(s)).join(" · ")}</p>` : "";
    const fields = head.fields.length ? `<dl class="doc-meta">${head.fields.map(([k, v]) => `<div class="doc-meta-item"><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join("")}</dl>` : "";
    const when = meta.generatedAt ? formatGeneratedAt(meta.generatedAt) : "";
    return `<!doctype html>
  <html lang="zh-CN">
  <head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${DOC_CSS}</style>
  </head>
  <body>
  <article class="doc">
    <header class="doc-head">
      <div class="doc-kicker">腾讯会议 · 会后产出</div>
      <h1 class="doc-title">${escapeHtml(head.title)}</h1>
      ${sub}
      ${fields}
    </header>
    <div class="doc-body">
  ${body}
    </div>
    <footer class="doc-foot">
      <span>由 DSH 腾讯会议插件生成</span>
      <span>${when ? `生成于 ${when}` : "内容以素材为准，标注来源层级"}</span>
    </footer>
  </article>
  </body>
  </html>
  `;
  }

  // src/client/paste-dialog.tsx
  var React38 = __toESM(require("react"));

  // node_modules/@radix-ui/react-dialog/dist/index.mjs
  var React26 = __toESM(require("react"));

  // node_modules/@radix-ui/primitive/dist/index.mjs
  var __defProp2 = Object.defineProperty;
  var __name = (target, value) => __defProp2(target, "name", { value, configurable: true });
  var canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);
  function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
    return /* @__PURE__ */ __name(function handleEvent(event) {
      originalEventHandler?.(event);
      if (checkForDefaultPrevented === false || !event || !event.defaultPrevented) {
        return ourEventHandler?.(event);
      }
    }, "handleEvent");
  }
  __name(composeEventHandlers, "composeEventHandlers");
  function getOwnerWindow(element) {
    if (!canUseDOM) {
      throw new Error("Cannot access window outside of the DOM");
    }
    return element?.ownerDocument?.defaultView ?? window;
  }
  __name(getOwnerWindow, "getOwnerWindow");
  function getOwnerDocument(element) {
    if (!canUseDOM) {
      throw new Error("Cannot access document outside of the DOM");
    }
    return element?.ownerDocument ?? document;
  }
  __name(getOwnerDocument, "getOwnerDocument");
  function getActiveElement(node, activeDescendant = false) {
    const { activeElement } = getOwnerDocument(node);
    if (!activeElement?.nodeName) {
      return null;
    }
    if (isFrame(activeElement) && activeElement.contentDocument) {
      return getActiveElement(activeElement.contentDocument.body, activeDescendant);
    }
    if (activeDescendant) {
      const id = activeElement.getAttribute("aria-activedescendant");
      if (id) {
        const element = getOwnerDocument(activeElement).getElementById(id);
        if (element) {
          return element;
        }
      }
    }
    return activeElement;
  }
  __name(getActiveElement, "getActiveElement");
  function isFrame(element) {
    return element.tagName === "IFRAME";
  }
  __name(isFrame, "isFrame");

  // node_modules/@radix-ui/react-compose-refs/dist/index.mjs
  var React = __toESM(require("react"));
  var __defProp3 = Object.defineProperty;
  var __name2 = (target, value) => __defProp3(target, "name", { value, configurable: true });
  function setRef(ref, value) {
    if (typeof ref === "function") {
      return ref(value);
    } else if (ref !== null && ref !== undefined) {
      ref.current = value;
    }
  }
  __name2(setRef, "setRef");
  function composeRefs(...refs) {
    return (node) => {
      let hasCleanup = false;
      const cleanups = refs.map((ref) => {
        const cleanup = setRef(ref, node);
        if (!hasCleanup && typeof cleanup == "function") {
          hasCleanup = true;
        }
        return cleanup;
      });
      if (hasCleanup) {
        return () => {
          for (let i = 0;i < cleanups.length; i++) {
            const cleanup = cleanups[i];
            if (typeof cleanup == "function") {
              cleanup();
            } else {
              setRef(refs[i], null);
            }
          }
        };
      }
    };
  }
  __name2(composeRefs, "composeRefs");
  function useComposedRefs(...refs) {
    return React.useCallback(composeRefs(...refs), refs);
  }
  __name2(useComposedRefs, "useComposedRefs");

  // node_modules/@radix-ui/react-context/dist/index.mjs
  var React3 = __toESM(require("react"));

  // tm-shim:jsx-runtime-shim
  var React2 = require("react");
  var Fragment = React2.Fragment;
  function jsx(type, props, key) {
    return React2.createElement(type, key == null ? props : Object.assign({ key }, props));
  }
  var jsxs = jsx;
  var jsxDEV = jsx;

  // node_modules/@radix-ui/react-context/dist/index.mjs
  var __defProp4 = Object.defineProperty;
  var __name3 = (target, value) => __defProp4(target, "name", { value, configurable: true });
  function createContext2(rootComponentName, defaultContext) {
    const Context = React3.createContext(defaultContext);
    Context.displayName = rootComponentName + "Context";
    const Provider = /* @__PURE__ */ __name3((props) => {
      const { children, ...context } = props;
      const value = React3.useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ jsx(Context.Provider, { value, children });
    }, "Provider");
    Provider.displayName = rootComponentName + "Provider";
    function useContext2(consumerName, options = {}) {
      const { optional = false } = options;
      const context = React3.useContext(Context);
      if (context)
        return context;
      if (defaultContext !== undefined)
        return defaultContext;
      if (optional)
        return;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    __name3(useContext2, "useContext");
    return [Provider, useContext2];
  }
  __name3(createContext2, "createContext");
  function createContextScope(scopeName, createContextScopeDeps = []) {
    let defaultContexts = [];
    function createContext3(rootComponentName, defaultContext) {
      const BaseContext = React3.createContext(defaultContext);
      BaseContext.displayName = rootComponentName + "Context";
      const index = defaultContexts.length;
      defaultContexts = [...defaultContexts, defaultContext];
      const Provider = /* @__PURE__ */ __name3((props) => {
        const { scope, children, ...context } = props;
        const Context = scope?.[scopeName]?.[index] || BaseContext;
        const value = React3.useMemo(() => context, Object.values(context));
        return /* @__PURE__ */ jsx(Context.Provider, { value, children });
      }, "Provider");
      Provider.displayName = rootComponentName + "Provider";
      function useContext2(consumerName, scope, options = {}) {
        const { optional = false } = options;
        const Context = scope?.[scopeName]?.[index] || BaseContext;
        const context = React3.useContext(Context);
        if (context)
          return context;
        if (defaultContext !== undefined)
          return defaultContext;
        if (optional)
          return;
        throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
      }
      __name3(useContext2, "useContext");
      return [Provider, useContext2];
    }
    __name3(createContext3, "createContext");
    const createScope = /* @__PURE__ */ __name3(() => {
      const scopeContexts = defaultContexts.map((defaultContext) => {
        return React3.createContext(defaultContext);
      });
      return /* @__PURE__ */ __name3(function useScope(scope) {
        const contexts = scope?.[scopeName] || scopeContexts;
        return React3.useMemo(() => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }), [scope, contexts]);
      }, "useScope");
    }, "createScope");
    createScope.scopeName = scopeName;
    return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
  }
  __name3(createContextScope, "createContextScope");
  function composeContextScopes(...scopes) {
    const baseScope = scopes[0];
    if (scopes.length === 1)
      return baseScope;
    const createScope = /* @__PURE__ */ __name3(() => {
      const scopeHooks = scopes.map((createScope2) => ({
        useScope: createScope2(),
        scopeName: createScope2.scopeName
      }));
      return /* @__PURE__ */ __name3(function useComposedScopes(overrideScopes) {
        const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
          const scopeProps = useScope(overrideScopes);
          const currentScope = scopeProps[`__scope${scopeName}`];
          return { ...nextScopes2, ...currentScope };
        }, {});
        return React3.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
      }, "useComposedScopes");
    }, "createScope");
    createScope.scopeName = baseScope.scopeName;
    return createScope;
  }
  __name3(composeContextScopes, "composeContextScopes");

  // node_modules/@radix-ui/react-id/dist/index.mjs
  var React5 = __toESM(require("react"));

  // node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
  var React4 = __toESM(require("react"));
  var useLayoutEffect2 = globalThis?.document ? React4.useLayoutEffect : () => {};

  // node_modules/@radix-ui/react-id/dist/index.mjs
  var __defProp5 = Object.defineProperty;
  var __name4 = (target, value) => __defProp5(target, "name", { value, configurable: true });
  var useReactId = React5[" useId ".trim().toString()] || (() => {
    return;
  });
  var count = 0;
  function useId(deterministicId) {
    const [id, setId] = React5.useState(useReactId());
    useLayoutEffect2(() => {
      if (!deterministicId)
        setId((reactId) => reactId ?? String(count++));
    }, [deterministicId]);
    return deterministicId || (id ? `radix-${id}` : "");
  }
  __name4(useId, "useId");

  // node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs
  var React7 = __toESM(require("react"));

  // node_modules/@radix-ui/primitive/dist/internal/is-development.true.mjs
  var IS_DEVELOPMENT = true;

  // node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs
  var React22 = __toESM(require("react"));

  // node_modules/@radix-ui/react-use-effect-event/dist/index.mjs
  var React6 = __toESM(require("react"));
  var __defProp6 = Object.defineProperty;
  var __name5 = (target, value) => __defProp6(target, "name", { value, configurable: true });
  var useReactEffectEvent = React6[" useEffectEvent ".trim().toString()];
  var useReactInsertionEffect = React6[" useInsertionEffect ".trim().toString()];
  function useEffectEvent(callback) {
    if (typeof useReactEffectEvent === "function") {
      return useReactEffectEvent(callback);
    }
    const ref = React6.useRef(() => {
      throw new Error("Cannot call an event handler while rendering.");
    });
    if (typeof useReactInsertionEffect === "function") {
      useReactInsertionEffect(() => {
        ref.current = callback;
      });
    } else {
      useLayoutEffect2(() => {
        ref.current = callback;
      });
    }
    return React6.useMemo(() => (...args) => ref.current?.(...args), []);
  }
  __name5(useEffectEvent, "useEffectEvent");

  // node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs
  var __defProp7 = Object.defineProperty;
  var __name6 = (target, value) => __defProp7(target, "name", { value, configurable: true });
  var useInsertionEffect = React7[" useInsertionEffect ".trim().toString()] || useLayoutEffect2;
  function useControllableState({
    prop,
    defaultProp,
    onChange = /* @__PURE__ */ __name6(() => {}, "onChange"),
    caller
  }) {
    const [uncontrolledProp, setUncontrolledProp, onChangeRef] = useUncontrolledState({
      defaultProp,
      onChange
    });
    const isControlled = prop !== undefined;
    const value = isControlled ? prop : uncontrolledProp;
    if (IS_DEVELOPMENT) {
      const isControlledRef = React7.useRef(prop !== undefined);
      React7.useEffect(() => {
        const wasControlled = isControlledRef.current;
        if (wasControlled !== isControlled) {
          const from = wasControlled ? "controlled" : "uncontrolled";
          const to = isControlled ? "controlled" : "uncontrolled";
          console.warn(`${caller} is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`);
        }
        isControlledRef.current = isControlled;
      }, [isControlled, caller]);
    }
    const setValue = React7.useCallback((nextValue) => {
      if (isControlled) {
        const value2 = isFunction(nextValue) ? nextValue(prop) : nextValue;
        if (value2 !== prop) {
          onChangeRef.current?.(value2);
        }
      } else {
        setUncontrolledProp(nextValue);
      }
    }, [isControlled, prop, setUncontrolledProp, onChangeRef]);
    return [value, setValue];
  }
  __name6(useControllableState, "useControllableState");
  function useUncontrolledState({
    defaultProp,
    onChange
  }) {
    const [value, setValue] = React7.useState(defaultProp);
    const prevValueRef = React7.useRef(value);
    const onChangeRef = React7.useRef(onChange);
    useInsertionEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);
    React7.useEffect(() => {
      if (prevValueRef.current !== value) {
        onChangeRef.current?.(value);
        prevValueRef.current = value;
      }
    }, [value, prevValueRef]);
    return [value, setValue, onChangeRef];
  }
  __name6(useUncontrolledState, "useUncontrolledState");
  function isFunction(value) {
    return typeof value === "function";
  }
  __name6(isFunction, "isFunction");
  var SYNC_STATE = Symbol("RADIX:SYNC_STATE");
  function useControllableStateReducer(reducer, userArgs, initialArg, init) {
    const { prop: controlledState, defaultProp, onChange: onChangeProp, caller } = userArgs;
    const isControlled = controlledState !== undefined;
    const onChange = useEffectEvent(onChangeProp);
    if (IS_DEVELOPMENT) {
      const isControlledRef = React22.useRef(controlledState !== undefined);
      React22.useEffect(() => {
        const wasControlled = isControlledRef.current;
        if (wasControlled !== isControlled) {
          const from = wasControlled ? "controlled" : "uncontrolled";
          const to = isControlled ? "controlled" : "uncontrolled";
          console.warn(`${caller} is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`);
        }
        isControlledRef.current = isControlled;
      }, [isControlled, caller]);
    }
    const args = [{ ...initialArg, state: defaultProp }];
    if (init) {
      args.push(init);
    }
    const [internalState, dispatch] = React22.useReducer((state2, action) => {
      if (action.type === SYNC_STATE) {
        return { ...state2, state: action.state };
      }
      const next = reducer(state2, action);
      if (isControlled && !Object.is(next.state, state2.state)) {
        onChange(next.state);
      }
      return next;
    }, ...args);
    const uncontrolledState = internalState.state;
    const prevValueRef = React22.useRef(uncontrolledState);
    React22.useEffect(() => {
      if (prevValueRef.current !== uncontrolledState) {
        prevValueRef.current = uncontrolledState;
        if (!isControlled) {
          onChange(uncontrolledState);
        }
      }
    }, [uncontrolledState, prevValueRef, isControlled]);
    const state = React22.useMemo(() => {
      const isControlled2 = controlledState !== undefined;
      if (isControlled2) {
        return { ...internalState, state: controlledState };
      }
      return internalState;
    }, [internalState, controlledState]);
    React22.useEffect(() => {
      if (isControlled && !Object.is(controlledState, internalState.state)) {
        dispatch({ type: SYNC_STATE, state: controlledState });
      }
    }, [controlledState, internalState.state, isControlled]);
    return [state, dispatch];
  }
  __name6(useControllableStateReducer, "useControllableStateReducer");

  // node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
  var React11 = __toESM(require("react"));

  // node_modules/@radix-ui/react-primitive/dist/index.mjs
  var React9 = __toESM(require("react"));
  var ReactDOM = __toESM(require("react-dom"));

  // node_modules/@radix-ui/react-slot/dist/index.mjs
  var React8 = __toESM(require("react"));
  var __defProp8 = Object.defineProperty;
  var __name7 = (target, value) => __defProp8(target, "name", { value, configurable: true });
  function createSlot(ownerName) {
    const Slot2 = React8.forwardRef((props, forwardedRef) => {
      let { children, ...slotProps } = props;
      let slottableElement = null;
      let hasSlottable = false;
      const newChildren = [];
      children = useUnwrappedLazy(children);
      React8.Children.forEach(children, (maybeSlottable) => {
        if (isSlottable(maybeSlottable)) {
          hasSlottable = true;
          const slottable = maybeSlottable;
          let child = "child" in slottable.props ? slottable.props.child : slottable.props.children;
          while (isLazyComponent(child) && typeof use === "function") {
            child = use(child._payload);
          }
          slottableElement = getSlottableElementFromSlottable(slottable, child);
          newChildren.push(slottableElement?.props?.children);
        } else {
          newChildren.push(maybeSlottable);
        }
      });
      if (slottableElement) {
        slottableElement = React8.cloneElement(slottableElement, undefined, newChildren);
      } else if (!hasSlottable && React8.Children.count(children) === 1 && React8.isValidElement(children)) {
        slottableElement = children;
      }
      const slottableElementRef = slottableElement ? getElementRef(slottableElement) : undefined;
      const composedRef = useComposedRefs(forwardedRef, slottableElementRef);
      if (!slottableElement) {
        if (children || children === 0) {
          throw new Error(hasSlottable ? createSlottableError(ownerName) : createSlotError(ownerName));
        }
        return children;
      }
      const mergedProps = mergeProps(slotProps, slottableElement.props ?? {});
      if (slottableElement.type !== React8.Fragment) {
        mergedProps.ref = forwardedRef ? composedRef : slottableElementRef;
      }
      return React8.cloneElement(slottableElement, mergedProps);
    });
    Slot2.displayName = `${ownerName}.Slot`;
    return Slot2;
  }
  __name7(createSlot, "createSlot");
  var SLOTTABLE_IDENTIFIER = Symbol.for("radix.slottable");
  function createSlottable(ownerName) {
    const Slottable2 = /* @__PURE__ */ __name7((props) => ("child" in props) ? props.children(props.child) : props.children, "Slottable");
    Slottable2.displayName = `${ownerName}.Slottable`;
    Slottable2.__radixId = SLOTTABLE_IDENTIFIER;
    return Slottable2;
  }
  __name7(createSlottable, "createSlottable");
  var getSlottableElementFromSlottable = /* @__PURE__ */ __name7((slottable, child) => {
    if ("child" in slottable.props) {
      if (!React8.isValidElement(child))
        return null;
      return React8.cloneElement(child, undefined, slottable.props.children(child.props.children));
    }
    return React8.isValidElement(child) ? child : null;
  }, "getSlottableElementFromSlottable");
  function mergeProps(slotProps, childProps) {
    const overrideProps = { ...childProps };
    for (const propName in childProps) {
      const slotPropValue = slotProps[propName];
      const childPropValue = childProps[propName];
      const isHandler = /^on[A-Z]/.test(propName);
      if (isHandler) {
        if (slotPropValue && childPropValue) {
          overrideProps[propName] = (...args) => {
            const result = childPropValue(...args);
            slotPropValue(...args);
            return result;
          };
        } else if (slotPropValue) {
          overrideProps[propName] = slotPropValue;
        }
      } else if (propName === "style") {
        overrideProps[propName] = { ...slotPropValue, ...childPropValue };
      } else if (propName === "className") {
        overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
      } else if (propName === "aria-describedby") {
        overrideProps[propName] = concatAriaDescribedby(childPropValue, slotPropValue);
      }
    }
    return { ...slotProps, ...overrideProps };
  }
  __name7(mergeProps, "mergeProps");
  function getElementRef(element) {
    let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
    let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.ref;
    }
    getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
    mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.props.ref;
    }
    return element.props.ref || element.ref;
  }
  __name7(getElementRef, "getElementRef");
  function isSlottable(child) {
    return React8.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
  }
  __name7(isSlottable, "isSlottable");
  var REACT_LAZY_TYPE = Symbol.for("react.lazy");
  function isLazyComponent(element) {
    return element != null && typeof element === "object" && "$$typeof" in element && element.$$typeof === REACT_LAZY_TYPE && "_payload" in element && isPromiseLike(element._payload);
  }
  __name7(isLazyComponent, "isLazyComponent");
  function isPromiseLike(value) {
    return typeof value === "object" && value !== null && "then" in value;
  }
  __name7(isPromiseLike, "isPromiseLike");
  function useUnwrappedLazy(value) {
    let unwrapped = value;
    while (isLazyComponent(unwrapped) && typeof use === "function") {
      unwrapped = use(unwrapped._payload);
    }
    return unwrapped;
  }
  __name7(useUnwrappedLazy, "useUnwrappedLazy");
  function concatAriaDescribedby(...values) {
    const ids = /* @__PURE__ */ new Set;
    for (const value of values) {
      if (typeof value !== "string")
        continue;
      for (const id of String(value).trim().split(/\s+/)) {
        if (id)
          ids.add(id);
      }
    }
    return ids.size > 0 ? Array.from(ids).join(" ") : undefined;
  }
  __name7(concatAriaDescribedby, "concatAriaDescribedby");
  var createSlotError = /* @__PURE__ */ __name7((ownerName) => {
    return `${ownerName} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`;
  }, "createSlotError");
  var createSlottableError = /* @__PURE__ */ __name7((ownerName) => {
    return `${ownerName} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`;
  }, "createSlottableError");
  var use = React8[" use ".trim().toString()];

  // node_modules/@radix-ui/react-primitive/dist/index.mjs
  "use client";
  var __defProp9 = Object.defineProperty;
  var __name8 = (target, value) => __defProp9(target, "name", { value, configurable: true });
  var NODES = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul"
  ];
  var Primitive = NODES.reduce((primitive, node) => {
    const Slot = createSlot(`Primitive.${node}`);
    const Node2 = React9.forwardRef((props, forwardedRef) => {
      const { asChild, ...primitiveProps } = props;
      const Comp = asChild ? Slot : node;
      if (typeof window !== "undefined") {
        window[Symbol.for("radix-ui")] = true;
      }
      return /* @__PURE__ */ jsx(Comp, { ...primitiveProps, ref: forwardedRef });
    });
    Node2.displayName = `Primitive.${node}`;
    return { ...primitive, [node]: Node2 };
  }, {});
  function dispatchDiscreteCustomEvent(target, event) {
    if (target)
      ReactDOM.flushSync(() => target.dispatchEvent(event));
  }
  __name8(dispatchDiscreteCustomEvent, "dispatchDiscreteCustomEvent");

  // node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
  var React10 = __toESM(require("react"));
  var __defProp10 = Object.defineProperty;
  var __name9 = (target, value) => __defProp10(target, "name", { value, configurable: true });
  var useReactInsertionEffect2 = React10[" useInsertionEffect ".trim().toString()];
  function useCallbackRef(callback) {
    const callbackRef = React10.useRef(callback);
    if (typeof useReactInsertionEffect2 === "function") {
      useReactInsertionEffect2(() => {
        callbackRef.current = callback;
      });
    } else {
      useLayoutEffect2(() => {
        callbackRef.current = callback;
      });
    }
    return React10.useMemo(() => (...args) => callbackRef.current?.(...args), []);
  }
  __name9(useCallbackRef, "useCallbackRef");

  // node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
  "use client";
  var __defProp11 = Object.defineProperty;
  var __name10 = (target, value) => __defProp11(target, "name", { value, configurable: true });
  var CONTEXT_UPDATE = "dismissableLayer.update";
  var POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";
  var FOCUS_OUTSIDE = "dismissableLayer.focusOutside";
  var originalBodyPointerEvents;
  var DismissableLayerContext = React11.createContext({
    layers: /* @__PURE__ */ new Set,
    layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set,
    branches: /* @__PURE__ */ new Set,
    dismissableSurfaces: /* @__PURE__ */ new Set
  });
  var DismissableLayer = /* @__PURE__ */ React11.forwardRef(/* @__PURE__ */ __name10(function DismissableLayer2(props, forwardedRef) {
    const {
      disableOutsidePointerEvents = false,
      deferPointerDownOutside = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      ...layerProps
    } = props;
    const context = React11.useContext(DismissableLayerContext);
    const [node, setNode] = React11.useState(null);
    const ownerDocument = node?.ownerDocument ?? globalThis?.document;
    const [, force] = React11.useState({});
    const composedRefs = useComposedRefs(forwardedRef, setNode);
    const layers = Array.from(context.layers);
    const [highestLayerWithOutsidePointerEventsDisabled] = [
      ...context.layersWithOutsidePointerEventsDisabled
    ].slice(-1);
    const highestLayerWithOutsidePointerEventsDisabledIndex = highestLayerWithOutsidePointerEventsDisabled ? layers.indexOf(highestLayerWithOutsidePointerEventsDisabled) : -1;
    const index = node ? layers.indexOf(node) : -1;
    const isBodyPointerEventsDisabled = context.layersWithOutsidePointerEventsDisabled.size > 0;
    const isPointerEventsEnabled = index >= highestLayerWithOutsidePointerEventsDisabledIndex;
    const isDeferredPointerDownOutsideRef = React11.useRef(false);
    const pointerDownOutside = usePointerDownOutside((event) => {
      onPointerDownOutside?.(event);
      onInteractOutside?.(event);
      if (!event.defaultPrevented)
        onDismiss?.();
    }, {
      ownerDocument,
      deferPointerDownOutside,
      isDeferredPointerDownOutsideRef,
      dismissableSurfaces: context.dismissableSurfaces,
      shouldHandlePointerDownOutside: React11.useCallback((target) => {
        if (!(target instanceof Node)) {
          return false;
        }
        const isPointerDownOnBranch = [...context.branches].some((branch) => branch.contains(target));
        return isPointerEventsEnabled && !isPointerDownOnBranch;
      }, [context.branches, isPointerEventsEnabled])
    });
    const focusOutside = useFocusOutside((event) => {
      if (deferPointerDownOutside && isDeferredPointerDownOutsideRef.current) {
        return;
      }
      const target = event.target;
      const isFocusInBranch = [...context.branches].some((branch) => branch.contains(target));
      if (isFocusInBranch)
        return;
      onFocusOutside?.(event);
      onInteractOutside?.(event);
      if (!event.defaultPrevented)
        onDismiss?.();
    }, ownerDocument);
    const isHighestLayer = node ? index === layers.length - 1 : false;
    const handleKeyDown = useCallbackRef((event) => {
      if (event.key !== "Escape") {
        return;
      }
      onEscapeKeyDown?.(event);
      if (!event.defaultPrevented && onDismiss) {
        event.preventDefault();
        onDismiss();
      }
    });
    React11.useEffect(() => {
      if (!isHighestLayer) {
        return;
      }
      ownerDocument.addEventListener("keydown", handleKeyDown, { capture: true });
      return () => ownerDocument.removeEventListener("keydown", handleKeyDown, { capture: true });
    }, [ownerDocument, isHighestLayer, handleKeyDown]);
    React11.useEffect(() => {
      if (!node)
        return;
      if (disableOutsidePointerEvents) {
        if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
          originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
          ownerDocument.body.style.pointerEvents = "none";
        }
        context.layersWithOutsidePointerEventsDisabled.add(node);
      }
      context.layers.add(node);
      dispatchUpdate();
      return () => {
        if (disableOutsidePointerEvents) {
          context.layersWithOutsidePointerEventsDisabled.delete(node);
          if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
            ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
          }
        }
      };
    }, [node, ownerDocument, disableOutsidePointerEvents, context]);
    React11.useEffect(() => {
      return () => {
        if (!node)
          return;
        context.layers.delete(node);
        context.layersWithOutsidePointerEventsDisabled.delete(node);
        dispatchUpdate();
      };
    }, [node, context]);
    React11.useEffect(() => {
      const handleUpdate = /* @__PURE__ */ __name10(() => force({}), "handleUpdate");
      document.addEventListener(CONTEXT_UPDATE, handleUpdate);
      return () => document.removeEventListener(CONTEXT_UPDATE, handleUpdate);
    }, []);
    return /* @__PURE__ */ jsx(Primitive.div, {
      ...layerProps,
      ref: composedRefs,
      style: {
        pointerEvents: isBodyPointerEventsDisabled ? isPointerEventsEnabled ? "auto" : "none" : undefined,
        ...props.style
      },
      onFocusCapture: composeEventHandlers(props.onFocusCapture, focusOutside.onFocusCapture),
      onBlurCapture: composeEventHandlers(props.onBlurCapture, focusOutside.onBlurCapture),
      onPointerDownCapture: composeEventHandlers(props.onPointerDownCapture, pointerDownOutside.onPointerDownCapture)
    });
  }, "DismissableLayer"));
  function useDismissableLayerSurface() {
    const context = React11.useContext(DismissableLayerContext);
    const [node, setNode] = React11.useState(null);
    React11.useEffect(() => {
      if (!node) {
        return;
      }
      context.dismissableSurfaces.add(node);
      return () => {
        context.dismissableSurfaces.delete(node);
      };
    }, [node, context.dismissableSurfaces]);
    return setNode;
  }
  __name10(useDismissableLayerSurface, "useDismissableLayerSurface");
  var IS_TRUE = /* @__PURE__ */ __name10(() => true, "IS_TRUE");
  function usePointerDownOutside(onPointerDownOutside, args) {
    const {
      ownerDocument = globalThis?.document,
      deferPointerDownOutside = false,
      isDeferredPointerDownOutsideRef,
      dismissableSurfaces,
      shouldHandlePointerDownOutside = IS_TRUE
    } = args;
    const handlePointerDownOutside = useCallbackRef(onPointerDownOutside);
    const isPointerInsideReactTreeRef = React11.useRef(false);
    const isPointerDownOutsideRef = React11.useRef(false);
    const interceptedOutsideInteractionEventsRef = React11.useRef(/* @__PURE__ */ new Map);
    const handleClickRef = React11.useRef(() => {});
    React11.useEffect(() => {
      function resetOutsideInteraction() {
        isPointerDownOutsideRef.current = false;
        isDeferredPointerDownOutsideRef.current = false;
        interceptedOutsideInteractionEventsRef.current.clear();
      }
      __name10(resetOutsideInteraction, "resetOutsideInteraction");
      function isOutsideInteractionIntercepted() {
        return Array.from(interceptedOutsideInteractionEventsRef.current.values()).some(Boolean);
      }
      __name10(isOutsideInteractionIntercepted, "isOutsideInteractionIntercepted");
      function handleInteractionCapture(event) {
        if (!isPointerDownOutsideRef.current) {
          return;
        }
        const target = event.target;
        const isDismissableSurface = target instanceof Node && [...dismissableSurfaces].some((surface) => surface.contains(target));
        if (!isDismissableSurface) {
          interceptedOutsideInteractionEventsRef.current.set(event.type, true);
        }
        if (event.type === "click") {
          window.setTimeout(() => {
            if (isPointerDownOutsideRef.current) {
              handleClickRef.current();
            }
          }, 0);
        }
      }
      __name10(handleInteractionCapture, "handleInteractionCapture");
      function handleInteractionBubble(event) {
        if (isPointerDownOutsideRef.current) {
          interceptedOutsideInteractionEventsRef.current.set(event.type, false);
        }
      }
      __name10(handleInteractionBubble, "handleInteractionBubble");
      const handlePointerDown = /* @__PURE__ */ __name10((event) => {
        if (event.target && !isPointerInsideReactTreeRef.current) {
          let handleAndDispatchPointerDownOutsideEvent2 = function() {
            ownerDocument.removeEventListener("click", handleClickRef.current);
            const wasOutsideInteractionIntercepted = isOutsideInteractionIntercepted();
            resetOutsideInteraction();
            if (!wasOutsideInteractionIntercepted) {
              handleAndDispatchCustomEvent(POINTER_DOWN_OUTSIDE, handlePointerDownOutside, eventDetail, { discrete: true });
            }
          };
          var handleAndDispatchPointerDownOutsideEvent = handleAndDispatchPointerDownOutsideEvent2;
          __name10(handleAndDispatchPointerDownOutsideEvent2, "handleAndDispatchPointerDownOutsideEvent");
          if (!shouldHandlePointerDownOutside(event.target)) {
            ownerDocument.removeEventListener("click", handleClickRef.current);
            resetOutsideInteraction();
            isPointerInsideReactTreeRef.current = false;
            return;
          }
          const eventDetail = { originalEvent: event };
          isPointerDownOutsideRef.current = true;
          isDeferredPointerDownOutsideRef.current = deferPointerDownOutside && event.button === 0;
          interceptedOutsideInteractionEventsRef.current.clear();
          if (!deferPointerDownOutside || event.button !== 0) {
            handleAndDispatchPointerDownOutsideEvent2();
          } else {
            ownerDocument.removeEventListener("click", handleClickRef.current);
            handleClickRef.current = handleAndDispatchPointerDownOutsideEvent2;
            ownerDocument.addEventListener("click", handleClickRef.current, { once: true });
          }
        } else {
          ownerDocument.removeEventListener("click", handleClickRef.current);
          resetOutsideInteraction();
        }
        isPointerInsideReactTreeRef.current = false;
      }, "handlePointerDown");
      const outsideInteractionEvents = [
        "pointerup",
        "mousedown",
        "mouseup",
        "touchstart",
        "touchend",
        "click"
      ];
      for (const eventName of outsideInteractionEvents) {
        ownerDocument.addEventListener(eventName, handleInteractionCapture, true);
        ownerDocument.addEventListener(eventName, handleInteractionBubble);
      }
      const timerId = window.setTimeout(() => {
        ownerDocument.addEventListener("pointerdown", handlePointerDown);
      }, 0);
      return () => {
        window.clearTimeout(timerId);
        ownerDocument.removeEventListener("pointerdown", handlePointerDown);
        ownerDocument.removeEventListener("click", handleClickRef.current);
        for (const eventName of outsideInteractionEvents) {
          ownerDocument.removeEventListener(eventName, handleInteractionCapture, true);
          ownerDocument.removeEventListener(eventName, handleInteractionBubble);
        }
      };
    }, [
      ownerDocument,
      handlePointerDownOutside,
      deferPointerDownOutside,
      isDeferredPointerDownOutsideRef,
      dismissableSurfaces,
      shouldHandlePointerDownOutside
    ]);
    return {
      onPointerDownCapture: /* @__PURE__ */ __name10(() => isPointerInsideReactTreeRef.current = true, "onPointerDownCapture")
    };
  }
  __name10(usePointerDownOutside, "usePointerDownOutside");
  function useFocusOutside(onFocusOutside, ownerDocument = globalThis?.document) {
    const handleFocusOutside = useCallbackRef(onFocusOutside);
    const isFocusInsideReactTreeRef = React11.useRef(false);
    React11.useEffect(() => {
      const handleFocus = /* @__PURE__ */ __name10((event) => {
        if (event.target && !isFocusInsideReactTreeRef.current) {
          const eventDetail = { originalEvent: event };
          handleAndDispatchCustomEvent(FOCUS_OUTSIDE, handleFocusOutside, eventDetail, {
            discrete: false
          });
        }
      }, "handleFocus");
      ownerDocument.addEventListener("focusin", handleFocus);
      return () => ownerDocument.removeEventListener("focusin", handleFocus);
    }, [ownerDocument, handleFocusOutside]);
    return {
      onFocusCapture: /* @__PURE__ */ __name10(() => isFocusInsideReactTreeRef.current = true, "onFocusCapture"),
      onBlurCapture: /* @__PURE__ */ __name10(() => isFocusInsideReactTreeRef.current = false, "onBlurCapture")
    };
  }
  __name10(useFocusOutside, "useFocusOutside");
  function dispatchUpdate() {
    const event = new CustomEvent(CONTEXT_UPDATE);
    document.dispatchEvent(event);
  }
  __name10(dispatchUpdate, "dispatchUpdate");
  function handleAndDispatchCustomEvent(name, handler, detail, { discrete }) {
    const target = detail.originalEvent.target;
    const event = new CustomEvent(name, { bubbles: false, cancelable: true, detail });
    if (handler)
      target.addEventListener(name, handler, { once: true });
    if (discrete) {
      dispatchDiscreteCustomEvent(target, event);
    } else {
      target.dispatchEvent(event);
    }
  }
  __name10(handleAndDispatchCustomEvent, "handleAndDispatchCustomEvent");

  // node_modules/@radix-ui/react-focus-scope/dist/index.mjs
  var React12 = __toESM(require("react"));
  "use client";
  var __defProp12 = Object.defineProperty;
  var __name11 = (target, value) => __defProp12(target, "name", { value, configurable: true });
  var AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
  var AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
  var EVENT_OPTIONS = { bubbles: false, cancelable: true };
  var FocusScope = /* @__PURE__ */ React12.forwardRef(/* @__PURE__ */ __name11(function FocusScope2(props, forwardedRef) {
    const {
      loop = false,
      trapped = false,
      branches,
      onMountAutoFocus: onMountAutoFocusProp,
      onUnmountAutoFocus: onUnmountAutoFocusProp,
      ...scopeProps
    } = props;
    const [container, setContainer] = React12.useState(null);
    const onMountAutoFocus = useCallbackRef(onMountAutoFocusProp);
    const onUnmountAutoFocus = useCallbackRef(onUnmountAutoFocusProp);
    const lastFocusedElementRef = React12.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, setContainer);
    const branchesRef = React12.useRef(branches);
    React12.useEffect(() => {
      branchesRef.current = branches;
    });
    const isTargetInScope = React12.useCallback((target) => {
      if (!target)
        return false;
      if (container?.contains(target))
        return true;
      return Boolean(branchesRef.current?.some((branch) => branch.contains(target)));
    }, [container]);
    const focusScope = React12.useRef({
      paused: false,
      pause() {
        this.paused = true;
      },
      resume() {
        this.paused = false;
      }
    }).current;
    React12.useEffect(() => {
      if (trapped) {
        let handleFocusIn2 = function(event) {
          if (focusScope.paused || !container)
            return;
          const target = event.target;
          if (isTargetInScope(target)) {
            lastFocusedElementRef.current = target;
          } else {
            focus(lastFocusedElementRef.current, { select: true });
          }
        }, handleFocusOut2 = function(event) {
          if (focusScope.paused || !container)
            return;
          const relatedTarget = event.relatedTarget;
          if (relatedTarget === null)
            return;
          if (!isTargetInScope(relatedTarget)) {
            focus(lastFocusedElementRef.current, { select: true });
          }
        }, handleMutations2 = function(mutations) {
          const focusedElement = document.activeElement;
          if (focusedElement !== document.body)
            return;
          for (const mutation of mutations) {
            if (mutation.removedNodes.length > 0)
              focus(container);
          }
        };
        var handleFocusIn = handleFocusIn2, handleFocusOut = handleFocusOut2, handleMutations = handleMutations2;
        __name11(handleFocusIn2, "handleFocusIn");
        __name11(handleFocusOut2, "handleFocusOut");
        __name11(handleMutations2, "handleMutations");
        document.addEventListener("focusin", handleFocusIn2);
        document.addEventListener("focusout", handleFocusOut2);
        const mutationObserver = new MutationObserver(handleMutations2);
        if (container)
          mutationObserver.observe(container, { childList: true, subtree: true });
        return () => {
          document.removeEventListener("focusin", handleFocusIn2);
          document.removeEventListener("focusout", handleFocusOut2);
          mutationObserver.disconnect();
        };
      }
    }, [trapped, container, focusScope.paused, isTargetInScope]);
    React12.useEffect(() => {
      if (container) {
        focusScopesStack.add(focusScope);
        const previouslyFocusedElement = document.activeElement;
        const hasFocusedCandidate = container.contains(previouslyFocusedElement);
        if (!hasFocusedCandidate) {
          const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
          container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
          container.dispatchEvent(mountEvent);
          if (!mountEvent.defaultPrevented) {
            focusFirst(removeLinks(getTabbableCandidates(container)), { select: true });
            if (document.activeElement === previouslyFocusedElement) {
              focus(container);
            }
          }
        }
        return () => {
          container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
          const ownerDocument = container.ownerDocument;
          const UnmountEvent = CustomEvent;
          setTimeout(() => {
            const unmountEvent = new UnmountEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
            container.addEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
            container.dispatchEvent(unmountEvent);
            if (!unmountEvent.defaultPrevented) {
              focus(previouslyFocusedElement ?? ownerDocument.body, { select: true });
            }
            container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
            focusScopesStack.remove(focusScope);
          }, 0);
        };
      }
    }, [container, onMountAutoFocus, onUnmountAutoFocus, focusScope]);
    const handleKeyDown = React12.useCallback((event) => {
      if (!loop && !trapped)
        return;
      if (focusScope.paused)
        return;
      const isTabKey = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;
      const focusedElement = document.activeElement;
      if (isTabKey && focusedElement) {
        const container2 = event.currentTarget;
        const [first, last] = getTabbableEdges(container2);
        const hasTabbableElementsInside = first && last;
        if (!hasTabbableElementsInside) {
          if (focusedElement === container2)
            event.preventDefault();
        } else {
          if (!event.shiftKey && focusedElement === last) {
            event.preventDefault();
            if (loop)
              focus(first, { select: true });
          } else if (event.shiftKey && focusedElement === first) {
            event.preventDefault();
            if (loop)
              focus(last, { select: true });
          }
        }
      }
    }, [loop, trapped, focusScope.paused]);
    return /* @__PURE__ */ jsx(Primitive.div, { tabIndex: -1, ...scopeProps, ref: composedRefs, onKeyDown: handleKeyDown });
  }, "FocusScope"));
  var FocusScopeBranchContext = React12.createContext(null);
  function FocusScopeBranchProvider({ registry, children }) {
    if (!registry) {
      return children;
    }
    return /* @__PURE__ */ jsx(FocusScopeBranchContext.Provider, { value: registry, children });
  }
  __name11(FocusScopeBranchProvider, "FocusScopeBranchProvider");
  function useFocusScopeBranchRegistry() {
    const [nodes, setNodes] = React12.useState([]);
    const registry = React12.useMemo(() => ({
      add: /* @__PURE__ */ __name11((node) => setNodes((prev) => prev.includes(node) ? prev : [...prev, node]), "add"),
      remove: /* @__PURE__ */ __name11((node) => setNodes((prev) => prev.filter((current) => current !== node)), "remove")
    }), []);
    return { nodes, registry };
  }
  __name11(useFocusScopeBranchRegistry, "useFocusScopeBranchRegistry");
  function useFocusScopeBranch(node) {
    const registry = React12.useContext(FocusScopeBranchContext);
    React12.useEffect(() => {
      if (!node || !registry)
        return;
      registry.add(node);
      return () => registry.remove(node);
    }, [node, registry]);
  }
  __name11(useFocusScopeBranch, "useFocusScopeBranch");
  function focusFirst(candidates, { select = false } = {}) {
    const previouslyFocusedElement = document.activeElement;
    for (const candidate of candidates) {
      focus(candidate, { select });
      if (document.activeElement !== previouslyFocusedElement)
        return;
    }
  }
  __name11(focusFirst, "focusFirst");
  function getTabbableEdges(container) {
    const candidates = getTabbableCandidates(container);
    const first = findVisible(candidates, container);
    const last = findVisible(candidates.reverse(), container);
    return [first, last];
  }
  __name11(getTabbableEdges, "getTabbableEdges");
  function getTabbableCandidates(container) {
    const nodes = [];
    const document2 = container.ownerDocument;
    const walker = document2.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
      acceptNode: /* @__PURE__ */ __name11((node) => {
        const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
        if (node.disabled || node.hidden || isHiddenInput) {
          return NodeFilter.FILTER_SKIP;
        }
        return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }, "acceptNode")
    });
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }
    return nodes;
  }
  __name11(getTabbableCandidates, "getTabbableCandidates");
  function findVisible(elements, container) {
    const canUseCheckVisibility = typeof container.checkVisibility === "function" && container.checkVisibility({ checkVisibilityCSS: true });
    for (const element of elements) {
      const hidden = canUseCheckVisibility ? !element.checkVisibility({ checkVisibilityCSS: true }) : isHidden(element, { upTo: container });
      if (!hidden) {
        return element;
      }
    }
  }
  __name11(findVisible, "findVisible");
  function isHidden(node, { upTo }) {
    if (getComputedStyle(node).visibility === "hidden")
      return true;
    while (node) {
      if (upTo !== undefined && node === upTo)
        return false;
      if (getComputedStyle(node).display === "none")
        return true;
      node = node.parentElement;
    }
    return false;
  }
  __name11(isHidden, "isHidden");
  function isSelectableInput(element) {
    return element.tagName === "INPUT" && typeof element.select === "function";
  }
  __name11(isSelectableInput, "isSelectableInput");
  function focus(element, { select = false } = {}) {
    if (element && element.focus) {
      const ownerDocument = element.ownerDocument ?? document;
      const previouslyFocusedElement = ownerDocument.activeElement;
      element.focus({ preventScroll: true });
      if (element !== previouslyFocusedElement && isSelectableInput(element) && select)
        element.select();
    }
  }
  __name11(focus, "focus");
  var focusScopesStack = createFocusScopesStack();
  function createFocusScopesStack() {
    let stack = [];
    return {
      add(focusScope) {
        const activeFocusScope = stack[0];
        if (focusScope !== activeFocusScope) {
          activeFocusScope?.pause();
        }
        stack = arrayRemove(stack, focusScope);
        stack.unshift(focusScope);
      },
      remove(focusScope) {
        stack = arrayRemove(stack, focusScope);
        stack[0]?.resume();
      }
    };
  }
  __name11(createFocusScopesStack, "createFocusScopesStack");
  function arrayRemove(array, item) {
    const updatedArray = [...array];
    const index = updatedArray.indexOf(item);
    if (index !== -1) {
      updatedArray.splice(index, 1);
    }
    return updatedArray;
  }
  __name11(arrayRemove, "arrayRemove");
  function removeLinks(items) {
    return items.filter((item) => item.tagName !== "A");
  }
  __name11(removeLinks, "removeLinks");

  // node_modules/@radix-ui/react-portal/dist/index.mjs
  var React13 = __toESM(require("react"));
  var ReactDOM2 = __toESM(require("react-dom"));
  "use client";
  var __defProp13 = Object.defineProperty;
  var __name12 = (target, value) => __defProp13(target, "name", { value, configurable: true });
  var Portal = /* @__PURE__ */ React13.forwardRef(/* @__PURE__ */ __name12(function Portal2(props, forwardedRef) {
    const { container: containerProp, ...portalProps } = props;
    const [mounted, setMounted] = React13.useState(false);
    useLayoutEffect2(() => setMounted(true), []);
    const container = containerProp || mounted && globalThis?.document?.body;
    return container ? ReactDOM2.createPortal(/* @__PURE__ */ jsx(Primitive.div, { ...portalProps, ref: forwardedRef }), container) : null;
  }, "Portal"));

  // node_modules/@radix-ui/react-presence/dist/index.mjs
  var React23 = __toESM(require("react"));
  var React14 = __toESM(require("react"));
  "use client";
  var __defProp14 = Object.defineProperty;
  var __name13 = (target, value) => __defProp14(target, "name", { value, configurable: true });
  function useStateMachine(initialState, machine) {
    return React14.useReducer((state, event) => {
      const nextState = machine[state][event];
      return nextState ?? state;
    }, initialState);
  }
  __name13(useStateMachine, "useStateMachine");
  var Presence = /* @__PURE__ */ __name13((props) => {
    const { present, children } = props;
    const presence = usePresence(present);
    const child = typeof children === "function" ? children({ present: presence.isPresent }) : React23.Children.only(children);
    const ref = useStableComposedRefs(presence.ref, getElementRef2(child));
    const forceMount = typeof children === "function";
    return forceMount || presence.isPresent ? React23.cloneElement(child, { ref }) : null;
  }, "Presence");
  function usePresence(present) {
    const [node, setNode] = React23.useState();
    const stylesRef = React23.useRef(null);
    const prevPresentRef = React23.useRef(present);
    const prevAnimationNameRef = React23.useRef("none");
    const mountAnimationNameRef = React23.useRef(undefined);
    const initialState = present ? "mounted" : "unmounted";
    const [state, send] = useStateMachine(initialState, {
      mounted: {
        UNMOUNT: "unmounted",
        ANIMATION_OUT: "unmountSuspended"
      },
      unmountSuspended: {
        MOUNT: "mounted",
        ANIMATION_END: "unmounted"
      },
      unmounted: {
        MOUNT: "mounted"
      }
    });
    React23.useEffect(() => {
      if (state === "mounted") {
        prevAnimationNameRef.current = mountAnimationNameRef.current ?? getAnimationName(stylesRef.current);
        mountAnimationNameRef.current = undefined;
      } else {
        prevAnimationNameRef.current = "none";
      }
    }, [state]);
    useLayoutEffect2(() => {
      const styles = stylesRef.current;
      const wasPresent = prevPresentRef.current;
      const hasPresentChanged = wasPresent !== present;
      if (hasPresentChanged) {
        const prevAnimationName = prevAnimationNameRef.current;
        const currentAnimationName = getAnimationName(styles);
        if (present) {
          mountAnimationNameRef.current = currentAnimationName;
          send("MOUNT");
        } else if (currentAnimationName === "none" || styles?.display === "none") {
          send("UNMOUNT");
        } else {
          const isAnimating = prevAnimationName !== currentAnimationName;
          if (wasPresent && isAnimating) {
            send("ANIMATION_OUT");
          } else {
            send("UNMOUNT");
          }
        }
        prevPresentRef.current = present;
      }
    }, [present, send]);
    useLayoutEffect2(() => {
      if (node) {
        let timeoutId;
        const ownerWindow = node.ownerDocument.defaultView ?? window;
        const handleAnimationEnd = /* @__PURE__ */ __name13((event) => {
          const currentAnimationName = getAnimationName(stylesRef.current);
          const isCurrentAnimation = currentAnimationName.includes(CSS.escape(event.animationName));
          if (event.target === node && isCurrentAnimation) {
            send("ANIMATION_END");
            if (!prevPresentRef.current) {
              const currentFillMode = node.style.animationFillMode;
              node.style.animationFillMode = "forwards";
              timeoutId = ownerWindow.setTimeout(() => {
                if (node.style.animationFillMode === "forwards") {
                  node.style.animationFillMode = currentFillMode;
                }
              });
            }
          }
        }, "handleAnimationEnd");
        const handleAnimationStart = /* @__PURE__ */ __name13((event) => {
          if (event.target === node) {
            prevAnimationNameRef.current = getAnimationName(stylesRef.current);
          }
        }, "handleAnimationStart");
        node.addEventListener("animationstart", handleAnimationStart);
        node.addEventListener("animationcancel", handleAnimationEnd);
        node.addEventListener("animationend", handleAnimationEnd);
        return () => {
          ownerWindow.clearTimeout(timeoutId);
          node.removeEventListener("animationstart", handleAnimationStart);
          node.removeEventListener("animationcancel", handleAnimationEnd);
          node.removeEventListener("animationend", handleAnimationEnd);
        };
      } else {
        send("ANIMATION_END");
      }
    }, [node, send]);
    return {
      isPresent: ["mounted", "unmountSuspended"].includes(state),
      ref: React23.useCallback((node2) => {
        if (node2) {
          const styles = getComputedStyle(node2);
          stylesRef.current = styles;
          mountAnimationNameRef.current = getAnimationName(styles);
        } else {
          stylesRef.current = null;
        }
        setNode(node2);
      }, [])
    };
  }
  __name13(usePresence, "usePresence");
  function setRef2(ref, value) {
    if (typeof ref === "function") {
      return ref(value);
    } else if (ref !== null && ref !== undefined) {
      ref.current = value;
    }
  }
  __name13(setRef2, "setRef");
  function useStableComposedRefs(...refs) {
    const refsRef = React23.useRef(refs);
    refsRef.current = refs;
    return React23.useCallback((node) => {
      const currentRefs = refsRef.current;
      let hasCleanup = false;
      const cleanups = currentRefs.map((ref) => {
        const cleanup = setRef2(ref, node);
        if (!hasCleanup && typeof cleanup === "function") {
          hasCleanup = true;
        }
        return cleanup;
      });
      if (hasCleanup) {
        return () => {
          for (let i = 0;i < cleanups.length; i++) {
            const cleanup = cleanups[i];
            if (typeof cleanup === "function") {
              cleanup();
            } else {
              setRef2(currentRefs[i], null);
            }
          }
        };
      }
    }, []);
  }
  __name13(useStableComposedRefs, "useStableComposedRefs");
  function getAnimationName(styles) {
    return styles?.animationName || "none";
  }
  __name13(getAnimationName, "getAnimationName");
  function getElementRef2(element) {
    let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
    let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.ref;
    }
    getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
    mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
    if (mayWarn) {
      return element.props.ref;
    }
    return element.props.ref || element.ref;
  }
  __name13(getElementRef2, "getElementRef");

  // node_modules/@radix-ui/react-focus-guards/dist/index.mjs
  var React15 = __toESM(require("react"));
  "use client";
  var __defProp15 = Object.defineProperty;
  var __name14 = (target, value) => __defProp15(target, "name", { value, configurable: true });
  var count2 = 0;
  var guards = null;
  function FocusGuards(props) {
    useFocusGuards();
    return props.children;
  }
  __name14(FocusGuards, "FocusGuards");
  function useFocusGuards() {
    React15.useEffect(() => {
      if (!guards) {
        guards = { start: createFocusGuard(), end: createFocusGuard() };
      }
      const { start, end } = guards;
      if (document.body.firstElementChild !== start) {
        document.body.insertAdjacentElement("afterbegin", start);
      }
      if (document.body.lastElementChild !== end) {
        document.body.insertAdjacentElement("beforeend", end);
      }
      count2++;
      return () => {
        if (count2 === 1) {
          guards?.start.remove();
          guards?.end.remove();
          guards = null;
        }
        count2 = Math.max(0, count2 - 1);
      };
    }, []);
  }
  __name14(useFocusGuards, "useFocusGuards");
  function createFocusGuard() {
    const element = document.createElement("span");
    element.setAttribute("data-radix-focus-guard", "");
    element.tabIndex = 0;
    element.style.outline = "none";
    element.style.opacity = "0";
    element.style.position = "fixed";
    element.style.pointerEvents = "none";
    return element;
  }
  __name14(createFocusGuard, "createFocusGuard");

  // node_modules/tslib/tslib.es6.mjs
  var __assign = function() {
    __assign = Object.assign || function __assign2(t) {
      for (var s, i = 1, n = arguments.length;i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  function __rest(s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s);i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  }
  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar;i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  }

  // node_modules/react-remove-scroll/dist/es2015/Combination.js
  var React24 = __toESM(require("react"));

  // node_modules/react-remove-scroll/dist/es2015/UI.js
  var React18 = __toESM(require("react"));

  // node_modules/react-remove-scroll-bar/dist/es2015/constants.js
  var zeroRightClassName = "right-scroll-bar-position";
  var fullWidthClassName = "width-before-scroll-bar";
  var noScrollbarsClassName = "with-scroll-bars-hidden";
  var removedBarSizeVariable = "--removed-body-scroll-bar-size";
  // node_modules/use-callback-ref/dist/es2015/useMergeRef.js
  var React16 = __toESM(require("react"));

  // node_modules/use-callback-ref/dist/es2015/assignRef.js
  function assignRef(ref, value) {
    if (typeof ref === "function") {
      ref(value);
    } else if (ref) {
      ref.current = value;
    }
    return ref;
  }

  // node_modules/use-callback-ref/dist/es2015/useRef.js
  var import_react3 = require("react");
  function useCallbackRef2(initialValue, callback) {
    var ref = import_react3.useState(function() {
      return {
        value: initialValue,
        callback,
        facade: {
          get current() {
            return ref.value;
          },
          set current(value) {
            var last = ref.value;
            if (last !== value) {
              ref.value = value;
              ref.callback(value, last);
            }
          }
        }
      };
    })[0];
    ref.callback = callback;
    return ref.facade;
  }

  // node_modules/use-callback-ref/dist/es2015/useMergeRef.js
  var useIsomorphicLayoutEffect = typeof window !== "undefined" ? React16.useLayoutEffect : React16.useEffect;
  var currentValues = new WeakMap;
  function useMergeRefs(refs, defaultValue) {
    var callbackRef = useCallbackRef2(defaultValue || null, function(newValue) {
      return refs.forEach(function(ref) {
        return assignRef(ref, newValue);
      });
    });
    useIsomorphicLayoutEffect(function() {
      var oldValue = currentValues.get(callbackRef);
      if (oldValue) {
        var prevRefs_1 = new Set(oldValue);
        var nextRefs_1 = new Set(refs);
        var current_1 = callbackRef.current;
        prevRefs_1.forEach(function(ref) {
          if (!nextRefs_1.has(ref)) {
            assignRef(ref, null);
          }
        });
        nextRefs_1.forEach(function(ref) {
          if (!prevRefs_1.has(ref)) {
            assignRef(ref, current_1);
          }
        });
      }
      currentValues.set(callbackRef, refs);
    }, [refs]);
    return callbackRef;
  }
  // node_modules/use-sidecar/dist/es2015/medium.js
  function ItoI(a) {
    return a;
  }
  function innerCreateMedium(defaults, middleware) {
    if (middleware === undefined) {
      middleware = ItoI;
    }
    var buffer = [];
    var assigned = false;
    var medium = {
      read: function() {
        if (assigned) {
          throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
        }
        if (buffer.length) {
          return buffer[buffer.length - 1];
        }
        return defaults;
      },
      useMedium: function(data) {
        var item = middleware(data, assigned);
        buffer.push(item);
        return function() {
          buffer = buffer.filter(function(x) {
            return x !== item;
          });
        };
      },
      assignSyncMedium: function(cb) {
        assigned = true;
        while (buffer.length) {
          var cbs = buffer;
          buffer = [];
          cbs.forEach(cb);
        }
        buffer = {
          push: function(x) {
            return cb(x);
          },
          filter: function() {
            return buffer;
          }
        };
      },
      assignMedium: function(cb) {
        assigned = true;
        var pendingQueue = [];
        if (buffer.length) {
          var cbs = buffer;
          buffer = [];
          cbs.forEach(cb);
          pendingQueue = buffer;
        }
        var executeQueue = function() {
          var cbs2 = pendingQueue;
          pendingQueue = [];
          cbs2.forEach(cb);
        };
        var cycle = function() {
          return Promise.resolve().then(executeQueue);
        };
        cycle();
        buffer = {
          push: function(x) {
            pendingQueue.push(x);
            cycle();
          },
          filter: function(filter) {
            pendingQueue = pendingQueue.filter(filter);
            return buffer;
          }
        };
      }
    };
    return medium;
  }
  function createSidecarMedium(options) {
    if (options === undefined) {
      options = {};
    }
    var medium = innerCreateMedium(null);
    medium.options = __assign({ async: true, ssr: false }, options);
    return medium;
  }
  // node_modules/use-sidecar/dist/es2015/exports.js
  var React17 = __toESM(require("react"));
  var SideCar = function(_a) {
    var sideCar = _a.sideCar, rest = __rest(_a, ["sideCar"]);
    if (!sideCar) {
      throw new Error("Sidecar: please provide `sideCar` property to import the right car");
    }
    var Target = sideCar.read();
    if (!Target) {
      throw new Error("Sidecar medium not found");
    }
    return React17.createElement(Target, __assign({}, rest));
  };
  SideCar.isSideCarExport = true;
  function exportSidecar(medium, exported) {
    medium.useMedium(exported);
    return SideCar;
  }
  // node_modules/react-remove-scroll/dist/es2015/medium.js
  var effectCar = createSidecarMedium();

  // node_modules/react-remove-scroll/dist/es2015/UI.js
  var nothing = function() {
    return;
  };
  var RemoveScroll = React18.forwardRef(function(props, parentRef) {
    var ref = React18.useRef(null);
    var _a = React18.useState({
      onScrollCapture: nothing,
      onWheelCapture: nothing,
      onTouchMoveCapture: nothing
    }), callbacks = _a[0], setCallbacks = _a[1];
    var { forwardProps, children, className, removeScrollBar, enabled, shards, sideCar, noRelative, noIsolation, inert, allowPinchZoom, as: _b } = props, Container = _b === undefined ? "div" : _b, gapMode = props.gapMode, rest = __rest(props, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]);
    var SideCar2 = sideCar;
    var containerRef = useMergeRefs([ref, parentRef]);
    var containerProps = __assign(__assign({}, rest), callbacks);
    return React18.createElement(React18.Fragment, null, enabled && React18.createElement(SideCar2, { sideCar: effectCar, removeScrollBar, shards, noRelative, noIsolation, inert, setCallbacks, allowPinchZoom: !!allowPinchZoom, lockRef: ref, gapMode }), forwardProps ? React18.cloneElement(React18.Children.only(children), __assign(__assign({}, containerProps), { ref: containerRef })) : React18.createElement(Container, __assign({}, containerProps, { className, ref: containerRef }), children));
  });
  RemoveScroll.defaultProps = {
    enabled: true,
    removeScrollBar: true,
    inert: false
  };
  RemoveScroll.classNames = {
    fullWidth: fullWidthClassName,
    zeroRight: zeroRightClassName
  };

  // node_modules/react-remove-scroll/dist/es2015/SideEffect.js
  var React21 = __toESM(require("react"));

  // node_modules/react-remove-scroll-bar/dist/es2015/component.js
  var React20 = __toESM(require("react"));

  // node_modules/react-style-singleton/dist/es2015/hook.js
  var React19 = __toESM(require("react"));

  // node_modules/get-nonce/dist/es2015/index.js
  var currentNonce;
  var getNonce = function() {
    if (currentNonce) {
      return currentNonce;
    }
    if (typeof __webpack_nonce__ !== "undefined") {
      return __webpack_nonce__;
    }
    return;
  };

  // node_modules/react-style-singleton/dist/es2015/singleton.js
  function makeStyleTag() {
    if (!document)
      return null;
    var tag = document.createElement("style");
    tag.type = "text/css";
    var nonce = getNonce();
    if (nonce) {
      tag.setAttribute("nonce", nonce);
    }
    return tag;
  }
  function injectStyles(tag, css) {
    if (tag.styleSheet) {
      tag.styleSheet.cssText = css;
    } else {
      tag.appendChild(document.createTextNode(css));
    }
  }
  function insertStyleTag(tag) {
    var head = document.head || document.getElementsByTagName("head")[0];
    head.appendChild(tag);
  }
  var stylesheetSingleton = function() {
    var counter = 0;
    var stylesheet = null;
    return {
      add: function(style) {
        if (counter == 0) {
          if (stylesheet = makeStyleTag()) {
            injectStyles(stylesheet, style);
            insertStyleTag(stylesheet);
          }
        }
        counter++;
      },
      remove: function() {
        counter--;
        if (!counter && stylesheet) {
          stylesheet.parentNode && stylesheet.parentNode.removeChild(stylesheet);
          stylesheet = null;
        }
      }
    };
  };

  // node_modules/react-style-singleton/dist/es2015/hook.js
  var styleHookSingleton = function() {
    var sheet = stylesheetSingleton();
    return function(styles, isDynamic) {
      React19.useEffect(function() {
        sheet.add(styles);
        return function() {
          sheet.remove();
        };
      }, [styles && isDynamic]);
    };
  };

  // node_modules/react-style-singleton/dist/es2015/component.js
  var styleSingleton = function() {
    var useStyle = styleHookSingleton();
    var Sheet = function(_a) {
      var { styles, dynamic } = _a;
      useStyle(styles, dynamic);
      return null;
    };
    return Sheet;
  };
  // node_modules/react-remove-scroll-bar/dist/es2015/utils.js
  var zeroGap = {
    left: 0,
    top: 0,
    right: 0,
    gap: 0
  };
  var parse = function(x) {
    return parseInt(x || "", 10) || 0;
  };
  var getOffset = function(gapMode) {
    var cs = window.getComputedStyle(document.body);
    var left = cs[gapMode === "padding" ? "paddingLeft" : "marginLeft"];
    var top = cs[gapMode === "padding" ? "paddingTop" : "marginTop"];
    var right = cs[gapMode === "padding" ? "paddingRight" : "marginRight"];
    return [parse(left), parse(top), parse(right)];
  };
  var getGapWidth = function(gapMode) {
    if (gapMode === undefined) {
      gapMode = "margin";
    }
    if (typeof window === "undefined") {
      return zeroGap;
    }
    var offsets = getOffset(gapMode);
    var documentWidth = document.documentElement.clientWidth;
    var windowWidth = window.innerWidth;
    return {
      left: offsets[0],
      top: offsets[1],
      right: offsets[2],
      gap: Math.max(0, windowWidth - documentWidth + offsets[2] - offsets[0])
    };
  };

  // node_modules/react-remove-scroll-bar/dist/es2015/component.js
  var Style = styleSingleton();
  var lockAttribute = "data-scroll-locked";
  var getStyles = function(_a, allowRelative, gapMode, important) {
    var { left, top, right, gap } = _a;
    if (gapMode === undefined) {
      gapMode = "margin";
    }
    return `
    .`.concat(noScrollbarsClassName, ` {
     overflow: hidden `).concat(important, `;
     padding-right: `).concat(gap, "px ").concat(important, `;
    }
    body[`).concat(lockAttribute, `] {
      overflow: hidden `).concat(important, `;
      overscroll-behavior: contain;
      `).concat([
      allowRelative && "position: relative ".concat(important, ";"),
      gapMode === "margin" && `
      padding-left: `.concat(left, `px;
      padding-top: `).concat(top, `px;
      padding-right: `).concat(right, `px;
      margin-left:0;
      margin-top:0;
      margin-right: `).concat(gap, "px ").concat(important, `;
      `),
      gapMode === "padding" && "padding-right: ".concat(gap, "px ").concat(important, ";")
    ].filter(Boolean).join(""), `
    }
    
    .`).concat(zeroRightClassName, ` {
      right: `).concat(gap, "px ").concat(important, `;
    }
    
    .`).concat(fullWidthClassName, ` {
      margin-right: `).concat(gap, "px ").concat(important, `;
    }
    
    .`).concat(zeroRightClassName, " .").concat(zeroRightClassName, ` {
      right: 0 `).concat(important, `;
    }
    
    .`).concat(fullWidthClassName, " .").concat(fullWidthClassName, ` {
      margin-right: 0 `).concat(important, `;
    }
    
    body[`).concat(lockAttribute, `] {
      `).concat(removedBarSizeVariable, ": ").concat(gap, `px;
    }
  `);
  };
  var getCurrentUseCounter = function() {
    var counter = parseInt(document.body.getAttribute(lockAttribute) || "0", 10);
    return isFinite(counter) ? counter : 0;
  };
  var useLockAttribute = function() {
    React20.useEffect(function() {
      document.body.setAttribute(lockAttribute, (getCurrentUseCounter() + 1).toString());
      return function() {
        var newCounter = getCurrentUseCounter() - 1;
        if (newCounter <= 0) {
          document.body.removeAttribute(lockAttribute);
        } else {
          document.body.setAttribute(lockAttribute, newCounter.toString());
        }
      };
    }, []);
  };
  var RemoveScrollBar = function(_a) {
    var { noRelative, noImportant, gapMode: _b } = _a, gapMode = _b === undefined ? "margin" : _b;
    useLockAttribute();
    var gap = React20.useMemo(function() {
      return getGapWidth(gapMode);
    }, [gapMode]);
    return React20.createElement(Style, { styles: getStyles(gap, !noRelative, gapMode, !noImportant ? "!important" : "") });
  };

  // node_modules/react-remove-scroll/dist/es2015/aggresiveCapture.js
  var passiveSupported = false;
  if (typeof window !== "undefined") {
    try {
      options = Object.defineProperty({}, "passive", {
        get: function() {
          passiveSupported = true;
          return true;
        }
      });
      window.addEventListener("test", options, options);
      window.removeEventListener("test", options, options);
    } catch (err) {
      passiveSupported = false;
    }
  }
  var options;
  var nonPassive = passiveSupported ? { passive: false } : false;

  // node_modules/react-remove-scroll/dist/es2015/handleScroll.js
  var alwaysContainsScroll = function(node) {
    return node.tagName === "TEXTAREA";
  };
  var elementCanBeScrolled = function(node, overflow) {
    if (!(node instanceof Element)) {
      return false;
    }
    var styles = window.getComputedStyle(node);
    return styles[overflow] !== "hidden" && !(styles.overflowY === styles.overflowX && !alwaysContainsScroll(node) && styles[overflow] === "visible");
  };
  var elementCouldBeVScrolled = function(node) {
    return elementCanBeScrolled(node, "overflowY");
  };
  var elementCouldBeHScrolled = function(node) {
    return elementCanBeScrolled(node, "overflowX");
  };
  var locationCouldBeScrolled = function(axis, node) {
    var ownerDocument = node.ownerDocument;
    var current = node;
    do {
      if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) {
        current = current.host;
      }
      var isScrollable = elementCouldBeScrolled(axis, current);
      if (isScrollable) {
        var _a = getScrollVariables(axis, current), scrollHeight = _a[1], clientHeight = _a[2];
        if (scrollHeight > clientHeight) {
          return true;
        }
      }
      current = current.parentNode;
    } while (current && current !== ownerDocument.body);
    return false;
  };
  var getVScrollVariables = function(_a) {
    var { scrollTop, scrollHeight, clientHeight } = _a;
    return [
      scrollTop,
      scrollHeight,
      clientHeight
    ];
  };
  var getHScrollVariables = function(_a) {
    var { scrollLeft, scrollWidth, clientWidth } = _a;
    return [
      scrollLeft,
      scrollWidth,
      clientWidth
    ];
  };
  var elementCouldBeScrolled = function(axis, node) {
    return axis === "v" ? elementCouldBeVScrolled(node) : elementCouldBeHScrolled(node);
  };
  var getScrollVariables = function(axis, node) {
    return axis === "v" ? getVScrollVariables(node) : getHScrollVariables(node);
  };
  var getDirectionFactor = function(axis, direction) {
    return axis === "h" && direction === "rtl" ? -1 : 1;
  };
  var handleScroll = function(axis, endTarget, event, sourceDelta, noOverscroll) {
    var directionFactor = getDirectionFactor(axis, window.getComputedStyle(endTarget).direction);
    var delta = directionFactor * sourceDelta;
    var target = event.target;
    var targetInLock = endTarget.contains(target);
    var shouldCancelScroll = false;
    var isDeltaPositive = delta > 0;
    var availableScroll = 0;
    var availableScrollTop = 0;
    do {
      if (!target) {
        break;
      }
      var _a = getScrollVariables(axis, target), position = _a[0], scroll_1 = _a[1], capacity = _a[2];
      var elementScroll = scroll_1 - capacity - directionFactor * position;
      if (position || elementScroll) {
        if (elementCouldBeScrolled(axis, target)) {
          availableScroll += elementScroll;
          availableScrollTop += position;
        }
      }
      var parent_1 = target.parentNode;
      target = parent_1 && parent_1.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? parent_1.host : parent_1;
    } while (!targetInLock && target !== document.body || targetInLock && (endTarget.contains(target) || endTarget === target));
    if (isDeltaPositive && (noOverscroll && Math.abs(availableScroll) < 1 || !noOverscroll && delta > availableScroll)) {
      shouldCancelScroll = true;
    } else if (!isDeltaPositive && (noOverscroll && Math.abs(availableScrollTop) < 1 || !noOverscroll && -delta > availableScrollTop)) {
      shouldCancelScroll = true;
    }
    return shouldCancelScroll;
  };

  // node_modules/react-remove-scroll/dist/es2015/SideEffect.js
  var getTouchXY = function(event) {
    return "changedTouches" in event ? [event.changedTouches[0].clientX, event.changedTouches[0].clientY] : [0, 0];
  };
  var getDeltaXY = function(event) {
    return [event.deltaX, event.deltaY];
  };
  var extractRef = function(ref) {
    return ref && "current" in ref ? ref.current : ref;
  };
  var deltaCompare = function(x, y) {
    return x[0] === y[0] && x[1] === y[1];
  };
  var generateStyle = function(id) {
    return `
    .block-interactivity-`.concat(id, ` {pointer-events: none;}
    .allow-interactivity-`).concat(id, ` {pointer-events: all;}
  `);
  };
  var idCounter = 0;
  var lockStack = [];
  function RemoveScrollSideCar(props) {
    var shouldPreventQueue = React21.useRef([]);
    var touchStartRef = React21.useRef([0, 0]);
    var activeAxis = React21.useRef();
    var id = React21.useState(idCounter++)[0];
    var Style2 = React21.useState(styleSingleton)[0];
    var lastProps = React21.useRef(props);
    React21.useEffect(function() {
      lastProps.current = props;
    }, [props]);
    React21.useEffect(function() {
      if (props.inert) {
        document.body.classList.add("block-interactivity-".concat(id));
        var allow_1 = __spreadArray([props.lockRef.current], (props.shards || []).map(extractRef), true).filter(Boolean);
        allow_1.forEach(function(el) {
          return el.classList.add("allow-interactivity-".concat(id));
        });
        return function() {
          document.body.classList.remove("block-interactivity-".concat(id));
          allow_1.forEach(function(el) {
            return el.classList.remove("allow-interactivity-".concat(id));
          });
        };
      }
      return;
    }, [props.inert, props.lockRef.current, props.shards]);
    var shouldCancelEvent = React21.useCallback(function(event, parent) {
      if ("touches" in event && event.touches.length === 2 || event.type === "wheel" && event.ctrlKey) {
        return !lastProps.current.allowPinchZoom;
      }
      var touch = getTouchXY(event);
      var touchStart = touchStartRef.current;
      var deltaX = "deltaX" in event ? event.deltaX : touchStart[0] - touch[0];
      var deltaY = "deltaY" in event ? event.deltaY : touchStart[1] - touch[1];
      var currentAxis;
      var target = event.target;
      var moveDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
      if ("touches" in event && moveDirection === "h" && target.type === "range") {
        return false;
      }
      var selection = window.getSelection();
      var anchorNode = selection && selection.anchorNode;
      var isTouchingSelection = anchorNode ? anchorNode === target || anchorNode.contains(target) : false;
      if (isTouchingSelection) {
        return false;
      }
      var canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
      if (!canBeScrolledInMainDirection) {
        return true;
      }
      if (canBeScrolledInMainDirection) {
        currentAxis = moveDirection;
      } else {
        currentAxis = moveDirection === "v" ? "h" : "v";
        canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
      }
      if (!canBeScrolledInMainDirection) {
        return false;
      }
      if (!activeAxis.current && "changedTouches" in event && (deltaX || deltaY)) {
        activeAxis.current = currentAxis;
      }
      if (!currentAxis) {
        return true;
      }
      var cancelingAxis = activeAxis.current || currentAxis;
      return handleScroll(cancelingAxis, parent, event, cancelingAxis === "h" ? deltaX : deltaY, true);
    }, []);
    var shouldPrevent = React21.useCallback(function(_event) {
      var event = _event;
      if (!lockStack.length || lockStack[lockStack.length - 1] !== Style2) {
        return;
      }
      var delta = "deltaY" in event ? getDeltaXY(event) : getTouchXY(event);
      var sourceEvent = shouldPreventQueue.current.filter(function(e) {
        return e.name === event.type && (e.target === event.target || event.target === e.shadowParent) && deltaCompare(e.delta, delta);
      })[0];
      if (sourceEvent && sourceEvent.should) {
        if (event.cancelable) {
          event.preventDefault();
        }
        return;
      }
      if (!sourceEvent) {
        var shardNodes = (lastProps.current.shards || []).map(extractRef).filter(Boolean).filter(function(node) {
          return node.contains(event.target);
        });
        var shouldStop = shardNodes.length > 0 ? shouldCancelEvent(event, shardNodes[0]) : !lastProps.current.noIsolation;
        if (shouldStop) {
          if (event.cancelable) {
            event.preventDefault();
          }
        }
      }
    }, []);
    var shouldCancel = React21.useCallback(function(name, delta, target, should) {
      var event = { name, delta, target, should, shadowParent: getOutermostShadowParent(target) };
      shouldPreventQueue.current.push(event);
      setTimeout(function() {
        shouldPreventQueue.current = shouldPreventQueue.current.filter(function(e) {
          return e !== event;
        });
      }, 1);
    }, []);
    var scrollTouchStart = React21.useCallback(function(event) {
      touchStartRef.current = getTouchXY(event);
      activeAxis.current = undefined;
    }, []);
    var scrollWheel = React21.useCallback(function(event) {
      shouldCancel(event.type, getDeltaXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
    }, []);
    var scrollTouchMove = React21.useCallback(function(event) {
      shouldCancel(event.type, getTouchXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
    }, []);
    React21.useEffect(function() {
      lockStack.push(Style2);
      props.setCallbacks({
        onScrollCapture: scrollWheel,
        onWheelCapture: scrollWheel,
        onTouchMoveCapture: scrollTouchMove
      });
      document.addEventListener("wheel", shouldPrevent, nonPassive);
      document.addEventListener("touchmove", shouldPrevent, nonPassive);
      document.addEventListener("touchstart", scrollTouchStart, nonPassive);
      return function() {
        lockStack = lockStack.filter(function(inst) {
          return inst !== Style2;
        });
        document.removeEventListener("wheel", shouldPrevent, nonPassive);
        document.removeEventListener("touchmove", shouldPrevent, nonPassive);
        document.removeEventListener("touchstart", scrollTouchStart, nonPassive);
      };
    }, []);
    var { removeScrollBar, inert } = props;
    return React21.createElement(React21.Fragment, null, inert ? React21.createElement(Style2, { styles: generateStyle(id) }) : null, removeScrollBar ? React21.createElement(RemoveScrollBar, { noRelative: props.noRelative, gapMode: props.gapMode }) : null);
  }
  function getOutermostShadowParent(node) {
    var shadowParent = null;
    while (node !== null) {
      if (node instanceof ShadowRoot) {
        shadowParent = node.host;
        node = node.host;
      }
      node = node.parentNode;
    }
    return shadowParent;
  }

  // node_modules/react-remove-scroll/dist/es2015/sidecar.js
  var sidecar_default = exportSidecar(effectCar, RemoveScrollSideCar);

  // node_modules/react-remove-scroll/dist/es2015/Combination.js
  var ReactRemoveScroll = React24.forwardRef(function(props, ref) {
    return React24.createElement(RemoveScroll, __assign({}, props, { ref, sideCar: sidecar_default }));
  });
  ReactRemoveScroll.classNames = RemoveScroll.classNames;
  var Combination_default = ReactRemoveScroll;

  // node_modules/aria-hidden/dist/es2015/index.js
  var getDefaultParent = function(originalTarget) {
    if (typeof document === "undefined") {
      return null;
    }
    var sampleTarget = Array.isArray(originalTarget) ? originalTarget[0] : originalTarget;
    return sampleTarget.ownerDocument.body;
  };
  var counterMap = new WeakMap;
  var uncontrolledNodes = new WeakMap;
  var markerMap = {};
  var lockCount = 0;
  var unwrapHost = function(node) {
    return node && (node.host || unwrapHost(node.parentNode));
  };
  var correctTargets = function(parent, targets) {
    return targets.map(function(target) {
      if (parent.contains(target)) {
        return target;
      }
      var correctedTarget = unwrapHost(target);
      if (correctedTarget && parent.contains(correctedTarget)) {
        return correctedTarget;
      }
      console.error("aria-hidden", target, "in not contained inside", parent, ". Doing nothing");
      return null;
    }).filter(function(x) {
      return Boolean(x);
    });
  };
  var applyAttributeToOthers = function(originalTarget, parentNode, markerName, controlAttribute) {
    var targets = correctTargets(parentNode, Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
    if (!markerMap[markerName]) {
      markerMap[markerName] = new WeakMap;
    }
    var markerCounter = markerMap[markerName];
    var hiddenNodes = [];
    var elementsToKeep = new Set;
    var elementsToStop = new Set(targets);
    var keep = function(el) {
      if (!el || elementsToKeep.has(el)) {
        return;
      }
      elementsToKeep.add(el);
      keep(el.parentNode);
    };
    targets.forEach(keep);
    var deep = function(parent) {
      if (!parent || elementsToStop.has(parent)) {
        return;
      }
      Array.prototype.forEach.call(parent.children, function(node) {
        if (elementsToKeep.has(node)) {
          deep(node);
        } else {
          try {
            var attr = node.getAttribute(controlAttribute);
            var alreadyHidden = attr !== null && attr !== "false";
            var counterValue = (counterMap.get(node) || 0) + 1;
            var markerValue = (markerCounter.get(node) || 0) + 1;
            counterMap.set(node, counterValue);
            markerCounter.set(node, markerValue);
            hiddenNodes.push(node);
            if (counterValue === 1 && alreadyHidden) {
              uncontrolledNodes.set(node, true);
            }
            if (markerValue === 1) {
              node.setAttribute(markerName, "true");
            }
            if (!alreadyHidden) {
              node.setAttribute(controlAttribute, "true");
            }
          } catch (e) {
            console.error("aria-hidden: cannot operate on ", node, e);
          }
        }
      });
    };
    deep(parentNode);
    elementsToKeep.clear();
    lockCount++;
    return function() {
      hiddenNodes.forEach(function(node) {
        var counterValue = counterMap.get(node) - 1;
        var markerValue = markerCounter.get(node) - 1;
        counterMap.set(node, counterValue);
        markerCounter.set(node, markerValue);
        if (!counterValue) {
          if (!uncontrolledNodes.has(node)) {
            node.removeAttribute(controlAttribute);
          }
          uncontrolledNodes.delete(node);
        }
        if (!markerValue) {
          node.removeAttribute(markerName);
        }
      });
      lockCount--;
      if (!lockCount) {
        counterMap = new WeakMap;
        counterMap = new WeakMap;
        uncontrolledNodes = new WeakMap;
        markerMap = {};
      }
    };
  };
  var hideOthers = function(originalTarget, parentNode, markerName) {
    if (markerName === undefined) {
      markerName = "data-aria-hidden";
    }
    var targets = Array.from(Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
    var activeParentNode = parentNode || getDefaultParent(originalTarget);
    if (!activeParentNode) {
      return function() {
        return null;
      };
    }
    targets.push.apply(targets, Array.from(activeParentNode.querySelectorAll("[aria-live], script")));
    return applyAttributeToOthers(targets, activeParentNode, markerName, "aria-hidden");
  };

  // node_modules/@radix-ui/react-dialog/dist/index.mjs
  "use client";
  var __defProp16 = Object.defineProperty;
  var __name15 = (target, value) => __defProp16(target, "name", { value, configurable: true });
  var DIALOG_NAME = "Dialog";
  var [createDialogContext, createDialogScope] = createContextScope(DIALOG_NAME);
  var [DialogProvider, useDialogContext] = createDialogContext(DIALOG_NAME);
  var Dialog = /* @__PURE__ */ __name15((props) => {
    const {
      __scopeDialog,
      children,
      open: openProp,
      defaultOpen,
      onOpenChange,
      modal = true
    } = props;
    const triggerRef = React26.useRef(null);
    const contentRef = React26.useRef(null);
    const { nodes: branchNodes, registry: branchRegistry } = useFocusScopeBranchRegistry();
    const [open, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen ?? false,
      onChange: onOpenChange,
      caller: DIALOG_NAME
    });
    const [titleCount, setTitleCount] = React26.useState(0);
    const [descriptionCount, setDescriptionCount] = React26.useState(0);
    return /* @__PURE__ */ jsx(DialogProvider, {
      scope: __scopeDialog,
      triggerRef,
      contentRef,
      contentId: useId(),
      titleId: useId(),
      descriptionId: useId(),
      titlePresent: titleCount > 0,
      descriptionPresent: descriptionCount > 0,
      setTitleCount,
      setDescriptionCount,
      open,
      onOpenChange: setOpen,
      onOpenToggle: React26.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      modal,
      branchNodes,
      branchRegistry,
      children
    });
  }, "Dialog");
  var PORTAL_NAME = "DialogPortal";
  var [PortalProvider, usePortalContext] = createDialogContext(PORTAL_NAME, {
    forceMount: undefined
  });
  var DialogPortal = /* @__PURE__ */ __name15((props) => {
    const { __scopeDialog, forceMount, children, container } = props;
    const context = useDialogContext(PORTAL_NAME, __scopeDialog);
    return /* @__PURE__ */ jsx(PortalProvider, { scope: __scopeDialog, forceMount, children: React26.Children.map(children, (child) => /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx(Portal, { asChild: true, container, children: child }) })) });
  }, "DialogPortal");
  var OVERLAY_NAME = "DialogOverlay";
  var DialogOverlay = /* @__PURE__ */ React26.forwardRef(/* @__PURE__ */ __name15(function DialogOverlay2(props, forwardedRef) {
    const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
    return context.modal ? /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx(DialogOverlayImpl, { ...overlayProps, ref: forwardedRef }) }) : null;
  }, "DialogOverlay"));
  var Slot = createSlot("DialogOverlay.RemoveScroll");
  var DialogOverlayImpl = /* @__PURE__ */ React26.forwardRef(/* @__PURE__ */ __name15(function DialogOverlayImpl2(props, forwardedRef) {
    const { __scopeDialog, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, __scopeDialog);
    const registerDismissableSurface = useDismissableLayerSurface();
    const composedRefs = useComposedRefs(forwardedRef, registerDismissableSurface);
    return /* @__PURE__ */ jsx(Combination_default, {
      as: Slot,
      allowPinchZoom: true,
      shards: React26.useMemo(() => [context.contentRef, ...context.branchNodes.map((node) => ({ current: node }))], [context.contentRef, context.branchNodes]),
      children: /* @__PURE__ */ jsx(Primitive.div, {
        "data-state": getState(context.open),
        ...overlayProps,
        ref: composedRefs,
        style: { pointerEvents: "auto", ...overlayProps.style }
      })
    });
  }, "DialogOverlayImpl"));
  var CONTENT_NAME = "DialogContent";
  var DialogContent = /* @__PURE__ */ React26.forwardRef(/* @__PURE__ */ __name15(function DialogContent2(props, forwardedRef) {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    return /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ jsx(DialogContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsx(DialogContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }, "DialogContent"));
  var DialogContentModal = /* @__PURE__ */ React26.forwardRef(/* @__PURE__ */ __name15(function DialogContentModal2(props, forwardedRef) {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const contentRef = React26.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, context.contentRef, contentRef);
    React26.useEffect(() => {
      const content = contentRef.current;
      if (content)
        return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsx(DialogContentImpl, {
      ...props,
      ref: composedRefs,
      trapFocus: context.open,
      disableOutsidePointerEvents: context.open,
      onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
        event.preventDefault();
        context.triggerRef.current?.focus();
      }),
      onPointerDownOutside: composeEventHandlers(props.onPointerDownOutside, (event) => {
        const originalEvent = event.detail.originalEvent;
        const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
        const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
        if (isRightClick)
          event.preventDefault();
      }),
      onFocusOutside: composeEventHandlers(props.onFocusOutside, (event) => event.preventDefault())
    });
  }, "DialogContentModal"));
  var DialogContentNonModal = /* @__PURE__ */ React26.forwardRef(/* @__PURE__ */ __name15(function DialogContentNonModal2(props, forwardedRef) {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const hasInteractedOutsideRef = React26.useRef(false);
    const hasPointerDownOutsideRef = React26.useRef(false);
    return /* @__PURE__ */ jsx(DialogContentImpl, {
      ...props,
      ref: forwardedRef,
      trapFocus: false,
      disableOutsidePointerEvents: false,
      onCloseAutoFocus: (event) => {
        props.onCloseAutoFocus?.(event);
        if (!event.defaultPrevented) {
          if (!hasInteractedOutsideRef.current)
            context.triggerRef.current?.focus();
          event.preventDefault();
        }
        hasInteractedOutsideRef.current = false;
        hasPointerDownOutsideRef.current = false;
      },
      onInteractOutside: (event) => {
        props.onInteractOutside?.(event);
        if (!event.defaultPrevented) {
          hasInteractedOutsideRef.current = true;
          if (event.detail.originalEvent.type === "pointerdown") {
            hasPointerDownOutsideRef.current = true;
          }
        }
        const target = event.target;
        const targetIsTrigger = context.triggerRef.current?.contains(target);
        if (targetIsTrigger)
          event.preventDefault();
        if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) {
          event.preventDefault();
        }
      }
    });
  }, "DialogContentNonModal"));
  var DialogContentImpl = /* @__PURE__ */ React26.forwardRef(/* @__PURE__ */ __name15(function DialogContentImpl2(props, forwardedRef) {
    const {
      __scopeDialog,
      trapFocus,
      onOpenAutoFocus,
      onCloseAutoFocus,
      "aria-describedby": ariaDescribedby,
      children,
      ...contentProps
    } = props;
    const context = useDialogContext(CONTENT_NAME, __scopeDialog);
    useFocusGuards();
    return /* @__PURE__ */ jsx(FocusScopeBranchProvider, { registry: context.branchRegistry, children: /* @__PURE__ */ jsx(FocusScope, {
      asChild: true,
      loop: true,
      trapped: trapFocus,
      branches: context.branchNodes,
      onMountAutoFocus: onOpenAutoFocus,
      onUnmountAutoFocus: onCloseAutoFocus,
      children: /* @__PURE__ */ jsx(DismissableLayer, {
        role: "dialog",
        id: context.contentId,
        "aria-labelledby": context.titlePresent ? context.titleId : undefined,
        "aria-describedby": context.descriptionPresent ? concatAriaDescribedby2(ariaDescribedby, context.descriptionId) : ariaDescribedby,
        "data-state": getState(context.open),
        ...contentProps,
        ref: forwardedRef,
        deferPointerDownOutside: true,
        onDismiss: () => context.onOpenChange(false),
        children
      })
    }) });
  }, "DialogContentImpl"));
  var DialogTitle = /* @__PURE__ */ React26.forwardRef(/* @__PURE__ */ __name15(function DialogTitle2(props, forwardedRef) {
    const { __scopeDialog, ...titleProps } = props;
    const context = useDialogContext("DialogTitle", __scopeDialog);
    const { setTitleCount } = context;
    useLayoutEffect2(() => {
      setTitleCount((count3) => count3 + 1);
      return () => setTitleCount((count3) => count3 - 1);
    }, [setTitleCount]);
    return /* @__PURE__ */ jsx(Primitive.h2, { id: context.titleId, ...titleProps, ref: forwardedRef });
  }, "DialogTitle"));
  var DialogDescription = /* @__PURE__ */ React26.forwardRef(/* @__PURE__ */ __name15(function DialogDescription2(props, forwardedRef) {
    const { __scopeDialog, ...descriptionProps } = props;
    const context = useDialogContext("DialogDescription", __scopeDialog);
    const { setDescriptionCount } = context;
    useLayoutEffect2(() => {
      setDescriptionCount((count3) => count3 + 1);
      return () => setDescriptionCount((count3) => count3 - 1);
    }, [setDescriptionCount]);
    return /* @__PURE__ */ jsx(Primitive.p, { id: context.descriptionId, ...descriptionProps, ref: forwardedRef });
  }, "DialogDescription"));
  var CLOSE_NAME = "DialogClose";
  var DialogClose = /* @__PURE__ */ React26.forwardRef(/* @__PURE__ */ __name15(function DialogClose2(props, forwardedRef) {
    const { __scopeDialog, ...closeProps } = props;
    const context = useDialogContext(CLOSE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsx(Primitive.button, {
      type: "button",
      ...closeProps,
      ref: forwardedRef,
      onClick: composeEventHandlers(props.onClick, () => context.onOpenChange(false))
    });
  }, "DialogClose"));
  function concatAriaDescribedby2(...values) {
    const ids = /* @__PURE__ */ new Set;
    for (const value of values) {
      if (typeof value !== "string")
        continue;
      for (const id of String(value).trim().split(/\s+/)) {
        if (id)
          ids.add(id);
      }
    }
    return ids.size > 0 ? Array.from(ids).join(" ") : undefined;
  }
  __name15(concatAriaDescribedby2, "concatAriaDescribedby");
  function getState(open) {
    return open ? "open" : "closed";
  }
  __name15(getState, "getState");

  // node_modules/@radix-ui/react-tabs/dist/index.mjs
  var React33 = __toESM(require("react"));

  // node_modules/@radix-ui/react-roving-focus/dist/index.mjs
  var React32 = __toESM(require("react"));

  // node_modules/@radix-ui/react-collection/dist/index.mjs
  var React27 = __toESM(require("react"));
  var React25 = __toESM(require("react"));
  "use client";
  var __defProp17 = Object.defineProperty;
  var __name16 = (target, value) => __defProp17(target, "name", { value, configurable: true });
  function createCollection(name) {
    const PROVIDER_NAME = name + "CollectionProvider";
    const [createCollectionContext, createCollectionScope] = createContextScope(PROVIDER_NAME);
    const [CollectionProviderImpl, useCollectionContext] = createCollectionContext(PROVIDER_NAME, { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map });
    const CollectionProvider = /* @__PURE__ */ __name16((props) => {
      const { scope, children } = props;
      const ref = React27.useRef(null);
      const itemMap = React27.useRef(/* @__PURE__ */ new Map).current;
      return /* @__PURE__ */ jsx(CollectionProviderImpl, { scope, itemMap, collectionRef: ref, children });
    }, "CollectionProvider");
    CollectionProvider.displayName = PROVIDER_NAME;
    const COLLECTION_SLOT_NAME = name + "CollectionSlot";
    const CollectionSlotImpl = createSlot(COLLECTION_SLOT_NAME);
    const CollectionSlot = React27.forwardRef((props, forwardedRef) => {
      const { scope, children } = props;
      const context = useCollectionContext(COLLECTION_SLOT_NAME, scope);
      const composedRefs = useComposedRefs(forwardedRef, context.collectionRef);
      return /* @__PURE__ */ jsx(CollectionSlotImpl, { ref: composedRefs, children });
    });
    CollectionSlot.displayName = COLLECTION_SLOT_NAME;
    const ITEM_SLOT_NAME = name + "CollectionItemSlot";
    const ITEM_DATA_ATTR = "data-radix-collection-item";
    const CollectionItemSlotImpl = createSlot(ITEM_SLOT_NAME);
    const CollectionItemSlot = React27.forwardRef((props, forwardedRef) => {
      const { scope, children, ...itemData } = props;
      const ref = React27.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, ref);
      const context = useCollectionContext(ITEM_SLOT_NAME, scope);
      React27.useEffect(() => {
        context.itemMap.set(ref, { ref, ...itemData });
        return () => void context.itemMap.delete(ref);
      });
      return /* @__PURE__ */ jsx(CollectionItemSlotImpl, { ...{ [ITEM_DATA_ATTR]: "" }, ref: composedRefs, children });
    });
    CollectionItemSlot.displayName = ITEM_SLOT_NAME;
    function useCollection(scope) {
      const context = useCollectionContext(name + "CollectionConsumer", scope);
      const getItems = React27.useCallback(() => {
        const collectionNode = context.collectionRef.current;
        if (!collectionNode)
          return [];
        const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
        const items = Array.from(context.itemMap.values());
        const orderedItems = items.sort((a, b) => orderedNodes.indexOf(a.ref.current) - orderedNodes.indexOf(b.ref.current));
        return orderedItems;
      }, [context.collectionRef, context.itemMap]);
      return getItems;
    }
    __name16(useCollection, "useCollection");
    return [
      { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
      useCollection,
      createCollectionScope
    ];
  }
  __name16(createCollection, "createCollection");
  var __instanciated = /* @__PURE__ */ new WeakMap;
  var OrderedDict = class _OrderedDict extends Map {
    static {
      __name16(this, "OrderedDict");
    }
    #keys;
    constructor(entries) {
      super(entries);
      this.#keys = [...super.keys()];
      __instanciated.set(this, true);
    }
    set(key, value) {
      if (__instanciated.get(this) && !this.has(key)) {
        this.#keys.push(key);
      }
      super.set(key, value);
      return this;
    }
    insert(index, key, value) {
      const has = this.has(key);
      const finalSize = has ? this.size : this.size + 1;
      const relativeIndex = toSafeInteger(index);
      const targetIndex = relativeIndex >= 0 ? Math.min(relativeIndex, finalSize - 1) : Math.max(finalSize + relativeIndex, 0);
      if (has ? this.#keys.indexOf(key) === targetIndex : targetIndex === this.size) {
        this.set(key, value);
        return this;
      }
      const keys = this.#keys.filter((existingKey) => existingKey !== key);
      keys.splice(targetIndex, 0, key);
      const entries = keys.map((entryKey) => [
        entryKey,
        entryKey === key ? value : this.get(entryKey)
      ]);
      this.clear();
      for (const [entryKey, entryValue] of entries) {
        this.set(entryKey, entryValue);
      }
      return this;
    }
    with(index, key, value) {
      const copy = new _OrderedDict(this);
      copy.insert(index, key, value);
      return copy;
    }
    before(key) {
      const index = this.#keys.indexOf(key) - 1;
      if (index < 0) {
        return;
      }
      return this.entryAt(index);
    }
    setBefore(key, newKey, value) {
      const index = this.#keys.indexOf(key);
      if (index === -1) {
        return this;
      }
      const currentIndex = this.#keys.indexOf(newKey);
      const targetIndex = currentIndex !== -1 && currentIndex < index ? index - 1 : index;
      return this.insert(targetIndex, newKey, value);
    }
    after(key) {
      let index = this.#keys.indexOf(key);
      index = index === -1 || index === this.size - 1 ? -1 : index + 1;
      if (index === -1) {
        return;
      }
      return this.entryAt(index);
    }
    setAfter(key, newKey, value) {
      const index = this.#keys.indexOf(key);
      if (index === -1) {
        return this;
      }
      const currentIndex = this.#keys.indexOf(newKey);
      const targetIndex = currentIndex !== -1 && currentIndex <= index ? index : index + 1;
      return this.insert(targetIndex, newKey, value);
    }
    first() {
      return this.entryAt(0);
    }
    last() {
      return this.entryAt(-1);
    }
    clear() {
      this.#keys = [];
      return super.clear();
    }
    delete(key) {
      const deleted = super.delete(key);
      if (deleted) {
        this.#keys.splice(this.#keys.indexOf(key), 1);
      }
      return deleted;
    }
    deleteAt(index) {
      const key = this.keyAt(index);
      if (key !== undefined) {
        return this.delete(key);
      }
      return false;
    }
    at(index) {
      const key = at(this.#keys, index);
      if (key !== undefined) {
        return this.get(key);
      }
    }
    entryAt(index) {
      const key = at(this.#keys, index);
      if (key !== undefined) {
        return [key, this.get(key)];
      }
    }
    indexOf(key) {
      return this.#keys.indexOf(key);
    }
    keyAt(index) {
      return at(this.#keys, index);
    }
    from(key, offset) {
      const index = this.indexOf(key);
      if (index === -1) {
        return;
      }
      let dest = index + offset;
      if (dest < 0)
        dest = 0;
      if (dest >= this.size)
        dest = this.size - 1;
      return this.at(dest);
    }
    keyFrom(key, offset) {
      const index = this.indexOf(key);
      if (index === -1) {
        return;
      }
      let dest = index + offset;
      if (dest < 0)
        dest = 0;
      if (dest >= this.size)
        dest = this.size - 1;
      return this.keyAt(dest);
    }
    find(predicate, thisArg) {
      let index = 0;
      for (const entry of this) {
        if (Reflect.apply(predicate, thisArg, [entry, index, this])) {
          return entry;
        }
        index++;
      }
      return;
    }
    findIndex(predicate, thisArg) {
      let index = 0;
      for (const entry of this) {
        if (Reflect.apply(predicate, thisArg, [entry, index, this])) {
          return index;
        }
        index++;
      }
      return -1;
    }
    filter(predicate, thisArg) {
      const entries = [];
      let index = 0;
      for (const entry of this) {
        if (Reflect.apply(predicate, thisArg, [entry, index, this])) {
          entries.push(entry);
        }
        index++;
      }
      return new _OrderedDict(entries);
    }
    map(callbackfn, thisArg) {
      const entries = [];
      let index = 0;
      for (const entry of this) {
        entries.push([entry[0], Reflect.apply(callbackfn, thisArg, [entry, index, this])]);
        index++;
      }
      return new _OrderedDict(entries);
    }
    reduce(...args) {
      const [callbackfn, initialValue] = args;
      const hasInitialValue = args.length > 1;
      if (!hasInitialValue && this.size === 0) {
        throw new TypeError("Reduce of empty OrderedDict with no initial value");
      }
      let index = 0;
      let accumulator = initialValue;
      for (const entry of this) {
        if (index === 0 && !hasInitialValue) {
          accumulator = entry;
        } else {
          accumulator = Reflect.apply(callbackfn, this, [accumulator, entry, index, this]);
        }
        index++;
      }
      return accumulator;
    }
    reduceRight(...args) {
      const [callbackfn, initialValue] = args;
      const hasInitialValue = args.length > 1;
      if (!hasInitialValue && this.size === 0) {
        throw new TypeError("Reduce of empty OrderedDict with no initial value");
      }
      let accumulator = initialValue;
      for (let index = this.size - 1;index >= 0; index--) {
        const entry = this.entryAt(index);
        if (index === this.size - 1 && !hasInitialValue) {
          accumulator = entry;
        } else {
          accumulator = Reflect.apply(callbackfn, this, [accumulator, entry, index, this]);
        }
      }
      return accumulator;
    }
    sort(compareFn) {
      if (typeof compareFn !== "function") {
        throw new TypeError(`OrderedDict.sort requires a compare function`);
      }
      const entries = [...this.entries()].sort(compareFn);
      this.clear();
      for (const [key, value] of entries) {
        this.set(key, value);
      }
      return this;
    }
    toSorted(compareFn) {
      if (typeof compareFn !== "function") {
        throw new TypeError(`OrderedDict.toSorted requires a compare function`);
      }
      const entries = [...this.entries()].sort(compareFn);
      return new _OrderedDict(entries);
    }
    toReversed() {
      const reversed = new _OrderedDict;
      for (let index = this.size - 1;index >= 0; index--) {
        const key = this.keyAt(index);
        const element = this.get(key);
        reversed.set(key, element);
      }
      return reversed;
    }
    toSpliced(...args) {
      const entries = [...this.entries()];
      entries.splice(...args);
      return new _OrderedDict(entries);
    }
    slice(start, end) {
      const result = new _OrderedDict;
      for (const key of this.#keys.slice(start, end)) {
        result.set(key, this.get(key));
      }
      return result;
    }
    every(predicate, thisArg) {
      let index = 0;
      for (const entry of this) {
        if (!Reflect.apply(predicate, thisArg, [entry, index, this])) {
          return false;
        }
        index++;
      }
      return true;
    }
    some(predicate, thisArg) {
      let index = 0;
      for (const entry of this) {
        if (Reflect.apply(predicate, thisArg, [entry, index, this])) {
          return true;
        }
        index++;
      }
      return false;
    }
  };
  function at(array, index) {
    if ("at" in Array.prototype) {
      return Array.prototype.at.call(array, index);
    }
    const actualIndex = toSafeIndex(array, index);
    return actualIndex === -1 ? undefined : array[actualIndex];
  }
  __name16(at, "at");
  function toSafeIndex(array, index) {
    const length = array.length;
    const relativeIndex = toSafeInteger(index);
    const actualIndex = relativeIndex >= 0 ? relativeIndex : length + relativeIndex;
    return actualIndex < 0 || actualIndex >= length ? -1 : actualIndex;
  }
  __name16(toSafeIndex, "toSafeIndex");
  function toSafeInteger(number) {
    return number !== number || number === 0 ? 0 : Math.trunc(number);
  }
  __name16(toSafeInteger, "toSafeInteger");
  function createCollection2(name) {
    const PROVIDER_NAME = name + "CollectionProvider";
    const [createCollectionContext, createCollectionScope] = createContextScope(PROVIDER_NAME);
    const [CollectionStableContextProvider, useStableCollectionContext] = createCollectionContext(PROVIDER_NAME);
    CollectionStableContextProvider.displayName = name + "CollectionStableContextProvider";
    const [CollectionStatefulContextProvider, useStatefulCollectionContext] = createCollectionContext(PROVIDER_NAME);
    CollectionStatefulContextProvider.displayName = name + "CollectionStatefulContextProvider";
    const CollectionProvider = /* @__PURE__ */ __name16(({ state, ...props }) => {
      return state ? /* @__PURE__ */ jsx(CollectionProviderImpl, { ...props, state }) : /* @__PURE__ */ jsx(CollectionInit, { ...props });
    }, "CollectionProvider");
    CollectionProvider.displayName = PROVIDER_NAME;
    const CollectionInit = /* @__PURE__ */ __name16((props) => {
      const state = useInitCollection();
      return /* @__PURE__ */ jsx(CollectionProviderImpl, { ...props, state });
    }, "CollectionInit");
    CollectionInit.displayName = name + "CollectionInit";
    const CollectionProviderImpl = /* @__PURE__ */ __name16((props) => {
      const { scope, children, state } = props;
      const ref = React25.useRef(null);
      const [collectionElement, setCollectionElement] = React25.useState(null);
      const composeRefs2 = useComposedRefs(ref, setCollectionElement);
      const [collection, setCollection] = state;
      const registryRef = React25.useRef(new OrderedDict);
      const getCollection = React25.useCallback(() => {
        const registry = registryRef.current;
        if (!isInDocumentOrder(registry)) {
          registry.sort(sortByDocumentPosition);
        }
        return registry;
      }, []);
      React25.useEffect(() => {
        if (!collectionElement) {
          return;
        }
        const observer = getChildListObserver(() => {
          setCollection((map) => {
            const sorted = map.toSorted(sortByDocumentPosition);
            const orderChanged = sorted.some(([key], index) => map.keyAt(index) !== key);
            return orderChanged ? sorted : map;
          });
        });
        observer.observe(collectionElement, {
          childList: true,
          subtree: true
        });
        return () => {
          observer.disconnect();
        };
      }, [collectionElement, setCollection]);
      return /* @__PURE__ */ jsx(CollectionStableContextProvider, {
        scope,
        collectionElementRef: composeRefs2,
        collectionElementRefObject: ref,
        getCollection,
        setCollection,
        registryRef,
        children: /* @__PURE__ */ jsx(CollectionStatefulContextProvider, {
          scope,
          collectionElement,
          collection,
          children
        })
      });
    }, "CollectionProviderImpl");
    CollectionProviderImpl.displayName = name + "CollectionProviderImpl";
    const COLLECTION_SLOT_NAME = name + "CollectionSlot";
    const CollectionSlotImpl = createSlot(COLLECTION_SLOT_NAME);
    const CollectionSlot = React25.forwardRef((props, forwardedRef) => {
      const { scope, children } = props;
      const context = useStableCollectionContext(COLLECTION_SLOT_NAME, scope);
      const composedRefs = useComposedRefs(forwardedRef, context.collectionElementRef);
      return /* @__PURE__ */ jsx(CollectionSlotImpl, { ref: composedRefs, children });
    });
    CollectionSlot.displayName = COLLECTION_SLOT_NAME;
    const ITEM_SLOT_NAME = name + "CollectionItemSlot";
    const ITEM_DATA_ATTR = "data-radix-collection-item";
    const CollectionItemSlotImpl = createSlot(ITEM_SLOT_NAME);
    const CollectionItemSlot = React25.forwardRef((props, forwardedRef) => {
      const { scope, children, ...itemData } = props;
      const ref = React25.useRef(null);
      const context = useStableCollectionContext(ITEM_SLOT_NAME, scope);
      const { setCollection, registryRef } = context;
      const itemDataRef = React25.useRef(itemData);
      if (!shallowEqual(itemDataRef.current, itemData)) {
        itemDataRef.current = itemData;
      }
      const memoizedItemData = itemDataRef.current;
      const registerElement = React25.useCallback((node) => {
        const registry = registryRef.current;
        if (node) {
          registry.set(node, {
            ...itemDataRef.current,
            element: node
          });
        } else if (ref.current) {
          registry.delete(ref.current);
        }
      }, [registryRef]);
      const composedRefs = useComposedRefs(forwardedRef, registerElement, ref);
      useLayoutEffect2(() => {
        const node = ref.current;
        const registry = registryRef.current;
        if (node && registry.has(node)) {
          registry.set(node, { ...memoizedItemData, element: node });
        }
      }, [memoizedItemData, registryRef]);
      const registeredRef = React25.useRef(null);
      React25.useEffect(() => {
        const element = ref.current;
        const registered = registeredRef.current;
        if ((registered?.element ?? null) === element && (!element || registered?.itemData === memoizedItemData)) {
          return;
        }
        registeredRef.current = element ? { element, itemData: memoizedItemData } : null;
        setCollection((map) => {
          const next = new OrderedDict(map);
          if (registered && registered.element !== element) {
            next.delete(registered.element);
          }
          if (element) {
            next.set(element, { ...memoizedItemData, element });
          }
          return next.sort(sortByDocumentPosition);
        });
      });
      React25.useEffect(() => {
        return () => {
          const registered = registeredRef.current;
          registeredRef.current = null;
          if (!registered) {
            return;
          }
          setCollection((map) => {
            if (!map.has(registered.element)) {
              return map;
            }
            const next = new OrderedDict(map);
            next.delete(registered.element);
            return next;
          });
        };
      }, [setCollection]);
      return /* @__PURE__ */ jsx(CollectionItemSlotImpl, { ...{ [ITEM_DATA_ATTR]: "" }, ref: composedRefs, children });
    });
    CollectionItemSlot.displayName = ITEM_SLOT_NAME;
    function useInitCollection() {
      return React25.useState(new OrderedDict);
    }
    __name16(useInitCollection, "useInitCollection");
    function useCollection(scope) {
      const { collection } = useStatefulCollectionContext(name + "CollectionConsumer", scope);
      return collection;
    }
    __name16(useCollection, "useCollection");
    function useGetCollection(scope) {
      const { getCollection } = useStableCollectionContext(name + "CollectionConsumer", scope);
      return getCollection;
    }
    __name16(useGetCollection, "useGetCollection");
    const functions = {
      createCollectionScope,
      useCollection,
      useGetCollection,
      useInitCollection
    };
    return [
      { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
      functions
    ];
  }
  __name16(createCollection2, "createCollection");
  function shallowEqual(a, b) {
    if (a === b)
      return true;
    if (typeof a !== "object" || typeof b !== "object")
      return false;
    if (a == null || b == null)
      return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length)
      return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key))
        return false;
      if (a[key] !== b[key])
        return false;
    }
    return true;
  }
  __name16(shallowEqual, "shallowEqual");
  function isElementPreceding(a, b) {
    return !!(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING);
  }
  __name16(isElementPreceding, "isElementPreceding");
  function isInDocumentOrder(dict) {
    let previous;
    for (const element of dict.keys()) {
      if (previous) {
        const position = previous.compareDocumentPosition(element);
        if (!(position & Node.DOCUMENT_POSITION_DISCONNECTED) && position & Node.DOCUMENT_POSITION_PRECEDING) {
          return false;
        }
      }
      previous = element;
    }
    return true;
  }
  __name16(isInDocumentOrder, "isInDocumentOrder");
  function sortByDocumentPosition(a, b) {
    return !a[1].element || !b[1].element ? 0 : isElementPreceding(a[1].element, b[1].element) ? -1 : 1;
  }
  __name16(sortByDocumentPosition, "sortByDocumentPosition");
  function getChildListObserver(callback) {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          callback();
          return;
        }
      }
    });
    return observer;
  }
  __name16(getChildListObserver, "getChildListObserver");

  // node_modules/@radix-ui/react-direction/dist/index.mjs
  var React28 = __toESM(require("react"));
  "use client";
  var __defProp18 = Object.defineProperty;
  var __name17 = (target, value) => __defProp18(target, "name", { value, configurable: true });
  var Direction = {
    LTR: "ltr",
    RTL: "rtl"
  };
  var DirectionContext = React28.createContext(undefined);
  function useDirection(localDir) {
    const globalDir = React28.useContext(DirectionContext);
    return localDir || globalDir || Direction.LTR;
  }
  __name17(useDirection, "useDirection");

  // node_modules/@radix-ui/react-use-is-hydrated/dist/index.mjs
  var React29 = __toESM(require("react"));
  var React30 = __toESM(require("react"));
  var __defProp19 = Object.defineProperty;
  var __name18 = (target, value) => __defProp19(target, "name", { value, configurable: true });
  var _isHydrated = false;
  function useIsHydrated() {
    const [isHydrated, setIsHydrated] = React30.useState(_isHydrated);
    React30.useEffect(() => {
      if (!_isHydrated) {
        _isHydrated = true;
        setIsHydrated(true);
      }
    }, []);
    return isHydrated;
  }
  __name18(useIsHydrated, "useIsHydrated");
  var useReactSyncExternalStore = React29[" useSyncExternalStore ".trim().toString()];
  function subscribe() {
    return () => {};
  }
  __name18(subscribe, "subscribe");
  function useIsHydratedModern() {
    return useReactSyncExternalStore(subscribe, () => true, () => false);
  }
  __name18(useIsHydratedModern, "useIsHydratedModern");
  var useIsHydrated2 = typeof useReactSyncExternalStore === "function" ? useIsHydratedModern : useIsHydrated;

  // node_modules/@radix-ui/react-roving-focus/dist/index.mjs
  "use client";
  var __defProp20 = Object.defineProperty;
  var __name19 = (target, value) => __defProp20(target, "name", { value, configurable: true });
  var ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
  var EVENT_OPTIONS2 = { bubbles: false, cancelable: true };
  var GROUP_NAME = "RovingFocusGroup";
  var [Collection, useCollection, createCollectionScope] = createCollection(GROUP_NAME);
  var [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(GROUP_NAME, [createCollectionScope]);
  var Orientation = {
    Vertical: "vertical",
    Horizontal: "horizontal"
  };
  var Direction2 = {
    LTR: "ltr",
    RTL: "rtl"
  };
  var [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext(GROUP_NAME);
  var RovingFocusGroup = /* @__PURE__ */ React32.forwardRef(/* @__PURE__ */ __name19(function RovingFocusGroup2(props, forwardedRef) {
    return /* @__PURE__ */ jsx(Collection.Provider, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsx(Collection.Slot, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsx(RovingFocusGroupImpl, { ...props, ref: forwardedRef }) }) });
  }, "RovingFocusGroup"));
  var RovingFocusGroupImpl = /* @__PURE__ */ React32.forwardRef(/* @__PURE__ */ __name19(function RovingFocusGroupImpl2(props, forwardedRef) {
    const {
      __scopeRovingFocusGroup,
      orientation,
      loop = false,
      dir,
      currentTabStopId: currentTabStopIdProp,
      defaultCurrentTabStopId,
      onCurrentTabStopIdChange,
      onEntryFocus,
      preventScrollOnEntryFocus = false,
      ...groupProps
    } = props;
    const ref = React32.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const direction = useDirection(dir);
    const [currentTabStopId, setCurrentTabStopId] = useControllableState({
      prop: currentTabStopIdProp,
      defaultProp: defaultCurrentTabStopId ?? null,
      onChange: onCurrentTabStopIdChange,
      caller: GROUP_NAME
    });
    const [isTabbingBackOut, setIsTabbingBackOut] = React32.useState(false);
    const handleEntryFocus = useCallbackRef(onEntryFocus);
    const getItems = useCollection(__scopeRovingFocusGroup);
    const isClickFocusRef = React32.useRef(false);
    const [focusableItemsCount, setFocusableItemsCount] = React32.useState(0);
    React32.useEffect(() => {
      const node = ref.current;
      if (node) {
        node.addEventListener(ENTRY_FOCUS, handleEntryFocus);
        return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus);
      }
    }, [handleEntryFocus]);
    return /* @__PURE__ */ jsx(RovingFocusProvider, {
      scope: __scopeRovingFocusGroup,
      orientation,
      dir: direction,
      loop,
      currentTabStopId,
      onItemFocus: React32.useCallback((tabStopId) => setCurrentTabStopId(tabStopId), [setCurrentTabStopId]),
      onItemShiftTab: React32.useCallback(() => setIsTabbingBackOut(true), []),
      onFocusableItemAdd: React32.useCallback(() => setFocusableItemsCount((prevCount) => prevCount + 1), []),
      onFocusableItemRemove: React32.useCallback(() => setFocusableItemsCount((prevCount) => prevCount - 1), []),
      children: /* @__PURE__ */ jsx(Primitive.div, {
        tabIndex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0,
        "data-orientation": orientation,
        ...groupProps,
        ref: composedRefs,
        style: { outline: "none", ...props.style },
        onMouseDown: composeEventHandlers(props.onMouseDown, () => {
          isClickFocusRef.current = true;
        }),
        onFocus: composeEventHandlers(props.onFocus, (event) => {
          const isKeyboardFocus = !isClickFocusRef.current;
          if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
            const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS2);
            event.currentTarget.dispatchEvent(entryFocusEvent);
            if (!entryFocusEvent.defaultPrevented) {
              const items = getItems().filter((item) => item.focusable);
              const activeItem = items.find((item) => item.active);
              const currentItem = items.find((item) => item.id === currentTabStopId);
              const candidateItems = [activeItem, currentItem, ...items].filter(Boolean);
              const candidateNodes = candidateItems.map((item) => item.ref.current);
              focusFirst2(candidateNodes, preventScrollOnEntryFocus);
            }
          }
          isClickFocusRef.current = false;
        }),
        onBlur: composeEventHandlers(props.onBlur, () => setIsTabbingBackOut(false))
      })
    });
  }, "RovingFocusGroupImpl"));
  var ITEM_NAME = "RovingFocusGroupItem";
  var RovingFocusGroupItem = /* @__PURE__ */ React32.forwardRef(/* @__PURE__ */ __name19(function RovingFocusGroupItem2(props, forwardedRef) {
    const {
      __scopeRovingFocusGroup,
      focusable = true,
      active = false,
      tabStopId,
      children,
      ...itemProps
    } = props;
    const autoId = useId();
    const id = tabStopId || autoId;
    const context = useRovingFocusContext(ITEM_NAME, __scopeRovingFocusGroup);
    const isCurrentTabStop = context.currentTabStopId === id;
    const getItems = useCollection(__scopeRovingFocusGroup);
    const { onFocusableItemAdd, onFocusableItemRemove, currentTabStopId } = context;
    const isHydrated = useIsHydrated2();
    useLayoutEffect2(() => {
      if (!isHydrated || !focusable) {
        return;
      }
      onFocusableItemAdd();
      return () => onFocusableItemRemove();
    }, [isHydrated, focusable, onFocusableItemAdd, onFocusableItemRemove]);
    React32.useEffect(() => {
      if (isHydrated || !focusable) {
        return;
      }
      onFocusableItemAdd();
      return () => onFocusableItemRemove();
    }, [isHydrated, focusable, onFocusableItemAdd, onFocusableItemRemove]);
    return /* @__PURE__ */ jsx(Collection.ItemSlot, {
      scope: __scopeRovingFocusGroup,
      id,
      focusable,
      active,
      children: /* @__PURE__ */ jsx(Primitive.span, {
        tabIndex: isCurrentTabStop ? 0 : -1,
        "data-orientation": context.orientation,
        ...itemProps,
        ref: forwardedRef,
        onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
          if (!focusable)
            event.preventDefault();
          else
            context.onItemFocus(id);
        }),
        onFocus: composeEventHandlers(props.onFocus, () => context.onItemFocus(id)),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          if (event.key === "Tab" && event.shiftKey) {
            context.onItemShiftTab();
            return;
          }
          if (event.target !== event.currentTarget)
            return;
          const focusIntent = getFocusIntent(event, context.orientation, context.dir);
          if (focusIntent !== undefined) {
            if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
              return;
            event.preventDefault();
            const items = getItems().filter((item) => item.focusable);
            let candidateNodes = items.map((item) => item.ref.current);
            if (focusIntent === "last")
              candidateNodes.reverse();
            else if (focusIntent === "prev" || focusIntent === "next") {
              if (focusIntent === "prev")
                candidateNodes.reverse();
              const currentIndex = candidateNodes.indexOf(event.currentTarget);
              candidateNodes = context.loop ? wrapArray(candidateNodes, currentIndex + 1) : candidateNodes.slice(currentIndex + 1);
            }
            setTimeout(() => focusFirst2(candidateNodes));
          }
        }),
        children: typeof children === "function" ? children({ isCurrentTabStop, hasTabStop: currentTabStopId != null }) : children
      })
    });
  }, "RovingFocusGroupItem"));
  var MAP_KEY_TO_FOCUS_INTENT = {
    ArrowLeft: "prev",
    ArrowUp: "prev",
    ArrowRight: "next",
    ArrowDown: "next",
    PageUp: "first",
    Home: "first",
    PageDown: "last",
    End: "last"
  };
  function getDirectionAwareKey(key, dir) {
    if (dir !== Direction2.RTL)
      return key;
    return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
  }
  __name19(getDirectionAwareKey, "getDirectionAwareKey");
  function getFocusIntent(event, orientation, dir) {
    const key = getDirectionAwareKey(event.key, dir);
    if (orientation === Orientation.Vertical && ["ArrowLeft", "ArrowRight"].includes(key)) {
      return;
    }
    if (orientation === Orientation.Horizontal && ["ArrowUp", "ArrowDown"].includes(key)) {
      return;
    }
    return MAP_KEY_TO_FOCUS_INTENT[key];
  }
  __name19(getFocusIntent, "getFocusIntent");
  function focusFirst2(candidates, preventScroll = false) {
    const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
    for (const candidate of candidates) {
      if (candidate === PREVIOUSLY_FOCUSED_ELEMENT)
        return;
      candidate.focus({ preventScroll });
      if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT)
        return;
    }
  }
  __name19(focusFirst2, "focusFirst");
  function wrapArray(array, startIndex) {
    return array.map((_, index) => array[(startIndex + index) % array.length]);
  }
  __name19(wrapArray, "wrapArray");

  // node_modules/@radix-ui/react-tabs/dist/index.mjs
  "use client";
  var __defProp21 = Object.defineProperty;
  var __name20 = (target, value) => __defProp21(target, "name", { value, configurable: true });
  var ActivationMode = {
    Automatic: "automatic",
    Manual: "manual"
  };
  var TABS_NAME = "Tabs";
  var [createTabsContext, createTabsScope] = createContextScope(TABS_NAME, [
    createRovingFocusGroupScope
  ]);
  var useRovingFocusGroupScope = createRovingFocusGroupScope();
  var [TabsProvider, useTabsContext] = createTabsContext(TABS_NAME);
  var Tabs = /* @__PURE__ */ React33.forwardRef(/* @__PURE__ */ __name20(function Tabs2(props, forwardedRef) {
    const {
      __scopeTabs,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = "horizontal",
      dir,
      activationMode = ActivationMode.Automatic,
      ...tabsProps
    } = props;
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue ?? "",
      caller: TABS_NAME
    });
    return /* @__PURE__ */ jsx(TabsProvider, {
      scope: __scopeTabs,
      baseId: useId(),
      value,
      onValueChange: setValue,
      orientation,
      dir: direction,
      activationMode,
      children: /* @__PURE__ */ jsx(Primitive.div, {
        dir: direction,
        "data-orientation": orientation,
        ...tabsProps,
        ref: forwardedRef
      })
    });
  }, "Tabs"));
  var TAB_LIST_NAME = "TabsList";
  var TabsList = /* @__PURE__ */ React33.forwardRef(/* @__PURE__ */ __name20(function TabsList2(props, forwardedRef) {
    const { __scopeTabs, loop = true, ...listProps } = props;
    const context = useTabsContext(TAB_LIST_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    return /* @__PURE__ */ jsx(RovingFocusGroup, {
      asChild: true,
      ...rovingFocusGroupScope,
      orientation: context.orientation,
      dir: context.dir,
      loop,
      children: /* @__PURE__ */ jsx(Primitive.div, {
        role: "tablist",
        "aria-orientation": context.orientation,
        ...listProps,
        ref: forwardedRef
      })
    });
  }, "TabsList"));
  var TRIGGER_NAME = "TabsTrigger";
  var TabsTrigger = /* @__PURE__ */ React33.forwardRef(/* @__PURE__ */ __name20(function TabsTrigger2(props, forwardedRef) {
    const { __scopeTabs, value, disabled = false, ...triggerProps } = props;
    const context = useTabsContext(TRIGGER_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    return /* @__PURE__ */ jsx(RovingFocusGroupItem, {
      asChild: true,
      ...rovingFocusGroupScope,
      focusable: !disabled,
      active: isSelected,
      children: /* @__PURE__ */ jsx(Primitive.button, {
        type: "button",
        role: "tab",
        "aria-selected": isSelected,
        "aria-controls": contentId,
        "data-state": isSelected ? "active" : "inactive",
        "data-disabled": disabled ? "" : undefined,
        disabled,
        id: triggerId,
        ...triggerProps,
        ref: forwardedRef,
        onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
          if (!disabled && event.button === 0 && event.ctrlKey === false) {
            event.currentTarget.focus();
            context.onValueChange(value);
          } else {
            event.preventDefault();
          }
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          if (disabled || event.target !== event.currentTarget) {
            return;
          }
          if ([" ", "Enter"].includes(event.key)) {
            context.onValueChange(value);
          }
        }),
        onFocus: composeEventHandlers(props.onFocus, () => {
          const isAutomaticActivation = context.activationMode !== ActivationMode.Manual;
          if (!isSelected && !disabled && isAutomaticActivation) {
            context.onValueChange(value);
          }
        })
      })
    });
  }, "TabsTrigger"));
  var CONTENT_NAME2 = "TabsContent";
  var TabsContent = /* @__PURE__ */ React33.forwardRef(/* @__PURE__ */ __name20(function TabsContent2(props, forwardedRef) {
    const { __scopeTabs, value, forceMount, children, ...contentProps } = props;
    const context = useTabsContext(CONTENT_NAME2, __scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    const isMountAnimationPreventedRef = React33.useRef(isSelected);
    React33.useEffect(() => {
      const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
      return () => cancelAnimationFrame(rAF);
    }, []);
    return /* @__PURE__ */ jsx(Presence, { present: forceMount || isSelected, children: ({ present }) => /* @__PURE__ */ jsx(Primitive.div, {
      "data-state": isSelected ? "active" : "inactive",
      "data-orientation": context.orientation,
      role: "tabpanel",
      "aria-labelledby": triggerId,
      hidden: !present,
      id: contentId,
      tabIndex: 0,
      ...contentProps,
      ref: forwardedRef,
      style: {
        ...props.style,
        animationDuration: isMountAnimationPreventedRef.current ? "0s" : undefined
      },
      children: present && children
    }) });
  }, "TabsContent"));
  function makeTriggerId(baseId, value) {
    return `${baseId}-trigger-${value}`;
  }
  __name20(makeTriggerId, "makeTriggerId");
  function makeContentId(baseId, value) {
    return `${baseId}-content-${value}`;
  }
  __name20(makeContentId, "makeContentId");

  // node_modules/@radix-ui/react-use-size/dist/index.mjs
  var React34 = __toESM(require("react"));
  var __defProp22 = Object.defineProperty;
  var __name21 = (target, value) => __defProp22(target, "name", { value, configurable: true });
  function useSize(element) {
    const [size, setSize] = React34.useState(undefined);
    useLayoutEffect2(() => {
      if (element) {
        setSize({ width: element.offsetWidth, height: element.offsetHeight });
        let rAF = 0;
        const resizeObserver = new ResizeObserver((entries) => {
          if (!Array.isArray(entries)) {
            return;
          }
          if (!entries.length) {
            return;
          }
          const entry = entries[0];
          window.cancelAnimationFrame(rAF);
          rAF = window.requestAnimationFrame(() => {
            let width;
            let height;
            if ("borderBoxSize" in entry) {
              const borderSizeEntry = entry["borderBoxSize"];
              const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;
              width = borderSize["inlineSize"];
              height = borderSize["blockSize"];
            } else {
              width = element.offsetWidth;
              height = element.offsetHeight;
            }
            setSize({ width, height });
          });
        });
        resizeObserver.observe(element, { box: "border-box" });
        return () => {
          window.cancelAnimationFrame(rAF);
          resizeObserver.unobserve(element);
        };
      } else {
        setSize(undefined);
      }
    }, [element]);
    return size;
  }
  __name21(useSize, "useSize");

  // node_modules/@radix-ui/react-switch/dist/index.mjs
  var React35 = __toESM(require("react"));
  "use client";
  var __defProp23 = Object.defineProperty;
  var __name22 = (target, value) => __defProp23(target, "name", { value, configurable: true });
  var SWITCH_NAME = "Switch";
  var [createSwitchContext, createSwitchScope] = createContextScope(SWITCH_NAME);
  var [SwitchProviderImpl, useSwitchContext] = createSwitchContext(SWITCH_NAME);
  function SwitchProvider(props) {
    const {
      __scopeSwitch,
      checked: checkedProp,
      children,
      defaultChecked,
      disabled,
      form,
      name,
      onCheckedChange,
      required,
      value = "on",
      internal_do_not_use_render
    } = props;
    const [checked, setChecked] = useControllableState({
      prop: checkedProp,
      defaultProp: defaultChecked ?? false,
      onChange: onCheckedChange,
      caller: SWITCH_NAME
    });
    const [control, setControl] = React35.useState(null);
    const [bubbleInput, setBubbleInput] = React35.useState(null);
    const [userClick, setUserClick] = React35.useState(null);
    const isFormControl = control ? !!form || !!control.closest("form") : true;
    const context = {
      checked,
      setChecked,
      disabled,
      control,
      setControl,
      name,
      form,
      value,
      userClick,
      onUserClick: setUserClick,
      required,
      defaultChecked,
      isFormControl,
      bubbleInput,
      setBubbleInput
    };
    return /* @__PURE__ */ jsx(SwitchProviderImpl, { scope: __scopeSwitch, ...context, children: isFunction2(internal_do_not_use_render) ? internal_do_not_use_render(context) : children });
  }
  __name22(SwitchProvider, "SwitchProvider");
  var TRIGGER_NAME2 = "SwitchTrigger";
  var SwitchTrigger = /* @__PURE__ */ React35.forwardRef(/* @__PURE__ */ __name22(function SwitchTrigger2({ __scopeSwitch, onClick, ...switchProps }, forwardedRef) {
    const {
      control,
      form,
      value,
      disabled,
      checked,
      required,
      setControl,
      setChecked,
      onUserClick,
      isFormControl,
      bubbleInput
    } = useSwitchContext(TRIGGER_NAME2, __scopeSwitch);
    const composedRefs = useComposedRefs(forwardedRef, setControl);
    const initialCheckedStateRef = React35.useRef(checked);
    React35.useEffect(() => {
      const associatedForm = form ? control?.ownerDocument.getElementById(form) : control?.form;
      if (associatedForm instanceof HTMLFormElement) {
        const reset = /* @__PURE__ */ __name22(() => setChecked(initialCheckedStateRef.current), "reset");
        associatedForm.addEventListener("reset", reset);
        return () => associatedForm.removeEventListener("reset", reset);
      }
    }, [control, form, setChecked]);
    return /* @__PURE__ */ jsx(Primitive.button, {
      type: "button",
      role: "switch",
      "aria-checked": checked,
      "aria-required": required,
      "data-state": getState2(checked),
      "data-disabled": disabled ? "" : undefined,
      disabled,
      value,
      ...switchProps,
      ref: composedRefs,
      onClick: composeEventHandlers(onClick, (event) => {
        const hasConsumerStoppedPropagation = event.isPropagationStopped();
        onUserClick({ requestedChecked: !checked, hasConsumerStoppedPropagation });
        setChecked((prevChecked) => !prevChecked);
        if (bubbleInput && isFormControl) {
          if (!hasConsumerStoppedPropagation) {
            event.stopPropagation();
          }
        }
      })
    });
  }, "SwitchTrigger"));
  var Switch = /* @__PURE__ */ React35.forwardRef(/* @__PURE__ */ __name22(function Switch2(props, forwardedRef) {
    const {
      __scopeSwitch,
      name,
      checked,
      defaultChecked,
      required,
      disabled,
      value,
      onCheckedChange,
      form,
      ...switchProps
    } = props;
    return /* @__PURE__ */ jsx(SwitchProvider, {
      __scopeSwitch,
      checked,
      defaultChecked,
      disabled,
      required,
      onCheckedChange,
      name,
      form,
      value,
      internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SwitchTrigger, {
          ...switchProps,
          ref: forwardedRef,
          __scopeSwitch
        }),
        isFormControl && /* @__PURE__ */ jsx(SwitchBubbleInput, {
          __scopeSwitch
        })
      ] })
    });
  }, "Switch"));
  var THUMB_NAME = "SwitchThumb";
  var SwitchThumb = /* @__PURE__ */ React35.forwardRef(/* @__PURE__ */ __name22(function SwitchThumb2(props, forwardedRef) {
    const { __scopeSwitch, ...thumbProps } = props;
    const context = useSwitchContext(THUMB_NAME, __scopeSwitch);
    return /* @__PURE__ */ jsx(Primitive.span, {
      "data-state": getState2(context.checked),
      "data-disabled": context.disabled ? "" : undefined,
      ...thumbProps,
      ref: forwardedRef
    });
  }, "SwitchThumb"));
  var BUBBLE_INPUT_NAME = "SwitchBubbleInput";
  var SwitchBubbleInput = /* @__PURE__ */ React35.forwardRef(/* @__PURE__ */ __name22(function SwitchBubbleInput2({ __scopeSwitch, onClick, ...props }, forwardedRef) {
    const {
      control,
      userClick,
      checked,
      defaultChecked,
      required,
      disabled,
      name,
      value,
      form,
      bubbleInput,
      setBubbleInput
    } = useSwitchContext(BUBBLE_INPUT_NAME, __scopeSwitch);
    const composedRefs = useComposedRefs(forwardedRef, setBubbleInput);
    const controlSize = useSize(control);
    const shouldStopClickPropagationRef = React35.useRef(false);
    const prevCheckedRef = React35.useRef(checked);
    const handledUserClickRef = React35.useRef(userClick);
    const pendingUserClickRef = React35.useRef(null);
    React35.useEffect(() => {
      const input = bubbleInput;
      if (!input)
        return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(inputProto, "checked");
      const setChecked = descriptor.set;
      if (!setChecked) {
        return;
      }
      const checkedChanged = prevCheckedRef.current !== checked;
      prevCheckedRef.current = checked;
      const isNewUserClick = userClick !== null && userClick !== handledUserClickRef.current;
      handledUserClickRef.current = userClick;
      if (isNewUserClick) {
        pendingUserClickRef.current = checkedChanged ? null : userClick;
        if (checkedChanged) {
          setChecked.call(input, checked);
        }
        input.dispatchEvent(new Event("click", { bubbles: !userClick.hasConsumerStoppedPropagation }));
      } else if (checkedChanged) {
        const pendingUserClick = pendingUserClickRef.current;
        pendingUserClickRef.current = null;
        const isPendingUserChange = pendingUserClick?.requestedChecked === checked;
        shouldStopClickPropagationRef.current = true;
        setChecked.call(input, checked);
        input.dispatchEvent(new Event("click", {
          bubbles: !(isPendingUserChange && pendingUserClick.hasConsumerStoppedPropagation)
        }));
        shouldStopClickPropagationRef.current = false;
      }
    }, [bubbleInput, checked, userClick]);
    const defaultCheckedRef = React35.useRef(checked);
    return /* @__PURE__ */ jsx(Primitive.input, {
      type: "checkbox",
      "aria-hidden": true,
      defaultChecked: defaultChecked ?? defaultCheckedRef.current,
      required,
      disabled,
      name,
      value,
      form,
      ...props,
      tabIndex: -1,
      ref: composedRefs,
      onClick: composeEventHandlers(onClick, (event) => {
        if (shouldStopClickPropagationRef.current) {
          event.stopPropagation();
        }
      }),
      style: {
        ...props.style,
        ...controlSize,
        position: "absolute",
        pointerEvents: "none",
        opacity: 0,
        margin: 0,
        transform: "translateX(-100%)"
      }
    });
  }, "SwitchBubbleInput"));
  function isFunction2(value) {
    return typeof value === "function";
  }
  __name22(isFunction2, "isFunction");
  function getState2(checked) {
    return checked ? "checked" : "unchecked";
  }
  __name22(getState2, "getState");

  // src/client/ui/icons.tsx
  var React36 = __toESM(require("react"));
  var BASE = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: "false"
  };
  function Svg(props) {
    const size = props.size ?? 16;
    const inner = React36.Children.toArray(props.children);
    return /* @__PURE__ */ jsxDEV("svg", {
      width: size,
      height: size,
      viewBox: props.viewBox ?? "0 0 16 16",
      ...BASE,
      className: props.className,
      style: props.style,
      children: inner
    }, undefined, false, undefined, this);
  }
  function MeetingIcon(props) {
    const size = props.size ?? 16;
    return /* @__PURE__ */ jsxDEV("svg", {
      width: size,
      height: size,
      viewBox: "0 0 16 16",
      ...BASE,
      className: props.className,
      style: props.style,
      children: [
        /* @__PURE__ */ jsxDEV("rect", {
          x: "1.6",
          y: "3.2",
          width: "9.2",
          height: "9.6",
          rx: "1.6"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M10.8 7.1l3.6-1.9v5.6l-3.6-1.9"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Plus(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: /* @__PURE__ */ jsxDEV("path", {
        d: "M8 3.2v9.6M3.2 8h9.6"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function ChevronRight(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: /* @__PURE__ */ jsxDEV("path", {
        d: "M6.2 3.6L10.6 8l-4.4 4.4"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function ChevronLeft(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: /* @__PURE__ */ jsxDEV("path", {
        d: "M9.8 3.6L5.4 8l4.4 4.4"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function ChevronDown(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: /* @__PURE__ */ jsxDEV("path", {
        d: "M3.6 6.2L8 10.6l4.4-4.4"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function X(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: /* @__PURE__ */ jsxDEV("path", {
        d: "M4 4l8 8M12 4l-8 8"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function Check(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: /* @__PURE__ */ jsxDEV("path", {
        d: "M3 8.6l3.2 3.2L13 4.6"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function Refresh(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M13.2 8a5.2 5.2 0 1 1-1.7-3.9"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M13.4 2.2v3.2h-3.2"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Filter(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: /* @__PURE__ */ jsxDEV("path", {
        d: "M2.4 3.6h11.2l-4.2 4.6v4.4l-2.8-1.6V8.2z"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function ArrowRight(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: /* @__PURE__ */ jsxDEV("path", {
        d: "M2.8 8h10M9.2 4.4L12.8 8l-3.6 3.6"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function Alert(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M8 2.6l6 10.4H2z"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M8 6.6v3"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M8 11.4v.6"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function ExternalLink(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M6.4 3.2H3.4v9.6h9.4V9.6"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M9.4 2.8h3.8v3.8M13 3l-5.2 5.2"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Copy(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("rect", {
          x: "5.2",
          y: "5.2",
          width: "8",
          height: "8",
          rx: "1.4"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M10.8 5.2V3.8a1.4 1.4 0 0 0-1.4-1.4H3.8a1.4 1.4 0 0 0-1.4 1.4v5.6a1.4 1.4 0 0 0 1.4 1.4h1.4"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Users(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("circle", {
          cx: "6",
          cy: "5.4",
          r: "2.4"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M1.8 13.2c0-2.2 1.9-3.6 4.2-3.6s4.2 1.4 4.2 3.6"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M10.6 3.4a2.2 2.2 0 0 1 0 4.2M11.8 13.2c0-1.4-.4-2.4-1.2-3"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Play(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("circle", {
          cx: "8",
          cy: "8",
          r: "5.8"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M6.6 5.6l4 2.4-4 2.4z"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Shield(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: /* @__PURE__ */ jsxDEV("path", {
        d: "M8 2l4.6 1.8v3.6c0 2.8-1.9 4.7-4.6 5.6-2.7-.9-4.6-2.8-4.6-5.6V3.8z"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function Maximize(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M8 3.2h2.8M8 3.2v2.8M8 3.2L3.2 8M8 12.8H5.2M8 12.8v-2.8M8 12.8l4.8-4.8M12.8 8V5.2M12.8 8h-2.8"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M3.2 8V5.2A2 2 0 0 1 5.2 3.2H8M12.8 8v2.8a2 2 0 0 1-2 2H8"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Settings(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      viewBox: "0 0 24 24",
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("circle", {
          cx: "12",
          cy: "12",
          r: "3"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function MoreHorizontal(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: /* @__PURE__ */ jsxDEV("path", {
        d: "M3.4 8h.02M8 8h.02M12.6 8h.02"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function Doc(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M9 2.2H4.4a1.2 1.2 0 0 0-1.2 1.2v9.2a1.2 1.2 0 0 0 1.2 1.2h7.2a1.2 1.2 0 0 0 1.2-1.2V6z"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M9 2.2V6h3.8M5.6 8.6h4.8M5.6 11h3.2"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Trash(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M2.8 4.4h10.4M6.2 4.4V3a1 1 0 0 1 1-1h1.6a1 1 0 0 1 1 1v1.4"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M4.2 4.4l.6 8.2a1 1 0 0 0 1 .9h4.4a1 1 0 0 0 1-.9l.6-8.2"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Calendar(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("rect", {
          x: "2.4",
          y: "3.6",
          width: "11.2",
          height: "10",
          rx: "1.4"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M5.6 2.2v2.6M10.4 2.2v2.6M2.4 6.6h11.2"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Video(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("rect", {
          x: "1.8",
          y: "4",
          width: "8.4",
          height: "8",
          rx: "1.4"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M10.2 7.4l4-2.2v5.6l-4-2.2"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Pen(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      className: [p.className, "tm-pen"].filter(Boolean).join(" "),
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M2.6 13.4l.9-3.2 6.7-6.7a1.6 1.6 0 0 1 2.3 2.3l-6.7 6.7z"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M9.4 3.8l2.8 2.8"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Wand(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M2.4 13.6l7.4-7.4"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M10.4 2.2v2.4M9.2 3.4h2.4M13.2 6.2v2M12.2 7.2h2"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Send(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M2.5 8.4 13.5 2.8 8.8 13.6 6.9 9.4z"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M6.9 9.4 13.5 2.8"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Logout(p) {
    return /* @__PURE__ */ jsxDEV(Svg, {
      ...p,
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M6 2.6H3.4a1.2 1.2 0 0 0-1.2 1.2v8.4a1.2 1.2 0 0 0 1.2 1.2H6"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M10.4 11l3-3-3-3M13.4 8H6"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }

  // src/client/ui/radix.tsx
  function Dialog2(props) {
    const dismissable = props.dismissable !== false;
    return /* @__PURE__ */ jsxDEV(Dialog, {
      open: props.open,
      onOpenChange: (next) => {
        if (!dismissable && !next)
          return;
        props.onOpenChange(next);
      },
      children: /* @__PURE__ */ jsxDEV(DialogPortal, {
        children: [
          /* @__PURE__ */ jsxDEV(DialogOverlay, {
            className: "tm-overlay"
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV(DialogContent, {
            className: `tm-dialog${props.wide ? " is-wide" : ""}`,
            onEscapeKeyDown: (e) => {
              if (!dismissable)
                e.preventDefault();
            },
            onPointerDownOutside: (e) => {
              if (!dismissable)
                e.preventDefault();
            },
            onInteractOutside: (e) => {
              if (!dismissable)
                e.preventDefault();
            },
            children: [
              /* @__PURE__ */ jsxDEV("div", {
                className: "tm-dialog-h",
                children: [
                  /* @__PURE__ */ jsxDEV("div", {
                    className: "tm-grow tm-stack",
                    style: { gap: 0 },
                    children: [
                      /* @__PURE__ */ jsxDEV(DialogTitle, {
                        className: "tm-dialog-title",
                        children: props.title
                      }, undefined, false, undefined, this),
                      props.description ? /* @__PURE__ */ jsxDEV(DialogDescription, {
                        className: "tm-dialog-desc",
                        children: props.description
                      }, undefined, false, undefined, this) : null
                    ]
                  }, undefined, true, undefined, this),
                  /* @__PURE__ */ jsxDEV(DialogClose, {
                    asChild: true,
                    children: /* @__PURE__ */ jsxDEV("button", {
                      type: "button",
                      className: "tm-iconbtn",
                      "aria-label": "关闭",
                      disabled: !dismissable,
                      children: /* @__PURE__ */ jsxDEV(X, {
                        size: 15
                      }, undefined, false, undefined, this)
                    }, undefined, false, undefined, this)
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "tm-dialog-b",
                children: props.children
              }, undefined, false, undefined, this),
              props.footer ? /* @__PURE__ */ jsxDEV("div", {
                className: "tm-dialog-f",
                children: props.footer
              }, undefined, false, undefined, this) : null
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
  }
  var TabsRoot = Tabs;
  var TabsContent3 = TabsContent;
  function TabList(props) {
    return /* @__PURE__ */ jsxDEV(TabsList, {
      className: "tm-tablist",
      "aria-label": props.label ?? "会议内容",
      children: props.items.map((t) => /* @__PURE__ */ jsxDEV(TabsTrigger, {
        value: t.value,
        disabled: t.disabled,
        className: "tm-tab",
        title: t.disabled ? t.reason || "这个页签现在不可用" : undefined,
        children: t.label
      }, t.value, false, undefined, this))
    }, undefined, false, undefined, this);
  }
  function Select(props) {
    const hasValue = props.options.some((o) => o.value === props.value);
    return /* @__PURE__ */ jsxDEV("span", {
      className: "tm-sel-wrap",
      children: [
        /* @__PURE__ */ jsxDEV("select", {
          id: props.id,
          className: "tm-sel-trigger",
          "aria-label": props.ariaLabel,
          disabled: props.disabled,
          value: hasValue ? props.value : "",
          onChange: (e) => props.onValueChange(e.target.value),
          children: [
            /* @__PURE__ */ jsxDEV("option", {
              value: "",
              disabled: true,
              children: props.placeholder ?? "请选择"
            }, undefined, false, undefined, this),
            props.options.map((o) => /* @__PURE__ */ jsxDEV("option", {
              value: o.value,
              disabled: o.disabled,
              children: o.label
            }, o.value, false, undefined, this))
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV("span", {
          className: "tm-sel-arrow",
          "aria-hidden": "true",
          children: /* @__PURE__ */ jsxDEV(ChevronDown, {
            size: 13
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Switch3(props) {
    return /* @__PURE__ */ jsxDEV(Switch, {
      checked: props.checked,
      onCheckedChange: props.onCheckedChange,
      disabled: props.disabled,
      className: "tm-switch",
      "aria-label": props.label,
      children: /* @__PURE__ */ jsxDEV(SwitchThumb, {
        className: "tm-switch-thumb"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }

  // src/client/ui/base.tsx
  var React37 = __toESM(require("react"));
  function Button(props) {
    const { variant = "ghost", size = "md", block, icon, className, children, type, ...rest } = props;
    const cls = [
      "tm-btn",
      `is-${variant}`,
      size === "sm" ? "is-sm" : size === "lg" ? "is-lg" : "",
      block ? "is-block" : "",
      className ?? ""
    ].filter(Boolean).join(" ");
    return /* @__PURE__ */ jsxDEV("button", {
      ...rest,
      type: type ?? "button",
      className: cls,
      children: [
        icon,
        children
      ]
    }, undefined, true, undefined, this);
  }
  function IconButton(props) {
    const { label, className, children, type, ...rest } = props;
    return /* @__PURE__ */ jsxDEV("button", {
      ...rest,
      type: type ?? "button",
      className: ["tm-iconbtn", className ?? ""].filter(Boolean).join(" "),
      "aria-label": label,
      title: label,
      children
    }, undefined, false, undefined, this);
  }
  function Field(props) {
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-field",
      children: [
        /* @__PURE__ */ jsxDEV("label", {
          className: "tm-label",
          htmlFor: props.htmlFor,
          children: [
            props.label,
            props.required ? /* @__PURE__ */ jsxDEV("span", {
              className: "tm-req",
              children: "*"
            }, undefined, false, undefined, this) : null
          ]
        }, undefined, true, undefined, this),
        props.children,
        props.hint ? /* @__PURE__ */ jsxDEV("span", {
          className: `tm-hint${props.hintTone === "warn" ? " is-warn" : props.hintTone === "err" ? " is-err" : ""}`,
          children: props.hint
        }, undefined, false, undefined, this) : null
      ]
    }, undefined, true, undefined, this);
  }
  var Input = React37.forwardRef(function Input2(props, ref) {
    const { className, ...rest } = props;
    return /* @__PURE__ */ jsxDEV("input", {
      ...rest,
      ref,
      className: ["tm-input", className ?? ""].filter(Boolean).join(" ")
    }, undefined, false, undefined, this);
  });
  function Textarea(props) {
    const { className, ...rest } = props;
    return /* @__PURE__ */ jsxDEV("textarea", {
      ...rest,
      className: ["tm-textarea", className ?? ""].filter(Boolean).join(" ")
    }, undefined, false, undefined, this);
  }
  function AutoTextarea(props) {
    const { className, minRows = 2, maxPx = 220, value, onChange, ...rest } = props;
    const ref = React37.useRef(null);
    const resize = React37.useCallback(() => {
      const el = ref.current;
      if (!el)
        return;
      el.style.height = "auto";
      const next = Math.min(el.scrollHeight, maxPx);
      el.style.height = `${next}px`;
    }, [maxPx]);
    React37.useEffect(() => {
      resize();
    }, [value, resize]);
    return /* @__PURE__ */ jsxDEV("textarea", {
      ...rest,
      ref,
      rows: minRows,
      value,
      onChange: (e) => {
        onChange?.(e);
        resize();
      },
      className: ["tm-textarea", "is-auto", className ?? ""].filter(Boolean).join(" ")
    }, undefined, false, undefined, this);
  }
  function Badge(props) {
    return /* @__PURE__ */ jsxDEV("span", {
      className: `tm-badge is-${props.tone ?? "muted"}`,
      title: props.title,
      children: props.children
    }, undefined, false, undefined, this);
  }
  function Card(props) {
    return /* @__PURE__ */ jsxDEV("div", {
      className: ["tm-card", props.className ?? ""].filter(Boolean).join(" "),
      children: props.children
    }, undefined, false, undefined, this);
  }
  function CardHeader(props) {
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-card-h",
      children: [
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-grow tm-stack",
          style: { gap: 0 },
          children: [
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-strong",
              style: { fontSize: 13 },
              children: props.title
            }, undefined, false, undefined, this),
            props.sub ? /* @__PURE__ */ jsxDEV("span", {
              className: "tm-caption",
              children: props.sub
            }, undefined, false, undefined, this) : null
          ]
        }, undefined, true, undefined, this),
        props.extra ? /* @__PURE__ */ jsxDEV("div", {
          className: "tm-shrink0",
          children: props.extra
        }, undefined, false, undefined, this) : null
      ]
    }, undefined, true, undefined, this);
  }
  function Banner(props) {
    const quotaText = typeof props.children === "string" && (props.children.includes("额度") || props.children.includes("已达上限"));
    const tone = quotaText ? "warn" : props.tone ?? "warn";
    const body = quotaText ? "今日额度已满，这次没拉到新数据；已有的内容照常能看。" : props.children;
    return /* @__PURE__ */ jsxDEV("div", {
      className: `tm-banner is-${tone}`,
      role: "status",
      children: [
        props.icon ? /* @__PURE__ */ jsxDEV("span", {
          className: "tm-shrink0 tm-banner-icon",
          children: props.icon
        }, undefined, false, undefined, this) : null,
        /* @__PURE__ */ jsxDEV("span", {
          className: "tm-grow",
          children: body
        }, undefined, false, undefined, this),
        props.action ? /* @__PURE__ */ jsxDEV("span", {
          className: "tm-shrink0",
          children: props.action
        }, undefined, false, undefined, this) : null
      ]
    }, undefined, true, undefined, this);
  }
  function SkeletonRows(props) {
    const rows = props.rows ?? 4;
    return /* @__PURE__ */ jsxDEV("div", {
      "aria-hidden": "true",
      children: Array.from({ length: rows }, (_, i) => /* @__PURE__ */ jsxDEV("div", {
        className: "tm-skeleton-row",
        children: [
          /* @__PURE__ */ jsxDEV("span", {
            className: "tm-skeleton",
            style: { width: 7, height: 7, borderRadius: 999 }
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("span", {
            className: "tm-grow",
            style: { display: "grid", gap: 6 },
            children: [
              /* @__PURE__ */ jsxDEV("span", {
                className: "tm-skeleton tm-skeleton-line",
                style: { width: `${68 - i * 7}%` }
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("span", {
                className: "tm-skeleton tm-skeleton-line",
                style: { width: `${42 - i * 4}%`, height: 8 }
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, i, true, undefined, this))
    }, undefined, false, undefined, this);
  }
  function Progress() {
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-progress",
      role: "progressbar",
      "aria-label": "正在加载"
    }, undefined, false, undefined, this);
  }
  function Empty(props) {
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-empty",
      children: [
        /* @__PURE__ */ jsxDEV("p", {
          className: "tm-empty-title",
          children: props.title
        }, undefined, false, undefined, this),
        props.desc ? /* @__PURE__ */ jsxDEV("p", {
          className: "tm-empty-desc",
          children: props.desc
        }, undefined, false, undefined, this) : null,
        props.actions ? /* @__PURE__ */ jsxDEV("div", {
          className: "tm-empty-acts",
          children: props.actions
        }, undefined, false, undefined, this) : null
      ]
    }, undefined, true, undefined, this);
  }
  function Spinner() {
    return /* @__PURE__ */ jsxDEV("span", {
      className: "tm-spinner",
      role: "status",
      "aria-label": "正在加载"
    }, undefined, false, undefined, this);
  }
  function LoadingRow(props) {
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-loading-row",
      children: [
        /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("span", {
          children: props.text ?? "正在取回数据…"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function KeyValues(props) {
    return /* @__PURE__ */ jsxDEV("dl", {
      className: "tm-kv",
      children: props.rows.map((r) => /* @__PURE__ */ jsxDEV(React37.Fragment, {
        children: [
          /* @__PURE__ */ jsxDEV("dt", {
            children: r.label
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("dd", {
            children: r.value
          }, undefined, false, undefined, this)
        ]
      }, r.label, true, undefined, this))
    }, undefined, false, undefined, this);
  }
  function Separator() {
    return /* @__PURE__ */ jsxDEV("hr", {
      className: "tm-sep"
    }, undefined, false, undefined, this);
  }
  function useReveal(items, step = 8) {
    const [limit, setLimit] = React37.useState(step);
    React37.useEffect(() => {
      setLimit(step);
    }, [step, items.length === 0]);
    const shown = items.length > limit ? items.slice(0, limit) : items;
    return {
      all: items,
      shown,
      hidden: Math.max(0, items.length - shown.length),
      expanded: limit > step,
      reveal: () => setLimit((n) => n + step),
      collapse: () => setLimit(step)
    };
  }
  function RevealMore(props) {
    if (!props.hidden && !props.expanded)
      return null;
    const noun = props.noun ?? "条";
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-reveal",
      children: [
        props.hidden ? /* @__PURE__ */ jsxDEV(Button, {
          size: "sm",
          variant: "text",
          onClick: props.onReveal,
          children: [
            "展开其余 ",
            props.hidden,
            " ",
            noun,
            "（共 ",
            props.total,
            " ",
            noun,
            "）"
          ]
        }, undefined, true, undefined, this) : null,
        props.expanded && props.onCollapse ? /* @__PURE__ */ jsxDEV(Fragment, {
          children: [
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-caption",
              children: [
                "已加载 ",
                props.total - props.hidden,
                "/",
                props.total,
                " ",
                noun
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ jsxDEV(Button, {
              size: "sm",
              variant: "text",
              onClick: props.onCollapse,
              children: "收起"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this) : null
      ]
    }, undefined, true, undefined, this);
  }

  // src/client/paste-dialog.tsx
  function PasteDialog(props) {
    const [text, setText] = React38.useState("");
    const [source, setSource] = React38.useState("手机录音转文字");
    const [existing, setExisting] = React38.useState(null);
    const [confirmOverwrite, setConfirmOverwrite] = React38.useState(false);
    const [busy, setBusy] = React38.useState(false);
    const [error, setError] = React38.useState("");
    const label = props.kind === "minutes" ? "纪要" : props.kind === "todos" ? "待办" : "逐字稿";
    React38.useEffect(() => {
      if (!props.open) {
        setText("");
        setSource("手机录音转文字");
        setConfirmOverwrite(false);
        setError("");
        setExisting(null);
        return;
      }
      let alive = true;
      listPasted(props.meetingId).then((r) => {
        if (!alive)
          return;
        const hit = r.items.find((x) => x.kind === props.kind);
        setExisting(hit ? { chars: hit.chars, at: hit.at, source: hit.source } : null);
      }).catch(() => {});
      return () => {
        alive = false;
      };
    }, [props.open, props.meetingId, props.kind]);
    const save = async () => {
      setError("");
      setBusy(true);
      try {
        const r = await savePasted({
          id: props.meetingId,
          kind: props.kind,
          text,
          source,
          overwrite: confirmOverwrite
        });
        if (!r.ok) {
          setError(r.message);
          if (r.replaced)
            setConfirmOverwrite(true);
          return;
        }
        props.toast.push("ok", r.message);
        props.onOpenChange(false);
        props.onSaved();
      } catch (e) {
        setError(errorText(e));
      } finally {
        setBusy(false);
      }
    };
    const needOverwrite = Boolean(existing) && !confirmOverwrite;
    return /* @__PURE__ */ jsxDEV(Dialog2, {
      open: props.open,
      onOpenChange: props.onOpenChange,
      title: `粘贴${label}原文`,
      description: "只存在这台机器上，不会上传。产出里会标明「据你提供的原文生成」。",
      footer: /* @__PURE__ */ jsxDEV(Fragment, {
        children: [
          /* @__PURE__ */ jsxDEV("span", {
            className: "tm-grow tm-caption",
            children: text.trim() ? `已输入 ${text.trim().length} 字` : "把文字粘到上面，越完整产出越好"
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: "tm-dialog-acts",
            children: [
              /* @__PURE__ */ jsxDEV(Button, {
                onClick: () => props.onOpenChange(false),
                disabled: busy,
                children: "取消"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV(Button, {
                variant: "primary",
                onClick: () => void save(),
                disabled: busy || !text.trim() || needOverwrite,
                icon: busy ? /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this) : undefined,
                children: busy ? "正在保存…" : needOverwrite ? "先勾选覆盖" : "保存"
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this),
      children: [
        error ? /* @__PURE__ */ jsxDEV(Banner, {
          tone: "err",
          icon: /* @__PURE__ */ jsxDEV(Alert, {
            size: 14
          }, undefined, false, undefined, this),
          children: error
        }, undefined, false, undefined, this) : null,
        existing ? /* @__PURE__ */ jsxDEV(Banner, {
          tone: "warn",
          icon: /* @__PURE__ */ jsxDEV(Alert, {
            size: 14
          }, undefined, false, undefined, this),
          action: /* @__PURE__ */ jsxDEV("label", {
            className: "tm-row",
            style: { gap: 6 },
            children: [
              /* @__PURE__ */ jsxDEV("input", {
                type: "checkbox",
                checked: confirmOverwrite,
                onChange: (e) => setConfirmOverwrite(e.target.checked)
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("span", {
                className: "tm-caption",
                children: "覆盖"
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this),
          children: [
            "这场会已有一份 ",
            label,
            "（",
            existing.chars,
            " 字，",
            existing.at.slice(0, 10),
            "，来源：",
            existing.source,
            "）。保存会把它替换掉。"
          ]
        }, undefined, true, undefined, this) : null,
        /* @__PURE__ */ jsxDEV(Field, {
          label: "原文",
          hint: "支持长文，最多 40 万字；从会议软件或录音转写工具里复制即可。",
          children: /* @__PURE__ */ jsxDEV(Textarea, {
            value: text,
            onChange: (e) => setText(e.target.value),
            rows: 12,
            placeholder: `例：
  张三：今天主要过三件事……
  李四：第一件是……`
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV(Field, {
          label: "来源",
          hint: "会写进产出，让人知道这段话是哪来的。",
          children: /* @__PURE__ */ jsxDEV("input", {
            className: "tm-input",
            value: source,
            onChange: (e) => setSource(e.target.value),
            placeholder: "手机录音转文字"
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }

  // src/client/detail.tsx
  var paneMemo = new Map;
  function rememberPane(meetingId, pane) {
    paneMemo.set(meetingId, pane);
  }
  var PANES = [
    { value: "overview", label: "概览" },
    { value: "transcript", label: "逐字稿" },
    { value: "minutes", label: "纪要" },
    { value: "todos", label: "待办" },
    { value: "outputs", label: "会后产出" }
  ];
  var peopleMemo = new Map;
  function useNotifyOnReady() {
    const [on, setOn] = React39.useState(true);
    React39.useEffect(() => {
      getSettings().then((s) => setOn(Boolean(s.prefs.notifyOnReady))).catch(() => {});
    }, []);
    return on;
  }
  function Detail(props) {
    const [detail, setDetail] = React39.useState(() => cachedMeeting(props.meetingId));
    const [detailError, setDetailError] = React39.useState("");
    const [detailLoading, setDetailLoading] = React39.useState(() => !cachedMeeting(props.meetingId));
    const [states, setStates] = React39.useState(() => emptyStates());
    const [pane, setPaneState] = React39.useState(() => paneMemo.get(props.meetingId) ?? "overview");
    const setPane = (v) => {
      rememberPane(props.meetingId, v);
      setPaneState(v);
    };
    const [participants, setParticipants] = React39.useState(() => peopleMemo.get(props.meetingId)?.rows ?? []);
    const [peopleWarning, setPeopleWarning] = React39.useState(() => peopleMemo.get(props.meetingId)?.warning ?? "");
    const [peopleLoading, setPeopleLoading] = React39.useState(() => !peopleMemo.has(props.meetingId));
    const [permOpen, setPermOpen] = React39.useState(false);
    const [permPreview, setPermPreview] = React39.useState("");
    const [permBusy, setPermBusy] = React39.useState(false);
    const [permError, setPermError] = React39.useState("");
    const [recognizing, setRecognizing] = React39.useState(false);
    const [confirmCancel, setConfirmCancel] = React39.useState(false);
    const [busy, setBusy] = React39.useState(false);
    const [invitees, setInvitees] = React39.useState([]);
    const [inviteesError, setInviteesError] = React39.useState("");
    const [inviteOpen, setInviteOpen] = React39.useState(false);
    const [editOpen, setEditOpen] = React39.useState(false);
    const [menuOpen, setMenuOpen] = React39.useState(false);
    const [inviteTextOpen, setInviteTextOpen] = React39.useState(false);
    const [inviteText, setInviteText] = React39.useState("");
    const [titleOpen, setTitleOpen] = React39.useState(false);
    const [titleDraft, setTitleDraft] = React39.useState("");
    const [titleBusy, setTitleBusy] = React39.useState(false);
    const [titleError, setTitleError] = React39.useState("");
    React39.useEffect(() => {
      if (!menuOpen)
        return;
      const onDown = (e) => {
        if (e.target.closest?.(".tm-menu-wrap"))
          return;
        setMenuOpen(false);
      };
      const onKey = (e) => {
        if (e.key === "Escape")
          setMenuOpen(false);
      };
      window.addEventListener("pointerdown", onDown, true);
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("pointerdown", onDown, true);
        window.removeEventListener("keydown", onKey);
      };
    }, [menuOpen]);
    const aliveRef = React39.useRef(true);
    const loadInvitees = React39.useCallback(async () => {
      try {
        const r = await getInvitees(props.meetingId);
        if (!aliveRef.current)
          return;
        setInvitees(r.invitees ?? []);
        setInviteesError("");
      } catch (e) {
        if (!aliveRef.current)
          return;
        setInviteesError(errorText(e));
        setInvitees([]);
      }
    }, [props.meetingId]);
    const loadDetail = React39.useCallback(async (showSpinner) => {
      if (showSpinner)
        setDetailLoading(true);
      try {
        const r = await getMeeting(props.meetingId);
        if (!aliveRef.current)
          return;
        setDetail(r);
        setDetailError("");
      } catch (e) {
        if (!aliveRef.current)
          return;
        setDetailError(errorText(e));
      } finally {
        if (aliveRef.current)
          setDetailLoading(false);
      }
    }, [props.meetingId]);
    const loadStates = React39.useCallback(async () => {
      try {
        const r = await getStates(props.meetingId);
        if (!aliveRef.current)
          return;
        setStates(r);
      } catch {}
    }, [props.meetingId]);
    React39.useEffect(() => {
      const e = props.liveEvent;
      if (!e || e.meetingId !== props.meetingId)
        return;
      if (e.states)
        setStates(e.states);
      if (e.eventKey === "meeting.end" || e.eventKey === "meeting.canceled") {
        loadDetail(false);
        loadStates();
      }
    }, [props.liveEvent, props.meetingId, loadStates, loadDetail]);
    const loadPeople = React39.useCallback(async () => {
      if (!peopleMemo.has(props.meetingId))
        setPeopleLoading(true);
      try {
        const r = await getParticipants(props.meetingId);
        if (!aliveRef.current)
          return;
        peopleMemo.set(props.meetingId, { rows: r.rows ?? [], warning: r.warning ?? "" });
        setParticipants(r.rows ?? []);
        setPeopleWarning(r.warning ?? "");
      } catch (e) {
        if (!aliveRef.current)
          return;
        setPeopleWarning(errorText(e));
        setParticipants([]);
      } finally {
        if (aliveRef.current)
          setPeopleLoading(false);
      }
    }, [props.meetingId]);
    React39.useEffect(() => {
      aliveRef.current = true;
      loadDetail(false);
      loadStates();
      loadPeople();
      loadInvitees();
      return () => {
        aliveRef.current = false;
      };
    }, [loadDetail, loadStates, loadPeople, loadInvitees]);
    React39.useEffect(() => {
      const id = props.meetingId;
      const b = props.brief;
      if (!id || !b)
        return;
      const hasRecord = (b.recordsTotal ?? 0) > 0 || (b.records?.length ?? 0) > 0 || b.hasTranscript;
      if (!hasRecord)
        return;
      for (const kind of ["transcript", "minutes"]) {
        if (cachedContent(id, kind))
          continue;
        getContent(id, kind).catch(() => {});
      }
    }, [props.meetingId, props.brief]);
    const brief = detail?.brief ?? props.brief;
    const ended = brief ? isEnded(brief) : false;
    const live = brief ? isLive(brief) : false;
    const badge = ended ? { text: "已结束", tone: "muted" } : live ? { text: "进行中", tone: "ok" } : { text: "未开始", tone: "brand" };
    const copyInvite = async () => {
      try {
        const r = await getInviteText(props.meetingId);
        setInviteText(r.text);
        setInviteTextOpen(true);
        await copyText(r.text);
      } catch (e) {
        props.toast.push("err", errorText(e));
      }
    };
    const saveSubject2 = async () => {
      const subject = titleDraft.trim();
      if (!subject || subject === brief?.subject) {
        setTitleOpen(false);
        return;
      }
      setTitleBusy(true);
      setTitleError("");
      try {
        const r = await saveSubject(props.meetingId, subject);
        props.toast.push("ok", r.mode === "cloud" ? "标题已同步到腾讯会议。" : "标题已在本机修改（历史会议不同步腾讯）。");
        setTitleOpen(false);
        await loadDetail(false);
        props.onChanged();
      } catch (e) {
        setTitleError(errorText(e));
      } finally {
        setTitleBusy(false);
      }
    };
    const copyJoin = async (url) => {
      const ok = await copyText(url);
      props.toast.push(ok ? "ok" : "err", ok ? "入会链接已复制。" : "复制没成功，请手动选中再复制。");
    };
    const openReplay2 = async () => {
      try {
        const r = await openReplay(props.meetingId);
        props.toast.push(r.opened ? "ok" : "err", r.message || (r.opened ? "回放页已打开。" : "回放地址还没准备好。"));
      } catch (e) {
        props.toast.push("err", errorText(e));
      }
    };
    const doCancel = async () => {
      setBusy(true);
      try {
        const r = await cancelMeeting(props.meetingId, true);
        props.toast.push("ok", r.message || "会议已取消。");
        setConfirmCancel(false);
        props.onChanged();
        await loadDetail(false);
      } catch (e) {
        props.toast.push("err", errorText(e));
      } finally {
        setBusy(false);
      }
    };
    const startApply = async () => {
      const recordId = states.meetingRecordId;
      if (!recordId) {
        props.toast.push("err", "这场会没有可申请的录制条目。");
        return;
      }
      setPermError("");
      setPermPreview("");
      setPermBusy(true);
      setPermOpen(true);
      try {
        const r = await applyPermission(recordId, false, props.meetingId);
        if (!aliveRef.current)
          return;
        setPermPreview(r.message || "已准备好申请内容。");
        if (r.ok === false)
          setPermError(r.message || "准备申请失败。");
      } catch (e) {
        if (aliveRef.current)
          setPermError(errorText(e));
      } finally {
        if (aliveRef.current)
          setPermBusy(false);
      }
    };
    const commitApply = async () => {
      const recordId = states.meetingRecordId;
      if (!recordId)
        return;
      setPermBusy(true);
      setPermError("");
      try {
        const r = await applyPermission(recordId, true, props.meetingId);
        if (!aliveRef.current)
          return;
        if (r.ok === false) {
          setPermError(r.message || "提交失败。");
          return;
        }
        props.toast.push("ok", r.message || "申请已提交，等对方审批。");
        setPermOpen(false);
        await loadStates();
      } catch (e) {
        if (aliveRef.current)
          setPermError(errorText(e));
      } finally {
        if (aliveRef.current)
          setPermBusy(false);
      }
    };
    const recognize = async () => {
      setRecognizing(true);
      try {
        const r = await recognizeParticipants(props.meetingId);
        if (!aliveRef.current)
          return;
        setParticipants(r.rows ?? []);
        props.toast.push("ok", r.message || (r.added ? `认出 ${r.added} 位发言人，已补进名单。` : "这次没从逐字稿里认出新的发言人。"));
        await loadStates();
      } catch (e) {
        props.toast.push("err", errorText(e));
      } finally {
        if (aliveRef.current)
          setRecognizing(false);
      }
    };
    const removePerson = async (row) => {
      try {
        const r = await mutateParticipants(props.meetingId, "remove", [row.nickname]);
        if (!aliveRef.current)
          return;
        setParticipants(r.rows ?? []);
        setPeopleWarning(r.warning ?? "");
        props.toast.push("ok", `已把 ${row.nickname} 从本地名单里移出。`);
      } catch (e) {
        props.toast.push("err", errorText(e));
      }
    };
    const addInvitees = async (openIds) => {
      try {
        await mutateInvitees(props.meetingId, "add", openIds);
        props.toast.push("ok", `已邀请 ${openIds.length} 人。`);
        await loadInvitees();
        await loadDetail(false);
        props.onChanged();
      } catch (e) {
        props.toast.push("err", errorText(e));
      }
    };
    const removeInvitee = async (openId) => {
      try {
        await mutateInvitees(props.meetingId, "remove", [openId]);
        props.toast.push("ok", "已移出受邀人。");
        await loadInvitees();
        await loadDetail(false);
      } catch (e) {
        props.toast.push("err", errorText(e));
      }
    };
    const tabItems = PANES.map((p) => {
      if (p.value === "transcript") {
        return { value: p.value, label: p.label, disabled: states.tabs.transcriptDisabled, reason: states.tabReasons.transcript };
      }
      if (p.value === "minutes") {
        return { value: p.value, label: p.label, disabled: states.tabs.minutesDisabled, reason: states.tabReasons.minutes };
      }
      return { value: p.value, label: p.label };
    });
    const activeTab = tabItems.find((t) => t.value === pane);
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-detail",
      children: [
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-detail-head",
          children: [
            props.embedded ? null : /* @__PURE__ */ jsxDEV(IconButton, {
              label: "返回会议列表",
              onClick: () => props.onBack?.(),
              style: { marginTop: 2 },
              children: /* @__PURE__ */ jsxDEV(ChevronLeft, {
                size: 16
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-grow tm-stack",
              style: { gap: 0 },
              children: [
                /* @__PURE__ */ jsxDEV("button", {
                  type: "button",
                  className: "tm-title-edit",
                  onClick: () => {
                    setTitleDraft(brief?.subject ?? "");
                    setTitleError("");
                    setTitleOpen(true);
                  },
                  title: "点击修改标题",
                  children: [
                    /* @__PURE__ */ jsxDEV("span", {
                      className: "tm-detail-title",
                      children: brief?.subject || "（正在取会议信息）"
                    }, undefined, false, undefined, this),
                    /* @__PURE__ */ jsxDEV(Pen, {
                      size: 12
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-detail-meta",
                  children: [
                    brief ? /* @__PURE__ */ jsxDEV("span", {
                      children: formatAbsoluteRange(brief.startTime, brief.endTime)
                    }, undefined, false, undefined, this) : null,
                    brief?.meetingCode ? /* @__PURE__ */ jsxDEV("span", {
                      children: [
                        "会议号 ",
                        formatMeetingCode(brief.meetingCode)
                      ]
                    }, undefined, true, undefined, this) : null,
                    /* @__PURE__ */ jsxDEV(Badge, {
                      tone: badge.tone,
                      children: badge.text
                    }, undefined, false, undefined, this),
                    states.replay === "ready" ? /* @__PURE__ */ jsxDEV(Badge, {
                      tone: "brand",
                      children: "有回放"
                    }, undefined, false, undefined, this) : null,
                    brief?.hasTranscript ? /* @__PURE__ */ jsxDEV(Badge, {
                      tone: "brand",
                      children: "有逐字稿"
                    }, undefined, false, undefined, this) : null
                  ]
                }, undefined, true, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-row",
              style: { flex: "none" },
              children: [
                brief?.joinUrl && !ended ? /* @__PURE__ */ jsxDEV(Button, {
                  size: "sm",
                  variant: "primary",
                  onClick: () => window.open(brief.joinUrl, "_blank", "noopener,noreferrer"),
                  icon: /* @__PURE__ */ jsxDEV(Video, {
                    size: 13
                  }, undefined, false, undefined, this),
                  children: "入会"
                }, undefined, false, undefined, this) : null,
                /* @__PURE__ */ jsxDEV(Button, {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => void copyInvite(),
                  icon: /* @__PURE__ */ jsxDEV(Copy, {
                    size: 13
                  }, undefined, false, undefined, this),
                  children: "复制邀请"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-menu-wrap",
                  children: [
                    /* @__PURE__ */ jsxDEV(IconButton, {
                      label: "更多操作",
                      onClick: () => setMenuOpen((v) => !v),
                      children: /* @__PURE__ */ jsxDEV(MoreHorizontal, {
                        size: 16
                      }, undefined, false, undefined, this)
                    }, undefined, false, undefined, this),
                    menuOpen ? /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-popmenu",
                      role: "menu",
                      children: [
                        /* @__PURE__ */ jsxDEV("div", {
                          className: "tm-popmenu-label",
                          children: "会议操作"
                        }, undefined, false, undefined, this),
                        ended ? /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item",
                          onClick: () => {
                            setMenuOpen(false);
                            setEditOpen(true);
                          },
                          children: "修改会议"
                        }, undefined, false, undefined, this) : null,
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item",
                          onClick: () => {
                            setMenuOpen(false);
                            loadDetail(true);
                          },
                          children: "重新读取详情"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item",
                          disabled: !brief?.joinUrl,
                          onClick: () => {
                            setMenuOpen(false);
                            if (brief?.joinUrl)
                              copyJoin(brief.joinUrl);
                          },
                          children: "复制入会链接"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item",
                          disabled: states.replay !== "ready",
                          onClick: () => {
                            setMenuOpen(false);
                            openReplay2();
                          },
                          children: "打开回放"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item",
                          disabled: ended,
                          onClick: () => {
                            setMenuOpen(false);
                            setInviteOpen(true);
                          },
                          children: "管理受邀人"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item is-danger",
                          disabled: ended,
                          onClick: () => {
                            setMenuOpen(false);
                            setConfirmCancel(true);
                          },
                          children: "取消这场会议"
                        }, undefined, false, undefined, this)
                      ]
                    }, undefined, true, undefined, this) : null
                  ]
                }, undefined, true, undefined, this)
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this),
        detailError ? /* @__PURE__ */ jsxDEV("div", {
          style: { padding: "10px 18px 0" },
          children: /* @__PURE__ */ jsxDEV(Banner, {
            tone: "err",
            icon: /* @__PURE__ */ jsxDEV(Alert, {
              size: 14
            }, undefined, false, undefined, this),
            action: /* @__PURE__ */ jsxDEV(Button, {
              size: "sm",
              variant: "ghost",
              onClick: () => void loadDetail(true),
              children: "重试"
            }, undefined, false, undefined, this),
            children: detailError
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this) : null,
        states.blocker ? /* @__PURE__ */ jsxDEV("div", {
          style: { padding: "10px 18px 0" },
          children: /* @__PURE__ */ jsxDEV(Banner, {
            tone: states.replay === "rejected" ? "err" : "warn",
            icon: /* @__PURE__ */ jsxDEV(Alert, {
              size: 14
            }, undefined, false, undefined, this),
            action: states.replay === "denied" || states.replay === "rejected" ? /* @__PURE__ */ jsxDEV(Button, {
              size: "sm",
              variant: "primary",
              disabled: permBusy || !states.meetingRecordId,
              icon: permBusy ? /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this) : undefined,
              onClick: () => void startApply(),
              children: permBusy ? "正在提交…" : states.replay === "rejected" ? "重新提交申请" : "提交查看申请"
            }, undefined, false, undefined, this) : states.blocker.action ? /* @__PURE__ */ jsxDEV(Button, {
              size: "sm",
              variant: "ghost",
              onClick: () => {
                if (states.blocker?.pane === "minutes")
                  setPane("minutes");
                else if (states.blocker?.pane === "transcript")
                  setPane("transcript");
                else
                  loadStates();
              },
              children: states.blocker.action
            }, undefined, false, undefined, this) : undefined,
            children: [
              states.blocker.text,
              states.replay === "denied" || states.replay === "rejected" ? "　申请会发给录制所有者，他同意后这里就能看逐字稿。" : ""
            ]
          }, undefined, true, undefined, this)
        }, undefined, false, undefined, this) : null,
        /* @__PURE__ */ jsxDEV(Dialog2, {
          open: permOpen,
          onOpenChange: setPermOpen,
          title: "提交录制查看申请",
          description: "这一步会给录制所有者发一条申请，对方同意后你才能看到逐字稿与纪要。",
          footer: /* @__PURE__ */ jsxDEV(Fragment, {
            children: [
              /* @__PURE__ */ jsxDEV("span", {
                className: "tm-grow tm-caption",
                children: permPreview || "正在准备申请内容…"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "tm-dialog-acts",
                children: [
                  /* @__PURE__ */ jsxDEV(Button, {
                    onClick: () => setPermOpen(false),
                    disabled: permBusy,
                    children: "取消"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV(Button, {
                    variant: "primary",
                    onClick: () => void commitApply(),
                    disabled: permBusy,
                    icon: permBusy ? /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this) : undefined,
                    children: permBusy ? "正在提交…" : "确认提交"
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this),
          children: permError ? /* @__PURE__ */ jsxDEV(Banner, {
            tone: "err",
            icon: /* @__PURE__ */ jsxDEV(Alert, {
              size: 14
            }, undefined, false, undefined, this),
            children: permError
          }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV("p", {
            className: "tm-caption",
            style: { margin: 0 },
            children: "提交后状态会变成「审批中」，对方通过后本机会自动解锁。"
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-detail-body",
          children: /* @__PURE__ */ jsxDEV("div", {
            className: "tm-detail-main",
            children: /* @__PURE__ */ jsxDEV(TabsRoot, {
              value: pane,
              onValueChange: (v) => setPane(v),
              className: "tm-tabs-root",
              children: [
                /* @__PURE__ */ jsxDEV(TabList, {
                  items: tabItems,
                  value: pane,
                  onValueChange: () => {},
                  label: "会议内容"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-tabpanel",
                  children: [
                    activeTab && activeTab.disabled && activeTab.reason ? /* @__PURE__ */ jsxDEV("p", {
                      className: "tm-tab-reason",
                      role: "note",
                      children: activeTab.reason
                    }, undefined, false, undefined, this) : null,
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-fade-in",
                      children: [
                        /* @__PURE__ */ jsxDEV(TabsContent3, {
                          value: "overview",
                          children: /* @__PURE__ */ jsxDEV(OverviewPane, {
                            detail,
                            loading: detailLoading,
                            states,
                            participants,
                            peopleLoading,
                            peopleWarning,
                            recognizing,
                            onRecognize: () => void recognize(),
                            onRemove: (row) => void removePerson(row),
                            onOpenReplay: () => void openReplay2(),
                            onCopyJoin: copyJoin,
                            brief
                          }, undefined, false, undefined, this)
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV(TabsContent3, {
                          value: "transcript",
                          children: /* @__PURE__ */ jsxDEV(ContentPane, {
                            meetingId: props.meetingId,
                            kind: "transcript",
                            ready: states.transcript === "ready",
                            emptyText: "这场会还没有逐字稿。要有云录制加自动转写才会产生。",
                            toast: props.toast
                          }, undefined, false, undefined, this)
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV(TabsContent3, {
                          value: "minutes",
                          children: /* @__PURE__ */ jsxDEV(ContentPane, {
                            meetingId: props.meetingId,
                            kind: "minutes",
                            ready: states.minutes === "ready",
                            emptyText: "腾讯侧还没生成纪要。逐字稿出来后一般要等一会儿。",
                            toast: props.toast
                          }, undefined, false, undefined, this)
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV(TabsContent3, {
                          value: "todos",
                          children: /* @__PURE__ */ jsxDEV(ContentPane, {
                            meetingId: props.meetingId,
                            kind: "todos",
                            ready: true,
                            emptyText: "材料里没提取到待办。",
                            toast: props.toast
                          }, undefined, false, undefined, this)
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV(TabsContent3, {
                          value: "outputs",
                          children: /* @__PURE__ */ jsxDEV(OutputsPane, {
                            meetingId: props.meetingId,
                            gen: states.gen,
                            ended,
                            toast: props.toast,
                            onChanged: () => void loadStates()
                          }, undefined, false, undefined, this)
                        }, undefined, false, undefined, this)
                      ]
                    }, pane, true, undefined, this)
                  ]
                }, undefined, true, undefined, this)
              ]
            }, undefined, true, undefined, this)
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV(InviteesDialog, {
          open: inviteOpen,
          onOpenChange: setInviteOpen,
          invitees,
          error: inviteesError,
          onAdd: (ids) => void addInvitees(ids),
          onRemove: (openId) => void removeInvitee(openId),
          onReload: () => void loadInvitees()
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV(EditMeetingDialog, {
          open: editOpen,
          onOpenChange: (v) => {
            setEditOpen(v);
            if (!v)
              loadDetail(false);
          },
          meetingId: props.meetingId,
          detail,
          toast: props.toast,
          onSaved: () => {
            loadDetail(false);
            props.onChanged();
          }
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV(Dialog2, {
          open: confirmCancel,
          onOpenChange: setConfirmCancel,
          title: "取消这场会议？",
          description: "取消后参与者会收到通知，会议不可恢复。本机已有的逐字稿与产出不会删。",
          dismissable: !busy,
          footer: /* @__PURE__ */ jsxDEV(Fragment, {
            children: [
              /* @__PURE__ */ jsxDEV("span", {
                className: "tm-grow",
                children: "这一步会真的提交到腾讯会议。"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "tm-dialog-acts",
                children: [
                  /* @__PURE__ */ jsxDEV(Button, {
                    onClick: () => setConfirmCancel(false),
                    disabled: busy,
                    children: "不取消"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV(Button, {
                    variant: "danger",
                    onClick: () => void doCancel(),
                    disabled: busy,
                    children: busy ? "正在取消…" : "确认取消会议"
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this),
          children: /* @__PURE__ */ jsxDEV("p", {
            className: "tm-hint",
            children: [
              "会议号 ",
              brief?.meetingCode ? formatMeetingCode(brief.meetingCode) : "未知",
              "，主题「",
              brief?.subject || "",
              "」。"
            ]
          }, undefined, true, undefined, this)
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV(Dialog2, {
          open: inviteTextOpen,
          onOpenChange: setInviteTextOpen,
          title: "已复制到剪贴板",
          description: "下面是复制的内容，可以直接确认。",
          footer: /* @__PURE__ */ jsxDEV(Fragment, {
            children: [
              /* @__PURE__ */ jsxDEV("span", {
                className: "tm-grow"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "tm-dialog-acts",
                children: [
                  /* @__PURE__ */ jsxDEV(Button, {
                    onClick: () => void copyText(inviteText).then((ok) => props.toast.push(ok ? "ok" : "err", ok ? "已再次复制。" : "复制没成功，请手动选中。")),
                    children: "再复制一次"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV(Button, {
                    variant: "primary",
                    onClick: () => setInviteTextOpen(false),
                    children: "好"
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this),
          children: /* @__PURE__ */ jsxDEV("pre", {
            className: "tm-invite-text",
            children: inviteText || "（没取到文案）"
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV(Dialog2, {
          open: titleOpen,
          onOpenChange: (v) => {
            if (!titleBusy)
              setTitleOpen(v);
          },
          title: "修改标题",
          description: ended ? "这是已结束的会议，只在本机修改。" : "即将开始/进行中的会议会同步修改腾讯会议。",
          footer: /* @__PURE__ */ jsxDEV(Fragment, {
            children: [
              /* @__PURE__ */ jsxDEV("span", {
                className: "tm-grow"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "tm-dialog-acts",
                children: [
                  /* @__PURE__ */ jsxDEV(Button, {
                    onClick: () => setTitleOpen(false),
                    disabled: titleBusy,
                    children: "取消"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV(Button, {
                    variant: "primary",
                    onClick: () => void saveSubject2(),
                    disabled: titleBusy || !titleDraft.trim(),
                    children: titleBusy ? "正在保存…" : "保存"
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this),
          children: [
            /* @__PURE__ */ jsxDEV(Field, {
              label: "会议标题",
              htmlFor: "tm-title-input",
              children: /* @__PURE__ */ jsxDEV(Input, {
                id: "tm-title-input",
                value: titleDraft,
                onChange: (e) => setTitleDraft(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter")
                    saveSubject2();
                }
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            titleError ? /* @__PURE__ */ jsxDEV("p", {
              className: "tm-hint",
              style: { color: "var(--dsw-alias-state-error-primary, #dc2626)" },
              children: titleError
            }, undefined, false, undefined, this) : null
          ]
        }, undefined, true, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function InviteesDialog(props) {
    const [draft, setDraft] = React39.useState("");
    const invitees = useReveal(props.invitees, 8);
    React39.useEffect(() => {
      if (!props.open)
        setDraft("");
    }, [props.open]);
    const submit = () => {
      const ids = draft.split(/[\s,，、;；]+/).map((s) => s.trim()).filter(Boolean);
      if (!ids.length)
        return;
      props.onAdd(ids);
      setDraft("");
    };
    return /* @__PURE__ */ jsxDEV(Dialog2, {
      open: props.open,
      onOpenChange: props.onOpenChange,
      title: "管理受邀人",
      description: "按腾讯会议的 open_id 添加或移出。改完会直接同步到这场会。",
      footer: /* @__PURE__ */ jsxDEV(Fragment, {
        children: [
          /* @__PURE__ */ jsxDEV("span", {
            className: "tm-grow",
            children: [
              "共 ",
              props.invitees.length,
              " 位受邀人"
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: "tm-dialog-acts",
            children: /* @__PURE__ */ jsxDEV(Button, {
              onClick: () => props.onOpenChange(false),
              children: "关闭"
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this),
      children: [
        props.error ? /* @__PURE__ */ jsxDEV(Banner, {
          tone: "err",
          icon: /* @__PURE__ */ jsxDEV(Alert, {
            size: 14
          }, undefined, false, undefined, this),
          action: /* @__PURE__ */ jsxDEV(Button, {
            size: "sm",
            variant: "ghost",
            onClick: props.onReload,
            children: "重试"
          }, undefined, false, undefined, this),
          children: props.error
        }, undefined, false, undefined, this) : null,
        /* @__PURE__ */ jsxDEV(Field, {
          label: "添加受邀人（填 open_id，多个用空格或逗号隔开）",
          htmlFor: "tm-invite-input",
          children: /* @__PURE__ */ jsxDEV("div", {
            className: "tm-row",
            children: [
              /* @__PURE__ */ jsxDEV(Input, {
                id: "tm-invite-input",
                className: "tm-grow",
                value: draft,
                placeholder: "例如 a1b2c3d4、e5f6g7h8",
                onChange: (e) => setDraft(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submit();
                  }
                }
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV(Button, {
                variant: "primary",
                size: "sm",
                onClick: submit,
                disabled: !draft.trim(),
                icon: /* @__PURE__ */ jsxDEV(Plus, {
                  size: 13
                }, undefined, false, undefined, this),
                children: "添加"
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this)
        }, undefined, false, undefined, this),
        props.invitees.length ? /* @__PURE__ */ jsxDEV("div", {
          className: "tm-people",
          children: [
            invitees.shown.map((p) => /* @__PURE__ */ jsxDEV("div", {
              className: "tm-person",
              children: [
                /* @__PURE__ */ jsxDEV("span", {
                  className: "tm-avatar",
                  "aria-hidden": "true",
                  children: (p.nickname || p.openId).slice(0, 1)
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV("span", {
                  className: "tm-person-main",
                  children: [
                    /* @__PURE__ */ jsxDEV("span", {
                      className: "tm-person-name",
                      children: p.nickname || "未命名受邀人"
                    }, undefined, false, undefined, this),
                    /* @__PURE__ */ jsxDEV("span", {
                      className: "tm-person-org",
                      children: p.openId
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV("span", {
                  className: "tm-person-acts",
                  children: /* @__PURE__ */ jsxDEV(IconButton, {
                    label: `移出 ${p.nickname || p.openId}`,
                    onClick: () => props.onRemove(p.openId),
                    children: /* @__PURE__ */ jsxDEV(X, {
                      size: 12
                    }, undefined, false, undefined, this)
                  }, undefined, false, undefined, this)
                }, undefined, false, undefined, this)
              ]
            }, p.openId, true, undefined, this)),
            /* @__PURE__ */ jsxDEV(RevealMore, {
              hidden: invitees.hidden,
              total: props.invitees.length,
              noun: "人",
              expanded: invitees.expanded,
              onReveal: invitees.reveal,
              onCollapse: invitees.collapse
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV(Empty, {
          title: "还没有受邀人",
          desc: "这场会目前谁都没被单独邀请。填 open_id 就能加。"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function EditMeetingDialog(props) {
    const [subject, setSubject] = React39.useState("");
    const [joinLimit, setJoinLimit] = React39.useState("1");
    const [cloudRecord, setCloudRecord] = React39.useState(false);
    const [autoTranscribe, setAutoTranscribe] = React39.useState(false);
    const [waitingRoom, setWaitingRoom] = React39.useState(false);
    const [note, setNote] = React39.useState("");
    const [stage, setStage] = React39.useState("form");
    const [fields, setFields] = React39.useState([]);
    const [error, setError] = React39.useState("");
    const [busy, setBusy] = React39.useState(false);
    React39.useEffect(() => {
      if (!props.open)
        return;
      setStage("form");
      setFields([]);
      setError("");
      setBusy(false);
      const d = props.detail;
      setSubject(d?.brief.subject ?? "");
      setJoinLimit(String(d?.settings.joinType ?? 1));
      setCloudRecord(d?.settings.autoRecordType === "cloud");
      setAutoTranscribe(Boolean(d?.settings.autoAsr));
      setWaitingRoom(Boolean(d?.settings.waitingRoom));
      setNote(d?.brief.note ?? "");
    }, [props.open, props.detail]);
    const patch = () => ({
      subject: subject.trim(),
      joinLimit: Number(joinLimit),
      cloudRecord,
      autoTranscribe,
      waitingRoom,
      note: note.trim()
    });
    const goPreview = async () => {
      setError("");
      if (!subject.trim()) {
        setError("主题不能为空。");
        return;
      }
      setBusy(true);
      try {
        const r = await updateMeeting(props.meetingId, patch(), false);
        if (r.stage !== "preview") {
          setError("没拿到预览，先别提交。");
          return;
        }
        setFields(r.fields);
        setStage("preview");
      } catch (e) {
        setError(errorText(e));
      } finally {
        setBusy(false);
      }
    };
    const commit = async () => {
      setError("");
      setBusy(true);
      try {
        const r = await updateMeeting(props.meetingId, patch(), true);
        if (r.stage === "updated") {
          const overridden = r.overridden ?? [];
          props.toast.push("ok", overridden.length ? `改好了，但这些被企业策略覆盖：${overridden.join("、")}` : r.message || "会议已更新。");
          props.onSaved();
          props.onOpenChange(false);
        } else {
          setError("提交后没收到更新结果，回详情页重新读一次确认。");
        }
      } catch (e) {
        setError(errorText(e));
      } finally {
        setBusy(false);
      }
    };
    return /* @__PURE__ */ jsxDEV(Dialog2, {
      open: props.open,
      onOpenChange: props.onOpenChange,
      title: stage === "form" ? "编辑会议" : "确认修改",
      description: stage === "form" ? "初值来自腾讯侧真实生效的设置，改完先看预览再提交。" : "下面是将要提交的改动，点「确认修改」才会生效。",
      wide: stage === "preview",
      dismissable: !busy,
      footer: /* @__PURE__ */ jsxDEV(Fragment, {
        children: [
          /* @__PURE__ */ jsxDEV("span", {
            className: "tm-grow",
            children: stage === "preview" ? "这一步之前什么都没发出去。" : ""
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: "tm-dialog-acts",
            children: stage === "form" ? /* @__PURE__ */ jsxDEV(Fragment, {
              children: [
                /* @__PURE__ */ jsxDEV(Button, {
                  onClick: () => props.onOpenChange(false),
                  disabled: busy,
                  children: "取消"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV(Button, {
                  variant: "primary",
                  onClick: () => void goPreview(),
                  disabled: busy,
                  children: busy ? "正在生成预览…" : "下一步：预览"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV(Fragment, {
              children: [
                /* @__PURE__ */ jsxDEV(Button, {
                  onClick: () => setStage("form"),
                  disabled: busy,
                  icon: /* @__PURE__ */ jsxDEV(ChevronLeft, {
                    size: 13
                  }, undefined, false, undefined, this),
                  children: "回去改"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV(Button, {
                  variant: "primary",
                  onClick: () => void commit(),
                  disabled: busy,
                  children: busy ? "正在提交…" : "确认修改"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this)
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this),
      children: [
        error ? /* @__PURE__ */ jsxDEV(Banner, {
          tone: "err",
          icon: /* @__PURE__ */ jsxDEV(Alert, {
            size: 14
          }, undefined, false, undefined, this),
          children: error
        }, undefined, false, undefined, this) : null,
        stage === "form" ? /* @__PURE__ */ jsxDEV(Fragment, {
          children: [
            /* @__PURE__ */ jsxDEV(Field, {
              label: "会议主题",
              htmlFor: "tm-edit-subject",
              required: true,
              children: /* @__PURE__ */ jsxDEV(Input, {
                id: "tm-edit-subject",
                value: subject,
                onChange: (e) => setSubject(e.target.value)
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV(Field, {
              label: "入会限制",
              htmlFor: "tm-edit-join",
              children: /* @__PURE__ */ jsxDEV(Select, {
                id: "tm-edit-join",
                ariaLabel: "入会限制",
                value: joinLimit,
                onValueChange: (v) => setJoinLimit(v),
                options: [
                  { value: "1", label: "所有人可入会" },
                  { value: "2", label: "仅受邀成员" },
                  { value: "3", label: "仅企业内部" }
                ]
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-switch-row",
              children: [
                /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-switch-text",
                  children: [
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-switch-title",
                      children: "云录制"
                    }, undefined, false, undefined, this),
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-switch-desc",
                      children: "关掉之后这场会就取不到逐字稿与纪要。"
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV(Switch3, {
                  checked: cloudRecord,
                  onCheckedChange: setCloudRecord,
                  label: "云录制"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-switch-row",
              children: [
                /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-switch-text",
                  children: [
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-switch-title",
                      children: "自动转写"
                    }, undefined, false, undefined, this),
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-switch-desc",
                      children: "要有云录制才生效。"
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV(Switch3, {
                  checked: autoTranscribe,
                  onCheckedChange: setAutoTranscribe,
                  label: "自动转写"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-switch-row",
              children: [
                /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-switch-text",
                  children: [
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-switch-title",
                      children: "等候室"
                    }, undefined, false, undefined, this),
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-switch-desc",
                      children: "开启后由主持人在腾讯客户端放行。"
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV(Switch3, {
                  checked: waitingRoom,
                  onCheckedChange: setWaitingRoom,
                  label: "等候室"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ jsxDEV(Field, {
              label: "备注（仅本地留档）",
              htmlFor: "tm-edit-note",
              children: /* @__PURE__ */ jsxDEV(AutoTextarea, {
                id: "tm-edit-note",
                value: note,
                minRows: 2,
                onChange: (e) => setNote(e.target.value)
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("p", {
              className: "tm-hint is-warn",
              children: "公司策略可能覆盖录制与转写，提交后会自动回读真实生效值。"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV("dl", {
          className: "tm-preview",
          children: fields.map((f) => /* @__PURE__ */ jsxDEV("div", {
            className: "tm-preview-row",
            children: [
              /* @__PURE__ */ jsxDEV("dt", {
                children: f.label
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("dd", {
                children: f.value
              }, undefined, false, undefined, this)
            ]
          }, f.label, true, undefined, this))
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function OverviewPane(props) {
    const people = useReveal(props.participants, 8);
    if (props.loading && !props.detail && !props.brief)
      return /* @__PURE__ */ jsxDEV("div", {
        className: "tm-fade-in",
        "aria-busy": "true",
        children: [
          /* @__PURE__ */ jsxDEV(SkeletonRows, {
            rows: 5
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("span", {
            className: "tm-caption",
            style: { padding: "2px 8px" },
            children: "正在读取会议详情…"
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this);
    const d = props.detail;
    const brief = d?.brief ?? props.brief;
    const settings = d?.settings;
    const overridden = settings?.overridden ? settings.overriddenFields : [];
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-stack",
      style: { gap: 12 },
      children: [
        /* @__PURE__ */ jsxDEV(Card, {
          children: [
            /* @__PURE__ */ jsxDEV(CardHeader, {
              title: "会议信息",
              sub: brief ? formatAbsoluteRange(brief.startTime, brief.endTime) : undefined,
              extra: /* @__PURE__ */ jsxDEV("span", {
                className: "tm-row",
                style: { gap: 6 },
                children: [
                  settings?.overridden ? /* @__PURE__ */ jsxDEV(Badge, {
                    tone: "warn",
                    title: `被企业策略覆盖：${overridden.join("、")}`,
                    children: "部分设置被企业策略覆盖"
                  }, undefined, false, undefined, this) : null,
                  props.states.replay === "ready" ? /* @__PURE__ */ jsxDEV(Button, {
                    size: "sm",
                    variant: "ghost",
                    onClick: props.onOpenReplay,
                    icon: /* @__PURE__ */ jsxDEV(Play, {
                      size: 13
                    }, undefined, false, undefined, this),
                    children: "打开回放"
                  }, undefined, false, undefined, this) : null
                ]
              }, undefined, true, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-card-b",
              children: brief ? /* @__PURE__ */ jsxDEV(KeyValues, {
                rows: [
                  { label: "时间", value: formatAbsoluteRange(brief.startTime, brief.endTime) },
                  {
                    label: "会议号",
                    value: /* @__PURE__ */ jsxDEV("span", {
                      className: "tm-row",
                      style: { gap: 8, flexWrap: "wrap" },
                      children: [
                        /* @__PURE__ */ jsxDEV("span", {
                          children: formatMeetingCode(brief.meetingCode) || "未给出"
                        }, undefined, false, undefined, this),
                        brief.localPassword ? /* @__PURE__ */ jsxDEV("span", {
                          className: "tm-caption",
                          children: [
                            "（入会密码：",
                            brief.localPassword,
                            "）"
                          ]
                        }, undefined, true, undefined, this) : settings?.passwordRequired ? /* @__PURE__ */ jsxDEV("span", {
                          className: "tm-caption",
                          children: "（有入会密码，本机没记）"
                        }, undefined, false, undefined, this) : null
                      ]
                    }, undefined, true, undefined, this)
                  },
                  {
                    label: "入会链接",
                    value: brief.joinUrl ? /* @__PURE__ */ jsxDEV("span", {
                      className: "tm-row",
                      style: { gap: 6 },
                      children: [
                        /* @__PURE__ */ jsxDEV("a", {
                          href: brief.joinUrl,
                          target: "_blank",
                          rel: "noreferrer",
                          style: { color: "var(--dsw-alias-brand-primary,#2563eb)" },
                          onClick: (e) => e.stopPropagation(),
                          children: "打开入会链接"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV(Button, {
                          size: "sm",
                          variant: "text",
                          onClick: () => props.onCopyJoin(brief.joinUrl),
                          children: "复制"
                        }, undefined, false, undefined, this)
                      ]
                    }, undefined, true, undefined, this) : "没有链接"
                  },
                  { label: "备注", value: brief.note || "没有本地备注" }
                ]
              }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV("p", {
                className: "tm-hint",
                children: "没取到会议信息。"
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV(Card, {
          children: [
            /* @__PURE__ */ jsxDEV(CardHeader, {
              title: `参会人 ${props.participants.length ? `· ${props.participants.length} 人` : ""}`,
              sub: "头像是首字，右侧是姓名与公司；再下面一行是 AI 归纳的当场观点",
              extra: /* @__PURE__ */ jsxDEV(Button, {
                size: "sm",
                variant: "ghost",
                onClick: props.onRecognize,
                disabled: props.recognizing || props.states.tabs.transcriptDisabled,
                title: props.states.tabs.transcriptDisabled ? props.states.tabReasons.transcript || "没有逐字稿，认不了人" : undefined,
                icon: props.recognizing ? /* @__PURE__ */ jsxDEV(Pen, {
                  size: 13
                }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(Wand, {
                  size: 13
                }, undefined, false, undefined, this),
                children: props.recognizing ? "正在认人…" : "AI 认人"
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-card-b",
              children: props.peopleLoading && !props.participants.length ? /* @__PURE__ */ jsxDEV(SkeletonRows, {
                rows: 3
              }, undefined, false, undefined, this) : props.participants.length ? /* @__PURE__ */ jsxDEV("div", {
                className: "tm-people",
                children: [
                  people.shown.map((p) => /* @__PURE__ */ jsxDEV("div", {
                    className: "tm-person",
                    children: [
                      /* @__PURE__ */ jsxDEV("span", {
                        className: "tm-avatar",
                        "aria-hidden": "true",
                        children: p.nickname.slice(0, 1)
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("span", {
                        className: "tm-person-main",
                        children: [
                          /* @__PURE__ */ jsxDEV("span", {
                            className: "tm-person-name",
                            children: p.nickname
                          }, undefined, false, undefined, this),
                          p.company || p.title ? /* @__PURE__ */ jsxDEV("span", {
                            className: "tm-person-org",
                            children: [p.company, p.title].filter(Boolean).join(" · ")
                          }, undefined, false, undefined, this) : null,
                          p.source ? /* @__PURE__ */ jsxDEV("span", {
                            className: "tm-caption",
                            children: sourceText(p.source)
                          }, undefined, false, undefined, this) : null
                        ]
                      }, undefined, true, undefined, this),
                      /* @__PURE__ */ jsxDEV("span", {
                        className: "tm-person-acts",
                        children: /* @__PURE__ */ jsxDEV(IconButton, {
                          label: `把 ${p.nickname} 从本地名单移出`,
                          onClick: () => props.onRemove(p),
                          children: /* @__PURE__ */ jsxDEV(X, {
                            size: 12
                          }, undefined, false, undefined, this)
                        }, undefined, false, undefined, this)
                      }, undefined, false, undefined, this),
                      p.view ? /* @__PURE__ */ jsxDEV("span", {
                        className: "tm-person-view",
                        children: p.view
                      }, undefined, false, undefined, this) : null
                    ]
                  }, p.key, true, undefined, this)),
                  /* @__PURE__ */ jsxDEV(RevealMore, {
                    hidden: people.hidden,
                    total: props.participants.length,
                    noun: "人",
                    expanded: people.expanded,
                    onReveal: people.reveal,
                    onCollapse: people.collapse
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV(Empty, {
                title: "还没有参会名单",
                desc: "腾讯侧要等会议结束后才出报告；也可以点「AI 认人」，从逐字稿里把发言人捞出来。"
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function sourceText(source) {
    if (source === "tencent")
      return "腾讯名单";
    if (source === "ai")
      return "AI 认出";
    return "本地补充";
  }
  function ContentPane(props) {
    const [view, setView] = React39.useState(() => cachedContent(props.meetingId, props.kind));
    const [error, setError] = React39.useState("");
    const [loading, setLoading] = React39.useState(() => !cachedContent(props.meetingId, props.kind));
    const [forced, setForced] = React39.useState(false);
    const [filter, setFilter] = React39.useState("");
    const [pasteOpen, setPasteOpen] = React39.useState(false);
    const hasViewRef = React39.useRef(Boolean(view));
    const load = React39.useCallback(async (force) => {
      if (force || !hasViewRef.current)
        setLoading(true);
      setError("");
      try {
        const r = await getContent(props.meetingId, props.kind, force);
        if (r && !r.empty)
          hasViewRef.current = true;
        setView(r);
      } catch (e) {
        setError(errorText(e));
        setView(null);
        hasViewRef.current = false;
      } finally {
        setLoading(false);
      }
    }, [props.meetingId, props.kind]);
    React39.useEffect(() => {
      if (view && !view.empty)
        hasViewRef.current = true;
      load(false);
    }, [load]);
    const matched = React39.useMemo(() => {
      const list = view?.chunks ?? [];
      const q = filter.trim().toLowerCase();
      if (!q)
        return list;
      return list.filter((c) => c.text.toLowerCase().includes(q) || (c.speaker ?? "").toLowerCase().includes(q));
    }, [view, filter]);
    const chunks = useReveal(matched, 25);
    if (loading)
      return /* @__PURE__ */ jsxDEV("div", {
        className: "tm-fade-in",
        "aria-busy": "true",
        children: [
          /* @__PURE__ */ jsxDEV(SkeletonRows, {
            rows: 6
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("span", {
            className: "tm-caption",
            style: { padding: "2px 8px" },
            children: "正在取回内容…"
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this);
    if (!view || view.empty) {
      return /* @__PURE__ */ jsxDEV("div", {
        className: "tm-fade-in",
        children: [
          /* @__PURE__ */ jsxDEV(Empty, {
            title: props.emptyText,
            desc: "如果是别人开的会，腾讯不会给你录制和转写。你可以把手机录音转出来的文字粘进来，会后产出照样能做。",
            actions: /* @__PURE__ */ jsxDEV(Fragment, {
              children: [
                /* @__PURE__ */ jsxDEV(Button, {
                  size: "sm",
                  variant: "primary",
                  icon: /* @__PURE__ */ jsxDEV(Plus, {
                    size: 13
                  }, undefined, false, undefined, this),
                  onClick: () => setPasteOpen(true),
                  children: "粘贴原文"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV(Button, {
                  size: "sm",
                  variant: "ghost",
                  icon: /* @__PURE__ */ jsxDEV(Refresh, {
                    size: 13
                  }, undefined, false, undefined, this),
                  onClick: () => {
                    setForced(true);
                    load(true);
                  },
                  children: forced ? "再取一次" : "重新取一次"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this)
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV(PasteDialog, {
            open: pasteOpen,
            onOpenChange: setPasteOpen,
            meetingId: props.meetingId,
            kind: props.kind === "minutes" ? "minutes" : props.kind === "todos" ? "todos" : "transcript",
            toast: props.toast,
            onSaved: () => {
              setForced(false);
              load(true);
            }
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this);
    }
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-stack",
      style: { gap: 10 },
      children: [
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-row-between",
          children: [
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-caption",
              children: view.source === "pasted" ? /* @__PURE__ */ jsxDEV(Fragment, {
                children: [
                  /* @__PURE__ */ jsxDEV(Badge, {
                    tone: "brand",
                    children: "本机粘贴"
                  }, undefined, false, undefined, this),
                  " ",
                  chunks.all.length,
                  " 段 · 来源：",
                  view.pastedSource || "你提供"
                ]
              }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV(Fragment, {
                children: [
                  chunks.all.length,
                  " 段 · 取回于 ",
                  formatFetchedAt(view.fetchedAt)
                ]
              }, undefined, true, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-row",
              children: [
                view.source === "pasted" ? /* @__PURE__ */ jsxDEV(Button, {
                  size: "sm",
                  variant: "text",
                  onClick: () => setPasteOpen(true),
                  children: "替换原文"
                }, undefined, false, undefined, this) : null,
                /* @__PURE__ */ jsxDEV(Button, {
                  size: "sm",
                  variant: "text",
                  icon: /* @__PURE__ */ jsxDEV(Refresh, {
                    size: 13
                  }, undefined, false, undefined, this),
                  onClick: () => void load(true),
                  children: "重新取一次"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV(PasteDialog, {
          open: pasteOpen,
          onOpenChange: setPasteOpen,
          meetingId: props.meetingId,
          kind: props.kind === "minutes" ? "minutes" : props.kind === "todos" ? "todos" : "transcript",
          toast: props.toast,
          onSaved: () => {
            setForced(false);
            load(true);
          }
        }, undefined, false, undefined, this),
        chunks.all.length && (props.kind === "transcript" || view.source === "pasted") ? /* @__PURE__ */ jsxDEV(Fragment, {
          children: [
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-row",
              children: [
                /* @__PURE__ */ jsxDEV(Input, {
                  value: filter,
                  placeholder: "在逐字稿里搜人名或关键词",
                  "aria-label": "在逐字稿里搜索",
                  onChange: (e) => setFilter(e.target.value)
                }, undefined, false, undefined, this),
                filter ? /* @__PURE__ */ jsxDEV(Button, {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => setFilter(""),
                  icon: /* @__PURE__ */ jsxDEV(X, {
                    size: 12
                  }, undefined, false, undefined, this),
                  children: "清掉"
                }, undefined, false, undefined, this) : null
              ]
            }, undefined, true, undefined, this),
            !chunks.shown.length ? /* @__PURE__ */ jsxDEV(Empty, {
              title: `没有匹配「${filter}」的段落`,
              desc: "换个关键词，或者清掉搜索看全文。"
            }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV("div", {
              className: "tm-content",
              children: [
                chunks.shown.map((c, i) => /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-chunk",
                  children: [
                    c.speaker || c.time ? /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-chunk-meta",
                      children: [
                        c.time ? /* @__PURE__ */ jsxDEV("span", {
                          children: c.time
                        }, undefined, false, undefined, this) : null,
                        c.speaker ? /* @__PURE__ */ jsxDEV("span", {
                          className: "tm-speaker",
                          children: c.speaker
                        }, undefined, false, undefined, this) : null
                      ]
                    }, undefined, true, undefined, this) : null,
                    /* @__PURE__ */ jsxDEV("p", {
                      className: "tm-chunk-text",
                      children: c.text
                    }, undefined, false, undefined, this)
                  ]
                }, `${i}-${c.time ?? ""}`, true, undefined, this)),
                /* @__PURE__ */ jsxDEV(RevealMore, {
                  hidden: chunks.hidden,
                  total: chunks.all.length,
                  noun: "段",
                  expanded: chunks.expanded,
                  onReveal: chunks.reveal,
                  onCollapse: chunks.collapse
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV("p", {
          className: "tm-plain",
          children: view.plain
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function formatFetchedAt(iso) {
    const t = Date.parse(iso);
    if (Number.isNaN(t))
      return iso;
    const d = new Date(t);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  var outputsMemo = new Map;
  function OutputDoc(props) {
    const { kind, out, busy } = props;
    const html = React39.useMemo(() => out ? renderMarkdown(out.text) : "", [out]);
    const [menuOpen, setMenuOpen] = React39.useState(false);
    const [confirm, setConfirm] = React39.useState(null);
    React39.useEffect(() => {
      if (!menuOpen)
        return;
      const onDown = (e) => {
        if (e.target.closest?.(".tm-menu-wrap"))
          return;
        setMenuOpen(false);
      };
      const onKey = (e) => {
        if (e.key === "Escape")
          setMenuOpen(false);
      };
      window.addEventListener("pointerdown", onDown, true);
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("pointerdown", onDown, true);
        window.removeEventListener("keydown", onKey);
      };
    }, [menuOpen]);
    const outText = out?.text ?? "";
    const docHtml = React39.useMemo(() => markdownToHtmlDocument(out?.text ?? "", OUTPUT_LABELS[kind], { generatedAt: out?.generatedAt }), [out, kind]);
    const openInBrowser = () => {
      const url = URL.createObjectURL(new Blob([docHtml], { type: "text/html;charset=utf-8" }));
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    };
    const downloadHtml = () => {
      downloadText(`${OUTPUT_LABELS[kind]}.html`, docHtml, "text/html");
      props.toast.push("ok", "已导出 HTML（排版后的样子）。");
    };
    const downloadMd = () => {
      downloadText(`${OUTPUT_LABELS[kind]}.md`, outText, "text/markdown");
    };
    if (!out) {
      return /* @__PURE__ */ jsxDEV("div", {
        className: "tm-output tm-output-doc",
        children: [
          /* @__PURE__ */ jsxDEV("div", {
            className: "tm-row-between",
            children: [
              /* @__PURE__ */ jsxDEV("h3", {
                className: "tm-output-title",
                children: OUTPUT_LABELS[kind]
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV(Badge, {
                tone: "muted",
                children: "未生成"
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ jsxDEV("p", {
            className: "tm-hint",
            children: outputHint(kind)
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            children: /* @__PURE__ */ jsxDEV(Button, {
              size: "sm",
              variant: "primary",
              disabled: busy || !props.ended,
              onClick: props.onRegenerate,
              icon: busy ? /* @__PURE__ */ jsxDEV(Pen, {
                size: 13
              }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(Doc, {
                size: 13
              }, undefined, false, undefined, this),
              children: busy ? "正在生成…" : "生成这份"
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this);
    }
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-output tm-output-doc",
      children: [
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-row-between",
          children: [
            /* @__PURE__ */ jsxDEV("h3", {
              className: "tm-output-title",
              children: OUTPUT_LABELS[kind]
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-row",
              style: { gap: 4 },
              children: [
                /* @__PURE__ */ jsxDEV(Badge, {
                  tone: "ok",
                  children: "已生成"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV(IconButton, {
                  label: "全屏",
                  onClick: props.onPreview,
                  children: /* @__PURE__ */ jsxDEV(Maximize, {
                    size: 15
                  }, undefined, false, undefined, this)
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-menu-wrap",
                  children: [
                    /* @__PURE__ */ jsxDEV(IconButton, {
                      label: "更多",
                      onClick: () => setMenuOpen((v) => !v),
                      children: /* @__PURE__ */ jsxDEV(MoreHorizontal, {
                        size: 16
                      }, undefined, false, undefined, this)
                    }, undefined, false, undefined, this),
                    menuOpen ? /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-popmenu",
                      role: "menu",
                      children: [
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item",
                          onClick: () => {
                            setMenuOpen(false);
                            openInBrowser();
                          },
                          children: "在浏览器打开"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item",
                          onClick: () => {
                            setMenuOpen(false);
                            downloadHtml();
                          },
                          children: "导出 HTML"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item",
                          onClick: () => {
                            setMenuOpen(false);
                            downloadMd();
                          },
                          children: "导出 Markdown"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item",
                          onClick: () => {
                            setMenuOpen(false);
                            copyText(outText).then((ok) => {
                              props.toast.push(ok ? "ok" : "err", ok ? "正文已复制。" : "复制没成功，请手动选中。");
                            });
                          },
                          children: "复制正文"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item",
                          disabled: busy,
                          onClick: () => {
                            setMenuOpen(false);
                            setConfirm("regenerate");
                          },
                          children: "重新生成"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item is-danger",
                          disabled: busy,
                          onClick: () => {
                            setMenuOpen(false);
                            setConfirm("delete");
                          },
                          children: "删除"
                        }, undefined, false, undefined, this)
                      ]
                    }, undefined, true, undefined, this) : null
                  ]
                }, undefined, true, undefined, this)
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this),
        out.truncated ? /* @__PURE__ */ jsxDEV("div", {
          className: "tm-row",
          style: { flexWrap: "wrap", gap: 6 },
          children: /* @__PURE__ */ jsxDEV(Badge, {
            tone: "warn",
            title: "素材超过 6 万字被截断",
            children: "素材已截断"
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this) : null,
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-outview-page tm-output-rendered",
          dangerouslySetInnerHTML: { __html: html }
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV(Dialog2, {
          open: confirm !== null,
          onOpenChange: (v) => {
            if (!v)
              setConfirm(null);
          },
          title: confirm === "delete" ? "删除这份产出？" : "重新生成这份产出？",
          description: confirm === "delete" ? "删除后不可恢复，需要重新生成。" : "会用当前素材重新生成，覆盖现有内容。",
          footer: /* @__PURE__ */ jsxDEV(Fragment, {
            children: [
              /* @__PURE__ */ jsxDEV("span", {
                className: "tm-grow"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "tm-dialog-acts",
                children: [
                  /* @__PURE__ */ jsxDEV(Button, {
                    onClick: () => setConfirm(null),
                    children: "取消"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV(Button, {
                    variant: confirm === "delete" ? "danger" : "primary",
                    disabled: busy,
                    onClick: () => {
                      const act = confirm;
                      setConfirm(null);
                      if (act === "delete")
                        props.onDelete();
                      else
                        props.onRegenerate();
                    },
                    children: confirm === "delete" ? "确认删除" : "确认重新生成"
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this),
          children: /* @__PURE__ */ jsxDEV("p", {
            className: "tm-hint",
            children: confirm === "delete" ? `将删除「${OUTPUT_LABELS[kind]}」。` : `将重新生成「${OUTPUT_LABELS[kind]}」。`
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function downloadText(filename, text, mime) {
    const blob = new Blob([text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function OutputPreview(props) {
    const html = React39.useMemo(() => renderMarkdown(props.text), [props.text]);
    const doc = React39.useMemo(() => markdownToHtmlDocument(props.text, props.title, { generatedAt: props.generatedAt }), [props.text, props.title, props.generatedAt]);
    React39.useEffect(() => {
      const onKey = (e) => {
        if (e.key === "Escape")
          props.onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [props]);
    const openInBrowser = () => {
      const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    };
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-outview",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": `${props.title}预览`,
      children: [
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-outview-bar",
          children: [
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-grow tm-outview-title",
              children: props.title
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV(Button, {
              size: "sm",
              variant: "ghost",
              onClick: openInBrowser,
              children: "在浏览器打开"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV(Button, {
              size: "sm",
              variant: "ghost",
              onClick: () => {
                downloadText(`${props.title}.html`, doc, "text/html");
                props.toast.push("ok", "已导出 HTML（排版后的样子）。");
              },
              children: "导出 HTML"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV(Button, {
              size: "sm",
              variant: "ghost",
              onClick: () => {
                downloadText(`${props.title}.md`, props.text, "text/markdown");
                props.toast.push("ok", "已导出 Markdown 原文。");
              },
              children: "导出 MD"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV(IconButton, {
              label: "关闭预览",
              onClick: props.onClose,
              children: /* @__PURE__ */ jsxDEV(X, {
                size: 15
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-outview-body",
          children: /* @__PURE__ */ jsxDEV("div", {
            className: "tm-outview-page",
            dangerouslySetInnerHTML: { __html: html }
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function ReviewConfirmDialog(props) {
    const act = props.confirm;
    return /* @__PURE__ */ jsxDEV(Dialog2, {
      open: act !== null,
      onOpenChange: (v) => {
        if (!v)
          props.setConfirm(null);
      },
      title: act === "delete" ? "删除复盘报告？" : "重新生成复盘报告？",
      description: act === "delete" ? "删除后不可恢复，需要重新生成。" : "会用当前素材按所选类型重新生成，覆盖现有内容。",
      footer: /* @__PURE__ */ jsxDEV(Fragment, {
        children: [
          /* @__PURE__ */ jsxDEV("span", {
            className: "tm-grow"
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: "tm-dialog-acts",
            children: [
              /* @__PURE__ */ jsxDEV(Button, {
                onClick: () => props.setConfirm(null),
                children: "取消"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV(Button, {
                variant: act === "delete" ? "danger" : "primary",
                onClick: () => {
                  props.setConfirm(null);
                  if (act === "delete")
                    props.onDelete();
                  else
                    props.onRegenerate();
                },
                children: act === "delete" ? "确认删除" : "确认重新生成"
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this),
      children: /* @__PURE__ */ jsxDEV("p", {
        className: "tm-hint",
        children: act === "delete" ? "将删除「复盘报告」。" : "将按当前选定的类型重新生成「复盘报告」。"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function ReviewCard(props) {
    const [plan, setPlan] = React39.useState(null);
    const [planError, setPlanError] = React39.useState("");
    const [choice, setChoice] = React39.useState("");
    const [step, setStep] = React39.useState("idle");
    const [choosing, setChoosing] = React39.useState(false);
    const pollCtrl = React39.useRef(null);
    const notify = useNotifyOnReady();
    const [menuOpen, setMenuOpen] = React39.useState(false);
    const [confirm, setConfirm] = React39.useState(null);
    React39.useEffect(() => {
      if (!menuOpen)
        return;
      const onDown = (e) => {
        if (e.target.closest?.(".tm-menu-wrap"))
          return;
        setMenuOpen(false);
      };
      const onKey = (e) => {
        if (e.key === "Escape")
          setMenuOpen(false);
      };
      window.addEventListener("pointerdown", onDown, true);
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("pointerdown", onDown, true);
        window.removeEventListener("keydown", onKey);
      };
    }, [menuOpen]);
    const loadPlan = React39.useCallback(async (type) => {
      try {
        const p = await getReviewPlan(props.meetingId, type);
        setPlan(p);
        setChoice(p.type);
        setPlanError("");
      } catch (e) {
        setPlanError(errorText(e));
      }
    }, [props.meetingId]);
    React39.useEffect(() => {
      loadPlan();
    }, [loadPlan]);
    const changeType = async (id) => {
      setChoice(id);
      try {
        setPlan(await getReviewPlan(props.meetingId, id));
      } catch {}
    };
    const watchGeneration = React39.useCallback(() => {
      pollCtrl.current?.abort();
      const ctrl = new AbortController;
      pollCtrl.current = ctrl;
      (async () => {
        while (!ctrl.signal.aborted) {
          await new Promise((r) => setTimeout(r, 2500));
          if (ctrl.signal.aborted)
            return;
          try {
            const s = await outputStatus(props.meetingId);
            const t = s.tasks.find((x) => x.kind === "review");
            if (!t || t.status === "done") {
              setStep("idle");
              if (notify)
                props.toast.push("ok", t?.message || "复盘报告生成好了。");
              props.onChanged();
              return;
            }
            if (t.status === "error") {
              setStep("idle");
              props.toast.push("err", t.message || "生成失败");
              return;
            }
          } catch {}
        }
      })();
    }, [props.meetingId, notify]);
    React39.useEffect(() => {
      (async () => {
        try {
          const s = await outputStatus(props.meetingId);
          const t = s.tasks.find((x) => x.kind === "review" && x.status === "running");
          if (t) {
            setStep("generating");
            watchGeneration();
          }
        } catch {}
      })();
      return () => {
        pollCtrl.current?.abort();
      };
    }, [props.meetingId, watchGeneration]);
    const generate = async () => {
      if (!props.ended)
        return;
      setStep("generating");
      try {
        const r = await generateOutput(props.meetingId, "review", { type: choice });
        if (!r.started)
          props.toast.push("info", "复盘报告正在生成中。");
        watchGeneration();
      } catch (e) {
        setStep("idle");
        props.toast.push("err", errorText(e));
      }
    };
    const cancelGenerate = async () => {
      try {
        await cancelOutput(props.meetingId, "review");
        props.toast.push("info", "已取消生成。");
      } catch (e) {
        props.toast.push("err", errorText(e));
      } finally {
        setStep("idle");
      }
    };
    const remove = async () => {
      try {
        await deleteOutput(props.meetingId, "review");
        props.toast.push("ok", "复盘报告已删除。");
        props.onChanged();
      } catch (e) {
        props.toast.push("err", errorText(e));
      }
    };
    const html = React39.useMemo(() => props.out ? renderMarkdown(props.out.text) : "", [props.out]);
    const working = step !== "idle";
    const stepLabels = ["判定类型", "取素材", "生成", "排版"];
    const activeIdx = step === "judging" ? 0 : step === "material" ? 1 : step === "generating" ? 2 : 4;
    const typeName = plan?.typeName ?? (plan?.types.find((t) => t.id === choice)?.name || "未判定");
    return /* @__PURE__ */ jsxDEV("div", {
      className: `tm-output${props.out ? " is-clickable" : ""}`,
      role: props.out ? "button" : undefined,
      tabIndex: props.out ? 0 : undefined,
      title: props.out ? "点开看排版后的样子" : undefined,
      onClick: props.out ? props.onPreview : undefined,
      onKeyDown: props.out ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          props.onPreview();
        }
      } : undefined,
      children: [
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-row-between",
          children: [
            /* @__PURE__ */ jsxDEV("h3", {
              className: "tm-output-title",
              children: OUTPUT_LABELS.review
            }, undefined, false, undefined, this),
            working ? /* @__PURE__ */ jsxDEV(Pen, {
              size: 14
            }, undefined, false, undefined, this) : props.out ? /* @__PURE__ */ jsxDEV(Badge, {
              tone: "ok",
              children: "已生成"
            }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(Badge, {
              tone: "muted",
              children: "未生成"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        working ? /* @__PURE__ */ jsxDEV("div", {
          className: "tm-steps",
          children: [
            stepLabels.map((label, i) => /* @__PURE__ */ jsxDEV("span", {
              className: `tm-step${i < activeIdx ? " is-done" : i === activeIdx ? " is-now" : ""}`,
              children: [
                i < activeIdx ? "✓ " : "",
                label
              ]
            }, label, true, undefined, this)),
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-grow"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV(Button, {
              size: "sm",
              variant: "text",
              onClick: () => void cancelGenerate(),
              children: "取消"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this) : props.out ? /* @__PURE__ */ jsxDEV(Fragment, {
          children: [
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-output-metabar",
              children: [
                /* @__PURE__ */ jsxDEV("span", {
                  children: [
                    "类型：",
                    typeName
                  ]
                }, undefined, true, undefined, this),
                props.out.reviewDegraded ? /* @__PURE__ */ jsxDEV(Badge, {
                  tone: "warn",
                  title: "素材不足，已按要点版生成",
                  children: "降级版"
                }, undefined, false, undefined, this) : null,
                props.out.truncated ? /* @__PURE__ */ jsxDEV(Badge, {
                  tone: "warn",
                  title: "素材超过 6 万字被截断",
                  children: "素材已截断"
                }, undefined, false, undefined, this) : null
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-outview-page tm-output-rendered",
              dangerouslySetInnerHTML: { __html: html }
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-row",
              style: { justifyContent: "flex-end" },
              children: [
                /* @__PURE__ */ jsxDEV(IconButton, {
                  label: "全屏",
                  onClick: (e) => {
                    e.stopPropagation();
                    props.onPreview();
                  },
                  children: /* @__PURE__ */ jsxDEV(Maximize, {
                    size: 15
                  }, undefined, false, undefined, this)
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-menu-wrap",
                  children: [
                    /* @__PURE__ */ jsxDEV(IconButton, {
                      label: "更多",
                      onClick: (e) => {
                        e.stopPropagation();
                        setMenuOpen((v) => !v);
                      },
                      children: /* @__PURE__ */ jsxDEV(MoreHorizontal, {
                        size: 16
                      }, undefined, false, undefined, this)
                    }, undefined, false, undefined, this),
                    menuOpen ? /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-popmenu",
                      role: "menu",
                      onClick: (e) => e.stopPropagation(),
                      children: [
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item",
                          onClick: () => {
                            setMenuOpen(false);
                            props.onPreview();
                          },
                          children: "浏览器打开"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item",
                          onClick: () => {
                            setMenuOpen(false);
                            copyText(props.out.text).then((ok) => {
                              props.toast.push(ok ? "ok" : "err", ok ? "正文已复制。" : "复制没成功，请手动选中。");
                            });
                          },
                          children: "复制正文"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item",
                          onClick: () => {
                            setMenuOpen(false);
                            setConfirm("regenerate");
                          },
                          children: "重新生成"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tm-popmenu-item is-danger",
                          onClick: () => {
                            setMenuOpen(false);
                            setConfirm("delete");
                          },
                          children: "删除"
                        }, undefined, false, undefined, this)
                      ]
                    }, undefined, true, undefined, this) : null
                  ]
                }, undefined, true, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ jsxDEV(ReviewConfirmDialog, {
              confirm,
              setConfirm,
              onRegenerate: () => void generate(),
              onDelete: () => void remove()
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV(Fragment, {
          children: [
            planError ? /* @__PURE__ */ jsxDEV(Banner, {
              tone: "err",
              icon: /* @__PURE__ */ jsxDEV(Alert, {
                size: 14
              }, undefined, false, undefined, this),
              children: planError
            }, undefined, false, undefined, this) : null,
            plan ? choosing ? /* @__PURE__ */ jsxDEV("div", {
              className: "tm-review-plan",
              children: [
                /* @__PURE__ */ jsxDEV("p", {
                  className: "tm-caption",
                  children: [
                    "选一个类型（判定建议：",
                    /* @__PURE__ */ jsxDEV("b", {
                      children: plan.typeName
                    }, undefined, false, undefined, this),
                    "）"
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-type-grid",
                  children: plan.types.map((t) => /* @__PURE__ */ jsxDEV("button", {
                    type: "button",
                    className: `tm-type-chip${choice === t.id ? " is-on" : ""}`,
                    onClick: () => void changeType(t.id),
                    children: t.name
                  }, t.id, false, undefined, this))
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV("p", {
                  className: "tm-caption",
                  children: [
                    "将看：",
                    plan.frame.join(" / ")
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV("p", {
                  className: "tm-caption",
                  children: plan.reason
                }, undefined, false, undefined, this),
                plan.degraded ? /* @__PURE__ */ jsxDEV(Banner, {
                  tone: "warn",
                  icon: /* @__PURE__ */ jsxDEV(Alert, {
                    size: 14
                  }, undefined, false, undefined, this),
                  children: [
                    "这次是降级版：",
                    plan.degradeReason
                  ]
                }, undefined, true, undefined, this) : null,
                /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-row",
                  children: [
                    /* @__PURE__ */ jsxDEV(Button, {
                      size: "sm",
                      variant: "primary",
                      disabled: !props.ended,
                      onClick: () => void generate(),
                      icon: /* @__PURE__ */ jsxDEV(Doc, {
                        size: 13
                      }, undefined, false, undefined, this),
                      children: "开始生成"
                    }, undefined, false, undefined, this),
                    /* @__PURE__ */ jsxDEV(Button, {
                      size: "sm",
                      variant: "text",
                      onClick: () => setChoosing(false),
                      children: "返回"
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this)
              ]
            }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV("div", {
              className: "tm-review-plan",
              children: [
                /* @__PURE__ */ jsxDEV("p", {
                  className: "tm-caption",
                  children: [
                    "类型判定：",
                    /* @__PURE__ */ jsxDEV("b", {
                      children: plan.typeName
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV("p", {
                  className: "tm-caption",
                  children: plan.reason
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV("p", {
                  className: "tm-caption",
                  children: [
                    "将看：",
                    plan.frame.join(" / ")
                  ]
                }, undefined, true, undefined, this),
                plan.available.length ? /* @__PURE__ */ jsxDEV("p", {
                  className: "tm-caption",
                  children: [
                    "素材：",
                    plan.available.join(" · ")
                  ]
                }, undefined, true, undefined, this) : null,
                plan.missing.length ? /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-missing",
                  children: plan.missing.map((m) => /* @__PURE__ */ jsxDEV("p", {
                    className: "tm-caption",
                    children: [
                      /* @__PURE__ */ jsxDEV("b", {
                        children: m.what
                      }, undefined, false, undefined, this),
                      "：",
                      m.why,
                      " ",
                      /* @__PURE__ */ jsxDEV("span", {
                        className: "tm-hint",
                        children: [
                          "→ ",
                          m.how
                        ]
                      }, undefined, true, undefined, this)
                    ]
                  }, m.what, true, undefined, this))
                }, undefined, false, undefined, this) : null,
                plan.degraded ? /* @__PURE__ */ jsxDEV(Banner, {
                  tone: "warn",
                  icon: /* @__PURE__ */ jsxDEV(Alert, {
                    size: 14
                  }, undefined, false, undefined, this),
                  children: [
                    "这次是降级版：",
                    plan.degradeReason
                  ]
                }, undefined, true, undefined, this) : null,
                /* @__PURE__ */ jsxDEV(Button, {
                  size: "sm",
                  variant: "primary",
                  disabled: !props.ended,
                  onClick: () => setChoosing(true),
                  icon: /* @__PURE__ */ jsxDEV(Doc, {
                    size: 13
                  }, undefined, false, undefined, this),
                  children: "生成复盘"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV("p", {
              className: "tm-hint",
              children: "正在判定这场会的类型…"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function OutputsPane(props) {
    const [outputs, setOutputs] = React39.useState(() => outputsMemo.get(props.meetingId) ?? {});
    const [loading, setLoading] = React39.useState(() => !outputsMemo.has(props.meetingId));
    const [error, setError] = React39.useState("");
    const [working, setWorking] = React39.useState(null);
    const [preview, setPreview] = React39.useState(null);
    const [active, setActive] = React39.useState(() => {
      const done = OUTPUT_KINDS.find((k) => outputs[k]);
      return done ?? OUTPUT_KINDS[0];
    });
    const pollCtrl = React39.useRef(null);
    const notify = useNotifyOnReady();
    const load = React39.useCallback(async (showSpinner = true) => {
      if (showSpinner)
        setLoading(true);
      try {
        const r = await getOutputs(props.meetingId);
        outputsMemo.set(props.meetingId, r ?? {});
        setOutputs(r ?? {});
        setError("");
      } catch (e) {
        setError(errorText(e));
      } finally {
        setLoading(false);
      }
    }, [props.meetingId]);
    React39.useEffect(() => {
      load(false);
    }, [load]);
    const watchGeneration = React39.useCallback((kind) => {
      pollCtrl.current?.abort();
      const ctrl = new AbortController;
      pollCtrl.current = ctrl;
      (async () => {
        while (!ctrl.signal.aborted) {
          await new Promise((r) => setTimeout(r, 2500));
          if (ctrl.signal.aborted)
            return;
          try {
            const s = await outputStatus(props.meetingId);
            const t = s.tasks.find((x) => x.kind === kind);
            if (!t || t.status === "done") {
              setWorking((cur) => cur === kind ? null : cur);
              await load(false);
              props.onChanged();
              if (notify)
                props.toast.push("ok", t?.message || `${OUTPUT_LABELS[kind]}生成好了。`);
              return;
            }
            if (t.status === "error") {
              setWorking((cur) => cur === kind ? null : cur);
              props.toast.push("err", t.message || "生成失败");
              return;
            }
          } catch {}
        }
      })();
    }, [props.meetingId, load, notify]);
    React39.useEffect(() => {
      (async () => {
        try {
          const s = await outputStatus(props.meetingId);
          const t = s.tasks.find((x) => x.kind === active && x.status === "running");
          if (t) {
            setWorking(active);
            watchGeneration(active);
          }
        } catch {}
      })();
      return () => {
        pollCtrl.current?.abort();
      };
    }, [props.meetingId, active, watchGeneration]);
    const generate = async (kind) => {
      if (working)
        return;
      setWorking(kind);
      try {
        const r = await generateOutput(props.meetingId, kind);
        if (!r.started)
          props.toast.push("info", "这份产出正在生成中。");
        watchGeneration(kind);
      } catch (e) {
        setWorking(null);
        props.toast.push("err", errorText(e));
      }
    };
    const cancelGenerate = async () => {
      if (!working)
        return;
      const kind = working;
      try {
        await cancelOutput(props.meetingId, kind);
        props.toast.push("info", "已取消生成。");
      } catch (e) {
        props.toast.push("err", errorText(e));
      } finally {
        setWorking(null);
      }
    };
    const remove = async (kind) => {
      setWorking(kind);
      try {
        await deleteOutput(props.meetingId, kind);
        props.toast.push("ok", `${OUTPUT_LABELS[kind]}已删除。`);
        await load();
        props.onChanged();
      } catch (e) {
        props.toast.push("err", errorText(e));
      } finally {
        setWorking(null);
      }
    };
    if (loading) {
      return /* @__PURE__ */ jsxDEV("div", {
        className: "tm-fade-in",
        "aria-busy": "true",
        children: [
          /* @__PURE__ */ jsxDEV(SkeletonRows, {
            rows: 4
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("span", {
            className: "tm-caption",
            style: { padding: "2px 8px" },
            children: "正在读取会后产出…"
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this);
    }
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-stack",
      style: { gap: 10 },
      children: [
        error ? /* @__PURE__ */ jsxDEV(Banner, {
          tone: "err",
          icon: /* @__PURE__ */ jsxDEV(Alert, {
            size: 14
          }, undefined, false, undefined, this),
          action: /* @__PURE__ */ jsxDEV(Button, {
            size: "sm",
            variant: "ghost",
            onClick: () => void load(),
            children: "重试"
          }, undefined, false, undefined, this),
          children: error
        }, undefined, false, undefined, this) : null,
        !props.ended ? /* @__PURE__ */ jsxDEV(Banner, {
          tone: "warn",
          icon: /* @__PURE__ */ jsxDEV(Alert, {
            size: 14
          }, undefined, false, undefined, this),
          children: "会议还没结束。产出要等会后有逐字稿才生成得出来。"
        }, undefined, false, undefined, this) : null,
        working ? /* @__PURE__ */ jsxDEV("div", {
          className: "tm-gen-progress",
          role: "status",
          "aria-live": "polite",
          children: [
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-gen-bar",
              children: /* @__PURE__ */ jsxDEV("span", {}, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("p", {
              className: "tm-caption",
              children: [
                "正在生成「",
                OUTPUT_LABELS[working],
                "」。可以先去做别的，生成完会出现在这里。"
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ jsxDEV(Button, {
              size: "sm",
              variant: "ghost",
              onClick: cancelGenerate,
              children: "取消生成"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this) : null,
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-output-menu",
          role: "tablist",
          "aria-label": "会后产出",
          children: OUTPUT_KINDS.map((kind) => /* @__PURE__ */ jsxDEV("button", {
            type: "button",
            role: "tab",
            "aria-selected": active === kind,
            className: `tm-output-tab${active === kind ? " is-on" : ""}`,
            onClick: () => setActive(kind),
            children: [
              OUTPUT_LABELS[kind],
              outputs[kind] ? /* @__PURE__ */ jsxDEV("span", {
                className: "tm-dot is-ok",
                title: "已生成"
              }, undefined, false, undefined, this) : null
            ]
          }, kind, true, undefined, this))
        }, undefined, false, undefined, this),
        active === "review" ? /* @__PURE__ */ jsxDEV(ReviewCard, {
          meetingId: props.meetingId,
          out: outputs.review,
          ended: props.ended,
          toast: props.toast,
          onChanged: props.onChanged,
          onPreview: () => setPreview("review")
        }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(OutputDoc, {
          kind: active,
          out: outputs[active],
          busy: working === active,
          ended: props.ended,
          toast: props.toast,
          onPreview: () => setPreview(active),
          onRegenerate: () => void generate(active),
          onDelete: () => void remove(active)
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("p", {
          className: "tm-hint",
          children: "五份产出都用你在设置页选的模型生成；素材优先逐字稿，缺了才用腾讯纪要，两者都没有会直接说没有素材、不编内容。"
        }, undefined, false, undefined, this),
        preview && outputs[preview] ? /* @__PURE__ */ jsxDEV(OutputPreview, {
          title: OUTPUT_LABELS[preview],
          text: outputs[preview].text,
          generatedAt: outputs[preview].generatedAt,
          toast: props.toast,
          onClose: () => setPreview(null)
        }, undefined, false, undefined, this) : null
      ]
    }, undefined, true, undefined, this);
  }
  function outputHint(kind) {
    switch (kind) {
      case "minutes-company":
        return "站在主办方立场：结论、要点、已确认事项、待办、未决问题。";
      case "minutes-investor":
        return "站在与会投资人立场：经营数据、增长驱动、风险、管理层原话。";
      case "review":
        return "复盘这场会开得怎么样：做得好的、该改的、下一场的具体改动。";
      case "insight":
        return "分析沟通方式：冲突回避、发言占比、倾听与引导风格，带原话依据。";
      default:
        return "把会上被问到的问题与回答整理成清单，方便复用。";
    }
  }

  // src/client/topbar.tsx
  function TopBar(props) {
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-topbar-tools",
      children: [
        /* @__PURE__ */ jsxDEV("button", {
          type: "button",
          className: "tm-topbar-btn",
          onClick: props.onOpenSettings,
          title: "设置",
          "aria-label": "设置",
          children: /* @__PURE__ */ jsxDEV(Settings, {
            size: 16
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("button", {
          type: "button",
          className: "tm-topbar-btn tm-topbar-assistant",
          onClick: props.onOpenAssistant,
          disabled: props.busy,
          title: "AI 对话",
          "aria-label": "打开 AI 对话",
          children: [
            props.busy ? /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(Send, {
              size: 14
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("span", {
              children: props.busy ? "正在打开…" : "AI 对话"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }

  // src/client/guide.tsx
  var React40 = __toESM(require("react"));
  var MANUAL_COMMAND = "npm i -g @tencentcloud/tmeet@1.1.0";
  function Guide(props) {
    const state = props.status.state;
    if (state === "not-installed")
      return /* @__PURE__ */ jsxDEV(NotInstalled, {
        ...props
      }, undefined, false, undefined, this);
    if (state === "version-mismatch")
      return /* @__PURE__ */ jsxDEV(VersionMismatch, {
        ...props
      }, undefined, false, undefined, this);
    if (state === "expired")
      return /* @__PURE__ */ jsxDEV(Expired, {
        ...props
      }, undefined, false, undefined, this);
    return /* @__PURE__ */ jsxDEV(NotAuthorized, {
      ...props
    }, undefined, false, undefined, this);
  }
  function Shell(props) {
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-guide",
      children: /* @__PURE__ */ jsxDEV("div", {
        className: "tm-guide-inner",
        children: [
          /* @__PURE__ */ jsxDEV("div", {
            className: `tm-guide-ico${props.warnIcon ? " is-warn" : ""}`,
            children: props.icon ?? /* @__PURE__ */ jsxDEV(Video, {
              size: 26
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("h1", {
            className: "tm-guide-title",
            children: props.title
          }, undefined, false, undefined, this),
          props.lines.map((line) => /* @__PURE__ */ jsxDEV("p", {
            className: "tm-guide-desc",
            children: line
          }, line, false, undefined, this)),
          props.children
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
  }
  function NotInstalled(props) {
    const [installing, setInstalling] = React40.useState(Boolean(props.status.installing));
    const [error, setError] = React40.useState("");
    const [showManual, setShowManual] = React40.useState(false);
    const progress = useInstallProgress(installing);
    React40.useEffect(() => {
      let alive = true;
      getInstallStatus().then((s) => {
        if (!alive || s.installing || !s.lastMessage)
          return;
        setError(s.lastMessage);
      }).catch(() => {});
      return () => {
        alive = false;
      };
    }, []);
    React40.useEffect(() => {
      if (!installing || !progress.done)
        return;
      let alive = true;
      const timer = setTimeout(() => {
        if (!alive)
          return;
        setInstalling(false);
        props.onRefresh();
      }, 900);
      return () => {
        alive = false;
        clearTimeout(timer);
      };
    }, [installing, progress.done, props]);
    const start = async () => {
      setError("");
      setInstalling(true);
      try {
        const r = await installCli();
        if (!r.ok) {
          setError(r.message || "安装没成功，可以按下面的命令自己装一次。");
          setInstalling(false);
          setShowManual(true);
          return;
        }
        props.toast.push("ok", r.message || "会议组件装好了。");
        setInstalling(false);
        await props.onRefresh();
      } catch (e) {
        setError(errorText(e));
        setInstalling(false);
        setShowManual(true);
      }
    };
    return /* @__PURE__ */ jsxDEV(Shell, {
      title: "还没有安装会议组件",
      lines: ["插件本身很小，真正跟腾讯会议通信用的是一个命令行组件。", "点下面的按钮装一次就够，之后不用再管。"],
      children: [
        error ? /* @__PURE__ */ jsxDEV("div", {
          style: { marginTop: 16, width: "100%" },
          children: /* @__PURE__ */ jsxDEV(Banner, {
            tone: "err",
            icon: /* @__PURE__ */ jsxDEV(Alert, {
              size: 14
            }, undefined, false, undefined, this),
            children: error
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this) : null,
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-guide-acts",
          children: [
            /* @__PURE__ */ jsxDEV(Button, {
              variant: "primary",
              size: "lg",
              onClick: () => void start(),
              disabled: installing,
              icon: installing ? /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(ExternalLink, {
                size: 14
              }, undefined, false, undefined, this),
              children: installing ? "正在安装…" : "安装会议组件"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV(Button, {
              variant: "ghost",
              size: "lg",
              onClick: () => setShowManual((v) => !v),
              children: showManual ? "收起手动方式" : "我自己装"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        installing ? /* @__PURE__ */ jsxDEV("p", {
          className: "tm-hint",
          style: { marginTop: 12 },
          role: "status",
          children: progress.message || "正在安装，通常几十秒。装完这里会自动刷新。"
        }, undefined, false, undefined, this) : null,
        showManual ? /* @__PURE__ */ jsxDEV("div", {
          className: "tm-guide-code",
          children: [
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-caption",
              children: "在这台机器的命令行里运行："
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("code", {
              children: MANUAL_COMMAND
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-caption",
              children: "装完回来点「重新检测」，或者重开面板。"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-row",
              style: { marginTop: 4 },
              children: [
                /* @__PURE__ */ jsxDEV(Button, {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => {
                    copyText(MANUAL_COMMAND).then((ok) => {
                      props.toast.push(ok ? "ok" : "err", ok ? "命令已复制。" : "复制没成功，手动选中再复制。");
                    });
                  },
                  children: "复制命令"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV(Button, {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => void props.onRefresh(),
                  children: "重新检测"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this) : null
      ]
    }, undefined, true, undefined, this);
  }
  function VersionMismatch(props) {
    const [busy, setBusy] = React40.useState(false);
    const [error, setError] = React40.useState("");
    const have = props.status.version || "没读到版本";
    const need = props.status.expectedVersion || "1.1.0";
    const upgrade = async () => {
      setError("");
      setBusy(true);
      try {
        const r = await installCli();
        if (!r.ok) {
          setError(r.message || "升级没成功，可以按下面的命令自己升一次。");
          return;
        }
        props.toast.push("ok", r.message || "会议组件已升级。");
        await props.onRefresh();
      } catch (e) {
        setError(errorText(e));
      } finally {
        setBusy(false);
      }
    };
    return /* @__PURE__ */ jsxDEV(Shell, {
      warnIcon: true,
      icon: /* @__PURE__ */ jsxDEV(Refresh, {
        size: 24
      }, undefined, false, undefined, this),
      title: "会议组件版本太低",
      lines: ["老版本读不到逐字稿和纪要，待办与会后产出都用不了。", "升级一次就好，会议记录不受影响。"],
      children: [
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-version-row",
          children: [
            /* @__PURE__ */ jsxDEV("span", {
              children: "当前"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-version-num",
              children: have
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("span", {
              children: "需要"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-version-num",
              children: need
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        error ? /* @__PURE__ */ jsxDEV("div", {
          style: { marginTop: 14, width: "100%" },
          children: /* @__PURE__ */ jsxDEV(Banner, {
            tone: "err",
            icon: /* @__PURE__ */ jsxDEV(Alert, {
              size: 14
            }, undefined, false, undefined, this),
            children: error
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this) : null,
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-guide-acts",
          children: [
            /* @__PURE__ */ jsxDEV(Button, {
              variant: "primary",
              size: "lg",
              onClick: () => void upgrade(),
              disabled: busy,
              icon: busy ? /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(Refresh, {
                size: 14
              }, undefined, false, undefined, this),
              children: busy ? "正在升级…" : "升级会议组件"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV(Button, {
              variant: "ghost",
              size: "lg",
              onClick: () => void props.onRefresh(),
              children: "重新检测"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-guide-code",
          children: [
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-caption",
              children: "也可以用命令行："
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("code", {
              children: MANUAL_COMMAND
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function Expired(props) {
    return /* @__PURE__ */ jsxDEV(Shell, {
      warnIcon: true,
      icon: /* @__PURE__ */ jsxDEV(Alert, {
        size: 24
      }, undefined, false, undefined, this),
      title: "登录已过期",
      lines: ["本机还留着上次的会议记录，重新登录一次就能继续。", "会议号、逐字稿与产出一份都不会丢。"],
      children: /* @__PURE__ */ jsxDEV(AuthActions, {
        ...props,
        switchable: true
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function NotAuthorized(props) {
    const [pending, setPending] = React40.useState(false);
    const poll = useAuthPoll(pending);
    React40.useEffect(() => {
      if (poll.phase !== "done")
        return;
      let alive = true;
      props.onRefresh().then(() => {
        if (!alive)
          return;
        setPending(false);
        props.toast.push("ok", "授权完成了。");
      });
      return () => {
        alive = false;
      };
    }, [poll.phase, props]);
    if (pending) {
      return /* @__PURE__ */ jsxDEV(Shell, {
        icon: /* @__PURE__ */ jsxDEV(Shield, {
          size: 24
        }, undefined, false, undefined, this),
        title: "等待授权中",
        lines: ["浏览器里确认授权，这里会自动接上。", "没看到页面就点下面的「重新生成链接」。"],
        children: [
          /* @__PURE__ */ jsxDEV("div", {
            className: "tm-version-row",
            children: [
              /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("span", {
                role: "status",
                children: formatWaited(poll.waitedSeconds)
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this),
          poll.phase === "failed" ? /* @__PURE__ */ jsxDEV("div", {
            style: { marginTop: 14, width: "100%" },
            children: /* @__PURE__ */ jsxDEV(Banner, {
              tone: "err",
              icon: /* @__PURE__ */ jsxDEV(Alert, {
                size: 14
              }, undefined, false, undefined, this),
              children: poll.reason
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this) : null,
          /* @__PURE__ */ jsxDEV("div", {
            className: "tm-guide-acts",
            children: [
              /* @__PURE__ */ jsxDEV(Button, {
                variant: "primary",
                size: "lg",
                icon: /* @__PURE__ */ jsxDEV(ExternalLink, {
                  size: 14
                }, undefined, false, undefined, this),
                onClick: () => {
                  regenerate(poll.url, props, setPending);
                },
                children: "重新生成链接"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV(Button, {
                variant: "ghost",
                size: "lg",
                onClick: () => setPending(false),
                children: "取消等待"
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ jsxDEV("p", {
            className: "tm-hint",
            style: { marginTop: 12 },
            children: "授权链接只在浏览器里打开，插件不读、不保存腾讯会议的任何凭证文件。"
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this);
    }
    return /* @__PURE__ */ jsxDEV(Shell, {
      icon: /* @__PURE__ */ jsxDEV(Video, {
        size: 26
      }, undefined, false, undefined, this),
      title: "连接你的腾讯会议",
      lines: ["连上之后可以建会、读逐字稿与纪要。", "只访问你自己账号下的会议，随时可以断开。"],
      children: [
        /* @__PURE__ */ jsxDEV(AuthActions, {
          ...props,
          onPending: () => setPending(true)
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("p", {
          className: "tm-hint",
          style: { marginTop: 14 },
          children: "授权在浏览器里完成，插件只转发那一条链接。"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  async function regenerate(url, props, setPending) {
    try {
      if (url && typeof window !== "undefined") {
        window.open(url, "_blank", "noopener,noreferrer");
        props.toast.push("info", "已重新打开授权页。");
        return;
      }
      const r = await startAuth(true);
      if (r.url && typeof window !== "undefined")
        window.open(r.url, "_blank", "noopener,noreferrer");
      props.toast.push(r.ok ? "info" : "err", r.message || (r.ok ? "已重新生成授权链接。" : "链接没生成出来，稍后再试。"));
      setPending(true);
    } catch (e) {
      props.toast.push("err", errorText(e));
      setPending(true);
    }
  }
  function AuthActions(props) {
    const [busy, setBusy] = React40.useState(false);
    const [error, setError] = React40.useState("");
    const start = async (switchAccount) => {
      setError("");
      setBusy(true);
      try {
        const r = await startAuth(switchAccount);
        if (r.url && typeof window !== "undefined") {
          window.open(r.url, "_blank", "noopener,noreferrer");
        }
        if (!r.ok && !r.url) {
          setError(r.message || "授权没起来，稍后再点一次。");
          return;
        }
        props.toast.push("info", r.opened ? "授权页已打开，确认后这里会自动接上。" : "复制下面的链接在浏览器里打开。");
        props.onPending?.();
      } catch (e) {
        setError(errorText(e));
      } finally {
        setBusy(false);
      }
    };
    return /* @__PURE__ */ jsxDEV(Fragment, {
      children: [
        error ? /* @__PURE__ */ jsxDEV("div", {
          style: { marginTop: 14, width: "100%" },
          children: /* @__PURE__ */ jsxDEV(Banner, {
            tone: "err",
            icon: /* @__PURE__ */ jsxDEV(Alert, {
              size: 14
            }, undefined, false, undefined, this),
            children: error
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this) : null,
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-guide-acts",
          children: [
            /* @__PURE__ */ jsxDEV(Button, {
              variant: "primary",
              size: "lg",
              onClick: () => void start(false),
              disabled: busy,
              icon: busy ? /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(ExternalLink, {
                size: 14
              }, undefined, false, undefined, this),
              children: busy ? "正在打开授权页…" : "去授权"
            }, undefined, false, undefined, this),
            props.switchable ? /* @__PURE__ */ jsxDEV(Button, {
              variant: "ghost",
              size: "lg",
              onClick: () => void start(true),
              disabled: busy,
              children: "换个账号"
            }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(Button, {
              variant: "ghost",
              size: "lg",
              onClick: props.onSwitchAccount,
              disabled: busy,
              children: "换个账号"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function OperationFailed(props) {
    return /* @__PURE__ */ jsxDEV(Shell, {
      warnIcon: true,
      icon: /* @__PURE__ */ jsxDEV(Alert, {
        size: 24
      }, undefined, false, undefined, this),
      title: "没读到腾讯会议的状态",
      lines: [props.message || "状态检查失败了一次。", "再检测一次；还不行就确认这台机器的命令行能跑 tmeet。"],
      children: /* @__PURE__ */ jsxDEV("div", {
        className: "tm-guide-acts",
        children: /* @__PURE__ */ jsxDEV(Button, {
          variant: "primary",
          size: "lg",
          onClick: props.onRetry,
          icon: /* @__PURE__ */ jsxDEV(Refresh, {
            size: 14
          }, undefined, false, undefined, this),
          children: "重新检测"
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }

  // src/client/create-dialog.tsx
  var React41 = __toESM(require("react"));
  var TYPES = [
    {
      id: "general",
      label: "通用会议",
      desc: "不预设口径，字段全按默认值",
      icon: /* @__PURE__ */ jsxDEV(Video, {
        size: 16
      }, undefined, false, undefined, this),
      defaults: { subjectHint: "", durationMinutes: 60, cloudRecord: true, autoTranscribe: true, note: "" }
    },
    {
      id: "client",
      label: "客户沟通",
      desc: "带云录制与逐字稿，会后可出纪要",
      icon: /* @__PURE__ */ jsxDEV(Users, {
        size: 16
      }, undefined, false, undefined, this),
      defaults: {
        subjectHint: "",
        durationMinutes: 45,
        cloudRecord: true,
        autoTranscribe: true,
        note: "客户沟通"
      }
    },
    {
      id: "review",
      label: "内部评审",
      desc: "默认 90 分钟，开等候室",
      icon: /* @__PURE__ */ jsxDEV(Check, {
        size: 16
      }, undefined, false, undefined, this),
      defaults: { subjectHint: "", durationMinutes: 90, cloudRecord: true, autoTranscribe: true, note: "内部评审" }
    },
    {
      id: "weekly",
      label: "周会",
      desc: "默认周期性会议，30 分钟",
      icon: /* @__PURE__ */ jsxDEV(Calendar, {
        size: 16
      }, undefined, false, undefined, this),
      defaults: { subjectHint: "", durationMinutes: 30, cloudRecord: true, autoTranscribe: true, note: "周会" }
    },
    {
      id: "custom",
      label: "自定义",
      desc: "完全不预设，从空白填起",
      icon: /* @__PURE__ */ jsxDEV(ArrowRight, {
        size: 16
      }, undefined, false, undefined, this),
      defaults: { subjectHint: "", durationMinutes: 60, cloudRecord: false, autoTranscribe: false, note: "" }
    }
  ];
  var DURATIONS = [
    { value: "30", label: "30 分钟" },
    { value: "45", label: "45 分钟" },
    { value: "60", label: "1 小时" },
    { value: "90", label: "1.5 小时" },
    { value: "120", label: "2 小时" },
    { value: "180", label: "3 小时" },
    { value: "custom", label: "指定结束时间" }
  ];
  function pad2(n) {
    return String(n).padStart(2, "0");
  }
  function nextWholeHour() {
    const d = new Date;
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return {
      date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
      time: `${pad2(d.getHours())}:00`
    };
  }
  function addMinutes(date, time, minutes) {
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const base = new Date(y || 1970, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
    base.setMinutes(base.getMinutes() + minutes);
    return `${pad2(base.getHours())}:${pad2(base.getMinutes())}`;
  }
  function initialForm(type) {
    const start = nextWholeHour();
    return {
      subject: type.defaults.subjectHint,
      date: start.date,
      startTime: start.time,
      duration: String(type.defaults.durationMinutes),
      endTime: addMinutes(start.date, start.time, type.defaults.durationMinutes),
      passwordEnabled: false,
      password: "",
      recurring: type.id === "weekly",
      joinLimit: "1",
      cloudRecord: type.defaults.cloudRecord,
      autoTranscribe: type.defaults.autoTranscribe,
      waitingRoom: type.id === "review",
      note: type.defaults.note,
      tags: []
    };
  }
  function CreateDialog(props) {
    const [stage, setStage] = React41.useState("form");
    const [form, setForm] = React41.useState(() => initialForm(TYPES[0]));
    const [preview, setPreview] = React41.useState([]);
    const [busy, setBusy] = React41.useState(false);
    const [error, setError] = React41.useState("");
    const [tagDraft, setTagDraft] = React41.useState("");
    const [showMore, setShowMore] = React41.useState(false);
    const subjectRef = React41.useRef(null);
    React41.useEffect(() => {
      if (!props.open)
        return;
      setStage("form");
      setForm(initialForm(TYPES[0]));
      setPreview([]);
      setError("");
      setBusy(false);
      setTagDraft("");
      setShowMore(false);
    }, [props.open]);
    React41.useEffect(() => {
      if (stage !== "form")
        return;
      const timer = setTimeout(() => subjectRef.current?.focus(), 30);
      return () => clearTimeout(timer);
    }, [stage]);
    const patch = (next) => setForm((f) => ({ ...f, ...next }));
    const commitTag = () => {
      const raw = tagDraft.trim();
      if (!raw)
        return;
      const parts = raw.split(/[,，、;；]/).map((s) => s.trim()).filter(Boolean);
      if (!parts.length)
        return;
      setForm((f) => {
        const next = [...f.tags];
        for (const p of parts)
          if (!next.includes(p))
            next.push(p);
        return { ...f, tags: next };
      });
      setTagDraft("");
    };
    const buildBody = () => {
      const durationMinutes = Number(form.duration) || 60;
      const body = {
        subject: form.subject.trim(),
        date: form.date,
        startTime: form.startTime,
        durationMinutes,
        passwordEnabled: form.passwordEnabled,
        recurring: form.recurring,
        joinLimit: Number(form.joinLimit),
        cloudRecord: form.cloudRecord,
        autoTranscribe: form.autoTranscribe,
        waitingRoom: form.waitingRoom,
        note: form.note.trim(),
        typeId: "general"
      };
      if (form.passwordEnabled && form.password)
        body.password = form.password;
      if (form.duration === "custom")
        body.durationMinutes = undefined;
      return body;
    };
    const goPreview = async () => {
      setError("");
      if (!form.subject.trim()) {
        setError("先填会议主题，不填的主题在腾讯侧也建不出来。");
        return;
      }
      if (form.passwordEnabled && !/^\d{4,6}$/.test(form.password)) {
        setError("入会密码要 4 到 6 位数字。");
        return;
      }
      setBusy(true);
      try {
        const r = await createMeeting(buildBody(), false);
        if (r.stage !== "preview") {
          setError("预览没拿到，先别提交。稍后再点一次。");
          return;
        }
        setPreview(r.fields);
        setStage("preview");
      } catch (e) {
        setError(errorText(e));
      } finally {
        setBusy(false);
      }
    };
    const doCreate = async () => {
      setError("");
      setBusy(true);
      try {
        const r = await createMeeting(buildBody(), true);
        if (r.stage === "created") {
          const overridden = r.overridden ?? [];
          props.toast.push("ok", overridden.length ? `会议建好了，但企业策略覆盖了这些设置：${overridden.join("、")}` : r.message || "会议建好了。");
          props.onCreated(r.detail?.brief.meetingId ?? r.meeting?.meetingId);
          props.onOpenChange(false);
        } else {
          setError("提交后没收到创建结果，去列表同步一次确认。");
        }
      } catch (e) {
        setError(errorText(e));
      } finally {
        setBusy(false);
      }
    };
    const title = "新建会议";
    const desc = "主题、时间、录制是必填；其余在「更多选项」里。点「下一步」先出预览，确认后才创建。";
    return /* @__PURE__ */ jsxDEV(Dialog2, {
      open: props.open,
      onOpenChange: props.onOpenChange,
      title,
      description: desc,
      wide: true,
      dismissable: !busy,
      footer: /* @__PURE__ */ jsxDEV(Fragment, {
        children: [
          /* @__PURE__ */ jsxDEV("div", {
            className: "tm-grow",
            children: /* @__PURE__ */ jsxDEV(Steps, {
              stage
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: "tm-dialog-acts",
            children: stage === "form" ? /* @__PURE__ */ jsxDEV(Fragment, {
              children: [
                /* @__PURE__ */ jsxDEV(Button, {
                  onClick: () => props.onOpenChange(false),
                  children: "取消"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV(Button, {
                  variant: "primary",
                  onClick: () => void goPreview(),
                  disabled: busy,
                  children: busy ? "正在生成预览…" : "下一步"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV(Fragment, {
              children: [
                /* @__PURE__ */ jsxDEV(Button, {
                  onClick: () => setStage("form"),
                  disabled: busy,
                  icon: /* @__PURE__ */ jsxDEV(ChevronLeft, {
                    size: 13
                  }, undefined, false, undefined, this),
                  children: "回去改"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV(Button, {
                  variant: "primary",
                  onClick: () => void doCreate(),
                  disabled: busy,
                  children: busy ? "正在创建…" : "确认创建"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this)
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this),
      children: [
        error ? /* @__PURE__ */ jsxDEV(Banner, {
          tone: "err",
          icon: /* @__PURE__ */ jsxDEV(Alert, {
            size: 14
          }, undefined, false, undefined, this),
          children: error
        }, undefined, false, undefined, this) : null,
        stage === "form" ? /* @__PURE__ */ jsxDEV(Fragment, {
          children: [
            /* @__PURE__ */ jsxDEV(Field, {
              label: "会议主题",
              htmlFor: "tm-create-subject",
              required: true,
              children: /* @__PURE__ */ jsxDEV(Input, {
                id: "tm-create-subject",
                ref: subjectRef,
                value: form.subject,
                placeholder: "例如：与南向基金王京一对一沟通",
                onChange: (e) => patch({ subject: e.target.value })
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-grid3",
              children: [
                /* @__PURE__ */ jsxDEV(Field, {
                  label: "日期",
                  htmlFor: "tm-create-date",
                  required: true,
                  children: /* @__PURE__ */ jsxDEV(Input, {
                    id: "tm-create-date",
                    type: "date",
                    value: form.date,
                    onChange: (e) => patch({ date: e.target.value })
                  }, undefined, false, undefined, this)
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV(Field, {
                  label: "开始时间",
                  htmlFor: "tm-create-start",
                  required: true,
                  children: /* @__PURE__ */ jsxDEV(Input, {
                    id: "tm-create-start",
                    type: "time",
                    value: form.startTime,
                    onChange: (e) => patch({ startTime: e.target.value })
                  }, undefined, false, undefined, this)
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV(Field, {
                  label: "时长",
                  htmlFor: "tm-create-duration",
                  required: true,
                  children: /* @__PURE__ */ jsxDEV(Select, {
                    id: "tm-create-duration",
                    ariaLabel: "会议时长",
                    value: form.duration,
                    onValueChange: (v) => patch({ duration: v }),
                    options: DURATIONS
                  }, undefined, false, undefined, this)
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            form.duration === "custom" ? /* @__PURE__ */ jsxDEV(Field, {
              label: "结束时间",
              htmlFor: "tm-create-end",
              required: true,
              children: /* @__PURE__ */ jsxDEV(Input, {
                id: "tm-create-end",
                type: "time",
                value: form.endTime,
                onChange: (e) => patch({ endTime: e.target.value })
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this) : null,
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-switch-row",
              children: [
                /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-switch-text",
                  children: [
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-switch-title",
                      children: "入会密码"
                    }, undefined, false, undefined, this),
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-switch-desc",
                      children: "默认不开。开了要填 4 到 6 位数字。"
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                /* @__PURE__ */ jsxDEV(Switch3, {
                  checked: form.passwordEnabled,
                  onCheckedChange: (v) => patch({ passwordEnabled: v }),
                  label: "入会密码"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            form.passwordEnabled ? /* @__PURE__ */ jsxDEV(Field, {
              label: "密码（4 到 6 位数字）",
              htmlFor: "tm-create-pwd",
              required: true,
              children: /* @__PURE__ */ jsxDEV(Input, {
                id: "tm-create-pwd",
                inputMode: "numeric",
                maxLength: 6,
                value: form.password,
                onChange: (e) => patch({ password: e.target.value.replace(/\D/g, "").slice(0, 6) })
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this) : null,
            /* @__PURE__ */ jsxDEV(Field, {
              label: "参会人标签",
              htmlFor: "tm-create-tags",
              children: /* @__PURE__ */ jsxDEV("div", {
                className: "tm-tagbox",
                children: [
                  form.tags.map((tag) => /* @__PURE__ */ jsxDEV("span", {
                    className: "tm-tag-chip",
                    children: [
                      /* @__PURE__ */ jsxDEV("span", {
                        children: tag
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("button", {
                        type: "button",
                        className: "tm-tag-x",
                        "aria-label": `移除标签 ${tag}`,
                        onClick: () => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) })),
                        children: /* @__PURE__ */ jsxDEV(X, {
                          size: 10
                        }, undefined, false, undefined, this)
                      }, undefined, false, undefined, this)
                    ]
                  }, tag, true, undefined, this)),
                  /* @__PURE__ */ jsxDEV("input", {
                    id: "tm-create-tags",
                    value: tagDraft,
                    placeholder: form.tags.length ? "继续添加" : "输入姓名后回车",
                    onChange: (e) => setTagDraft(e.target.value),
                    onKeyDown: (e) => {
                      if (e.key === "Enter" || e.key === "," || e.key === "，") {
                        e.preventDefault();
                        commitTag();
                      } else if (e.key === "Backspace" && !tagDraft && form.tags.length) {
                        setForm((f) => ({ ...f, tags: f.tags.slice(0, -1) }));
                      }
                    },
                    onBlur: commitTag
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV(Field, {
              label: "备注",
              htmlFor: "tm-create-note",
              children: /* @__PURE__ */ jsxDEV(AutoTextarea, {
                id: "tm-create-note",
                minRows: 2,
                value: form.note,
                placeholder: "这场会要谈什么，会后对照着看",
                onChange: (e) => patch({ note: e.target.value })
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-more",
              children: [
                /* @__PURE__ */ jsxDEV("button", {
                  type: "button",
                  className: "tm-more-toggle",
                  "aria-expanded": showMore,
                  onClick: () => setShowMore((v) => !v),
                  children: [
                    /* @__PURE__ */ jsxDEV("span", {
                      className: "tm-more-label",
                      children: showMore ? "收起更多选项" : "更多选项"
                    }, undefined, false, undefined, this),
                    /* @__PURE__ */ jsxDEV(ChevronDown, {
                      size: 12,
                      className: "tm-chevron"
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this),
                showMore ? /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-more-body",
                  children: [
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-grid2",
                      children: [
                        /* @__PURE__ */ jsxDEV(Field, {
                          label: "会议形式",
                          htmlFor: "tm-create-recurring",
                          children: /* @__PURE__ */ jsxDEV(Select, {
                            id: "tm-create-recurring",
                            ariaLabel: "会议形式",
                            value: form.recurring ? "1" : "0",
                            onValueChange: (v) => patch({ recurring: v === "1" }),
                            options: [
                              { value: "0", label: "单次会议" },
                              { value: "1", label: "周期性会议" }
                            ]
                          }, undefined, false, undefined, this)
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV(Field, {
                          label: "入会限制",
                          htmlFor: "tm-create-join",
                          children: /* @__PURE__ */ jsxDEV(Select, {
                            id: "tm-create-join",
                            ariaLabel: "入会限制",
                            value: form.joinLimit,
                            onValueChange: (v) => patch({ joinLimit: v }),
                            options: [
                              { value: "1", label: "所有人可入会" },
                              { value: "2", label: "仅受邀成员" },
                              { value: "3", label: "仅企业内部" }
                            ]
                          }, undefined, false, undefined, this)
                        }, undefined, false, undefined, this)
                      ]
                    }, undefined, true, undefined, this),
                    /* @__PURE__ */ jsxDEV("div", {
                      children: [
                        /* @__PURE__ */ jsxDEV("div", {
                          className: "tm-switch-row",
                          children: [
                            /* @__PURE__ */ jsxDEV("div", {
                              className: "tm-switch-text",
                              children: [
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "tm-switch-title",
                                  children: "云录制"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "tm-switch-desc",
                                  children: "会后能不能拿到逐字稿与纪要，就看这一条。"
                                }, undefined, false, undefined, this)
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV(Switch3, {
                              checked: form.cloudRecord,
                              onCheckedChange: (v) => patch({ cloudRecord: v }),
                              label: "云录制"
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("div", {
                          className: "tm-switch-row",
                          children: [
                            /* @__PURE__ */ jsxDEV("div", {
                              className: "tm-switch-text",
                              children: [
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "tm-switch-title",
                                  children: "自动转写"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "tm-switch-desc",
                                  children: "要有云录制才生效。关掉就只有视频没有文字。"
                                }, undefined, false, undefined, this)
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV(Switch3, {
                              checked: form.autoTranscribe,
                              onCheckedChange: (v) => patch({ autoTranscribe: v }),
                              label: "自动转写"
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this),
                        /* @__PURE__ */ jsxDEV("div", {
                          className: "tm-switch-row",
                          children: [
                            /* @__PURE__ */ jsxDEV("div", {
                              className: "tm-switch-text",
                              children: [
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "tm-switch-title",
                                  children: "等候室"
                                }, undefined, false, undefined, this),
                                /* @__PURE__ */ jsxDEV("div", {
                                  className: "tm-switch-desc",
                                  children: "开启后由主持人在腾讯客户端放行。"
                                }, undefined, false, undefined, this)
                              ]
                            }, undefined, true, undefined, this),
                            /* @__PURE__ */ jsxDEV(Switch3, {
                              checked: form.waitingRoom,
                              onCheckedChange: (v) => patch({ waitingRoom: v }),
                              label: "等候室"
                            }, undefined, false, undefined, this)
                          ]
                        }, undefined, true, undefined, this)
                      ]
                    }, undefined, true, undefined, this)
                  ]
                }, undefined, true, undefined, this) : null
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this) : null,
        stage === "preview" ? /* @__PURE__ */ jsxDEV(Fragment, {
          children: [
            /* @__PURE__ */ jsxDEV("dl", {
              className: "tm-preview",
              children: preview.map((f) => /* @__PURE__ */ jsxDEV("div", {
                className: "tm-preview-row",
                children: [
                  /* @__PURE__ */ jsxDEV("dt", {
                    children: f.label
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV("dd", {
                    children: f.value
                  }, undefined, false, undefined, this)
                ]
              }, f.label, true, undefined, this))
            }, undefined, false, undefined, this),
            form.tags.length ? /* @__PURE__ */ jsxDEV("p", {
              className: "tm-hint",
              children: [
                "本地标签：",
                form.tags.join("、")
              ]
            }, undefined, true, undefined, this) : null,
            /* @__PURE__ */ jsxDEV("p", {
              className: "tm-hint",
              children: "点「确认创建」才会提交到腾讯会议；这一步之前什么都没发出去。"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this) : null
      ]
    }, undefined, true, undefined, this);
  }
  function Steps(props) {
    const order = [
      { key: "form", label: "填内容" },
      { key: "preview", label: "确认" }
    ];
    const index = order.findIndex((s) => s.key === props.stage);
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-steps",
      children: order.map((s, i) => /* @__PURE__ */ jsxDEV("span", {
        className: `tm-step${i === index ? " is-on" : ""}${i < index ? " is-done" : ""}`,
        "aria-current": i === index ? "step" : undefined,
        children: [
          /* @__PURE__ */ jsxDEV("span", {
            className: "tm-step-num",
            children: i < index ? /* @__PURE__ */ jsxDEV(Check, {
              size: 9
            }, undefined, false, undefined, this) : i + 1
          }, undefined, false, undefined, this),
          s.label
        ]
      }, s.key, true, undefined, this))
    }, undefined, false, undefined, this);
  }

  // src/client/ui/toast.tsx
  var React42 = __toESM(require("react"));
  var seq = 1;
  function useToast() {
    const [toasts, setToasts] = React42.useState([]);
    const timers = React42.useRef(new Map);
    const dismiss = React42.useCallback((id) => {
      setToasts((list) => list.filter((t) => t.id !== id));
      const timer = timers.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timers.current.delete(id);
      }
    }, []);
    const push = React42.useCallback((tone, text) => {
      const id = seq++;
      setToasts((list) => [...list.slice(-2), { id, tone, text }]);
      const timer = setTimeout(() => dismiss(id), tone === "err" ? 7000 : 4200);
      timers.current.set(id, timer);
    }, [dismiss]);
    React42.useEffect(() => {
      const map = timers.current;
      return () => {
        for (const timer of map.values())
          clearTimeout(timer);
        map.clear();
      };
    }, []);
    return { toasts, push, dismiss };
  }
  function ToastHost(props) {
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-toasts",
      "aria-live": "polite",
      "aria-atomic": "false",
      children: props.api.toasts.map((t) => /* @__PURE__ */ jsxDEV("div", {
        className: `tm-toast${t.tone === "err" ? " is-err" : t.tone === "ok" ? " is-ok" : ""}`,
        children: [
          /* @__PURE__ */ jsxDEV("span", {
            style: { flex: "none", marginTop: 1 },
            children: t.tone === "err" ? /* @__PURE__ */ jsxDEV(Alert, {
              size: 14
            }, undefined, false, undefined, this) : t.tone === "ok" ? /* @__PURE__ */ jsxDEV(Check, {
              size: 14
            }, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(Alert, {
              size: 14
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("span", {
            className: "tm-grow",
            children: t.text
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("button", {
            type: "button",
            className: "tm-iconbtn",
            "aria-label": "关闭提示",
            onClick: () => props.api.dismiss(t.id),
            children: /* @__PURE__ */ jsxDEV(X, {
              size: 12
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this)
        ]
      }, t.id, true, undefined, this))
    }, undefined, false, undefined, this);
  }

  // src/client/app.tsx
  var lastView = {
    route: { kind: "home" },
    selectedId: "",
    query: "",
    onlyTranscript: false
  };
  function App(props) {
    const toast = useToast();
    const status = useStatus();
    const [route, setRouteState] = React43.useState(lastView.route);
    const [createOpen, setCreateOpen] = React43.useState(false);
    const [switchOpen, setSwitchOpen] = React43.useState(false);
    const [onlyTranscript, setOnlyTranscriptState] = React43.useState(lastView.onlyTranscript);
    const [query, setQueryState] = React43.useState(lastView.query);
    const [queryDraft, setQueryDraft] = React43.useState(lastView.query);
    const [filterOpen, setFilterOpen] = React43.useState(false);
    const [selectedId, setSelectedIdState] = React43.useState(lastView.selectedId);
    const [chatBusy, setChatBusy] = React43.useState(false);
    const setRoute = (v) => {
      setRouteState((cur) => {
        const next = typeof v === "function" ? v(cur) : v;
        lastView.route = next;
        return next;
      });
    };
    const setOnlyTranscript = (v) => {
      setOnlyTranscriptState((cur) => {
        const next = typeof v === "function" ? v(cur) : v;
        lastView.onlyTranscript = next;
        return next;
      });
    };
    const setQuery = (v) => {
      setQueryState((cur) => {
        const next = typeof v === "function" ? v(cur) : v;
        lastView.query = next;
        return next;
      });
    };
    const setSelectedId = (v) => {
      setSelectedIdState((cur) => {
        const next = typeof v === "function" ? v(cur) : v;
        lastView.selectedId = next;
        return next;
      });
    };
    React43.useEffect(() => {
      if (queryDraft === query)
        return;
      const t = setTimeout(() => setQuery(queryDraft.trim()), 120);
      return () => clearTimeout(t);
    }, [queryDraft, query]);
    React43.useEffect(() => {
      if (!filterOpen)
        return;
      const onDown = (e) => {
        if (e.target.closest?.(".tm-menu-wrap"))
          return;
        setFilterOpen(false);
      };
      const onKey = (e) => {
        if (e.key === "Escape")
          setFilterOpen(false);
      };
      window.addEventListener("pointerdown", onDown, true);
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("pointerdown", onDown, true);
        window.removeEventListener("keydown", onKey);
      };
    }, [filterOpen]);
    const meetings = useMeetings(onlyTranscript);
    const ready = status.status && isReady(status.status) && !status.error;
    const allMeetings = React43.useMemo(() => [...meetings.live, ...meetings.upcoming, ...meetings.history], [meetings.live, meetings.upcoming, meetings.history]);
    React43.useEffect(() => {
      if (!ready || !allMeetings.length)
        return;
      setSelectedId((cur) => cur && allMeetings.some((m) => m.meetingId === cur) ? cur : allMeetings[0].meetingId);
    }, [ready, allMeetings]);
    const openMeetingChat = async () => {
      const m = allMeetings.find((x) => x.meetingId === selectedId);
      if (!m) {
        toast.push("info", "先在左边选一场会，再开 AI 对话。");
        return;
      }
      setChatBusy(true);
      try {
        const r = await prepareChatSession(m.meetingId);
        if (!props.nav?.openMeetingWorkspace) {
          toast.push("err", "跳转服务不可用。工作区已备好：" + r.workspaceId);
          return;
        }
        const opened = await props.nav.openMeetingWorkspace(r.workspaceId, (sessionId) => {
          seedChat(m.meetingId, sessionId).then((s) => {
            if (!s.seeded)
              toast.push("err", s.message || "这场会的资料没投进去，可以手动发一句。");
          });
        });
        if (!opened)
          toast.push("err", "AI 对话窗没打开，稍后再点一次。");
      } catch (e) {
        toast.push("err", errorText(e));
      } finally {
        setChatBusy(false);
      }
    };
    const [liveEvent, setLiveEvent] = React43.useState(null);
    const [syncPop, setSyncPop] = React43.useState(false);
    const popTimer = React43.useRef(null);
    React43.useEffect(() => {
      return () => {
        if (popTimer.current)
          window.clearTimeout(popTimer.current);
      };
    }, []);
    const selectedIdRef = React43.useRef(selectedId);
    selectedIdRef.current = selectedId;
    const lastPushSyncRef = React43.useRef(0);
    const pushSync = () => {
      const now = Date.now();
      if (now - lastPushSyncRef.current < 30000)
        return;
      lastPushSyncRef.current = now;
      meetings.sync();
    };
    const live = useLiveSync({
      enabled: Boolean(ready),
      onEvent: (e) => {
        setLiveEvent(e);
        if (e.meetingId && e.meetingId === selectedIdRef.current) {
          refreshMeeting(e.meetingId).then((r) => {
            if (r.states)
              setLiveEvent({ ...e, states: r.states });
          });
        }
        pushSync();
      }
    });
    const filtered = React43.useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q)
        return meetings.history;
      return meetings.history.filter((m) => m.subject.toLowerCase().includes(q) || m.meetingCode.includes(q));
    }, [meetings.history, query]);
    const historyReveal = useReveal(filtered, 8);
    const openDetail = (m) => setSelectedId(m.meetingId);
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-surface",
      children: [
        /* @__PURE__ */ jsxDEV("style", {
          dangerouslySetInnerHTML: { __html: styles_default }
        }, undefined, false, undefined, this),
        renderBody(),
        /* @__PURE__ */ jsxDEV(ToastHost, {
          api: toast
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV(CreateDialog, {
          open: createOpen,
          onOpenChange: setCreateOpen,
          toast,
          onCreated: (id) => {
            meetings.reload().then(() => {
              if (id)
                setSelectedId(id);
            });
          }
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV(SwitchAccountDialog, {
          open: switchOpen,
          onOpenChange: setSwitchOpen,
          toast,
          account: status.status?.account ?? "",
          onDone: async () => {
            await status.refresh();
            await meetings.reload();
            setRoute({ kind: "home" });
          }
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
    function renderBody() {
      if (status.loading && !status.status) {
        return /* @__PURE__ */ jsxDEV("div", {
          className: "tm-scroll",
          children: /* @__PURE__ */ jsxDEV(LoadingRow, {
            text: "正在检测会议组件与登录状态…"
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this);
      }
      if (status.error && !status.status) {
        return /* @__PURE__ */ jsxDEV(OperationFailed, {
          message: status.error,
          onRetry: () => void status.refresh()
        }, undefined, false, undefined, this);
      }
      const s = status.status;
      if (!s) {
        return /* @__PURE__ */ jsxDEV(OperationFailed, {
          message: "状态是空的，可能刚启动还没读完。",
          onRetry: () => void status.refresh()
        }, undefined, false, undefined, this);
      }
      if (!isReady(s)) {
        return /* @__PURE__ */ jsxDEV(Guide, {
          status: s,
          toast,
          onRefresh: status.refresh,
          onSwitchAccount: () => setSwitchOpen(true)
        }, undefined, false, undefined, this);
      }
      return renderHome(s);
    }
    function renderHome(s) {
      const syncedText = meetings.syncedAt ? `上次同步 ${formatShort(meetings.syncedAt)}` : "还没同步过";
      const liveItems = meetings.live;
      const soonItems = meetings.upcoming;
      const all = [...liveItems, ...soonItems, ...filtered];
      const selected = all.find((m) => m.meetingId === selectedId) ?? null;
      return /* @__PURE__ */ jsxDEV("div", {
        className: "tm-home",
        children: [
          /* @__PURE__ */ jsxDEV("aside", {
            className: "tm-col-left",
            children: [
              /* @__PURE__ */ jsxDEV("div", {
                className: "tm-col-head",
                children: /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-grow tm-stack",
                  style: { gap: 0 },
                  children: /* @__PURE__ */ jsxDEV("h2", {
                    className: "tm-title",
                    children: "会议"
                  }, undefined, false, undefined, this)
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "tm-left-body",
                children: [
                  /* @__PURE__ */ jsxDEV(Button, {
                    variant: "primary",
                    block: true,
                    onClick: () => setCreateOpen(true),
                    icon: /* @__PURE__ */ jsxDEV(Plus, {
                      size: 14
                    }, undefined, false, undefined, this),
                    children: "新建会议"
                  }, undefined, false, undefined, this),
                  meetings.loading ? /* @__PURE__ */ jsxDEV(Progress, {}, undefined, false, undefined, this) : null,
                  /* @__PURE__ */ jsxDEV("div", {
                    className: "tm-list-toolbar",
                    children: [
                      /* @__PURE__ */ jsxDEV("span", {
                        className: "tm-search",
                        children: [
                          /* @__PURE__ */ jsxDEV("input", {
                            className: "tm-input",
                            autoFocus: false,
                            value: queryDraft,
                            placeholder: "主题或会议号",
                            "aria-label": "搜索会议",
                            onChange: (e) => setQueryDraft(e.target.value),
                            onKeyDown: (e) => {
                              if (e.key === "Escape") {
                                setQueryDraft("");
                                setQuery("");
                              }
                            }
                          }, undefined, false, undefined, this),
                          queryDraft ? /* @__PURE__ */ jsxDEV("button", {
                            type: "button",
                            className: "tm-search-clear",
                            "aria-label": "清空搜索",
                            onClick: () => {
                              setQueryDraft("");
                              setQuery("");
                            },
                            children: "×"
                          }, undefined, false, undefined, this) : null
                        ]
                      }, undefined, true, undefined, this),
                      /* @__PURE__ */ jsxDEV("div", {
                        className: "tm-menu-wrap",
                        children: [
                          /* @__PURE__ */ jsxDEV(IconButton, {
                            label: "筛选",
                            onClick: () => setFilterOpen((v) => !v),
                            children: /* @__PURE__ */ jsxDEV(Filter, {
                              size: 15
                            }, undefined, false, undefined, this)
                          }, undefined, false, undefined, this),
                          filterOpen ? /* @__PURE__ */ jsxDEV("div", {
                            className: "tm-popmenu",
                            role: "menu",
                            style: { right: 0 },
                            children: [
                              /* @__PURE__ */ jsxDEV("div", {
                                className: "tm-popmenu-label",
                                children: "筛选"
                              }, undefined, false, undefined, this),
                              /* @__PURE__ */ jsxDEV("button", {
                                type: "button",
                                role: "menuitem",
                                className: "tm-popmenu-item",
                                "aria-pressed": onlyTranscript,
                                onClick: () => setOnlyTranscript(!onlyTranscript),
                                children: [
                                  /* @__PURE__ */ jsxDEV("span", {
                                    className: "tm-check",
                                    children: onlyTranscript ? "✓" : ""
                                  }, undefined, false, undefined, this),
                                  "只看有转写"
                                ]
                              }, undefined, true, undefined, this)
                            ]
                          }, undefined, true, undefined, this) : null
                        ]
                      }, undefined, true, undefined, this)
                    ]
                  }, undefined, true, undefined, this),
                  meetings.loading && !all.length ? /* @__PURE__ */ jsxDEV(SkeletonRows, {
                    rows: 4
                  }, undefined, false, undefined, this) : null,
                  liveItems.length ? /* @__PURE__ */ jsxDEV(Fragment, {
                    children: [
                      /* @__PURE__ */ jsxDEV("h3", {
                        className: "tm-group-title",
                        children: "进行中"
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("div", {
                        className: "tm-upcoming",
                        children: liveItems.map((m) => /* @__PURE__ */ jsxDEV(MeetingRow, {
                          m,
                          tone: "live",
                          active: m.meetingId === selectedId,
                          onClick: () => setSelectedId(m.meetingId)
                        }, m.meetingId, false, undefined, this))
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this) : null,
                  soonItems.length ? /* @__PURE__ */ jsxDEV(Fragment, {
                    children: [
                      /* @__PURE__ */ jsxDEV("h3", {
                        className: "tm-group-title",
                        children: "即将开始"
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("div", {
                        className: "tm-upcoming",
                        children: soonItems.map((m) => /* @__PURE__ */ jsxDEV(MeetingRow, {
                          m,
                          tone: "soon",
                          active: m.meetingId === selectedId,
                          onClick: () => setSelectedId(m.meetingId)
                        }, m.meetingId, false, undefined, this))
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this) : null,
                  filtered.length ? /* @__PURE__ */ jsxDEV(Fragment, {
                    children: [
                      /* @__PURE__ */ jsxDEV("h3", {
                        className: "tm-group-title",
                        children: "历史会议"
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("div", {
                        className: "tm-upcoming",
                        children: historyReveal.shown.map((m) => /* @__PURE__ */ jsxDEV(MeetingRow, {
                          m,
                          tone: "history",
                          active: m.meetingId === selectedId,
                          onClick: () => setSelectedId(m.meetingId)
                        }, m.meetingId, false, undefined, this))
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this) : null,
                  !meetings.loading && !all.length ? /* @__PURE__ */ jsxDEV(HistoryEmpty, {
                    filtered: onlyTranscript || Boolean(query),
                    hiddenCount: meetings.hiddenByFilter,
                    onClear: () => {
                      setOnlyTranscript(false);
                      setQuery("");
                      setQueryDraft("");
                    },
                    onSync: () => void meetings.sync(),
                    onSearch: query ? `没有匹配「${query}」的会议` : undefined
                  }, undefined, false, undefined, this) : null,
                  /* @__PURE__ */ jsxDEV(RevealMore, {
                    hidden: historyReveal.hidden,
                    total: filtered.length,
                    noun: "场",
                    expanded: historyReveal.expanded,
                    onReveal: historyReveal.reveal,
                    onCollapse: historyReveal.collapse
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV("div", {
                    className: "tm-list-foot",
                    children: [
                      /* @__PURE__ */ jsxDEV("span", {
                        className: "tm-caption",
                        children: [
                          all.length ? `共 ${all.length} 场` : "暂无",
                          meetings.hiddenByFilter ? `，另有 ${meetings.hiddenByFilter} 场被筛选隐藏` : ""
                        ]
                      }, undefined, true, undefined, this),
                      meetings.hasMore && !query && !onlyTranscript ? /* @__PURE__ */ jsxDEV(Button, {
                        size: "sm",
                        variant: "ghost",
                        onClick: () => {
                          meetings.loadEarlier();
                        },
                        disabled: meetings.loadingMore,
                        icon: meetings.loadingMore ? /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(Calendar, {
                          size: 13
                        }, undefined, false, undefined, this),
                        children: meetings.loadingMore ? "正在加载…" : "加载更早的 30 天"
                      }, undefined, false, undefined, this) : !meetings.hasMore && filtered.length && !query && !onlyTranscript ? /* @__PURE__ */ jsxDEV("span", {
                        className: "tm-caption",
                        children: "没有更早的了"
                      }, undefined, false, undefined, this) : null
                    ]
                  }, undefined, true, undefined, this)
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                className: "tm-left-foot",
                children: [
                  /* @__PURE__ */ jsxDEV("span", {
                    className: `tm-led${s.account ? " is-live" : ""}`,
                    "aria-hidden": "true"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV("span", {
                    className: "tm-led-text",
                    title: s.account || undefined,
                    children: s.account ? `已连接 ${s.account}` : "已连接"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV("span", {
                    className: "tm-grow"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV(Button, {
                    size: "sm",
                    variant: "text",
                    onClick: () => setSwitchOpen(true),
                    children: "切换"
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: "tm-col-right",
            children: [
              /* @__PURE__ */ jsxDEV("div", {
                className: "tm-right-head",
                children: [
                  /* @__PURE__ */ jsxDEV("div", {
                    className: "tm-sync",
                    children: [
                      /* @__PURE__ */ jsxDEV("div", {
                        className: `tm-menu-wrap tm-sync-wrap${syncPop ? " is-open" : ""}`,
                        children: [
                          /* @__PURE__ */ jsxDEV(Button, {
                            size: "sm",
                            variant: "ghost",
                            onClick: () => {
                              setSyncPop(true);
                              if (popTimer.current)
                                window.clearTimeout(popTimer.current);
                              popTimer.current = window.setTimeout(() => setSyncPop(false), 6000);
                              meetings.sync().then(() => toast.push("ok", "同步完成。"));
                            },
                            disabled: meetings.loading,
                            icon: meetings.loading ? /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(Refresh, {
                              size: 13
                            }, undefined, false, undefined, this),
                            children: meetings.loading ? "正在同步…" : "同步"
                          }, undefined, false, undefined, this),
                          /* @__PURE__ */ jsxDEV("div", {
                            className: "tm-sync-pop",
                            role: "status",
                            children: [
                              /* @__PURE__ */ jsxDEV("div", {
                                className: "tm-sync-pop-row",
                                children: syncedText
                              }, undefined, false, undefined, this),
                              /* @__PURE__ */ jsxDEV("div", {
                                className: "tm-sync-pop-row",
                                children: live.state === "degraded" ? "实时同步已断开，改为手动刷新" : live.state === "live" ? "实时同步中，会议状态自动更新" : live.state === "connecting" ? "正在连接实时同步…" : "实时同步未开启"
                              }, undefined, false, undefined, this)
                            ]
                          }, undefined, true, undefined, this)
                        ]
                      }, undefined, true, undefined, this),
                      live.state === "live" ? /* @__PURE__ */ jsxDEV("span", {
                        className: "tm-live-dot",
                        title: "实时同步中，会议状态会自动更新",
                        children: [
                          /* @__PURE__ */ jsxDEV("span", {
                            className: "tm-led",
                            "aria-hidden": "true"
                          }, undefined, false, undefined, this),
                          "实时同步中"
                        ]
                      }, undefined, true, undefined, this) : null
                    ]
                  }, undefined, true, undefined, this),
                  /* @__PURE__ */ jsxDEV("div", {
                    className: "tm-grow"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV(TopBar, {
                    toast,
                    onOpenSettings: () => props.nav?.openSettings?.(),
                    onOpenAssistant: openMeetingChat
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this),
              meetings.error ? /* @__PURE__ */ jsxDEV("div", {
                style: { padding: "0 18px 8px" },
                className: "tm-fade-in",
                children: /* @__PURE__ */ jsxDEV(Banner, {
                  tone: "err",
                  icon: /* @__PURE__ */ jsxDEV(Alert, {
                    size: 14
                  }, undefined, false, undefined, this),
                  action: /* @__PURE__ */ jsxDEV(Button, {
                    size: "sm",
                    variant: "ghost",
                    onClick: () => {
                      meetings.sync();
                    },
                    children: "重试"
                  }, undefined, false, undefined, this),
                  children: meetings.error
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this) : null,
              selected ? /* @__PURE__ */ jsxDEV(Detail, {
                meetingId: selected.meetingId,
                brief: selected,
                toast,
                embedded: true,
                liveEvent,
                syncState: live.state,
                onChanged: () => void meetings.reload()
              }, selected.meetingId, false, undefined, this) : /* @__PURE__ */ jsxDEV("div", {
                className: "tm-scroll",
                children: /* @__PURE__ */ jsxDEV(Empty, {
                  title: "选一场会议看详情",
                  desc: "左边列出进行中、即将开始和已结束的会议，点哪场右边就显示哪场。",
                  actions: /* @__PURE__ */ jsxDEV(Button, {
                    size: "sm",
                    variant: "ghost",
                    icon: /* @__PURE__ */ jsxDEV(Refresh, {
                      size: 13
                    }, undefined, false, undefined, this),
                    onClick: () => void meetings.sync(),
                    children: "先同步一次"
                  }, undefined, false, undefined, this)
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this);
    }
  }
  function MeetingRow(props) {
    const { m, tone, active, onClick } = props;
    const meta = tone === "live" ? `进行中 · ${formatRelativeRange(m.startTime, m.endTime)}` : formatRelativeRange(m.startTime, m.endTime);
    return /* @__PURE__ */ jsxDEV("button", {
      type: "button",
      className: `tm-upcoming-item${active ? " is-active" : ""}`,
      onClick,
      "aria-current": active || undefined,
      "aria-label": `${m.subject}，${meta}`,
      children: [
        /* @__PURE__ */ jsxDEV("span", {
          className: "tm-item-text tm-grow",
          children: [
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-item-name",
              children: m.subject
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-item-meta",
              children: [
                /* @__PURE__ */ jsxDEV("span", {
                  children: meta
                }, undefined, false, undefined, this),
                m.hasTranscript ? /* @__PURE__ */ jsxDEV(Badge, {
                  tone: "brand",
                  children: "有转写"
                }, undefined, false, undefined, this) : null,
                m.recordsTotal ? /* @__PURE__ */ jsxDEV("span", {
                  children: [
                    "录制 ",
                    m.recordsTotal
                  ]
                }, undefined, true, undefined, this) : null
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV(ChevronRight, {
          size: 13
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function HistoryEmpty(props) {
    if (props.onSearch) {
      return /* @__PURE__ */ jsxDEV(Empty, {
        title: props.onSearch,
        desc: "换个关键词，或者清掉搜索看全部。",
        actions: /* @__PURE__ */ jsxDEV(Button, {
          size: "sm",
          variant: "ghost",
          onClick: props.onClear,
          children: "清掉筛选"
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this);
    }
    if (props.filtered && props.hiddenCount) {
      return /* @__PURE__ */ jsxDEV(Empty, {
        title: "这些会暂时还没有逐字稿",
        desc: `筛掉了 ${props.hiddenCount} 场本机暂无转写的会；同步后可能就进来了。`,
        actions: /* @__PURE__ */ jsxDEV(Button, {
          size: "sm",
          variant: "ghost",
          onClick: props.onClear,
          children: "取消筛选"
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this);
    }
    return /* @__PURE__ */ jsxDEV(Empty, {
      title: "近 30 天没有已结束的会议",
      desc: "只列你自己账号的会议。同步一次能看到最新的；更早的用下面的「加载更早」。",
      actions: /* @__PURE__ */ jsxDEV(Button, {
        size: "sm",
        variant: "ghost",
        icon: /* @__PURE__ */ jsxDEV(Refresh, {
          size: 13
        }, undefined, false, undefined, this),
        onClick: props.onSync,
        children: "同步一次"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function SwitchAccountDialog(props) {
    const [purge, setPurge] = React43.useState(false);
    const [busy, setBusy] = React43.useState(false);
    const [waiting, setWaiting] = React43.useState(false);
    const [error, setError] = React43.useState("");
    const poll = useAuthPoll(waiting);
    React43.useEffect(() => {
      if (!props.open) {
        setPurge(false);
        setBusy(false);
        setWaiting(false);
        setError("");
      }
    }, [props.open]);
    React43.useEffect(() => {
      if (poll.phase !== "done")
        return;
      let alive = true;
      props.onDone().then(() => {
        if (!alive)
          return;
        setWaiting(false);
        props.onOpenChange(false);
        props.toast.push("ok", "已切换到新账号。");
      });
      return () => {
        alive = false;
      };
    }, [poll.phase, props]);
    const start = async () => {
      setError("");
      setBusy(true);
      try {
        if (purge) {
          try {
            const out = await logout(true);
            if (!out.ok)
              setError(out.message || "旧账号退出没成功，直接登录新账号也可以覆盖。");
          } catch (e) {
            setError(errorText(e));
          }
        }
        const r = await startAuth(true);
        if (r.url && typeof window !== "undefined")
          window.open(r.url, "_blank", "noopener,noreferrer");
        if (!r.ok && !r.url) {
          setError(r.message || "授权没起来，稍后再点一次。");
          setBusy(false);
          return;
        }
        setWaiting(true);
        props.toast.push("info", "授权页已打开，确认后这里会自动切过去。");
      } catch (e) {
        setError(errorText(e));
      } finally {
        setBusy(false);
      }
    };
    const blocking = busy || waiting;
    const stopWaiting = async () => {
      setWaiting(false);
      setError("");
      try {
        await cancelAuth();
        props.toast.push("info", "已停止等待授权，可以重新生成链接。");
      } catch {}
    };
    const close = () => {
      if (waiting) {
        setWaiting(false);
        cancelAuth().catch(() => {});
      }
      props.onOpenChange(false);
    };
    return /* @__PURE__ */ jsxDEV(Dialog2, {
      open: props.open,
      onOpenChange: (next) => {
        if (!next)
          close();
        else
          props.onOpenChange(true);
      },
      title: "切换腾讯会议账号",
      description: props.account ? `当前登录：${props.account}` : "当前还没有登录账号",
      dismissable: true,
      footer: /* @__PURE__ */ jsxDEV(Fragment, {
        children: [
          /* @__PURE__ */ jsxDEV("span", {
            className: "tm-grow",
            children: waiting ? formatWaited(poll.waitedSeconds) : purge ? "勾了清除：本机会议记录会一起删掉。" : "默认保留本机会议记录。"
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: "tm-dialog-acts",
            children: waiting ? /* @__PURE__ */ jsxDEV(Fragment, {
              children: [
                /* @__PURE__ */ jsxDEV(Button, {
                  onClick: () => void stopWaiting(),
                  children: "停止等待"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV(Button, {
                  variant: "subtle",
                  onClick: () => void start(),
                  disabled: busy,
                  children: "重新生成链接"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this) : /* @__PURE__ */ jsxDEV(Fragment, {
              children: [
                /* @__PURE__ */ jsxDEV(Button, {
                  onClick: close,
                  disabled: busy,
                  children: "取消"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV(Button, {
                  variant: purge ? "danger" : "primary",
                  onClick: () => void start(),
                  disabled: busy,
                  icon: busy ? /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(Logout, {
                    size: 13
                  }, undefined, false, undefined, this),
                  children: busy ? "正在切换…" : purge ? "退出并清除后切换" : "去授权切换"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this)
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this),
      children: [
        error ? /* @__PURE__ */ jsxDEV(Banner, {
          tone: "err",
          icon: /* @__PURE__ */ jsxDEV(Alert, {
            size: 14
          }, undefined, false, undefined, this),
          children: error
        }, undefined, false, undefined, this) : null,
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-switch-row",
          children: [
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-switch-text",
              children: [
                /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-switch-title",
                  style: purge ? { color: "var(--dsw-alias-state-error-primary,#dc2626)" } : undefined,
                  children: "清除这个账号下的会议记录"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: `tm-switch-desc${purge ? " " : ""}`,
                  style: purge ? { color: "var(--dsw-alias-state-error-primary,#dc2626)" } : undefined,
                  children: purge ? "会删掉本机的列表快照、逐字稿缓存与已生成的产出，不可恢复。腾讯服务器上的会议不会被删。" : "默认不清除。勾上之后本机缓存会一起删掉，避免看到上个账号的内容。"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ jsxDEV(Switch3, {
              checked: purge,
              onCheckedChange: setPurge,
              disabled: blocking,
              label: "清除这个账号下的会议记录"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        waiting ? /* @__PURE__ */ jsxDEV("div", {
          className: "tm-row",
          role: "status",
          children: [
            /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("span", {
              className: "tm-hint",
              children: "在浏览器里确认授权；这里会自动接上，别关这个弹窗。"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this) : null
      ]
    }, undefined, true, undefined, this);
  }
  function isReady(s) {
    return s.state === "connected" || s.state === "connected-empty" || s.state === "expiring";
  }
  function formatShort(iso) {
    const t = Date.parse(iso);
    if (Number.isNaN(t))
      return iso;
    const d = new Date(t);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  // src/client/settings.tsx
  var React44 = __toESM(require("react"));
  function SettingsView(props) {
    const [prefs, setPrefs] = React44.useState(null);
    const [catalog, setCatalog] = React44.useState(null);
    const [loading, setLoading] = React44.useState(true);
    const [loadError, setLoadError] = React44.useState("");
    const [saving, setSaving] = React44.useState(false);
    const [saveError, setSaveError] = React44.useState("");
    const [savedAt, setSavedAt] = React44.useState(null);
    const [clearing, setClearing] = React44.useState(false);
    const [status, setStatus] = React44.useState(null);
    const [latest, setLatest] = React44.useState(null);
    const [upgrading, setUpgrading] = React44.useState(false);
    const [upgradeError, setUpgradeError] = React44.useState("");
    const load = React44.useCallback(async () => {
      setLoading(true);
      try {
        const [r, st] = await Promise.all([getSettings(), getStatus()]);
        setPrefs(r.prefs);
        setCatalog(r.catalog);
        setStatus(st);
        setLoadError("");
      } catch (e) {
        setLoadError(errorText(e));
      } finally {
        setLoading(false);
      }
      try {
        const v = await getCliLatestVersion();
        setLatest(v.latest);
      } catch {
        setLatest(null);
      }
    }, []);
    React44.useEffect(() => {
      load();
    }, [load]);
    const save = async (patch) => {
      if (!prefs)
        return;
      setSaving(true);
      setSaveError("");
      try {
        const r = await saveSettings(patch);
        setPrefs(r.prefs);
        setSavedAt(Date.now());
        props.toast.push("ok", "设置已保存。");
      } catch (e) {
        const msg = errorText(e);
        setSaveError(msg);
        props.toast.push("err", msg);
      } finally {
        setSaving(false);
      }
    };
    const upgrade = async () => {
      if (!latest)
        return;
      setUpgradeError("");
      setUpgrading(true);
      try {
        const r = await installCli(latest);
        if (!r.ok) {
          setUpgradeError(r.message || "升级没成功，可以按下面的命令自己升一次。");
          return;
        }
        props.toast.push("ok", r.message || `已升级到 ${latest}。`);
        await load();
      } catch (e) {
        setUpgradeError(errorText(e));
      } finally {
        setUpgrading(false);
      }
    };
    const installedVersion = status?.version?.trim() ? status.version.trim() : "";
    const newer = latest && installedVersion && latest !== installedVersion ? latest : null;
    if (loading && !prefs)
      return /* @__PURE__ */ jsxDEV(LoadingRow, {
        text: "正在读取设置…"
      }, undefined, false, undefined, this);
    if (loadError && !prefs) {
      return /* @__PURE__ */ jsxDEV(Banner, {
        tone: "err",
        icon: /* @__PURE__ */ jsxDEV(Alert, {
          size: 14
        }, undefined, false, undefined, this),
        action: /* @__PURE__ */ jsxDEV(Button, {
          size: "sm",
          variant: "ghost",
          onClick: () => void load(),
          children: "重试"
        }, undefined, false, undefined, this),
        children: loadError
      }, undefined, false, undefined, this);
    }
    if (!prefs || !catalog)
      return /* @__PURE__ */ jsxDEV("p", {
        className: "tm-hint",
        children: "没读到设置。"
      }, undefined, false, undefined, this);
    const providers = catalog.models;
    const currentProvider = prefs.provider || catalog.defaultProvider || (providers[0]?.provider ?? "");
    const providerEntry = providers.find((p) => p.provider === currentProvider);
    const modelOptions = [
      { value: "", label: "跟随 DSH 默认模型" },
      ...(providerEntry?.models ?? []).map((m) => ({ value: m.id, label: m.name || m.id }))
    ];
    const agentOptions = [
      { value: "", label: "不指定（单发一次模型调用）" },
      ...catalog.agents.map((a) => ({ value: a.id, label: a.name + (a.isDefault ? "（默认）" : "") }))
    ];
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-settings-inner",
      children: [
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-settings-head",
          children: [
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-stack",
              style: { gap: 2 },
              children: [
                /* @__PURE__ */ jsxDEV("h2", {
                  className: "tm-title",
                  children: "腾讯会议"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV("p", {
                  className: "tm-subtitle",
                  children: "产出用哪个模型、开哪几份技能、组件在哪里，都在这一页。"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-row",
              children: [
                saving ? /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this) : savedAt ? /* @__PURE__ */ jsxDEV("span", {
                  className: "tm-caption",
                  children: "已保存"
                }, undefined, false, undefined, this) : null,
                /* @__PURE__ */ jsxDEV(Button, {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => void load(),
                  icon: /* @__PURE__ */ jsxDEV(Refresh, {
                    size: 13
                  }, undefined, false, undefined, this),
                  children: "重新读取"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this),
        saveError ? /* @__PURE__ */ jsxDEV(Banner, {
          tone: "err",
          icon: /* @__PURE__ */ jsxDEV(Alert, {
            size: 14
          }, undefined, false, undefined, this),
          children: saveError
        }, undefined, false, undefined, this) : null,
        /* @__PURE__ */ jsxDEV(Card, {
          children: [
            /* @__PURE__ */ jsxDEV(CardHeader, {
              title: "生成用的模型",
              sub: "四份会后产出与 AI 认人都用这个模型"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-card-b tm-stack",
              style: { gap: 12 },
              children: [
                /* @__PURE__ */ jsxDEV(Field, {
                  label: "供应商",
                  htmlFor: "tm-set-provider",
                  children: /* @__PURE__ */ jsxDEV(Select, {
                    id: "tm-set-provider",
                    ariaLabel: "模型供应商",
                    value: currentProvider,
                    disabled: saving || !providers.length,
                    onValueChange: (v) => void save({ provider: v, model: "" }),
                    options: providers.length ? providers.map((p) => ({ value: p.provider, label: p.providerName || p.provider })) : [{ value: "", label: "没有可用的供应商", disabled: true }],
                    placeholder: "选择供应商"
                  }, undefined, false, undefined, this)
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV(Field, {
                  label: "模型",
                  htmlFor: "tm-set-model",
                  hint: modelOptions.length <= 1 ? "这个供应商下没读到可选模型，会跟随 DSH 默认。" : undefined,
                  children: /* @__PURE__ */ jsxDEV(Select, {
                    id: "tm-set-model",
                    ariaLabel: "模型",
                    value: prefs.model,
                    disabled: saving,
                    onValueChange: (v) => void save({ provider: currentProvider, model: v }),
                    options: modelOptions,
                    placeholder: "跟随默认"
                  }, undefined, false, undefined, this)
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV(Card, {
          children: [
            /* @__PURE__ */ jsxDEV(CardHeader, {
              title: "agent 预设",
              sub: "选了就委派给这个预设跑；不指定则只单发一次模型调用"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-card-b",
              children: /* @__PURE__ */ jsxDEV(Field, {
                label: "预设",
                htmlFor: "tm-set-agent",
                hint: catalog.agents.length ? "委派不可用时会明确告诉你降级了，不会静默切换。" : "这台机器上没读到 agent 预设，只能用单发模型调用。",
                children: /* @__PURE__ */ jsxDEV(Select, {
                  id: "tm-set-agent",
                  ariaLabel: "agent 预设",
                  value: prefs.agentPreset,
                  disabled: saving || !catalog.agents.length,
                  onValueChange: (v) => void save({ agentPreset: v }),
                  options: agentOptions
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV(Card, {
          children: [
            /* @__PURE__ */ jsxDEV(CardHeader, {
              title: "产出技能",
              sub: "关掉的技能不会注册给助手；已生成的文件不受影响"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-card-b tm-stack",
              style: { gap: 2 },
              children: OUTPUT_KINDS.map((kind, i) => /* @__PURE__ */ jsxDEV(React44.Fragment, {
                children: [
                  i > 0 ? /* @__PURE__ */ jsxDEV(Separator, {}, undefined, false, undefined, this) : null,
                  /* @__PURE__ */ jsxDEV(SwitchRow, {
                    title: OUTPUT_LABELS[kind],
                    desc: skillDesc(kind),
                    checked: prefs.outputSkills.includes(kind),
                    disabled: saving,
                    onCheckedChange: (on) => {
                      const next = new Set(prefs.outputSkills);
                      if (on)
                        next.add(kind);
                      else
                        next.delete(kind);
                      save({ outputSkills: OUTPUT_KINDS.filter((k) => next.has(k)) });
                    }
                  }, undefined, false, undefined, this)
                ]
              }, kind, true, undefined, this))
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV(Card, {
          children: [
            /* @__PURE__ */ jsxDEV(CardHeader, {
              title: "通知与缓存",
              sub: "生成完成时提醒一次；缓存清了不会动你的会议数据"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-card-b tm-stack",
              style: { gap: 2 },
              children: [
                /* @__PURE__ */ jsxDEV(SwitchRow, {
                  title: "生成完成时通知",
                  desc: "关掉就只能自己回到面板看结果。",
                  checked: prefs.notifyOnReady,
                  disabled: saving,
                  onCheckedChange: (on) => void save({ notifyOnReady: on })
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV(Separator, {}, undefined, false, undefined, this),
                /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-row-between",
                  style: { paddingTop: 8 },
                  children: [
                    /* @__PURE__ */ jsxDEV("div", {
                      className: "tm-grow tm-stack",
                      style: { gap: 2 },
                      children: [
                        /* @__PURE__ */ jsxDEV("span", {
                          className: "tm-switch-title",
                          children: "清理本地缓存"
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("span", {
                          className: "tm-switch-desc",
                          children: "清掉列表快照与内容索引，下次进面板会重新同步。"
                        }, undefined, false, undefined, this)
                      ]
                    }, undefined, true, undefined, this),
                    /* @__PURE__ */ jsxDEV(Button, {
                      size: "sm",
                      variant: "ghost",
                      icon: clearing ? /* @__PURE__ */ jsxDEV(Spinner, {}, undefined, false, undefined, this) : /* @__PURE__ */ jsxDEV(Trash, {
                        size: 13
                      }, undefined, false, undefined, this),
                      disabled: clearing,
                      onClick: () => {
                        setClearing(true);
                        clearCache().then(() => props.toast.push("ok", "缓存已清理，下次进面板会重新同步。")).catch((e) => props.toast.push("err", errorText(e))).finally(() => setClearing(false));
                      },
                      children: clearing ? "正在清理…" : "清理"
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this)
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV(Card, {
          children: [
            /* @__PURE__ */ jsxDEV(CardHeader, {
              title: "会议组件",
              sub: "腾讯会议的官方命令行组件，插件不打包它"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-card-b tm-stack",
              style: { gap: 12 },
              children: [
                /* @__PURE__ */ jsxDEV(KeyValues, {
                  rows: [
                    {
                      label: "当前组件",
                      value: /* @__PURE__ */ jsxDEV("code", {
                        style: { fontSize: 12, wordBreak: "break-all" },
                        children: status?.binary || "正在探测…"
                      }, undefined, false, undefined, this)
                    },
                    {
                      label: "版本",
                      value: status?.version ? `${status.version}${status.modern ? "" : "（不支持读取逐字稿）"}` : "未知"
                    }
                  ]
                }, undefined, false, undefined, this),
                newer ? /* @__PURE__ */ jsxDEV("div", {
                  className: "tm-row",
                  style: { justifyContent: "space-between", gap: 8 },
                  children: [
                    /* @__PURE__ */ jsxDEV("span", {
                      className: "tm-hint",
                      style: { margin: 0 },
                      children: [
                        "有新版本可用：",
                        newer
                      ]
                    }, undefined, true, undefined, this),
                    /* @__PURE__ */ jsxDEV(Button, {
                      size: "sm",
                      variant: "subtle",
                      onClick: () => void upgrade(),
                      disabled: upgrading,
                      children: [
                        /* @__PURE__ */ jsxDEV(Refresh, {
                          size: 13
                        }, undefined, false, undefined, this),
                        upgrading ? "正在升级…" : "升级组件"
                      ]
                    }, undefined, true, undefined, this)
                  ]
                }, undefined, true, undefined, this) : null,
                upgradeError ? /* @__PURE__ */ jsxDEV(Banner, {
                  tone: "err",
                  icon: /* @__PURE__ */ jsxDEV(Alert, {
                    size: 14
                  }, undefined, false, undefined, this),
                  children: upgradeError
                }, undefined, false, undefined, this) : null,
                /* @__PURE__ */ jsxDEV("p", {
                  className: "tm-hint",
                  children: "组件路径由部署决定，不能在这里改：要换路径，请改插件的 cordis.patch.yml 再重启插件。想换登录账号，回「腾讯会议」面板，那里有对应的按钮与进度提示。"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV("p", {
          className: "tm-hint",
          children: "偏好写在 DSH 的插件数据目录里（原子写）。保存失败时上一份设置继续有效，不会写坏。"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function SwitchRow(props) {
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-switch-row",
      children: [
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-switch-text",
          children: [
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-switch-title",
              children: props.title
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              className: "tm-switch-desc",
              children: props.desc
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsxDEV(Switch3, {
          checked: props.checked,
          onCheckedChange: props.onCheckedChange,
          disabled: props.disabled,
          label: props.title
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function skillDesc(kind) {
    switch (kind) {
      case "minutes-company":
        return "站在主办方立场整理结论、已确认事项与待办。";
      case "minutes-investor":
        return "站在与会投资人立场抓数据、增长与风险。";
      case "review":
        return "复盘会开得怎么样，给下一场的具体改动。";
      default:
        return "把被问到的问题与回答整理成可复用的清单。";
    }
  }

  // src/client/index.tsx
  var inject = ["slots", "uiWorkspace", "layout"];
  var PANEL_ID = "dsh-tencent-meeting";
  var STYLE_ID = "dsh-tencent-meeting-style";

  class ErrorBoundary extends React45.Component {
    constructor(props) {
      super(props);
      this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
      const e = error;
      return { error: { message: String(e?.message ?? error), stack: String(e?.stack ?? "") } };
    }
    componentDidCatch(error) {
      try {
        const e = error;
        const body = JSON.stringify({
          message: String(e?.message ?? error),
          stack: String(e?.stack ?? ""),
          at: new Date().toISOString()
        });
        fetch("/tmeet/api/debug/error", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body
        }).catch(() => {});
      } catch {}
    }
    render() {
      if (this.state.error) {
        return /* @__PURE__ */ jsxDEV("div", {
          style: {
            padding: 20,
            color: "#b91c1c",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: 13,
            lineHeight: 1.6
          },
          children: [
            /* @__PURE__ */ jsxDEV("div", {
              style: { fontWeight: 600, marginBottom: 8 },
              children: "面板渲染出错了"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsxDEV("div", {
              style: { whiteSpace: "pre-wrap", wordBreak: "break-all" },
              children: this.state.error.message
            }, undefined, false, undefined, this),
            this.state.error.stack ? /* @__PURE__ */ jsxDEV("div", {
              style: {
                marginTop: 10,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                opacity: 0.7
              },
              children: this.state.error.stack
            }, undefined, false, undefined, this) : null
          ]
        }, undefined, true, undefined, this);
      }
      return this.props.children ?? null;
    }
  }
  function MainPanel(props) {
    return /* @__PURE__ */ jsxDEV(ErrorBoundary, {
      children: /* @__PURE__ */ jsxDEV(App, {
        ...props
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function SettingsPanel() {
    return /* @__PURE__ */ jsxDEV(ErrorBoundary, {
      children: /* @__PURE__ */ jsxDEV(SettingsSection, {}, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
  }
  function SidebarIcon(props) {
    return /* @__PURE__ */ jsxDEV(MeetingIcon, {
      size: props.size ?? 16,
      active: props.active
    }, undefined, false, undefined, this);
  }
  function SettingsSection() {
    const toast = useToast();
    return /* @__PURE__ */ jsxDEV("div", {
      className: "tm-surface",
      children: [
        /* @__PURE__ */ jsxDEV("div", {
          className: "tm-pad",
          children: /* @__PURE__ */ jsxDEV(SettingsView, {
            toast,
            compact: true
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV(ToastHost, {
          api: toast
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  function injectStyles2() {
    if (typeof document === "undefined")
      return () => {};
    const existing = document.getElementById(STYLE_ID);
    if (existing) {
      existing.textContent = styles_default;
      return () => {};
    }
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = styles_default;
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }
  function apply(ctx) {
    if (!ctx || !ctx.slots || typeof ctx.slots.inject !== "function" || typeof ctx.slots.register !== "function") {
      console.error("[tmeet] 客户端插槽不可用：请确认 DSH 版本并已启用 client 模块运行时");
      return;
    }
    const effect = typeof ctx.effect === "function" ? ctx.effect : (fn) => void fn();
    const slots = ctx.slots;
    const get = ctx.get;
    const callGet = (name) => {
      try {
        return typeof get === "function" ? get.call(ctx, name) : null;
      } catch {
        return null;
      }
    };
    const nav = {
      openSettings: () => {
        const slots2 = callGet("slots");
        try {
          const entry = slots2?.entries?.("sidebar.settings")?.[0];
          const actions = entry?.store?.create?.()?.actions;
          actions?.openSection?.("dsh-tencent-meeting-settings");
        } catch {}
      },
      openMeetingWorkspace: async (workspaceId, onSessionOpened) => {
        const ui = callGet("uiWorkspace");
        const layout = callGet("layout");
        if (typeof ui?.openWorkspace !== "function") {
          layout?.openRightbar?.(true, false);
          return false;
        }
        try {
          await ui.openWorkspace(workspaceId, (sid) => {
            try {
              onSessionOpened?.(String(sid));
            } catch {}
          });
          layout?.openRightbar?.(true, false);
          return true;
        } catch {
          return false;
        }
      }
    };
    effect(() => injectStyles2(), "tmeet: styles");
    effect(() => slots.inject("main", () => slots.register({ name: "main", key: PANEL_ID }, () => /* @__PURE__ */ jsxDEV(MainPanel, {
      nav
    }, undefined, false, undefined, this))), "tmeet: main");
    effect(() => slots.inject("sidebar.panellist", () => slots.register({ name: "sidebar.panellist", id: PANEL_ID, order: 45, label: () => "腾讯会议" }, SidebarIcon)), "tmeet: sidebar.panellist");
    effect(() => slots.inject("settings.section", () => slots.register({ name: "settings.section", id: `${PANEL_ID}-settings`, order: 62, label: () => "腾讯会议" }, SettingsPanel)), "tmeet: settings.section");
  }
  var client_default = { inject, apply, App, SettingsSection };

  return module.exports
} })
