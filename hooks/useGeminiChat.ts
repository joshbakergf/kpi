
import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, Type } from '@google/genai';
import { ChatMessage, ActionItem } from '../types';

const API_KEY = process.env.API_KEY;

export const useGeminiChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);

  const initializeChat = useCallback(async (systemInstruction: string, initialMessage: string) => {
    if (!API_KEY) {
      const errorMessage = "API key is not configured. Please set the API_KEY environment variable.";
      setError(errorMessage);
      console.error(errorMessage);
      return;
    }
    setLoading(true);
    setError(null);
    setMessages([]);

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: true });
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
        },
      });
      chatRef.current = chat;

      const response = await chat.sendMessage({ message: initialMessage });
      
      const botMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: response.text }],
      };
      setMessages([botMessage]);

    } catch (e) {
      console.error("Failed to initialize chat:", e);
      setError("Sorry, I couldn't start the conversation. Please check your API key and network connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = async (userInput: string) => {
    if (!chatRef.current || loading) return;

    setLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: userInput }],
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatRef.current.sendMessage({ message: userInput });
      const botMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: response.text }],
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      console.error("Failed to send message:", e);
      setError("I encountered an issue. Please try sending your message again.");
    } finally {
      setLoading(false);
    }
  };

  const getJsonSummary = async (chatHistory: ChatMessage[]): Promise<{ actionItems: ActionItem[] }> => {
    if (!API_KEY) {
        throw new Error("API key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: true });

    const contents = [
        ...chatHistory,
        {
            role: 'user' as const,
            parts: [{ text: "Based on our entire conversation, provide a JSON object summarizing the action items for each missed KPI. Do not include met KPIs. The JSON object should have a single key 'actionItems' which is an array of objects. Each object in the array should have two keys: 'kpiName' (string) and 'action' (string)." }]
        }
    ];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    actionItems: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                kpiName: { type: Type.STRING },
                                action: { type: Type.STRING }
                            },
                            required: ['kpiName', 'action']
                        }
                    }
                }
            }
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  };

  return { messages, loading, error, initializeChat, sendMessage, getJsonSummary };
};
