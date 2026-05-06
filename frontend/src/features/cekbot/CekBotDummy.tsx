import { SendHorizontal, Wifi, WifiOff } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { sendCekBotMessage, type CekBotMessageResponse } from '@/services/cekBot';

const suggestion = [
  'Jadwal dokter hari ini?',
  'Biaya pemeriksaan mata?',
  'Bagaimana cara booking?',
  'Apakah melayani BPJS?',
  'Jam operasional klinik?',
  'Keluhan mata saya harus ke dokter?',
];

interface ChatMessage {
  id: string;
  from: 'bot' | 'user';
  text: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    from: 'bot',
    text: 'Halo, saya CekBot Prime Apps 👋 Ada yang bisa saya bantu?',
  },
];

export function CekBotDummy() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [lastResponse, setLastResponse] = useState<CekBotMessageResponse | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (message = input) => {
    const cleanMessage = message.trim();

    if (!cleanMessage || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      from: 'user',
      text: cleanMessage,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      const response = await sendCekBotMessage(cleanMessage);
      setLastResponse(response);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: response.id,
          from: 'bot',
          text: response.reply,
        },
      ]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'CekBot belum dapat dihubungi.');
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `error-${Date.now()}`,
          from: 'bot',
          text: 'Maaf, koneksi ke API CekBot belum berhasil. Pastikan backend aktif dan environment variable sudah disiapkan.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSend();
  };

  const activeIntegrationCount = lastResponse?.integrations.filter((integration) => integration.active).length ?? 0;
  const isApiResponse = lastResponse?.source === 'api';

  return (
    <section className="space-y-3 rounded-3xl border border-cyan-100 bg-white p-5 shadow-lg shadow-cyan-50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">CekBot</h2>
          <p className="text-sm text-slate-500">Tanyakan layanan Prime Apps, jadwal, biaya, atau informasi kesehatan mata.</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
          {isApiResponse || activeIntegrationCount > 0 ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {isApiResponse ? 'API aktif' : 'Mode lokal'}
        </span>
      </div>

      <div className="space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-2xl p-3 text-sm ${
              message.from === 'bot'
                ? 'rounded-bl-md bg-sky-50 text-slate-700'
                : 'ml-auto rounded-br-md bg-cyan-600 text-white'
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      {lastResponse?.escalation.needed && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {lastResponse.escalation.reason}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(lastResponse?.suggestedActions ?? suggestion).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => void handleSend(item)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSending}
            aria-label={`Tanyakan: ${item}`}
          >
            {item}
          </button>
        ))}
      </div>

      {error && <p className="rounded-2xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">{error}</p>}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="flex-1 bg-transparent px-2 text-sm outline-none"
          placeholder="Ketik pertanyaan Anda..."
        />
        <button type="submit" disabled={isSending} className="rounded-xl bg-cyan-600 p-2 text-white transition disabled:cursor-not-allowed disabled:bg-slate-300">
          <span className="sr-only">Kirim pertanyaan ke CekBot</span>
          <SendHorizontal size={16} />
        </button>
      </form>
    </section>
  );
}
