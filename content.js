// Tutorial content grounded in XLXL 1.1.2. This module intentionally has no network dependency.
const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const code = (lang, value) => `<pre data-lang="${escapeHtml(lang)}"><code>${escapeHtml(value.trim())}</code></pre>`;
const table = (headers, rows) => `<table><thead><tr>${headers.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const note = (html, warning = false) => `<div class="note${warning ? ' warning' : ''}">${html}</div>`;
const link = (id, title) => `<a href="#/docs/${id}">${title}</a>`;
const section = (id, title, html) => ({ id, title, html });
const article = (id, group, title, description, minutes, level, tags, sections) => ({ id, group, title, description, minutes, level, tags, sections });

export const groups = [
  { id: 'start', title: '开始使用', items: ['install', 'quickstart', 'workspace'] },
  { id: 'project-group', title: '工程与工具链', items: ['project', 'toolchains'] },
  { id: 'editor', title: '代码编辑', items: ['editing', 'formatting', 'diagnostics'] },
  { id: 'modules', title: '模块与信号', items: ['testbench', 'module-docs', 'module-graph', 'signal-tracing'] },
  { id: 'simulation-group', title: '仿真与波形', items: ['simulation', 'waveform', 'wave-mcp'] },
  { id: 'build', title: 'FPGA 构建', items: ['vendor', 'build-reports'] },
  { id: 'reference', title: '参考与排错', items: ['settings', 'commands', 'faq'] },
];

const projectExample = `{
  "name": "xlxl-counter-demo",
  "topModule": "counter",
  "simulationTopModule": "tb_counter",
  "sources": ["rtl/**/*.v"],
  "simulationSources": ["sim/**/*.v"],
  "includePaths": [],
  "defines": []
}`;
const generatedProjectTree = `工作区根目录/
├─ .xlxl/
│  ├─ project.json
│  ├─ lint/
│  │  ├─ vivado/
│  │  └─ questa/
│  ├─ toolchain/
│  └─ sim/
├─ doc/
├─ prj/
├─ constraints/
├─ rvl/
├─ rtl/
├─ sim/
├─ ip/
├─ fw/
└─ include/`;
const formatExample = `{
  "[verilog]": {
    "editor.defaultFormatter": "zhaiyl.xlxl",
    "editor.formatOnSave": true
  },
  "[systemverilog]": {
    "editor.defaultFormatter": "zhaiyl.xlxl",
    "editor.formatOnSave": true
  },
  "xlxl.formatter.style": "kr",
  "xlxl.formatter.indentSize": 4,
  "xlxl.formatter.columnLimit": 100
}`;

// Snapshot generated from package.json at authoring time.
const settingsCatalog = [
  {
    "title": "XLXL：工具路径与检测",
    "rows": [
      {
        "key": "xlxl.toolSearchPaths",
        "default": [],
        "description": "工具安装目录或其父目录，例如 G:\\EDA。供自动检测、语法检查、工程创建和构建使用；无需修改 PATH。具体工具的路径设置优先。",
        "enum": []
      },
      {
        "key": "xlxl.vivadoPath",
        "default": "",
        "description": "旧版 Vivado 路径设置，仅当 xlxl.xvlogPath 留空时作为语法检查回退。新配置请使用 xlxl.xvlogPath。",
        "enum": []
      },
      {
        "key": "xlxl.xvlogPath",
        "default": "",
        "description": "Vivado xvlog.bat 可执行文件、bin 目录或安装根目录。留空时自动扫描；此设置优先于 xlxl.vivadoPath。",
        "enum": []
      },
      {
        "key": "xlxl.modelsimPath",
        "default": "",
        "description": "ModelSim vlog.exe、vsim.exe、bin/win64 目录或安装根目录。留空时自动扫描；与 QuestaSim 分别检测。",
        "enum": []
      },
      {
        "key": "xlxl.questaPath",
        "default": "",
        "description": "QuestaSim vlog.exe、bin/win64 目录或安装根目录。留空时自动扫描；此设置优先于旧版 Questa 路径。",
        "enum": []
      },
      {
        "key": "xlxl.questaVlogPath",
        "default": "",
        "description": "旧版 Questa vlog 路径设置，仅当 xlxl.questaPath 留空时回退使用。",
        "enum": []
      },
      {
        "key": "xlxl.questaSimPath",
        "default": "",
        "description": "旧版 Questa 工具链路径设置，仅当 xlxl.questaPath 与 xlxl.questaVlogPath 留空时回退使用。",
        "enum": []
      },
      {
        "key": "xlxl.iverilogPath",
        "default": "",
        "description": "Icarus iverilog.exe 可执行文件、bin 目录或安装根目录。留空时自动扫描。",
        "enum": []
      },
      {
        "key": "xlxl.vvpPath",
        "default": "",
        "description": "Icarus vvp 运行器可执行文件或其目录。留空时使用所检测到的 iverilog 同目录中的 vvp。",
        "enum": []
      }
    ]
  },
  {
    "title": "XLXL：语法检查与语义服务",
    "rows": [
      {
        "key": "xlxl.syntaxTool",
        "default": "vivado",
        "description": "选择保存后和手动检查时使用的语法工具：Vivado、ModelSim、QuestaSim 或 Icarus Verilog。",
        "enum": [
          "vivado",
          "modelsim",
          "questa",
          "iverilog"
        ]
      },
      {
        "key": "xlxl.checkOnSave",
        "default": true,
        "description": "保存 Verilog/SystemVerilog 文件后使用所选语法工具检查。",
        "enum": []
      },
      {
        "key": "xlxl.semantic.enabled",
        "default": true,
        "description": "启用 Slang 语义语言服务；语法工具检查仍可单独运行。",
        "enum": []
      },
      {
        "key": "xlxl.semantic.serverPath",
        "default": "",
        "description": "slang-server 可执行文件路径；相对路径基于工作区。留空时 Windows x64 使用插件内置版本。",
        "enum": []
      },
      {
        "key": "xlxl.inlineDiagnostics.mode",
        "default": "auto",
        "description": "HDL 错误仅在行尾显示；警告保留原生波浪线及悬停提示。自动模式在 Error Lens 可用时让其显示。",
        "enum": [
          "auto",
          "on",
          "off"
        ]
      },
      {
        "key": "xlxl.inlineDiagnostics.maxLength",
        "default": 160,
        "description": "错误行尾文字最大字符数；悬停仍显示完整消息。",
        "enum": [],
        "minimum": 40,
        "maximum": 500
      },
      {
        "key": "xlxl.portDirectionHints",
        "default": true,
        "description": "在 HDL 实例连接处显示虚拟端口方向箭头：输入 ←、输出 →、双向 ↔。",
        "enum": []
      }
    ]
  },
  {
    "title": "XLXL：格式化",
    "rows": [
      {
        "key": "xlxl.formatter.path",
        "default": "",
        "description": "Verible 格式化程序的绝对路径。留空时 Windows x64 使用插件内置版本；其他平台从 PATH 查找。",
        "enum": []
      },
      {
        "key": "xlxl.formatter.indentSize",
        "default": 0,
        "description": "格式化输出的空格缩进数，整数 1–16；0 跟随编辑器 Tab Size。Verible 始终输出空格。",
        "enum": [],
        "minimum": 0,
        "maximum": 16
      },
      {
        "key": "xlxl.formatter.style",
        "default": "kr",
        "description": "选择 Verilog 和 SystemVerilog 格式化样式。缩进宽度由 Indent Size 或编辑器 Tab Size 决定。",
        "enum": [
          "kr",
          "ansi",
          "gnu"
        ]
      },
      {
        "key": "xlxl.formatter.columnLimit",
        "default": 100,
        "description": "格式化目标行宽；不会强制拆分所有长行。",
        "enum": [],
        "minimum": 40,
        "maximum": 500
      },
      {
        "key": "xlxl.formatter.alignPorts",
        "default": true,
        "description": "对齐多行端口声明和参数；例化端口连接按首行间距对齐左右括号。",
        "enum": []
      },
      {
        "key": "xlxl.formatter.alignAssignments",
        "default": true,
        "description": "连续的单行赋值按首行间距对齐 = 或 <=，不跨空行、注释或控制语句。",
        "enum": []
      }
    ]
  },
  {
    "title": "XLXL：仿真与波形",
    "rows": [
      {
        "key": "xlxl.simulationTimeout",
        "default": 120,
        "description": "仿真编译或运行的最长时间（秒）。",
        "enum": [],
        "minimum": 1
      },
      {
        "key": "xlxl.openWaveformAfterSimulation",
        "default": true,
        "description": "仿真成功后打开本次新增或更新的 VCD 波形。",
        "enum": []
      },
      {
        "key": "xlxl.waveMcp.backend",
        "default": "native",
        "description": "wave-mcp 运行环境；Windows 可选择 WSL，Remote WSL 窗口中使用 native。",
        "enum": [
          "native",
          "wsl"
        ]
      },
      {
        "key": "xlxl.waveMcp.pythonPath",
        "default": "",
        "description": "已安装 wave-mcp 的 Python 可执行文件。WSL 模式填写 Linux 路径；留空从 PATH 查找。",
        "enum": []
      },
      {
        "key": "xlxl.waveMcp.wslDistribution",
        "default": "",
        "description": "WSL 发行版名称；留空使用默认发行版。",
        "enum": []
      },
      {
        "key": "xlxl.waveMcp.timeout",
        "default": 180,
        "description": "wave-mcp 单次分析请求的超时时间（秒）。",
        "enum": [],
        "minimum": 10,
        "maximum": 3600
      },
      {
        "key": "xlxl.waveMcp.afterSimulation",
        "default": false,
        "description": "仿真成功后将本次生成的 VCD 交给 wave-mcp 分析。",
        "enum": []
      }
    ]
  },
  {
    "title": "XLXL：厂商工程与构建",
    "rows": [
      {
        "key": "xlxl.buildReport.openAfterBuild",
        "default": true,
        "description": "厂商构建结束后自动打开本次构建报告；失败和超时也保留报告。",
        "enum": []
      },
      {
        "key": "xlxl.diamondPath",
        "default": "",
        "description": "Lattice Diamond pnmain.exe/diamond 可执行文件、bin 目录或安装根目录。留空自动扫描。",
        "enum": []
      },
      {
        "key": "xlxl.anlogicPath",
        "default": "",
        "description": "安路 TangDynasty td.exe 可执行文件、bin 目录或安装根目录。留空自动扫描。",
        "enum": []
      },
      {
        "key": "xlxl.pdsPath",
        "default": "",
        "description": "紫光同创 PDS/PDS Lite 的 pds.exe、pds_shell.exe、bin 目录或安装根目录。创建和构建自动使用 pds_shell。",
        "enum": []
      },
      {
        "key": "xlxl.pdsLicensePath",
        "default": "",
        "description": "PDS 许可证文件或端口@服务器，仅传给厂商子进程；留空继承 PANGO_LICENSE_FILE 或查找安装目录附近唯一的 .lic。",
        "enum": []
      },
      {
        "key": "xlxl.diamondLicensePath",
        "default": "",
        "description": "Diamond 许可证文件或端口@服务器，仅在厂商创建/构建时设置 LM_LICENSE_FILE；留空继承环境。",
        "enum": []
      },
      {
        "key": "xlxl.anlogicLicensePath",
        "default": "",
        "description": "TangDynasty 许可证文件或端口@服务器，仅在厂商创建/构建时设置 LM_LICENSE_FILE；留空继承环境。",
        "enum": []
      },
      {
        "key": "xlxl.vendorBuildTimeout",
        "default": 7200,
        "description": "厂商 FPGA 构建超时秒数；默认 2 小时，超时终止该次构建进程树。",
        "enum": [],
        "minimum": 1,
        "maximum": 86400
      }
    ]
  },
  {
    "title": "XLXL：工程源文件发现",
    "rows": [
      {
        "key": "xlxl.sourceGlobs",
        "default": [
          "rtl/**/*.{v,vh,sv,svh}",
          "ip/**/*.{v,vh,sv,svh}"
        ],
        "description": "未配置工程文件时，查找 Verilog/SystemVerilog 源文件的后备 glob 模式。",
        "enum": []
      }
    ]
  }
];
const commandCatalog = [
  {
    "command": "xlxl.traceSignal",
    "title": "XLXL：追踪信号"
  },
  {
    "command": "xlxl.refreshSignalTrace",
    "title": "XLXL：重新追踪信号"
  },
  {
    "command": "xlxl.clearSignalTrace",
    "title": "XLXL：清空信号追踪"
  },
  {
    "command": "xlxl.createTestbench",
    "title": "XLXL: Create Testbench"
  },
  {
    "command": "xlxl.previewModuleDocumentation",
    "title": "XLXL: Preview Module Documentation"
  },
  {
    "command": "xlxl.exportModuleDocumentation",
    "title": "XLXL: Export Module Documentation"
  },
  {
    "command": "xlxl.showModuleGraph",
    "title": "XLXL: Show RTL Module Graph"
  },
  {
    "command": "xlxl.showBuildReport",
    "title": "XLXL: Show Latest Build Report"
  },
  {
    "command": "xlxl.analyzeBuildReport",
    "title": "XLXL: Analyze Existing Build Reports"
  },
  {
    "command": "xlxl.attachPdsProject",
    "title": "XLXL: Attach PDS Project"
  },
  {
    "command": "xlxl.restartSemanticServer",
    "title": "XLXL: Restart Semantic Server"
  },
  {
    "command": "xlxl.showSemanticLog",
    "title": "XLXL: Show Semantic Log"
  },
  {
    "command": "xlxl.initializeProject",
    "title": "XLXL: Initialize Project"
  },
  {
    "command": "xlxl.refreshProject",
    "title": "XLXL: Refresh Project"
  },
  {
    "command": "xlxl.analyzeHierarchy",
    "title": "XLXL: Analyze Module Hierarchy"
  },
  {
    "command": "xlxl.setTopModule",
    "title": "XLXL: Set Top Module"
  },
  {
    "command": "xlxl.detectToolchains",
    "title": "XLXL: Detect Toolchains"
  },
  {
    "command": "xlxl.configureVendor",
    "title": "XLXL: Configure FPGA Vendor Flow"
  },
  {
    "command": "xlxl.buildVendor",
    "title": "XLXL: Build FPGA Bitstream"
  },
  {
    "command": "xlxl.checkCurrentFile",
    "title": "XLXL: Check Current HDL File"
  },
  {
    "command": "xlxl.checkProject",
    "title": "XLXL: Check HDL Project"
  },
  {
    "command": "xlxl.simulateProject",
    "title": "XLXL: Simulate Project with Icarus"
  },
  {
    "command": "xlxl.clearDiagnostics",
    "title": "XLXL: Clear HDL Diagnostics"
  },
  {
    "command": "xlxl.applyHdlColors",
    "title": "XLXL: Apply HDL Contrast Colors"
  },
  {
    "command": "xlxl.setSimulationTopModule",
    "title": "XLXL: Set Simulation Top Module"
  },
  {
    "command": "xlxl.syncVendorProject",
    "title": "XLXL: Sync Vendor Project"
  },
  {
    "command": "xlxl.openWaveform",
    "title": "XLXL: Open VCD Waveform"
  },
  {
    "command": "xlxl.selectSyntaxTool",
    "title": "XLXL: Select Syntax Checker"
  },
  {
    "command": "xlxl.configureSyntaxToolPath",
    "title": "XLXL: Configure Syntax Checker Path"
  },
  {
    "command": "xlxl.configureWaveMcp",
    "title": "XLXL: Configure Wave MCP"
  },
  {
    "command": "xlxl.checkWaveMcp",
    "title": "XLXL: Check Wave MCP Connection"
  },
  {
    "command": "xlxl.analyzeWaveWithMcp",
    "title": "XLXL: Analyze Waveform with Wave MCP"
  },
  {
    "command": "xlxl.queryWaveMcp",
    "title": "XLXL: Query Wave MCP"
  },
  {
    "command": "xlxl.openWaveMcpViewer",
    "title": "XLXL: Open Wave MCP Viewer"
  },
  {
    "command": "xlxl.stopWaveMcp",
    "title": "XLXL: Stop Wave MCP"
  },
  {
    "command": "xlxl.waveMcpHelp",
    "title": "XLXL: Wave MCP Setup Guide"
  },
  {
    "command": "xlxl.exportWaveMcpConfig",
    "title": "XLXL: Export Wave MCP Configuration"
  },
  {
    "command": "xlxl.formatDocument",
    "title": "XLXL: Format HDL Document or Selection"
  },
  {
    "command": "xlxl.openTutorial",
    "title": "XLXL：使用教程"
  },
  {
    "command": "xlxl.openSettings",
    "title": "XLXL: Open Settings"
  },
  {
    "command": "xlxl.configureToolPath",
    "title": "XLXL: Configure Tool Path"
  },
  {
    "command": "xlxl.openFormattingSettings",
    "title": "XLXL: Open Formatting Settings"
  }
];
const renderSettings = indices => indices.map(index => {
  const group = settingsCatalog[index];
  return '<p><strong>' + escapeHtml(group.title.replace(/^XLXL[:：]/, '')) + '</strong></p>' + table(['设置', '默认值', '说明'], group.rows.map(item => {
    let detail = escapeHtml(item.description);
    if (item.enum.length) detail += '<br>可选：' + item.enum.map(value => '<code>' + escapeHtml(value) + '</code>').join(' / ');
    if (item.minimum !== undefined || item.maximum !== undefined) detail += '<br>范围：' + (item.minimum === undefined ? '未设下限' : escapeHtml(item.minimum)) + ' 至 ' + (item.maximum === undefined ? '未设上限' : escapeHtml(item.maximum));
    return ['<code>' + escapeHtml(item.key) + '</code>', '<code>' + escapeHtml(JSON.stringify(item.default)) + '</code>', detail];
  }));
}).join('');

export const articles = [
  article('install', 'start', '安装 XLXL', '准备 VS Code 与插件，明确内置能力和需要自行安装的工具。', 4, '入门', ['安装', 'VSIX', 'Windows'], [
    section('requirements', '准备开发环境', `<p>XLXL 将 Verilog / SystemVerilog 的编辑、工程管理、诊断、仿真与波形查看放进 VS Code。本文档对应 <strong>1.1.2</strong>；插件完整 ID 为 <code>zhaiyl.xlxl</code>，要求 VS Code 1.85.0 或兼容的更新版本。</p><ul><li>Windows x64 已附带 Slang 语义服务与 Verible 格式化器。</li><li>Icarus Verilog、Vivado、ModelSim、QuestaSim 和 FPGA 厂商软件按使用需要自行安装。</li><li>其他平台需自行提供适用的 Slang 与 Verible 工具。</li></ul>${note('只体验补全、导航和格式化时，可以先安装 XLXL，随后再配置仿真或 FPGA 工具。')}`),
    section('install-vsix', '通过 VSIX 安装', `<ol><li>取得 XLXL 的 <code>.vsix</code> 安装包，核对版本和发布者 <code>zhaiyl</code>。</li><li>在 VS Code 打开扩展视图，点击右上角“…”并选择“从 VSIX 安装…”。</li><li>选择安装包，完成后按 VS Code 提示重新加载窗口。</li><li>在扩展详情中确认名称为 XLXL、插件 ID 为 <code>zhaiyl.xlxl</code>。</li></ol><p>也可在配置好 VS Code 命令行后安装本地包：</p>${code('PowerShell', 'code --install-extension .\\xlxl-1.1.2.vsix')}<p>如果安装较新版本，替换上述文件名；不要使用历史发布者 <code>xlxl.xlxl</code> 作为设置或格式化器 ID。</p>`),
    section('activate', '打开第一个 HDL 工作区', `<ol><li>用“文件 → 打开文件夹”打开工程根目录。</li><li>打开一个 <code>.v</code> 或 <code>.sv</code> 文件，确认右下角语言为 Verilog 或 SystemVerilog。</li><li>在受信任的 Windows x64 本地工作区中，等待 Slang 语义服务就绪。</li><li>点击左侧 XLXL 图标，查看 Project、Modules 和 Toolchain。</li></ol><p>预期结果：编辑器识别 HDL，命令面板中可以找到 XLXL 命令。尚未建立 <code>.xlxl/project.json</code> 时，Project 会提示缺少工程配置；基础编辑功能仍可使用。</p>`),
    section('next', '验证安装并继续', `<p>在 HDL 中输入 <code>module</code> 后按 <code>Ctrl+Space</code> 查看模板，按 <code>Shift+Alt+F</code> 试用格式化。如果安装了多个格式化插件，在“使用…格式化文档”中选择 XLXL。</p><p><strong>1.1.2 新增入口：</strong>在命令面板执行 <strong>XLXL：使用教程</strong>（<code>xlxl.openTutorial</code>），或点击 Toolchain 中的“使用教程”、Project 标题栏的书本图标。1.1.1 没有这些教程入口，本文的工程创建与目录流程在 1.1.1 中相同。</p><p>从 Toolchain 点击“打开 XLXL 设置”，或在 VS Code 设置中搜索 <code>@ext:zhaiyl.xlxl</code>。接下来按 ${link('quickstart', '十分钟跑通计数器')} 完成第一次仿真；需要完整厂商工程请阅读 ${link('project', '创建与接入工程')}。</p>`),
  ]),

  article('quickstart', 'start', '十分钟跑通计数器', '用一个可下载的小工程，完成编辑、检查、Icarus 仿真和波形观察。', 10, '入门', ['快速开始', '快速上手', '示例', 'Icarus'], [
    section('download', '下载并打开精简练习包', `<p>先完成 ${link('install', 'XLXL 安装')}，再下载 <a href="./assets/xlxl-counter-demo.zip" download>计数器示例工程 ZIP</a>。这是<strong>精简 Icarus 练习包，不是完整厂商工程目录</strong>；无需运行创建厂商工程向导。解压后，用 VS Code 打开内层 <code>xlxl-counter-demo</code> 文件夹：</p>${code('Text', `xlxl-counter-demo/
├─ README.md
├─ .xlxl/
│  └─ project.json
├─ rtl/
│  └─ counter.v
└─ sim/
   └─ tb_counter.v`)}<p>完整厂商工程还包含 prj、constraints、rvl、doc、fw、include 等目录，见 ${link('project', '插件生成的完整目录')}。设计模块为 <code>counter</code>，仿真顶层为 <code>tb_counter</code>；8 位参数 <code>WIDTH=8</code>，端口为 clk、低有效 rst_n、enable 和 count。</p>`),
    section('tools', '配置 Icarus 并检查工程', `<ol><li>安装 Icarus Verilog，确保包含编译器 <code>iverilog</code> 和运行器 <code>vvp</code>。</li><li>在 XLXL → Toolchain 点击“配置工具路径”，选择 Icarus iverilog，按向导依次选择操作、用户或工作区设置，再选择实际可执行文件或安装目录。</li><li>执行 <strong>XLXL: Select Syntax Checker</strong>，选择 Icarus Verilog。</li><li>执行 <strong>XLXL: Check HDL Project</strong>，在 Problems 和 XLXL 输出频道查看结果。</li></ol><p>预期结果：源码能完成编译检查。工具没有检测到时，先解决路径问题，详见 ${link('toolchains', '工具链配置')}。</p>`),
    section('tops', '确认练习包已有的配置', `<p>练习包已带有以下 <code>.xlxl/project.json</code>，通常无需修改或重新创建。这里只核对它与包内文件一致，不要将它覆盖到已有厂商工程中：</p>${code('JSON', projectExample)}<p>也可运行 <strong>XLXL: Set Top Module</strong> 核对 counter，运行 <strong>XLXL: Set Simulation Top Module</strong> 核对 tb_counter。两种顶层独立；选择 Testbench 不会改变设计顶层。此练习包未关联 FPGA 厂商工程，不能直接执行厂商同步或位流构建。</p>`),
    section('simulate', '编译运行并打开 VCD', `<ol><li>保存工程和 HDL 文件。</li><li>执行 <strong>XLXL: Simulate Project with Icarus</strong>。</li><li>在 <strong>XLXL Simulation</strong> 输出频道确认编译和运行完成。</li><li>成功后自动打开本次新建或更新的 <code>wave.vcd</code>；如关闭了自动打开，可执行 <strong>XLXL: Open VCD Waveform</strong> 手动选择。</li></ol><p>示例 Testbench 使用 10 ns 时钟周期，包含波形转储和有限时长结束。仿真不依赖 FPGA 板卡或厂商工程。</p>${note('以下命令在工程根目录运行。插件将 .vvp 与运行记录放在 <code>.xlxl/sim/&lt;运行ID&gt;/</code>，但仿真进程的工作目录是工程根目录，示例 wave.vcd 也写在根目录。')}${code('PowerShell', 'iverilog -g2012 -s tb_counter -o counter-demo.vvp rtl/counter.v sim/tb_counter.v\nvvp counter-demo.vvp')}`),
    section('observe', '观察波形与修改代码', `<p>在波形中搜索并选择 <code>clk</code>、<code>rst_n</code>、<code>enable</code> 和 <code>count</code>。将 count 切换为无符号十进制；拖选一段时间放大，使用 A/B 光标读取边沿间隔。</p><p>预期行为：复位有效时计数清零；复位释放后，enable 有效的时钟上升沿推动计数递增，enable 无效时保持。时钟相邻同向边沿相隔 10 ns。具体激励区间以示例 Testbench 源码为准。</p><p>修改激励、保存、重新仿真，比较结果。继续阅读 ${link('waveform', '波形查看器')}，或在 count 信号上右键打开 ${link('signal-tracing', '跨层信号追踪')}。</p>`),
  ]),

  article('workspace', 'start', '认识 XLXL 工作区', '理解三个主要视图、源码分类与工作区根目录，找到每项操作的入口。', 5, '入门', ['界面', 'Project', 'Modules'], [
    section('views', '从左侧栏开始', `<p>打开 HDL 文件后点击 XLXL 活动栏图标。<strong>Project</strong> 展示工程配置和分类文件；<strong>Modules</strong> 展示模块层次；<strong>Toolchain</strong> 展示工具检测结果与常用入口。信号追踪结果显示在独立的“信号追踪”视图。</p><p>可从命令面板输入 <code>XLXL</code> 找到大多数功能。模块工具还可从 Modules 节点右键或 HDL 编辑器右键进入。</p>`),
    section('project-tree', '读懂 Project 分类与目录', `${table(['Project 分类', '新建工程默认目录', '配置字段'], [['RTL Sources', '<code>rtl/</code>；include 中的 HDL 头文件也进入源码范围', '<code>sources</code>'], ['IP Cores', '<code>ip/</code>', '<code>ipSources</code>'], ['Simulation', '<code>sim/</code>，存放 Testbench 源码', '<code>simulationSources</code>'], ['Firmware', '<code>fw/</code>', '<code>firmwareSources</code>'], ['Constraints', '<code>constraints/</code>', '<code>constraints</code>'], ['Online Debug (RVL)', '<code>rvl/</code>', '<code>debugFiles</code>'], ['Project Scripts', '<code>prj/</code> 中匹配的 Tcl/DO 脚本', '<code>scripts</code>']])}<p>这些是配置驱动的文件分类，不是资源管理器的目录镜像；已有配置可以指向其他目录。完整生成结构还包含 <code>doc/</code>、<code>include/</code> 和内部 <code>.xlxl/</code>，见 ${link('project', '工程目录结构')}。顶部显示器件、Top、Sim 和厂商，已关联时还显示“厂商工程”入口。</p>${note('Online Debug (RVL) 是文件管理分组。当前 XLXL 没有在这里提供板卡连接、JTAG 下载或片上信号采集功能。')}`),
    section('modules-tools', '查看层次和工具状态', `<p>Modules 有设计顶层时从该模块开始展示；没有明确顶层时，优先显示未被其他模块例化的候选根。实例使用“实例名: 模块名”展示，找不到定义或出现循环时会给出标记。点击节点可跳转源码。</p><p>Toolchain 提供“打开 XLXL 设置”“配置工具路径”“格式化设置（缩进 / 行宽 / 对齐）”“查看最近构建报告”和“分析已有厂商报告”。<strong>1.1.2 新增</strong> Toolchain 的“使用教程”、Project 标题栏书本图标，以及命令 <strong>XLXL：使用教程</strong>；1.1.1 没有这些教程入口。编辑器右下方的语法工具状态可点击切换检查器。</p><p>新建完整厂商工程使用 Project 标题栏文件夹按钮“创建厂商工程”。只刷新现有工程用 <strong>XLXL: Refresh Project</strong>；索引为空先检查文件范围。</p>`),
    section('roots', '区分源码目录、运行缓存和波形', `<p>所有工程相对路径基于打开的工作区文件夹；多文件夹工作区目前使用<strong>第一个文件夹</strong>。${link('project', '完整目录树与创建流程')}与已安装 1.1.1 的工程行为一致。</p>${table(['路径', '实际内容'], [['<code>sim/</code>', '用户的 Testbench 等仿真源码'], ['<code>.xlxl/sim/&lt;运行ID&gt;/</code>', 'simulation.vvp 与本次运行 result.json'], ['<code>wave.vcd</code>（根目录）', '使用 $dumpfile("wave.vcd") 时生成；相对路径以运行工作目录即工程根为准'], ['<code>.xlxl/lint/</code>', '外部检查缓存'], ['<code>.xlxl/build/</code>、<code>.xlxl/sync/</code>', '按操作生成的构建报告、同步日志和备份']])}<p>厂商工程位于 <code>prj/</code>；<code>doc/</code> 是模块文档目录，名称为单数。切换工作区后，旧图、报告和追踪需重新打开。</p>`),
  ]),

  article('project', 'project-group', '配置与接入工程', '从插件创建向导开始，核对真实工程目录，再按需调整已有源码范围。', 9, '入门', ['project.json', '工程', '目录结构', '顶层'], [
    section('existing', '从 Project 创建厂商工程', `<p>需要完整 FPGA 工程时，先用 VS Code 打开工程文件夹，安装并配置所用的 Diamond、TD 或 PDS 及许可证。然后点击 <strong>XLXL → Project 标题栏的文件夹按钮“创建厂商工程”</strong>，或执行 <strong>XLXL: Initialize Project</strong>。不需要先手写 project.json。</p><p>已有 RTL 可先放在默认 <code>rtl/</code>、IP 放在 <code>ip/</code>；向导按实际匹配的文件导入，不会搬迁文件。已有有效配置时保留其中的源码规则。向导没有目录布局选择器，也不会自动生成设计源码或 Testbench。</p><p>如果只是练习编辑和 Icarus 仿真，可以直接打开 ${link('quickstart', '已带配置的精简练习包')}；该包不代表完整厂商工程结构。</p>`),
    section('native', '按实际向导顺序填写', `<ol><li>在“创建厂商工程”中选择 <strong>Lattice</strong>、<strong>安路 Anlogic</strong> 或 <strong>紫光同创 Pango</strong>。</li><li>填写“器件型号”，再填写“工程名称”；名称不会改变工作区文件夹。</li><li>Diamond 填写“Diamond Implementation 名称”，默认 <code>impl1</code>；PDS 依次填写“器件系列 Family”“封装 Package”“速度等级 Speed Grade”。</li><li>插件检查本机工具；Diamond 随后选择“Diamond 综合器”：Lattice LSE（默认）或 Synplify Pro。含 SystemVerilog 设计时只提供 Synplify Pro。</li><li>扫描到设计源码时填写“设置工程顶层模块”；没有源码的空工程跳过此步。</li><li>等待调用厂商工具创建并验证。成功后才写入 <code>.xlxl/project.json</code>，并显示原生工程位置。</li></ol><p>已有配置时先出现“重新生成 / 取消”提示；已有同名厂商文件或实现目录会受到保护。器件、许可证或工具不满足要求时，不能把向导填写完成视为工程已创建。</p>`),
    section('directories', '核对插件生成的完整目录', `<p>以下是向导创建阶段生成的目录及成功后写入的配置，工程创建行为在 1.1.1 与 1.1.2 中相同：</p>${code('Text', generatedProjectTree)}<p><code>rtl/</code> 是设计源码，<code>ip/</code> 是 IP，<code>sim/</code> 是 Testbench 源码；<code>constraints/</code> 放约束，<code>rvl/</code> 放 RVL 文件，<code>fw/</code> 放固件，<code>include/</code> 放头文件，<code>doc/</code> 放模块文档。目录创建不等于自动生成这些文件。</p><p>厂商主工程分别为 <code>prj/&lt;工程名&gt;.ldf</code>、<code>prj/&lt;工程名&gt;.al</code>、<code>prj/&lt;工程名&gt;.pds</code>。实现目录及报告由具体工具产生，不要求三家布局一致；Diamond 默认实现常为 prj/impl1。</p><p><code>.xlxl/sim/</code> 是内部编译缓存，与用户 <code>sim/</code> 不同。同步、构建等缓存按操作另行生成；<code>$dumpfile("wave.vcd")</code> 的相对路径会写到工程根目录。</p>`),
    section('top-modules', '创建后分别设置两种顶层', `<ol><li>工程创建成功后添加或保存设计与 Testbench。</li><li>执行 <strong>XLXL: Set Top Module</strong> 选择设计根模块。</li><li>执行 <strong>XLXL: Set Simulation Top Module</strong> 选择 Testbench。</li><li>在 Project 顶部核对 Top 与 Sim；修改厂商相关输入后执行 ${link('vendor', '同步预览')}。</li></ol><p>这两个命令要求已有有效 XLXL 配置。创建向导中的“设置工程顶层模块”是创建过程的一步，不要在空白工程中先运行独立设置命令。配置项分别为 topModule 与 simulationTopModule，后者不会更改前者。</p><p>修改配置后先保存，等待刷新完成再继续操作。转义模块名在配置中填写名称本身，例如 <code>tb.x</code>。</p>`),
    section('patterns', '进阶可选：仅源码配置与非默认目录', `<p>只做编辑、检查和 Icarus 仿真时，可以手工建立有效配置；这不会创建上面的目录或厂商工程。下面是练习包的完整最小配置，适合新的源码练习目录，<strong>不要用它覆盖向导已生成的厂商配置</strong>：</p>${code('JSON', projectExample)}<p>已有配置请只修改需要的字段，保留 device、toolchain、constraints 等。sources、ipSources、simulationSources 各自控制设计、IP 和仿真范围，路径基于工作区；includePaths 填真实目录，defines 每项一个宏。<code>sources: []</code> 不扫描设计源码，其他范围仍独立生效。</p>${note('没有 toolchain 的源码配置不能直接进行厂商同步或构建。需要厂商流程时，使用创建向导，或在已有有效配置上配置并关联真实厂商工程。')}`),
    section('fallback', '已有文件与配置如何被识别', `<p>向导使用文件范围扫描现有文件并把路径导入厂商工程，不会将任意目录中的源码自动移动到 rtl/。已有项目采用其他布局时，应在现有配置中调整匹配规则，再保存、刷新和同步。</p><p>没有配置时，基础模块树按 <code>xlxl.sourceGlobs</code> 扫描，默认 rtl/ 与 ip/；Slang 扫描工作区 HDL，范围可能不同。配置无效时 Project 会给出提示；检查非空 name、sources 字符串数组和其他字段类型。代码编辑无需先创建厂商工程。</p>`),
  ]),

  article('toolchains', 'project-group', '配置工具链', '用统一路径向导连接编译器、运行器、格式化器和 FPGA 工具。', 7, '入门', ['工具路径', 'Icarus', 'Slang'], [
    section('roles', '按任务选择工具', `${table(['任务', '使用的工具'], [['语义补全、引用、重命名、实时诊断', 'Slang，Windows x64 内置'], ['文档与选区格式化', 'Verible，Windows x64 内置'], ['外部语法检查', 'Vivado / ModelSim / QuestaSim / Icarus 四选一'], ['Testbench 编译和运行', 'Icarus iverilog + vvp'], ['创建、同步和构建 FPGA 工程', 'Diamond / TangDynasty / PDS 本机软件'], ['驱动源与 X 态进阶查询', '可选 wave-mcp 后端，另行安装']])}<p>语法检查器不决定仿真工具：即使选择 Vivado 检查，XLXL 的快速仿真仍使用 Icarus。</p>`),
    section('path-wizard', '使用路径配置向导', `<ol><li>在 Toolchain 点击<strong>配置工具路径</strong>，或执行 <strong>XLXL: Configure Tool Path</strong>。</li><li>选择工具，例如 Icarus iverilog。</li><li>选择操作：“选择可执行文件”“选择目录”或“手动输入路径”；目录操作仅在工具支持时出现。</li><li>先选择保存到“用户设置”或“工作区设置”，工作区值会覆盖用户值。</li><li>随后才会打开文件/目录选择器或路径输入框，选择实际位置。</li><li>配置完成后可运行 <strong>XLXL: Detect Toolchains</strong> 刷新状态。</li></ol><p>向导验证路径后才写设置；无效时不保存。Verible 自定义路径要求绝对可执行文件路径；Slang 可使用基于工作区的相对路径。恢复自动检测也在操作列表中选择。</p>`),
    section('settings-map', '常用路径设置', `${table(['工具', '设置'], [['Vivado xvlog', '<code>xlxl.xvlogPath</code>'], ['ModelSim / QuestaSim', '<code>xlxl.modelsimPath</code> / <code>xlxl.questaPath</code>'], ['Icarus 编译器 / 运行器', '<code>xlxl.iverilogPath</code> / <code>xlxl.vvpPath</code>'], ['Diamond / TD / PDS', '<code>xlxl.diamondPath</code> / <code>xlxl.anlogicPath</code> / <code>xlxl.pdsPath</code>'], ['Slang / Verible', '<code>xlxl.semantic.serverPath</code> / <code>xlxl.formatter.path</code>']])}<p>多数厂商工具可填写可执行文件、bin 目录或安装根目录。<code>xlxl.toolSearchPaths</code> 可加入安装目录或其父目录，供自动检测、检查、创建和构建使用，无需修改系统 PATH。</p>`),
    section('icarus', '确认 Icarus 的两个程序', `<p>Icarus 使用 <code>iverilog</code> 编译，用 <code>vvp</code> 执行编译产物。vvpPath 留空时，插件优先使用检测到的 iverilog 同目录下的 vvp。</p>${code('JSON', `{
  "xlxl.iverilogPath": "C:/iverilog/bin/iverilog.exe",
  "xlxl.vvpPath": "C:/iverilog/bin/vvp.exe",
  "xlxl.syntaxTool": "iverilog"
}`)}<p>以上仅是路径写法示例，替换为实际安装位置。Windows 支持 <code>.exe</code> 以及 <code>.cmd/.bat</code> 启动器；使用启动器时，建议显式设置真实 vvp 路径。</p>`),
    section('reset', '迁移电脑或恢复自动检测', `<p>旧电脑的显式路径可能阻止自动发现新安装。重新进入路径向导，选择“恢复自动扫描”或对应内置版本选项。若用户设置已清空仍不生效，检查工作区或文件夹设置中的覆盖值。</p><p>旧 <code>xlxl.vivadoPath</code> 仍可回退读取，新的配置优先使用 <code>xlxl.xvlogPath</code>；Questa 旧别名也有兼容回退。避免同时维护多套冲突路径。更多字段见 ${link('settings', '设置参考')}。</p>`),
  ]),

  article('editing', 'editor', '补全、导航与重命名', '从模块例化到跨文件语义导航，保持接口连接和符号修改清晰可查。', 7, '入门', ['补全', '导航', '重命名'], [
    section('language', '确认文件语言', `<p><code>.v/.vh</code> 使用 Verilog 解析，<code>.sv/.svh</code> 使用 SystemVerilog 解析。需要 SystemVerilog 语法时使用对应后缀；未保存草稿可点击右下角语言模式，选择 Verilog 或 SystemVerilog。</p><p>基础模块索引提供模块导航、例化与端口相关功能；Slang 提供完整宏展开、跨文件语义补全、悬停、引用和重命名。语义服务不可用时，基础模块导航与端口提示仍可使用。</p>`),
    section('instantiate', '插入例化并填写连接', `<ol><li>把光标放在模块内部或受支持的 generate 结构中。</li><li>输入模块名前缀，按 <code>Ctrl+Space</code> 选择例化模板；模板已包含命名端口连接。</li><li>按 <code>Tab</code> 在实例名和连接表达式的占位位置间切换，填写实际信号。</li><li>普通例化模板不会自动加入参数覆盖。需要覆盖时，自行写入 <code>#(.</code> 等参数连接上下文，再调用参数补全。</li></ol><p>对于已有但尚未写完整的实例，在连接列表输入 <code>.</code> 可补全缺少的命名端口；这与插入已包含端口的整块例化模板是两个入口。填写后的例子：</p>${code('Verilog', `counter #(
    .WIDTH(8)
) u_counter (
    .clk(clk),
    .rst_n(rst_n),
    .enable(enable),
    .count(count)
);`)}<p>预期结果：已知端口旁显示虚拟方向箭头，输入 ←、输出 →、双向 ↔；悬停可查看声明及连接信息。箭头是编辑器提示，不写入源码。</p>`),
    section('members', '补全成员、包和参数', `<p>在 <code>实例名.</code>、<code>结构体变量.</code> 或 <code>包名::</code> 后触发补全，Slang 会按语义上下文给出成员。基础导航与补全也支持转义模块、端口和参数名称。</p><p>不确定补全来自哪一文件时，对结果对应符号悬停或按 F12 验证定义。头文件或包未被找到时，检查 ${link('project', 'includePaths、defines 和源码范围')}。</p>`),
    section('navigate', '用定义、引用和层次理解代码', `${table(['操作', '默认快捷键'], [['触发补全', '<code>Ctrl+Space</code>'], ['转到定义', '<code>F12</code>'], ['查找引用', '<code>Shift+F12</code>'], ['重命名符号', '<code>F2</code>'], ['格式化文档', '<code>Shift+Alt+F</code>']])}<p>Modules 从设计顶层展示模块实例关系；Outline 提供当前文件结构。代码量大时，先定位模块和接口，再用 ${link('module-graph', 'RTL 连接图')} 查看直接连接，用 ${link('signal-tracing', '信号追踪')} 沿实际实例路径读上下游。</p>`),
    section('rename', '安全完成跨文件重命名', `<ol><li>保存工程配置，等待语义刷新完成。</li><li>将光标放在目标符号，按 F2，输入新名称本身。</li><li>检查 VS Code 提供的修改范围，再应用更改并保存。</li><li>重新检查和仿真受影响模块。</li></ol><p>插件会生成必要的 HDL 转义语法，并检查模块名称冲突。源码和头文件保存后自动重新加载语义工程；期间不要继续发起重命名。</p><p>若提示目标范围与当前文件不一致，打开提示涉及的文件，执行 <strong>XLXL: Restart Semantic Server</strong> 后重试，日志入口为 <strong>XLXL: Show Semantic Log</strong>。</p>`),
  ]),

  article('formatting', 'editor', '统一代码格式', '整理全文、选区或保存时格式，控制缩进、端口和赋值对齐。', 6, '入门', ['Verible', '格式化', '对齐'], [
    section('run', '格式化全文或选区', `<p>在 HDL 编辑器点击右上角整理按钮，或执行 <strong>XLXL: Format HDL Document or Selection</strong>。没有选择时整理全文，有选择时仅处理选区覆盖的代码行。一次 <code>Ctrl+Z</code> 可撤销。</p><ol><li>先在一个可正常解析的模块上试运行。</li><li>选择几行端口连接，再点同一按钮，验证选区外保持原样。</li><li>如需 VS Code 标准入口，全文用 <code>Shift+Alt+F</code>；选区用 <code>Ctrl+K</code> 后按 <code>Ctrl+F</code>。</li></ol><p>反向选区也适用；选区结束在下一行开头时，不会顺带整理该行。安装多个格式化器时，请选择 XLXL。</p>`),
    section('options', '设置缩进与块风格', `${table(['设置', '默认', '作用'], [['<code>xlxl.formatter.style</code>', '<code>kr</code>', '可选 kr / ansi / gnu'], ['<code>xlxl.formatter.indentSize</code>', '<code>0</code>', '0 跟随编辑器；1–16 指定空格数'], ['<code>xlxl.formatter.columnLimit</code>', '<code>100</code>', '目标行宽，不保证拆开每一条长行'], ['<code>xlxl.formatter.alignPorts</code>', '<code>true</code>', '端口、参数和例化连接对齐'], ['<code>xlxl.formatter.alignAssignments</code>', '<code>true</code>', '连续单行赋值对齐 = 或 &lt;=']])}<p>在 Toolchain 点击“格式化设置（缩进 / 行宽 / 对齐）”可直接定位设置。Verible 输出空格；不会根据硬件功能改写逻辑。</p>`),
    section('alignment', '理解首行对齐规则', `<p>例化连接以第一条端口连接为参照，保留其括号相对缩进的间距，后续行左右括号分别对齐。更长端口名或表达式会扩展整组列位置。对齐使用空格，空连接仍保留方向提示。</p><p>连续单行赋值同样参考组内第一行，对齐 <code>=</code> 或 <code>&lt;=</code>。空行、独立注释和控制语句分隔组；条件中的比较运算符不参与赋值对齐。只选择组内后几行时，仍参考选区外首行，但不会修改它。</p>`),
    section('save', '启用保存时格式化', `<p>在 VS Code 的 <code>settings.json</code> 中合并以下设置。若文件已有其他内容，保留既有字段，避免重复写入同一个 JSON 键：</p>${code('JSON', formatExample)}<p>预期结果：保存 Verilog 或 SystemVerilog 文件时使用 <code>zhaiyl.xlxl</code> 整理当前内容。可以按语言单独开启，而无需对全部文件启用。</p>`),
    section('protected', '保留手工排版并排查失败', `${code('Verilog', `// verilog_format: off
// 在这里保留经过人工对齐的代码或表格。
// verilog_format: on`)}<p>格式化读取当前编辑内容。语法不完整的片段可能无法独立解析；失败、超时、取消或结果过期时不会用旧结果覆盖源码。查看 <strong>XLXL Formatter</strong> 输出频道了解原因。</p><p>Windows x64 默认使用内置 Verible；自定义 <code>xlxl.formatter.path</code> 应为可执行文件绝对路径。其他平台可配置路径或通过 PATH 提供工具。</p>`),
  ]),

  article('diagnostics', 'editor', '诊断与预览式快速修复', '区分实时语义诊断和编译器检查，按证据修复接口与未使用声明。', 8, '进阶', ['Slang', '检查', '快速修复'], [
    section('two-layers', '两层诊断各司其职', `<p><strong>Slang 语义服务</strong> 默认启用，为当前工程提供实时语义诊断、补全和导航；<strong>外部语法检查器</strong> 调用本机 Vivado、ModelSim、QuestaSim 或 Icarus，结果显示在 Problems 中。</p><p>保存源码和头文件后，语义工程自动刷新，状态栏会显示刷新过程。外部检查读取磁盘内容，检查前请保存相关源码和头文件。头文件检查会通过工程源码编译，而不是把头文件当成独立顶层。</p>`),
    section('check', '选择并运行检查器', `<ol><li>先按 ${link('toolchains', '工具链配置')} 设置工具路径。</li><li>执行 <strong>XLXL: Select Syntax Checker</strong>，选择所需工具，默认是 Vivado。</li><li>保存 HDL 文件触发自动检查；或运行 <strong>XLXL: Check Current HDL File</strong> / <strong>XLXL: Check HDL Project</strong>。</li><li>从 Problems 跳到源码，查看 <strong>XLXL</strong> 输出频道里的完整工具输出。</li></ol><p><code>xlxl.checkOnSave</code> 默认为 true，可按项目需要关闭自动检查。<strong>XLXL: Clear HDL Diagnostics</strong> 只清除检查结果，不修复代码。</p>`),
    section('display', '阅读错误、警告和未使用提示', `<p>行尾诊断默认只显示错误，警告仍保留波浪线与悬停详情。<code>xlxl.inlineDiagnostics.mode</code> 默认为 <code>auto</code>，检测到 Error Lens 时自动由其显示，也可改为 <code>on</code> 或 <code>off</code>。</p><p>未使用模块判断参考设计和仿真顶层；未调用函数/任务及未使用信号的淡化依赖 VS Code 的 <code>editor.showUnused</code>。仅赋值但未读取的信号仍可能有警告，不应直接等同于“可删除”。编辑时过期基础结果会清理，保存后再检查。</p>`),
    section('quick-fix', '先预览，再应用修复', `<ol><li>在受支持的 Slang 诊断上打开灯泡/快速修复。</li><li>选择 XLXL 修复项，需要时填写连接表达式。</li><li>阅读只读差异预览，核对文件、接口和修改内容。</li><li>确认后一次应用，保存目标文件并重新检查。</li></ol>${table(['修复', '适用范围'], [['删除未使用标量', '模块内部独立一行的 wire/logic 标量，且语义引用确认无其他引用'], ['填写空输入连接', '明确的命名输入连接，例如 .p()'], ['补齐缺失端口', '唯一子模块定义、纯命名连接中的缺失输入/输出']])}<p>连接表达式由用户提供，插件不猜测位宽或类型。转义标识符需要保留结束它的末尾空格。</p>`),
    section('limits', '修复边界与过期结果', `<p>删除操作不覆盖端口、局部作用域、初值、多声明、注释、属性、宏或仅赋值未读取的信号。通配 <code>.*</code>、位置连接、匿名端口和歧义定义也不提供补端口修复。</p><p>未保存依赖、过期诊断、刷新中输入变化或引用查询失败会阻止应用。预览期间修改源码、子模块、头文件、宏或工程配置后，需要重新准备。修复不承诺功能等价，应用后仍需检查和仿真。</p>${note('<code>xlxl.prepareDiagnosticFix</code> 与 <code>xlxl.applyDiagnosticFix</code> 是灯泡/预览内部入口，不独立显示在命令面板。')}`),
  ]),

  article('testbench', 'modules', '生成 Testbench 骨架', '从已解析的模块创建可运行起点，再补充真实激励与检查。', 7, '入门', ['Testbench', '时钟', '复位'], [
    section('entry', '选择待测模块', `<p>保存源码与工程配置。执行 <strong>XLXL: Create Testbench</strong>，或从 HDL 编辑器右键进入，会打开<strong>选择 DUT 模块</strong>列表；按模块名及源文件选择实际定义。仅把光标放进模块，并不会跳过这个选择。</p><p>从 Modules 中右键一个已解析模块节点时，节点会直接提供该定义。向导读取接口和参数，不会更改 DUT；先核对源文件，避免选择同名的其他模块。</p>`),
    section('wizard', '按向导顺序生成并保存', `<ol><li>填写“TB 模块名称”，默认以 <code>tb_</code> 开头，且必须与 DUT 名不同。</li><li>在“输出语言”选择 SystemVerilog (.sv) 或 Verilog (.v)。</li><li>在“Testbench 输出路径”选择尚不存在的新文件，默认位于 sim/。</li><li>依次“选择时钟”“选择复位”；每项都可以选无时钟/无复位，只有明确选择的标量输入会被驱动。</li><li>选了复位时，填写“复位极性”和“复位保持时间 (ns)”；选了时钟时，再填写“时钟周期 (ns)”。</li><li>填写“仿真时长 (ns)”，检查打开的代码预览，然后在确认框点击<strong>保存新文件</strong>。</li></ol><p>普通输入有初始化，输出用于观察，inout 保持无驱动。预览不等于已保存；已有同名文件不会被覆盖。生成骨架的 VCD 文件名以 TB 安全模块名命名，例如 tb_counter.vcd。</p>`),
    section('register', '点击通知加入仿真并设为顶层', `<p>保存成功后，通知提供<strong>加入仿真并设为顶层</strong>和“打开文件”。已有有效且未变化的 XLXL 配置时，优先点击前者：插件更新 simulationSources 和 simulationTopModule，并保留设计顶层。</p><p>如果只点“打开文件”或关闭通知，文件已经保存，但还需核对它是否落在仿真范围中，再运行 <strong>XLXL: Set Simulation Top Module</strong> 选择新 TB。工作区外的文件需要手工配置；缺少工程配置时先完成 ${link('project', '工程创建或可选源码配置')}。</p><p>这里无需整份替换 project.json；保留已有厂商字段。保存并完成配置后，执行 <strong>XLXL: Simulate Project with Icarus</strong>。</p>`),
    section('stimulus', '补充真实激励与预期结果', `<p>生成器提供可运行骨架，不会自动编写协议事务、边界条件、参考模型或结果断言。以计数器为例，可以追加 enable 开关、再次复位和溢出观察，再用断言或明确的条件检查结果。</p>${code('Verilog', `// 示例片段：放在适当的激励 initial 中，并按已有时钟安排调整。
enable = 1'b0;
repeat (3) @(negedge clk);
enable = 1'b1;
repeat (8) @(negedge clk);
enable = 1'b0;`)}<p>检查 count 是否只在允许的时钟边沿更新。使用 ${link('waveform', '波形双光标')} 对照时间；生产项目应加入自动判断，而不只依赖人工看图。</p>`),
    section('unsupported', '接口恢复的限制', `<p>不支持 interface/modport、ref、非打包数组、匿名位置端口、type 参数，以及依赖 Testbench 作用域外宏、包或局部符号且无法恢复的声明。打包位宽表达式仅在依赖可恢复参数时保留，不计算具体数值。</p><p>模块位于条件编译分支或内部含条件编译时，索引无法证明实际活动接口，向导会保守拒绝并说明原因。可先用 ${link('module-docs', '接口文档')} 查看原始声明，再手工编写 Testbench。向导期间源码或依赖改变也会阻止过期保存。</p>`),
  ]),

  article('module-docs', 'modules', '生成模块接口文档', '预览参数、端口、接口图和例化样例，导出 Markdown 与本地 SVG。', 5, '入门', ['文档', 'Markdown', 'SVG'], [
    section('preview', '选择模块并预览', `<ol><li>保存模块与工程配置。</li><li>在 Modules 节点右键选择 <strong>XLXL: Preview Module Documentation</strong>，节点直接提供模块定义。</li><li>从命令面板或 HDL 编辑器右键运行时，会先打开<strong>选择 DUT 模块</strong>列表；按源文件核对同名模块。</li><li>核对参数、端口、原始表达式、接口图和例化样例。</li></ol><p>预览页提供“模块源码”与<strong>导出 Markdown 和 SVG</strong>按钮，可从当前快照继续查看或导出。</p>`),
    section('read', '理解原始声明与待补充项', `<p>接口文档保留源码中的参数、类型和位宽表达式，不把未计算的表达式冒充具体数值。没有可靠描述的端口或参数会显示“待补充”，不会根据 clk、data 等名称自动推测设计功能。</p><p>依赖包、宏或调用作用域的接口，例化样例会标明所需环境。有限制的模块仍可保留原始声明和说明；文档成功导出不代表 Testbench 生成或仿真一定受支持。</p>`),
    section('export', '导出两个关联文件', `<ol><li>点击预览页的<strong>导出 Markdown 和 SVG</strong>；或执行 <strong>XLXL: Export Module Documentation</strong>，再按“选择 DUT 模块”选择定义。</li><li>选择目标路径，默认位于 <code>doc/&lt;安全模块名&gt;.md</code>。</li><li>确认同目录的 <code>.interface.svg</code> 目标也不存在。</li><li>导出后同时保留 Markdown 与 SVG，并核对图片引用。</li></ol><p>预期结果：得到可版本管理的接口说明和本地接口图。已有目标不会被覆盖，需要另选名称；从 Modules 节点运行可直接使用该节点定义。</p>`),
    section('freshness', '更新文档与安全边界', `<p>接口文档是当前源码的快照。修改端口、参数、头文件或配置后，应重新预览并另存更新版本。切换工作区后旧预览操作会失效。</p><p>导出是有保护的双文件发布，不是跨文件原子事务；任一发布失败会尝试仅清理本次创建且未被用户改动的文件。不支持硬链接的文件系统会安全失败。若遇到导出错误，先检查目标目录和是否已有同名文件。</p>`),
  ]),

  article('module-graph', 'modules', '探索 RTL 模块连接图', '查看一层端口、子实例与连接表达式，在图与源码之间切换。', 6, '进阶', ['连接图', '层次', '导航'], [
    section('open', '选择模块并打开连接图', `<ol><li>在 Modules 中选择已解析模块，右键运行 <strong>XLXL: Show RTL Module Graph</strong>，节点直接提供定义。</li><li>从 HDL 编辑器右键或命令面板运行时，先在<strong>选择 DUT 模块</strong>列表中按模块名和源文件选择定义。</li><li>核对根模块名称和端口，在图中找到直接子实例。</li></ol><p>图显示所选模块的一层直接 RTL 连接，包括端口、实例和实际连接表达式，适合查找连接出处。</p>`),
    section('navigate', '搜索、缩放与下钻', `<p>用图中的搜索找到信号、实例或表达式，再通过缩放和平移检查局部。<strong>双击实例</strong>或选中实例后按 Enter 可以进入子模块，返回按钮回到上层。</p><p>实例内的“↗ 源码”按钮跳到声明；其他节点和连线也可点击定位相关位置。源码在旁侧打开，图形保留焦点，便于连续沿连接阅读。</p><p>预期结果：从顶层看到子实例接口，再下钻子模块，能回到上层并定位每条受支持连接的源码。</p>`),
    section('expressions', '读懂未知和复杂连接', `<p>复杂表达式以完整表达式节点显示，不擅自拆成确定的硬件。未知模块、同名定义歧义、通配连接和未解析连接会明确标记。遇到这些标记，先跳到源码和实际定义核对上下文。</p><p>如果需要沿一个具体实例中的信号继续追上下游，使用 ${link('signal-tracing', '跨层信号追踪')}。连接图帮助看结构，追踪帮助看一条信号路径。</p>`),
    section('boundary', '它展示的范围', `${note('连接图不执行综合、generate/参数展开、宏分支选择、位宽求值或协议推断。不要将其视为综合后的网表或时序图。', true)}<p>图按同一份捕获源码解析模块并保存定位位置。修改源码、头文件或工程后，需要重新打开图；切换工作区后旧图中的操作失效，即使返回原目录也需重开。</p><p>若看不到预期实例，检查模块索引、源码范围和未解析语法，再从源码验证实际连接。</p>`),
  ]),

  article('signal-tracing', 'modules', '跨层信号追踪', '沿具体实例查看上下游、位映射、组合依赖和上一拍关系。', 12, '进阶', ['信号追踪', '位选', '时序依赖'], [
    section('start', '从源码选择追踪起点', `<ol><li>在 HDL 信号上右键，选择<strong>XLXL：追踪信号</strong>，或执行 <code>xlxl.traceSignal</code>。</li><li>可选中完整信号、固定 <code>bus[3]</code> 或 <code>bus[7:4]</code>；也可把光标放在这些表达式的信号名称处。</li><li>模块多次例化时，选择实际要分析的实例路径。</li><li>在 XLXL“信号追踪”视图展开上游、下游及双向连接/边界。</li></ol><p>路径可能显示 <code>top.bus → top.u_mid.req → top.u_mid.u_leaf.data</code>。设计顶层不可用时可选择根模块，也可以明确选择未绑定工程父实例的局部根。</p>`),
    section('read', '读取路径并返回源码', `<p>端口条目保留实例路径和改名关系；点击连接定位实参，右键“转到声明”查看接口。模块顶层 assign 会把右侧信号依赖接入上下游，显示“assign 依赖”、完整表达式及常量终点。</p>${code('Verilog', `assign req = enable & valid;
leaf u_leaf (.data(req));`)}<p>从 req 看上游可看到 enable 和 valid，下游可继续进入 u_leaf.data。标题中的重新追踪会重新定位原起点并保留所选位；清空按钮移除当前结果。</p>`),
    section('bits', '固定选位、切片和拼接', `${code('Verilog', `wire [15:0] bus;
leaf u_leaf (.data(bus[15:8]));
wire [3:0] a, b;
wire [7:0] y;
assign y = {a[3:0], b[3:0]};`)}<p>已知接口宽度匹配时，data[0] 对应 bus[8]；拼接按位序映射，追踪切片仅保留相交部分，排除不相交扇出。升序范围同样按位的意义位置处理，不按下标数值简单对齐。</p><p>精确映射要求无维度标量或单个字面量打包范围，端点支持带正负号的十进制整数；单信号/拼接最多 4096 位。参数宽度、动态下标、非打包/多维数组、变宽连接、含常量或重复拼接等会保留边界，不计算表达式。</p>`),
    section('procedural', '组合过程与时序过程', `<p>组合追踪支持模块级 <code>always_comb</code>、<code>always @*</code>、<code>always @(*)</code> 中已声明整信号的阻塞赋值，以及 begin/end、if/else 和普通 case。结果区分数据依赖与条件依赖，按执行顺序处理临时值；分支没有完整赋值时显示旧值/可能锁存警告。</p>${code('Verilog', `always @(posedge clk) begin
    q1 <= data;
    q2 <= q1;
end`)}<p>时序追踪支持 always_ff 或边沿触发 always 中的整信号非阻塞赋值。上例 q2 依赖事件前的 q1；同钟同边沿关系确认时标注“上一拍”。未赋值分支显示“保持上一拍”，反馈展开到时序边界后停止。</p><p>时钟边沿和复位关系单列。异步复位需由事件、顶层条件有效电平与常量复位分支共同确认；单时钟中的特定常量分支可标为“同步复位候选”。不按 clk/rst 名称猜测，也不推断跨时钟域周期关系。</p>`),
    section('limits', '识别边界，避免过度解释', `${note('结果表示静态可能依赖，包含各条件和分支；不执行仿真、常量折叠或唯一驱动判断。', true)}<p>算术/条件运算和组合、时序过程的向量依赖通常没有精确位对应。显式位查询会在“位对应未知”处停止；整信号仍可继续，但保留“仅整信号可能依赖，位对应未知”标记。</p><p>不支持的过程语法包括位选/切片或拼接左值、局部声明、函数/任务、循环、语句内延时/事件控制，以及组合中的非阻塞赋值或时序中的阻塞/混合赋值；遇到时整个过程停止追踪。函数调用、层次引用、复杂实参、generate 或未展开预处理分支也可能显示边界。</p><p>默认预算为 128 层、5000 实例上下文、10000 结果，截断会提示。源码、头文件或工程改变后旧结果失效；原起点消失或原选区已无法确认时，从编辑器重新发起。</p>`),
  ]),

  article('simulation', 'simulation-group', '用 Icarus 运行仿真', '为 Testbench 设置独立顶层，编译、运行并确认本次生成的波形。', 8, '入门', ['Icarus', '仿真', 'VCD'], [
    section('prepare', '准备编译和运行输入', `<ol><li>安装 Icarus，配置 <code>xlxl.iverilogPath</code>，必要时同时配置 <code>xlxl.vvpPath</code>。</li><li>在 project.json 中把设计、IP 和仿真文件放进对应范围，并填写 includePaths 与 defines。</li><li>保存工程配置和相关 HDL 文件。</li><li>运行 <strong>XLXL: Set Simulation Top Module</strong> 选择 Testbench。</li></ol><p>仿真额外使用 simulationSources。设计顶层和仿真顶层独立，仿真通常选择没有外部输入、能够自行产生激励的 Testbench。</p>`),
    section('dump', '加入波形转储与结束条件', `<p>在 Testbench 中加入以下代码，将 <code>tb_counter</code> 替换为真实模块名：</p>${code('Verilog', `initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, tb_counter);
end

initial begin
    // 在有限的仿真时间后结束，时长单位由 timescale 决定。
    #500;
    $finish;
end`)}<p>另需为设计提供时钟、复位与输入激励。未执行 dump 语句不会产生预期波形；只有无限时钟且没有结束条件会一直运行到取消或超时。</p>`),
    section('run', '运行并阅读日志', `<ol><li>执行 <strong>XLXL: Simulate Project with Icarus</strong>。</li><li>观察 <strong>XLXL Simulation</strong> 输出频道中的编译顶层、错误和运行输出。</li><li>编译成功后插件调用 vvp 运行；预期看到仿真完成。</li><li>成功且检测到本次新增或更新的 VCD 时，默认自动打开内置查看器。</li></ol><p>编译产物 <code>simulation.vvp</code> 和运行记录保存在 <code>.xlxl/sim/&lt;运行ID&gt;/</code>。编译与 vvp 的工作目录都是工程根目录，相对路径 <code>wave.vcd</code> 写在根目录。不要依赖上一轮的旧 VCD 判断本轮是否成功；插件自动打开也只选择本次生成或更新的波形。</p>`),
    section('control', '取消、超时与自动打开', `<p>进度提示支持取消，<code>xlxl.simulationTimeout</code> 控制单次编译或运行阶段最长时间，默认 120 秒；取消与超时会停止该次进程树。工程保存未完成时，本次操作会停止。</p>${code('JSON', `{
  "xlxl.simulationTimeout": 120,
  "xlxl.openWaveformAfterSimulation": true,
  "xlxl.waveMcp.afterSimulation": false
}`)}<p>不需要自动打开时，将 openWaveformAfterSimulation 设为 false，再通过 <strong>XLXL: Open VCD Waveform</strong> 手动打开。wave-mcp 自动分析默认关闭，只有安装并配置后再启用。</p>`),
    section('debug', '仿真失败时检查什么', `<ul><li><strong>找不到工具：</strong>核对 iverilog 和 vvp 两个程序的实际路径。</li><li><strong>找不到顶层：</strong>检查 simulationTopModule、模块名和仿真源码 glob。</li><li><strong>缺包、宏或头文件：</strong>检查源文件范围、includePaths 和 defines。</li><li><strong>仿真完成但没有波形：</strong>确认 dump 语句实际执行，Testbench 正常结束，并且本次确实写出或更新 VCD。</li><li><strong>厂商原语无法运行：</strong>编辑器使用的原语声明不等于仿真行为模型，需补充适合 Icarus 的可解析模型。</li></ul><p>先从最小 Testbench 复现，再逐步增加激励。可以使用 ${link('quickstart', '计数器示例')} 验证工具安装。</p>`),
  ]),

  article('waveform', 'simulation-group', '使用 VCD 波形查看器', '搜索信号、精确显示总线、组织分组，缩放与测量时间。', 8, '入门', ['波形', 'VCD', '双光标'], [
    section('open', '打开并选择信号', `<p>仿真成功后默认自动打开本轮生成的 VCD。也可执行 <strong>XLXL: Open VCD Waveform</strong>，选择工作区里的 VCD 文件。</p><ol><li>在“搜索信号”中输入完整路径或名称的一部分。</li><li>选择需要观察的信号；可用“选择搜索结果”，最多显示 64 路。</li><li>用“清空选择”重新开始，避免把无关信号都放进画布。</li></ol><p>查看器支持数字标量/向量、实数和事件信号。宽总线使用精确整数，X/Z 保留未知态，便于定位初始化和驱动问题。</p>`),
    section('radix', '选择进制并组织分组', `<p>对总线可切换二进制、十六进制、无符号十进制和有符号十进制。检查符号位时选择有符号显示；观察计数或长度时使用无符号显示更直观。</p><p>在<strong>新分组名称</strong>输入框填名称，点击<strong>添加分组</strong>，再用信号行中的分组选择将信号加入。分组可以折叠；通过拖动或上下按钮调整显示顺序，把时钟、复位、控制和数据放在一起。</p><p>预期结果：以适合数据含义的进制读值，同时保留完整信号名称辨认来源。</p>`),
    section('zoom', '缩放、范围输入与 A/B 游标', `<ol><li>在“当前游标”中选择 <strong>A</strong>，点击画布设置 A；再切换为 <strong>B</strong>，点击设置 B。</li><li>读取两个游标的物理时间与绝对时间差；相邻同向时钟边沿可用于测周期。</li><li>在画布拖选区间放大，滚轮围绕指针缩放；Shift 拖动、中键拖动或平移滚轮移动视区。</li><li>点击<strong>显示全部时间</strong>返回全图，或在“起点”“终点”输入范围。</li></ol><p>起点/终点输入使用 VCD 的原始 <strong>ticks</strong>，不是直接输入 ns；请结合界面 timescale 换算。游标显示会给出物理时间，避免把原始计数与实际时间单位混淆。</p>`),
    section('layout', '保存并恢复布局', `<p>使用查看器“保存布局”导出 JSON，随后通过“恢复布局”恢复显示顺序、进制、分组、视区和光标。适合反复运行同一个 Testbench，或分享一组重点观察信号。</p><p>布局按完整信号名、位宽和类型匹配，不会直接沿用旧数组下标。缺失信号、重名歧义或超出显示上限会给出提示；timescale 变化时重置视区和光标，避免误用旧时间。布局 JSON 上限 1 MiB。</p>`),
    section('capacity', '容量和进阶分析', `${table(['项目', '内置上限'], [['VCD 大小', '16 MiB'], ['信号数量', '4096'], ['变化点', '200000'], ['同时显示', '64 路'], ['布局 JSON', '1 MiB']])}<p>内置查看器适合小型 VCD。FST 或更大波形请使用外部工具/后端。所选信号的驱动源与 X 态查询需要另行配置 ${link('wave-mcp', 'wave-mcp')} 并为同一波形建立会话；基础 VCD 查看无需该后端。</p>`),
  ]),

  article('vendor', 'build', 'FPGA 厂商工程与构建', '连接 Diamond、TangDynasty 或 PDS，创建、同步和生成位流。', 12, '进阶', ['Diamond', 'TD', 'PDS', '构建'], [
    section('prepare', '准备本机厂商环境', `<p>XLXL 支持 Lattice Diamond、安路 TangDynasty 和紫光同创 PDS/PDS Lite。先安装对应软件，确认实际器件、封装、速度等级及许可证，再按 ${link('toolchains', '工具链配置')} 设置路径。</p>${table(['工具', '路径', '许可证设置'], [['Diamond', '<code>xlxl.diamondPath</code>', '<code>xlxl.diamondLicensePath</code>'], ['TangDynasty', '<code>xlxl.anlogicPath</code>', '<code>xlxl.anlogicLicensePath</code>'], ['PDS / PDS Lite', '<code>xlxl.pdsPath</code>', '<code>xlxl.pdsLicensePath</code>']])}<p>许可证可填写文件或端口@服务器。Diamond/TD 留空继承环境；PDS 留空继承 PANGO_LICENSE_FILE 或查找安装目录附近唯一许可证。具体要求以安装的软件和实际授权为准。</p>`),
    section('create', '先创建工程，再调整顶层', `<ol><li>打开工作区并保存已有设计源码；新工程不需要预先创建 project.json 或运行独立顶层设置命令。</li><li>点击 Project 标题栏“创建厂商工程”，或执行 <strong>XLXL: Initialize Project</strong>。</li><li>按 ${link('project', '实际创建向导')} 填厂商、器件、工程名及分支参数；扫描到源码时，向导中会询问设计顶层。</li><li>等待本机工具创建并验证 <code>prj/</code> 中的原生工程，成功后才写配置。</li><li>以后可运行 <strong>XLXL: Set Top Module</strong> 调整设计顶层，再进行同步。</li></ol><p>目录与厂商文件名详见 ${link('project', '完整工程目录')}，空工程尚未验证源码编译。已有 PDS 工程使用 <strong>XLXL: Attach PDS Project</strong> 前，必须已加载有效 XLXL 配置且 <code>toolchain.tool</code> 为 <code>pds</code>。它只确认所选 .pds 存在且非空，器件和编译仍需在 PDS 中验证。</p><p><strong>XLXL: Configure FPGA Vendor Flow</strong> 要求已有有效配置，选择厂商后打开配置文件，仍需填写真实 projectFile；TD 还需 buildScript 和适配版本的 buildArgs。它不是自动导入任意厂商工程的完整向导。</p>`),
    section('sync', '变更后先预览同步', `<p>增加/删除 HDL、调整 includePaths、defines、约束或顶层后，执行 <strong>XLXL: Sync Vendor Project</strong>。先关闭对应厂商工程 GUI，避免厂商软件同时写入工程。</p><ol><li>保存所有相关配置和源码。</li><li>查看同步预览，核对受管理文件增删与配置变更。</li><li>确认后应用，再检查同步结果。</li><li>需要排错时查看 <code>.xlxl/sync</code> 中的日志。</li></ol><p>同步会保护主工程备份并在失败时尝试恢复。配置变化或未保存编辑触发冲突时，先处理这些修改，再重新同步。</p>`),
    section('build', '构建并确认本次产物', `<p>运行 <strong>XLXL: Build FPGA Bitstream</strong>，在 <strong>XLXL FPGA Build</strong> 阅读实时日志。Diamond 和 PDS 可使用原生工程入口；TD 需要由厂商软件导出的 Tcl 构建流程。</p><p>插件会结合退出码、真实错误与本次新增/更新的非空产物判断结果，避免旧位流导致假成功。构建记录位于 <code>.xlxl/build/&lt;运行ID&gt;/result.json</code>；新建 Diamond 工程的 bit/jed 自动归集到 <code>fw/</code>。</p><p>构建支持取消和超时，<code>xlxl.vendorBuildTimeout</code> 默认 7200 秒。结束后默认打开 ${link('build-reports', '构建结果报告')}，失败和超时也保留报告。</p>`),
    section('vendor-limits', '厂商差异与限制', `<ul><li><strong>Diamond：</strong>设计含 SystemVerilog 时必须选择 Synplify Pro 并准备其许可证；LSE 不支持 SystemVerilog。</li><li><strong>TD：</strong>构建路径设为 <code>td_commands_prompt.exe</code>，Linux 为 <code>td_commands_prompt</code>；配置厂商导出 Tcl。宏值不能包含空白，复杂值可写进头文件。</li><li><strong>PDS：</strong>创建和构建使用 pds_shell；器件系列、封装和速度等级须与硬件及安装库匹配。</li><li><strong>中文路径：</strong>TD 提示路径不存在时，尝试把工程及引用文件移至英文目录。</li></ul>${note('XLXL 在此生成厂商构建产物；当前教程没有板卡烧录、JTAG 在线调试或时序收敛自动修复步骤。')}`),
  ]),

  article('build-reports', 'build', '阅读构建结果报告', '把构建状态、资源、时序与来源证据放在一起看，并比较兼容历史。', 8, '进阶', ['报告', '资源', '时序'], [
    section('open', '打开本次、历史或已有报告', `<p>厂商构建结束后，<code>xlxl.buildReport.openAfterBuild</code> 默认自动打开报告。也可在 Toolchain 点击“查看最近构建报告”，或运行 <strong>XLXL: Show Latest Build Report</strong> 并选择历史。</p><p>分析已有文件时，运行 <strong>XLXL: Analyze Existing Build Reports</strong>，先在<strong>选择报告工具</strong>中选择厂商，再在“选择厂商日志或报告”中多选相关日志/报告。手选来源会标注无法证明所属构建，不能把旧文件当作本轮新生成的结果。</p>`),
    section('status', '分开阅读构建与时序', `<p>先确认构建状态和产物，再查看独立的时序判断。构建成功不代表时序一定通过；时序字段缺失也不代表时序已被验证。</p><p>面板支持消息筛选、重复消息去重次数、资源使用量/容量/利用率、阶段耗时及来源快照。点击可验证的来源位置查看证据，结合原始日志理解异常。</p>${note('0 条约束路径、未约束提示、哨兵 slack 和缺失时序值，不会被解释为“时序通过”。', true)}`),
    section('support', '三家工具的解析范围', `${table(['厂商', '已验证的字段'], [['Diamond', 'Registers、SLICE、LUT4 使用量/容量；setup/hold slack；约束覆盖路径数；时钟 MHz；布局布线耗时与消息'], ['PDS', 'Total LUTs、Registers、DRM18K、APMs、I/O ports 使用量/容量；已识别阶段和耗时；未约束提示与消息；不推断 WNS/TNS'], ['TD', '已观察的消息、阶段命令与耗时；暂不支持资源与时序汇总']])}<p>未出现的指标保持缺失，不从其他数字猜测。自动收集仅分析可确认属于本次的输出范围：Diamond 未指定实现、TD 未确认输出目录时，可能仅分析本次构建日志。</p>`),
    section('history', '比较历史并检查来源', `<p>兼容历史差值要求工作区、厂商、工程、器件和实现一致，并且指标名称和单位匹配。满足条件时才比较资源等指标，避免把不同配置的构建放在同一基准上。</p><p>旧报告或只更新时间戳但内容不变的文件不计入本次指标。对异常跳变，先核对来源快照和实现，再看实际源码及约束变更。工作区切换后旧报告操作失效，需要重新打开当前报告。</p>`),
  ]),

  article('wave-mcp', 'simulation-group', '可选的 wave-mcp 分析', '为波形建立外部分析会话，查询层次、驱动源与近似 X 态证据。', 9, '进阶', ['wave-mcp', '驱动源', 'X 态'], [
    section('scope', '先核对分析前提', `<p>基础 VCD 查看无需 wave-mcp。进阶查询需要另装 stdio 后端，并满足：<strong>受信任的本地工作区、有效 XLXL 配置、与波形 Testbench 匹配的 simulationTopModule、已保存的源码/头文件和配置</strong>。Windows 可使用本地 Python 或 WSL。</p>${note('当前 XLXL 已验证 wave-mcp 协议交互与会话生命周期，但开发环境缺少真实后端，尚未完成真实后端端到端验收。请先用小波形验证本机组合。', true)}<p>FST 或更大波形可交给外部后端/查看器；高级查看器也需要另行安装。</p>`),
    section('configure', '配置后端并检查连接', `<ol><li>执行 <strong>XLXL: Wave MCP Setup Guide</strong>，按接入说明安装支持的后端。</li><li>执行 <strong>XLXL: Configure Wave MCP</strong>，依次选择运行环境、Python 路径；WSL 模式还会询问发行版。</li><li>配置写入工作区后会<strong>自动检查连接</strong>，在 XLXL Wave MCP 输出频道查看结果。</li><li>之后可用 <strong>XLXL: Check Wave MCP Connection</strong> 单独重查。</li></ol>${code('JSON', `{
  "xlxl.waveMcp.backend": "native",
  "xlxl.waveMcp.pythonPath": "",
  "xlxl.waveMcp.timeout": 180,
  "xlxl.waveMcp.afterSimulation": false
}`)}<p>pythonPath 留空时从 PATH 查找，必须指向已安装后端的环境。WSL 模式填写 Linux 路径，wslDistribution 留空使用默认发行版；Remote WSL 窗口使用 native。</p>`),
    section('analyze', '为当前波形创建匹配会话', `<p>先保存分析输入，核对 simulationTopModule，再对 VCD/FST 运行 <strong>XLXL: Analyze Waveform with Wave MCP</strong>。插件携带顶层、源码、包含目录和宏，创建独立分析会话。</p><p>波形信号查询提示没有匹配会话时，点击<strong>创建匹配会话</strong>，为当前波形重新分析；连接检查成功并不代表已有波形会话。单次请求受 <code>xlxl.waveMcp.timeout</code> 控制。</p><p>验证手动流程后，可开启 <code>xlxl.waveMcp.afterSimulation</code> 在仿真成功后自动分析，默认关闭。</p>`),
    section('query', '查询信号并返回源码', `<p>在波形查看器选择信号后，可查询驱动源或 X 态。结果以可展开树和原始 JSON 展示；能验证的源码位置提供跳转。无法唯一映射信号或验证位置时会说明原因，可改用 <strong>XLXL: Query Wave MCP</strong> 手动查询。</p><p>这些结果依赖后端能力与分析输入，X 态追踪属于近似分析，不应直接替代仿真和源码核对。可通过 <strong>XLXL: Open Wave MCP Viewer</strong> 调用另外安装的高级查看器。</p>`),
    section('lifecycle', '刷新、导出和停止', `<p>源文件、头文件、宏和工程配置变化后需重新分析；取消或切换工作区会停止过期操作。不要继续依赖旧会话的源码跳转。</p><p><strong>XLXL: Export Wave MCP Configuration</strong> 导出接入配置；<strong>XLXL: Stop Wave MCP</strong> 停止连接。连接失败先核对 Python 环境与后端安装，再看输出频道中的结构化错误。</p>`),
  ]),

  article('settings', 'reference', '设置参考', '按实际 1.1.2 配置字段查找默认值、路径规则与覆盖范围。', 8, '参考', ['设置', '默认值', '路径'], [
    section('open', '打开、保存和恢复设置', `<p>执行 <strong>XLXL: Open Settings</strong>，或在 VS Code 设置中搜索 <code>@ext:zhaiyl.xlxl</code>。可通过用户设置为所有工程设默认值，通过工作区设置为当前工程覆盖；工作区值优先。</p><p>工具路径建议使用“配置工具路径”向导，它会验证实际程序，并提供恢复自动扫描/内置版本的操作。工程源码范围、顶层、包含目录和宏保存在 <code>.xlxl/project.json</code>，不是下表中的 VS Code 全局设置。所有默认值来自 XLXL 1.1.2 的扩展声明。</p>`),
    section('paths', '工具路径与检测', renderSettings([0])),
    section('language', '语法、语义与格式化', renderSettings([1, 2])),
    section('execution', '仿真、构建与源码发现', renderSettings([3, 4, 5])),
  ]),

  article('commands', 'reference', '命令与快捷键', '按场景查找命令面板中的准确名称和 ID，快速连接界面与操作。', 7, '参考', ['命令', '快捷键', '入口'], [
    section('palette', '使用命令面板', `<p>按 <code>Ctrl+Shift+P</code>，输入 <code>XLXL</code>，按下表名称搜索。<strong>1.1.2 新增</strong> <strong>XLXL：使用教程</strong>（<code>xlxl.openTutorial</code>）；Toolchain 的“使用教程”和 Project 标题栏书本图标提供相同入口，1.1.1 没有这三处教程入口。</p><p>模块工具可从 Modules 节点或 HDL 编辑器右键进入；命令面板和编辑器入口会要求选择 DUT 定义，Modules 节点直接提供定义。下表只列允许显示在命令面板中的命令，内部连接定位、定义选择和诊断准备/应用入口由相应 UI 调用。</p>`),
    section('catalog', '1.1.2 命令列表', table(['命令面板名称', '命令 ID'], commandCatalog.map(item => [escapeHtml(item.title), `<code>${escapeHtml(item.command)}</code>`]))),
    section('shortcuts', 'VS Code 常用默认快捷键', `${table(['动作', '默认快捷键', '说明'], [['命令面板', '<code>Ctrl+Shift+P</code>', '搜索 XLXL 命令'], ['补全', '<code>Ctrl+Space</code>', '按上下文选择模块、端口、参数和成员'], ['定义', '<code>F12</code>', '定位声明/定义'], ['引用', '<code>Shift+F12</code>', '查找符号使用位置'], ['重命名', '<code>F2</code>', '等待语义刷新完成后使用'], ['格式化文档', '<code>Shift+Alt+F</code>', '选择 XLXL 为格式化器'], ['格式化选区', '<code>Ctrl+K</code>，再按 <code>Ctrl+F</code>', '按选区覆盖的行整理'], ['撤销', '<code>Ctrl+Z</code>', '撤销本次格式化或编辑']])}<p>以上为 VS Code 常见 Windows 默认键位，实际按键可能受系统、键位方案或个人设置影响；可通过“键盘快捷方式”查看和自定义。</p>`),
  ]),

  article('faq', 'reference', '常见问题与排错', '从症状找到检查路径，定位工具、工程范围、语义与波形问题。', 8, '参考', ['FAQ', '排错', '限制'], [
    section('tools-project', '工具未检测到，或 Project / Modules 为空', `<p><strong>工具路径：</strong>在“配置工具路径”中选择真实可执行文件或支持的安装目录。迁移电脑后清除旧显式路径，恢复自动扫描；也可把安装父目录加入 <code>xlxl.toolSearchPaths</code>。用户设置不生效时检查工作区和文件夹覆盖值。</p><p><strong>工程范围：</strong>检查 <code>.xlxl/project.json</code> 是否有效 JSON，sources 是否为字符串数组，glob 是否匹配真实目录与后缀。sources 为空数组不会扫描设计文件。没有工程配置时基础模块树默认只找 rtl/ 和 ip/；Slang 的工作区扫描与之不同。</p><p><strong>头文件或宏：</strong>includePaths 应包含真实头文件目录，defines 每项一个宏，例如 <code>"WIDTH=8"</code>。保存所有相关文件再运行磁盘检查。详细步骤见 ${link('project', '工程配置')} 和 ${link('toolchains', '工具链配置')}。</p>`),
    section('semantic-editor', '语义未启动，或导航/重命名异常', `<p><strong>语义启动：</strong>确认工作区受信任，<code>xlxl.semantic.enabled</code> 为 true，Windows x64 使用内置版本；其他平台需要可用的 Slang 路径。查看 <strong>XLXL Semantic LSP</strong> 输出，必要时运行 <strong>XLXL: Restart Semantic Server</strong>。</p><p><strong>重命名范围异常：</strong>打开提示涉及的文件，重启语义服务，等待刷新完成后重试。不要在工程或语义配置持续变化时提交重命名。</p><p><strong>没有未使用淡化：</strong>启用 VS Code <code>editor.showUnused</code>，核对设计和仿真顶层。仅赋值未读取的信号仍可有警告；厂商加密 IP、缺失模型和不可解析依赖也会影响分析。</p><p><strong>格式化失败：</strong>检查代码语法和 Verible 路径，在 <strong>XLXL Formatter</strong> 查看原因。语法不完整的选区可能无法单独整理。</p>`),
    section('sim-build', '没有波形，或构建结果不符合预期', `<p><strong>仿真无 VCD：</strong>先确认 Icarus 编译与 vvp 运行成功，再检查 Testbench 的 dumpfile/dumpvars 是否执行，模块名是否正确，以及仿真是否正常结束。插件只自动打开本次新增或更新的波形，不复用旧结果。</p><p><strong>波形打不开：</strong>确认文件完整写完，且没有超过 16 MiB、4096 信号和 20 万变化点上限；同时显示最多 64 路。FST 或大波形使用外部工具。驱动源/X 态查询需要另装 wave-mcp，不是基础 VCD 功能。</p><p><strong>构建失败：</strong>查看 XLXL FPGA Build。Diamond 的 SV 设计需 Synplify Pro 许可证；TD 需要导出 Tcl 和 td_commands_prompt 入口。TD 中文路径异常可尝试英文目录，宏值不可含空白。</p><p><strong>构建成功但时序未通过：</strong>分别检查产物与时序证据。未约束、0 路径或指标缺失不会自动变成“时序通过”；PDS/TD 可解析字段见 ${link('build-reports', '构建报告')}。</p>`),
    section('logs-limits', '日志与能力边界', `${table(['场景', '日志入口'], [['外部语法检查', 'XLXL'], ['语义服务', 'XLXL Semantic LSP'], ['格式化', 'XLXL Formatter'], ['Icarus 仿真', 'XLXL Simulation'], ['厂商构建', 'XLXL FPGA Build'], ['可选波形后端', 'XLXL Wave MCP'], ['厂商同步', '<code>.xlxl/sync</code>'], ['构建状态记录', '<code>.xlxl/build/&lt;运行ID&gt;/result.json</code>']])}<p>多文件夹工作区使用第一个文件夹。模块连接图展示直接 RTL；信号追踪是静态可能依赖；生成 Testbench 是骨架；Online Debug (RVL) 是文件分组。加密 IP 或缺失厂商库需要可解析模型及相应宏。XLXL 使用 MIT 许可，第三方组件许可随扩展附带。</p><p>排错时优先记录本机系统、XLXL 版本、选择的工具、最小复现文件以及对应日志，避免只截取最后一行错误。</p>`),
  ]),
];
