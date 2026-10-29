import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, ArrowLeft, ArrowUpRight, Check, Download, GitBranch,
  Copy, Heart, Library, LockKeyhole, LogOut, MoreHorizontal, Music2, Pause,
  Play, Plus, Search, ShieldCheck, Sparkles, Upload, Wallet, X, ImagePlus, Users, Radio, MessageCircle, Send, Maximize2,
  Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2,
} from 'lucide-react';
import RadioWorkspace from './RadioWorkspace';

const art = [
  'https://images.pexels.com/photos/33418887/pexels-photo-33418887.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/10269844/pexels-photo-10269844.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/16251531/pexels-photo-16251531.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/16015747/pexels-photo-16015747.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/13768643/pexels-photo-13768643.jpeg?auto=compress&cs=tinysrgb&w=900',
];

const genres = ['All', 'Afrobeats', 'Hip-hop', 'EDM', 'Pop', 'Rock', 'R&B', 'Country', 'Amapiano', 'Jazz', 'Gospel', 'Reggae', 'Dancehall', 'House', 'Soul', 'Indie', 'Latin', 'Trap', 'Drill', 'Classical', 'Folk'];
type AgeBand = 'under13' | 'teen' | 'adult';
type RepeatMode = 'off' | 'all' | 'one';
function parseTrackDuration(duration: string): number {
  const [minutes, seconds] = duration.split(':').map(Number);
  return Math.max(0, (minutes || 0) * 60 + (seconds || 0));
}
function formatPlayerTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, '0')}`;
}
type Song = { title: string; artist: string; genre: string; plays: string; remixes: number; duration: string; image: string; score: string; explicit: boolean };
const songs: Song[] = [
  { title: 'Soft Signal', artist: 'Maya Lune', genre: 'Afrobeats', plays: '2.4M', remixes: 18, duration: '3:42', image: art[0], score: '+12%', explicit: false },
  { title: 'Breathe In', artist: 'Kairo Bloom', genre: 'EDM', plays: '1.8M', remixes: 12, duration: '4:08', image: art[1], score: '+8%', explicit: false },
  { title: 'Glass Garden', artist: 'Sora West', genre: 'R&B', plays: '1.2M', remixes: 9, duration: '3:18', image: art[2], score: '+5%', explicit: false },
  { title: 'Afterimage', artist: 'NOVA / 7', genre: 'Hip-hop', plays: '984K', remixes: 24, duration: '2:56', image: art[3], score: '+21%', explicit: true },
  { title: 'Late Checkout', artist: 'Ari Vale', genre: 'House', plays: '721K', remixes: 7, duration: '3:27', image: art[4], score: '+4%', explicit: false },
  { title: 'Palmwine Dreams', artist: 'Reema', genre: 'Afrobeats', plays: '698K', remixes: 11, duration: '3:08', image: art[1], score: '+10%', explicit: true },
];

type Mode = 'desktop' | 'web';
type Screen = 'auth' | 'app';
type Modal = 'none' | 'desktop' | 'upload' | 'branch' | 'wallet' | 'tree' | 'chat' | 'fullscreen' | 'profile';

export default function App() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [mode, setMode] = useState<Mode>('desktop');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState('');
  const [ageBand] = useState<AgeBand>(() => {
    try { return (localStorage.getItem('songtree-demo-age-band') as AgeBand) || 'adult'; } catch { return 'adult'; }
  });
  const [profileHandle, setProfileHandle] = useState(() => {
    try { return localStorage.getItem('songtree-demo-profile-username') ?? '@jamierivers'; } catch { return '@jamierivers'; }
  });
  const [displayName, setDisplayName] = useState(() => {
    try { return localStorage.getItem('songtree-demo-display-name') ?? 'Jamie Rivers'; } catch { return 'Jamie Rivers'; }
  });
  const [modal, setModal] = useState<Modal>('none');
  const [genre, setGenre] = useState('All');
  const [active, setActive] = useState<Song>(songs[0]);
  const [publishedSong, setPublishedSong] = useState<Song | null>(null);
  const [playing, setPlaying] = useState(true);
  const [offlineTrackTitles, setOfflineTrackTitles] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('songtree-demo-offline-track-titles') ?? '[]');
      return Array.isArray(stored) ? stored.filter((title): title is string => typeof title === 'string') : [];
    } catch { return []; }
  });
  const saved = offlineTrackTitles.includes(active.title);
  const [currentTime, setCurrentTime] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [volume, setVolume] = useState(72);
  const [submitted, setSubmitted] = useState(false);
  const [view, setView] = useState<'discover' | 'library' | 'songs' | 'following' | 'radio' | 'profile'>('discover');
  const [displayedView, setDisplayedView] = useState(view);
  const [transitionPhase, setTransitionPhase] = useState<'visible' | 'out' | 'in'>('visible');
  const displayedViewRef = useRef(view);
  const [draftNotice, setDraftNotice] = useState(false);
  const durationSeconds = parseTrackDuration(active.duration);
  const filtered = useMemo(() => {
    const ageSafeSongs = ageBand === 'under13' ? songs.filter(song => !song.explicit) : songs;
    return genre === 'All' ? ageSafeSongs : ageSafeSongs.filter(s => s.genre === genre);
  }, [ageBand, genre]);
  useEffect(() => {
    if (view === displayedViewRef.current) {
      setTransitionPhase('visible');
      return;
    }
    setTransitionPhase('out');
    let frame = 0;
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
    const timer = window.setTimeout(() => {
      displayedViewRef.current = view;
      setDisplayedView(view);
      setTransitionPhase('in');
      frame = window.requestAnimationFrame(() => setTransitionPhase('visible'));
    }, delay);
    return () => {
      window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [view]);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setCurrentTime(time => Math.min(durationSeconds, time + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [playing, active.title, durationSeconds]);
  useEffect(() => {
    if (currentTime < durationSeconds) return;
    if (repeatMode === 'one') {
      setCurrentTime(0);
      return;
    }
    if (repeatMode === 'all' && filtered.length > 0) {
      const currentIndex = filtered.findIndex(song => song.title === active.title);
      const nextIndex = shuffle && filtered.length > 1
        ? (currentIndex + 1 + Math.floor(Math.random() * (filtered.length - 1))) % filtered.length
        : (currentIndex + 1 + filtered.length) % filtered.length;
      setActive(filtered[nextIndex] ?? songs[0]);
      setCurrentTime(0);
      return;
    }
    setPlaying(false);
  }, [currentTime, durationSeconds, repeatMode, filtered, shuffle, active.title]);
  const protectedAction = (next: Modal) => mode === 'desktop' ? setModal(next) : setModal('desktop');
  const selectSong = (song: Song) => { setActive(song); setPlaying(true); setCurrentTime(0); };
  const moveTrack = (direction: -1 | 1) => {
    const queue = filtered.length > 0 ? filtered : songs;
    const currentIndex = queue.findIndex(song => song.title === active.title);
    if (shuffle && direction === 1 && queue.length > 1) {
      const choices = queue.filter(song => song.title !== active.title);
      setActive(choices[Math.floor(Math.random() * choices.length)] ?? queue[0]);
    } else {
      const anchor = currentIndex < 0 ? (direction === 1 ? -1 : 0) : currentIndex;
      setActive(queue[(anchor + direction + queue.length) % queue.length] ?? songs[0]);
    }
    setPlaying(true);
    setCurrentTime(0);
  };
  const toggleSaved = () => setOfflineTrackTitles(current => {
    const next = current.includes(active.title)
      ? current.filter(title => title !== active.title)
      : [...current, active.title];
    try { localStorage.setItem('songtree-demo-offline-track-titles', JSON.stringify(next)); } catch { /* Keep the save for this session. */ }
    return next;
  });
  const cycleRepeat = () => setRepeatMode(mode => mode === 'off' ? 'all' : mode === 'all' ? 'one' : 'off');
  const formatTime = (seconds: number) => formatPlayerTime(seconds);
  const authenticate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    if (authMode === 'signup') {
      const formData = new FormData(event.currentTarget);
      const username = String(formData.get('username') ?? '').trim();
      const dateOfBirth = String(formData.get('dateOfBirth') ?? '').trim();
      let registeredHandles: string[] = [];
      try {
        const stored = JSON.parse(localStorage.getItem('songtree-demo-usernames-v1') ?? '[]');
        if (Array.isArray(stored)) registeredHandles = stored.filter((handle): handle is string => typeof handle === 'string').map(handle => handle.toLowerCase());
      } catch { /* Continue with an empty local demo handle list. */ }
      const normalizedHandle = username.toLowerCase();
      if (normalizedHandle === '@jamierivers' || registeredHandles.includes(normalizedHandle)) {
        setAuthError(`${username} is already in use on this device. Choose another handle.`);
        return;
      }
      try {
        localStorage.setItem('songtree-demo-usernames-v1', JSON.stringify([...new Set([...registeredHandles, normalizedHandle])]));
        localStorage.setItem('songtree-demo-profile-username', username);
        localStorage.setItem('songtree-demo-date-of-birth', dateOfBirth);
        localStorage.setItem('songtree-demo-display-name', '');
      } catch { /* The demo profile still works for the current session. */ }
      setProfileHandle(username);
      setDisplayName('');
    }
    setScreen('app');
  };
  const saveProfileDisplayName = (name: string) => {
    const cleaned = name.trim().slice(0, 40);
    setDisplayName(cleaned);
    try { localStorage.setItem('songtree-demo-display-name', cleaned); } catch { /* Keep the name for this session. */ }
  };

  if (screen === 'auth') return <Auth authMode={authMode} setAuthMode={setAuthMode} onSubmit={authenticate} error={authError} clearError={() => setAuthError('')} />;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><GitBranch size={18} /></span><strong>songtree</strong><small>BETA</small></div>
      <div className="mode-switch" aria-label="Product preview mode"><button className={mode === 'desktop' ? 'selected' : ''} onClick={() => setMode('desktop')}><Music2 size={14}/> Desktop</button><button className={mode === 'web' ? 'selected' : ''} onClick={() => setMode('web')}><Play size={14}/> Web player</button></div>
      <p className="side-label">Explore</p>
      <nav><button className={'nav-item ' + (view === 'discover' ? 'active' : '')} onClick={() => setView('discover')}><Sparkles size={18}/> Discover</button><button className={'nav-item ' + (view === 'library' ? 'active' : '')} onClick={() => setView('library')}><Library size={18}/> Your library <span>8</span></button><button className={'nav-item ' + (view === 'songs' ? 'active' : '')} onClick={() => setView('songs')}><GitBranch size={18}/> Your Songs</button><button className={'nav-item ' + (view === 'following' ? 'active' : '')} onClick={() => setView('following')}><Users size={18}/> Following</button></nav>
      <p className="side-label">Developer tools</p>
      <nav><button className={'nav-item ' + (view === 'radio' ? 'active' : '')} onClick={() => setView('radio')}><Radio size={18}/> Songtree Radio <span>PREVIEW</span></button></nav>
      <p className="side-label">Creator space</p>
      <nav><button className="nav-item" onClick={() => protectedAction('upload')}><Plus size={18}/> New song</button><button className="nav-item" onClick={() => protectedAction('wallet')}><Wallet size={18}/> Wallet</button></nav>
      <div className="sidebar-footer"><button className="signout" onClick={() => setScreen('auth')}><LogOut size={15}/> Sign out</button></div>
    </aside>

    <main className="main">
      <header><div className="mobile-brand"><GitBranch size={18}/> songtree</div><div className="header-copy"><span>{displayedView === 'radio' ? 'Songtree Radio developer preview' : mode === 'desktop' ? 'Desktop creator workspace' : 'Songtree player'}</span><b>{displayedView === 'radio' ? 'Free music for apps, games and events.' : mode === 'desktop' ? 'Create, own and grow the tree.' : 'Listen, discover and follow the tree.'}</b></div><div className="header-actions"><button className="search"><Search size={17}/> Search music and creators</button><button className="message-top" onClick={() => setModal('chat')} aria-label="Messages"><MessageCircle size={18}/></button><button className="avatar" onClick={() => setView('profile')} title="View profile"><img src={art[0]}/></button></div></header>
      <div className={`page-dissolve ${transitionPhase}`}>{displayedView === 'radio' ? <RadioWorkspace onPlay={(song, isPlaying) => { selectSong(songs.find(item => item.title === song.title) ?? { ...song, explicit: false }); setPlaying(isPlaying); }} /> : displayedView === 'profile' ? <PublicProfile handle={profileHandle} name={displayName} onSave={saveProfileDisplayName} uploadedSong={publishedSong} onPlaySong={() => { if (publishedSong) selectSong(publishedSong); }} /> : displayedView === 'library' ? <ContextLayout rail="songs"><CollectionLibrary /></ContextLayout> : displayedView === 'songs' ? <ContextLayout rail="artists"><SongCatalogue /></ContextLayout> : displayedView === 'following' ? <ContextLayout rail="artists"><FollowingPage /></ContextLayout> : <><section className="hero"><div className="hero-copy"><p className="eyebrow"><i/> COMMUNITY CHARTS</p><h1>Music grows<br/><em>when it is shared.</em></h1><p>Every open track is a starting point. Listen to the pulse, follow the credits, then add your own branch.</p><div className="hero-buttons"><button className="primary" onClick={() => { setActive(songs[0]); setPlaying(true); }}><Play size={15} fill="currentColor"/> Play Top Songs</button><button className="quiet" onClick={() => protectedAction('upload')}>Add Song <ArrowUpRight size={15}/></button></div></div><div className="hero-art"><div className="halo"/><img src={art[0]}/><div className="art-label"><b>01</b><span>Top of the week</span></div><div className="branch-chip"><GitBranch size={15}/><span>18 open<br/><b>branches</b></span></div></div></section>

      <section className="chart-section"><div className="section-title"><div><p className="eyebrow">LISTENED TO. SAVED. REVIEWED.</p><h2>Top 50 <span>this week</span></h2></div><div className="method"><ShieldCheck size={15}/> Community signal + quality review</div></div><div className="genre-bar">{genres.map(g => <button key={g} className={genre === g ? 'active' : ''} onClick={() => setGenre(g)}>{g}</button>)}</div><div className="rankings">{filtered.map((song, index) => <button className={'song-row ' + (active.title === song.title ? 'current' : '')} key={song.title} onClick={() => selectSong(song)}><span className="rank">{String(index + 1).padStart(2, '0')}</span><span className="cover"><img src={song.image}/>{active.title === song.title && playing && <i className="bars"><b/><b/><b/></i>}</span><span className="song-data"><b>{song.title}</b><small>{song.artist} Â· {song.genre}</small></span><span className="lift">{song.score}</span><span className="stat"><GitBranch size={14}/>{song.remixes}</span><span className="plays">{song.plays}</span><span className="row-play">{active.title === song.title && playing ? <Pause size={15} fill="currentColor"/> : <Play size={15} fill="currentColor"/>}</span></button>)}</div></section>
      <section className="how"><div><p className="eyebrow">BUILT FOR CLEAR CREDIT</p><h2>One song. A living record of every contribution.</h2><p>Public branches preserve attribution and rights history. Commercial licensing stays separate from the open remix permission.</p></div><div className="steps"><span><b>01</b> Upload privately</span><span><b>02</b> Choose a genre &amp; publish</span><span><b>03</b> Grow the branch</span></div></section></>}</div>
    </main>
    <footer className="player"><div className="now"><button className="player-art" onClick={() => setModal('fullscreen')}><img src={active.image}/><Maximize2 size={13}/></button><span><b>{active.title}</b><small>{active.artist}</small></span><button onClick={toggleSaved} className={saved ? 'saved' : ''} title={saved ? 'Remove local save' : 'Save this track on this device'} aria-label={saved ? 'Remove saved track' : 'Save track locally'} aria-pressed={saved}><Heart size={16} fill={saved ? 'currentColor' : 'none'}/></button></div><div className="controls"><button onClick={() => setPlaying(!playing)}>{playing ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}</button><div><i style={{width: `${durationSeconds ? currentTime / durationSeconds * 100 : 0}%`}}/></div><span>{formatTime(currentTime)} / {active.duration}</span></div><div className="player-actions"><button onClick={() => protectedAction('tree')}><GitBranch size={16}/> View tree</button><button onClick={() => protectedAction('branch')}><Plus size={17}/> Remix</button></div></footer>
    {draftNotice && <div className="draft-toast"><Check size={14}/> Draft saved on this device</div>}
    {modal !== 'none' && <ModalView type={modal} close={() => { setModal('none'); setSubmitted(false); if (modal === 'upload' || modal === 'branch') { setDraftNotice(true); window.setTimeout(() => setDraftNotice(false), 3000); } }} switchDesktop={() => { setMode('desktop'); setModal('none'); }} song={active} submitted={submitted} setSubmitted={setSubmitted} profileHandle={profileHandle} displayName={displayName} saveProfileDisplayName={saveProfileDisplayName} onUploadPublished={(title) => setPublishedSong({ ...active, title, artist: displayName || profileHandle.replace(/^@/, ''), plays: '0', remixes: 0, score: 'NEW' })} onListenToPublishedSong={() => { if (publishedSong) selectSong(publishedSong); setView('profile'); }} playing={playing} saved={saved} currentTime={currentTime} durationSeconds={durationSeconds} shuffle={shuffle} repeatMode={repeatMode} volume={volume} onToggleSaved={toggleSaved} onTogglePlaying={() => setPlaying(value => !value)} onPrevious={() => moveTrack(-1)} onNext={() => moveTrack(1)} onToggleShuffle={() => setShuffle(value => !value)} onCycleRepeat={cycleRepeat} onSeek={setCurrentTime} onVolumeChange={setVolume}/>} 
  </div>;
}


function CollectionLibrary() {
  const [collection, setCollection] = useState<string | null>(null);
  const collections = [
    { title: 'Liked Songs', sub: '24 songs you have liked', image: art[0] },
    { title: 'Downloaded Songs', sub: '8 saved for offline listening', image: art[2] },
    { title: 'Your Playlists', sub: '3 playlists you created', image: art[3] },
    { title: 'Following', sub: '6 playlists you follow', image: art[1] },
  ];
  if (collection) return <section className="library-page"><button className="back-library" onClick={() => setCollection(null)}><ArrowLeft size={15}/> Back to Your Library</button><p className="eyebrow">YOUR COLLECTION</p><h1>{collection}</h1><div className="collection-list">{songs.slice(0, 4).map(song => <button key={song.title} className="collection-song"><img src={song.image}/><span><b>{song.title}</b><small>{song.artist} Â· {song.genre}</small></span><Play size={15}/></button>)}</div></section>;
  return <section className="library-page"><p className="eyebrow">YOUR COLLECTION</p><h1>Your Library</h1><div className="collection-cards">{collections.map(item => <button className="collection-card" key={item.title} onClick={() => setCollection(item.title)}><img src={item.image}/><span><b>{item.title}</b><small>{item.sub}</small></span><ArrowUpRight size={16}/></button>)}</div></section>;
}
function SongCatalogue() {
  const [selected, setSelected] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  if (selected) return <section className="library-page"><button className="back-library" onClick={() => setSelected(false)}><ArrowLeft size={15}/> Back to Your Songs</button><p className="eyebrow">SONG MANAGEMENT</p><h1>Sunroom Sketches</h1><div className="song-manager"><img src={art[4]}/><div className="manager-copy"><b>{withdrawn ? 'Private / withdrawn' : 'Public broadcast'}</b><small>{withdrawn ? 'No longer broadcast, remixable, or seeded' : 'Afrobeats Â· 27 active seeders'}</small><div className="metrics"><span><Play size={13}/> 18.4K plays</span><span><Heart size={13}/> 862 likes</span><span><Download size={13}/> 401 downloads</span><span><Radio size={13}/> 27 seeders</span></div></div><button className="outline" onClick={() => setWithdrawn(!withdrawn)}>{withdrawn ? 'Restore broadcast' : 'Take down'}</button></div><div className="rights-panel"><p className="eyebrow">RIGHTS &amp; DISTRIBUTION</p><h2>Usage permissions</h2><p>License purchases pay to your wallet, less a 10% Songtree fee.</p><label><input type="radio" name="usage" defaultChecked/> Open source â€” free with attribution</label><label><input type="radio" name="usage"/> Paid streaming distribution</label><label><input type="radio" name="usage"/> Paid media â€” TV, radio, games and advertising</label><button className="primary">Save permissions <Check size={14}/></button></div></section>;
  return <section className="library-page"><p className="eyebrow">CREATOR CATALOGUE</p><h1>Your Songs</h1><div className="collection-list">{[{ title: 'Sunroom Sketches', status: 'Public Â· Afrobeats', image: art[4] }, { title: 'Midnight Draft', status: 'Private draft Â· EDM', image: art[1] }].map(song => <button className="collection-song" key={song.title} onClick={() => setSelected(true)}><img src={song.image}/><span><b>{song.title}</b><small>{song.status}</small></span><ArrowUpRight size={15}/></button>)}</div></section>;
}

function PublicProfile({ handle, name, onSave, uploadedSong, onPlaySong }: { handle: string; name: string; onSave: (name: string) => void; uploadedSong?: Song | null; onPlaySong?: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [bio, setBio] = useState('Producer, songwriter and collaborator. Building music that grows in the open.');
  return <section className="public-profile-page"><div className="public-profile-hero"/><div className="public-profile-header"><img src={art[0]} alt="Your profile"/><div><p className="eyebrow">YOUR PUBLIC PROFILE</p><h1>{name || handle.replace(/^@/, '')}</h1><p>{handle} Â· Lagos, Nigeria</p></div><button className="outline" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit profile'}</button></div>{editing ? <div className="public-profile-edit"><label>Artist name<input value={draftName} onChange={event => setDraftName(event.target.value)}/></label><label>Bio<textarea value={bio} onChange={event => setBio(event.target.value)} /></label><label>One public link<input defaultValue="https://instagram.com/jamierivers"/></label><button className="primary" onClick={() => { onSave(draftName); setEditing(false); }}>Save changes <Check size={15}/></button></div> : <><div className="public-profile-bio"><p>{bio}</p><a href="https://instagram.com" target="_blank">instagram.com/{handle.replace(/^@/, '')}</a><div className="profile-stats"><span><b>126</b> followers</span><span><b>12</b> following</span><span><b>4</b> public songs</span></div></div><section className="profile-feed"><div className="profile-feed-heading"><div><p className="eyebrow">YOUR TOP SONGS</p><h2>Most loved by the community</h2></div></div><div className="top-song-list">{uploadedSong && <button className="top-song-row published-top-song" onClick={onPlaySong}><span className="top-rank">00</span><img src={uploadedSong.image} alt=""/><span className="top-song-copy"><b>{uploadedSong.title}</b><small>Just published Â· {uploadedSong.genre}</small></span><span className="top-song-metrics"><b>0 plays</b><small>New to your profile</small></span><i><Play size={14} fill="currentColor"/></i></button>}{songs.slice(0,4).map((song, index) => <button className="top-song-row" key={song.title}><span className="top-rank">{String(index + 1).padStart(2, '0')}</span><img src={song.image} alt=""/><span className="top-song-copy"><b>{song.title}</b><small>{song.genre}</small></span><span className="top-song-metrics"><b>{song.plays}</b><small>{index + 4}K downloads Â· {index + 2}K saves</small></span><i><Play size={14} fill="currentColor"/></i></button>)}</div></section></>}</section>;
}

function ContextLayout({ children, rail }: { children: React.ReactNode; rail: 'songs' | 'artists' }) { return <div className="context-layout">{children}<DiscoveryRail type={rail}/></div> }
function DiscoveryRail({ type }: { type: 'songs' | 'artists' }) { return <aside className="discovery-rail"><p className="eyebrow">KEEP EXPLORING</p><h3>{type === 'songs' ? 'Songs you might like' : 'Similar artists'}</h3>{(type === 'songs' ? songs.slice(2, 5) : [{name:'Kairo Bloom', image:art[1]}, {name:'Sora West', image:art[2]}, {name:'Ari Vale', image:art[4]}]).map((item: Song | { name: string; image: string }) => 'title' in item ? <button className="rail-song" key={item.title}><img src={item.image}/><span><b>{item.title}</b><small>{item.artist}</small></span><Play size={13}/></button> : <button className="rail-artist" key={item.name}><span className="rail-avatar"><img src={item.image}/><i><Play size={12} fill="currentColor"/></i></span><b>{item.name}</b><small>Play top songs</small></button>)}</aside> }
function FollowingPage() {
  const [artist, setArtist] = useState<{name:string; image:string} | null>(null);
  const people = [{name:'Maya Lune', image:art[0]}, {name:'Kairo Bloom', image:art[1]}, {name:'Sora West', image:art[2]}, {name:'NOVA / 7', image:art[3]}, {name:'Ari Vale', image:art[4]}];
  if (artist) return <ArtistProfile artist={artist} close={() => setArtist(null)}/>;
  return <section className="following-page"><p className="eyebrow">YOUR CIRCLE</p><h1>Following</h1><div className="artist-grid">{people.map(person => <button className="artist-card" key={person.name} onClick={() => setArtist(person)}><img src={person.image}/><span><b>{person.name}</b><small>@{person.name.toLowerCase().replace(/ /g, '')}</small></span><i className="artist-play"><Play size={18} fill="currentColor"/></i></button>)}</div></section>;
}
function ArtistProfile({ artist, close }: { artist: {name:string; image:string}; close: () => void }) { return <section className="artist-profile"><button className="back-library" onClick={close}><ArrowLeft size={15}/> Back to Following</button><div className="profile-top"><img src={artist.image}/><div><h1>{artist.name}</h1><p>@{artist.name.toLowerCase().replace(/ /g, '')} Â· Lagos, Nigeria</p><p className="profile-bio">Producer and songwriter making warm, rhythm-led songs for people who listen closely.</p><a href="https://instagram.com" target="_blank">instagram.com/{artist.name.toLowerCase().replace(/ /g, '')}</a><div><button className="outline">Message</button><button className="primary">Following <Check size={14}/></button></div></div></div><section className="profile-feed"><div className="profile-feed-heading"><div><p className="eyebrow">TOP SONGS</p><h2>Most loved by the community</h2></div><button className="quiet">See all <ArrowUpRight size={14}/></button></div><div className="top-song-list">{songs.slice(0,4).map((song, index) => <button className="top-song-row" key={song.title}><span className="top-rank">{String(index + 1).padStart(2, '0')}</span><img src={song.image} alt=""/><span className="top-song-copy"><b>{song.title}</b><small>{song.artist}</small></span><span className="top-song-metrics"><b>{song.plays}</b><small>{index + 4}K downloads Â· {index + 2}K saves</small></span><i><Play size={14} fill="currentColor"/></i></button>)}</div></section></section> }

function Auth({ authMode, setAuthMode, onSubmit, error }: { authMode: 'signin'|'signup'; setAuthMode: (v: 'signin'|'signup') => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void; error?: string; clearError?: () => void }) {
  return <main className="auth-shell"><div className="auth-art"><div className="auth-brand"><span className="brand-mark"><GitBranch size={20}/></span> songtree</div><div><p className="eyebrow"><i/> OPEN COLLABORATION</p><h1>Make your<br/><em>mark in the music.</em></h1><p>Build a body of work that stays connected to every creator who helped it grow.</p></div><div className="auth-tree" aria-label="Listen, Remix, Share"><span>Listen</span><i/><span>Remix</span><i/><span>Share</span></div></div><div className="auth-card"><button className="back" onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}><ArrowLeft size={16}/></button><div><p className="eyebrow">SONGTREE BETA</p><h2>{authMode === 'signin' ? 'Welcome back.' : 'Plant your first branch.'}</h2><p className="muted">{authMode === 'signin' ? 'Sign in to your creator workspace.' : 'Start with a simple creator account.'}</p></div><form onSubmit={onSubmit}>{authMode === 'signup' && <><label>Username<input required name="username" autoComplete="username" pattern="@[A-Za-z0-9._]{3,20}" title="Use @ followed by 3 to 20 letters, numbers, dots, or underscores." placeholder="@john4fm"/></label><small className="username-help">Choose a unique @username. Add your display name in your profile after signup.</small><label>Date of birth<input required type="date" name="dateOfBirth" autoComplete="bday" max={new Date().toISOString().slice(0, 10)}/></label></>}<label>Email<input required type="email" placeholder="you@example.com"/></label><label>Password<input required type="password" minLength={8} placeholder="At least 8 characters"/></label>{authMode === 'signup' && <label className="check"><input type="checkbox" required/> <span>I agree to the beta terms and creator policy.</span></label>}{error && <p className="auth-error" role="alert">{error}</p>}<button className="primary submit" type="submit">{authMode === 'signin' ? 'Sign in' : 'Create account'} <ArrowUpRight size={15}/></button></form><p className="switcher">{authMode === 'signin' ? 'New to Songtree?' : 'Already have an account?'} <button onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}>{authMode === 'signin' ? 'Create one' : 'Sign in'}</button></p><small className="beta-note"><LockKeyhole size={12}/> Beta access uses email and password. Wallets use test tokens only.</small></div></main>;
}


type ChatMessage = { id: string; text: string; sender: 'me' | 'them'; time: string };
type ChatConversation = { id: string; name: string; handle: string; image: string; online: boolean; lastSeen: string; unread: number; updatedAt: number; messages: ChatMessage[] };

const demoConversations: ChatConversation[] = [
  { id: 'kairo', name: 'Kairo Bloom', handle: '@kairobloom', image: art[1], online: true, lastSeen: 'Active now', unread: 2, updatedAt: 3, messages: [
    { id: 'k1', text: 'Hey Jamie, I heard Soft Signal this morning. That pocket is unreal.', sender: 'them', time: '10:32 AM' },
    { id: 'k2', text: 'Thank you! I have been trying to keep it loose without losing the pulse.', sender: 'me', time: '10:34 AM' },
    { id: 'k3', text: 'It really works. Would you be open to me adding a little drum texture to the second verse?', sender: 'them', time: '10:38 AM' },
    { id: 'k4', text: 'Absolutely. I left the stems attached to the track if you want to take a look.', sender: 'me', time: '10:40 AM' },
    { id: 'k5', text: 'Perfect, I will sketch something out tonight and send it over.', sender: 'them', time: '10:42 AM' },
  ] },
  { id: 'sora', name: 'Sora West', handle: '@sorawest', image: art[2], online: false, lastSeen: 'Active 18m ago', unread: 1, updatedAt: 2, messages: [
    { id: 's1', text: 'I sent you a new vocal take for Glass Garden. There are two harmonies in the folder too.', sender: 'them', time: 'Yesterday' },
    { id: 's2', text: 'The breathy one is my favourite. Let me listen properly after the session.', sender: 'me', time: 'Yesterday' },
    { id: 's3', text: 'No rush at all â€” curious which direction you hear for the bridge.', sender: 'them', time: 'Yesterday' },
  ] },
  { id: 'ari', name: 'Ari Vale', handle: '@arivale', image: art[4], online: true, lastSeen: 'Active now', unread: 0, updatedAt: 1, messages: [
    { id: 'a1', text: 'That late-night playlist you shared is such a mood.', sender: 'them', time: 'Monday' },
    { id: 'a2', text: 'Right? I have been collecting slow-burn tracks for weeks.', sender: 'me', time: 'Monday' },
  ] },
  { id: 'maya', name: 'Maya Lune', handle: '@mayalune', image: art[0], online: false, lastSeen: 'Active 2h ago', unread: 0, updatedAt: 0, messages: [
    { id: 'm1', text: 'Thanks for listening to the new mix. Your notes really helped.', sender: 'them', time: 'Sunday' },
    { id: 'm2', text: 'Anytime â€” the new low end feels huge.', sender: 'me', time: 'Sunday' },
  ] },
];

function ChatInbox({ close }: { close: () => void }) {
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem('songtree-demo-messages-v1');
      if (saved) {
        const parsed = JSON.parse(saved) as ChatConversation[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { /* Use the starter inbox if local demo data is unavailable. */ }
    return demoConversations;
  });
  const [selectedId, setSelectedId] = useState(() => {
    try {
      const saved = localStorage.getItem('songtree-demo-messages-v1');
      if (saved) {
        const parsed = JSON.parse(saved) as ChatConversation[];
        if (Array.isArray(parsed) && parsed[0]?.id) return parsed[0].id;
      }
    } catch { /* Use the first demo conversation. */ }
    return 'kairo';
  });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [draft, setDraft] = useState('');
  const [composing, setComposing] = useState(false);
  const [mobileShowList, setMobileShowList] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const active = conversations.find(conversation => conversation.id === selectedId) ?? conversations[0];

  useEffect(() => {
    try { localStorage.setItem('songtree-demo-messages-v1', JSON.stringify(conversations)); } catch { /* The inbox still works for this session if storage is unavailable. */ }
  }, [conversations]);
  useEffect(() => {
    if (!selectedId) return;
    setConversations(current => current.map(conversation => conversation.id === selectedId ? { ...conversation, unread: 0 } : conversation));
  }, [selectedId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [selectedId, active?.messages.length]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close]);

  const visible = conversations.filter(conversation => {
    const matchesFilter = filter === 'all' || conversation.unread > 0;
    const searchText = `${conversation.name} ${conversation.handle} ${conversation.messages[conversation.messages.length - 1]?.text ?? ''}`.toLowerCase();
    return matchesFilter && searchText.includes(query.trim().toLowerCase());
  }).sort((a, b) => b.updatedAt - a.updatedAt);

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !active) return;
    const now = new Date();
    const message: ChatMessage = { id: `message-${now.getTime()}`, text, sender: 'me', time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) };
    setConversations(current => current.map(conversation => conversation.id === active.id ? { ...conversation, messages: [...conversation.messages, message], unread: 0, updatedAt: now.getTime() } : conversation));
    setDraft('');
  };

  const startConversation = (person: { id: string; name: string; handle: string; image: string }) => {
    const existing = conversations.find(conversation => conversation.id === person.id);
    if (!existing) {
      const fresh: ChatConversation = { ...person, online: true, lastSeen: 'Active now', unread: 0, updatedAt: Date.now(), messages: [] };
      setConversations(current => [fresh, ...current]);
    }
    setSelectedId(person.id);
    setComposing(false);
  };

  return <Overlay close={close}><section className={`chat-workspace ${mobileShowList ? 'show-inbox' : 'show-thread'}`} aria-label="Messages inbox">
    <aside className="chat-sidebar">
      <div className="chat-sidebar-head"><div><p className="eyebrow">YOUR CIRCLE</p><h2>Messages <span>{conversations.reduce((sum, conversation) => sum + conversation.unread, 0) || ''}</span></h2></div><button className="chat-new" onClick={() => { setComposing(true); setMobileShowList(false); }} aria-label="New message" title="New message"><Plus size={18}/></button></div>
      <label className="chat-search"><Search size={15}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search conversations" aria-label="Search conversations"/></label>
      <div className="chat-filter"><button className={filter === 'all' ? 'selected' : ''} onClick={() => setFilter('all')}>All messages</button><button className={filter === 'unread' ? 'selected' : ''} onClick={() => setFilter('unread')}>Unread <span>{conversations.reduce((sum, conversation) => sum + (conversation.unread > 0 ? 1 : 0), 0)}</span></button></div>
      <div className="chat-conversations">{visible.map(conversation => {
        const last = conversation.messages[conversation.messages.length - 1];
        return <button key={conversation.id} className={`chat-person ${selectedId === conversation.id && !composing ? 'active' : ''}`} onClick={() => { setSelectedId(conversation.id); setComposing(false); setMobileShowList(false); }}>
          <span className="chat-avatar"><img src={conversation.image} alt=""/>{conversation.online && <i/>}</span><span className="chat-person-copy"><span className="chat-person-top"><b>{conversation.name}</b><small>{last?.time ?? 'New'}</small></span><span className="chat-preview">{last?.sender === 'me' && 'You: '}{last?.text ?? 'Start a conversation'}</span></span>{conversation.unread > 0 && <i className="chat-unread"/>}
        </button>;
      })}{visible.length === 0 && <p className="chat-empty-list">{filter === 'unread' ? 'Youâ€™re all caught up.' : 'No conversations found.'}</p>}</div>
      <div className="chat-demo-note"><span/> Demo inbox Â· saved on this device</div>
    </aside>
    <div className="chat-main">
      <button className="chat-close" onClick={close} aria-label="Close messages"><X size={18}/></button>
      {composing ? <div className="chat-new-panel"><div className="chat-new-icon"><MessageCircle size={22}/></div><p className="eyebrow">START SOMETHING</p><h3>New message</h3><p>Choose a creator to start a conversation.</p><div className="chat-contact-list">{[{id:'kairo',name:'Kairo Bloom',handle:'@kairobloom',image:art[1]},{id:'sora',name:'Sora West',handle:'@sorawest',image:art[2]},{id:'ari',name:'Ari Vale',handle:'@arivale',image:art[4]},{id:'maya',name:'Maya Lune',handle:'@mayalune',image:art[0]},{id:'nova',name:'NOVA / 7',handle:'@nova7',image:art[3]}].map(person => <button key={person.id} onClick={() => startConversation(person)}><img src={person.image} alt=""/><span><b>{person.name}</b><small>{person.handle}</small></span><ArrowUpRight size={15}/></button>)}</div></div> : active ? <>
        <div className="chat-thread-head"><button className="chat-mobile-back" onClick={() => setMobileShowList(true)} aria-label="Back to conversations"><ArrowLeft size={17}/></button><img src={active.image} alt=""/><span><b>{active.name}</b><small><i className={active.online ? 'online' : ''}/>{active.lastSeen}</small></span><button title="Conversation details"><MoreHorizontal size={19}/></button></div>
        <div className="chat-thread-body"><div className="chat-day">Today</div>{active.messages.map(message => <div key={message.id} className={`chat-message-row ${message.sender === 'me' ? 'mine' : ''}`}>{message.sender === 'them' && <img src={active.image} alt=""/>}<div className="chat-message-content"><div className="chat-bubble">{message.text}</div><small>{message.time}{message.sender === 'me' && <Check size={12}/>}</small></div></div>)}<div ref={endRef}/></div>
        <form className="chat-composer" onSubmit={sendMessage}><input value={draft} onChange={event => setDraft(event.target.value)} placeholder={`Message ${active.name}â€¦`} aria-label="Write a message"/><button type="submit" disabled={!draft.trim()} aria-label="Send message"><Send size={16}/></button><small>Press Enter to send</small></form>
      </> : <div className="chat-new-panel"><p className="eyebrow">YOUR INBOX</p><h3>Your conversations live here.</h3><button className="primary" onClick={() => { setComposing(true); setMobileShowList(false); }}>Start a conversation <Plus size={15}/></button></div>}
    </div>
  </section></Overlay>;
}

type FullScreenPlayerProps = {
  close: () => void; song: Song; playing: boolean; saved: boolean; currentTime: number; durationSeconds: number;
  shuffle: boolean; repeatMode: RepeatMode; volume: number; onToggleSaved: () => void; onTogglePlaying: () => void;
  onPrevious: () => void; onNext: () => void; onToggleShuffle: () => void; onCycleRepeat: () => void;
  onSeek: (time: number) => void; onVolumeChange: (volume: number) => void;
};

function FullScreenPlayer({ close, song, playing, saved, currentTime, durationSeconds, shuffle, repeatMode, volume, onToggleSaved, onTogglePlaying, onPrevious, onNext, onToggleShuffle, onCycleRepeat, onSeek, onVolumeChange }: FullScreenPlayerProps) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') closeRef.current(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  return <Overlay close={close} className="fullscreen-overlay"><section className="full-player" aria-label="Full-screen music player">
    <div className="full-player-backdrop" style={{ backgroundImage: `url("${song.image}")` }}/>
    <div className="full-player-top"><span><GitBranch size={18}/> songtree <i/> NOW PLAYING</span><button className="full-close" onClick={close} aria-label="Exit full-screen player"><X size={20}/></button></div>
    <div className="full-player-content">
      <div className="full-cover-frame"><img src={song.image} alt={`Cover art for ${song.title}`}/></div>
      <div className="full-player-panel">
        <div className="full-track-heading"><div><p className="eyebrow">{song.genre.toUpperCase()} · SONGTREE RADIO</p><h1>{song.title}</h1><p>{song.artist}</p></div><button className={`full-save ${saved ? 'is-saved' : ''}`} onClick={onToggleSaved} aria-label={saved ? 'Remove from offline saves' : 'Save song locally'} aria-pressed={saved} title={saved ? 'Saved on this device' : 'Save on this device'}><Heart size={21} fill={saved ? 'currentColor' : 'none'}/></button></div>
        <div className="full-timeline"><input type="range" min="0" max={durationSeconds || 1} step="1" value={Math.min(currentTime, durationSeconds)} onChange={event => onSeek(Number(event.target.value))} aria-label="Playback position"/><div><span>{formatPlayerTime(currentTime)}</span><span>-{formatPlayerTime(Math.max(0, durationSeconds - currentTime))}</span></div></div>
        <div className="full-transport">
          <button className={shuffle ? 'is-active' : ''} onClick={onToggleShuffle} aria-label="Toggle shuffle" aria-pressed={shuffle} title="Shuffle"><Shuffle size={19}/></button>
          <button onClick={onPrevious} aria-label="Previous song" title="Previous song"><SkipBack size={22} fill="currentColor"/></button>
          <button className="full-play" onClick={onTogglePlaying} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={24} fill="currentColor"/> : <Play size={24} fill="currentColor"/>}</button>
          <button onClick={onNext} aria-label="Next song" title="Next song"><SkipForward size={22} fill="currentColor"/></button>
          <button className={repeatMode !== 'off' ? 'is-active' : ''} onClick={onCycleRepeat} aria-label={`Repeat ${repeatMode}`} aria-pressed={repeatMode !== 'off'} title={`Repeat ${repeatMode}`}>{repeatMode === 'one' ? <Repeat1 size={19}/> : <Repeat size={19}/>}</button>
        </div>
        <div className="full-volume"><Volume2 size={17}/><input type="range" min="0" max="100" value={volume} onChange={event => onVolumeChange(Number(event.target.value))} aria-label="Volume"/><span>{volume}%</span></div>
        <div className="full-player-footnote"><span>{saved ? 'Saved on this device' : 'Save this track on this device'}</span><span>Playback controls follow your current Top 50 selection</span></div>
      </div>
    </div>
  </section></Overlay>;
}
type ModalViewProps = {
  type: Modal;
  close: () => void;
  switchDesktop: () => void;
  song: Song;
  submitted: boolean;
  setSubmitted: (value: boolean) => void;
  profileHandle?: string;
  displayName?: string;
  saveProfileDisplayName?: (name: string) => void;
  onUploadPublished?: (title: string) => void;
  onListenToPublishedSong?: () => void;
  playing: boolean;
  saved: boolean;
  currentTime: number;
  durationSeconds: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  volume: number;
  onToggleSaved: () => void;
  onTogglePlaying: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
};

function ModalView({ type, close, switchDesktop, song, submitted, setSubmitted, profileHandle = '@jamierivers', displayName = '', saveProfileDisplayName, onUploadPublished, onListenToPublishedSong, playing, saved, currentTime, durationSeconds, shuffle, repeatMode, volume, onToggleSaved, onTogglePlaying, onPrevious, onNext, onToggleShuffle, onCycleRepeat, onSeek, onVolumeChange }: ModalViewProps) {
  const [songKind, setSongKind] = useState('Beat');
  const [profileName, setProfileName] = useState(displayName);
  const [profileBio, setProfileBio] = useState('Producer, songwriter and collaborator. Building music that grows in the open.');
  const [publishedTitle, setPublishedTitle] = useState('');
  if (type === 'chat') return <ChatInbox close={close} />;
  if (type === 'profile') return <Overlay close={close}><section className="profile-page"><button className="close" onClick={close}><X/></button><div className="profile-banner"/><div className="profile-intro"><img src={art[0]} alt="Your profile"/><div><p className="eyebrow">PUBLIC CREATOR PROFILE</p><h1>{profileName || profileHandle.replace(/^@/, '')}</h1><p>{profileHandle} Â· Lagos, Nigeria</p><small>This is how listeners and collaborators see you.</small></div></div><div className="profile-editor"><div><p className="eyebrow">EDIT PUBLIC PROFILE</p><h2>Tell the community who you are.</h2></div><label>Artist / display name<input value={profileName} onChange={event => setProfileName(event.target.value)} placeholder="Your artist name"/></label><label>Bio<textarea value={profileBio} onChange={event => setProfileBio(event.target.value)} maxLength={180}/><small>{profileBio.length}/180</small></label><label>One link<input placeholder="https://your-link.com" defaultValue="https://instagram.com/jamierivers"/></label><div className="profile-stats"><span><b>126</b> followers</span><span><b>12</b> following</span><span><b>4</b> public songs</span></div><button className="primary" onClick={() => { saveProfileDisplayName?.(profileName); close(); }}>Save public profile <Check size={15}/></button></div></section></Overlay>;
  if (type === 'fullscreen') return <FullScreenPlayer close={close} song={song} playing={playing} saved={saved} currentTime={currentTime} durationSeconds={durationSeconds} shuffle={shuffle} repeatMode={repeatMode} volume={volume} onToggleSaved={onToggleSaved} onTogglePlaying={onTogglePlaying} onPrevious={onPrevious} onNext={onNext} onToggleShuffle={onToggleShuffle} onCycleRepeat={onCycleRepeat} onSeek={onSeek} onVolumeChange={onVolumeChange}/>;
  if (type === 'desktop') return <Overlay close={close}><div className="dialog download-dialog"><button className="close" onClick={close}><X/></button><div className="modal-icon"><Download/></div><p className="eyebrow">CREATOR TOOLS LIVE ON DESKTOP</p><h2>Ready to make something new?</h2><p>Uploading songs, adding branches, wallet features and file sharing are available in the Songtree desktop app.</p><button className="primary" onClick={switchDesktop}>Preview desktop workspace <ArrowUpRight size={15}/></button><button className="link-button">Download Songtree for desktop</button></div></Overlay>;
  if (type === 'wallet') return <CreatorWallet close={close}/>;
  if (type === 'tree') return <Overlay close={close}><div className="dialog tree-dialog"><button className="close" onClick={close}><X/></button><p className="eyebrow">PERSISTENT CREATIVE HISTORY</p><h2>{song.title} tree</h2><Tree song={song}/><div className="tree-footer"><span>Every branch keeps its creator and source link.</span><button className="primary" onClick={close}>Explore branches</button></div></div></Overlay>;
  return <Overlay close={close}><div className={`dialog upload-dialog ${submitted && type === 'upload' ? 'upload-success-dialog' : ''}`}><button className="close" onClick={close}><X/></button>{submitted ? (type === 'upload' ? <UploadSuccess songTitle={publishedTitle || 'Untitled song'} artist={displayName || profileHandle.replace(/^@/, '')} profileHandle={profileHandle} close={close} onListenSong={onListenToPublishedSong}/> : <div className="success"><div className="modal-icon"><GitBranch/></div><h2>Your branch is planted.</h2><p>It is saved as a private draft until you publish and accept the public remix terms.</p><button className="primary" onClick={close}>Back to workspace <ArrowUpRight size={15}/></button></div>) : type === 'upload' ? <SongtreeComposer songKind={songKind} setSongKind={setSongKind} submit={(result) => { setPublishedTitle(result.title); onUploadPublished?.(result.title); setSubmitted(true); }} /> : <><p className="eyebrow">BUILDING ON {song.title.toUpperCase()}</p><h2>Add your contribution</h2><div className="upload-zone"><Upload size={22}/><b>Drop audio here</b><span>WAV, MP3, AIFF Â· up to 100MB</span></div><label>Track title<input placeholder={song.title + ' / your idea'}/></label><label>Genre<select defaultValue=""><option value="" disabled>Select a music genre</option>{genres.slice(1).map(g => <option key={g}>{g}</option>)}</select></label><label className="check"><input type="checkbox" required/> <span>I own or have permission to share this audio and understand it starts private.</span></label><button className="primary wide" onClick={() => setSubmitted(true)}>Plant this branch <ArrowUpRight size={15}/></button></>}</div></Overlay>;
	}

function UploadSuccess({ songTitle, artist, profileHandle, close, onListenSong }: { songTitle: string; artist: string; profileHandle: string; close: () => void; onListenSong?: () => void }) {
  const [copied, setCopied] = useState(false);
  const slug = songTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'your-song';
  const handle = profileHandle.replace(/^@/, '') || 'creator';
  const shareLink = `https://songtree.app/@${encodeURIComponent(handle)}/${slug}`;
  const shareText = `Listen to ${songTitle} by ${artist} on Songtree: ${shareLink}`;
  const copyShareText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      const field = document.createElement('textarea');
      field.value = shareText;
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };
  const instagramShare = () => {
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    void copyShareText();
  };
  const encodedShareText = encodeURIComponent(shareText);
  return <div className="success upload-success"><div className="modal-icon"><Check/></div><p className="eyebrow">PUBLISHED TO SONGTREE</p><h2>Your Song is live.</h2><p>Share your song with the world and see what they make.</p><div className="share-caption">{shareText}</div><div className="share-actions"><a className="share-button share-icon-button" href={`https://wa.me/?text=${encodedShareText}`} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp" title="Share on WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20l.9-4.7a8.5 8.5 0 1 1 16.6-3.7Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M8.2 7.5c-.3-.4-.5-.4-.8-.4h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.3s1 2.8 1.1 3c.1.2 2 3.1 4.7 4.2 2.3.9 2.8.7 3.3.6.5-.1 1.7-.7 1.9-1.4.2-.6.2-1.1.1-1.3-.1-.1-.3-.2-.6-.4-.4-.2-1.7-.8-2-.9-.3-.1-.5-.2-.6.2-.2.3-.7.9-.9 1.1-.2.2-.3.3-.6.1-.4-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.2-.6.2-.2.4-.4.5-.6.2-.2.2-.3.3-.5.1-.2 0-.4 0-.6-.1-.2-.7-1.7-1-2.3Z" fill="currentColor"/></svg></a><a className="share-button share-icon-button" href={`https://twitter.com/intent/tweet?text=${encodedShareText}`} target="_blank" rel="noreferrer" aria-label="Share on X" title="Share on X"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.9 2H22l-6.8 7.8 8 12.2h-6.3L12 12.7l-5.8 9.3H3l7.3-11.5L2.7 2h6.5l4.5 7.1L18.9 2zm-1.1 18h1.7L8.3 4H6.5z"/></svg></a><button className="share-button share-icon-button" type="button" onClick={instagramShare} aria-label="Share on Instagram" title="Share on Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5.5" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="17.8" cy="6.4" r="1.1" fill="currentColor"/></svg></button><button className="share-button share-icon-button copy-share" type="button" onClick={() => void copyShareText()} aria-label={copied ? 'Share text copied' : 'Copy share text'} title={copied ? 'Copied' : 'Copy link and share text'}>{copied ? <Check size={18}/> : <Copy size={18}/>}</button></div><button className="primary listen-uploaded-song" onClick={() => { onListenSong?.(); close(); }}><Play size={15} fill="currentColor"/> Listen to your song</button></div>;
}
function CreatorWallet({ close }: { close: () => void }) {
  const [panel, setPanel] = useState<'home' | 'transfer' | 'receive' | 'export'>('home');
  const [exportStep, setExportStep] = useState<'warning' | 'password' | 'revealed'>('warning');
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const address = '0x7A81d8f43B2c6A0e9cE4';
  const seedPhrase = 'canvas river orbit lemon velvet north maple signal artist cloud meadow';
  const copyAddress = async () => { try { await navigator.clipboard.writeText(address); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); } };
  const goHome = () => { setPanel('home'); setSent(false); setAmount(''); setDestination(''); };
  return <Overlay close={close}><div className="dialog wallet-dialog creator-wallet-dialog"><button className="close" onClick={close}><X/></button>{panel === 'home' && <><p className="eyebrow">CREATOR WALLET Â· BASE MAINNET</p><h2>Your wallet</h2><div className="wallet-network"><span className="network-dot"/> Base Mainnet <b>CHAIN ID 8453</b></div><div className="wallet-menu"><button className="wallet-menu-trigger" onClick={() => setShowExport(value => !value)} aria-label="Wallet options" title="Wallet options"><MoreHorizontal size={17}/></button>{showExport && <div className="wallet-menu-popover"><button onClick={() => { setPanel('export'); setExportStep('warning'); }}><Download size={13}/> Export wallet</button></div>}</div><div className="balance wallet-usdc-balance"><small>Total wallet balance</small><b>$125.00 <span>USDC</span></b><em>USDC payouts only Â· demo balance</em></div><div className="wallet-actions"><button className="outline" onClick={() => setPanel('transfer')}>Transfer <ArrowUpRight size={14}/></button><button className="outline" onClick={() => setPanel('receive')}>Receive <Download size={14}/></button></div><div className="wallet-token-heading"><span>Tokens on Base</span><small>1 asset</small></div><button className="wallet-token-row" onClick={() => setPanel('transfer')}><span className="token-mark">$</span><span><b>USD Coin</b><small>USDC Â· Base</small></span><strong>125.00</strong><ArrowUpRight size={14}/></button><div className="wallet-note"><ShieldCheck size={18}/><span>Songtree pays creator earnings in USDC on Base. This wallet is separate from your public user profile.</span></div><button className="primary wide" onClick={close}>Done <Check size={15}/></button></>}{panel === 'transfer' && <><button className="wallet-back" onClick={goHome}><ArrowLeft size={14}/> Wallet overview</button><p className="eyebrow">BASE Â· USDC</p><h2>Transfer USDC</h2>{sent ? <div className="wallet-success"><div className="modal-icon"><Check/></div><h3>Transfer request saved</h3><p>This demo does not broadcast a transaction. Production transfers will be sent on Base after confirmation.</p><button className="primary wide" onClick={goHome}>Back to wallet</button></div> : <><div className="wallet-form-summary"><span>Available</span><b>125.00 USDC</b></div><label>Amount<input inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value)} placeholder="0.00 USDC"/></label><label>Recipient EVM address<input value={destination} onChange={event => setDestination(event.target.value)} placeholder="0x..."/></label><p className="wallet-warning"><AlertTriangle size={15}/> Confirm the Base network and address before sending. Transfers cannot be reversed.</p><button className="primary wide" disabled={!amount || !destination} onClick={() => setSent(true)}>Review Base transfer <ArrowUpRight size={14}/></button></>}</>}{panel === 'receive' && <><button className="wallet-back" onClick={goHome}><ArrowLeft size={14}/> Wallet overview</button><p className="eyebrow">RECEIVE CREATOR PAYOUTS</p><h2>Receive USDC</h2><p className="wallet-export-copy">Send USDC on Base to this address. Only send supported assets on the selected network.</p><div className="address receive-address"><small>Your Base receiving address</small><code>{address}</code><button onClick={copyAddress}>{copied ? 'Copied' : 'Copy'}</button></div><p className="wallet-warning"><AlertTriangle size={15}/> Sending from another network may require a bridge. Always select Base before confirming.</p><button className="primary wide" onClick={goHome}>Done <Check size={14}/></button></>}{panel === 'export' && <><button className="wallet-back" onClick={goHome}><ArrowLeft size={14}/> Wallet overview</button><p className="eyebrow">BACK UP YOUR CREATOR WALLET</p><h2>Export wallet</h2>{exportStep === 'warning' ? <><div className="seed-warning"><AlertTriangle size={20}/><div><b>Your seed phrase controls your funds</b><p>Songtree will never ask for your wallet seed phrase. Show it to nobody. Anyone who sees it can import this wallet and drain every token.</p></div></div><label className="check wallet-check"><input type="checkbox" onChange={event => event.target.checked && setExportStep('password')}/><span>I understand the security risk and want to continue.</span></label></> : exportStep === 'password' ? <><p className="wallet-export-copy">Enter your wallet password to reveal the recovery phrase. This is a local demo flow; never share the phrase with Songtree support or anyone else.</p><label>Wallet password<input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter password" autoFocus/></label><button className="primary wide" disabled={!password} onClick={() => setExportStep('revealed')}>Reveal seed phrase <ShieldCheck size={14}/></button></> : <><div className="seed-revealed"><p><AlertTriangle size={15}/> Keep this phrase offline and private.</p><code>{seedPhrase}</code></div><p className="wallet-export-copy">This phrase can restore the wallet in another EVM-compatible wallet. Songtree will never ask for it.</p><button className="primary wide" onClick={close}>Iâ€™ve backed it up securely <Check size={14}/></button></>}</>}</div></Overlay>;
}

function formatStorageSize(bytes: number): string {
  if (bytes <= 0) return '0 MB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
function SongtreeComposer({ songKind, setSongKind, submit }: { songKind: string; setSongKind: (value: string) => void; submit: (result: { title: string; storeMp3: boolean; storeExtras: boolean }) => void }) {
  const [step, setStep] = useState(1);
  const [isRemix, setIsRemix] = useState(false);
  const [explicit, setExplicit] = useState('No');
  const [language, setLanguage] = useState('English');
  const [lyrics, setLyrics] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFileName, setCoverFileName] = useState('');
  const [extraFileNames, setExtraFileNames] = useState('');
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [storeMp3, setStoreMp3] = useState(false);
  const [storeExtras, setStoreExtras] = useState(false);
  const steps = ['Basics', 'Details', 'Credits', 'Publish', 'Cloud storage'];
  const goNext = () => setStep(current => Math.min(5, current + 1));
  const goBack = () => setStep(current => Math.max(1, current - 1));
  const freeStorageBytes = 500 * 1024 * 1024;
  const mp3Bytes = audioFile?.size ?? 0;
  const extrasBytes = extraFiles.reduce((total, file) => total + file.size, 0);
  const selectedCloudBytes = (storeMp3 ? mp3Bytes : 0) + (storeExtras ? extrasBytes : 0);
  const freeBytesLeft = Math.max(0, freeStorageBytes - selectedCloudBytes);
  const exceedsFreeStorage = selectedCloudBytes > freeStorageBytes;
  const progress = <div className="composer-progress" aria-label={`Step ${step} of 5`}><i className="progress-track"/><i className="progress-fill" style={{ width: `${Math.max(0, step - 1) * 20}%` }}/>{steps.map((label, index) => <span key={label} className={step > index + 1 ? 'done' : step === index + 1 ? 'current' : ''} aria-current={step === index + 1 ? 'step' : undefined}><b>0{index + 1}</b><small>{label}</small></span>)}</div>;

  return <div className="songtree-composer">
    <div className="composer-heading">
      {progress}
      <h2>{step === 1 ? 'Start a songtree' : steps[step - 1]}</h2>
    </div>
    <div className="composer-step-body" key={step}>
      {step === 1 && <>
        <div className="step-one-upload-row">
          <label className="upload-zone main-audio audio-picker">
            <input className="composer-file-input" type="file" accept="audio/mpeg,audio/mp3,.mp3" onChange={event => { const file = event.currentTarget.files?.[0] ?? null; setAudioFile(file); setAudioFileName(file?.name ?? ''); }}/>
            <Music2 size={25}/><span className="audio-picker-copy"><b>{audioFileName || 'Upload an audio file'}</b><small>MP3 · this is the version listeners can play</small></span><ArrowUpRight size={17}/>
          </label>
          <label className="cover-upload cover-picker cover-square">
            <input className="composer-file-input" type="file" accept="image/jpeg,image/png" onChange={event => setCoverFileName(event.currentTarget.files?.[0]?.name ?? '')}/>
            <ImagePlus size={23}/><span><b>{coverFileName || 'Choose cover image'}</b><small>JPG or PNG · square artwork works best</small></span><span className="cover-browse">Browse</span>
          </label>
        </div>
        <label className="song-title-field">Song title<input value={songTitle} onChange={event => setSongTitle(event.target.value)} placeholder="Name your song"/></label>
        <div className="song-kind-section"><p>What's the song?</p><div className="kind-picker">{['Beat', 'Vocals', 'Beat + Vocals'].map(kind => <button type="button" key={kind} className={songKind === kind ? 'selected' : ''} onClick={() => setSongKind(kind)}>{songKind === kind && <Check size={13}/>} {kind}</button>)}</div></div>
      </>}

      {step === 2 && <>
        <div className="upload-metadata-grid"><label>Explicit content<select value={explicit} onChange={event => setExplicit(event.target.value)}><option>No</option><option>Yes</option></select></label><label>Language<select value={language} onChange={event => setLanguage(event.target.value)}><option>English</option><option>Spanish</option><option>French</option><option>Portuguese</option><option>Yoruba</option><option>Other</option></select></label></div>
        <label>Genre<select defaultValue=""><option value="" disabled>Select a music genre</option>{genres.slice(1).map(g => <option key={g}>{g}</option>)}</select></label>
        <label>Lyrics <span className="optional-label">Optional</span><textarea value={lyrics} onChange={event => setLyrics(event.target.value)} rows={3} placeholder="Add lyrics if you want listeners to follow along"/></label>
        <label className="check"><input type="checkbox" checked={isRemix} onChange={event => setIsRemix(event.target.checked)}/><span>This is a remix of an existing Songtree</span></label>
        {isRemix && <label>Link to the Songtree you are remixing<input placeholder="Paste Songtree link"/></label>}
      </>}

      {step === 3 && <>
        <p className="field-caption"><Users size={14}/> Credits and collaborators</p>
        <p className="credit-help">Add each artist by name, @Songtree account, or profile link, then choose their contribution.</p>
        <CreditRow placeholder="Your artist name or @account" defaultRole="Lead artist"/><CreditRow placeholder="Add a collaborator"/><CreditRow placeholder="Add another collaborator"/>
        <button type="button" className="add-credit"><Plus size={14}/> Add another credit</button>
      </>}

      {step === 4 && <>
        <label className="attachment-zone attachment-picker"><input className="composer-file-input" type="file" multiple accept=".wav,.mp3,.aiff,.zip" onChange={event => { const files = Array.from(event.currentTarget.files ?? []); setExtraFiles(files); setExtraFileNames(files.map(file => file.name).join(', ')); }}/><Plus size={21}/><span><b>{extraFileNames || 'Attach stems or extra files'}</b><small>Optional Â· WAV, vocals, or project files</small></span></label>
        <p className="storage-note"><ShieldCheck size={14}/><span>Files are stored and seeded by you unless you are on a paid storage plan.</span></p>
        <div className="publish-summary"><b>Before you publish</b><span>Your song will be public and listeners can hear it.</span><span>Public remix permissions keep creator credit attached to every branch.</span></div>
        <label className="check publish-consent"><input type="checkbox" required/> <span>I own or have permission to share this audio and accept the public remix license.</span></label>
      </>}
      {step === 5 && <>
        <section className="cloud-storage-step">
          <div className="cloud-storage-intro"><p className="eyebrow">HOSTING OPTIONS</p><h3>Host with Fans or use Cloud storage?</h3><p>Songtree saves your song on your computer and with your community. The more popular a song the better. If your community is growing use cloud storage to keep songs available even when you're offline.</p></div>
          <div className="cloud-plan-card"><span><b>500 MB free</b> storage included</span><span>Upgrade to <b>5 GB for $4.99 a month</b> when you need more.</span><small>Upgrade pricing shown for the demo; no payment is taken.</small></div>
          <div className="cloud-file-options">
            <label className="cloud-file-choice"><input type="checkbox" checked={storeMp3} onChange={event => setStoreMp3(event.target.checked)}/><span><b>Song MP3</b><small>{audioFileName || 'No MP3 selected'} · {formatStorageSize(mp3Bytes)}</small></span></label>
            <label className="cloud-file-choice"><input type="checkbox" checked={storeExtras} onChange={event => setStoreExtras(event.target.checked)}/><span><b>Additional files and stems</b><small>{extraFiles.length ? extraFileNames : 'No additional files selected'} · {formatStorageSize(extrasBytes)}</small></span></label>
          </div>
          {exceedsFreeStorage && <p className="cloud-storage-warning" role="alert">Selected files exceed your 500 MB free space. Uncheck files or choose the 5 GB upgrade.</p>}
          <div className="cloud-space-footer"><div><b>{formatStorageSize(freeBytesLeft)} left</b><span>of 500 MB free storage</span></div><div className="cloud-space-track"><i style={{ width: `${Math.min(100, selectedCloudBytes / freeStorageBytes * 100)}%` }}/></div></div>
        </section>
      </>}
    </div>

    <div className="composer-actions">
      {step > 1 ? <button type="button" className="outline" onClick={goBack}><ArrowLeft size={14}/> Back</button> : <span className="composer-step-note">Your progress stays in this draft.</span>}
      {step < 5 ? <button type="button" className="primary" onClick={goNext}>Next: {steps[step]} <ArrowUpRight size={15}/></button> : <button type="button" className="primary" onClick={() => submit({ title: songTitle.trim() || 'Untitled song', storeMp3, storeExtras })} disabled={(storeMp3 || storeExtras) && exceedsFreeStorage}>{(storeMp3 || storeExtras) && exceedsFreeStorage ? 'Free space exceeded' : !storeMp3 && !storeExtras ? "I'll host it myself with my fans" : 'Save to cloud & publish'} <ArrowUpRight size={15}/></button>}
    </div>
  </div>;
}
function CreditRow({ placeholder, defaultRole = '' }: { placeholder: string; defaultRole?: string }) { return <div className="credit-row"><input placeholder={placeholder}/><select defaultValue={defaultRole}><option value="" disabled>Choose role</option>{['Lead artist', 'Featured artist', 'Vocals', 'Writer', 'Producer', 'Mixing', 'Mastering', 'Drums', 'Guitar', 'Keys', 'Bass', 'Cover art', 'Other'].map(role => <option key={role}>{role}</option>)}</select></div> }
function Overlay({ children, close, className = "" }: { children: React.ReactNode; close: () => void; className?: string }) { return <div className={`overlay ${className}`} onMouseDown={close}><div onMouseDown={event => event.stopPropagation()}>{children}</div></div>; }
function Tree({ song }: { song: Song }) { return <div className="tree"><div className="tree-card root"><img src={song.image}/><span><b>{song.title}</b><small>Original Â· {song.artist}</small></span></div><div className="tree-line"><i/></div><div className="tree-children"><div className="tree-card"><img src={art[2]}/><span><b>Night Drive / Open Water</b><small>Vocal layer Â· Ari Vale</small></span></div><div className="tree-card"><img src={art[1]}/><span><b>{song.title} (Unplugged)</b><small>New arrangement Â· Kairo Bloom</small></span></div></div></div>}

