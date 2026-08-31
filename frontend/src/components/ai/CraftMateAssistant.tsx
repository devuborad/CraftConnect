import React, { useState } from 'react';
import { Sparkles, X, Send, Volume2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CraftMateAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useApp();
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: language === 'gu'
        ? 'નમસ્તે! હું તમારો ક્રાફ્ટમેટ AI સહાયક છું. 🎨 હું તમને તમારી પ્રોડક્ટ કિંમત, વર્ણન અથવા માર્કેટ કનેક્ટિવિટીમાં મદદ કરી શકું છું.'
        : language === 'hi'
        ? 'नमस्ते! मैं आपका क्राफ्टमेट AI सहायक हूँ। 🎨 मैं आपकी उत्पाद विवरण, सही कीमत या खरीदारों से जुड़ने में सहायता कर सकता हूँ।'
        : "Namaste! I'm CraftMate 🤖. I help artisans turn handmade crafts into market-ready listings!"
    }
  ]);
  const [inputText, setInputText] = useState('');

  const quickPrompts = [
    '✨ Help me describe my product',
    '💰 How should I price it?',
    '🌐 Translate my description',
    '📦 How can I reach more buyers?'
  ];

  const handleQuickPrompt = (prompt: string) => {
    setMessages((prev) => [...prev, { sender: 'user', text: prompt }]);

    let reply = '';
    if (prompt.includes('describe')) {
      reply = "I can take your voice recording in Gujarati or Hindi and write an attractive English description emphasizing your craft's heritage, materials, and care instructions!";
    } else if (prompt.includes('price')) {
      reply = "Our AI Price Engine calculates raw material + labor hours + craft rarity to recommend a fair price (with a 50-60% artisan living wage margin)!";
    } else if (prompt.includes('Translate')) {
      reply = 'I instantly generate descriptions in English, Gujarati, and Hindi so urban boutique buyers can read your authentic story!';
    } else {
      reply = 'Once published, your product appears on our wholesale marketplace where verified boutique buyers from Mumbai, Delhi, and Bangalore send direct bulk inquiries!';
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: inputText }]);
    const currentInput = inputText;
    setInputText('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Great question about "${currentInput}". CraftMate AI recommends using voice recording in your natural language for 10x faster product cataloguing!`
        }
      ]);
    }, 800);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-[#4A2E1B] to-[#C85A32] text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center space-x-2.5 border-2 border-amber-300/40 group"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-amber-200">
            🤖
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-amber-100 flex items-center space-x-1">
              <span>CraftMate AI</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </p>
            <p className="text-[10px] text-stone-200">Artisan Assistant</p>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="glass-card bg-white/95 rounded-3xl shadow-2xl border border-stone-200 w-80 sm:w-96 overflow-hidden flex flex-col h-[480px] animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4A2E1B] to-[#C85A32] text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center space-x-1">
                  <span>CraftMate AI</span>
                  <span className="bg-amber-400 text-stone-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded">ASSISTANT</span>
                </h3>
                <p className="text-[11px] text-amber-200">Speak Gujarati, Hindi or English</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF7F2]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#C85A32] text-white rounded-br-none shadow-sm'
                      : 'bg-white text-stone-800 rounded-bl-none border border-stone-200 shadow-sm'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="flex items-center space-x-1 text-[10px] text-[#C85A32] font-semibold mb-1">
                      <Volume2 className="w-3 h-3" />
                      <span>CraftMate Assistant</span>
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-white border-t border-stone-200 space-y-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
            <p className="text-[10px] text-stone-400 font-semibold px-1">SUGGESTED HELP:</p>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-[11px] bg-amber-50 hover:bg-amber-100 text-[#4A2E1B] border border-amber-200 px-2.5 py-1 rounded-full font-medium transition-colors flex items-center space-x-1"
                >
                  <span>{prompt}</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-200 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask CraftMate anything..."
              className="flex-1 bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A32] text-stone-900"
            />
            <button
              type="submit"
              className="bg-[#C85A32] hover:bg-[#b04b27] text-white p-2 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
