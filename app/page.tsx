'use client'

import { useState, useEffect } from 'react'
import HeaderStats from '../components/HeaderStats'
import StoryCard from '../components/StoryCard'
import HotNewsCard from '../components/HotNewsCard'
import styles from './page.module.css'

// Map story sections to topic categories
const sectionToTopic: Record<string, string> = {
  'Mathematics': 'Mathematics',
  'Math': 'Mathematics',
  'Physics': 'Physics',
  'Science': 'Physics',
  'Science & Research': 'Physics',
  'Philosophy': 'Philosophy',
  'Technology': 'Technology',
  'Tech': 'Technology',
  'Technology & Innovation': 'Technology',
  'Art': 'Art',
  'Society': 'Society',
  'Health': 'Society',
  'Politics': 'Society',
  'Global': 'Society',
  'News': 'Society',
  'Social Justice': 'Society',
  'Culture': 'Culture',
  'Culture & Society': 'Culture',
  'Ideas': 'Ideas',
  'Arts & Ideas': 'Ideas'
}

// Get topic counts from stories
function getTopicCounts(stories: any[]) {
  const counts: Record<string, number> = {
    'Mathematics': 0,
    'Physics': 0,
    'Philosophy': 0,
    'Technology': 0,
    'Art': 0,
    'Society': 0,
    'Culture': 0,
    'Ideas': 0
  }

  stories.forEach(story => {
    if (story.status === 'published' || story.status === 'decaying') {
      const section = story.section || ''
      const topic = sectionToTopic[section] || null
      if (topic && counts.hasOwnProperty(topic)) {
        counts[topic]++
      }
    }
  })

  return counts
}

const topics = [
  { icon: '∫', title: 'Mathematics', key: 'Mathematics' },
  { icon: '⚛', title: 'Physics', key: 'Physics' },
  { icon: 'φ', title: 'Philosophy', key: 'Philosophy' },
  { icon: '⌘', title: 'Technology', key: 'Technology' },
  { icon: '🎨', title: 'Art', key: 'Art' },
  { icon: '🌍', title: 'Society', key: 'Society' },
  { icon: '📚', title: 'Culture', key: 'Culture' },
  { icon: '💭', title: 'Ideas', key: 'Ideas' }
]

