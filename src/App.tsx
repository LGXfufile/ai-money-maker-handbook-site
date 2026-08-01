import { FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, Code2, Compass, HandHeart, Heart, Menu, MessageCircle, Moon, Play, Rocket, Search, Sparkles, Sun, Users, X } from 'lucide-react'
import { marked } from 'marked'

type Article = { path: string; title: string; category: string; content: string; number: number }
const files = import.meta.glob('../**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const cleanTitle = (text: string, path: string) => text.match(/^#\s+(.+)$/m)?.[1]?.replace(/[*`]/g, '').trim() || path.split('/').pop()!.replace(/\.md$/, '')
const articles: Article[] = Object.entries(files)
  .filter(([path]) => !path.includes('node_modules') && !/\/(README|README_en|README_jp|README_kr|CLAUDE|DATA_UPDATE)\.md$/.test(path))
  .map(([path, content]) => { const relative = path.replace(/^\.\.\//, ''); const match = relative.match(/ch(\d+)/); return { path: relative, title: cleanTitle(content, relative), category: relative.split('/')[0], content, number: match ? Number(match[1]) : 0 } })
  .sort((a, b) => b.number - a.number)
const categories = ['全部', ...Array.from(new Set(articles.map(item => item.category)))]

const services = [
  { icon: Compass, step: '01', title: '方向诊断', desc: '聊聊你的能力、时间和期待，专人帮你筛掉伪机会，找到更适合你的起点。', tone: 'sage' },
  { icon: HandHeart, step: '02', title: '方案代做', desc: '不只是告诉你用什么软件。我们可以陪你完成定位、产品、页面和第一轮发布。', tone: 'clay' },
  { icon: Rocket, step: '03', title: '落地陪跑', desc: '从第一个用户到第一次收入，遇到卡点随时有人商量，一起把小事慢慢做成。', tone: 'blue' }
]
const stories = [
  { quote: '以前收藏了很多教程，却一直不知道先做什么。聊完后我们砍掉了 80% 的想法，两周做出了第一个能收费的小工具。', name: '阿哲', role: '产品经理 · 杭州', result: '首月获得 17 位付费用户', color: '#d97455' },
  { quote: '我不懂代码，团队没有让我硬学工具，而是先从我熟悉的母婴内容切入。第一次觉得 AI 不是压力，而是帮手。', name: '小雨', role: '自由职业者 · 成都', result: '建立自己的内容工作流', color: '#648f7b' },
  { quote: '最有价值的不是答案，是有人在我想放弃的时候说：我们再试一个更小的版本。', name: '林叔', role: '传统行业创业者 · 佛山', result: '完成首个 AI 服务交付', color: '#6d7f9a' }
]

export default function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('全部')
  const [selected, setSelected] = useState<Article | null>(null)
  const [menu, setMenu] = useState(false)
  const [showConsult, setShowConsult] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark' || matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('theme', dark ? 'dark' : 'light') }, [dark])
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [selected])
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowConsult(false); if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); document.getElementById('search')?.focus() } }; addEventListener('keydown', onKey); return () => removeEventListener('keydown', onKey) }, [])
  const filtered = useMemo(() => { const needle = query.toLowerCase().trim(); return articles.filter(item => (category === '全部' || item.category === category) && (!needle || `${item.title} ${item.content}`.toLowerCase().includes(needle))) }, [query, category])
  if (selected) return <Reader article={selected} onBack={() => setSelected(null)} dark={dark} toggleTheme={() => setDark(v => !v)} />

  return <div className="site-shell">
    <header className="nav-wrap"><nav className="nav" aria-label="主导航">
      <a className="brand" href="#top"><span className="brand-mark"><Heart size={16} fill="currentColor" /></span><span>暖行 AI</span><small>一起把想法做成</small></a>
      <div className={`nav-links ${menu ? 'open' : ''}`}><a href="#services" onClick={() => setMenu(false)}>我们的服务</a><a href="#stories" onClick={() => setMenu(false)}>真实故事</a><a href="#library" onClick={() => setMenu(false)}>方案库</a><a href="#about" onClick={() => setMenu(false)}>认识我们</a></div>
      <div className="nav-actions"><button className="text-button" onClick={() => setShowConsult(true)}>和我们聊聊 <ArrowUpRight size={14}/></button><button className="icon-button" onClick={() => setDark(v => !v)} aria-label="切换主题">{dark ? <Sun/> : <Moon/>}</button><button className="icon-button mobile-only" onClick={() => setMenu(v => !v)} aria-label="打开菜单">{menu ? <X/> : <Menu/>}</button></div>
    </nav></header>

    <main id="top">
      <section className="hero-new">
        <div className="hero-copy reveal"><div className="eyebrow"><span className="pulse-avatar">暖</span> 这次，不必一个人摸索</div><h1>你的 AI 副业，<br/><em>有人陪你</em>慢慢做。</h1><p>我们不只整理工具和教程。这里有真实可用的方案，也有一群愿意听你说、陪你找方向、替你把第一步做出来的人。</p><div className="hero-actions"><button className="primary-button" onClick={() => setShowConsult(true)}>找专人聊聊 <ArrowRight/></button><a className="secondary-button" href="#library">先看看方案 <ChevronDown/></a></div><div className="trust-row"><div className="avatar-stack"><span>晴</span><span>林</span><span>舟</span><span>+</span></div><p><strong>今天已有 12 位伙伴来聊过</strong><br/>平均 3 小时内回复，不销售、不催促</p></div></div>
        <div className="hero-visual reveal delay-1"><img src="/images/team-hero.jpg" alt="暖行 AI 团队在自然光工作室里一起讨论项目" fetchPriority="high"/><div className="image-caption"><span className="sound-wave"><i/><i/><i/><i/></span><div><strong>“先别急着选工具，跟我们说说你真正想做什么。”</strong><small>来自今天的陪跑对话</small></div></div><div className="floating-note"><Sparkles/><span>每个普通人的经验<br/>都值得变成一份事业</span></div></div>
      </section>

      <section className="ticker" aria-label="服务承诺"><div><span>不贩卖焦虑</span><i>✦</i><span>真实的人在回复</span><i>✦</i><span>从一个小行动开始</span><i>✦</i><span>适合你，比热门更重要</span><i>✦</i><span>不贩卖焦虑</span><i>✦</i><span>真实的人在回复</span></div></section>

      <section className="warm-intro" id="about"><div className="section-kicker">A NOTE FROM US · 写给正在犹豫的你</div><div className="intro-grid"><h2>我们知道，真正难的<br/>从来不是找到更多工具。</h2><div><p>难的是下班后只有两个小时，不知道该押在哪个方向；是收藏了几百篇教程，却还是担心自己“不够懂”；是一个人做决定时，没有人告诉你——现在这样已经很好。</p><p>所以我们做了这个地方。方案库给你地图，<strong>暖行团队陪你走一段路。</strong></p><div className="signature">暖行 AI 团队 <span>2026 · 杭州 / 上海</span></div></div></div></section>

      <section className="services" id="services"><div className="service-image"><img src="/images/mentoring.jpg" alt="陪跑顾问和用户一起梳理行动路径" loading="lazy"/><div className="photo-label"><span>真人陪伴</span><strong>一对一梳理，不用准备完美答案</strong></div></div><div className="service-content"><div className="section-kicker">WE CAN HELP · 我们能替你做什么</div><h2>不是把软件扔给你，<br/>是和你一起把事做完。</h2><div className="service-list">{services.map(({icon: Icon, ...item}) => <div className={`service-item ${item.tone}`} key={item.title}><div className="service-icon"><Icon/></div><div><span>{item.step}</span><h3>{item.title}</h3><p>{item.desc}</p></div></div>)}</div><button className="primary-button warm" onClick={() => setShowConsult(true)}>告诉我们你的难题 <MessageCircle/></button></div></section>

      <section className="stories" id="stories"><div className="section-heading-centered"><div className="section-kicker">REAL PEOPLE, REAL STARTS · 真实的开始</div><h2>他们也曾卡在第一步。</h2><p>没有“一夜暴富”的神话，只有一些普通人认真迈出的第一步。</p></div><div className="story-grid">{stories.map((story, i) => <article className="story-card" key={story.name} style={{'--story': story.color} as React.CSSProperties}><div className="quote-mark">“</div><p>{story.quote}</p><div className="story-person"><span className="story-avatar">{story.name[0]}</span><div><strong>{story.name}</strong><small>{story.role}</small></div></div><div className="story-result"><Check/> {story.result}</div><span className="story-index">0{i + 1}</span></article>)}</div></section>

      <section className="library-new" id="library"><div className="library-head"><div><div className="section-kicker">IDEA LIBRARY · 免费开放的方案库</div><h2>{articles.length} 个起点，<br/>等你挑一个试试。</h2></div><p>不知道从哪里开始也没关系。输入你会的、喜欢的，或者最近在意的事。</p></div><div className="search-panel"><Search/><input id="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="试试搜索：写作、短视频、设计、出海…"/><kbd>⌘ K</kbd></div><div className="category-pills">{categories.slice(0, 7).map(item => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item === '全部' ? '全部方案' : item}</button>)}</div><div className="card-grid">{filtered.slice(0, 9).map((item, index) => <button className="article-card" key={item.path} onClick={() => setSelected(item)}><div className="card-visual"><span>{String(item.number || index + 1).padStart(3, '0')}</span><div className="mini-orbit"><i/><i/><i/></div><ArrowUpRight/></div><div className="card-body"><span className="tag">{item.category}</span><h3>{item.title}</h3><p>从真实经验出发，看看这条路如何拆成可以行动的步骤。</p></div><div className="card-footer"><span>打开方案</span><span>约 {Math.max(3, Math.round(item.content.length / 600))} 分钟</span></div></button>)}</div>{filtered.length > 9 && <button className="more-button" onClick={() => { setQuery(''); document.getElementById('search')?.focus() }}>搜索全部 {filtered.length} 个方案 <ArrowRight/></button>}</section>

      <section className="human-cta"><div className="cta-illustration"><div className="orbit o1"/><div className="orbit o2"/><span className="cta-face">☺</span><span className="floating-heart">♥</span></div><div><div className="section-kicker">ONE SMALL CONVERSATION</div><h2>也许你缺的，<br/>只是一次有人认真听的对话。</h2><p>写下你现在的处境。由真人伙伴回复，第一次沟通免费，也不需要你立刻做决定。</p><button className="primary-button light" onClick={() => setShowConsult(true)}>我想和你们聊聊 <ArrowRight/></button></div><div className="cta-promise"><Users/><span><strong>不是机器人客服</strong><br/>每一条都会被认真读完</span></div></section>
    </main>
    <footer><div><a className="brand" href="#top"><span className="brand-mark"><Heart size={16} fill="currentColor"/></span>暖行 AI</a><p>让每一个普通人的想法，都有人认真对待。</p></div><div className="footer-links"><a href="#services">陪跑服务</a><a href="#library">方案库</a><a href="https://github.com/XiaomingX/ai-money-maker-handbook" target="_blank" rel="noreferrer"><Code2/> 内容来源</a></div><small>内容基于 XiaomingX 开源项目 · Apache 2.0</small></footer>
    {showConsult && <ConsultModal onClose={() => setShowConsult(false)}/>} 
  </div>
}

