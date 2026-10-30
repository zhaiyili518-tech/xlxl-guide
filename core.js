export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export function resolveRoute(hash, articles) {
  if (!hash || hash === '#' || hash === '#/' || hash === '#/home') return {type:'home'};
  let path;
  try { path = decodeURIComponent(hash.replace(/^#/,'')); } catch { return {type:'not-found'}; }
  const match = /^\/docs\/([a-z0-9-]+)$/.exec(path);
  return match && articles.some(a => a.id === match[1]) ? {type:'doc',id:match[1]} : {type:'not-found'};
}

export function searchArticles(articles, query) {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  return articles.map(a => {
    const title = a.title.toLowerCase();
    const tags = (a.tags || []).join(' ').toLowerCase();
    const summary = a.description.toLowerCase();
    const body = a.sections.map(s => s.title + ' ' + htmlText(s.html)).join(' ').toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (!(title + tags + summary + body).includes(token)) return null;
      score += (title.includes(token) ? 12 : 0) + (tags.includes(token) ? 6 : 0) + (summary.includes(token) ? 3 : 0) + (body.includes(token) ? 1 : 0);
    }
    return {article:a,score};
  }).filter(Boolean).sort((a,b) => b.score-a.score).map(x=>x.article);
}

function htmlText(html) {
  const named={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
  return html.replace(/<[^>]*>/g,' ').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(whole,entity)=>{
    if(entity[0]!=='#')return named[entity.toLowerCase()]||whole;
    const hex=entity[1].toLowerCase()==='x';
    const point=Number.parseInt(entity.slice(hex?2:1),hex?16:10);
    return point>0&&point<=0x10ffff?String.fromCodePoint(point):whole;
  });
}
