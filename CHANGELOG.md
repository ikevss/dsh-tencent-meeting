# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Planned work is tracked in [ROADMAP.md](ROADMAP.md).

## [1.4.8] - 2026-11-26

### Changed

- **徽标配色并入主色体系**：「有转写」「有逐字稿」原本用绿色系（淡绿底 + 绿点），现改为品牌色系（与「有回放」「本机粘贴」同一档），全插件的状态标记不再各说各话。
- **去掉两处小圆点**：① 徽标左侧的状态圆点（ok / warn / err 三种都去掉）；② 会议列表行首的状态圆点。列表信息改由时间与文字承担，画面更干净。

## [1.4.7] - 2026-11-26

### Fixed

- **设置页可以上下滚动了**（用户反馈）：滚动样式原本挂在 `.tm-settings` 上，但组件实际渲染的是 `.tm-settings-inner`——那是一条从未被使用的死规则，于是内容一超出就被外层裁掉且拉不动。现在由 `.tm-settings-inner` 自己接管滚动（`overflow-y:auto` + `max-height: calc(100vh - 24px)`），内边距一并迁过来。

## [1.4.6] - 2026-11-26

### Fixed

- **设置页三个下拉改为原生 select**（用户反馈 #1「点击无法显示也无法下拉」）：原实现基于 Radix Select，靠 `pointerdown` 打开弹层；个别桌面宿主的 webview 会吞掉这类指针事件，表现就是点了没反应。换成系统原生控件后走系统弹层，不再依赖该事件链；外观沿用同一套边框 / 圆角 / chevron，选项（供应商 / 模型 / agent 预设）不变。

## [1.4.5] - 2026-11-26

### Fixed

- **对外截图的宿主侧栏已整体打码**：`docs/screenshots/` 下全部图片左侧的 DSH 导航与「工作区」列表（含本机项目名与账号）此前会被一并公开，现已按统一宽度覆盖；README 与 GitHub Pages 使用的是同一批图。

## [1.4.4] - 2026-11-26

### Fixed

- **接口鉴权改为 fail closed**（收录方反馈）：`/tmeet/api` 现在必须拿到宿主的身份校验能力才放行；宿主没提供 `connection.requestRejection`、调用抛错或返回 401/403 时一律拒绝，不再"拿不到校验就照常处理"。

## [1.4.3] - 2026-11-26

### Changed

- **同步状态浮层改为点击触发**：不再 hover 弹出（原先会短暂遮挡会议标题）；点「同步」照样执行同步，同时展开状态卡，6 秒后自动收起。
- **更新界面截图**：`home.png` / `outputs.png` / `create.png` 换为 v1.4.x 新版真实运行图（含限宽正文与新的 chip 样式），人名等敏感信息已打码。GitHub Pages 同步更新图片尺寸标注。

## [1.4.2] - 2026-11-26

### Fixed

- 回退 v1.4.1 中「同步浮层右对齐」的改动：真机实测无效（标题就在按钮下一行，左右都躲不开），保留原样以免留下无效变更。

## [1.4.1] - 2026-11-26

### Fixed

- **建会弹窗的说明与两步流程矛盾**：按钮已是「下一步 / 确认创建」，说明却还写着「点『提交』直接创建」，现已改成「点『下一步』先出预览，确认后才创建」。

### Changed

> 以下为视觉层调整，依据 UI 视觉审查报告的 P0/P1 清单（未改任何交互逻辑）。

- **行长**：会后产出正文由通栏 1140px 收到 `max-width: 860px`，长文不再一行读到视口边缘。
- **「当前项」语义收敛**：产出 chip 选中态去掉灰底改用宿主交互色、字重 600→500；chip 高度统一到 30px 档。
- **元信息去重**：产出卡头删掉与正文重复的「素材 / 模型」，只保留「素材已截断」徽标；正文元信息条改为令牌底色块。
- **入口可发现性**：「更多选项」补 chevron 并在展开时旋转；同步 hover 浮层改为右对齐，不再压住下方会议标题。
- **长列表效率**：逐字稿每次展开从 8 段提到 25 段，展开后显示「已加载 N/M 段」。

## [1.4.0] - 2026-11-26

### Fixed

- **建会弹窗的「提交」此前直连 `confirm:true`**：第②步「确认」永远不出现，与工具层的两阶段和对外承诺都不一致。现在「下一步」先生成预览，再点「确认创建」才提交。
- 逐字稿／纪要预热失败被静默忽略，补注释说明这是有意为之（页签自身会重新请求并显示错误）。

