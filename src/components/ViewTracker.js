'use client';
import { useEffect } from 'react';

export default function ViewTracker({ articleId }) {
  useEffect(() => {
    // Only track once per session to avoid spamming
    const tracked = sessionStorage.getItem(`tracked_article_${articleId}`);
    if (!tracked) {
      fetch('/api/traffic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      }).then(() => {
        sessionStorage.setItem(`tracked_article_${articleId}`, 'true');
      }).catch(console.error);
    }
  }, [articleId]);

  return null;
}
