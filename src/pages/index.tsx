import { useState, useEffect, useRef, FormEvent } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { text: string; user: boolean; typing: boolean }[]
  >([]);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const ask = async (conversation: string) => {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation }),
    });
    return await response.text();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    if (!message.trim()) return;
    let updatedChatHistory = [
      ...chatHistory,
      { text: message, user: true, typing: false },
    ];
    setChatHistory(updatedChatHistory);
    setMessage("");
    const randomDelay = Math.floor(Math.random() * 1000) + 500;
    await new Promise((r) => setTimeout(r, randomDelay));
    setTyping(true);
    setChatHistory((prev) => [
      ...prev,
      { text: "Typing...", user: false, typing: true },
    ]);
    let conversation = updatedChatHistory
      .map(({ text, user }) => `${user ? "USER" : "RESPONSE"}: ${text}\n`)
      .join("");
    const response = await ask(conversation);
    setTyping(false);
    setChatHistory((prev) => {
      let history = [...prev];
      history[history.length - 1] = {
        text: response,
        user: false,
        typing: false,
      };
      return history;
    });
    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <>
      <Head>
        <title>AskLlama</title>
        <meta name="description" content="Ask a Llama Anything :D" />
      </Head>

      <main
        className={`flex h-screen gap-y-4 flex-col items-center p-4 ${inter.className}`}
      >
        <h1 className="text-3xl font-bold sm:text-4xl">🦙 AskLlama</h1>

        <div className="flex flex-col flex-grow w-full max-w-xl overflow-auto gap-y-5">
          {chatHistory.map(({ text, user, typing }, i) => (
            <div
              key={i}
              className={`items-end max-w-[70%] gap-x-2 flex flex-row ${
                user ? "self-end" : "self-start -ml-1 sm:ml-0"
              }`}
            >
              {!user && <div className="relative text-3xl bottom-1">🦙</div>}
              <p className={`px-3 py-2.5 bg-neutral-900 rounded-2xl`}>{text}</p>
              {user && <div className="relative text-2xl bottom-1">👤</div>}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form className="flex w-full max-w-lg" onSubmit={handleSubmit}>
          <input
            className="flex-grow w-full p-3 border border-none outline-none bg-neutral-800 placeholder:text-neutral-500 rounded-2xl"
            placeholder="Ask me anything!"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            enterKeyHint="send"
          />
          <button
            className="px-3 ml-2 rounded-2xl bg-emerald-800 text-emerald-50"
            disabled={loading}
          >
            Ask
          </button>
        </form>

        <footer className="text-sm text-neutral-500">
          Made by{" "}
          <a
            href="https://twitter.com/itsmnjn"
            target="_blank"
            className="underline"
          >
            @itsmnjn
          </a>{" "}
          with ❤️ plz don't abuse 😭
        </footer>
      </main>
    </>
  );
}
