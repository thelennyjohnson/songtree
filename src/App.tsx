import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowUpRight, Check, Download, GitBranch,
  Heart, Library, LockKeyhole, LogOut, MoreHorizontal, Music2, Pause,
  Play, Plus, Search, ShieldCheck, Sparkles, Upload, Wallet, X, ImagePlus, Users, Radio, MessageCircle, Send, Maximize2,
} from 'lucide-react';

const art = [
  'https://images.pexels.com/photos/33418887/pexels-photo-33418887.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/10269844/pexels-photo-10269844.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/16251531/pexels-photo-16251531.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/16015747/pexels-photo-16015747.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/13768643/pexels-photo-13768643.jpeg?auto=compress&cs=tinysrgb&w=900',
];

const genres = ['All', 'Afrobeats', 'Hip-hop', 'EDM', 'Pop', 'Rock', 'R&B', 'Country', 'Amapiano', 'Jazz', 'Gospel', 'Reggae', 'Dancehall', 'House', 'Soul', 'Indie', 'Latin', 'Trap', 'Drill', 'Classical', 'Folk'];
type Song = { title: string; artist: string; genre: string; plays: string; remixes: number; duration: string; image: string; score: string };
const songs: Song[] = [
  { title: 'Soft Signal', artist: 'Maya Lune', genre: 'Afrobeats', plays: '2.4M', remixes: 18, duration: '3:42', image: art[0], score: '+12%' },
  { title: 'Breathe In', artist: 'Kairo Bloom', genre: 'EDM', plays: '1.8M', remixes: 12, duration: '4:08', image: art[1], score: '+8%' },
  { title: 'Glass Garden', artist: 'Sora West', genre: 'R&B', plays: '1.2M', remixes: 9, duration: '3:18', image: art[2], score: '+5%' },
  { title: 'Afterimage', artist: 'NOVA / 7', genre: 'Hip-hop', plays: '984K', remixes: 24, duration: '2:56', image: art[3], score: '+21%' },
  { title: 'Late Checkout', artist: 'Ari Vale', genre: 'House', plays: '721K', remixes: 7, duration: '3:27', image: art[4], score: '+4%' },
  { title: 'Palmwine Dreams', artist: 'Reema', genre: 'Afrobeats', plays: '698K', remixes: 11, duration: '3:08', image: art[1], score: '+10%' },
];

