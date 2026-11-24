import { OUTPUT_KINDS } from './shared/types.js';
import { readPrefs } from './prefs.js';
const OPERATION_SKILLS = [
    {
        name: 'tm-schedule',
        description: '查腾讯会议日程：列出近期会议、回答「今天/本周有哪些会」。',
        whenToUse: '用户问会议安排、下一个会、某天有什么会、这场会在哪的时候。',
        content: [
            '# 查腾讯会议日程',
            '',
            '1. 先调 `tm_meeting_list`（默认读本地快照，不消耗接口额度）。用户明显要看最新状态时再传 `refresh:true`。',
            '2. 用户问某一场的具体信息，用 `tm_meeting_get` 传 meetingId 或 meetingCode。',
            '3. 时间一律按用户本地时区表述，不输出 UTC。',
            '4. 返回「还没有登录腾讯会议」时，把三步授权指引原样转述，不要猜账号。'
        ].join('\n')
    },
    {
        name: 'tm-meeting-brief',
        description: '基于会议详情、逐字稿或智能纪要，生成一页会议简报。',
        whenToUse: '用户说「这场会总结一下」「帮我出个纪要」「会上定了什么」的时候。',
        content: [
            '# 生成会议简报',
            '',
            '1. 用 `tm_meeting_get` 确认主题、时间、参会规模。',
            '2. 直接用 `tm_meeting_brief`：它自己会按「逐字稿优先、缺了用智能纪要」取素材，并调 DSH 里配置的模型。',
            '3. 四类产出按用户身份选：公司视角纪要（内部归档）、投资人视角纪要（对外沟通）、复盘报告（改善下一场）、问答清单（答疑归档）。',
            '4. 材料缺失时它会明确说「没有可用素材」，把这个结论原样转述，不要自己编会议内容。',
            '5. 生成后把结论、决议、待办逐条念给用户；正文里有模型名与素材来源，一并说明可信度。'
        ].join('\n')
    },
    {
        name: 'tm-meeting-write',
        description: '创建、修改或取消腾讯会议：先预览，用户确认后才提交。',
        whenToUse: '用户明确说「建个会」「改一下这场会」「把这场会取消」的时候。',
        content: [
            '# 创建 / 修改 / 取消会议',
            '',
            '写操作都是两阶段的，不要跳步：',
            '1. 第一次调用不传 `confirm`，把返回的预览逐条念给用户。',
            '2. 只有用户明确回「确认/可以/建吧」之后，才再调一次并传 `confirm:true`。',
            '3. 建会或改会后传回的结果里若有「被企业策略覆盖」，必须转述哪几项被改了。',
            '',
            '要纪要或逐字稿，必须同时 `cloudRecord:true` 与 `autoTranscribe:true`；只开云录制不保证有转写。',
            '取消会议不可恢复，取消前必须让用户明确确认。'
        ].join('\n')
    }
];
const OUTPUT_SKILLS = {
    insight: {
        name: 'tm-output-insight',
        kind: 'insight',
        description: '会议洞察分析：沟通行为（冲突回避、发言占比、倾听、引导风格），带原话依据与改进动作。和复盘报告看的是两回事——复盘看会议内容，洞察看沟通方式。',
        whenToUse: '用户说「这场会沟通有什么问题」「谁在主导」「有没有该说没说的」「怎么让下次沟通更好」的时候。',
        content: [
            '# 会议洞察分析',
            '',
            '1. 调 `tm_meeting_brief`，`kind` 传 `insight`。',
            '2. 它分析的是沟通行为，不是会议内容：冲突回避、发言占比失衡、填充词与犹豫、积极倾听、引导风格。',
            '3. 发言次数与占比由本机统计给出并标「本机统计，非模型推断」——不要自己重算或编数字。',
            '4. 行为判断必须引用具体原话或时间点做依据（「【引用】…」），推断带置信度（「【推断·中】…」）。',
            '5. 每条建议落到下一场会能做的具体动作。没有逐字稿就看不出填充词，要写进「本次看不出的沟通问题」，不要硬凑。'
        ].join('\n')
    },
    'minutes-company': {
        name: 'tm-output-company-minutes',
        kind: 'minutes-company',
        description: '把一场会议整理成公司视角纪要：结论、讨论要点、已确认事项、待办、未决问题。',
        whenToUse: '用户要内部归档的会议纪要、要「这场会定了什么」的时候。',
        content: [
            '# 公司视角纪要',
            '',
            '1. 调 `tm_meeting_brief`，`kind` 传 `minutes-company`。',
            '2. 产出固定五段：一句话结论 / 讨论要点 / 已确认事项 / 待办（谁、何时）/ 未决问题。',
            '3. 交付前自检：每个待办是否写了责任人与时间；没写的标「未指定」，不要编人。',
            '4. 材料里没有的数字不要补；拿不到数据就写「材料未提及」。'
        ].join('\n')
    },
    'minutes-investor': {
        name: 'tm-output-investor-minutes',
        kind: 'minutes-investor',
        description: '把一场会议整理成投资人视角纪要：关键经营数据、增长驱动、风险、管理层口径。',
        whenToUse: '路演、调研、业绩沟通会之后，要给投资方或投研团队归档的时候。',
        content: [
            '# 投资人视角纪要',
            '',
            '1. 调 `tm_meeting_brief`，`kind` 传 `minutes-investor`。',
            '2. 重点抓：业务与财务口径、增长与风险、管理层前后表述是否一致。',
            '3. 只做信息归纳，不给投资建议，不写目标价。',
            '4. 数据缺失统一写「材料未提及」，禁止估算或引用外部知识补齐。'
        ].join('\n')
    },
    review: {
        name: 'tm-output-review',
        kind: 'review',
        description: '会后复盘报告：整体评价、做得好与该改的地方、时间分配、下一场会的具体改动。',
        whenToUse: '用户说「这场会开得怎么样」「复盘一下这次沟通」的时候。',
        content: [
            '# 会后复盘报告',
            '',
            '1. 先调 `tm_review_plan` 拿判定：这场会判成什么类型、将看哪几项、素材够不够、缺什么怎么补。判定不是最终答案——把类型和理由告诉用户，让用户确认或换一类。',
            '2. 调 `tm_meeting_brief`，`kind` 传 `review`。生成按判定类型的框架看，并在末尾拼上本机统计的参与者贡献（数字以那段为准，不要自己重算）。',
            '3. 报告每段都带来源层级（引用／转写／概括／推断＋置信度）。转述时保留分层，不要揉成一段，让用户能分辨哪句是会上说的、哪句是推断。',
            '4. 「该改的」必须具体到「哪一段、为什么、下次怎么做」，不写空泛评价。',
            '5. 素材不足（无转写／逐字稿太短）时是降级版：按要点写，缺的写进「本次拿不到的信息」，不要编、不要填 0。',
            '6. 用户问「谁没说话／谁在主导」，再调 `tm_review_participation` 补一段。'
        ].join('\n')
    },
    qa: {
        name: 'tm-output-qa',
        kind: 'qa',
        description: '从会议里抽出问答清单：谁问了什么、怎么答的、哪些没答。',
        whenToUse: '用户要「把问题整理一下」「哪些问题没回答」的时候。',
        content: [
            '# 问答清单',
            '',
            '1. 调 `tm_meeting_brief`，`kind` 传 `qa`。',
            '2. 只收材料里真实出现的问答；没有问答就明确说「这场会没有形成问答」。',
            '3. 问题按出现顺序排列，答案只取材料原文要点。',
            '4. 材料里没有明确回答的问题，标成「未回答」——这是这份清单最有价值的部分。'
        ].join('\n')
    }
};
function registerOne(skills, def) {
    try {
        const d = skills.register({
            name: def.name,
            description: def.description,
            whenToUse: def.whenToUse,
            content: def.content,
            source: 'runtime',
            invocation: { modelInvocable: true, userInvocable: true }
        });
        return typeof d === 'function' ? d : () => { };
    }
    catch (e) {
        console.warn(`[tmeet] 技能 ${def.name} 注册失败：${e?.message ?? String(e)}`);
        return () => { };
    }
}
export function registerSkills(ctx) {
    const skills = ctx.get?.('skills');
    if (!skills || typeof skills.register !== 'function')
        return () => { };
    const disposers = [];
    for (const def of OPERATION_SKILLS)
        disposers.push(registerOne(skills, def));
    const prefs = readPrefs();
    const enabled = new Set(prefs.outputSkills.length ? prefs.outputSkills : OUTPUT_KINDS);
    for (const kind of OUTPUT_KINDS) {
        if (!enabled.has(kind))
            continue;
        disposers.push(registerOne(skills, OUTPUT_SKILLS[kind]));
    }
    return () => {
        while (disposers.length) {
            try {
                disposers.pop()?.();
            }
            catch {
                /* 反注册失败不影响卸载 */
            }
        }
    };
}
export const ALL_SKILL_NAMES = [...OPERATION_SKILLS.map((s) => s.name), ...Object.values(OUTPUT_SKILLS).map((s) => s.name)];