### Added

- **设置页可升级组件**：显示当前 CLI 版本，npm 上有更新时给出「升级组件」按钮；点击后才执行升级并显示进度。后端新增只读接口 `GET /setup/cli-version`（查 npm 最新版，内存缓存 10 分钟，查不到就静默不显示入口）。

## [1.3.4] - 2026-11-26

### Fixed

- 中英两份 README 的「安装 / Install」段落仍残留 v1.3.1 之前的「首次使用自动装好」说法，改为与实现一致的「点一次安装按钮才执行」。
- 详情页配图引用改名后的 `docs/screenshots/outputs.png`（原 `detail.png` 已不存在，之前会显示破图）。

## [1.3.3] - 2026-11-26

### Changed

- **仓库默认 README 改为中文**：GitHub 只渲染根目录的 `README.md`，此前它是英文版、中文版另存为 `README.zh-CN.md`。现在 `README.md` 为简体中文，英文版改名 `README.en.md`，npm 包首页同样显示中文。截图检查清单里的文件名引用同步更新。

## [1.3.2] - 2026-11-25

### Changed

- 兼容声明对齐当前宿主：`package.json` 增加 `engines.dsh = ">=0.2.1"`，README 与 GitHub Pages 落地页注明已在 DSH `0.2.2-rc.5` 实测（`dsh web` 与桌面端均可）。市场索引会据此显示 DSH 版本范围。

## [1.3.1] - 2026-11-25

### Changed

- **全局安装腾讯会议 CLI 改为必须由用户点一次确认才执行**：去掉插件加载后的后台自动安装，缺组件时仍由面板的「安装会议组件」按钮发起，进度与失败原因都在面板里可见。安装会写入系统目录，属于需要明确同意的操作。
- 移除 `autoInstall` 配置项（已无自动路径），README、NOTICE 与市场文案同步改写。

## [1.3.0] - 2026-11-24

### Added

- 五份会后产出的成品 HTML：导出与「在浏览器打开」共用一套自包含模板（文档头、中文易读排版、来源标记徽标、移动端与打印样式），单文件无外部依赖。已有的产出无需重新生成即可导出。

### Changed

- 产出卡片「更多」的下载入口改为 **导出 HTML** 为主，**导出 Markdown** 降为次要入口（需要再编辑或再生成时用）；面板内阅读与「复制正文」仍给 Markdown 原文。

## [1.2.0] - 2026-11-24

第一版开源发布。11-13 → 11-22 的界面改动**尚未在重启后的宿主上真机验证**。

### Added

- 会议洞察分析（`insight`）成为第五份会后产出，对应技能 `tm-output-insight`。
- `tm_review_plan`（判定复盘视角、列素材缺口）与 `tm_review_participation`（发言占比、谁没说话）两个只读工具，工具总数 14。
- AI 对话改为跳转 DSH 工作区会话（`/tmeet/api/meeting/chat-session`），单场会一个固定会话，会议素材落成文件放进会话目录。
- 详情页标题可点击修改（未结束的会同步腾讯，已结束的只改本机）；产出「全屏 / 更多」菜单；复制邀请弹窗；搜索框常驻 + 「只看有转写」筛选；切走再回来停在原位。
- 素材优先级补全：粘贴逐字稿 → 粘贴纪要 → 粘贴待办 → 本机缓存 → 云逐字稿 → 腾讯纪要。
- 所有按会议查询的工具同时接受会议 ID 和 9 位会议号（带空格也行）。

### Changed

- 每日调用限制改为「只计数、不提示、不拦截」：腾讯真实上限是黑盒，本地估的 60 次会误导人。计数满了自动清零；界面里的「今日 x/60」、额度用满横幅、重置按钮、「严格限额」开关一并移除。腾讯真的返回 500246 时仍如实提示。
- CLI 不再随包分发（`vendor/` 移出发布文件，包体从约 21MB 降到约 2MB）：改为首次使用时自动 `npm i -g @tencentcloud/tmeet@1.1.0`，进度显示在面板里，也可在设置关掉自动安装。
- 修 macOS / Linux ARM 上「装好了却找不到二进制」：CLI 的 `dist` 文件名是 `macOS-AppleSilicon` / `macOS-Intel` / `Linux-ARM64`，此前按 Node 的 `Darwin-arm64` 拼名，一个都不匹配。现在按实测命名逐个候选查找，五个平台均已验证。
- 取消会议的确认提示先查出并显示主题、时间、会议号；查不到这场会就不给确认入口。
- 建会改为点一次直接提交。

