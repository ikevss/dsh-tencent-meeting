/**
 * 复盘洞察 · 规则层（纯函数，不花模型额度）
 *
 * 职责边界（写死，别越界）：
 *  - 只做「查表 + 计数 + 阈值」：类型初判、素材完整度、版面降级判定。
 *  - 不做归纳、不做评价、不替用户拍板——判定结果只是建议，生成前必须让用户确认或改选。
 *
 * 17 类来自 ikevss-tencentmeeting 的分析框架，仅用于复盘侧（建会模板不做，用户已明确）。
 */
/** 顺序即优先级：高优先级先命中；「路演+投资人」判 2，「路演+客户」判 16 */
export const REVIEW_TYPES = [
    {
        id: 'decision-review',
        name: '决策评审',
        keywords: ['评审', '决策会', '定稿', '拍板', '议定', '立项', '方案评审', '评审会'],
        frame: ['决策类型（快断/深思/犹豫/推迟）', '决策依据', '质量评分', '盲区与未讨论项'],
        insight: '这场会到底定了什么、依据是什么、还有什么没被讨论'
    },
    {
        id: 'investor-relations',
        name: '投资人关系',
        // 注意：不放裸词「路演」——那是泛词，会跟「客户路演」抢；
        // 消歧按「路演+投资人→2，路演+客户→16」，所以只认强特征词。
        keywords: ['投资人', '投关', '股东', '分析师', '业绩说明', '投资人路演', '路演+投资人'],
        frame: ['Q&A 分类', '技术/业务展望', '投资者反馈与诉求'],
        insight: '投资人问了什么、关心什么、反馈是什么'
    },
    {
        id: 'customer-success',
        name: '客户成功',
        keywords: ['客户成功', '客户回访', '续约', '健康度', '客户拜访', '售后', '客户沟通'],
        frame: ['五维健康度（使用深度/满意度/关系/续约/增购）', '流失风险', '下一步动作'],
        insight: '客户的健康度与流失风险'
    },
    {
        id: 'daily-standup',
        name: '每日站会',
        keywords: ['站会', '晨会', '早会', '日报', '每日同步'],
        frame: ['阻塞项', '风险升级', '今日承诺'],
        insight: '谁被什么卡住了、需要谁升级'
    },
    {
        id: 'weekly',
        name: '周会',
        keywords: ['周会', '周例会', '周报', '周度', '本周'],
        frame: ['议题覆盖', '决策效率', '遗留事项'],
        insight: '这周讨论了什么、定了多少、还挂着什么'
    },
    {
        id: 'retrospective',
        name: '复盘会',
        keywords: ['复盘会', '回顾会', '总结会', '复盘'],
        frame: ['对比趋势', '效率评分', '改进项'],
        insight: '和上次比怎么样、哪里可以更好'
    },
    {
        id: 'kickoff',
        name: '启动会',
        keywords: ['启动会', '开工会', '项目启动', 'kickoff'],
        frame: ['目标对齐', '责任矩阵', '里程碑'],
        insight: '目标是否对齐、谁负责什么'
    },
    {
        id: 'strategy',
        name: '战略会',
        keywords: ['战略', '规划会', '三年规划', '愿景', '战略研讨'],
        frame: ['SWOT', '资源分配', '取舍'],
        insight: '取舍与资源投向'
    },
    {
        id: 'sales-followup',
        name: '销售跟进',
        keywords: ['销售', '商机', '客户跟进', '签单', '商务'],
        frame: ['行动项完成率', '客户状态', '下一步'],
        insight: '跟进到哪一步、卡在哪'
    },
    {
        id: 'performance-review',
        name: '绩效面谈',
        keywords: ['绩效', '面谈', '考核', '晋升', '述职'],
        frame: ['目标差距', '改进计划', '双方共识'],
        insight: '差距在哪、怎么改'
    },
    {
        id: 'okr-review',
        name: 'OKR 复盘',
        keywords: ['OKR', '目标复盘', '季度复盘', 'KR'],
        frame: ['完成度', '偏差归因', '下季调整'],
        insight: '目标完成得怎么样、为什么偏了'
    },
    {
        id: 'cross-team-align',
        name: '跨部门对齐',
        keywords: ['跨部门', '对齐', '协同', '拉通', '接口会', '协调会'],
        frame: ['依赖项', '责任边界', '接口约定'],
        insight: '谁依赖谁、边界在哪'
    },
    {
        id: 'brainstorm',
        name: '创意脑暴',
        keywords: ['脑暴', '头脑风暴', '创意', '点子'],
        frame: ['跨学科视角', '创作方向', '可落地项'],
        insight: '有哪些方向、哪些能落地'
    },
    {
        id: 'coaching',
        name: '沟通辅导',
        keywords: ['辅导', '带教', '导师', '反馈会', '谈心'],
        frame: ['七类沟通盲点（表达模糊/打断/话题跳跃/过度解释/情绪化/被动/绝对化）', '改进建议'],
        insight: '沟通方式哪里可以更好'
    },
    {
        id: 'one-on-one',
        name: '一对一',
        keywords: ['一对一', '1on1', '1:1', '单聊'],
        frame: ['反馈质量', '跟进事项', '共识'],
        insight: '双方对齐了什么、接下来做什么'
    },
    {
        id: 'customer-roadshow',
        name: '客户路演',
        keywords: ['客户路演', '产品路演', '推介', '宣讲'],
        frame: ['客户诉求', '异议', '成交信号'],
        insight: '客户想要什么、卡在哪、成交信号强弱'
    },
    {
        id: 'generic',
        name: '无特征',
        keywords: [],
        frame: ['效率评分', '改进建议'],
        insight: '这场会开得怎么样、下次怎么更好'
    }
];
export const GENERIC_TYPE = REVIEW_TYPES[REVIEW_TYPES.length - 1];
const CONFIDENCE_THRESHOLD = 2;
/** 在主题与素材开头里找命中词 */
function hits(def, subject, head) {
    const hay = `${subject}\n${head}`;
    return def.keywords.filter((k) => hay.includes(k));
}
export function planReview(input) {
    const subject = String(input.subject ?? '').trim();
    const head = String(input.materialHead ?? '').slice(0, 2000);
    // 1) 按优先级找命中
    let best = GENERIC_TYPE;
    let bestHits = [];
    const candidateHits = [];
    for (const def of REVIEW_TYPES) {
        if (def.id === GENERIC_TYPE.id)
            continue;
        const words = hits(def, subject, head);
        if (words.length)
            candidateHits.push({ def, words });
        if (words.length && bestHits.length === 0) {
            best = def;
            bestHits = words;
        }
    }
    const confidence = bestHits.length >= CONFIDENCE_THRESHOLD ? 'high' : bestHits.length === 1 ? 'medium' : 'low';
    const reason = bestHits.length > 0
        ? `主题/素材里出现「${bestHits.join('、')}」，按优先级判为「${best.name}」。`
        : subject
            ? `主题「${subject}」没有明显类型特征，先按「无特征」处理；可在生成前换类型。`
            : '没有主题与素材可供判断，先按「无特征」处理；可在生成前换类型。';
    // 低置信度才给候选；命中即停，不给一堆干扰
    const candidates = confidence === 'low'
        ? []
        : candidateHits
            .filter((c) => c.def.id !== best.id)
            .slice(0, 3)
            .map((c) => ({ id: c.def.id, name: c.def.name }));
    const lowCandidates = confidence === 'low'
        ? candidateHits.slice(0, 3).map((c) => ({ id: c.def.id, name: c.def.name }))
        : [];
    const finalCandidates = confidence === 'low' ? lowCandidates : candidates;
    // 2) 完整度与降级
    const available = [];
    const missing = [];
    if (input.hasTranscript)
        available.push(`逐字稿（${input.transcriptChars} 字）`);
    else
        missing.push({
            what: '逐字稿',
            why: '腾讯侧没有可读的云录制转写（可能是别人开的会，或没开云录制）',
            how: '点「粘贴原文」自己补一份，或在有权限时提交查看申请'
        });
    if (input.hasMinutes)
        available.push('腾讯智能纪要');
    if (input.hasTimeline)
        available.push('时间轴');
    if (input.participantCount > 0)
        available.push(`参会人 ${input.participantCount} 人`);
    else
        missing.push({
            what: '参会人名单',
            why: '腾讯侧没返回名单（对方组织的会常见）',
            how: '用「AI 认人」从逐字稿里补，或本机手工补充'
        });
    if (input.durationMin && input.durationMin > 0)
        available.push(`时长 ${input.durationMin} 分钟`);
    if (input.providedByUser)
        missing.push({
            what: '素材来源声明',
            why: `素材来自用户粘贴（${input.providedSource || '未提供来源'}），可能不是完整逐字稿`,
            how: '产出里会写明「据用户提供的原文生成」，不要当成腾讯数据引用'
        });
    // 降级只看主素材（逐字稿）够不够。
    // 名单不进降级条件：腾讯名单没做本地缓存，用它当门槛会让几乎所有会都被误降级；
    // 名单缺失只作为 missing 项提示，贡献分析退化成「按发言人名统计」。
    const enoughTranscript = input.hasTranscript && input.transcriptChars >= 3000;
    const degraded = !enoughTranscript;
    const degradeReason = degraded
        ? !input.hasTranscript
            ? '没有可用的逐字稿（腾讯侧没有可读转写）'
            : `逐字稿不足 3000 字（当前 ${input.transcriptChars} 字），框架性分析会缺乏依据`
        : undefined;
    return {
        type: best.id,
        typeName: best.name,
        confidence,
        reason,
        candidates: finalCandidates,
        frame: best.frame,
        insight: best.insight,
        available,
        missing,
        degraded,
        degradeReason
    };
}
/**
 * 校验模型出的复盘是否守了硬约束。
 * 这是「分层标注不靠模型自觉」的落地点：标记格式写死在提示词里，这里机器核查。
 */
