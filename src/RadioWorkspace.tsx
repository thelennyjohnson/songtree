import { useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowRight, Check, ChevronDown, Clapperboard, Code2,
  Copy, Gamepad2, Globe2, Music2, Search, ShoppingCart, Sparkles, Ticket, Trash2, Waves, X,
} from 'lucide-react';

type RadioSong = { title: string; artist: string; genre: string; plays: string; remixes: number; duration: string; image: string; score: string };
type CartItem = { id: string; label: string; artist?: string; image?: string; price: number };
type RadioWorkspaceProps = { onPlay: (song: RadioSong, isPlaying: boolean) => void };
type SourceMode = 'top50' | 'category' | 'song';
type ServiceMode = 'free' | 'paid';

const demoSongs: RadioSong[] = [
  { title: 'Soft Signal', artist: 'Maya Lune', genre: 'Afrobeats', plays: '2.4M', remixes: 18, duration: '3:42', image: 'https://images.pexels.com/photos/33418887/pexels-photo-33418887.jpeg?auto=compress&cs=tinysrgb&w=900', score: '+12%' },
  { title: 'Breathe In', artist: 'Kairo Bloom', genre: 'EDM', plays: '1.8M', remixes: 12, duration: '4:08', image: 'https://images.pexels.com/photos/10269844/pexels-photo-10269844.jpeg?auto=compress&cs=tinysrgb&w=900', score: '+8%' },
  { title: 'Glass Garden', artist: 'Sora West', genre: 'R&B', plays: '1.2M', remixes: 9, duration: '3:18', image: 'https://images.pexels.com/photos/16251531/pexels-photo-16251531.jpeg?auto=compress&cs=tinysrgb&w=900', score: '+5%' },
  { title: 'Afterimage', artist: 'NOVA / 7', genre: 'Hip-hop', plays: '984K', remixes: 24, duration: '2:56', image: 'https://images.pexels.com/photos/16015747/pexels-photo-16015747.jpeg?auto=compress&cs=tinysrgb&w=900', score: '+21%' },
  { title: 'Late Checkout', artist: 'Ari Vale', genre: 'House', plays: '721K', remixes: 7, duration: '3:27', image: 'https://images.pexels.com/photos/13768643/pexels-photo-13768643.jpeg?auto=compress&cs=tinysrgb&w=900', score: '+4%' },
  { title: 'Palmwine Dreams', artist: 'Reema', genre: 'Afrobeats', plays: '698K', remixes: 11, duration: '3:08', image: 'https://images.pexels.com/photos/10269844/pexels-photo-10269844.jpeg?auto=compress&cs=tinysrgb&w=900', score: '+10%' },
  { title: 'Blue Window', artist: 'Dana June', genre: 'Pop', plays: '642K', remixes: 8, duration: '3:34', image: 'https://images.pexels.com/photos/33418887/pexels-photo-33418887.jpeg?auto=compress&cs=tinysrgb&w=900', score: '+7%' },
  { title: 'Static Bloom', artist: 'The Quiet Rooms', genre: 'Rock', plays: '591K', remixes: 14, duration: '3:51', image: 'https://images.pexels.com/photos/16015747/pexels-photo-16015747.jpeg?auto=compress&cs=tinysrgb&w=900', score: '+6%' },
  { title: 'Velvet Run', artist: 'Jae Niko', genre: 'Amapiano', plays: '523K', remixes: 16, duration: '4:02', image: 'https://images.pexels.com/photos/10269844/pexels-photo-10269844.jpeg?auto=compress&cs=tinysrgb&w=900', score: '+11%' },
  { title: 'Morning Lines', artist: 'Eliya Moss', genre: 'Jazz', plays: '417K', remixes: 5, duration: '3:46', image: 'https://images.pexels.com/photos/16251531/pexels-photo-16251531.jpeg?auto=compress&cs=tinysrgb&w=900', score: '+3%' },
  { title: 'Open Hands', artist: 'Naomi Grey', genre: 'Gospel', plays: '386K', remixes: 6, duration: '4:11', image: 'https://images.pexels.com/photos/33418887/pexels-photo-33418887.jpeg?auto=compress&cs=tinysrgb&w=900', score: '+9%' },
  { title: 'Island Weather', artist: 'Kali Rose', genre: 'Reggae', plays: '342K', remixes: 10, duration: '3:29', image: 'https://images.pexels.com/photos/13768643/pexels-photo-13768643.jpeg?auto=compress&cs=tinysrgb&w=900', score: '+5%' },
  { title: 'Soft Focus', artist: 'June & Gold', genre: 'Soul', plays: '298K', remixes: 4, duration: '3:17', image: 'https://images.pexels.com/photos/16251531/pexels-photo-16251531.jpeg?auto=compress&cs=tinysrgb&w=900', score: '+4%' },
];
const genres = ['Afrobeats', 'Hip-hop', 'EDM', 'Pop', 'Rock', 'R&B', 'Amapiano', 'Jazz', 'Gospel', 'Reggae', 'House', 'Soul'];
const surfaces = [
  { id: 'App', icon: Sparkles, description: 'Mobile or desktop app' },
  { id: 'Website', icon: Globe2, description: 'A site or web player' },
  { id: 'Game', icon: Gamepad2, description: 'In-game radio & worlds' },
  { id: 'Radio', icon: Waves, description: 'Broadcast or online station' },
  { id: 'Film', icon: Clapperboard, description: 'Film or video project' },
  { id: 'Event', icon: Ticket, description: 'Live & community events' },
];

