import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useGetCars } from "../car/useCar";
import config from "../../config/config";
import { authStorage } from "../../utils/authStorage";

const QUICK_ACTIONS = [
  { label: "Check my expiry", icon: "solar:calendar-bold" },
  { label: "How do I renew?", icon: "solar:refresh-bold" },
  { label: "Traffic fines in Nigeria", icon: "solar:danger-bold" },
  { label: "Car maintenance tips", icon: "solar:settings-bold" },
  { label: "Documents I need", icon: "solar:document-bold" },
  { label: "Driver's licence", icon: "solar:card-bold" },
];

function renderMessageText(text, isUser) {
  const segments = text.split(/\n+/);
  const elements = [];
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length === 0) return;
    elements.push(
      <div key={`list-${key}`} className="flex flex-col gap-1.5 mt-1">
        {listItems.map((item) => (
          <div key={item.n} className="flex items-start gap-2">
            <span
              className={`shrink-0 min-w-[18px] text-xs font-bold mt-0.5 ${
                isUser ? "text-white/70" : "text-[#2389E3]"
              }`}
            >
              {item.n}.
            </span>
            <span className="leading-snug">{item.text}</span>
          </div>
        ))}
      </div>
    );
    listItems = [];
  };

  segments.forEach((seg, i) => {
    const trimmed = seg.trim();
    if (!trimmed) return;
    const listMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (listMatch) {
      listItems.push({ n: listMatch[1], text: listMatch[2] });
    } else {
      flushList(i);
      elements.push(
        <p key={i} className={elements.length > 0 || listItems.length > 0 ? "mt-2" : ""}>
          {trimmed}
        </p>
      );
    }
  });
  flushList("end");

  return elements;
}

function Bubble({ msg, onAction }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EBB950]">
          <Icon icon="solar:stars-bold" className="text-white" fontSize={13} />
        </div>
      )}
      <div className={`flex max-w-[80%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "rounded-br-none bg-[#2389E3] text-white"
              : "rounded-bl-none bg-[#F0F4FA] text-[#05243F]"
          }`}
        >
          {renderMessageText(msg.text, isUser)}
        </div>
        {msg.action && onAction && (
          <button
            onClick={() => onAction(msg.action.route)}
            className="flex items-center gap-1.5 rounded-full bg-[#EBB950] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#d4a43e] hover:shadow-md active:scale-95"
          >
            {msg.action.label}
            <Icon icon="solar:arrow-right-bold" fontSize={11} />
          </button>
        )}
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
  const navigate = useNavigate();
  // Tracks whether the greeting has been shown — prevents resetting on re-open
  const hasGreeted = useRef(false);

  const { cars } = useGetCars();
  const userInfo = (() => {
    try { return JSON.parse(localStorage.getItem("userInfo")) || {}; }
    catch { return {}; }
  })();
  const userName = userInfo?.name?.split(" ")[0] || userInfo?.first_name || "";

  // Only greet once — subsequent opens restore the existing conversation
  useEffect(() => {
    if (!open || hasGreeted.current) return;
    hasGreeted.current = true;
    setMessages([
      {
        role: "mo",
        text: `Hey ${userName || "there"} 👋 I'm Mo, your Motoka AI. I know cars, Nigerian traffic rules, road fines, maintenance, and all your vehicle docs. What do you need?`,
        id: Date.now(),
      },
    ]);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    function handleOpenMo(event) {
      const prefill = event?.detail?.prefill;
      setOpen(true);
      if (typeof prefill === "string" && prefill.trim()) {
        setInput(prefill.trim());
      }
    }

    window.addEventListener("motoka:open-mo", handleOpenMo);
    return () => window.removeEventListener("motoka:open-mo", handleOpenMo);
  }, []);

  const handleAction = (route) => {
    navigate(route);
    setOpen(false);
  };

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
          userProfile: {
            email: userInfo?.email,
            phone: userInfo?.phone_number,
            memberSince: userInfo?.created_at,
          },
          cars: cars?.cars || [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);

      const reply = data.reply || "I'm not sure how to help with that.";
      const action = data.action || null;

      setHistory([...newHistory, { role: "assistant", content: reply }]);
      setMessages((prev) => [
        ...prev,
        { role: "mo", text: reply, action, id: Date.now() + 1 },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "mo", text: "Something went wrong, try again in a sec.", id: Date.now() + 1 },
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
    // Conversation is preserved — user can re-open and continue
  };

  const handleNewChat = () => {
    hasGreeted.current = false;
    setHistory([]);
    setMessages([]);
    // Trigger fresh greeting
    hasGreeted.current = true;
    setMessages([{
      role: "mo",
      text: `Starting fresh 👋 What can I help you with?`,
      id: Date.now(),
    }]);
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
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleNewChat}
                  title="New conversation"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                >
                  <Icon icon="solar:restart-bold" fontSize={13} />
                </button>
                <button
                  onClick={handleClose}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                >
                  <Icon icon="solar:close-bold" fontSize={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((msg) => (
                <Bubble key={msg.id} msg={msg} onAction={handleAction} />
              ))}

              {/* Welcome quick actions */}
              {showWelcome && (
                <div className="pl-9">
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
