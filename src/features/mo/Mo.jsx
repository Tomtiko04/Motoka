import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useGetCars } from "../car/useCar";
import config from "../../config/config";
import { authStorage } from "../../utils/authStorage";

const QUICK_ACTIONS = [
  { label: "Check my expiry", icon: "solar:calendar-bold" },
  { label: "How do I renew?", icon: "solar:refresh-bold" },
  { label: "Renewal prices", icon: "solar:tag-price-bold" },
  { label: "Driver's licence", icon: "solar:card-bold" },
];

const PRICE_PREVIEWS = [
  { name: "Vehicle Licence", price: "₦5,000" },
  { name: "Insurance", price: "₦15,000" },
  { name: "Road Worthiness + Referral", price: "₦11,500" },
  { name: "Proof of Ownership", price: "₦3,000" },
  { name: "Hackney Permit", price: "₦4,000" },
];

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EBB950]">
          <Icon icon="solar:stars-bold" className="text-white" fontSize={13} />
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-none bg-[#2389E3] text-white"
            : "rounded-bl-none bg-[#F0F4FA] text-[#05243F]"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

export default function Mo() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
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

  useEffect(() => {
    if (!open) return;
    setMessages([
      {
        role: "mo",
        text: `Hi ${userName || "there"} 👋 I'm Mo, your Motoka assistant. What can I help you with?`,
        id: Date.now(),
      },
    ]);
    setHistory([]);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

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

      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);

      const reply = data.reply || "I'm not sure how to answer that.";
      setHistory([...newHistory, { role: "assistant", content: reply }]);
      setMessages((prev) => [
        ...prev,
        { role: "mo", text: reply, id: Date.now() + 1 },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "mo", text: "Sorry, something went wrong. Please try again.", id: Date.now() + 1 },
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

  const showWelcome = messages.length <= 1 && !thinking;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#EBB950] px-5 py-3 text-white shadow-lg transition-all hover:scale-105 hover:bg-[#d4a43e] hover:shadow-xl"
          >
            <Icon icon="solar:stars-bold" fontSize={18} />
            <span className="text-sm font-semibold">Ask Mo</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 flex w-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            style={{ height: "540px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-[#EBB950] px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25">
                  <Icon icon="solar:stars-bold" className="text-white" fontSize={17} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">Mo</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                    <p className="text-xs text-white/80">Motoka AI · Online</p>
                  </div>
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
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((msg) => (
                <Bubble key={msg.id} msg={msg} />
              ))}

              {/* Welcome state */}
              {showWelcome && (
                <div className="pl-9 space-y-3">
                  {/* Price snapshot */}
                  <div className="overflow-hidden rounded-xl border border-[#E8EDF5] bg-white">
                    <div className="flex items-center gap-2 border-b border-[#E8EDF5] bg-[#FFFBF0] px-3 py-2">
                      <Icon icon="solar:tag-price-bold" fontSize={13} className="text-[#EBB950]" />
                      <p className="text-xs font-semibold text-[#05243F]">Renewal Prices</p>
                    </div>
                    <div className="divide-y divide-[#F4F5FC]">
                      {PRICE_PREVIEWS.map((p, i) => (
                        <div key={p.name} className="flex items-center gap-3 px-3 py-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EBB950]/15 text-[10px] font-bold text-[#EBB950]">
                            {i + 1}
                          </span>
                          <span className="flex-1 text-xs text-[#05243F]/80">{p.name}</span>
                          <span className="text-xs font-semibold text-[#05243F]">{p.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((a) => (
                      <button
                        key={a.label}
                        onClick={() => send(a.label)}
                        className="flex items-center gap-1.5 rounded-full border border-[#E1E5EE] bg-white px-3 py-1.5 text-xs font-medium text-[#05243F] transition-colors hover:border-[#2389E3]/40 hover:bg-[#EEF5FD] hover:text-[#2389E3]"
                      >
                        <Icon icon={a.icon} fontSize={11} className="text-[#2389E3]" />
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Thinking indicator */}
              {thinking && (
                <div className="flex items-end gap-2">
                  <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EBB950]">
                    <Icon icon="solar:stars-bold" className="text-white" fontSize={13} />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-none bg-[#F0F4FA] px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#05243F]/30 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#05243F]/30 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#05243F]/30 [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#F0F4FA] px-3 py-3">
              <div className="flex items-center gap-2 overflow-hidden rounded-full border border-[#E8EDF5] bg-[#F8FAFD] px-4 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask me anything…"
                  disabled={thinking}
                  className="flex-1 bg-transparent text-sm text-[#05243F] outline-none placeholder:text-[#9CA3AF] disabled:opacity-50"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || thinking}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EBB950] text-white transition-all hover:bg-[#d4a43e] disabled:opacity-30"
                >
                  <Icon icon="solar:arrow-up-bold" fontSize={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