function PricingPanel({ surface, source, selectedSong, onLicense }: { surface: string; source: SourceMode; selectedSong: RadioSong; onLicense: (label: string, price: string) => void }) {
  const [radioTerm, setRadioTerm] = useState<'monthly' | 'yearly'>('monthly');
  const [appRoute, setAppRoute] = useState<'api' | 'single'>('api');
  const isDigital = surface === 'App' || surface === 'Website' || surface === 'Game';
  const selectedLabel = source === 'song' ? selectedSong.title : source === 'category' ? 'this category' : 'the Top 50';
  const purchaseLabel = source === 'song' ? selectedSong.title : 'a Songtree Radio track';
  return <aside className="radio-side-column">
    <section className="radio-panel transparent-pricing">
      <p className="eyebrow">03 · TRANSPARENT PRICING</p><h2>{surface} use</h2><p className="radio-panel-subtitle">Only tracks approved for Songtree Radio placement can be used commercially. Every commercial license is recorded with its rights and contributor splits.</p>
      {isDigital && <><div className="pricing-switch"><button className={appRoute === 'api' ? 'selected' : ''} onClick={() => setAppRoute('api')}>Radio API</button><button className={appRoute === 'single' ? 'selected' : ''} onClick={() => setAppRoute('single')}>License songs</button></div>{appRoute === 'api' ? <div className="price-card featured"><span>RADIO API</span><b>Free, then $0.001 <small>/ verified play</small></b><p>First 2,000 verified plays each month are free for development.</p><ul><li>For apps, websites and games</li><li>Use {selectedLabel} as configurable radio</li><li>Usage reporting and artist payouts</li></ul><button className="primary wide">Get API access <ArrowRight size={14}/></button></div> : <div className="price-card"><span>SINGLE SONG LICENSE</span><b>$49.99 <small>per song</small></b><p>One-time commercial placement license for a selected Radio-approved song.</p><ul><li>Use in one app, game or website</li><li>No API integration required</li><li>License certificate included</li></ul><button className="primary wide" onClick={() => onLicense(purchaseLabel, '$49.99')}>License {source === 'song' ? selectedSong.title : 'a song'} <ArrowRight size={14}/></button></div>}</>}
      {surface === 'Radio' && <><div className="pricing-switch"><button className={radioTerm === 'monthly' ? 'selected' : ''} onClick={() => setRadioTerm('monthly')}>Monthly</button><button className={radioTerm === 'yearly' ? 'selected' : ''} onClick={() => setRadioTerm('yearly')}>Yearly</button></div><div className="price-card featured"><span>RADIO STATION LICENSE</span><b>${radioTerm === 'monthly' ? '49.99' : '499.00'} <small>{radioTerm === 'monthly' ? '/ month' : '/ year'}</small></b><p>Unlimited selected pre-cleared Radio tracks for your station.</p><ul><li>Broadcast or online radio station</li><li>Monthly playlist reporting</li><li>Commercial Radio catalog only</li></ul><button className="primary wide" onClick={() => onLicense('Songtree Radio station license', radioTerm === 'monthly' ? '$49.99 / month' : '$499 / year')}>Choose {radioTerm} plan <ArrowRight size={14}/></button></div></>}
      {surface === 'Film' && <div className="price-card featured"><span>TV / MOVIE PLACEMENT</span><b>$49.99 <small>per song · one time</small></b><p>Pre-cleared commercial placement for a Radio-approved song.</p><ul><li>One production and one selected song</li><li>Sync and master-use approval record</li><li>License certificate and cue-sheet details</li></ul><button className="primary wide" onClick={() => onLicense(purchaseLabel, '$49.99')}>License a song <ArrowRight size={14}/></button></div>}
      {surface === 'Event' && <div className="event-price-grid"><div className="price-card"><span>SMALL EVENT</span><b>$14.99</b><p>1–500 paid attendees</p></div><div className="price-card"><span>MEDIUM EVENT</span><b>$99.99</b><p>501–10,000 paid attendees</p></div><div className="price-card"><span>LARGE EVENT</span><b>$299</b><p>10,001+ paid attendees</p></div><p className="event-price-note">Each pass covers one paid event and unlimited selected pre-cleared Radio tracks.</p><button className="primary wide" onClick={() => onLicense('Songtree paid event license', 'Choose event tier')}>Choose event license <ArrowRight size={14}/></button></div>}
      <p className="radio-terms-note"><Check size={14}/> Songtree keeps 10%; the remaining license revenue follows the approved contributor splits.</p>
    </section>
    <section className="radio-artist-card"><span className="artist-card-icon"><Music2 size={16}/></span><p className="eyebrow">CLEAR PRICING, CLEAR CREDIT</p><h3>Pre-cleared music.<br/><em>Fair creator payouts.</em></h3><p>Commercial users see the price before they license. Every Radio track carries clear rights, contribution credits and an auditable payment split.</p><div className="artist-card-rule"><span/><small>LICENSED USE → CREATOR PAYOUT</small></div><small className="artist-rate-note">Commercial availability is opt-in and limited to the Songtree Radio placement catalog.</small></section>
  </aside>;
}

