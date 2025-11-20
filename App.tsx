import React, { useState } from 'react';
import { generateCampaignContent, generateCampaignImage } from './services/gemini';
import { CampaignData, LoadingState } from './types';
import CampaignDisplay from './components/CampaignDisplay';
import ChatInterface from './components/ChatInterface';

function App() {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('Professional');
  
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !audience) return;

    setError(null);
    setLoadingState(LoadingState.GENERATING_TEXT);

    try {
      // 1. Generate Text Content
      const data = await generateCampaignContent(topic, audience, tone);
      setCampaignData(data);
      
      // 2. Generate Image
      setLoadingState(LoadingState.GENERATING_IMAGE);
      const imageUrl = await generateCampaignImage(data.imagePrompt);
      
      // 3. Complete
      setCampaignData({ ...data, imageUrl });
      setLoadingState(LoadingState.COMPLETE);

    } catch (err) {
      setError("Failed to generate content. Please verify your API key and try again.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleRegenerateImage = async () => {
    if (!campaignData?.imagePrompt) return;
    
    setLoadingState(LoadingState.GENERATING_IMAGE);
    try {
        const newImageUrl = await generateCampaignImage(campaignData.imagePrompt);
        setCampaignData(prev => prev ? { ...prev, imageUrl: newImageUrl } : null);
        setLoadingState(LoadingState.COMPLETE);
    } catch (err) {
        setError("Failed to regenerate image.");
        setLoadingState(LoadingState.COMPLETE); // Revert to complete (with old image or error)
    }
  };

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">Marketeer<span className="text-indigo-600">AI</span></span>
            </div>
            <div className="flex items-center space-x-4">
                <button 
                  onClick={toggleChat}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isChatOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>AI Assistant</span>
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
          
          {/* Left: Input Form */}
          <div className="lg:col-span-4 flex flex-col space-y-6 overflow-y-auto pr-2">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Campaign Details</h2>
                <form onSubmit={handleGenerate} className="space-y-4">
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1">What is this campaign about?</label>
                        <textarea
                            id="topic"
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="e.g., Summer sale on premium sunglasses, 50% off selected styles"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="audience" className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
                        <input
                            type="text"
                            id="audience"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="e.g., Millennials who love travel"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-slate-700 mb-1">Tone of Voice</label>
                        <select
                            id="tone"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                        >
                            <option>Professional</option>
                            <option>Exciting & Urgent</option>
                            <option>Friendly & Casual</option>
                            <option>Luxury & Minimalist</option>
                            <option>Humorous</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loadingState !== LoadingState.IDLE && loadingState !== LoadingState.COMPLETE && loadingState !== LoadingState.ERROR}
                        className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                       {loadingState === LoadingState.GENERATING_TEXT ? (
                           <>
                               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                               </svg>
                               <span>Writing Copy...</span>
                           </>
                       ) : loadingState === LoadingState.GENERATING_IMAGE ? (
                           <>
                               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                               </svg>
                               <span>Designing Visuals...</span>
                           </>
                       ) : (
                           <>
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                   <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                               </svg>
                               <span>Generate Campaign</span>
                           </>
                       )}
                    </button>
                    
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg mt-2">
                            {error}
                        </div>
                    )}
                </form>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">Smart Copy</h3>
                    <p className="text-xs text-slate-500 mt-1">Gemini 3 Pro drafts compelling text.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">Instant Visuals</h3>
                    <p className="text-xs text-slate-500 mt-1">Imagen 4 creates custom headers.</p>
                </div>
            </div>
          </div>

          {/* Right: Display Area */}
          <div className="lg:col-span-8 h-full relative">
            <CampaignDisplay 
                data={campaignData} 
                loadingState={loadingState} 
                onRegenerateImage={handleRegenerateImage}
            />
          </div>

        </div>
      </main>
      
      {/* Chat Interface Drawer */}
      <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

export default App;
