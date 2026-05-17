import { FormEvent, useEffect, useState } from "react";
import { SendHorizontal, Trash2, WifiOff } from "lucide-react";
import {
  AI_STORAGE_KEYS,
  generateCekBotReply,
  loadFromStorage,
  removeFromStorage,
  saveToStorage,
  type CekBotMessage,
} from "@/features/ai-eye/localAiStorage";

const quickQuestions = [
  "Jadwal dokter hari ini?",
  "Biaya pemeriksaan mata?",
  "Bagaimana cara booking?",
  "Apakah melayani BPJS?",
  "Jam operasional klinik?",
  "Keluhan mata saya harus ke dokter?",
];

const welcomeMessage: CekBotMessage = {
  id: "welcome-local-cekbot",
  role: "bot",
  text: "Halo, saya CekBot Prime Apps 👋 Ada yang bisa saya bantu?",
  createdAt: new Date(0).toISOString(),
};

function createMessage(role: CekBotMessage["role"], text: string): CekBotMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    text,
    createdAt: new Date().toISOString(),
  };
}

function normalizeMessages(messages: CekBotMessage[]) {
  return messages.length > 0 ? messages : [welcomeMessage];
}

export function CekBotDummy() {
  const [messages, setMessages] = useState<CekBotMessage[]>(() =>
    normalizeMessages(loadFromStorage<CekBotMessage[]>(AI_STORAGE_KEYS.cekBotMessages, [welcomeMessage])),
  );
  const [input, setInput] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    saveToStorage(AI_STORAGE_KEYS.cekBotMessages, messages);
  }, [messages]);

  const handleSend = (message = input) => {
    const cleanMessage = message.trim();
    if (!cleanMessage) return;

    const userMessage = createMessage("user", cleanMessage);
    const botMessage = createMessage("bot", generateCekBotReply(cleanMessage));
    setMessages((currentMessages) => [...currentMessages, userMessage, botMessage]);
    setInput("");
    setStatusMessage("Jawaban CekBot dibuat secara lokal dan riwayat chat tersimpan di perangkat ini.");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSend();
  };

  const handleClearMessages = () => {
    setMessages([welcomeMessage]);
    setStatusMessage("Riwayat chat lokal sudah dihapus.");
    removeFromStorage(AI_STORAGE_KEYS.cekBotMessages);
  };

  return (
    <section className="space-y-4 rounded-3xl border border-prime-gold/20 bg-white p-5 shadow-lg shadow-prime-gold/10">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-prime-black">CekBot</h2>
          <p className="text-sm leading-relaxed text-prime-black/65">Tanyakan layanan Prime Apps, jadwal, biaya, atau informasi kesehatan mata.</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-prime-cream/60 px-3 py-1.5 text-xs font-semibold text-prime-gold">
          <WifiOff className="h-3.5 w-3.5" /> Mode lokal
        </span>
      </div>

      <div className="max-h-[360px] space-y-2 overflow-y-auto rounded-3xl border border-prime-gold/10 bg-prime-cream/25 p-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed shadow-sm ${
              message.role === "bot"
                ? "rounded-bl-md bg-white text-prime-black/75"
                : "ml-auto rounded-br-md bg-prime-gold text-white"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-prime-gold">Quick questions</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => handleSend(question)}
              className="rounded-full border border-prime-gold/20 bg-white px-3 py-2 text-xs font-medium text-prime-black/70 transition hover:border-prime-gold hover:text-prime-gold"
              aria-label={`Tanyakan: ${question}`}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {statusMessage && <p className="rounded-2xl bg-prime-cream/50 px-3 py-2 text-xs font-medium text-prime-black/65">{statusMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-3 rounded-3xl border border-prime-gold/20 bg-[#fff8e8] p-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="w-full rounded-2xl border border-transparent bg-white px-4 py-3 text-sm text-prime-black outline-none transition focus:border-prime-gold"
          placeholder="Ketik pertanyaan Anda..."
        />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-prime-gold px-4 py-3 text-sm font-semibold text-white shadow-md shadow-prime-gold/25">
            <SendHorizontal size={16} /> Kirim pertanyaan ke CekBot
          </button>
          <button type="button" onClick={handleClearMessages} className="inline-flex items-center justify-center rounded-2xl border border-prime-gold/20 bg-white px-3 text-prime-black/65" aria-label="Hapus riwayat chat CekBot">
            <Trash2 size={17} />
          </button>
        </div>
      </form>
    </section>
  );
}
