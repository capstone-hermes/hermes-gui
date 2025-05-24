import { useState } from "react";
import { Search } from "lucide-react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
}

const UrlInput = ({ onSubmit }: UrlInputProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Entrez l'URL du site à analyser..."
          className="w-full px-6 py-4 bg-cyber-gray/50 border border-cyber-green/20 rounded-lg 
                   text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                   focus:ring-cyber-green/50 transition-all duration-300 text-lg"
          required
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 
                   bg-cyber-green/20 hover:bg-cyber-green/30 rounded-md 
                   transition-all duration-300"
        >
          <Search className="w-5 h-5 text-cyber-green" />
        </button>
      </div>
    </form>
  );
};

export default UrlInput;