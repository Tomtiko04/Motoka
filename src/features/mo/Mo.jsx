import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useGetCars } from "../car/useCar";
import config from "../../config/config";
import { authStorage } from "../../utils/authStorage";

// ── Quick actions shown on open ───────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Check expiry date", icon: "solar:calendar-bold" },
  { label: "How do I renew?", icon: "solar:refresh-bold" },
  { label: "Add a new car", icon: "solar:add-circle-bold" },
  { label: "Driver's licence", icon: "solar:card-bold" },
];

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EBB950]">
          <Icon icon="solar:stars-bold" className="text-white" fontSize={14} />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-[#2389E3] text-white"
            : "rounded-bl-sm bg-[#F4F5FC] text-[#05243F]"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

// ── Main Mo component ─────────────────────────────────────────────────────────
export default function Mo() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]); // OpenAI-format message history
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const { cars } = useGetCars();
  const userName = (() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"))?.name?.split(" ")[0];
    } catch {
      return "";
    }
  })();

  // Greeting when Mo opens
  useEffect(() => {
    if (!open) return;
    setMessages([
      {
        role: "mo",
        text: `Hey ${userName || "there"} 👋, how can I help you today?`,
        id: Date.now(),
      },
    ]);
    setHistory([]);
  }, [open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || thinking) return;
    setInput("");

    const userMsg = { role: "user", text: content, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    const newHistory = [...history, { role: "user", content }];

    try {
      const token = authStorage.getToken();
      const res = await fetch(`${config.getApiBaseUrl()}/mo/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: newHistory,
          userName,
          cars: cars?.cars || [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("[Mo] backend error:", res.status, data);
        throw new Error(data.message || `Error ${res.status}`);
      }

      const reply = data.reply || "I'm not sure how to answer that.";
      setHistory([...newHistory, { role: "assistant", content: reply }]);
      setMessages((prev) => [
        ...prev,
        { role: "mo", text: reply, id: Date.now() + 1 },
      ]);
    } catch (err) {
      console.error("[Mo] error:", err?.message || err);
      setMessages((prev) => [
        ...prev,
        {
          role: "mo",
          text: "Sorry, I ran into an issue. Please try again.",
          id: Date.now() + 1,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMessages([]);
    setHistory([]);
  };

  const showQuickActions = messages.length <= 1 && !thinking;

  return (
    <>
      {/* ── Floating button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#EBB950] px-5 py-3 text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
          >
            <Icon icon="solar:stars-bold" fontSize={18} />
            <span className="text-sm font-semibold">Ask Mo</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 flex w-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            style={{ height: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#EBB950] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25">
                  <Icon icon="solar:stars-bold" className="text-white" fontSize={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Ask Mo</p>
                  <p className="text-xs text-white/75">Motoka AI Assistant</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
              >
                <Icon icon="solar:close-bold" fontSize={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((msg) => (
                <Bubble key={msg.id} msg={msg} />
              ))}

              {/* Quick action chips */}
              {showQuickActions && (
                <div className="flex flex-wrap gap-2 pl-9">
                  {QUICK_ACTIONS.map((a) => (
                    <button
                      key={a.label}
                      onClick={() => send(a.label)}
                      className="flex items-center gap-1.5 rounded-full border border-[#E1E5EE] bg-white px-3 py-1.5 text-xs font-medium text-[#05243F] transition-colors hover:bg-[#F4F5FC]"
                    >
                      <Icon icon={a.icon} fontSize={12} className="text-[#2389E3]" />
                      {a.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Thinking indicator */}
              {thinking && (
                <div className="flex items-end gap-2">
                  <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EBB950]">
                    <Icon icon="solar:stars-bold" className="text-white" fontSize={14} />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[#F4F5FC] px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#05243F]/40 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#05243F]/40 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#05243F]/40 [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#F4F5FC] px-3 py-3">
              <div className="flex items-center gap-2 overflow-hidden rounded-full bg-[#F4F5FC] px-4 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type your question..."
                  disabled={thinking}
                  className="flex-1 bg-transparent text-sm text-[#05243F] outline-none placeholder:text-[#05243F]/40 disabled:opacity-50"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || thinking}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EBB950] text-white transition-colors hover:bg-[#d4a43e] disabled:opacity-40"
                >
                  <Icon icon="solar:arrow-up-bold" fontSize={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
