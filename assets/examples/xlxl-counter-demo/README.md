# XLXL 计数器入门工程

一个可直接打开的 Verilog 工程：8 位计数器、带自检的 Testbench，以及 XLXL 工程配置。适合练习工程识别、模块导航、Icarus 仿真和 VCD 波形查看。
> **示例范围**：此下载包是精简的 Icarus 仿真练习工程，只含 `.xlxl/project.json`、`rtl/counter.v`、`sim/tb_counter.v` 和本说明；不是“创建厂商工程”向导生成的完整目录。完整工程另有 `doc/`、`prj/`、`constraints/`、`rvl/`、`ip/`、`fw/`、`include/` 等目录，请通过插件向导创建。

## 1. 准备环境

- 安装 VS Code 1.85 或更新版本。
- 获取项目提供的 `xlxl-1.1.2.vsix`，在 VS Code 扩展面板的“…”菜单选择“从 VSIX 安装…”，或执行 `code --install-extension .\xlxl-1.1.2.vsix`。安装后在扩展详情页确认插件 ID 为 `zhaiyl.xlxl`。
- 安装 Icarus Verilog，确保 `iverilog` 与 `vvp` 可用。
- 解压 ZIP 后，用 VS Code 的“文件 → 打开文件夹”打开 **xlxl-counter-demo 文件夹本身**。该目录应直接包含 `.xlxl`、`rtl` 和 `sim`。

本示例已经提供 `.xlxl/project.json`，无需重新创建厂商工程。

## 2. 检测工具并检查工程

按 `Ctrl+Shift+P` 打开命令面板，依次执行：

1. `XLXL: Detect Toolchains`（`xlxl.detectToolchains`）检测本机工具。
2. 如果没有发现 Icarus，执行 `XLXL: Configure Tool Path`（`xlxl.configureToolPath`），或在设置中指定 `xlxl.iverilogPath` 为本机的 `iverilog.exe` / 安装目录；需要时设置 `xlxl.vvpPath`。
3. 执行 `XLXL: Refresh Project`（`xlxl.refreshProject`）刷新工程。
4. 执行 `XLXL: Select Syntax Checker`（`xlxl.selectSyntaxTool`），选择 Icarus Verilog。
5. 执行 `XLXL: Check HDL Project`（`xlxl.checkProject`）检查工程。

XLXL 侧栏的 Modules 视图会显示模块。设计顶层为 `counter`，仿真顶层为 `tb_counter`；它们已经在配置中分别指定。

## 3. 仿真并查看波形

执行 `XLXL: Simulate Project with Icarus`（`xlxl.simulateProject`）。

输出面板 `XLXL Simulation` 应出现：

```text
PASS: reset, count, pause, resume and wraparound
仿真完成：tb_counter
```

Testbench 使用 10 ns 时钟周期，并检查初始复位、递增、暂停保持、继续计数、255 到 0 的回绕，以及不在时钟上升沿发生的异步复位。正常情况约在 2636 ns 结束；错误时使用 `$fatal` 返回失败。

工程根目录会生成 `wave.vcd`。默认设置下仿真后会打开波形，也可执行 `XLXL: Open VCD Waveform`（`xlxl.openWaveform`）手动打开。添加 `tb_counter` 下的 `clk`、`rst_n`、`enable`、`count`；先缩放到 0–120 ns，观察复位、计数、暂停和继续，再查看约 2605 ns 的回绕。

如果没有波形，先检查输出面板中的编译或运行错误，再确认 Testbench 的 `$dumpfile` / `$dumpvars` 正在执行。

## 4. 在终端独立验证

在工程根目录打开 PowerShell；以下命令要求 Icarus 已加入 PATH：

```powershell
iverilog -g2012 -Wall -s tb_counter -o simulation.vvp rtl/counter.v sim/tb_counter.v
vvp simulation.vvp
```

只有第一条命令成功后再执行第二条。成功时输出相同的 `PASS`，并生成 `wave.vcd`。仿真无需 FPGA 板卡、引脚约束或厂商工具链。

## 5. 文件说明

```text
xlxl-counter-demo/
├── .xlxl/project.json   # 工程名、设计顶层、仿真顶层和源文件范围
├── rtl/counter.v        # 可综合的参数化计数器，WIDTH 默认为 8
├── sim/tb_counter.v     # 自检激励和 VCD 输出，示例按 8 位检查
└── README.md
```

`sim/` 保存你编写的 Testbench 源文件；插件运行仿真后生成的 `.xlxl/sim/<id>/` 是编译产物与结果记录的缓存目录，两者用途不同。本例从工程根目录启动仿真，且 `$dumpfile("wave.vcd")` 使用相对路径，因此波形输出到工程根目录的 `wave.vcd`。
`counter.v` 只在 `enable=1` 的时钟上升沿加一；`rst_n=0` 时异步清零。修改计数器后重新仿真，利用自检结果和波形验证行为。