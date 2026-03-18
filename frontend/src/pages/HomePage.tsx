import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dices } from 'lucide-react';
import { games } from '../data/games';
import GameCard from '../components/GameCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Search logic checking names, descriptions, and tags
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        !query || 
        game.name.toLowerCase().includes(query) || 
        game.description.toLowerCase().includes(query) || 
        game.tags.some(tag => tag.toLowerCase().includes(query));

      // Filter tags using OR logic
      const matchesTags = 
        selectedTags.length === 0 || 
        selectedTags.some(selected => game.tags.includes(selected));

      return matchesSearch && matchesTags;
    });
  }, [searchQuery, selectedTags]);

  const handleTagClick = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const spinRandom = () => {
    const randomIndex = Math.floor(Math.random() * games.length);
    navigate(games[randomIndex].route);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 text-hextech-gold-light relative overflow-x-hidden flex flex-col items-center pt-8 md:pt-16 pb-12">
      {/* Background flare */}
      <div className="absolute top-[-10%] left-1/2 transform -translate-x-1/2 w-[800px] h-[500px] bg-hextech-blue/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto relative z-10 flex-grow flex flex-col">
        {/* Header */}
        <header className="text-center mb-6 md:mb-8">
          <div className="inline-block relative">
            <h1 className="text-4xl md:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-hextech-gold-light to-hextech-gold mb-4 md:mb-6 uppercase drop-shadow-2xl">
              Strategy Simulator
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-hextech-gold to-transparent" />
          </div>
          <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto font-light tracking-wide mt-6 px-4 md:px-0">
            A portal to interact with algorithmic domains.
          </p>

          {/* Feeling Lucky Button placed prominently under subtitle (Temporarily hidden via false short-circuit) */}
        {false && (
          <div className="flex justify-center mb-10">
            <button 
              onClick={spinRandom} 
              className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 bg-hextech-dark/95 border border-hextech-gold text-hextech-gold hover:text-hextech-gold-light hover:bg-[#c89b3c]/10 uppercase tracking-[0.2em] font-black transition-all hover:scale-105 shadow-[0_0_20px_rgba(200,155,60,0.15)] rounded-sm"
            >
              <div className="absolute inset-0 bg-hextech-gold/20 transform -translate-x-full skew-x-12 group-hover:animate-[shine_1.5s_ease-out_infinite]" />
              <Dices size={24} className="group-hover:text-hextech-blue transition-colors" />
              <span className="relative z-10 font-bold whitespace-nowrap">Feeling Lucky</span>
            </button>
          </div>
        )}
        </header>

        {/* Search and Filters Section */}
        <div className="mb-10 w-full flex flex-col items-center">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FilterBar 
            activeTags={selectedTags} 
            onRemoveTag={handleRemoveTag} 
            onClearAll={() => setSelectedTags([])} 
          />
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {filteredGames.length > 0 ? (
            filteredGames.map(game => (
              <GameCard
                key={game.id}
                title={game.name}
                description={game.description}
                route={game.route}
                tags={game.tags}
                onTagClick={handleTagClick}
              />
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 text-gray-500 font-light tracking-wide text-lg">
              No domains found matching your criteria.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
