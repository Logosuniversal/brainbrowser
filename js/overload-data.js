/*
 * Evidence-informed educational content, not a clinical assessment.
 * AAL parcels are anatomical references, not functional localizers or fMRI data.
 * See docs/information-overload-research.md for scope and evidence boundaries.
 */
(function() {
  "use strict";

  window.OverloadData = {
    scope: "以视觉任务为例，解释信息需求超过当前加工与控制能力时，为什么更容易漏看、混淆和切换变慢。信息过载不是一种单独的医学诊断。",
    evidenceNote: "基于经典研究的叙述性梳理，非系统综述。已在线核对 14 篇文献的 DOI 元数据并阅读其中 12 篇摘要；未完成全文审阅。脑区高亮仅为解剖参照；体验记录只反映本轮作答，不是脑活动测量或个人诊断。",

    lobes: [
      { id: "frontal", label: "额叶", color: "#58b5de" },
      { id: "parietal", label: "顶叶", color: "#e3b86c" },
      { id: "limbic", label: "扣带皮层", color: "#72c7a5" },
      { id: "insula", label: "岛叶", color: "#b795e6" },
      { id: "occipital", label: "枕叶", color: "#ed98aa" }
    ],

    regions: [
      {
        id: "lateral-pfc", short: "外侧 PFC", name: "外侧前额叶的解剖参照", color: "#35b6ff",
        english: "Dorsolateral superior frontal & middle frontal gyri",
        lobe: "frontal", atlas: [3, 4, 7, 8], view: "left",
        description: "外侧前额叶参与维持任务目标、规则与上下文，影响其他区域对相关信息的加工。它与顶叶及其他区域共同工作。",
        functions: ["维持目标和任务规则", "参与工作记忆与认知控制", "根据目标调节信息加工"],
        note: "高亮额上回背外侧部分及额中回，不等于完整前额叶或单一“执行控制中心”；容量限制也不只存在于这里。",
        evidence: ["miller2001", "arnsten2009", "aal2002"]
      },
      {
        id: "parietal", short: "顶叶", name: "后顶叶的解剖参照", color: "#ffd84a",
        english: "Superior/inferior parietal, supramarginal, angular gyri & precuneus",
        lobe: "parietal", atlas: [59, 60, 61, 62, 63, 64, 65, 66, 67, 68], view: "top",
        description: "后顶叶的部分区域与额叶协作，参与视觉空间注意、目标选择和任务相关表征。不同顶叶区域具有不同功能。",
        functions: ["视觉空间注意", "任务相关目标选择", "与额叶协作组织注意"],
        note: "这里包含多个较大解剖分区。不能将整片高亮视为背侧注意网络、额顶控制网络或统一的工作记忆仓库。",
        evidence: ["corbetta2002", "aal2002"]
      },
      {
        id: "acc", short: "前扣带", name: "前扣带及旁扣带皮层", color: "#45df94",
        english: "Anterior cingulate & paracingulate gyri",
        lobe: "limbic", atlas: [31, 32], view: "front",
        description: "前扣带皮层的部分区域与表现监控及控制分配有关。“控制的期望价值”理论强调收益、代价和控制需求的综合评估。",
        functions: ["与表现监控相关", "评估控制投入的收益与代价", "参与调整后续控制"],
        note: "ACC 主要位于大脑内侧，不是外侧表面的一块绿色区域。AAL 分区不能独立定位背侧 ACC；相关理论也不是唯一解释。",
        evidence: ["shenhav2013", "aal2002"]
      },
      {
        id: "insula", short: "岛叶", name: "岛叶（前岛叶的解剖背景）", color: "#cb73ff",
        english: "Insula; anatomical context for the anterior insula",
        lobe: "insula", atlas: [29, 30], view: "left",
        description: "前岛叶与显著性网络及内感受有关，有研究模型提出它参与识别显著事件和协调网络间的状态变化。",
        functions: ["前部区域参与显著性加工", "整合部分内感受信息", "与控制及其他网络协作"],
        note: "岛叶藏在外侧裂深处，正常完整外侧表面会遮住它。本图高亮整个岛叶，不能据此定位前岛叶，也不能将其称为唯一的“切换开关”。",
        evidence: ["menon2010", "aal2002"]
      },
      {
        id: "ofc", short: "眶额", name: "眶额皮层的解剖参照", color: "#ff8239",
        english: "Orbital frontal parcels & gyrus rectus",
        lobe: "frontal", atlas: [5, 6, 9, 10, 15, 16, 25, 26, 27, 28], view: "bottom",
        description: "眶额皮层参与结果预期、价值相关学习及任务状态表征。它可帮助理解选择，但不是信息过载的单一核心或通用抑制中心。",
        functions: ["结果预期与价值相关学习", "表征任务状态", "为选择提供情境信息"],
        note: "OFC 位于额叶腹侧。停止反应涉及包括右额下回、前辅助运动区及皮层下结构在内的网络，不能全部归给 OFC。",
        evidence: ["wilson2014", "aron2014", "aal2002"]
      },
      {
        id: "visual", short: "视觉皮层", name: "枕叶视觉加工的解剖参照", color: "#ff5c91",
        english: "Superior, middle & inferior occipital gyri",
        lobe: "occipital", atlas: [49, 50, 51, 52, 53, 54], view: "back",
        description: "视觉信息的加工会受到刺激之间的竞争、显著性及当前任务目标的共同影响。注意会偏置这种竞争。",
        functions: ["视觉信息加工", "刺激之间的竞争", "接受目标相关注意调节"],
        note: "这些是枕叶解剖分区，不是 V1 或其他视觉功能区的边界；研究中的竞争机制也不限于这片区域。",
        evidence: ["desimone1995", "corbetta2002", "aal2002"]
      }
    ],

    mechanisms: [
      {
        id: "competition", title: "注意是一场有偏向的竞争",
        summary: "屏幕上出现的信息，都可能争夺选择机会；目标帮助我们决定优先处理什么。",
        body: "视觉刺激之间会竞争有限的加工资源。外侧前额叶与顶叶等区域共同维持目标并调节注意；醒目的无关内容也可能吸引选择。信息越多不代表必然过载，关键还包括相关性、复杂度、时间压力和任务目标。",
        regions: ["visual", "lateral-pfc", "parietal"],
        evidence: ["desimone1995", "miller2001", "corbetta2002", "eppler2004"],
        takeaway: "先明确当前要找什么，再减少与目标无关的视觉干扰。"
      },
      {
        id: "working-memory", title: "临时保持的信息有限",
        summary: "理解一段信息，常常需要同时记住刚刚看过的内容和当前目标。",
        body: "当任务要求保持、更新和比较多个项目时，工作记忆限制更容易显现。Cowan 综述讨论了特定条件下 3–5 个组块、平均约 4 个的估计；这些条件限制了复述与重新组块等因素。这不是所有人的固定容量，材料、熟悉程度和测量方法都会改变结果。",
        regions: ["lateral-pfc", "parietal"],
        evidence: ["cowan2001", "miller2001"],
        takeaway: "把步骤、关键条件和中间结果放在可见处，减少临时记忆需求。"
      },
      {
        id: "switching", title: "多任务常常需要排队与切换",
        summary: "从读图切到提示、再回到原任务，需要恢复规则与进度。",
        body: "双任务研究显示，某些中央决策阶段存在加工瓶颈；任务切换研究也发现，换任务通常带来时间或准确率代价。不是所有加工都串行，但要求同时选择反应和改变规则时，干扰会更明显。ACC 与前岛叶相关网络参与控制调节，不能化约为一个总开关。",
        regions: ["lateral-pfc", "acc", "insula"],
        evidence: ["dux2006", "monsell2003", "shenhav2013", "menon2010"],
        takeaway: "把同类操作集中处理，给任务切换留出恢复上下文的时间。"
      },
      {
        id: "load-types", title: "“负荷高”有两种不同后果",
        summary: "需要辨认、区分更多任务相关的视觉特征，与脑中同时记着更多事情，并不是同一种负荷。",
        body: "经典负荷理论区分感知负荷与工作记忆／认知控制负荷：在特定选择性注意实验中，高感知负荷可减少无关刺激加工；较高控制负荷则可能增加分心。不能把两者都概括为“信息越多越容易分心”，也不能据此建议把界面塞满。",
        regions: ["visual", "lateral-pfc", "parietal"],
        evidence: ["lavie2004"],
        takeaway: "同时检查界面是否难以辨认，以及任务是否要求记住太多条件。"
      },
      {
        id: "stress", title: "压力会改变控制的工作状态",
        summary: "赶时间、不可控感和压力，有时会让维持目标和灵活思考更困难。",
        body: "研究综述指出，某些急性压力条件下，儿茶酚胺信号变化可削弱前额叶依赖的工作记忆与控制。效应取决于强度、时程、任务和个体；大量细胞机制证据来自动物研究。日常信息过载不等同于脑损伤，也不能用“多巴胺耗尽”解释。",
        regions: ["lateral-pfc"],
        evidence: ["arnsten2009"],
        takeaway: "降低不必要的时间压力，安排暂停与恢复；不能用本演示评估个人脑功能。"
      }
    ],

    corrections: [
      {
        claim: "“前额叶是执行控制中枢。”",
        correction: "可作为入门比喻，但控制来自多个区域和网络的协作。外侧前额叶参与维持目标与规则，不是独自发号施令的司令部。",
        evidence: ["miller2001", "corbetta2002"]
      },
      {
        claim: "“ACC 发现冲突，就提醒系统切换。”",
        correction: "ACC 与表现监控及控制调节有关，但冲突监测不是唯一理论。它主要位于内侧；图中把它直接画在外侧表面，容易造成解剖误解。",
        evidence: ["shenhav2013", "aal2002"]
      },
      {
        claim: "“脑岛是注意切换开关。”",
        correction: "前岛叶是显著性网络的重要节点之一，网络切换是一种研究模型，不是唯一开关。整个岛叶不能替代前岛叶；岛叶位于外侧裂深部。",
        evidence: ["menon2010", "aal2002"]
      },
      {
        claim: "“眶额皮层负责价值评估与冲动抑制。”",
        correction: "价值、结果预期与任务状态表征有关联；把所有冲动抑制归给 OFC 则过度简化。停止反应涉及额叶及皮层下的分布式网络。",
        evidence: ["wilson2014", "aron2014"]
      },
      {
        claim: "“这些脑区不是各自独立工作，而是持续交换信息。”",
        correction: "多区域协作是合理的总体表述。但这张图没有给出连接方向、时序或因果证据，不能据此推断驾驶中某个人的脑活动。",
        evidence: ["corbetta2002", "menon2010"]
      }
    ],

    recommendations: [
      { title: "一次定义一个当前目标", why: "把要找的特征或下一步写清楚，降低无关刺激与目标竞争的机会；这是基于机制的设计建议。", evidence: ["desimone1995", "miller2001"] },
      { title: "把条件与步骤留在屏幕上", why: "用清晰分组、清单和可见中间结果减少工作记忆需求；不把平均约 4 个组块作为通用界面上限。", evidence: ["cowan2001"] },
      { title: "减少无关提示与频繁切换", why: "集中处理同类事项，保留返回原任务的位置与上下文；具体收益取决于任务。", evidence: ["monsell2003", "dux2006"] },
      { title: "同时降低辨认难度和记忆负担", why: "保持标签清楚、层级明确，不用堆满信息来追求实验中高感知负荷的“抗干扰”效应。", evidence: ["lavie2004"] },
      { title: "减少持续催促，允许暂停", why: "降低不必要的时间压力并留出恢复机会；所引机制研究不能给出通用的最佳休息分钟数。", evidence: ["arnsten2009"] }
    ],

    references: [
      {
        id: "eppler2004", authors: "Eppler MJ, Mengis J", year: 2004,
        title: "The concept of information overload: A review of literature from organization science, accounting, marketing, MIS, and related disciplines",
        journal: "The Information Society, 20(5), 325–344", doi: "10.1080/01972240490507974", url: "https://doi.org/10.1080/01972240490507974",
        finding: "将信息过载组织为信息需求与处理能力不匹配的问题，涉及信息特征、任务、个体和环境。",
        evidenceType: "跨学科文献综述", limitation: "不是神经成像研究，也不建立医学诊断标准。"
      },
      {
        id: "desimone1995", authors: "Desimone R, Duncan J", year: 1995,
        title: "Neural mechanisms of selective visual attention",
        journal: "Annual Review of Neuroscience, 18, 193–222", doi: "10.1146/annurev.ne.18.030195.001205", url: "https://doi.org/10.1146/annurev.ne.18.030195.001205",
        finding: "偏置竞争框架解释视觉刺激之间的竞争，以及注意如何偏置选择。",
        evidenceType: "神经科学综述／理论框架", limitation: "大量机制证据来自受控视觉任务及非人灵长类，不能直接给出日常过载阈值。"
      },
      {
        id: "miller2001", authors: "Miller EK, Cohen JD", year: 2001,
        title: "An integrative theory of prefrontal cortex function",
        journal: "Annual Review of Neuroscience, 24, 167–202", doi: "10.1146/annurev.neuro.24.1.167", url: "https://doi.org/10.1146/annurev.neuro.24.1.167",
        finding: "提出前额叶维持目标与上下文表示，并偏置其他区域信息加工的整合理论。",
        evidenceType: "理论综述", limitation: "是功能解释框架，不能把前额叶视为唯一控制中心或从高亮推断实测活动。"
      },
      {
        id: "corbetta2002", authors: "Corbetta M, Shulman GL", year: 2002,
        title: "Control of goal-directed and stimulus-driven attention in the brain",
        journal: "Nature Reviews Neuroscience, 3, 201–215", doi: "10.1038/nrn755", url: "https://doi.org/10.1038/nrn755",
        finding: "综述目标导向和刺激驱动注意的分布式额顶网络组织。",
        evidenceType: "人类注意网络综述", limitation: "功能网络不与 AAL 脑回边界一一对应；不能用本模型精确显示网络节点。"
      },
      {
        id: "cowan2001", authors: "Cowan N", year: 2001,
        title: "The magical number 4 in short-term memory: A reconsideration of mental storage capacity",
        journal: "Behavioral and Brain Sciences, 24(1), 87–114", doi: "10.1017/S0140525X01003922", url: "https://doi.org/10.1017/S0140525X01003922",
        finding: "讨论在限制复述及重新组块等条件下 3–5 个组块、平均约 4 个的短时保持容量估计。",
        evidenceType: "行为证据综述／理论论文", limitation: "不是固定的人类容量，更不是字数、通知数或界面卡片数的通用上限。"
      },
      {
        id: "dux2006", authors: "Dux PE, Ivanoff J, Asplund CL, Marois R", year: 2006,
        title: "Isolation of a central bottleneck of information processing with time-resolved fMRI",
        journal: "Neuron, 52(6), 1109–1120", doi: "10.1016/j.neuron.2006.11.009", url: "https://doi.org/10.1016/j.neuron.2006.11.009",
        finding: "双任务时间分辨 fMRI 研究支持中央信息加工瓶颈，关联后部外侧前额叶的加工延迟。",
        evidenceType: "人类双任务行为＋fMRI 原始研究", limitation: "特定反应选择范式；BOLD 是间接测量，不能说整个大脑只能串行处理。"
      },
      {
        id: "monsell2003", authors: "Monsell S", year: 2003,
        title: "Task switching",
        journal: "Trends in Cognitive Sciences, 7(3), 134–140", doi: "10.1016/S1364-6613(03)00028-7", url: "https://doi.org/10.1016/S1364-6613(03)00028-7",
        finding: "切换任务通常产生反应时间或错误率代价；准备可以减轻但常不能完全消除。",
        evidenceType: "行为与认知机制综述", limitation: "效应依赖准备时间、规则、练习等，不能给出固定的生产力损失百分比。"
      },
      {
        id: "lavie2004", authors: "Lavie N, Hirst A, de Fockert JW, Viding E", year: 2004,
        title: "Load theory of selective attention and cognitive control",
        journal: "Journal of Experimental Psychology: General, 133(3), 339–354", doi: "10.1037/0096-3445.133.3.339", url: "https://doi.org/10.1037/0096-3445.133.3.339",
        finding: "区分感知负荷和认知控制负荷：两者对无关刺激干扰可能有不同方向的效应。",
        evidenceType: "行为实验＋理论论证", limitation: "结论依赖操作定义和任务条件；“屏幕更满”不等于实验意义上的感知负荷。"
      },
      {
        id: "shenhav2013", authors: "Shenhav A, Botvinick MM, Cohen JD", year: 2013,
        title: "The expected value of control: An integrative theory of anterior cingulate cortex function",
        journal: "Neuron, 79(2), 217–240", doi: "10.1016/j.neuron.2013.07.007", url: "https://doi.org/10.1016/j.neuron.2013.07.007",
        finding: "提出背侧前扣带综合控制收益、需求和代价，参与控制分配的理论。",
        evidenceType: "计算理论／整合综述", limitation: "不是唯一的 ACC 理论；相关区域亚区功能不同，不能从活动反推“发现冲突”。"
      },
      {
        id: "menon2010", authors: "Menon V, Uddin LQ", year: 2010,
        title: "Saliency, switching, attention and control: A network model of insula function",
        journal: "Brain Structure and Function, 214, 655–667", doi: "10.1007/s00429-010-0262-0", url: "https://doi.org/10.1007/s00429-010-0262-0",
        finding: "提出前岛叶参与显著事件检测、控制及大尺度网络协调的模型。",
        evidenceType: "网络模型／综述", limitation: "模型强调前岛叶及网络协作；不是证明整个岛叶是唯一的因果切换开关。"
      },
      {
        id: "arnsten2009", authors: "Arnsten AFT", year: 2009,
        title: "Stress signalling pathways that impair prefrontal cortex structure and function",
        journal: "Nature Reviews Neuroscience, 10, 410–422", doi: "10.1038/nrn2648", url: "https://doi.org/10.1038/nrn2648",
        finding: "综述压力通过儿茶酚胺等机制影响前额叶功能，并区分急性与长期压力相关效应。",
        evidenceType: "人类及动物研究综述", limitation: "细胞机制大量来自动物；普通信息过载不能等同于慢性压力、神经元损伤或递质耗尽。"
      },
      {
        id: "wilson2014", authors: "Wilson RC, Takahashi YK, Schoenbaum G, Niv Y", year: 2014,
        title: "Orbitofrontal cortex as a cognitive map of task space",
        journal: "Neuron, 81(2), 267–279", doi: "10.1016/j.neuron.2013.11.005", url: "https://doi.org/10.1016/j.neuron.2013.11.005",
        finding: "提出 OFC 表征任务状态的框架，用以整合其在学习和决策中的多种作用。",
        evidenceType: "理论综述", limitation: "任务状态表征是理论框架，不能据此将 OFC 定义为通用抑制中心。"
      },
      {
        id: "aron2014", authors: "Aron AR, Robbins TW, Poldrack RA", year: 2014,
        title: "Inhibition and the right inferior frontal cortex: One decade on",
        journal: "Trends in Cognitive Sciences, 18(4), 177–185", doi: "10.1016/j.tics.2013.12.003", url: "https://doi.org/10.1016/j.tics.2013.12.003",
        finding: "综述右额下回及相关网络在反应停止与抑制中的证据。",
        evidenceType: "机制综述", limitation: "反应停止不等于所有形式的冲动控制；右额下回及相关网络的具体解释存在讨论。"
      },
      {
        id: "aal2002", authors: "Tzourio-Mazoyer N et al.", year: 2002,
        title: "Automated anatomical labeling of activations in SPM using a macroscopic anatomical parcellation of the MNI MRI single-subject brain",
        journal: "NeuroImage, 15(1), 273–289", doi: "10.1006/nimg.2001.0978", url: "https://doi.org/10.1006/nimg.2001.0978",
        finding: "介绍 AAL 宏观解剖分区，为本项目标签的解剖含义提供背景。",
        evidenceType: "图谱方法论文", limitation: "宏观解剖分区不是注意、控制或视觉功能区的个体定位；模型数据来源以仓库文件为准。"
      }
    ]
  };
}());