type Mode = 'desktop' | 'web';
type Screen = 'auth' | 'app';
type Modal = 'none' | 'desktop' | 'upload' | 'branch' | 'wallet' | 'tree' | 'chat' | 'fullscreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [mode, setMode] = useState<Mode>('desktop');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [modal, setModal] = useState<Modal>('none');
  const [genre, setGenre] = useState('All');
  const [active, setActive] = useState<Song>(songs[0]);
  const [playing, setPlaying] = useState(true);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [view, setView] = useState<'discover' | 'library' | 'songs' | 'following'>('discover');
  const [draftNotice, setDraftNotice] = useState(false);
  const filtered = useMemo(() => genre === 'All' ? songs : songs.filter(s => s.genre === genre), [genre]);
  const protectedAction = (next: Modal) => mode === 'desktop' ? setModal(next) : setModal('desktop');
  const selectSong = (song: Song) => { setActive(song); setPlaying(true); };
  const authenticate = (event: FormEvent) => { event.preventDefault(); setScreen('app'); };

  if (screen === 'auth') return <Auth authMode={authMode} setAuthMode={setAuthMode} onSubmit={authenticate} />;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><GitBranch size={18} /></span><strong>songtree</strong><small>BETA</small></div>
      <div className="mode-switch" aria-label="Product preview mode"><button className={mode === 'desktop' ? 'selected' : ''} onClick={() => setMode('desktop')}><Music2 size={14}/> Desktop</button><button className={mode === 'web' ? 'selected' : ''} onClick={() => setMode('web')}><Play size={14}/> Web player</button></div>
      <p className="side-label">Explore</p>
      <nav><button className={'nav-item ' + (view === 'discover' ? 'active' : '')} onClick={() => setView('discover')}><Sparkles size={18}/> Discover</button><button className={'nav-item ' + (view === 'library' ? 'active' : '')} onClick={() => setView('library')}><Library size={18}/> Your library <span>8</span></button><button className={'nav-item ' + (view === 'songs' ? 'active' : '')} onClick={() => setView('songs')}><GitBranch size={18}/> Your Songs</button><button className={'nav-item ' + (view === 'following' ? 'active' : '')} onClick={() => setView('following')}><Users size={18}/> Following</button></nav>
      <p className="side-label">Creator space</p>
      <nav><button className="nav-item" onClick={() => protectedAction('upload')}><Plus size={18}/> New song</button><button className="nav-item" onClick={() => protectedAction('wallet')}><Wallet size={18}/> Wallet</button></nav>
      <div className="sidebar-footer"><div className="identity"><img src={art[0]} /><div><b>Jamie Rivers</b><small>@jamierivers</small></div><MoreHorizontal size={17}/></div><button className="signout" onClick={() => setScreen('auth')}><LogOut size={15}/> Sign out</button></div>
    </aside>

    <main className="main">
      <header><div className="mobile-brand"><GitBranch size={18}/> songtree</div><div className="header-copy"><span>{mode === 'desktop' ? 'Desktop creator workspace' : 'Songtree player'}</span><b>{mode === 'desktop' ? 'Create, own and grow the tree.' : 'Listen, discover and follow the tree.'}</b></div><div className="header-actions"><button className="search"><Search size={17}/> Search music and creators</button><button className="message-top" onClick={() => setModal('chat')} aria-label="Messages"><MessageCircle size={18}/></button><button className="avatar"><img src={art[0]}/></button></div></header>
      {view === 'library' ? <ContextLayout rail="songs"><CollectionLibrary /></ContextLayout> : view === 'songs' ? <ContextLayout rail="artists"><SongCatalogue /></ContextLayout> : view === 'following' ? <ContextLayout rail="artists"><FollowingPage /></ContextLayout> : <><section className="hero"><div className="hero-copy"><p className="eyebrow"><i/> COMMUNITY CHARTS</p><h1>Music grows<br/><em>when it is shared.</em></h1><p>Every open track is a starting point. Listen to the pulse, follow the credits, then add your own branch.</p><div className="hero-buttons"><button className="primary" onClick={() => { setActive(songs[0]); setPlaying(true); }}><Play size={15} fill="currentColor"/> Play Top Songs</button><button className="quiet" onClick={() => protectedAction('upload')}>Add Song <ArrowUpRight size={15}/></button></div></div><div className="hero-art"><div className="halo"/><img src={art[0]}/><div className="art-label"><b>01</b><span>Top of the week</span></div><div className="branch-chip"><GitBranch size={15}/><span>18 open<br/><b>branches</b></span></div></div></section>

      <section className="chart-section"><div className="section-title"><div><p className="eyebrow">LISTENED TO. SAVED. REVIEWED.</p><h2>Top 50 <span>this week</span></h2></div><div className="method"><ShieldCheck size={15}/> Community signal + quality review</div></div><div className="genre-bar">{genres.map(g => <button key={g} className={genre === g ? 'active' : ''} onClick={() => setGenre(g)}>{g}</button>)}</div><div className="rankings">{filtered.map((song, index) => <button className={'song-row ' + (active.title === song.title ? 'current' : '')} key={song.title} onClick={() => selectSong(song)}><span className="rank">{String(index + 1).padStart(2, '0')}</span><span className="cover"><img src={song.image}/>{active.title === song.title && playing && <i className="bars"><b/><b/><b/></i>}</span><span className="song-data"><b>{song.title}</b><small>{song.artist} · {song.genre}</small></span><span className="lift">{song.score}</span><span className="stat"><GitBranch size={14}/>{song.remixes}</span><span className="plays">{song.plays}</span><span className="row-play">{active.title === song.title && playing ? <Pause size={15} fill="currentColor"/> : <Play size={15} fill="currentColor"/>}</span></button>)}</div></section>
      <section className="how"><div><p className="eyebrow">BUILT FOR CLEAR CREDIT</p><h2>One song. A living record of every contribution.</h2><p>Public branches preserve attribution and rights history. Commercial licensing stays separate from the open remix permission.</p></div><div className="steps"><span><b>01</b> Upload privately</span><span><b>02</b> Choose a genre &amp; publish</span><span><b>03</b> Grow the branch</span></div></section></>}
    </main>
    <footer className="player"><div className="now"><button className="player-art" onClick={() => setModal('fullscreen')}><img src={active.image}/><Maximize2 size={13}/></button><span><b>{active.title}</b><small>{active.artist}</small></span><button onClick={() => setSaved(!saved)} className={saved ? 'saved' : ''} title="Save for offline listening"><Download size={16}/></button></div><div className="controls"><button onClick={() => setPlaying(!playing)}>{playing ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}</button><div><i style={{width: playing ? '43%' : '0%'}}/></div><span>1:28 / {active.duration}</span></div><div className="player-actions"><button onClick={() => protectedAction('tree')}><GitBranch size={16}/> View tree</button><button onClick={() => protectedAction('branch')}><Plus size={17}/> Remix</button></div></footer>
    {draftNotice && <div className="draft-toast"><Check size={14}/> Draft saved on this device</div>}
    {modal !== 'none' && <ModalView type={modal} close={() => { setModal('none'); setSubmitted(false); setDraftNotice(true); window.setTimeout(() => setDraftNotice(false), 3000); }} switchDesktop={() => { setMode('desktop'); setModal('none'); }} song={active} submitted={submitted} setSubmitted={setSubmitted}/>} 
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
  if (collection) return <section className="library-page"><button className="back-library" onClick={() => setCollection(null)}><ArrowLeft size={15}/> Back to Your Library</button><p className="eyebrow">YOUR COLLECTION</p><h1>{collection}</h1><div className="collection-list">{songs.slice(0, 4).map(song => <button key={song.title} className="collection-song"><img src={song.image}/><span><b>{song.title}</b><small>{song.artist} · {song.genre}</small></span><Play size={15}/></button>)}</div></section>;
  return <section className="library-page"><p className="eyebrow">YOUR COLLECTION</p><h1>Your Library</h1><div className="collection-cards">{collections.map(item => <button className="collection-card" key={item.title} onClick={() => setCollection(item.title)}><img src={item.image}/><span><b>{item.title}</b><small>{item.sub}</small></span><ArrowUpRight size={16}/></button>)}</div></section>;
}
function SongCatalogue() {
  const [selected, setSelected] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  if (selected) return <section className="library-page"><button className="back-library" onClick={() => setSelected(false)}><ArrowLeft size={15}/> Back to Your Songs</button><p className="eyebrow">SONG MANAGEMENT</p><h1>Sunroom Sketches</h1><div className="song-manager"><img src={art[4]}/><div className="manager-copy"><b>{withdrawn ? 'Private / withdrawn' : 'Public broadcast'}</b><small>{withdrawn ? 'No longer broadcast, remixable, or seeded' : 'Afrobeats · 27 active seeders'}</small><div className="metrics"><span><Play size={13}/> 18.4K plays</span><span><Heart size={13}/> 862 likes</span><span><Download size={13}/> 401 downloads</span><span><Radio size={13}/> 27 seeders</span></div></div><button className="outline" onClick={() => setWithdrawn(!withdrawn)}>{withdrawn ? 'Restore broadcast' : 'Take down'}</button></div><div className="rights-panel"><p className="eyebrow">RIGHTS &amp; DISTRIBUTION</p><h2>Usage permissions</h2><p>License purchases pay to your wallet, less a 10% Songtree fee.</p><label><input type="radio" name="usage" defaultChecked/> Open source — free with attribution</label><label><input type="radio" name="usage"/> Paid streaming distribution</label><label><input type="radio" name="usage"/> Paid media — TV, radio, games and advertising</label><button className="primary">Save permissions <Check size={14}/></button></div></section>;
  return <section className="library-page"><p className="eyebrow">CREATOR CATALOGUE</p><h1>Your Songs</h1><div className="collection-list">{[{ title: 'Sunroom Sketches', status: 'Public · Afrobeats', image: art[4] }, { title: 'Midnight Draft', status: 'Private draft · EDM', image: art[1] }].map(song => <button className="collection-song" key={song.title} onClick={() => setSelected(true)}><img src={song.image}/><span><b>{song.title}</b><small>{song.status}</small></span><ArrowUpRight size={15}/></button>)}</div></section>;
}

