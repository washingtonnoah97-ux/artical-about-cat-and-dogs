
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Gamepad2, Search, Settings, LayoutGrid, Sword, Trophy, 
  Puzzle, RotateCcw, Target, Play, X, Save, 
  ImageIcon, Link as LinkIcon, Sparkles, Plus, 
  Maximize2, Volume2, RefreshCw, Trash2
} from 'lucide-react';

// --- Types ---
type Category = 'All' | 'Action' | 'Sports' | 'Puzzle' | 'Retro' | 'Strategy';
interface Game {
  id: string;
  title: string;
  category: Category;
  thumbnail: string;
  gameUrl: string;
  description: string;
}

// --- Defaults ---
const DEFAULT_GAMES: Game[] = [
  { id: '1', title: 'Hextris', category: 'Puzzle', thumbnail: 'https://picsum.photos/seed/hextris/600/400', gameUrl: 'https://hextris.io/', description: 'Fast-paced hexagon matching puzzle.' },
  { id: '2', title: '2048', category: 'Puzzle', thumbnail: 'https://picsum.photos/seed/2048/600/400', gameUrl: 'https://play2048.co/', description: 'Join numbers to reach the 2048 tile.' },
  { id: '3', title: 'Cyber Racer', category: 'Action', thumbnail: 'https://picsum.photos/seed/race/600/400', gameUrl: 'https://poki.com/en/g/cyber-cars-punk-racing', description: 'Neon-fueled high speed action.' }
];

const CATEGORIES: Category[] = ['All', 'Action', 'Sports', 'Puzzle', 'Retro', 'Strategy'];

