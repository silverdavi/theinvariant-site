'use client'

import Link from 'next/link'
import styles from './HotNewsCard.module.css'

interface HotNewsCardProps {
  story: any
}

export default function HotNewsCard({ story }: HotNewsCardProps) {
  const storyUrl = `/piece/?id=${story.id}`
  const excerpt = story.blocks?.[0]?.text?.substring(0, 100) || story.summary || ''
  const imageUrl = story.image_url || '/favicon.svg'

  return (
    <article className={styles.hotNewsCard}>
      <Link href={storyUrl} className={styles.hotNewsLink}>
        <div className={styles.hotNewsImage}>
          <img src={imageUrl} alt={story.title} className={styles.hotNewsImageImg} />
        </div>
        <div className={styles.hotNewsContent}>
          <div className={styles.hotNewsBadge}>BREAKING</div>
          <h3 className={styles.hotNewsTitle}>{story.title}</h3>
          <p className={styles.hotNewsExcerpt}>{excerpt}...</p>
        </div>
      </Link>
    </article>
  )
}