### Fixed

- 搜会议永远搜不到：腾讯搜索把结果放在 `meetings` 字段，此前未识别。搜索结果的时间也一并补上（字段名为 `scheduled_*_time`）。
- 会议不存在时误报「网络不通」：现在识别腾讯的 9003「会议信息不存在」与 500001「会议号无效」，明确提示没有这场会。
- `tm_meeting_brief` 的产出类型枚举漏了 `insight`，导致洞察生成失败。
- 本机粘贴的纪要 / 待办此前只显示一行来源，现在显示正文。

## [1.1.0] - 2026-11-12

### Added

- 实时事件同步：订阅 5 个腾讯会议事件（会议开始/结束/云录制完成/转写完成/纪要完成），通过 SSE 推送到面板。
- 内容信号层：就绪判据全部改为回读真实内容（转写段落数、时间轴长度、纪要字数、回放地址），不再认腾讯的标记字段。
- 就绪态单调化：晚到或乱序的事件不会把「已就绪」改回「等待」；权限类终态仍允许覆盖。
- 同步档位徽标：页头显示「实时同步中 / 连接中 / 已断开 / 未开启」，降级时明确告知用户改为手动刷新。
- 手动回读接口：详情页可主动刷新一场会议的真实状态。
- 建会/改会/取消后广播本地事件，列表立刻刷新。

### Changed

- 事件触发后一律回读真实状态再广播；事件 payload 中的个人标识不进入状态、不转发给浏览器。
- 500260 / 30002 判为「还没转完」而非取数失败，理由文案与「取数失败」分开。

### Fixed

- 子进程启动改用显式 cmd.exe 调用，消除 Node 的 `shell: true` 参数拼接安全告警（DEP0190）。
- 修复详情页隐式触发受邀人接口导致的额度消耗：改为按需调用。

## [1.0.0] - 2026-11-11

The first release intended for the DSH plugin marketplace. Adds the four post-meeting outputs and the release materials.

### Added

- Four post-meeting outputs generated by the model or agent preset selected in settings: company-view minutes (`minutes-company`), investor-view minutes (`minutes-investor`), review report (`review`) and Q&A list (`qa`).
- Four output skills, each switchable through the `outputSkills` preference and the settings page: `tm-output-company-minutes`, `tm-output-investor-minutes`, `tm-output-review`, `tm-output-qa`.
- `tm_output` tool for generating, reading and deleting outputs, and the matching `/tmeet/api/meeting/output` and `/tmeet/api/meeting/outputs` routes.
- Derived content state on the client (`ContentStates`): replay, transcript, minutes and timeline states, per-kind generation state, disabled tab reasons and a single blocker with an optional action. The server computes it; the client does not.
- Generation material policy: verbatim transcript first, Tencent Meeting smart minutes second, and an explicit "no usable material" result when neither exists. At most three meetings per generation run, with material beyond 60,000 characters truncated and noted in the output.
- Release materials: this changelog, `ROADMAP.md`, `NOTICE`, the English and Chinese READMEs, and the screenshot capture guide.

### Changed

- `tm_meeting_brief` delegates to an agent preset when `agentPreset` is set, and states the degradation explicitly when the `subagents` service is unavailable instead of silently falling back.
- Settings page exposes provider and model as a two-level selection resolved from `ctx.llm`, not a free-text field.
- Meeting detail page adds the outputs tab alongside transcript, minutes, timeline and todos, with a hover-revealed accordion outline pinned to the right edge.

### Fixed

- Meeting update reads the current `auto_record_type` and `auto_asr` values back before patching, so an enterprise-policy override is not silently reset to the CLI default of "do not record".
- Quota exhaustion (`500246`) is reported as a quota error in both the panel and the tools, instead of surfacing as a login failure.
- Error responses never carry a stack trace; the HTTP layer returns `{ error, code }` with an appropriate 4xx status.

## [0.5.0] - 2026-11-11

Functional parity with the superIR implementation. The panel gained every write operation the CLI supports.

### Added

