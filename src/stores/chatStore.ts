// store/chatStore.ts
import { create } from 'zustand';

interface ChatState {
    initialPrompt: string | null; // Prompt yang akan digunakan untuk memulai chat
    setInitialPrompt: (prompt: string | null) => void; // Fungsi untuk mengatur prompt
    clearInitialPrompt: () => void; // Fungsi untuk membersihkan prompt
}

const useChatStore = create<ChatState>((set) => ({
    initialPrompt: null, // State awal
    setInitialPrompt: (prompt) => set({ initialPrompt: prompt }),
    clearInitialPrompt: () => set({ initialPrompt: null }),
}));

export default useChatStore;