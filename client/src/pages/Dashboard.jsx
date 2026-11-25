import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Search, Plus, ExternalLink, Star, MoreHorizontal, Pencil, Trash2, LogOut, Globe, X, FolderHeart, Sparkles } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import BookmarkModal from '../components/BookmarkModal';

function host(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } }
function initials(name = '') { return name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase(); }

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { data } = await api.get('/bookmarks'); setBookmarks(data.bookmarks); setError(''); }
    catch (err) { setError(err.response?.data?.message || 'Could not load bookmarks.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const visible = useMemo(() => bookmarks.filter(b => {
    const matchesFilter = filter === 'all' || b.favorite;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || [b.title, b.url, b.description, ...(b.tags || [])].join(' ').toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  }), [bookmarks, filter, search]);
  const save = async (payload) => {
    if (modal?._id) await api.put(`/bookmarks/${modal._id}`, payload);
    else await api.post('/bookmarks', payload);
    setModal(null); await load();
  };
  const toggleFavorite = async (bookmark) => {
    await api.put(`/bookmarks/${bookmark._id}`, { favorite: !bookmark.favorite }); await load();
  };
  const remove = async (id) => {
    if (!window.confirm('Delete this bookmark? This cannot be undone.')) return;
    await api.delete(`/bookmarks/${id}`); setMenu(null); await load();
  };
  const favorites = bookmarks.filter(b => b.favorite).length;
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Bookmark size={19} fill="currentColor" /></span> markd.</div>
      <div className="sidebar-label">LIBRARY</div>
      <nav className="side-nav">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}><Globe size={17} /> All bookmarks <span>{bookmarks.length}</span></button>
        <button className={filter === 'favorites' ? 'active' : ''} onClick={() => setFilter('favorites')}><Star size={17} /> Favorites <span>{favorites}</span></button>
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><Sparkles size={16} /><p><strong>A tiny tip</strong><br />Add tags to make your links easier to find later.</p></div><button className="profile-row" onClick={logout}><span className="avatar">{initials(user?.name)}</span><span className="profile-info"><strong>{user?.name}</strong><small>Sign out</small></span><LogOut size={17} /></button></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="breadcrumb">Your library <span>/</span> <strong>{filter === 'all' ? 'All bookmarks' : 'Favorites'}</strong></div><div className="topbar-right"><span className="date-label">YOUR PERSONAL LINK LIBRARY</span><span className="avatar small-avatar">{initials(user?.name)}</span></div></header>
      <section className="content-wrap">
        <div className="welcome-row"><div><span className="eyebrow">A GOOD PLACE TO START</span><h1>Your saved <em>corner.</em></h1><p>All the interesting things you found, in one place.</p></div><button className="primary-button add-button" onClick={() => setModal({})}><Plus size={18} /> Add bookmark</button></div>
        <div className="stats-row"><div className="stat-card"><span className="stat-icon"><Bookmark size={18} /></span><div><strong>{bookmarks.length}</strong><small>Saved links</small></div></div><div className="stat-card"><span className="stat-icon star-stat"><Star size={18} /></span><div><strong>{favorites}</strong><small>Favorites</small></div></div><div className="stat-note"><FolderHeart size={17} /><span>Your next great find is just a save away.</span></div></div>
        <div className="library-toolbar"><div><h2>{filter === 'all' ? 'All bookmarks' : 'Your favorites'} <span className="count-pill">{visible.length}</span></h2><p>A collection of things worth keeping.</p></div><div className="search-wrap"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your links…" /><kbd>⌘ K</kbd>{search && <button className="clear-search" onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}</div></div>
        {error && <div className="form-error page-error">{error}</div>}
        {loading ? <div className="empty-state"><div className="spinner" /><p>Gathering your bookmarks…</p></div> :
          visible.length ? <div className="bookmark-grid">{visible.map(b => <article className="bookmark-card" key={b._id}>
            <div className="card-top"><div className="site-icon">{host(b.url).charAt(0).toUpperCase()}</div><div className="site-domain">{host(b.url)}</div><div className="card-menu-wrap"><button className="icon-button card-more" onClick={() => setMenu(menu === b._id ? null : b._id)} aria-label="Bookmark options"><MoreHorizontal size={20} /></button>{menu === b._id && <div className="dropdown"><button onClick={() => { setModal(b); setMenu(null); }}><Pencil size={15} /> Edit</button><button className="danger-item" onClick={() => remove(b._id)}><Trash2 size={15} /> Delete</button></div>}</div></div>
            <h3>{b.title}</h3><p className="card-description">{b.description || 'A link saved for another moment.'}</p>
            <div className="tag-list">{(b.tags || []).slice(0, 3).map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
            <div className="card-bottom"><button className={`favorite-button ${b.favorite ? 'is-favorite' : ''}`} onClick={() => toggleFavorite(b)} aria-label={b.favorite ? 'Remove from favorites' : 'Add to favorites'}><Star size={16} fill={b.favorite ? 'currentColor' : 'none'} /></button><a href={b.url} target="_blank" rel="noreferrer" className="visit-link">Visit link <ExternalLink size={14} /></a></div>
          </article>)}</div> :
          <div className="empty-state"><div className="empty-icon"><Bookmark size={25} /></div><h3>{search ? 'No matches found' : filter === 'favorites' ? 'No favorites just yet' : 'Your collection starts here'}</h3><p>{search ? 'Try a different search term.' : filter === 'favorites' ? 'Tap the star on a bookmark to keep it close.' : 'Save an article, a tool, a recipe, or anything you want to revisit.'}</p>{!search && filter === 'all' && <button className="primary-button" onClick={() => setModal({})}><Plus size={17} /> Save your first link</button>}</div>
        }
      </section>
    </main>
    {modal && <BookmarkModal bookmark={modal._id ? modal : null} onClose={() => setModal(null)} onSave={save} />}
  </div>;
}