function ConsultModal({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle')
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setStatus('sending'); const data = Object.fromEntries(new FormData(e.currentTarget)); try { const res = await fetch('/api/consult', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }); if (!res.ok) throw new Error(); setStatus('success') } catch { setStatus('error') } }
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="consult-modal" role="dialog" aria-modal="true" aria-labelledby="consult-title"><button className="modal-close" onClick={onClose} aria-label="关闭"><X/></button>{status === 'success' ? <div className="success-state"><span>♥</span><h2>收到啦，我们会认真读完。</h2><p>真人伙伴会在 3 小时内通过你留下的联系方式回复。谢谢你愿意把想法告诉我们。</p><button className="primary-button" onClick={onClose}>先去逛逛方案库</button></div> : <><div className="modal-welcome"><span className="pulse-avatar">暖</span><div><small>暖行伙伴正在值班</small><strong>先说说你现在卡在哪里吧</strong></div></div><h2 id="consult-title">不用组织得很完美，<br/>想到什么就说什么。</h2><form onSubmit={submit}><label>怎么称呼你？<input name="name" required maxLength={30} placeholder="你的昵称"/></label><label>方便在哪里联系你？<input name="contact" required maxLength={80} placeholder="微信号 / 手机号 / 邮箱"/></label><label>你最近在为什么发愁？<textarea name="need" required maxLength={800} rows={5} placeholder="比如：会做设计，想用 AI 接单，但不知道怎么找到第一个客户…"/></label><button className="primary-button form-submit" disabled={status === 'sending'}>{status === 'sending' ? '正在送到伙伴手中…' : '送出我的想法'} <ArrowRight/></button>{status === 'error' && <p className="form-error">暂时没送成功，请稍后再试一次。</p>}<p className="privacy-note">我们只会用这些信息回复你，不群发、不转交。</p></form></>}</div></div>
}

function Reader({ article, onBack, dark, toggleTheme }: { article: Article; onBack: () => void; dark: boolean; toggleTheme: () => void }) { const html = useMemo(() => marked.parse(article.content, { breaks: true }) as string, [article]); return <div className="reader-shell"><header className="reader-nav"><button className="back-button" onClick={onBack}><ArrowLeft/> 返回方案库</button><span className="reader-brand">暖行 AI · 给你地图，也陪你走</span><button className="icon-button" onClick={toggleTheme} aria-label="切换主题">{dark ? <Sun/> : <Moon/>}</button></header><article className="reader"><div className="reader-meta"><span>{article.category}</span><span>·</span><span>约 {Math.max(3, Math.round(article.content.length / 600))} 分钟阅读</span></div><div className="prose" dangerouslySetInnerHTML={{ __html: html }}/><div className="reader-end"><BookOpen/><h3>看到方向，却不知道怎么开始？</h3><p>回来找我们聊聊，真人伙伴可以陪你把它拆成第一步。</p><button onClick={onBack}>返回方案库</button></div></article></div> }
