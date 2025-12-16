'use client'

import Link from 'next/link'
import styles from './StoryCard.module.css'

interface StoryCardProps {
  story: any
  large?: boolean
}

export default function StoryCard({ story, large = false }: StoryCardProps) {
  const storyUrl = `/piece/?id=${story.id}`
  const excerpt = story.blocks?.[0]?.text?.substring(0, 150) || story.summary || ''
  const author = story.authors?.[0]?.name || 'The Editors'
  const imageUrl = story.image_url || '/favicon.svg'
  const freshness = story.freshness ?? 100
  const isFresh = story.is_fresh !== false && freshness >= 20
  
  // Calculate opacity based on freshness
  const opacity = freshness < 20 ? Math.max(0.3, freshness / 20) : 1.0
  
  // Freshness color
  const getFreshnessColor = () => {
    if (freshness >= 80) return '#4CAF50' // Green
    if (freshness >= 50) return '#FFC107' // Yellow
    if (freshness >= 20) return '#FF9800' // Orange
    return '#F44336' // Red
  }

  return (
    <article 
      className={`${styles.storyCard} ${large ? styles.storyCardLarge : ''}`}
      style={{ opacity }}
    >
      <Link href={storyUrl} className={styles.storyLink}>
        <div className={styles.storyImage}>
          <img src={imageUrl} alt={story.title} className={styles.storyImageImg} />
          {!isFresh && (
            <div className={styles.freshnessBadge} style={{ backgroundColor: getFreshnessColor() }}>
              {Math.round(freshness)}%
            </div>
          )}
        </div>
        <div className={styles.storyContent}>
          <div className={styles.storyHeader}>
            <p className={styles.storySection}>{story.section || 'Article'}</p>
            {isFresh && (
              <div className={styles.freshnessIndicator} style={{ borderLeft: `3px solid ${getFreshnessColor()}` }}>
                <span className={styles.freshnessValue} style={{ color: getFreshnessColor() }}>
                  {Math.round(freshness)}%
                </span>
              </div>
            )}
          </div>
          <h3 className={styles.storyTitle}>{story.title}</h3>
          <p className={styles.storyExcerpt}>{excerpt}...</p>
          <div className={styles.storyMeta}>
            <span className={styles.storyAuthor}>{author}</span>
            <span className={styles.storyDate}>
              {story.published_at ? new Date(story.published_at).toLocaleDateString() : 'Recent'}
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
