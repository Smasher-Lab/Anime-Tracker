import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import FilterBar from './FilterBar';
import ShareWatchlist from './ShareWatchlist';
import Sidebar from './Sidebar';
import API_URL from '../config';



function AnimeTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = location.state?.userId || savedUser.userId;
  const username = location.state?.username || savedUser.username;
  const isAdmin = location.state?.isAdmin || savedUser.isAdmin;

  const menuCategories = [
    'All',
    'Watching',
    'Completed',
    'On Hold',
    'Dropped',
    'Plan to Watch',
  ];

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [animeData, setAnimeData] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false); // Fix: Initial state is false

  useEffect(() => {
    const fetchSavedAnime = async () => {
      try {
        const response = await fetch(`${API_URL}/api/anime/${userId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch saved list.');
        }
        setAnimeData(data.animeList);
      } catch (err) {
        console.error("Fetching saved list error:", err);
        setError('Could not load your saved list. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    const fetchPopularAnime = async () => {
      try {
        const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=12');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch popular anime.');
        }
        setPopularAnime(data.data);
      } catch (err) {
        console.error("Fetching popular anime error:", err);
      }
    };
    if (userId) {
      fetchSavedAnime();
      fetchPopularAnime();
    }
  }, [userId]);

  useEffect(() => {
    const saveAnimeList = async () => {
      if (animeData.length === 0 && isLoading) return;
      try {
        await fetch(`${API_URL}/api/anime`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, animeList: animeData }),
        });
      } catch (err) {
        console.error("Save list error:", err);
      }
    };
    if (userId) {
      const saveTimer = setTimeout(() => {
        saveAnimeList();
      }, 1000);
      return () => clearTimeout(saveTimer);
    }
  }, [animeData, userId, isLoading]);

  const addAnimeToList = (animeToAdd) => {
    const isAlreadyAdded = animeData.some(anime => anime.id === animeToAdd.mal_id);
    if (isAlreadyAdded) {
      alert(`${animeToAdd.title} is already in your list!`);
      return;
    }
    const newAnime = {
      id: animeToAdd.mal_id,
      title: animeToAdd.title,
      image: animeToAdd.images.jpg.image_url,
      episodes: animeToAdd.episodes,
      category: 'Plan to Watch',
      watchedEpisodes: 0,
      genres: animeToAdd.genres
    };
    setAnimeData(prevData => [newAnime, ...prevData]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${searchQuery}&sfw`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results.');
      }
      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleProgressUpdate = (animeId, type) => {
    setAnimeData(prevData => {
      return prevData.map(anime => {
        if (anime.id === animeId) {
          let newWatched = anime.watchedEpisodes;
          let episodesCount = anime.episodes || 0;
          if (type === 'increment' && (episodesCount === 0 || newWatched < episodesCount)) {
            newWatched++;
          } else if (type === 'decrement' && newWatched > 0) {
            newWatched--;
          }
          
          let category = anime.category;
          if (newWatched > 0 && (episodesCount === 0 || newWatched < episodesCount)) {
            if (category === 'Plan to Watch') {
              category = 'Watching';
            }
          } else if (episodesCount > 0 && newWatched === episodesCount) {
            category = 'Completed';
          } else if (newWatched === 0) {
            if (category === 'Watching' || category === 'Completed') {
              category = 'Plan to Watch';
            }
          }

          return { ...anime, watchedEpisodes: newWatched, category };
        }
        return anime;
      });
    });
  };

  const handleDeleteFromWatchlist = (animeId) => {
    const anime = animeData.find(a => a.id === animeId);
    if (!anime) return;

    if (anime.category !== 'Dropped') {
      const confirmDrop = window.confirm(`Are you sure you want to move "${anime.title}" to Dropped?`);
      if (!confirmDrop) return;
      setAnimeData(prevData => prevData.map(a => a.id === animeId ? { ...a, category: 'Dropped' } : a));
    } else {
      const confirmDelete = window.confirm(`Are you sure you want to completely remove "${anime.title}" from your watchlist?`);
      if (!confirmDelete) return;
      setAnimeData(prevData => prevData.filter(a => a.id !== animeId));
    }
  };

  const handleFilterChange = (genreId) => {
    setSelectedGenreId(genreId);
  };

  const filteredAnime = animeData.filter(anime => {
    const matchesCategory = activeCategory === 'All' || anime.category === activeCategory;
    const matchesGenre = !selectedGenreId || (anime.genres && anime.genres.some(g => g.mal_id.toString() === selectedGenreId));
    return matchesCategory && matchesGenre;
  });

  if (isLoading) {
    return <div className="loading-message">Loading your anime list...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="anime-tracker-container">
      <div className="profile-header">
        <p>Welcome, <strong>{username}</strong>!</p>
        {isAdmin && (
          <button
            onClick={() => navigate('/admin-panel', { state: { userId, username, isAdmin } })}
            className="admin-panel-link-button"
          >
            Admin Panel
          </button>
        )}
      </div>


      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search for an anime..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          className="search-input"
        />
        <button
          onClick={handleSearch}
          className="search-button"
        >
          Search
        </button>
    </div>

      { isSearching && <div className="loading-message">Searching for anime...</div> }
  {
    !isSearching && searchResults.length > 0 && (
      <div className="search-results-list">
        <h3>Search Results</h3>
        <div className="anime-list">
          {searchResults.map(anime => (
            <Link
              to={`/anime/${anime.mal_id}`}
              key={anime.mal_id}
              state={{ userId, username, isAdmin }}
              className="anime-card-link"
            >
              <div className="anime-card">
                <img src={anime.images.jpg.image_url} alt={anime.title} className="anime-image" />
                <div className="anime-card-content">
                  <h3>{anime.title}</h3>
                  <p>Episodes: {anime.episodes || 'N/A'}</p>
                  <p>Score: {anime.score || 'N/A'}</p>
                  <button onClick={(e) => { e.preventDefault(); addAnimeToList(anime); }} className="add-button">Add to My List</button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  {
    !isSearching && searchResults.length === 0 && popularAnime.length > 0 && (
      <div className="popular-anime-section">
        <h3>Popular Anime</h3>
        <div className="anime-list">
          {popularAnime.map(anime => (
            <Link
              to={`/anime/${anime.mal_id}`}
              key={anime.mal_id}
              state={{ userId, username, isAdmin }}
              className="anime-card-link"
            >
              <div className="anime-card">
                <img src={anime.images.jpg.image_url} alt={anime.title} className="anime-image" />
                <div className="anime-card-content">
                  <h3>{anime.title}</h3>
                  <p>Episodes: {anime.episodes || 'N/A'}</p>
                  <p>Score: {anime.score || 'N/A'}</p>
                  <button onClick={(e) => { e.preventDefault(); addAnimeToList(anime); }} className="add-button">Add to My List</button>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <hr />
      </div>
    )
  }

      <FilterBar onFilterChange={handleFilterChange} />

      <div className="menu-bar">
        {menuCategories.map((category) => (
          <button
            key={category}
            className={`menu-item ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

  {
    !isSearching && searchResults.length === 0 && (
      <div className="anime-list">
        {filteredAnime.length > 0 ? (
          filteredAnime.map(anime => (
            <Link
              to={`/anime/${anime.id}`}
              key={anime.id}
              state={{ userId, username, isAdmin }}
              className="anime-card-link"
            >
              <div className="anime-card">
                <img src={anime.image} alt={anime.title} className="anime-image" />
                <div className="anime-card-content">
                  <h3>{anime.title}</h3>
                  <p>Episodes: {anime.episodes || 'N/A'}</p>
                  <p>Category: {anime.category}</p>
                  <div className="progress-container">
                    <button onClick={(e) => { e.preventDefault(); handleProgressUpdate(anime.id, 'decrement'); }}>-</button>
                    <span>{anime.watchedEpisodes} / {anime.episodes || '??'}</span>
                    <button onClick={(e) => { e.preventDefault(); handleProgressUpdate(anime.id, 'increment'); }}>+</button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteFromWatchlist(anime.id);
                    }}
                    className="delete-watchlist-btn"
                  >
                    Remove from List
                  </button>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="no-anime-message">No anime in this category yet.</p>
        )}
      </div>
    )
  }
    </div >
  );
}

export default AnimeTracker;
