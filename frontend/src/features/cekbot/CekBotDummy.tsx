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
    <section className="space-y-3 rounded-3xl border border-prime-gold/20 bg-white p-5 shadow-lg shadow-prime-gold/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-prime-black">CekBot</h2>
          <p className="text-sm text-prime-black/60">Tanyakan layanan Prime Apps, jadwal, biaya, atau informasi kesehatan mata.</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-prime-cream/50 px-2.5 py-1 text-[11px] font-semibold text-prime-gold">
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
                ? 'rounded-bl-md bg-prime-cream/50 text-prime-black/75'
                : 'ml-auto rounded-br-md bg-prime-gold text-white'
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
            className="rounded-full border border-prime-gold/20 bg-white px-3 py-1.5 text-xs text-prime-black/70 transition hover:border-prime-gold/40 hover:text-prime-gold disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSending}
            aria-label={`Tanyakan: ${item}`}
          >
            {item}
          </button>
        ))}
      </div>

      {error && <p className="rounded-2xl bg-prime-cream/50 px-3 py-2 text-xs font-medium text-prime-gold">{error}</p>}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-2xl border border-prime-gold/20 bg-[#fff8e8] p-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="flex-1 bg-transparent px-2 text-sm outline-none"
          placeholder="Ketik pertanyaan Anda..."
        />
        <button type="submit" disabled={isSending} className="rounded-xl bg-prime-gold p-2 text-white transition disabled:cursor-not-allowed disabled:bg-prime-black/20">
          <span className="sr-only">Kirim pertanyaan ke CekBot</span>
          <SendHorizontal size={16} />
        </button>
      </form>
    </section>
  );
}
