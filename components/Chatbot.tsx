
import React, { useState, useEffect, useRef } from 'react';
import { Kpi, ChatMessage, ActionItem } from '../types';
import { useGeminiChat } from '../hooks/useGeminiChat';
import { SendIcon, BotIcon, UserIcon, PdfFileIcon } from './Icons';

interface ChatbotProps {
  kpiReport: { met: Kpi[]; missed: Kpi[] } | null;
  onReportReady: (actionItems: ActionItem[]) => void;
}

const ChatMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex items-start gap-3 ${isModel ? '' : 'flex-row-reverse'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-200'}`}>
                {isModel ? <BotIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
            </div>
            <div className={`p-3 rounded-lg max-w-sm sm:max-w-md ${isModel ? 'bg-slate-700 text-slate-200 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.parts[0].text}</p>
            </div>
        </div>
    );
};

const Chatbot: React.FC<ChatbotProps> = ({ kpiReport, onReportReady }) => {
  const [userInput, setUserInput] = useState('');
  const [isReviewComplete, setIsReviewComplete] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { messages, loading, error, initializeChat, sendMessage, getJsonSummary } = useGeminiChat();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (kpiReport) {
      const systemInstruction = `You are 'The Performance Partner', an AI chatbot designed to facilitate weekly KPI reviews.

## Core Mandate:
Your primary goal is to act as an objective, supportive, and structured partner in performance analysis, helping team members reflect on their results and build a cycle of continuous, actionable improvement. The main priority is discussing missed goals and creating action plans.

## Primary Tone & Key Attributes:
- **Supportive & Professional:** Your tone is polite and non-judgmental. You are a coach, not a critic. Use "we" and "our" to sound collaborative.
- **Objective & Data-Driven:** Lead with data as the factual starting point.
- **Concise & Direct:** Keep responses simple, short, and action-oriented.
- **Inquisitive (Socratic):** Ask guided "What" and "How" questions. Do not provide recommendations.
- **Forward-Looking:** The focus is on "what's next," not "why you failed."
- **Firm on Process (for missed goals):** Politely but consistently enforce two core rules for missed KPIs: 1) A specific, measurable action plan is required. 2) That action plan cannot be a repeat of a previously unsuccessful plan from this conversation.

## Core Interaction Logic:
You will be given a summary of met and missed KPIs. Your primary focus is on the missed KPIs.

### 1. Address Missed KPIs (Priority)
- Go through each missed KPI one by one.
- **State the Facts:** "For [KPI Name], the goal was [Goal Result] and the actual was [Actual Result]. We missed this target."
- **Initiate Accountability (The Core Prompt):** "What one specific action will you take differently next period to meet this goal?"
- **Action Plan Analysis:**
    - If the user's plan is vague (e.g., "I'll try harder"), respond: "That's a bit vague. We need a specific, measurable action. For example, 'dedicate 30 extra minutes to task X'. What is your specific action?".
    - If the user repeats a failed plan from this session, respond: "I see that was our plan before, and it didn't hit the goal. We must try a new or modified action. What's a different approach?"
- **Confirm & Conclude (for each missed KPI):** Once a specific, new plan is agreed upon, say: "OK. That's a clear action. I've logged it. Let's move to the next item."

### 2. Address Met KPIs (Secondary)
- After all missed KPIs are handled, address the met goals.
- **Acknowledge Success:** "Now, let's look at the successes. Good work on hitting the targets for [List of Met KPI Names]."
- **Isolate Success (Briefly):** "Was there any particular insight or action that contributed to these positive results?"
- **Conclude:** If the user gives a specific answer, acknowledge it. If the user is vague (e.g., "Just worked hard"), accept it and move on. Do not push for more detail on successes.

### 3. Conclude the Review
- After discussing both missed and met KPIs, conclude the entire conversation with the exact phrase: 'Our review is complete.'`;

      let initialMessage = "Here is the KPI report summary. Please begin the review by addressing the MISSED KPIs first, one by one. After all missed KPIs are handled, briefly address the MET KPIs.\n\n";
      
      const { met, missed } = kpiReport;

      if (missed.length === 0 && met.length === 0) {
          initialMessage = "The KPI report is empty or incomplete. Please ask the user to check their form submission and ensure all fields are filled out.";
      } else {
        if (missed.length > 0) {
            initialMessage += "## MISSED KPIs (Priority)\n";
            initialMessage += missed
              .map(kpi => `- ${kpi.name} (Goal: ${kpi.goal}${kpi.unit}, Actual: ${kpi.actual}${kpi.unit})`)
              .join('\n');
            initialMessage += "\n\n";
        } else {
            initialMessage += "There were no missed KPIs this period. Let's start with the successes.\n\n";
        }

        if (met.length > 0) {
            initialMessage += "## MET KPIs\n";
            initialMessage += met
              .map(kpi => `- ${kpi.name} (Goal: ${kpi.goal}${kpi.unit}, Actual: ${kpi.actual}${kpi.unit})`)
              .join('\n');
        }
      }

      initializeChat(systemInstruction, initialMessage);
    }
  }, [kpiReport, initializeChat]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    const lastMessage = messages[messages.length - 1];
    if (!isReviewComplete && lastMessage?.role === 'model' && lastMessage.parts[0].text.includes('Our review is complete.')) {
        setIsReviewComplete(true);
    }
  }, [messages, isReviewComplete]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      sendMessage(userInput.trim());
      setUserInput('');
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
        const summary = await getJsonSummary(messages);
        onReportReady(summary.actionItems);
    } catch (e) {
        console.error("Failed to generate report summary:", e);
        // You could show an error toast/message to the user here
    } finally {
        setIsGeneratingReport(false);
    }
  };

  if (kpiReport === null) {
    return (
      <aside aria-label="Chatbot placeholder" className="lg:sticky lg:top-24 bg-slate-800 shadow-lg rounded-xl p-6 border border-slate-700 h-[80vh] lg:h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center">
        <BotIcon className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-100">Performance Review Assistant</h2>
        <p className="text-slate-400 mt-2">Complete and submit the KPI form on the left to begin your performance discussion.</p>
      </aside>
    );
  }

  return (
    <aside aria-label="Chatbot" className="lg:sticky lg:top-24 bg-slate-800 shadow-lg rounded-xl border border-slate-700 h-[80vh] lg:h-[calc(100vh-10rem)] flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-slate-100">Review Discussion</h2>
        <p className="text-sm text-slate-400">with your AI Assistant</p>
      </div>
      <div ref={chatContainerRef} className="flex-1 p-4 space-y-6 overflow-y-auto" aria-live="polite">
        {messages.map((msg, index) => (
          <ChatMessageBubble key={index} message={msg} />
        ))}
        {loading && messages.length > 0 && (
             <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white">
                    <BotIcon className="w-5 h-5" />
                </div>
                <div className="p-3 rounded-lg bg-slate-700 rounded-tl-none">
                    <div className="flex items-center justify-center gap-1">
                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
        )}
        {loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <BotIcon className="w-12 h-12 mb-4 animate-pulse" />
                <p>Preparing your performance review...</p>
            </div>
        )}
        {error && <p className="text-red-400 text-sm text-center p-2">{error}</p>}
      </div>
      
      {isReviewComplete ? (
        <div className="p-4 border-t border-slate-700">
            <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
                {isGeneratingReport ? (
                    <>
                        <span className="h-4 w-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></span>
                        Generating Report...
                    </>
                ) : (
                    <>
                        <PdfFileIcon className="w-5 h-5" />
                        Generate PDF Report
                    </>
                )}
            </button>
        </div>
      ) : (
        <div className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-xl">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 block w-full rounded-md bg-slate-700 border-slate-600 text-slate-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-900/50 placeholder:text-slate-400"
                disabled={loading || messages.length === 0}
                aria-label="Chat message input"
            />
            <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full h-10 w-10 transition-colors bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed"
                disabled={loading || !userInput.trim()}
                aria-label="Send message"
            >
                <SendIcon className="w-5 h-5" />
            </button>
            </form>
        </div>
      )}
    </aside>
  );
};

export default Chatbot;