export default function RadioWorkspace({ onPlay }: RadioWorkspaceProps) {
  const [source, setSource] = useState<SourceMode>('top50');
  const [service, setService] = useState<ServiceMode>('free');
  const [surface, setSurface] = useState('Game');
  const [genre, setGenre] = useState('Afrobeats');
  const [songTitle, setSongTitle] = useState(demoSongs[0].title);
  const [threshold] = useState(2000);
  const [monthlyStreams, setMonthlyStreams] = useState(8420);
  const [eventAttendance, setEventAttendance] = useState(350);
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [songSearch, setSongSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const availableSongs = useMemo(
    () => (source === 'category' ? demoSongs.filter(song => song.genre === genre) : demoSongs).filter(song => `${song.title} ${song.artist} ${song.genre}`.toLowerCase().includes(songSearch.toLowerCase())),
    [source, genre, songSearch],
  );
  const selectedSong = source === 'category'
    ? availableSongs[0] ?? demoSongs[0]
    : demoSongs.find(song => song.title === songTitle) ?? demoSongs[0];
  const billableStreams = service === 'paid' ? Math.max(0, monthlyStreams - threshold) : 0;
  const apiEstimate = billableStreams * 0.001;
  const eventTier = eventAttendance <= 500 ? { label: 'Small event', price: 14.99, range: '1–500 guests' } : eventAttendance <= 10000 ? { label: 'Medium event', price: 99.99, range: '501–10,000 guests' } : { label: 'Large event', price: 299, range: '10,001+ guests' };
  const sourceLabel = source === 'top50' ? 'Top 50' : source === 'category' ? genre : selectedSong.title;
  const musicChoice = source === 'top50' ? 'the Top 50 chart' : source === 'category' ? `the ${genre} category` : `the song ${selectedSong.title} by ${selectedSong.artist}`;
  const accessRule = service === 'free'
    ? 'This is a free service: it must never be charged for music streams.'
    : `This is a paid service: include ${threshold.toLocaleString()} verified plays each month, then charge $0.001 per verified play over the allowance. For a paid event, use one event license tier based on estimated paid attendance; selected Radio tracks are unlimited for that event.`;
  const aiPrompt = `Help me integrate Songtree Radio into my ${surface.toLowerCase()}.\n\nLet listeners hear ${musicChoice}. Keep the music selection configurable in the product.\n\nBusiness rule: ${accessRule}\n\nArtist-payment principle: earnings follow the music people actually listen to; pay the artists whose tracks were played, not everyone from a shared royalty pot.\n\nUse only official Songtree Radio SDK/API documentation and endpoints. This is currently a UI demo with no live SDK or API details, so do not invent endpoints, credentials, prices, or claims that playback/billing works. If official integration details are missing, leave clearly marked TODO placeholders. Include loading/error states and attribution/rights notes.`;
  const snippet = `// Illustrative only — not a live Songtree SDK\nconst radio = songtreeRadio.preview({\n  source: '${source}',\n  ${source === 'category' ? `category: '${genre}',` : source === 'song' ? `track: '${selectedSong.title}',` : "chart: 'top-50',"}\n  surface: '${surface.toLowerCase()}',\n  service: '${service}',\n  includedStreams: ${service === 'paid' ? threshold : 0}\n});`;

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt);
      setPromptCopied(true);
      window.setTimeout(() => setPromptCopied(false), 1800);
    } catch {
      setPromptCopied(false);
    }
  };

  const startPreview = () => {
    const nextPlaying = !playing;
    setPlaying(nextPlaying);
    onPlay(selectedSong, nextPlaying);
  };

  const addCartItem = (label: string, price: string, song = selectedSong) => {
    const numericPrice = Number.parseFloat(price.replace(/[^\d.]/g, ''));
    const item: CartItem = { id: song.title, label, artist: song.artist, image: song.image, price: Number.isFinite(numericPrice) ? numericPrice : 49.99 };
    setCart(items => items.some(existing => existing.id === item.id) ? items : [...items, item]);
  };
  const addSelectedSong = () => addCartItem(selectedSong.title, '$49.99');
  const removeCartItem = (id: string) => setCart(items => items.filter(item => item.id !== id));
  const cartTotal = cart.reduce((total, item) => total + item.price, 0);
  const showPricingPanel = surface.length > 0;

  return <section className="radio-workspace">
    <div className="radio-intro">
      <div className="radio-intro-copy">
        <p className="eyebrow"><i/> SONGTREE RADIO · DEVELOPER PREVIEW</p>
        <h1>Free music for<br/><em>the things you make.</em></h1>
        <p>Bring pre-cleared, artist-made music to your app, website, game or paid event. Pick the Top 50, a category, or a song. Your service decides what plays.</p>
        <div className="radio-intro-points"><span><Check size={14}/> Free services stay free</span><span><Check size={14}/> Clear commercial pricing</span></div>
      </div>
      <div className="radio-intro-actions"><button className="radio-cart-button" onClick={() => setCheckoutOpen(true)} disabled={!cart.length}><ShoppingCart size={16}/><span>License cart</span><b>{cart.length}</b><strong>${cartTotal.toFixed(2)}</strong></button><div className="radio-hero-mark"><div className="radio-wave"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div><span>SONGTREE<br/><b>RADIO</b></span><small>Music moves with you.</small></div></div>
    </div>

    <div className="radio-layout">
      <div className="radio-main-column">
        <section className="radio-panel source-panel">
          <div className="radio-panel-heading"><div><p className="eyebrow">01 · PICK YOUR SOUND</p><h2>What should play?</h2></div><span className="demo-badge"><i/> LIVE DEMO</span></div>
          <div className="radio-source-tabs" role="tablist" aria-label="Music source">
            <button className={source === 'top50' ? 'selected' : ''} onClick={() => setSource('top50')}><Waves size={15}/> Top 50</button>
            <button className={source === 'category' ? 'selected' : ''} onClick={() => setSource('category')}><Sparkles size={15}/> Category</button>
            <button className={source === 'song' ? 'selected' : ''} onClick={() => setSource('song')}><Music2 size={15}/> Choose a song</button>
          </div>
          <label className="radio-search"><Search size={14}/><input value={songSearch} onChange={event => setSongSearch(event.target.value)} placeholder="Search songs, artists or genres"/><kbd>/</kbd></label>
          {source === 'category' && <div className="radio-genre-pills">{genres.map(item => <button key={item} className={genre === item ? 'active' : ''} onClick={() => setGenre(item)}>{item}</button>)}</div>}
          {source === 'song' && <label className="radio-select-label">Choose a track<select value={songTitle} onChange={event => setSongTitle(event.target.value)}>{demoSongs.map(song => <option key={song.title} value={song.title}>{song.title} — {song.artist}</option>)}</select><ChevronDown size={15}/></label>}
          <div className="radio-selection-summary"><div className="radio-cover-stack">{(source === 'top50' ? demoSongs.slice(0, 3) : [selectedSong]).map((song, index) => <img key={song.title} style={{ zIndex: 3 - index }} src={song.image} alt=""/>)}</div><div className="radio-summary-copy"><b>{sourceLabel} Radio</b><small>{source === 'top50' ? 'Top 50 community chart · 50 tracks' : source === 'category' ? `Curated ${genre} picks` : `${selectedSong.artist} · ${selectedSong.duration}`}</small></div><button className="radio-preview-button" onClick={startPreview}>{playing ? 'Playing' : 'Preview'} <span>{playing ? 'Ⅱ' : '▶'}</span></button><button className={`radio-add-button ${cart.some(item => item.id === selectedSong.title) ? 'added' : ''}`} onClick={addSelectedSong} disabled={cart.some(item => item.id === selectedSong.title)}><ShoppingCart size={13}/>{cart.some(item => item.id === selectedSong.title) ? 'In cart' : 'Add to cart'}</button></div>
          {(source === 'top50' || source === 'category') && <div className="radio-track-list">{availableSongs.slice(0, 6).map((song, index) => <button key={song.title} className={`radio-track ${selectedSong.title === song.title && playing ? 'is-playing' : ''}`} onClick={() => { setSource('song'); setSongTitle(song.title); setPlaying(true); onPlay(song, true); }}><span className="radio-track-rank">{String(index + 1).padStart(2, '0')}</span><img src={song.image} alt=""/><span className="radio-track-name"><b>{song.title}</b><small>{song.artist} · {song.genre}</small></span><span className="radio-track-plays">{song.plays}</span><ArrowRight size={14}/></button>)}</div>}
          <p className="radio-data-note">Sample catalogue for this preview; radio playback and catalogue data are not connected yet.</p>
        </section>

        <section className="radio-panel integration-panel">
          <div className="radio-panel-heading"><div><p className="eyebrow">02 · YOUR PRODUCT</p><h2>Where will it play?</h2></div><Code2 size={19}/></div>
          <div className="radio-surface-grid">{surfaces.map(({ id, icon: Icon, description }) => <button key={id} className={surface === id ? 'chosen' : ''} onClick={() => { setSurface(id); if (id === 'Event') setService('paid'); }}><Icon size={18}/><b>{id}</b><small>{description}</small></button>)}</div>
          <div className="radio-dev-views">
            <article className="radio-dev-card">
              <div className="radio-dev-card-heading"><div><p className="eyebrow">AI CODING PROMPT</p><h3>Build with your AI assistant</h3></div><button onClick={copyPrompt}><Copy size={12}/>{promptCopied ? 'Copied' : 'Copy prompt'}</button></div>
              <pre className="radio-prompt-preview"><code>{aiPrompt}</code></pre>
            </article>
            <article className="radio-dev-card">
              <div className="radio-dev-card-heading"><div><p className="eyebrow">MANUAL CODE</p><h3>Use this as a starting point</h3></div><button onClick={copySnippet}><Copy size={12}/>{copied ? 'Copied' : 'Copy code'}</button></div>
              <pre className="radio-code"><code>{snippet}</code></pre>
            </article>
          </div>
          <p className="radio-data-note">Both examples reflect your selected product and music source. No working SDK or endpoint is included in this demo.</p>
        </section>
      </div>

      {showPricingPanel ? <PricingPanel surface={surface} source={source} selectedSong={selectedSong} onLicense={addCartItem} /> : <aside className="radio-side-column">
        <section className="radio-panel access-panel">
          <p className="eyebrow">03 · YOUR SERVICE</p><h2>Is your service paid?</h2><p className="radio-panel-subtitle">The demo changes the example charges based on your answer.</p>
          <div className="radio-service-options">
            <button className={service === 'free' ? 'selected' : ''} onClick={() => setService('free')}><span className="radio-option-mark">{service === 'free' && <Check size={12}/>}</span><span><b>Free service</b><small>No charge. No artist-payment bill.</small></span><strong>FREE</strong></button>
            <button className={service === 'paid' ? 'selected' : ''} onClick={() => setService('paid')}><span className="radio-option-mark">{service === 'paid' && <Check size={12}/>}</span><span><b>Paid service</b><small>Pay per session only after the included streams.</small></span><strong>PAYG</strong></button>
          </div>
          {surface === 'Event' && service === 'paid' ? <div className="event-license-demo"><label className="stream-range-label">Estimated paid attendance <b>{eventAttendance.toLocaleString()} people</b><input type="range" min="1" max="20000" step="50" value={eventAttendance} onChange={event => setEventAttendance(Number(event.target.value))}/></label><div className="event-tiers"><span className={eventTier.label === 'Small event' ? 'selected' : ''}>Small<small>1–500 · $14.99</small></span><span className={eventTier.label === 'Medium event' ? 'selected' : ''}>Medium<small>501–10K · $99.99</small></span><span className={eventTier.label === 'Large event' ? 'selected' : ''}>Large<small>10K+ · $299</small></span></div><div className="radio-estimate"><span>{eventTier.label} · {eventTier.range}</span><b>${eventTier.price.toFixed(2)}</b><small>One paid event, unlimited selected pre-cleared Radio tracks. Songtree keeps 10%; cleared rights holders share the remainder.</small></div></div> : service === 'paid' ? <div className="threshold-demo">
            <div className="threshold-title"><span>Monthly development allowance</span><b>2,000 verified plays</b></div>
            <label className="stream-range-label">Demo stream volume <b>{monthlyStreams.toLocaleString()}</b><input type="range" min="0" max="25000" step="100" value={monthlyStreams} onChange={event => setMonthlyStreams(Number(event.target.value))}/></label>
            <div className="threshold-progress"><i style={{ width: `${Math.min(100, monthlyStreams / threshold * 100)}%` }}/></div>
            <div className="threshold-foot"><span>{Math.min(monthlyStreams, threshold).toLocaleString()} included</span><span>{billableStreams.toLocaleString()} over limit</span></div>
            <div className="radio-estimate"><span>Estimated API charge</span><b>${apiEstimate.toFixed(2)}</b><small>{billableStreams.toLocaleString()} paid verified plays × $0.001. First 2,000 verified plays/month are free for development.</small></div>
          </div> : <div className="free-service-note"><div><Check size={16}/></div><span><b>Your radio stays free.</b><small>Free services never pay, even when listeners tune in.</small></span></div>}
          <p className="radio-terms-note"><ArrowDownRight size={14}/> Thresholds and billing here are examples only. No usage is counted and no payment is taken.</p>
        </section>

        <section className="radio-artist-card"><span className="artist-card-icon"><Music2 size={16}/></span><p className="eyebrow">A DIFFERENT WAY TO PAY</p><h3>Music people hear.<br/><em>Artists people pay.</em></h3><p>You get paid for what you make that people listen to. Businesses pay for the music their audiences actually hear—at a Spotify-equivalent stream rate—not into a pot shared by everyone.</p><div className="artist-card-rule"><span/><small>LISTENED TO → PAID TO THE ARTIST</small></div><small className="artist-rate-note">Demo concept. Spotify does not publish one fixed per-stream rate; final rates and rights rules need to be agreed before launch.</small></section>
      </aside>}
    </div>
    {checkoutOpen && <LicenseCheckout cart={cart} total={cartTotal} removeItem={removeCartItem} close={() => setCheckoutOpen(false)} />}
  </section>;
}

