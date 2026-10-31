import { groups, articles } from './content.js';
import { escapeHtml as esc, resolveRoute, searchArticles } from './core.js';

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const icons = {
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  code:'<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3Z"/><path d="M3 10h18"/>',
  wave:'<path d="M2 16h4V7h5v9h5V7h6"/>',
  trace:'<rect x="2" y="8" width="6" height="8" rx="1"/><rect x="16" y="2" width="6" height="7" rx="1"/><rect x="16" y="15" width="6" height="7" rx="1"/><path d="M8 12h4V5h4m-4 7v7h4"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  terminal:'<path d="m5 7 5 5-5 5m8 0h6"/><rect x="2" y="3" width="20" height="18" rx="3"/>',
  book:'<path d="M12 5v16M3 4h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v15h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon:'<path d="M20.5 13A8.5 8.5 0 0 1 11 3.5a8.5 8.5 0 1 0 9.5 9.5Z"/>',
  copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v13h5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  chip:'<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M8 2v3m8-3v3M8 19v3m8-3v3M2 8h3m-3 8h3m14-8h3m-3 8h3"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
};
function icon(name,size=18) {return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.book}</svg>`;}
function storageGet(key,fallback=null){try{return localStorage.getItem(key)??fallback;}catch{return fallback;}}
function storageSet(key,value){try{localStorage.setItem(key,value);return true;}catch{return false;}}
let completed;
try { completed = new Set(JSON.parse(storageGet('xlxl-completed','[]')).filter(id=>articles.some(a=>a.id===id))); } catch { completed = new Set(); }
let route = resolveRoute(location.hash,articles);
let tocObserver;
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2600);}
function article(id){return articles.find(a=>a.id===id);}
function groupTitle(id){return groups.find(g=>g.id===id)?.title||'使用教程';}
function highlightCode(text){
  const token=/(\/\/[^\n]*|"(?:\\.|[^"\\])*"|\b(?:module|endmodule|parameter|input|output|wire|reg|logic|always|begin|end|if|else|initial|endcase|case|assign|posedge|negedge)\b|\b\d+(?:'[bdhBDH][0-9a-fA-FxXzZ_]+)?\b|\$[a-zA-Z]+)/g;
  let last=0,result='',m;
  while((m=token.exec(text))){result+=esc(text.slice(last,m.index));const t=m[0];const cls=t.startsWith('//')?'comment':t.startsWith('"')?'string':/^\d/.test(t)?'number':t.startsWith('$')?'signal':'key';result+=`<span class="syntax-${cls}">${esc(t)}</span>`;last=token.lastIndex;}
  return result+esc(text.slice(last));
}
const demoCode={
  rtl:`// 一个可暂停的 8 位计数器
module counter #(
  parameter WIDTH = 8
)(
  input  wire             clk,
  input  wire             rst_n,
  input  wire             enable,
  output reg  [WIDTH-1:0]  count
);
  always @(posedge clk or negedge rst_n)
    if (!rst_n)     count <= 0;
    else if (enable) count <= count + 1;
