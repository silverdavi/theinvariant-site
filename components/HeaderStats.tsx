'use client'

import { useState, useEffect } from 'react'
import styles from '../app/page.module.css'

export default function HeaderStats() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false }))
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)

    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }
    fetchStats()
    const statsInterval = setInterval(fetchStats, 10000) // Update every 10 seconds

    return () => {
      clearInterval(interval)
      clearInterval(statsInterval)
    }
  }, [])

  return (
    <div className={styles.headerStats}>
      <div className={styles.headerStatsInner}>
        <div className={styles.headerStatsItem}>
          <span className={styles.headerStatsLabel}>Time</span>
          <span className={styles.headerStatsValue}>{time || '--:--:--'}</span>
        </div>
        <div className={styles.headerStatsItem}>
          <span className={styles.headerStatsLabel}>Date</span>
          <span className={styles.headerStatsValue}>{date || 'Loading...'}</span>
        </div>
        {stats && (
          <>
            <div className={styles.headerStatsItem}>
              <span className={styles.headerStatsLabel}>Stories</span>
              <span className={styles.headerStatsValue}>{stats.published_stories || 0}</span>
            </div>
            <div className={styles.headerStatsItem}>
              <span className={styles.headerStatsLabel}>Queue</span>
              <span className={styles.headerStatsValue}>{stats.queue_depth || 0}</span>
            </div>
            <div className={styles.headerStatsItem}>
              <span className={styles.headerStatsLabel}>Agents</span>
              <span className={styles.headerStatsValue}>{stats.active_agents || 0}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
