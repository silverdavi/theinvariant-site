import styles from './App.module.css'

// Sample article data - will be replaced with real content
const featuredArticles = [
  {
    id: 1,
    category: 'Mathematics',
    title: 'The Unreasonable Effectiveness of Symmetry',
    excerpt: 'From snowflakes to string theory, why nature speaks in the language of groups and transformations.',
    author: 'The Editors',
    date: 'December 2024',
    large: true,
    symbol: '∞'
  },
  {
    id: 2,
    category: 'Philosophy',
    title: 'What Remains When Everything Changes',
    excerpt: 'An inquiry into the nature of identity and persistence through time.',
    author: 'The Editors',
    date: 'December 2024',
    symbol: '◯'
  },
  {
    id: 3,
    category: 'Science',
    title: 'The Constants That Define Our Universe',
    excerpt: 'Why are the fundamental constants what they are? And what if they were different?',
    author: 'The Editors',
    date: 'December 2024',
    symbol: 'π'
  },
  {
    id: 4,
    category: 'Culture',
    title: 'Timeless Ideas in a Disposable Age',
    excerpt: 'Finding lasting wisdom in an era of infinite scroll and instant obsolescence.',
    author: 'The Editors',
    date: 'December 2024',
    symbol: '∆'
  }
]

const topics = [
  { icon: '∫', title: 'Mathematics', count: 'Coming Soon' },
  { icon: '⚛', title: 'Physics', count: 'Coming Soon' },
  { icon: 'φ', title: 'Philosophy', count: 'Coming Soon' },
  { icon: '⌘', title: 'Technology', count: 'Coming Soon' }
]

function App() {
  return (
    <div>
      {/* Header / Masthead */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <nav className={styles.nav}>
            <a href="#articles" className={styles.navLink}>Articles</a>
            <a href="#topics" className={styles.navLink}>Topics</a>
          </nav>
          
          <div className={styles.masthead}>
            <h1 className={styles.logo}>
              The <span className={styles.logoSymbol}>∆</span> Invariant
            </h1>
            <p className={styles.tagline}>Constants amidst chaos</p>
          </div>
          
          <nav className={styles.nav}>
            <a href="#about" className={styles.navLink}>About</a>
            <a href="#subscribe" className={styles.navLink}>Subscribe</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h2 className={styles.heroTitle}>
            Exploring what endures
          </h2>
          <p className={styles.heroSubtitle}>
            A magazine for the curious mind
          </p>
          
          <div className={styles.heroDivider}>
            <span className={styles.heroDividerLine}></span>
            <span className={styles.heroDividerSymbol}>✦</span>
            <span className={styles.heroDividerLine}></span>
          </div>
          
          <p className={styles.heroDescription}>
            In a world of constant flux, some things remain unchanged. 
            We seek out the patterns, principles, and ideas that transcend 
            the noise—the invariants that shape science, philosophy, and culture.
          </p>
        </div>
      </section>

      {/* Featured Articles */}
      <section id="articles" className={styles.featured}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Featured</p>
          <h2 className={styles.sectionTitle}>From Our Pages</h2>
        </div>
        
        <div className={styles.articlesGrid}>
          {featuredArticles.map((article) => (
            <article 
              key={article.id} 
              className={`${styles.articleCard} ${article.large ? styles.articleCardLarge : ''}`}
            >
              <div className={`${styles.articleImage} ${article.large ? styles.articleImageLarge : ''}`}>
                <div className={styles.articleImagePlaceholder}>
                  {article.symbol}
                </div>
              </div>
              <p className={styles.articleCategory}>{article.category}</p>
              <h3 className={styles.articleTitle}>{article.title}</h3>
              <p className={styles.articleExcerpt}>{article.excerpt}</p>
              <div className={styles.articleMeta}>
                <span className={styles.articleAuthor}>{article.author}</span>
                <span className={styles.articleDate}>{article.date}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quote Section */}
      <section className={styles.quoteSection}>
        <div className={styles.quoteInner}>
          <p className={styles.quoteText}>
            The eternal mystery of the world is its comprehensibility... 
            The fact that it is comprehensible is a miracle.
          </p>
          <p className={styles.quoteAttribution}>— Albert Einstein</p>
        </div>
      </section>

      {/* Topics Section */}
      <section id="topics" className={styles.topics}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>Explore</p>
          <h2 className={styles.sectionTitle}>Topics</h2>
        </div>
        
        <div className={styles.topicsGrid}>
          {topics.map((topic) => (
            <div key={topic.title} className={styles.topicCard}>
              <div className={styles.topicIcon}>{topic.icon}</div>
              <h3 className={styles.topicTitle}>{topic.title}</h3>
              <p className={styles.topicCount}>{topic.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="subscribe" className={styles.newsletter}>
        <div className={styles.newsletterInner}>
          <h2 className={styles.newsletterTitle}>Stay Curious</h2>
          <p className={styles.newsletterText}>
            Receive our latest essays on science, philosophy, and the 
            enduring patterns that shape our world. No spam, no noise—just 
            ideas worth your time.
          </p>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Your email address"
              className={styles.newsletterInput}
              aria-label="Email address"
            />
            <button type="submit" className={styles.newsletterButton}>
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <p className={styles.footerLogo}>The ∆ Invariant</p>
            <p className={styles.footerTagline}>Constants amidst chaos</p>
          </div>
          
          <div className={styles.footerNav}>
            <div className={styles.footerNavColumn}>
              <p className={styles.footerNavTitle}>Magazine</p>
              <a href="#articles" className={styles.footerNavLink}>Articles</a>
              <a href="#topics" className={styles.footerNavLink}>Topics</a>
              <a href="#" className={styles.footerNavLink}>Archive</a>
            </div>
            <div className={styles.footerNavColumn}>
              <p className={styles.footerNavTitle}>About</p>
              <a href="#" className={styles.footerNavLink}>Our Mission</a>
              <a href="#" className={styles.footerNavLink}>Contributors</a>
              <a href="#" className={styles.footerNavLink}>Contact</a>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © 2024 The Invariant. All rights reserved.
          </p>
          <div className={styles.footerSocial}>
            <a href="#" className={styles.socialLink}>Twitter</a>
            <a href="#" className={styles.socialLink}>RSS</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