endmodule`,
  tb:`\`timescale 1ns / 1ps
module tb_counter;
  reg clk = 0;
  always #5 clk = ~clk;

  // 完整激励与自检见可下载示例工程
  initial begin
    $dumpfile("wave.vcd");
    $dumpvars(0, tb_counter);
    // 复位、计数、暂停、恢复、回绕
    // 示例工程在 2636 ns 正常结束
  end
endmodule`
};
function renderCodeDemo(tab){
  const win=$('.editor-window');if(!win)return;
  $$('.editor-tabs button').forEach(b=>{b.classList.toggle('selected',b.dataset.demo===tab);b.setAttribute('aria-selected',b.dataset.demo===tab?'true':'false');});
  win.classList.toggle('hero-demo-wave',tab==='wave');
  if(tab==='wave'){
    $('.editor-code').innerHTML=`<div class="wave-demo"><div class="wave-scale"><span>0 ns</span><span>20 ns</span><span>40 ns</span><span>60 ns</span><span>80 ns</span></div><div class="wave-row"><span class="wave-label">clk</span><svg class="wave-drawing" viewBox="0 0 340 34" preserveAspectRatio="none" aria-label="时钟波形"><path d="M0 25h21V7h21v18h21V7h21v18h21V7h21v18h21V7h21v18h21V7h21v18h21V7h21v18h21V7h21v18h21V7h21v18h21" fill="none" stroke="#a7d7a3" stroke-width="1.5"/></svg></div><div class="wave-row"><span class="wave-label">rst_n</span><svg class="wave-drawing" viewBox="0 0 340 34" preserveAspectRatio="none"><path d="M0 25h84V7h256" fill="none" stroke="#a7d7a3" stroke-width="1.5"/></svg></div><div class="wave-row"><span class="wave-label">count[7:0]</span><svg class="wave-drawing" viewBox="0 0 340 34" preserveAspectRatio="none"><g fill="none" stroke="#85bea4" stroke-width="1.2"><path d="M0 7h98l7 18h42l7-18h35l7 18h42l7-18h35l7 18h53M0 25h98l7-18h42l7 18h35l7-18h42l7 18h35l7-18h53"/></g><g fill="#cae6ce" font-size="9" text-anchor="middle"><text x="49" y="20">00</text><text x="125" y="20">01</text><text x="173" y="20">02</text><text x="222" y="20">03</text><text x="269" y="20">04</text><text x="317" y="20">05</text></g><path d="M147 0v34" stroke="#e6bb7b" stroke-dasharray="3 3"/></svg></div><div class="wave-footer">A: 35 ns <span style="margin:0 14px">B: 65 ns</span> Δt: 30 ns</div></div>`;
    $('.floating-success strong').textContent='让时序问题，看得见';$('.floating-success small').textContent='VCD 查看 · 总线进制 · 双光标';
  }else{
    $('.editor-code').innerHTML=demoCode[tab].split('\n').map((line,i)=>`<div class="line"><span class="line-num">${i+1}</span><span>${highlightCode(line)||' '}</span></div>`).join('');
    $('.floating-success strong').textContent='从代码出发，完成一次仿真';$('.floating-success small').textContent='配套示例已通过 Icarus 自检';
  }
}
function renderHome(){
  const featureCards=[
    ['code','更专注地写 RTL','从模块例化、命名端口补全，到定义跳转与语义重命名。','editing','代码编辑与导航','Slang'],
    ['folder','把工程整理得井井有条','源码、IP、仿真与约束分类管理，独立选择设计和仿真顶层。','project','配置你的工程','Project'],
    ['wave','读懂每一次信号变化','Icarus 仿真接入 VCD 查看器，缩放、分组、双光标与精确总线进制。','waveform','仿真与波形','VCD'],
    ['trace','沿着信号，找到问题的来处','沿实例路径追踪端口、assign、组合与时序依赖，直接跳回源码。','signal-tracing','跨层信号追踪','v1.1'],
    ['chip','连接你的 FPGA 工具链','配置 Diamond、TD、PDS 工程，完成同步、构建与结果报告分析。','vendor','厂商工程与构建','FPGA'],
  ];
  $('#main').innerHTML=`<section class="hero"><div class="container hero-grid"><div class="hero-content"><a class="version-pill" href="#/docs/formatting"><span>v1.2.0</span> HDL 端口按最长字段对齐 ${icon('chevron',11)}</a><h1>从第一行 RTL，<br>到<em>看得见的波形。</em></h1><p class="hero-lead">在熟悉的 VS Code 里，串起 HDL 开发的每一步。<br>跟随 XLXL 教程，让编辑、工程与验证顺畅衔接。</p><div class="hero-buttons"><a class="button primary" href="#/docs/quickstart">开始第一个工程 ${icon('arrow',16)}</a><a class="button" href="#/docs/install">安装 XLXL ${icon('download',15)}</a></div><div class="hero-meta"><span>${icon('code',13)} Verilog / SystemVerilog</span><i></i><span>${icon('check',12)} VS Code 1.85+</span><i></i><span>MIT 开源许可</span></div></div><div class="editor-wrap"><div class="editor-window"><div class="editor-top"><span class="window-dots"><i></i><i></i><i></i></span><span>XLXL · counter-demo</span><span>VS CODE WORKFLOW</span></div><div class="editor-main"><aside class="editor-explorer" aria-label="示例工程文件"><div class="explorer-title">EXPLORER</div><div class="tree-root">⌄ counter-demo</div><div class="tree-item">⌄ rtl</div><div class="tree-item deep active"><span class="file-v">V</span>counter.v</div><div class="tree-item">⌄ sim</div><div class="tree-item deep"><span class="file-v">V</span>tb_counter.v</div><div class="tree-item">⌄ .xlxl</div><div class="tree-item deep">project.json</div></aside><div class="editor-area"><div class="editor-tabs" role="tablist" aria-label="示例演示"><button role="tab" class="selected" data-demo="rtl" aria-selected="true"><span class="file-v">V</span>counter.v</button><button role="tab" data-demo="tb" aria-selected="false"><span class="file-v">V</span>tb_counter.v</button><button role="tab" data-demo="wave" aria-selected="false"><span class="file-v">⌁</span>wave.vcd</button></div><div class="editor-code" role="tabpanel" aria-label="示例代码与波形"></div></div></div><div class="editor-status"><span>✓ XLXL · Verilog</span><span><span>UTF-8</span><span>Slang ready</span></span></div></div><div class="floating-success"><span class="success-icon">${icon('check',16)}</span><div><strong>从代码出发，完成一次仿真</strong><small>配套示例已通过 Icarus 自检</small></div></div><span class="demo-caption">精简仿真示例 · <a href="#/docs/project">完整工程目录 →</a></span></div></div></section>
  <div class="container"><div class="compatibility"><span class="compatibility-label">围绕你的 HDL 开发流程</span><div class="compatibility-tools"><span class="tool-tiny"><i></i><strong>Slang</strong> 语义分析</span><span class="tool-tiny"><i></i><strong>Verible</strong> 格式化</span><span class="tool-tiny"><i></i><strong>Icarus</strong> 仿真</span><span class="tool-tiny"><i></i><strong>Diamond · TD · PDS</strong></span></div></div></div>
  <section class="container learning-section"><div class="section-heading"><div><span class="eyebrow">YOUR FIRST WORKFLOW</span><h2>跟着做，跑通第一个工程</h2></div><a class="text-link" href="#/docs/quickstart">打开完整上手教程 ${icon('arrow',15)}</a></div><div class="learning-path">${[
    ['01','安装与准备','安装插件，认识工作区，准备本机工具。','install','从这里开始'],
    ['02','认识工程目录','对照插件生成的目录，分清源码与运行记录。','project','工程与目录'],
    ['03','编写与检查','补全、导航、格式化，及时发现问题。','editing','代码与诊断'],
    ['04','仿真与看波形','运行 Testbench，在波形中验证设计。','simulation','仿真与验证'],
  ].map(([n,title,desc,id,meta])=>`<a class="learning-step" href="#/docs/${id}"><div class="step-top"><span class="step-number">STEP ${n}</span>${icon('arrow',15)}</div><h3>${title}</h3><p>${desc}</p><div class="step-meta">${n==='01'?icon('book',11):icon('clock',11)} ${meta}</div></a>`).join('')}</div></section>
  <section class="feature-section"><div class="container"><div class="section-heading"><div><span class="eyebrow">BUILT FOR YOUR RTL</span><h2>熟悉的编辑器，完整的开发路径</h2></div><p>围绕 XLXL 的真实功能，逐步掌握每个工具。</p></div><div class="feature-grid">${featureCards.map(([ico,title,desc,id,label,tag])=>`<a class="feature-card ${id==='signal-tracing'?'feature-trace':''}" href="#/docs/${id}"><div><div class="feature-icon">${icon(ico,20)}</div><h3>${title}<span class="tag">${tag}</span></h3><p>${desc}</p><div class="feature-link"><span>${label}</span>${icon('arrow',14)}</div></div>${id==='signal-tracing'?'<div class="trace-illustration" aria-hidden="true"><div class="trace-box">top<small>bus[7:0]</small></div><div class="trace-line"></div><div class="trace-box">u_mid<small>req[7:0]</small></div><div class="trace-line"></div><div class="trace-box">u_leaf<small>data[7:0]</small></div></div>':''}</a>`).join('')}</div></div></section>
  <section class="container handbook-section"><div class="handbook-layout"><div class="handbook-intro"><span class="eyebrow">THE HANDBOOK</span><h2>开发手册，<br>随时查阅。</h2><p>${articles.length} 篇分类教程与功能参考。<br>从第一次安装，到一次更深入的调试，<br>这里都有可以照着做的步骤。</p><a class="text-link" href="#/docs/workspace">浏览全部文档 ${icon('arrow',15)}</a></div><div class="handbook-index">${[
    ['01','高效编辑','补全、导航、格式化与诊断','editing'],['02','工程与工具链','配置文件、源码范围与路径','project'],['03','模块工具','Testbench、文档与连接图','testbench'],['04','信号追踪','跨层连接、组合与时序依赖','signal-tracing'],['05','仿真与波形','Icarus、VCD 与波形布局','simulation'],['06','FPGA 构建','厂商工程与构建结果分析','vendor'],
  ].map(([n,t,d,id])=>`<a class="handbook-row" href="#/docs/${id}"><span class="row-number">${n}</span><div><h3>${t}</h3><p>${d}</p></div>${icon('chevron',13)}</a>`).join('')}</div></div></section>
  <section class="container cta-section"><div class="cta-box"><div><h2>把教程，变成你的第一个工程。</h2><p>下载计数器示例，跟随步骤完成编辑、仿真与波形查看。</p></div><a class="button" href="./assets/xlxl-counter-demo.zip" download>下载示例工程 ${icon('download',16)}</a></div></section>`;
  $$('[data-demo]').forEach(b=>b.addEventListener('click',()=>renderCodeDemo(b.dataset.demo)));
  $('.editor-tabs').addEventListener('keydown',event=>{
    if(!['ArrowRight','ArrowLeft'].includes(event.key))return;event.preventDefault();
    const tabs=$$('.editor-tabs button');const index=tabs.indexOf(document.activeElement);const next=(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();renderCodeDemo(tabs[next].dataset.demo);
  });
  renderCodeDemo('rtl');
}
function sidebar(id){return `<div class="sidebar-title">${icon('book',15)} XLXL 使用手册</div>${groups.map(g=>`<div class="sidebar-group"><h3>${esc(g.title)}</h3>${g.items.map(item=>{const a=article(item);return a?`<a href="#/docs/${a.id}" ${id===a.id?'class="current" aria-current="page"':''}>${esc(a.title)}${completed.has(a.id)?'<span class="sidebar-check" aria-label="已完成">✓</span>':''}</a>`:'';}).join('')}</div>`).join('')}<div class="sidebar-progress"><span>我的阅读进度</span><div class="progress-line"><span style="width:${completed.size/articles.length*100}%"></span></div><span>${completed.size} / ${articles.length} 篇已完成 · 保存在当前浏览器</span></div>`;}
function renderDoc(id){
  const a=article(id),order=groups.flatMap(g=>g.items),index=order.indexOf(id),prev=article(order[index-1]),next=article(order[index+1]);
  $('#main').innerHTML=`<div class="mobile-doc-bar"><button class="toggle-doc-nav" aria-expanded="false" aria-controls="docs-nav">${icon('menu',13)} 教程目录</button><a href="#/docs/${id}" data-scroll="article-top">${icon('book',12)} ${esc(groupTitle(a.group))}</a></div><div class="docs-shell"><aside class="docs-sidebar" id="docs-nav" aria-label="教程目录">${sidebar(id)}</aside><article class="docs-article" id="article-top"><nav class="breadcrumbs" aria-label="当前位置"><a href="#/">首页</a>${icon('chevron',10)}<span>${esc(groupTitle(a.group))}</span>${icon('chevron',10)}<span>${esc(a.title)}</span></nav><div class="article-kicker">XLXL HANDBOOK</div><h1>${esc(a.title)}</h1><p class="article-description">${esc(a.description)}</p><div class="article-meta"><span class="level-badge">${esc(a.level)}</span><span>${icon('clock',12)} 约 ${a.minutes} 分钟</span><span>适用版本 v1.2.0</span></div><div class="article-body">${a.sections.map(s=>`<section aria-labelledby="${esc(s.id)}"><h2 id="${esc(s.id)}">${esc(s.title)}<a href="#/docs/${id}" data-scroll="${esc(s.id)}" aria-label="跳到${esc(s.title)}">#</a></h2>${s.html}</section>`).join('')}</div><div class="read-complete"><span>跟着教程试过了？记录这一步。</span><button class="complete-button ${completed.has(id)?'done':''}" aria-pressed="${completed.has(id)}">${icon('check',14)} ${completed.has(id)?'已完成阅读':'标记为已完成'}</button></div><nav class="article-pager" aria-label="上下篇教程">${prev?`<a class="pager-link" href="#/docs/${prev.id}"><div class="pager-label">← 上一篇</div><div class="pager-title">${esc(prev.title)}</div></a>`:'<div></div>'}${next?`<a class="pager-link next" href="#/docs/${next.id}"><div class="pager-label">下一篇 →</div><div class="pager-title">${esc(next.title)}</div></a>`:'<a class="pager-link next" href="#/"><div class="pager-label">回到首页 →</div><div class="pager-title">继续探索 XLXL</div></a>'}</nav></article><aside class="doc-toc" aria-label="本页目录"><div class="toc-title">本页内容</div>${a.sections.map(s=>`<a href="#/docs/${id}" data-scroll="${esc(s.id)}">${esc(s.title)}</a>`).join('')}<div class="toc-divider"></div><a class="toc-download" href="./assets/xlxl-counter-demo.zip" download>${icon('download',13)} 下载示例工程</a><a href="#/docs/faq">遇到问题？查看排错指南 ↗</a></aside></div>`;
  $$('.article-body pre').forEach(pre=>{
    const lang=pre.dataset.lang||pre.querySelector('code')?.className.replace('language-','')||'CODE';
    const text=pre.textContent.replace(/^\n/,'').replace(/\n\s*$/,'');
    const wrap=document.createElement('div');wrap.className='code-block';
    const toolbar=document.createElement('div');toolbar.className='code-toolbar';
    toolbar.innerHTML=`<span>${esc(lang)}</span><button class="copy-button" aria-label="复制${esc(lang)}代码">${icon('copy',12)}<span>复制</span></button>`;
    pre.replaceWith(wrap);wrap.append(toolbar,pre);pre.innerHTML=`<code>${highlightCode(text)}</code>`;
    $('.copy-button',toolbar).addEventListener('click',async event=>{
      const button=event.currentTarget;
      try {await copyText(text);button.innerHTML=`${icon('check',12)}<span>已复制</span>`;setTimeout(()=>{if(button.isConnected)button.innerHTML=`${icon('copy',12)}<span>复制</span>`;},1800);} catch {toast('复制未成功，请选中代码后按 Ctrl+C');}
    });
  });
  $$('.article-body table').forEach(table=>{if(table.parentElement.classList.contains('table-wrap'))return;const wrap=document.createElement('div');wrap.className='table-wrap';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','参考表格，窄屏可横向滚动');table.replaceWith(wrap);wrap.append(table);});
  $('.complete-button').addEventListener('click',()=>{
    completed.has(id)?completed.delete(id):completed.add(id);
    const saved=storageSet('xlxl-completed',JSON.stringify([...completed]));
    const b=$('.complete-button');b.classList.toggle('done',completed.has(id));b.setAttribute('aria-pressed',String(completed.has(id)));b.innerHTML=`${icon('check',14)} ${completed.has(id)?'已完成阅读':'标记为已完成'}`;
    $('.docs-sidebar').innerHTML=sidebar(id);toast(saved?(completed.has(id)?'已记录这一步，继续探索吧':'已取消完成标记'):'当前浏览器无法保存进度，本次访问仍可记录');
  });
  $('.toggle-doc-nav').addEventListener('click',()=>{
    const b=$('.toggle-doc-nav'),side=$('.docs-sidebar');side.classList.toggle('open');b.setAttribute('aria-expanded',side.classList.contains('open')?'true':'false');
  });
  if('IntersectionObserver' in window){
    tocObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){$$('.doc-toc [data-scroll]').forEach(x=>x.classList.toggle('active',x.dataset.scroll===entry.target.id));}}},{rootMargin:'-100px 0px -65% 0px'});
    $$('.article-body h2').forEach(h=>tocObserver.observe(h));
  }
}
async function copyText(text){
  if(navigator.clipboard?.writeText){try{return await navigator.clipboard.writeText(text);}catch{}}
  const input=document.createElement('textarea');input.value=text;input.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(input);input.select();const ok=document.execCommand('copy');input.remove();if(!ok)throw new Error('Clipboard unavailable');
}
function render(){
  tocObserver?.disconnect();route=resolveRoute(location.hash,articles);
  document.body.dataset.page=route.type;
  $$('.desktop-nav a').forEach(a=>{const type=route.type==='home'?'home':route.id==='faq'?'faq':['settings','commands'].includes(route.id)?'reference':'docs';a.classList.toggle('active',a.dataset.nav===type);if(a.dataset.nav===type)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  if(route.type==='home'){renderHome();document.title='XLXL · 从 RTL 到波形的每一步';}
  else if(route.type==='doc'){renderDoc(route.id);document.title=`${article(route.id).title} · XLXL 教程`;}
  else {$('#main').innerHTML=`<section class="not-found"><span class="eyebrow">404 · PAGE NOT FOUND</span><h1>这条路径，还没有连接。</h1><p>教程地址可能有误，你可以回到首页，或搜索需要的功能。</p><a class="button primary" href="#/">返回首页 ${icon('arrow',15)}</a><button class="button open-search">搜索教程 ${icon('book',15)}</button></section>`;$('.open-search').addEventListener('click',openSearch);document.title='页面未找到 · XLXL';}
  $('.mobile-nav').hidden=true;$('.mobile-toggle').setAttribute('aria-expanded','false');window.scrollTo({top:0,behavior:'instant'});
}
function updateThemeButton(){const dark=document.documentElement.dataset.theme==='dark';$('.theme-toggle').innerHTML=icon(dark?'sun':'moon',18);$('.theme-toggle').setAttribute('aria-label',dark?'切换浅色模式':'切换深色模式');$('.theme-toggle').title=dark?'切换浅色模式':'切换深色模式';}
$('.theme-toggle').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme==='dark';document.documentElement.dataset.theme=dark?'light':'dark';storageSet('xlxl-theme',dark?'light':'dark');updateThemeButton();});
$('.mobile-toggle').addEventListener('click',()=>{const nav=$('.mobile-nav');nav.hidden=!nav.hidden;$('.mobile-toggle').setAttribute('aria-expanded',String(!nav.hidden));});
document.addEventListener('click',event=>{
  const scroll=event.target.closest('[data-scroll]');if(scroll){event.preventDefault();document.getElementById(scroll.dataset.scroll)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});return;}
  if(event.target.closest('.skip-link')){event.preventDefault();$('#main').focus();$('#main').scrollIntoView();return;}
  if(event.target.closest('.docs-sidebar a')){$('.docs-sidebar')?.classList.remove('open');$('.toggle-doc-nav')?.setAttribute('aria-expanded','false');}
  if(event.target.closest('.mobile-nav a')){$('.mobile-nav').hidden=true;$('.mobile-toggle').setAttribute('aria-expanded','false');}
});
const dialog=$('#search-dialog');let searchIndex=0;let searchMatches=[];let searchReturnFocus;
function openSearch(){searchReturnFocus=document.activeElement;dialog.showModal();$('#search-input').value='';searchIndex=0;renderSearch();$('#search-input').focus();}
function closeSearch(){dialog.close();searchReturnFocus?.focus();}
function renderSearch(){
  const q=$('#search-input').value.trim();searchIndex=0;
  if(!q){searchMatches=[];$('#search-results').innerHTML=`<div class="search-prompt"><strong>从一个问题，找到下一步。</strong><p>搜索教程标题、正文、命令与设置。</p><div class="search-quick">${['快速上手','仿真','信号追踪','格式化','工具路径'].map(t=>`<button data-query="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>`;$$('[data-query]').forEach(b=>b.addEventListener('click',()=>{$('#search-input').value=b.dataset.query;renderSearch();$('#search-input').focus();}));return;}
  searchMatches=searchArticles(articles,q);
  if(!searchMatches.length){$('#search-results').innerHTML=`<div class="empty-search"><strong>没有找到相关教程</strong>试试「仿真」「顶层」或具体设置名称。</div>`;return;}
  $('#search-results').innerHTML=`<div class="search-count">找到 ${searchMatches.length} 篇相关文档</div>${searchMatches.map((a,i)=>`<div role="listitem"><a class="search-result ${i===0?'selected':''}" href="#/docs/${a.id}"><div class="result-group">${esc(groupTitle(a.group))}</div><strong>${esc(a.title)}</strong><small>${esc(a.description)}</small></a></div>`).join('')}`;
  $$('.search-result').forEach(a=>a.addEventListener('click',closeSearch));
}
$('#search-input').addEventListener('input',renderSearch);
$('.search-trigger').addEventListener('click',openSearch);$('.close-search').addEventListener('click',closeSearch);
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeSearch();}});
dialog.addEventListener('keydown',event=>{
  if(['ArrowDown','ArrowUp'].includes(event.key)&&searchMatches.length){event.preventDefault();searchIndex=(searchIndex+(event.key==='ArrowDown'?1:-1)+searchMatches.length)%searchMatches.length;$$('.search-result').forEach((a,i)=>{a.classList.toggle('selected',i===searchIndex);if(i===searchIndex)a.scrollIntoView({block:'nearest'});});}
  if(event.key==='Enter'&&searchMatches[searchIndex]&&event.target===$('#search-input')){event.preventDefault();location.hash=`/docs/${searchMatches[searchIndex].id}`;closeSearch();}
});
document.addEventListener('keydown',event=>{
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();dialog.open?closeSearch():openSearch();}
  if(event.key==='Escape'){$('.docs-sidebar')?.classList.remove('open');$('.toggle-doc-nav')?.setAttribute('aria-expanded','false');$('.mobile-nav').hidden=true;$('.mobile-toggle').setAttribute('aria-expanded','false');}
});
window.addEventListener('hashchange',render);updateThemeButton();render();