function LicenseCheckout({ cart, total, removeItem, close }: { cart: CartItem[]; total: number; removeItem: (id: string) => void; close: () => void }) {
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const recipient = '0x3a1e9e54f4d708e3acbdb2cfaa3ec94f34b9b02e';
  const copyAddress = async () => { try { await navigator.clipboard.writeText(recipient); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); } };
  return <div className="license-overlay" onMouseDown={close}><section className="license-checkout cart-checkout" onMouseDown={event => event.stopPropagation()}><button className="license-close" onClick={close}><X size={18}/></button><span className="checkout-icon"><ShoppingCart size={19}/></span><p className="eyebrow">SONGTREE LICENSE CART</p><h2>License everything together</h2><div className="checkout-items">{cart.map(item => <div className="checkout-item" key={item.id}>{item.image && <img src={item.image} alt=""/>}<span><b>{item.label}</b><small>{item.artist ?? 'Songtree Radio license'}</small></span><strong>${item.price.toFixed(2)}</strong><button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.label}`}><Trash2 size={14}/></button></div>)}</div><div className="checkout-total"><span>Total license cost</span><b>${total.toFixed(2)} <small>USD</small></b></div><label>Email for your license certificate<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@company.com"/></label><div className="eth-recipient"><small>Pay with ETH to this address</small><code>{recipient}</code><button onClick={copyAddress}>{copied ? 'Copied' : 'Copy address'}</button></div><p className="checkout-note">After payment confirmation, we’ll send one license certificate and rights record covering all songs in this cart. This preview does not connect a wallet or submit a blockchain transaction.</p><button className="primary wide" disabled={!cart.length || !email.includes('@')}>I’ve sent the ETH <Check size={15}/></button></section></div>;
}
