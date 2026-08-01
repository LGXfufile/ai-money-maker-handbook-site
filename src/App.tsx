import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowUpRight, BookOpen, Code2, Menu, Moon, Search, Sparkles, Sun, X } from 'lucide-react'
import { marked } from 'marked'

type Article = { path: string; title: string; category: string; content: string; number: number }
const files = import.meta.glob('../**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

const cleanTitle = (text: string, path: string) => {
  const heading = text.match(/^#\s+(.+)$/m)?.[1]?.replace(/[*`]/g, '').trim()
  return heading || path.split('/').pop()!.replace(/\.md$/, '')
}

const articles: Article[] = Object.entries(files)
  .filter(([path]) => !path.includes('node_modules') && !/\/(README|README_en|README_jp|README_kr|CLAUDE|DATA_UPDATE)\.md$/.test(path))
  .map(([path, content]) => {
    const relative = path.replace(/^\.\.\//, '')
    const category = relative.split('/')[0]
    const match = relative.match(/ch(\d+)/)
    return { path: relative, title: cleanTitle(content, relative), category, content, number: match ? Number(match[1]) : 0 }
  })
  .sort((a, b) => b.number - a.number)

const categories = ['全部', ...Array.from(new Set(articles.map(item => item.category)))]

function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('全部')
  const [selected, setSelected] = useState<Article | null>(null)
  const [menu, setMenu] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark' || matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [selected])

  const filtered = useMemo(() => {
    const needle = query.toLowerCase().trim()
    return articles.filter(item => (category === '全部' || item.category === category) && (!needle || `${item.title} ${item.content}`.toLowerCase().includes(needle)))
  }, [query, category])

  if (selected) return <Reader article={selected} onBack={() => setSelected(null)} dark={dark} toggleTheme={() => setDark(v => !v)} />

  return <div className="site-shell">
    <header className="nav-wrap">
      <nav className="nav" aria-label="主导航">
        <a className="brand" href="#top" aria-label="返回首页"><span className="brand-mark"><Sparkles size={17} /></span><span>AI 副业博物馆</span></a>
        <div className="nav-actions">
          <a className="github-link" href="https://github.com/XiaomingX/ai-money-maker-handbook" target="_blank" rel="noreferrer"><Code2 size={17} /> GitHub <ArrowUpRight size={14} /></a>
          <button className="icon-button" onClick={() => setDark(v => !v)} aria-label={dark ? '切换浅色模式' : '切换深色模式'}>{dark ? <Sun /> : <Moon />}</button>
          <button className="icon-button mobile-only" onClick={() => setMenu(v => !v)} aria-label="打开分类菜单">{menu ? <X /> : <Menu />}</button>
        </div>
      </nav>
    </header>

    <main id="top">
      <section className="hero">
        <div className="eyebrow"><span className="live-dot" /> 持续更新的开源知识库</div>
        <h1>找到你的下一条<br/><span>AI 收入曲线。</span></h1>
        <p>从真实案例出发，收藏可执行的 AI 副业、独立开发与创业方法。少一点焦虑，多一次行动。</p>
        <div className="search-box">
          <Search size={21} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索方向、工具或赚钱方式…" aria-label="搜索文章" />
          <kbd>⌘ K</kbd>
        </div>
        <div className="stats"><span><strong>{articles.length}</strong> 个实战方案</span><i/><span><strong>{categories.length - 1}</strong> 个主题专栏</span><i/><span>完全免费开源</span></div>
      </section>

      <section className="library">
        <div className={`category-rail ${menu ? 'open' : ''}`}>
          <span className="rail-label">浏览主题</span>
          {categories.map(item => <button key={item} className={category === item ? 'active' : ''} onClick={() => { setCategory(item); setMenu(false) }}><span>{item === '全部' ? '精选方案' : item}</span><em>{item === '全部' ? articles.length : articles.filter(a => a.category === item).length}</em></button>)}
        </div>
        <div className="results">
          <div className="section-heading"><div><span>IDEA LIBRARY</span><h2>{query ? `“${query}” 的搜索结果` : category === '全部' ? '最新实战方案' : category}</h2></div><p>{filtered.length} 篇内容</p></div>
          <div className="card-grid">
            {filtered.slice(0, 80).map((item, index) => <button className="article-card" key={item.path} onClick={() => setSelected(item)}>
              <div className="card-top"><span className="card-number">{String(item.number || index + 1).padStart(3, '0')}</span><ArrowUpRight size={18} /></div>
              <div><span className="tag">{item.category}</span><h3>{item.title}</h3></div>
              <div className="card-footer"><span>阅读方案</span><span>约 {Math.max(3, Math.round(item.content.length / 600))} 分钟</span></div>
            </button>)}
          </div>
          {!filtered.length && <div className="empty"><Search/><h3>没有找到匹配内容</h3><p>换个关键词，或浏览其他主题。</p></div>}
          {filtered.length > 80 && <p className="limit-note">已展示前 80 条结果，请使用搜索进一步筛选。</p>}
        </div>
      </section>
    </main>
    <footer><div className="brand"><span className="brand-mark"><Sparkles size={17}/></span>AI 副业博物馆</div><p>灵感不是终点，行动才是。 · 内容源自 <a href="https://github.com/XiaomingX/ai-money-maker-handbook">XiaomingX</a> · Apache 2.0</p></footer>
  </div>
}

function Reader({ article, onBack, dark, toggleTheme }: { article: Article; onBack: () => void; dark: boolean; toggleTheme: () => void }) {
  const html = useMemo(() => marked.parse(article.content, { breaks: true }) as string, [article])
  return <div className="reader-shell">
    <header className="reader-nav"><button className="back-button" onClick={onBack}><ArrowLeft/> 返回方案库</button><button className="icon-button" onClick={toggleTheme} aria-label="切换主题">{dark ? <Sun/> : <Moon/>}</button></header>
    <article className="reader">
      <div className="reader-meta"><span>{article.category}</span><span>·</span><span>约 {Math.max(3, Math.round(article.content.length / 600))} 分钟阅读</span></div>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="reader-end"><BookOpen/><h3>继续探索更多可能</h3><button onClick={onBack}>返回方案库</button></div>
    </article>
  </div>
}

export default App