export function validateReviewText(text) {
    const body = String(text ?? '');
    const marks = {
        引用: (body.match(/【引用】/g) || []).length,
        转写: (body.match(/【转写】/g) || []).length,
        概括: (body.match(/【概括】/g) || []).length,
        推断: (body.match(/【推断·[高中低]】/g) || []).length
    };
    const total = marks.引用 + marks.转写 + marks.概括 + marks.推断;
    const issues = [];
    if (total === 0)
        issues.push('全文没有任何来源标记');
    else if (marks.推断 > 0 && marks.引用 + marks.转写 === 0)
        issues.push('只有推断、没有可回溯的原文依据');
    if (!body.includes('本次拿不到'))
        issues.push('缺「本次拿不到的信息」段');
    if (!body.includes('参与者贡献'))
        issues.push('缺「参与者贡献」段');
    return { ok: issues.length === 0, issues, marks };
}
export function typeById(id) {
    return REVIEW_TYPES.find((t) => t.id === id) ?? GENERIC_TYPE;
}
export function collectFacts(store, id, getPasted, peek) {
    const brief = [...(store.snapshot.upcoming ?? []), ...(store.snapshot.history ?? [])].find((m) => m.meetingId === id);
    const pasted = ['transcript', 'minutes', 'todos'].map((k) => getPasted(id, k)).find((m) => m);
    const cloudChars = peek(`${id}:transcript`) ?? 0;
    const hasCloud = Boolean(store.contentIndex[`${id}:transcript`]) || brief?.hasTranscript === true;
    return {
        subject: brief?.subject ?? '',
        materialHead: '',
        hasTranscript: hasCloud || Boolean(pasted),
        transcriptChars: pasted ? pasted.chars : cloudChars,
        hasMinutes: Boolean(store.contentIndex[`${id}:minutes`]),
        participantCount: (store.localParticipants[`people:${id}`] ?? []).length,
        hasTimeline: Boolean(store.contentIndex[`${id}:timeline`]),
        durationMin: brief
            ? Math.max(0, Math.round((Date.parse(brief.endTime) - Date.parse(brief.startTime)) / 60000))
            : undefined,
        providedByUser: Boolean(pasted),
        providedSource: pasted?.source
    };
}