function ContextLayout({ children, rail }: { children: React.ReactNode; rail: 'songs' | 'artists' }) { return <div className="context-layout">{children}<DiscoveryRail type={rail}/></div> }
function DiscoveryRail({ type }: { type: 'songs' | 'artists' }) { return <aside className="discovery-rail"><p className="eyebrow">KEEP EXPLORING</p><h3>{type === 'songs' ? 'Songs you might like' : 'Similar artists'}</h3>{(type === 'songs' ? songs.slice(2, 5) : [{name:'Kairo Bloom', image:art[1]}, {name:'Sora West', image:art[2]}, {name:'Ari Vale', image:art[4]}]).map((item: Song | { name: string; image: string }) => 'title' in item ? <button className="rail-song" key={item.title}><img src={item.image}/><span><b>{item.title}</b><small>{item.artist}</small></span><Play size={13}/></button> : <button className="rail-artist" key={item.name}><span className="rail-avatar"><img src={item.image}/><i><Play size={12} fill="currentColor"/></i></span><b>{item.name}</b><small>Play top songs</small></button>)}</aside> }
function FollowingPage() {
  const [artist, setArtist] = useState<{name:string; image:string} | null>(null);
  const people = [{name:'Maya Lune', image:art[0]}, {name:'Kairo Bloom', image:art[1]}, {name:'Sora West', image:art[2]}, {name:'NOVA / 7', image:art[3]}, {name:'Ari Vale', image:art[4]}];
  if (artist) return <ArtistProfile artist={artist} close={() => setArtist(null)}/>;
  return <section className="following-page"><p className="eyebrow">YOUR CIRCLE</p><h1>Following</h1><div className="artist-grid">{people.map(person => <button className="artist-card" key={person.name} onClick={() => setArtist(person)}><img src={person.image}/><span><b>{person.name}</b><small>@{person.name.toLowerCase().replace(/ /g, '')}</small></span><i className="artist-play"><Play size={18} fill="currentColor"/></i></button>)}</div></section>;
}
function ArtistProfile({ artist, close }: { artist: {name:string; image:string}; close: () => void }) { return <section className="artist-profile"><button className="back-library" onClick={close}><ArrowLeft size={15}/> Back to Following</button><div className="profile-top"><img src={artist.image}/><div><h1>{artist.name}</h1><p>@{artist.name.toLowerCase().replace(/ /g, '')} · Lagos, Nigeria</p><p className="profile-bio">Producer and songwriter making warm, rhythm-led songs for people who listen closely.</p><a href="https://instagram.com" target="_blank">instagram.com/{artist.name.toLowerCase().replace(/ /g, '')}</a><div><button className="outline">Message</button><button className="primary">Following <Check size={14}/></button></div></div></div><div className="profile-feed"><p className="eyebrow">TOP SONGS</p><h2>Most loved by the community</h2>{songs.slice(0,4).map((song, index) => <div className="feed-song" key={song.title}><span>0{index + 1}</span><img src={song.image}/><b>{song.title}</b><small>{song.plays} plays · {index + 4}K downloads · {index + 2}K saves</small><button><Play size={14} fill="currentColor"/></button></div>)}</div></section> }