export default function Home() {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  useEffect(() => {
    // Fetch real stories from API - dynamically loads without redeployment
    // Caddy proxies /api/* to backend, so stories update automatically
    const fetchStories = async () => {
      try {
        console.log('🔄 Fetching stories from /api/map...')
        const res = await fetch('/api/map', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        
        console.log(`📡 Fetch response: ${res.status} ${res.statusText}`)
        
        if (!res.ok) {
          console.error(`❌ API error: ${res.status} ${res.statusText}`)
          throw new Error(`API error: ${res.status}`)
        }
        
        const data = await res.json()
        console.log(`✅ Fetched ${Array.isArray(data) ? data.length : 0} stories from API`)
        
        if (data && Array.isArray(data)) {
          console.log(`📰 Total stories from API: ${data.length}`)
          
          if (data.length > 0) {
            console.log('📰 Sample story:', {
              id: data[0].id,
              title: data[0].title?.substring(0, 50),
              status: data[0].status,
              section: data[0].section,
              isHotNews: data[0].metadata?.is_hot_news,
              freshness: data[0].freshness
            })
          }
          
          // Filter to only published/decaying stories
          const publishedStories = data.filter((s: any) => 
            s.status === 'published' || s.status === 'decaying'
          )
          console.log(`📊 Published/decaying stories: ${publishedStories.length}`)
          
          // Log story details for debugging
          if (publishedStories.length > 0) {
            publishedStories.forEach((s: any, idx: number) => {
              console.log(`  Story ${idx + 1}: ${s.title?.substring(0, 40)}... (${s.status}, ${s.section})`)
            })
          }
          
          setStories(publishedStories)
        } else {
          console.warn('⚠️ No stories in API response or invalid format')
          setStories([])
        }
        setLoading(false)
      } catch (err) {
        console.error('Error fetching stories:', err)
        setLoading(false)
      }
    }

    fetchStories()
    
    // Auto-refresh every 30 seconds to get new stories automatically
    // No redeployment needed - stories appear as they're published!
    const interval = setInterval(fetchStories, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Separate hot news from regular stories
  // Hot news = ONLY real breaking news, urgent events, NOT editorial pieces
  const isHotNews = (story: any) => {
    // Explicit flag takes precedence (but only if it's actually news)
    if (story.metadata?.is_hot_news === true) {
      // Double-check: editorial pieces should not be hot news even if flagged
      const title = (story.title || '').toLowerCase()
      const section = (story.section || '').toLowerCase()
      // Exclude long-form editorial pieces
      if (title.includes('why') || title.includes('how') || 
          title.includes('choosing') || title.includes('turn') ||
          section === 'arts & ideas' || section === 'culture' ||
          section === 'ideas' || section === 'philosophy') {
        return false
      }
      return true
    }
    
    const title = (story.title || '').toLowerCase()
    const section = (story.section || '').toLowerCase()
    
    // EXCLUDE editorial pieces - these are NOT news
    if (section === 'arts & ideas' || section === 'culture' || 
        section === 'ideas' || section === 'philosophy' ||
        section === 'science & research' || section === 'science') {
      return false
    }
    
    // EXCLUDE long-form editorial titles
    if (title.includes('why') || title.includes('how') || 
        title.includes('choosing') || title.includes('turn') ||
        title.includes('movement') || title.includes('reshapes') ||
        title.includes('audiences') || title.includes('younger')) {
      return false
    }
    
    // ONLY real breaking news keywords
    if (title.includes('breaking') || title.includes('urgent') ||
        title.includes('alert') || title.includes('update') ||
        title.includes('developing') || title.includes('just in')) return true
    
    // ONLY News/Events/Global sections with recent timestamps
    if ((section === 'news' || section === 'events' || section === 'global' || section === 'breaking')) {
      if (story.published_at) {
        const publishedAt = new Date(story.published_at)
        const hoursSincePublished = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60)
        // Very recent news only (last 6 hours)
        if (hoursSincePublished <= 6) return true
        // High priority breaking news (priority >= 5) for 12 hours
        const priority = story.metadata?.priority || 3
        if (hoursSincePublished <= 12 && priority >= 5) return true
      }
    }
    
    return false
  }

  const hotNewsStories = stories.filter(isHotNews)
  
  // Filter stories by selected topic
  const getFilteredStories = (storyList: any[]) => {
    if (!selectedTopic) return storyList.filter(s => !isHotNews(s))
    
    return storyList.filter(s => {
      if (isHotNews(s)) return false
      const section = s.section || ''
      const topic = sectionToTopic[section] || null
      return topic === selectedTopic
    })
  }
  
  const regularStories = getFilteredStories(stories)
  
  // Debug logging
  useEffect(() => {
    if (!loading) {
      console.log('Stories state:', {
        total: stories.length,
        hotNews: hotNewsStories.length,
        regular: regularStories.length,
        selectedTopic
      })
    }
  }, [stories, hotNewsStories, regularStories, loading, selectedTopic])
  
  // Get topic counts
  const topicCounts = getTopicCounts(stories)

  return (
    <div>
      {/* Header / Masthead - PROMINENT at top */}
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

      {/* Stats Header */}
      <HeaderStats />

      {/* Newsdesk - Compact section for breaking news ONLY */}
      {!loading && hotNewsStories.length > 0 && (
        <section className={styles.newsdesk}>
          <div className={styles.newsdeskHeader}>
            <div className={styles.newsdeskLabel}>
              <span className={styles.newsdeskIcon}>📰</span>
              <span className={styles.newsdeskTitle}>NEWSDESK</span>
            </div>
            <div className={styles.newsdeskTicker}>
              <span className={styles.newsdeskTickerText}>LIVE</span>
              <span className={styles.newsdeskTickerDot}>●</span>
            </div>
          </div>
          
          <div className={styles.newsdeskContent}>
            <div className={styles.newsdeskGrid}>
              {hotNewsStories.map((story) => (
                <HotNewsCard 
                  key={story.id} 
                  story={story}
                />
              ))}
            </div>
          </div>
        </section>
      )}

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
          <p className={styles.sectionLabel}>Latest Stories</p>
          <h2 className={styles.sectionTitle}>From Our Pages</h2>
        </div>
        
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>The newsroom is working...</p>
            <p className={styles.loadingSubtext}>Stories are being written, edited, and prepared for you.</p>
          </div>
        ) : regularStories.length === 0 && !selectedTopic ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📰</div>
            <h3 className={styles.emptyStateTitle}>The Newsroom is Awakening</h3>
            <p className={styles.emptyStateText}>
              Our AI newsroom is hard at work researching, writing, and editing stories. 
              The first articles will appear here soon!
            </p>
            <div className={styles.emptyStateStats}>
              <div className={styles.emptyStatItem}>
                <span className={styles.emptyStatValue}>{stories.length}</span>
                <span className={styles.emptyStatLabel}>Stories in Progress</span>
              </div>
              <div className={styles.emptyStatItem}>
                <span className={styles.emptyStatValue}>{hotNewsStories.length}</span>
                <span className={styles.emptyStatLabel}>Breaking News</span>
              </div>
              <div className={styles.emptyStatItem}>
                <span className={styles.emptyStatValue}>∞</span>
                <span className={styles.emptyStatLabel}>Coming Soon</span>
              </div>
            </div>
          </div>
        ) : regularStories.length === 0 && selectedTopic ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🔍</div>
            <h3 className={styles.emptyStateTitle}>No stories found</h3>
            <p className={styles.emptyStateText}>
              No stories available in <strong>{topics.find(t => t.key === selectedTopic)?.title}</strong> yet.
            </p>
            <button 
              className={styles.topicFilterClear}
              onClick={() => setSelectedTopic(null)}
              style={{ marginTop: 'var(--space-md)' }}
            >
              View all stories
            </button>
          </div>
        ) : (
          <div className={styles.articlesGrid}>
            {regularStories.slice(0, selectedTopic ? 20 : 6).map((story, idx) => (
              <StoryCard 
                key={story.id} 
                story={story}
                large={idx === 0 && !selectedTopic}
              />
            ))}
          </div>
        )}
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
          {topics.map((topic) => {
            const count = topicCounts[topic.key] || 0
            const isSelected = selectedTopic === topic.key
            return (
              <button
                key={topic.title}
                className={`${styles.topicCard} ${isSelected ? styles.topicCardSelected : ''}`}
                onClick={() => setSelectedTopic(isSelected ? null : topic.key)}
                aria-label={`Filter by ${topic.title}`}
              >
                <div className={styles.topicIcon}>{topic.icon}</div>
                <h3 className={styles.topicTitle}>{topic.title}</h3>
                <p className={styles.topicCount}>
                  {count > 0 ? `${count} ${count === 1 ? 'Story' : 'Stories'}` : 'Coming Soon'}
                </p>
                {isSelected && (
                  <div className={styles.topicSelectedIndicator}>✓</div>
                )}
              </button>
            )
          })}
        </div>
        {selectedTopic && (
          <div className={styles.topicFilterActive}>
            <p className={styles.topicFilterText}>
              Showing stories in <strong>{topics.find(t => t.key === selectedTopic)?.title}</strong>
            </p>
            <button 
              className={styles.topicFilterClear}
              onClick={() => setSelectedTopic(null)}
            >
              Clear filter
            </button>
          </div>
        )}
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
