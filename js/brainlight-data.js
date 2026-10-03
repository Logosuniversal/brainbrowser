/*
 * Visual neuroscience content for the Brainlight demonstration.
 * Atlas IDs refer to examples/models/atlas-labels.txt.gz (AAL labels).
 * Functional localizers (FFA, VWFA, MT/V5, PPA) are not provided by this atlas.
 */
(function() {
  "use strict";

  window.BrainlightData = {
    lobes: [
      { id: "occipital", label: "枕叶", color: "#35b6ff" },
      { id: "temporal", label: "颞叶", color: "#cb73ff" },
      { id: "parietal", label: "顶叶", color: "#ffd84a" }
    ],

    regions: [
      {
        id: "visual",
        interior: true,
        color: "#35b6ff",
        short: "Medial occipital",
        name: "枕叶内侧皮层",
        english: "Calcarine cortex, cuneus & lingual gyrus",
        lobe: "occipital",
        atlas: [43, 44, 45, 46, 47, 48],
        description: "距状沟周围皮层、楔叶和舌回为观察视觉皮层提供解剖参照。视觉功能定位研究在枕叶发现多个具有视野位置组织的区域。",
        functions: ["视野位置的皮层表示", "视觉特征加工", "视觉区域间的相互作用"],
        note: "这里高亮的是 AAL 解剖分区，不是 V1、V2 或 V3 的功能边界；区分这些区域通常需要视网膜拓扑定位。",
        evidence: ["wandell2007"],
        view: "back"
      },
      {
        id: "visual-association",
        color: "#ff5c91",
        short: "Occipital",
        name: "枕上回、枕中回与枕下回",
        english: "Superior, middle & inferior occipital gyri",
        lobe: "occipital",
        atlas: [49, 50, 51, 52, 53, 54],
        description: "这些枕叶分区为较广泛的视觉联合皮层提供解剖背景。不同功能区共同参与形态、空间和其他视觉信息的加工。",
        functions: ["视觉形态加工", "视野与空间信息表示", "与其他视觉区域协作"],
        note: "解剖脑回不等同于视觉功能区。此模型不具备 V4、外侧枕叶复合体或 MT/V5 的独立功能定位结果。",
        evidence: ["wandell2007", "grillspector2014"],
        view: "back"
      },
      {
        id: "fusiform",
        color: "#cb73ff",
        short: "Fusiform",
        name: "梭状回",
        english: "Fusiform gyrus",
        lobe: "temporal",
        atlas: [55, 56],
        description: "梭状回位于腹侧颞叶。功能成像在其中及邻近区域发现对面孔、文字等视觉类别具有不同反应偏好的皮层区域。",
        functions: ["面孔相关视觉加工", "熟悉文字形态加工", "视觉类别表示"],
        note: "FFA 和 VWFA 都不是整个梭状回的别名。它们的功能位置、范围与侧化存在差异，双侧高亮仅表示解剖参照。",
        evidence: ["kanwisher1997", "cohen2000", "grillspector2014"],
        view: "bottom"
      },
      {
        id: "inferior-temporal",
        color: "#ff8239",
        short: "Inferior temporal",
        name: "颞下回",
        english: "Inferior temporal gyrus",
        lobe: "temporal",
        atlas: [89, 90],
        description: "颞下回为腹侧视觉系统提供一部分解剖背景。腹侧颞叶的分布式活动与物体形态及类别表征有关。",
        functions: ["复杂视觉形态加工", "物体类别相关表征", "腹侧视觉网络协作"],
        note: "本图显示颞下回的解剖范围，不将整个脑回指定为单一物体、面孔或文字功能区。",
        evidence: ["grillspector2014"],
        view: "left"
      },
      {
        id: "superior-parietal",
        color: "#ffd84a",
        short: "Parietal",
        name: "顶上小叶与楔前叶",
        english: "Superior parietal lobule & precuneus",
        lobe: "parietal",
        atlas: [59, 60, 67, 68],
        description: "视野映射研究在后顶叶的部分皮层中发现了视觉空间组织。这里提供顶叶内侧及上方的解剖参照，不将整块高亮范围视为同一种功能区。",
        functions: ["部分皮层中的视野位置表示", "顶叶功能视野图的空间组织", "功能视野图与解剖分区的区别"],
        note: "视野映射研究发现的顶叶功能区只占本高亮范围的一部分；本图不将整块顶叶区域等同于运动视觉区。",
        evidence: ["wandell2007"],
        view: "top"
      },
      {
        id: "parahippocampal",
        interior: true,
        color: "#45df94",
        short: "PHG",
        name: "海马旁回",
        english: "Parahippocampal gyrus",
        lobe: "temporal",
        atlas: [39, 40],
        description: "海马旁回及邻近腹侧皮层的一部分对场景图像有较强反应，是研究环境视觉加工的重要区域。",
        functions: ["场景相关视觉加工", "局部环境布局表征", "与其他场景选择性区域协作"],
        note: "场景选择性的 PPA 由功能反应定义，不能与整个海马旁回等同；海马旁回也不是海马。",
        evidence: ["epstein1998", "grillspector2014"],
        view: "bottom"
      }
    ],

    scenarios: [
      {
        id: "familiar-face",
        title: "看到一张面孔",
        subtitle: "观察面孔的轮廓、结构与视觉类别。",
        description: "功能成像发现腹侧颞叶存在对面孔较敏感的区域。以下展示相关解剖背景；播放顺序是讲解顺序，不是信号的实际传播路径。",
        evidence: ["kanwisher1997", "grillspector2014", "wandell2007"],
        steps: [
          {
            region: "visual",
            title: "视觉信息的空间组织",
            description: "枕叶视觉区具有视野位置组织，为观察图像提供空间表征。高亮的是较大的内侧枕叶解剖范围。",
            evidence: ["wandell2007"]
          },
          {
            region: "visual-association",
            title: "形态信息的视觉加工",
            description: "枕叶与腹侧颞叶的多个区域共同参与形态和类别加工，不能将面孔识别简化为单一路线。",
            evidence: ["grillspector2014"]
          },
          {
            region: "fusiform",
            title: "面孔选择性反应的解剖背景",
            description: "Kanwisher 等报告了梭状回中对面孔较敏感的功能区域 FFA。本图只显示梭状回，不声称定位到了 FFA。",
            evidence: ["kanwisher1997"]
          },
          {
            region: "inferior-temporal",
            title: "腹侧颞叶的分布式表征",
            description: "面孔视觉加工处于更广泛的腹侧视觉组织中；颞下回高亮提供相邻解剖背景，并非独立的“辨认中心”。",
            evidence: ["grillspector2014"]
          }
        ]
      },
      {
        id: "reading",
        title: "看见书写的文字",
        subtitle: "聚焦文字的视觉形态加工。",
        description: "此场景呈现文字视觉加工的相关发现，不延伸到词义理解或言语输出。左腹侧枕颞区域的功能研究是主要依据。",
        evidence: ["cohen2000", "grillspector2014", "wandell2007"],
        steps: [
          {
            region: "visual",
            title: "表示文字所在的视野位置",
            description: "枕叶视野映射为文字图像的空间组织提供背景；当前模型不单独划定早期视觉功能区。",
            evidence: ["wandell2007"]
          },
          {
            region: "visual-association",
            title: "加工视觉形态",
            description: "枕叶和腹侧视觉区域协作处理视觉模式，文字形态的加工置于这一更广泛的视觉系统中。",
            evidence: ["grillspector2014"]
          },
          {
            region: "fusiform",
            title: "文字形态相关功能发现",
            description: "Cohen 等研究了左侧腹侧枕颞区域的视觉词形加工。VWFA 是功能定义的区域，本图的双侧梭状回高亮不是其边界。",
            evidence: ["cohen2000"]
          }
        ]
      },
      {
        id: "visual-motion",
        title: "观察移动的图形",
        subtitle: "留意图形的移动与空间位置。",
        description: "Tootell 等用功能成像研究了人类 MT 及相关视觉区的运动反应。本模型没有 MT/V5 功能定位，因此只展示枕叶与顶叶的解剖背景。",
        evidence: ["tootell1995", "wandell2007"],
        steps: [
          {
            region: "visual",
            title: "视觉位置的表示",
            description: "视觉皮层中的视野映射为移动图形的位置表示提供基础。这里没有把解剖分区等同于某个功能区。",
            evidence: ["wandell2007"]
          },
          {
            region: "visual-association",
            title: "运动视觉研究的参照",
            description: "人类 MT 及相关区域对视觉运动具有特征性反应。此处高亮枕叶解剖背景，不用整块枕叶代替 MT/V5。",
            evidence: ["tootell1995"]
          },
          {
            region: "superior-parietal",
            title: "顶叶中的视觉空间映射",
            description: "后顶叶部分区域具有视觉空间组织。当前高亮用来认识周边解剖位置，不表示该区域是感知运动的必经节点。",
            evidence: ["wandell2007"]
          }
        ]
      },
      {
        id: "visual-scene",
        title: "观察一个场景",
        subtitle: "看见房间的布局与其中的物体。",
        description: "场景和物体在腹侧视觉系统中呈现不同的反应偏好。海马旁回附近的场景选择性反应，为理解环境视觉加工提供了经典证据。",
        evidence: ["epstein1998", "grillspector2014", "wandell2007"],
        steps: [
          {
            region: "visual",
            title: "场景的视觉空间组织",
            description: "枕叶的视觉空间表征为场景图像提供位置组织。播放中的高亮仅引导观察，不表示单向的先后传递。",
            evidence: ["wandell2007"]
          },
          {
            region: "inferior-temporal",
            title: "场景内物体的视觉表征",
            description: "腹侧颞叶具有与物体类别相关的分布式组织。颞下回高亮用于提供这套系统的部分解剖背景。",
            evidence: ["grillspector2014"]
          },
          {
            region: "parahippocampal",
            title: "环境布局的场景选择性反应",
            description: "Epstein 与 Kanwisher 报告了对局部视觉环境较敏感的区域 PPA；本图显示海马旁回，未提供 PPA 的功能边界。",
            evidence: ["epstein1998"]
          },
          {
            region: "fusiform",
            title: "比较腹侧视觉区域",
            description: "腹侧颞叶的类别选择性区域在空间上呈现系统性组织，但不能用整块解剖脑回代表某一种视觉类别。",
            evidence: ["grillspector2014"]
          }
        ]
      }
    ],

    references: [
      {
        id: "wandell2007",
        authors: "Wandell BA, Dumoulin SO, Brewer AA",
        year: 2007,
        title: "Visual field maps in human cortex",
        journal: "Neuron",
        doi: "10.1016/j.neuron.2007.10.012",
        url: "https://doi.org/10.1016/j.neuron.2007.10.012",
        finding: "综述人类皮层的视野映射，包括枕叶及其他视觉相关区域；支持区分解剖脑回与功能视野图。"
      },
      {
        id: "kanwisher1997",
        authors: "Kanwisher N, McDermott J, Chun MM",
        year: 1997,
        title: "The fusiform face area: a module in human extrastriate cortex specialized for face perception",
        journal: "The Journal of Neuroscience",
        doi: "10.1523/JNEUROSCI.17-11-04302.1997",
        url: "https://doi.org/10.1523/JNEUROSCI.17-11-04302.1997",
        finding: "功能成像显示梭状回中对面孔具有较强反应的区域；该结果不将整个梭状回定义为面孔功能区。"
      },
      {
        id: "cohen2000",
        authors: "Cohen L, Dehaene S, Naccache L, Lehéricy S, Dehaene-Lambertz G, Hénaff MA, Michel F",
        year: 2000,
        title: "The visual word form area: spatial and temporal characterization of an initial stage of reading in normal subjects and posterior split-brain patients",
        journal: "Brain",
        doi: "10.1093/brain/123.2.291",
        url: "https://doi.org/10.1093/brain/123.2.291",
        finding: "研究左侧腹侧枕颞区域的视觉词形加工；为文字视觉场景提供依据，不用于规定动画的真实神经时序。"
      },
      {
        id: "tootell1995",
        authors: "Tootell RBH, Reppas JB, Kwong KK, Malach R, Born RT, Brady TJ, Rosen BR, Belliveau JW",
        year: 1995,
        title: "Functional analysis of human MT and related visual cortical areas using magnetic resonance imaging",
        journal: "The Journal of Neuroscience",
        doi: "10.1523/JNEUROSCI.15-04-03215.1995",
        url: "https://doi.org/10.1523/JNEUROSCI.15-04-03215.1995",
        finding: "通过功能磁共振研究人类 MT 及相关视觉区的运动反应；当前 AAL 表面并未包含该研究的功能定位结果。"
      },
      {
        id: "grillspector2014",
        authors: "Grill-Spector K, Weiner KS",
        year: 2014,
        title: "The functional architecture of the ventral temporal cortex and its role in categorization",
        journal: "Nature Reviews Neuroscience",
        doi: "10.1038/nrn3747",
        url: "https://doi.org/10.1038/nrn3747",
        finding: "综述腹侧颞叶的功能组织及视觉类别表征，强调类别选择性区域与更广泛分布式组织的关系。"
      },
      {
        id: "epstein1998",
        authors: "Epstein R, Kanwisher N",
        year: 1998,
        title: "A cortical representation of the local visual environment",
        journal: "Nature",
        doi: "10.1038/33402",
        url: "https://doi.org/10.1038/33402",
        finding: "报告海马旁回附近对场景和局部视觉环境较敏感的区域 PPA，为场景视觉加工提供功能成像证据。"
      }
    ]
  };
}());