function Auth({ authMode, setAuthMode, onSubmit }: { authMode: 'signin'|'signup'; setAuthMode: (v: 'signin'|'signup') => void; onSubmit: (e: FormEvent) => void }) {
  return <main className="auth-shell"><div className="auth-art"><div className="auth-brand"><span className="brand-mark"><GitBranch size={20}/></span> songtree</div><div><p className="eyebrow"><i/> OPEN COLLABORATION</p><h1>Make your<br/><em>mark in the music.</em></h1><p>Build a body of work that stays connected to every creator who helped it grow.</p></div><div className="auth-tree"><span>Original</span><i/><span>Remix</span><i/><span>Your branch</span></div></div><div className="auth-card"><button className="back" onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}><ArrowLeft size={16}/></button><div><p className="eyebrow">SONGTREE BETA</p><h2>{authMode === 'signin' ? 'Welcome back.' : 'Plant your first branch.'}</h2><p className="muted">{authMode === 'signin' ? 'Sign in to your creator workspace.' : 'Start with a simple creator account.'}</p></div><form onSubmit={onSubmit}>{authMode === 'signup' && <label>Creator name<input required placeholder="Your artist name"/></label>}<label>Email<input required type="email" placeholder="you@example.com"/></label><label>Password<input required type="password" minLength={8} placeholder="At least 8 characters"/></label>{authMode === 'signup' && <label className="check"><input type="checkbox" required/> <span>I agree to the beta terms and creator policy.</span></label>}<button className="primary submit" type="submit">{authMode === 'signin' ? 'Sign in' : 'Create account'} <ArrowUpRight size={15}/></button></form><p className="switcher">{authMode === 'signin' ? 'New to Songtree?' : 'Already have an account?'} <button onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}>{authMode === 'signin' ? 'Create one' : 'Sign in'}</button></p><small className="beta-note"><LockKeyhole size={12}/> Beta access uses email and password. Wallets use test tokens only.</small></div></main>;
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
    { id: 's3', text: 'No rush at all — curious which direction you hear for the bridge.', sender: 'them', time: 'Yesterday' },
  ] },
  { id: 'ari', name: 'Ari Vale', handle: '@arivale', image: art[4], online: true, lastSeen: 'Active now', unread: 0, updatedAt: 1, messages: [
    { id: 'a1', text: 'That late-night playlist you shared is such a mood.', sender: 'them', time: 'Monday' },
    { id: 'a2', text: 'Right? I have been collecting slow-burn tracks for weeks.', sender: 'me', time: 'Monday' },
  ] },
  { id: 'maya', name: 'Maya Lune', handle: '@mayalune', image: art[0], online: false, lastSeen: 'Active 2h ago', unread: 0, updatedAt: 0, messages: [
    { id: 'm1', text: 'Thanks for listening to the new mix. Your notes really helped.', sender: 'them', time: 'Sunday' },
    { id: 'm2', text: 'Anytime — the new low end feels huge.', sender: 'me', time: 'Sunday' },
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
      })}{visible.length === 0 && <p className="chat-empty-list">{filter === 'unread' ? 'You’re all caught up.' : 'No conversations found.'}</p>}</div>
      <div className="chat-demo-note"><span/> Demo inbox · saved on this device</div>
    </aside>
    <div className="chat-main">
      <button className="chat-close" onClick={close} aria-label="Close messages"><X size={18}/></button>
      {composing ? <div className="chat-new-panel"><div className="chat-new-icon"><MessageCircle size={22}/></div><p className="eyebrow">START SOMETHING</p><h3>New message</h3><p>Choose a creator to start a conversation.</p><div className="chat-contact-list">{[{id:'kairo',name:'Kairo Bloom',handle:'@kairobloom',image:art[1]},{id:'sora',name:'Sora West',handle:'@sorawest',image:art[2]},{id:'ari',name:'Ari Vale',handle:'@arivale',image:art[4]},{id:'maya',name:'Maya Lune',handle:'@mayalune',image:art[0]},{id:'nova',name:'NOVA / 7',handle:'@nova7',image:art[3]}].map(person => <button key={person.id} onClick={() => startConversation(person)}><img src={person.image} alt=""/><span><b>{person.name}</b><small>{person.handle}</small></span><ArrowUpRight size={15}/></button>)}</div></div> : active ? <>
        <div className="chat-thread-head"><button className="chat-mobile-back" onClick={() => setMobileShowList(true)} aria-label="Back to conversations"><ArrowLeft size={17}/></button><img src={active.image} alt=""/><span><b>{active.name}</b><small><i className={active.online ? 'online' : ''}/>{active.lastSeen}</small></span><button title="Conversation details"><MoreHorizontal size={19}/></button></div>
        <div className="chat-thread-body"><div className="chat-day">Today</div>{active.messages.map(message => <div key={message.id} className={`chat-message-row ${message.sender === 'me' ? 'mine' : ''}`}>{message.sender === 'them' && <img src={active.image} alt=""/>}<div className="chat-message-content"><div className="chat-bubble">{message.text}</div><small>{message.time}{message.sender === 'me' && <Check size={12}/>}</small></div></div>)}<div ref={endRef}/></div>
        <form className="chat-composer" onSubmit={sendMessage}><input value={draft} onChange={event => setDraft(event.target.value)} placeholder={`Message ${active.name}…`} aria-label="Write a message"/><button type="submit" disabled={!draft.trim()} aria-label="Send message"><Send size={16}/></button><small>Press Enter to send</small></form>
      </> : <div className="chat-new-panel"><p className="eyebrow">YOUR INBOX</p><h3>Your conversations live here.</h3><button className="primary" onClick={() => { setComposing(true); setMobileShowList(false); }}>Start a conversation <Plus size={15}/></button></div>}
    </div>
  </section></Overlay>;
}

