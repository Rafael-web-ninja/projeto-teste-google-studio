import React from 'react';
import { CampaignData, LoadingState } from '../types';

interface CampaignDisplayProps {
  data: CampaignData | null;
  loadingState: LoadingState;
  onRegenerateImage: () => void;
}

const CampaignDisplay: React.FC<CampaignDisplayProps> = ({ data, loadingState, onRegenerateImage }) => {
  if (!data && loadingState === LoadingState.IDLE) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">Your campaign preview will appear here</p>
        <p className="text-sm">Fill out the form to get started</p>
      </div>
    );
  }

  if (loadingState === LoadingState.GENERATING_TEXT) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
         <p className="text-indigo-600 font-medium animate-pulse">Drafting your campaign...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Mock Email Header */}
      <div className="bg-slate-100 border-b border-slate-200 p-4 flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
        <div className="ml-4 text-xs text-slate-500 font-mono bg-white px-2 py-1 rounded border border-slate-300 flex-1">
          New Message
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        {/* Subject Line */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
          <div className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
            {data?.subject || "Subject line..."}
          </div>
        </div>

        {/* Image Area */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Visual Header</label>
          <div className="relative rounded-lg overflow-hidden bg-slate-100 border border-slate-200 min-h-[200px] flex items-center justify-center group">
            {loadingState === LoadingState.GENERATING_IMAGE ? (
               <div className="flex flex-col items-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                   <span className="text-xs text-slate-500">Generating visuals with Imagen...</span>
               </div>
            ) : data?.imageUrl ? (
              <>
                <img src={data.imageUrl} alt="Campaign visual" className="w-full h-auto object-cover" />
                <button 
                    onClick={onRegenerateImage}
                    className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Regenerate</span>
                </button>
              </>
            ) : (
              <div className="text-slate-400 text-sm italic">Image will appear here</div>
            )}
          </div>
          {data?.imagePrompt && (
            <div className="mt-2">
                <details className="text-xs text-slate-500 cursor-pointer">
                    <summary className="hover:text-indigo-600 transition-colors">View Image Prompt</summary>
                    <p className="mt-1 p-2 bg-slate-50 rounded border border-slate-100 italic">
                        {data.imagePrompt}
                    </p>
                </details>
            </div>
          )}
        </div>

        {/* Body Text */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Body Copy</label>
          <div className="prose prose-slate prose-sm max-w-none text-slate-700 whitespace-pre-wrap font-sans">
            {data?.body || "Email body content..."}
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
         <span className="text-xs text-slate-400">Generated by Gemini Pro & Imagen 3</span>
         <div className="flex space-x-2">
             <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors">
                 Copy Text
             </button>
             <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors">
                 Save Campaign
             </button>
         </div>
      </div>
    </div>
  );
};

export default CampaignDisplay;