- Meeting create, update and cancel from both the panel and the tools, all two-phase: a preview is rendered first and nothing is submitted without `confirm: true`.
- Invitee management: list, add, remove and replace, through the `/tmeet/api/meeting/invitees` routes and the participants view.
- Local participant list on top of the Tencent Meeting report, plus `POST /meeting/participants/recognize` for AI name matching.
- Recording content: replay address retrieval with the temporary link handed to the system browser, transcript, timeline, smart minutes and todos.
- Recording permission request flow with the `prepare` and `commit` actions, so viewing another organiser's recording is a request rather than a failure.
- Event subscription with graceful degradation: `GET /tmeet/api/events` polls recent events, used to refresh the list and recording status when available.
- `tm_meeting_search` with an automatic clamp when the requested time window exceeds 31 days.
- `tm_meeting_cancel` and `tm_participants` tools.
- Account switching, which runs `tmeet auth logout` first because the CLI rejects a second login while a session is active. The switch dialog does not tick "clear meeting records" by default, and turns the confirmation button red when it is ticked.
- Create-meeting dialog with a meeting-type step followed by the form: subject, date, start time, duration, password, recurrence, join restriction, cloud recording, auto transcription, waiting room, invitees and notes.

### Changed

- Meeting list reads a local snapshot by default with a 10-minute TTL. Live data is fetched only on an explicit sync or the first panel open, which keeps the daily CLI quota intact.
- Detail page no longer prefetches content per row; each tab loads on demand and shows its derived state first.
- Error codes are translated to human-readable messages in `src/cli/errors.ts` rather than surfaced as raw CLI output.

### Fixed

- Account switching left the panel in a stale signed-in state; the flow now reads `auth status` back after logout to confirm.
- The authorisation screen could show a blank pane when the CLI was installed but not signed in; it now renders the guidance state directly.

## [0.1.0] - 2026-11-11

Skeleton release. Proves the plugin loads in DSH and can read meetings; it is not usable as an everyday tool.

### Added

- Package skeleton: `package.json` with the `dsh.bundle.patch` and `dsh.client` blocks, `cordis.patch.yml` inserting a single `dsh-tencent-meeting` entry, `icon.svg`, and the `locale/en.json` and `locale/zh.json` metadata files.
- Host entry exporting `name`, `inject`, `Config` and `apply`. `apply()` only registers; it spawns nothing.
- `Config` schema with all fields defaulted: `tmeetBinary`, `cliVersion`, `autoInstall`, `requestTimeoutMs`, `listCacheTtlMs`, `outputSkills`.
- CLI layer: binary discovery (config, package `dist`, `PATH`, npm global prefix), `--format json` invocation through `execFile`, envelope parsing, version probing, and a command table.
- Authorisation through `tmeet auth login` as a subprocess with the OAuth device-code link forwarded to the user. No credential file is read.
- `/tmeet/api` prefix routes with `ctx.connection.requestRejection` authentication: `status`, `auth/start`, `auth/poll`, `auth/logout`, `meetings`, `meeting`, `settings`.
- Three tools: `tm_status`, `tm_meeting_list`, `tm_meeting_get`. Plus `tm_record_summary`, `tm_meeting_brief` and `tm_plugin_info`.
- Three skills: `tm-schedule`, `tm-meeting-brief`, `tm-meeting-write`.
- Client half registered through `window.__ModuleLoader__.load` with three slots: the sidebar panel icon at order 40, the full-page view under key `tmeet`, and the settings section at order 60.
- Base UI components in the shadcn style on top of Radix primitives for tabs, dialog, dropdown menu and select, because keyboard and focus behaviour cannot be hand-written correctly.
- Settings page with provider, model, agent preset and output-skill switches, persisted to `$DSH_HOME/plugin-data/dsh-tencent-meeting/prefs.json` with an atomic write.
- Not-ready guidance screen that renders a distinct state per condition: CLI missing (with an install button and progress), version too low (with an upgrade button), not signed in (with an authorise button, a waiting state and a regenerate-link action), and authorisation expired.

[Unreleased]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.4.8...HEAD
[1.4.8]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.4.7...v1.4.8
[1.4.7]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.4.6...v1.4.7
[1.4.6]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.4.5...v1.4.6
[1.4.5]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.4.4...v1.4.5
[1.4.4]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.4.3...v1.4.4
[1.4.3]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.4.2...v1.4.3
[1.4.2]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.3.4...v1.4.0
[1.3.4]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.3.3...v1.3.4
[1.3.3]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/ikevss/dsh-tencent-meeting/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ikevss/dsh-tencent-meeting/compare/v0.5.0...v1.0.0
[0.5.0]: https://github.com/ikevss/dsh-tencent-meeting/compare/v0.1.0...v0.5.0
[0.1.0]: https://github.com/ikevss/dsh-tencent-meeting/releases/tag/v0.1.0