const App = () => {
  // --- State & LocalStorage Logic ---
  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem('nebula_games');
    return saved ? JSON.parse(saved) : DEFAULT_GAMES;
  });

  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isAdminVisible, setIsAdminVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-save whenever games change
  useEffect(() => {
    localStorage.setItem('nebula_games', JSON.stringify(games));
  }, [games]);

  // --- Secret 'admin' keyboard trigger ---
  useEffect(() => {
    let input = '';
    const handleKey = (e: KeyboardEvent) => {
      input += e.key.toLowerCase();
      if (input.endsWith('admin')) {
        setIsAdminVisible(prev => !prev);
        input = '';
      }
      if (input.length > 10) input = input.slice(-5);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // --- Handlers ---
  const saveGame = (title: string, category: Category, url: string, thumb: string, desc: string) => {
    const newGame: Game = {
      id: Date.now().toString(),
      title,
      category,
      gameUrl: url,
      thumbnail: thumb,
      description: desc
    };
    setGames(prev => [newGame, ...prev]);
  };

  const deleteGame = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this game from your library?')) {
      setGames(prev => prev.filter(g => g.id !== id));
    }
  };

  const filteredGames = useMemo(() => {
    return games.filter(g => {
      const matchesCat = activeCategory === 'All' || g.category === activeCategory;
      const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [games, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 glass border-b border-slate-800/50 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-violet-600 p-2 rounded-xl shadow-lg shadow-violet-600/20">
            <Gamepad2 size={24} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter">NEBULA</span>
        </div>

        <div className="flex-1 max-w-xl mx-8 relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search your library..." 
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-violet-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAdminVisible(!isAdminVisible)}
            className={`p-2 rounded-full transition-colors ${isAdminVisible ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Settings size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold">G</div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-slate-950 border-r border-slate-900 transition-transform z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 space-y-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeCategory === cat ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <CategoryIcon name={cat} />
              <span className="font-medium text-sm">{cat}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 pt-24 px-8 pb-12 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Admin Panel (The Hidden Form) */}
          {isAdminVisible && (
            <div className="animate-slide-up bg-slate-900/80 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-xl mb-12 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><Plus size={20} /></div>
                  <h2 className="text-2xl font-bold">Admin Console</h2>
                </div>
                <button onClick={() => setIsAdminVisible(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500"><X size={20} /></button>
              </div>
              <AdminForm onSave={saveGame} />
            </div>
          )}

          {/* Hero */}
          {!searchQuery && activeCategory === 'All' && !isAdminVisible && (
            <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 p-12 border border-slate-800/50 shadow-2xl">
              <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                <Sparkles className="w-full h-full text-violet-500 p-12" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <span className="px-3 py-1 bg-violet-600/20 text-violet-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-violet-500/20 mb-6 inline-block">Pro Library</span>
                <h1 className="text-5xl font-black mb-6 leading-tight">Your Infinite <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">Arcade.</span></h1>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">Add any web game to your portal. Typed 'admin' yet? That's the secret to unlocking your personal library manager.</p>
                <div className="flex gap-4">
                  <button onClick={() => setSelectedGame(games[0])} className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-xl shadow-violet-600/20 flex items-center gap-2">
                    <Play size={20} fill="currentColor" /> Play Latest
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Grid Headers */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              {activeCategory} Games
              <span className="text-slate-500 font-normal text-sm bg-slate-900 px-3 py-1 rounded-full">{filteredGames.length}</span>
            </h2>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:text-white transition-colors"><LayoutGrid size={18} /></button>
            </div>
          </div>

          {/* Game Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredGames.map(game => (
              <div 
                key={game.id} 
                onClick={() => setSelectedGame(game)}
                className="group game-card-hover bg-slate-900/30 rounded-3xl border border-slate-800/50 overflow-hidden cursor-pointer transition-all duration-500"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <div className="w-14 h-14 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play fill="currentColor" size={24} />
                    </div>
                  </div>
                  {isAdminVisible && (
                    <button 
                      onClick={(e) => deleteGame(game.id, e)}
                      className="absolute top-4 right-4 p-2 bg-rose-600/80 text-white rounded-xl hover:bg-rose-500 transition-colors backdrop-blur-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <span className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md text-[10px] font-bold text-white rounded-lg border border-white/10 uppercase tracking-widest">{game.category}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-violet-400 transition-colors">{game.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{game.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Theater Mode Overlay */}
      {selectedGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 animate-in fade-in duration-300">
          <div className="relative w-full h-full flex flex-col">
            <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedGame(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><X size={24} /></button>
                <div>
                  <h2 className="font-bold text-lg leading-none">{selectedGame.title}</h2>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-tighter">{selectedGame.category} Mode</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 text-slate-500 hover:text-white"><Volume2 size={20} /></button>
                <button className="p-2 text-slate-500 hover:text-white"><RefreshCw size={20} /></button>
                <button className="p-2 text-slate-500 hover:text-white"><Maximize2 size={20} /></button>
                <button onClick={() => setSelectedGame(null)} className="ml-4 px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-colors">Exit Theater</button>
              </div>
            </header>
            <div className="flex-1 bg-black">
              <iframe src={selectedGame.gameUrl} className="w-full h-full border-0" allowFullScreen />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Subcomponents ---

const CategoryIcon = ({ name }: { name: Category }) => {
  const props = { size: 18 };
  switch(name) {
    case 'All': return <LayoutGrid {...props} />;
    case 'Action': return <Sword {...props} />;
    case 'Sports': return <Trophy {...props} />;
    case 'Puzzle': return <Puzzle {...props} />;
    case 'Retro': return <RotateCcw {...props} />;
    case 'Strategy': return <Target {...props} />;
    default: return <Gamepad2 {...props} />;
  }
};

const AdminForm = ({ onSave }: { onSave: (t: string, c: Category, u: string, th: string, d: string) => void }) => {
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState<Category>('Action');
  const [url, setUrl] = useState('');
  const [thumb, setThumb] = useState('');
  const [desc, setDesc] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(title, cat, url, thumb, desc);
    setTitle(''); setUrl(''); setThumb(''); setDesc('');
  };

  return (
    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Game Title</label>
          <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="Super Fun Game" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Category</label>
          <select value={cat} onChange={e => setCat(e.target.value as Category)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none">
            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-2"><LinkIcon size={12}/> Game URL</label>
          <input required value={url} onChange={e => setUrl(e.target.value)} type="url" placeholder="https://..." className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-2"><ImageIcon size={12}/> Thumbnail URL</label>
          <input required value={thumb} onChange={e => setThumb(e.target.value)} type="url" placeholder="https://picsum.photos/..." className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>
      <div className="space-y-4 flex flex-col">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Short Description</label>
        <textarea required value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is this game about?" className="w-full flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all">
          <Save size={18} /> Add to Library
        </button>
      </div>
    </form>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
