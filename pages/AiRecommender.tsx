
import React, { useState, useContext } from 'react';
import { getAIRecommendations } from '../services/geminiService';
import { AIRecommendation } from '../types';
import Spinner from '../components/Spinner';
import { MovieListsContext } from '../contexts/MovieListsContext';

const AiRecommender: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const movieListsContext = useContext(MovieListsContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const likedMovieTitles = movieListsContext?.likedMovies
        .map(movie => movie.title || movie.name)
        .filter((title): title is string => !!title) ?? [];

      const results = await getAIRecommendations(prompt, likedMovieTitles);
      setRecommendations(results);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching AI recommendations.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const examplePrompts = [
    "Compelling Bollywood dramas with intense emotions.",
    "South Indian action blockbusters with great choreography.",
    "Modern Malayalam films that are realistic and grounded.",
    "Movies like 'Dangal' or 'Lagaan' about sports and society.",
    "Underrated Indian indie films that deserve more viewers."
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="text-center mb-16 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="flex justify-center mb-4">
           <div className="bg-blue-600/10 text-blue-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-blue-500/20">
             Cortex Intelligence
           </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white uppercase tracking-tighter mb-6">AI Recommender</h1>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto">Input your mood or preference, and let the Friday Stuff AI curate a bespoke selection of Indian and global cinema.</p>
      </div>
      
      <div className="bg-white dark:bg-slate-900 overflow-hidden rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl mb-12 group transition-all hover:border-blue-500/30">
        <form onSubmit={handleSubmit} className="p-2">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'A raw, gritty Malayalam crime thriller' or 'High-energy Bollywood dance musicals'"
              className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-[2rem] p-8 pb-24 focus:ring-0 focus:outline-none transition text-xl font-medium resize-none placeholder:text-slate-400 dark:placeholder:text-slate-700"
              rows={3}
            />
            <div className="absolute bottom-6 right-6 flex items-center space-x-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">Press CMD+Enter to sync</p>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black px-10 py-4 rounded-3xl disabled:opacity-50 transition-all active:scale-[0.98] shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs"
                >
                  {loading ? 'Analyzing Content...' : 'Sync Recommendations'}
                </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="mb-16">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 mb-6 uppercase tracking-[0.4em] text-center">Sync Inspiration</h3>
        <div className="flex flex-wrap justify-center gap-3">
            {examplePrompts.map((p, i) => (
                <button 
                  key={i} 
                  onClick={() => setPrompt(p)} 
                  className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 px-6 py-3 rounded-full transition-all active:scale-95"
                >
                    {p}
                </button>
            ))}
        </div>
      </div>

      {loading && (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <Spinner size="lg" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Neural Sync in Progress</p>
          </div>
      )}
      
      {error && (
          <div className="text-center bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-[2rem] font-bold text-sm">
              {error}
          </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-10">
             <div className="w-1.5 h-10 bg-blue-500 rounded-full"></div>
             <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight">AI Generated Selection</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                    <span className="text-9xl font-black text-blue-500">{(index + 1).toString().padStart(2, '0')}</span>
                </div>
                <div className="relative z-10 flex items-start space-x-6">
                  <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 border border-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter mb-2">
                        {rec.title} <span className="text-slate-400 dark:text-slate-600 font-medium ml-2">{rec.year}</span>
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-lg">
                        {rec.reason}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiRecommender;