function ModalView({ type, close, switchDesktop, song, submitted, setSubmitted }: { type: Modal; close: () => void; switchDesktop: () => void; song: Song; submitted: boolean; setSubmitted: (v: boolean) => void }) {
  const [songKind, setSongKind] = useState('Beat');
  if (type === 'chat') return <ChatInbox close={close} />;
  if (type === 'fullscreen') return <Overlay close={close}><div className="full-player"><button className="close" onClick={close}><X/></button><img src={song.image}/><p className="eyebrow">NOW PLAYING</p><h1>{song.title}</h1><p>{song.artist}</p><div className="full-progress"><i/></div><div className="full-controls"><button><Heart size={17}/></button><button className="full-play"><Pause size={19} fill="currentColor"/></button><button><Download size={17}/></button></div><small>Save downloads this song for offline listening and seeds it from your device.</small></div></Overlay>;
  if (type === 'desktop') return <Overlay close={close}><div className="dialog download-dialog"><button className="close" onClick={close}><X/></button><div className="modal-icon"><Download/></div><p className="eyebrow">CREATOR TOOLS LIVE ON DESKTOP</p><h2>Ready to make something new?</h2><p>Uploading songs, adding branches, wallet features and file sharing are available in the Songtree desktop app.</p><button className="primary" onClick={switchDesktop}>Preview desktop workspace <ArrowUpRight size={15}/></button><button className="link-button">Download Songtree for desktop</button></div></Overlay>;
  if (type === 'wallet') return <Overlay close={close}><div className="dialog wallet-dialog"><button className="close" onClick={close}><X/></button><p className="eyebrow">BETA WALLET · TEST TOKENS</p><h2>Your creator wallet</h2><div className="balance"><small>Songtree test balance</small><b>2,450 <span>STREE</span></b><em>≈ $0.00 · simulation only</em></div><div className="address"><small>Your receiving address</small><code>0x7A81...9cE4</code><button>Copy</button></div><div className="wallet-note"><ShieldCheck size={18}/><span>Real keys and transactions are not enabled in beta. This preview shows how tips, licenses and storage payments will work.</span></div><button className="primary wide" onClick={close}>Done <Check size={15}/></button></div></Overlay>;
  if (type === 'tree') return <Overlay close={close}><div className="dialog tree-dialog"><button className="close" onClick={close}><X/></button><p className="eyebrow">PERSISTENT CREATIVE HISTORY</p><h2>{song.title} tree</h2><Tree song={song}/><div className="tree-footer"><span>Every branch keeps its creator and source link.</span><button className="primary" onClick={close}>Explore branches</button></div></div></Overlay>;
  return <Overlay close={close}><div className="dialog upload-dialog"><button className="close" onClick={close}><X/></button>{submitted ? <div className="success"><div className="modal-icon"><GitBranch/></div><h2>{type === 'upload' ? 'Your Songtree is live.' : 'Your branch is planted.'}</h2><p>{type === 'upload' ? 'Your MP3 is published publicly and ready for the community to hear, save and build on.' : 'It is saved as a private draft until you publish and accept the public remix terms.'}</p><button className="primary" onClick={close}>Back to workspace <ArrowUpRight size={15}/></button></div> : type === 'upload' ? <SongtreeComposer songKind={songKind} setSongKind={setSongKind} submit={() => setSubmitted(true)} /> : <><p className="eyebrow">BUILDING ON {song.title.toUpperCase()}</p><h2>Add your contribution</h2><div className="upload-zone"><Upload size={22}/><b>Drop audio here</b><span>WAV, MP3, AIFF · up to 100MB</span></div><label>Track title<input placeholder={song.title + ' / your idea'}/></label><label>Genre<select defaultValue=""><option value="" disabled>Select a music genre</option>{genres.slice(1).map(g => <option key={g}>{g}</option>)}</select></label><label className="check"><input type="checkbox" required/> <span>I own or have permission to share this audio and understand it starts private.</span></label><button className="primary wide" onClick={() => setSubmitted(true)}>Plant this branch <ArrowUpRight size={15}/></button></>}</div></Overlay>;
}
function SongtreeComposer({ songKind, setSongKind, submit }: { songKind: string; setSongKind: (value: string) => void; submit: () => void }) {
  const [step, setStep] = useState(1);
  const [isRemix, setIsRemix] = useState(false);
  return <><div className="composer-progress"><span className={step >= 1 ? 'done' : ''}>1 Basics</span><span className={step >= 2 ? 'done' : ''}>2 Credits</span><span className={step >= 3 ? 'done' : ''}>3 Publish</span></div><h2>Start a songtree</h2><p className="composer-subtext">Add your song</p>{step === 1 && <><div className="kind-picker">{['Beat', 'Vocals', 'Beat + Vocals'].map(kind => <button key={kind} className={songKind === kind ? 'selected' : ''} onClick={() => setSongKind(kind)}>{songKind === kind && <Check size={13}/>} {kind}</button>)}</div><div className="upload-zone main-audio"><Music2 size={22}/><b>Upload broadcast audio</b><span>MP3 only · This is the version the community can play.</span></div><label>Song title<input placeholder="Name your song"/></label><label>Genre<select defaultValue=""><option value="" disabled>Select a music genre</option>{genres.slice(1).map(g => <option key={g}>{g}</option>)}</select></label><label className="check"><input type="checkbox" checked={isRemix} onChange={e => setIsRemix(e.target.checked)}/><span>This is a remix of an existing Songtree</span></label>{isRemix && <label>Link to the Songtree you are remixing<input placeholder="Paste Songtree link"/></label>}<button className="primary wide" onClick={() => setStep(2)}>Next: credits <ArrowUpRight size={15}/></button></>}{step === 2 && <><div className="cover-upload"><ImagePlus size={18}/><span><b>Upload song cover image</b><small>JPG or PNG · square artwork works best</small></span></div><p className="field-caption"><Users size={14}/> Credits and collaborators</p><p className="credit-help">Add each artist by name, @Songtree account, or profile link, then choose their contribution.</p><CreditRow placeholder="Your artist name or @account" defaultRole="Lead artist"/><CreditRow placeholder="Add a collaborator"/><CreditRow placeholder="Add another collaborator"/><button className="add-credit"><Plus size={14}/> Add another credit</button><button className="primary wide" onClick={() => setStep(3)}>Next: review <ArrowUpRight size={15}/></button></>}{step === 3 && <><div className="attachment-zone"><Plus size={16}/><span><b>Upload more files</b><small>Stems, vocals, WAV · attached beneath your song</small></span></div><p className="storage-note"><ShieldCheck size={14}/><span>Files are stored and seeded by you unless you are on a paid storage plan.</span></p><label className="check"><input type="checkbox" required/> <span>I own or have permission to share this audio and accept the public remix license. Publishing is public by default.</span></label><div className="publish-actions"><button className="outline" onClick={() => setStep(1)}>Save draft</button><button className="primary" onClick={submit}>Publish <ArrowUpRight size={15}/></button></div><p className="draft-note">Closing this window also saves a draft on this device.</p></>}</>;
}
function CreditRow({ placeholder, defaultRole = '' }: { placeholder: string; defaultRole?: string }) { return <div className="credit-row"><input placeholder={placeholder}/><select defaultValue={defaultRole}><option value="" disabled>Choose role</option>{['Lead artist', 'Featured artist', 'Vocals', 'Writer', 'Producer', 'Mixing', 'Mastering', 'Drums', 'Guitar', 'Keys', 'Bass', 'Cover art', 'Other'].map(role => <option key={role}>{role}</option>)}</select></div> }
function Overlay({ children, close }: { children: React.ReactNode; close: () => void }) { return <div className="overlay" onMouseDown={close}><div onMouseDown={e => e.stopPropagation()}>{children}</div></div>; }
function Tree({ song }: { song: Song }) { return <div className="tree"><div className="tree-card root"><img src={song.image}/><span><b>{song.title}</b><small>Original · {song.artist}</small></span></div><div className="tree-line"><i/></div><div className="tree-children"><div className="tree-card"><img src={art[2]}/><span><b>Night Drive / Open Water</b><small>Vocal layer · Ari Vale</small></span></div><div className="tree-card"><img src={art[1]}/><span><b>{song.title} (Unplugged)</b><small>New arrangement · Kairo Bloom</small></span></div></div></div>}
