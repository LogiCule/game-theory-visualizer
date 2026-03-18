import { Search } from 'lucide-react';

type SearchBarProps = {
  value: string;
  onChange: (val: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto group">
      <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-hextech-gold group-focus-within:text-hextech-gold-light transition-colors">
        <Search size={20} />
      </div>
      <input
        type="text"
        className="w-full bg-hextech-dark/95 border-2 border-hextech-border text-hextech-gold-light text-sm md:text-base rounded-full focus:ring-hextech-gold focus:border-hextech-gold block pl-14 pr-6 py-4 outline-none transition-all placeholder:text-gray-600 shadow-[0_0_15px_rgba(200,155,60,0.05)] focus:shadow-[0_0_20px_rgba(200,155,60,0.2)]"
        placeholder="Search domains by name, description, or tag..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
