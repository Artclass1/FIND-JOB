import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Search, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setResults('');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `You are a direct job search assistant. The user is looking for a job based on this description: "${prompt}".

Your goal is to bypass job board aggregators that require complex logins and find DIRECT application links or HR/recruiter contacts for real, currently open positions.

Use Google Search to find 5-10 real, current job openings that match the user's criteria.

For each job, provide the following information formatted cleanly in Markdown:

### [Job Title] at [Company]
**Location:** [Location]
**Direct Apply Link:** [Try to find the company's own career page link or a direct email. Avoid aggregators like Indeed/LinkedIn if a direct link is available.]
**HR/Poster Contact:** [Name, email, or LinkedIn profile of the recruiter/poster if publicly available. If not found, say "Not publicly available"]
**Summary:** [1-2 sentences about the role and requirements.]
---
`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      setResults(response.text || 'No results found. Please try a different search.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while searching for jobs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        <header className="mb-12 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center space-x-3 mb-6"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white">
              DirectJob
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed"
          >
            Bypass the noise. Describe your ideal role and we'll find direct application links and HR contacts so you don't have to navigate endless job boards.
          </motion.p>
        </header>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSearch} 
          className="mb-16"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-2 flex flex-col md:flex-row gap-4 focus-within:border-zinc-600 transition-colors">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. I'm a senior React developer looking for remote roles in Europe. I prefer startups and want to contact founders directly."
                className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 p-4 outline-none resize-none min-h-[120px] md:min-h-[80px] text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch(e);
                  }
                }}
              />
              <div className="flex items-end justify-end p-2">
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 px-6 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all active:scale-95 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span>Find Jobs</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-950/50 border border-red-900/50 text-red-200 p-6 rounded-2xl mb-8"
            >
              <p>{error}</p>
            </motion.div>
          )}

          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-2xl"
            >
              <div className="flex items-center space-x-3 mb-8 pb-8 border-b border-zinc-800">
                <Search className="w-6 h-6 text-zinc-400" />
                <h2 className="text-2xl font-medium text-white">Search Results</h2>
              </div>
              
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {results}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
