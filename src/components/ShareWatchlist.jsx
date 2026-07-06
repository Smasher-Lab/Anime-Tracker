import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function ShareWatchlist({ userId }) {
  const { userId: sharedUserId } = useParams();
  const [shareableLink, setShareableLink] = useState('');
  const [sharedAnimeList, setSharedAnimeList] = useState([]);
  const [isLoadingSharedList, setIsLoadingSharedList] = useState(false);
  const [sharedListError, setSharedListError] = useState('');

  const isPublicView = Boolean(sharedUserId);

  useEffect(() => {
    if (!isPublicView) return;

    const fetchSharedWatchlist = async () => {
      setIsLoadingSharedList(true);
      setSharedListError('');

      try {
        const response = await fetch(`${API_URL}/api/anime/${sharedUserId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load shared watchlist.');
        }

        setSharedAnimeList(data.animeList || []);
      } catch (error) {
        console.error('Shared watchlist fetch error:', error);
        setSharedListError('Could not load this shared watchlist.');
      } finally {
        setIsLoadingSharedList(false);
      }
    };

    fetchSharedWatchlist();
  }, [isPublicView, sharedUserId]);

  const handleGenerateLink = () => {
    if (!userId) {
      alert('You must be logged in to share your list.');
      return;
    }
    const link = `${window.location.origin}/shared-watchlist/${userId}`;
    setShareableLink(link);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Clipboard error:', error);
      alert('Could not copy the link automatically.');
    }
  };

  if (isPublicView) {
    if (isLoadingSharedList) {
      return <div className="loading-message">Loading shared watchlist...</div>;
    }

    if (sharedListError) {
      return <div className="error-message">{sharedListError}</div>;
    }

    return (
      <div className="shared-watchlist-page">
        <h2>Shared Watchlist</h2>
        <div className="anime-list">
          {sharedAnimeList.length > 0 ? (
            sharedAnimeList.map(anime => (
              <Link
                to={`/anime/${anime.id}`}
                key={anime.id}
                className="anime-card-link"
              >
                <div className="anime-card">
                  <img src={anime.image} alt={anime.title} className="anime-image" />
                  <div className="anime-card-content">
                    <h3>{anime.title}</h3>
                    <p>Episodes: {anime.episodes || 'N/A'}</p>
                    <p>Category: {anime.category}</p>
                    <p>Progress: {anime.watchedEpisodes} / {anime.episodes || '??'}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="no-anime-message">This shared watchlist is empty.</p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="share-watchlist-container">
      <h3>Share Your Watchlist</h3>
      <p>Generate a public link to your anime list. Anyone with the link can view it.</p>
      <button onClick={handleGenerateLink} className="share-link-button">
        Generate Shareable Link
      </button>
      {shareableLink && (
        <div className="share-link-result">
          <input
            type="text"
            value={shareableLink}
            readOnly
            onClick={handleCopyLink}
          />
          <button onClick={handleCopyLink} className="copy-button">
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
}

export default ShareWatchlist;
