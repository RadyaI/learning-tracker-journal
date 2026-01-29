'use client';

import { X, Calendar, Clock, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LogEntry } from '@/types';

interface ReadContentModalProps {
  log: LogEntry | null;
  onClose: () => void;
}

export default function ReadContentModal({ log, onClose }: ReadContentModalProps) {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all">
      
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-zinc-800 p-6 bg-zinc-950/80 backdrop-blur-md rounded-t-3xl z-10 sticky top-0">
           <div className="flex items-center gap-4">
              <div className={`h-12 w-12 shrink-0 rounded-full overflow-hidden shadow-sm border ${log.isEmergency ? 'border-orange-500/30 bg-orange-500/10' : 'border-indigo-500/30 bg-indigo-500/10'}`}>
                <img 
                  src={`/images/cats/${log.mood || 'cat1'}.png`} 
                  className="h-full w-full object-cover" 
                  alt="mood" 
                />
              </div>
              <div>
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {(log as any).dateString}
                    {log.isEmergency && (
                      <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">Fast Mode</span>
                    )}
                 </h3>
                 <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono mt-1">
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(log.createdAt?.seconds * 1000).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) || 'Just now'}</span>
                    <span className="flex items-center gap-1"><Zap size={12} /> {log.duration} Menit</span>
                 </div>
              </div>
           </div>

           <button 
             onClick={onClose}
             className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition border border-zinc-800"
           >
             <X size={20} />
           </button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
           <div className="prose prose-invert prose-zinc max-w-none text-zinc-300 leading-relaxed">
              <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-indigo-400 border-b border-zinc-800 pb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-white" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2 text-zinc-200" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 whitespace-pre-wrap break-words" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                    em: ({node, ...props}) => <em className="italic text-zinc-400" {...props} />,
                    a: ({node, ...props}) => <a className="text-indigo-400 hover:underline cursor-pointer" target="_blank" rel="noopener noreferrer" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1 marker:text-zinc-500" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-zinc-400 my-4 bg-zinc-900/50 py-3 pr-4 rounded-r-lg" {...props} />,
                    code: ({node, inline, className, children, ...props}: any) => {
                       return inline ? (
                         <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-300 border border-zinc-700" {...props}>{children}</code>
                       ) : (
                         <div className="overflow-x-auto bg-zinc-950 p-4 rounded-xl border border-zinc-800 my-4 shadow-inner">
                           <code className="block text-sm font-mono text-zinc-300 whitespace-pre" {...props}>{children}</code>
                         </div>
                       )
                    }
                  }}
                >
                  {log.content}
                </ReactMarkdown>
           </div>
        </div>

      </div>
    </div>
  );
}