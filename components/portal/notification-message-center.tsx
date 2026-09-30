"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { usePortal } from "@/lib/portal-store";
import { Application, PortalMessage, PortalNotification } from "@/types/portal";
import {
  MessageSquare,
  Bell,
  Send,
  X,
  Check,
  CheckCheck,
  Clock,
  ShieldCheck,
  User,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight
} from "lucide-react";

export const NotificationMessageCenter: React.FC = () => {
  const {
    isMessagesOpen,
    setIsMessagesOpen,
    activeMessageAppId,
    setActiveMessageAppId,
    messages,
    sendMessage,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    applications,
    user,
    theme,
    setCurrentView
  } = usePortal();

  const [activeTab, setActiveTab] = useState<"chat" | "notifications">("chat");
  const [replyInput, setReplyInput] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string>("all");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync activeMessageAppId if passed from outside
  useEffect(() => {
    if (activeMessageAppId) {
      setSelectedAppId(activeMessageAppId);
      setActiveTab("chat");
    }
  }, [activeMessageAppId]);

  // Customer or Owner context
  const isOwnerOrAdmin = user?.role === "owner" || user?.role === "superadmin";

  // Filter applications for current user
  const relevantApps = useMemo(() => {
    if (isOwnerOrAdmin) return applications;
    if (!user) return [];
    return applications.filter(
      (a) =>
        a.customerId === user.id ||
        (user.email && a.customerEmail?.toLowerCase() === user.email.toLowerCase()) ||
        (user.phone && a.customerPhone?.replace(/\D/g, "") === user.phone.replace(/\D/g, ""))
    );
  }, [applications, user, isOwnerOrAdmin]);

  // Selected application object
  const currentApp = useMemo(() => {
    if (selectedAppId === "all") return null;
    return relevantApps.find((a) => a.id === selectedAppId) || null;
  }, [selectedAppId, relevantApps]);

  // Filter messages for current user and selected application
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Scoped to current user if customer
      if (!isOwnerOrAdmin && user) {
        const isParticipant =
          msg.senderId === user.id ||
          msg.recipientId === user.id ||
          (user.email && (msg.senderId === user.email || msg.recipientId === user.email)) ||
          relevantApps.some((a) => a.id === msg.applicationId);
        if (!isParticipant) return false;
      }
      // If specific application selected
      if (selectedAppId !== "all" && msg.applicationId) {
        if (msg.applicationId !== selectedAppId) return false;
      }
      return true;
    });
  }, [messages, selectedAppId, isOwnerOrAdmin, user, relevantApps]);

  // Filter notifications for current user
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (isOwnerOrAdmin) {
        return (
          notif.userId === "owner-1" ||
          notif.userId === "superadmin-1" ||
          notif.userId === user?.id
        );
      }
      if (!user) return false;
      const notifUser = (notif.userId || "").toLowerCase().trim();
      const userEmail = (user.email || "").toLowerCase().trim();
      const userPhone = (user.phone || "").replace(/\D/g, "");
      return (
        notif.userId === user.id ||
        (userEmail && notifUser === userEmail) ||
        (userPhone && notif.userId?.replace(/\D/g, "") === userPhone)
      );
    });
  }, [notifications, user, isOwnerOrAdmin]);

  const unreadNotifsCount = useMemo(() => {
    return filteredNotifications.filter((n) => !n.read).length;
  }, [filteredNotifications]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredMessages, activeTab, selectedAppId]);

  if (!isMessagesOpen) return null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    const targetAppId = selectedAppId !== "all" ? selectedAppId : relevantApps[0]?.id;
    const recipientId = isOwnerOrAdmin
      ? currentApp?.customerId || "usr-cust-1"
      : currentApp?.assignedOwnerId || "owner-1";

    sendMessage(replyInput.trim(), targetAppId, recipientId);
    setReplyInput("");
  };

  const handleQuickChipClick = (text: string) => {
    setReplyInput(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white ${
          theme === "light"
            ? "bg-white border-slate-200 shadow-slate-300/80"
            : "bg-[#11131c] border-slate-800 shadow-black/80"
        }`}
      >
        {/* Top Dialog Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-gradient-to-r from-[#FFF8F0] via-white to-[#F0FDF4] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#000080] to-[#1E3A8A] text-white flex items-center justify-center shadow-md shadow-[#000080]/20 shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#000080] dark:text-blue-300">
                  Notification &amp; Citizen Message Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#138808] border border-[#C8E6C9] hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-pulse" />
                  Live Channel
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct two-way interactive updates between Customer and Processing Officer (Owner)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsMessagesOpen(false);
              setActiveMessageAppId(null);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close Message Center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Controls */}
        <div className="px-4 sm:px-6 pt-3 pb-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "chat"
                  ? "bg-[#000080] text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Application Chats</span>
              {filteredMessages.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === "chat"
                      ? "bg-white/20 text-white"
                      : "bg-[#E8EEF5] text-[#000080] dark:bg-blue-950 dark:text-blue-300"
                  }`}
                >
                  {filteredMessages.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-[#FF9933] text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Statutory Notifications</span>
              {unreadNotifsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white text-[#E65100]">
                  {unreadNotifsCount} New
                </span>
              )}
            </button>
          </div>

          {activeTab === "notifications" && unreadNotifsCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="text-[11px] font-bold text-[#000080] dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Tab 1: Live Chat & Inquiries */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col min-h-[360px] max-h-[560px] overflow-hidden">
            {/* Application Scope Selector Filter */}
            <div className="px-4 sm:px-6 py-2.5 bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                Filter by Task:
              </span>

              <button
                type="button"
                onClick={() => setSelectedAppId("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  selectedAppId === "all"
                    ? "bg-[#000080] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                All Threads
              </button>

              {relevantApps.map((app) => {
                const isSelected = selectedAppId === app.id;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedAppId(app.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#FF9933] text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <span className="font-mono text-[10px]">{app.id}</span>
                    <span className="truncate max-w-[120px]">{app.serviceName}</span>
                  </button>
                );
              })}
            </div>

            {/* Conversation Active Banner */}
            {currentApp && (
              <div className="px-4 sm:px-6 py-2 bg-[#E8EEF5]/60 dark:bg-slate-950/80 border-b border-[#BBDEFB]/50 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#000080] dark:text-blue-300">
                    Application: {currentApp.serviceName} ({currentApp.id})
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#138808]">
                    {currentApp.status}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Officer: MANDAN ROHITH KUMAR
                </span>
              </div>
            )}

            {/* Live Message History Scroll View */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/30">
              {filteredMessages.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8EEF5] dark:bg-slate-800 text-[#000080] dark:text-blue-300 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    No Messages in this Thread Yet
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Send a direct inquiry, request document updates, or reply to the portal owner below.
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isFromOwner = msg.senderRole === "owner" || msg.senderRole === "superadmin";
                  const isCurrentSender =
                    (isOwnerOrAdmin && isFromOwner) || (!isOwnerOrAdmin && !isFromOwner);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCurrentSender ? "items-end" : "items-start"} space-y-1 animate-in fade-in duration-150`}
                    >
                      {/* Sender Metadata */}
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {isFromOwner ? (
                            <span className="text-[#000080] dark:text-blue-300 font-extrabold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-[#FF9933]" />
                              MANDAN ROHITH KUMAR (Owner)
                            </span>
                          ) : (
                            <span className="text-[#138808] dark:text-emerald-400 font-bold flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {msg.senderName} (Applicant)
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {msg.timestamp}
                        </span>
                        {msg.applicationId && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {msg.applicationId}
                          </span>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isFromOwner
                            ? "bg-gradient-to-br from-[#000080] to-[#0A1931] text-white rounded-tl-sm"
                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-tr-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-4 sm:px-6 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 shrink-0">Quick Reply:</span>
              {!isOwnerOrAdmin ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickChipClick("I have uploaded the requested documents.")}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#138808] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Uploaded documents
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickChipClick("Thank you sir, please proceed with processing.")}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-[#E8EEF5] hover:bg-[#BBDEFB] text-[#000080] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Please proceed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickChipClick("When can I expect the final certificate?")}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#E65100] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Estimated delivery time?
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickChipClick("Documents verified, proceeding with government submission.")}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#138808] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Docs verified
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickChipClick("Please re-upload a clear color scan of your Aadhaar card.")}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#E65100] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Request clearer copy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickChipClick("Your application is submitted. Department ack generated.")}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-[#E8EEF5] hover:bg-[#BBDEFB] text-[#000080] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Dept ack ready
                  </button>
                </>
              )}
            </div>

            {/* Two-Way Real-Time Reply Form */}
            <form
              onSubmit={handleSendReply}
              className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder={
                  isOwnerOrAdmin
                    ? `Send message to customer regarding ${currentApp?.serviceName || "application"}...`
                    : "Type your reply or question to the owner..."
                }
                className="flex-1 text-xs px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FF9933]"
              />

              <button
                type="submit"
                disabled={!replyInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FF6F00] hover:from-[#FF6F00] hover:to-[#E65100] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#FF9933]/25 cursor-pointer transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: System Notifications */}
        {activeTab === "notifications" && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 max-h-[560px] bg-slate-50/40 dark:bg-slate-950/30">
            {filteredNotifications.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] dark:bg-slate-800 text-[#138808] flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  All Caught Up! No New Notifications
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Statutory updates, payment confirmations, and task assignment alerts will appear here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read) markNotificationRead(notif.id);
                      if (notif.applicationId) {
                        setSelectedAppId(notif.applicationId);
                        setActiveTab("chat");
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all duration-150 flex items-start justify-between gap-3 cursor-pointer ${
                      notif.read
                        ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80"
                        : "bg-white dark:bg-slate-900 border-[#FF9933] dark:border-[#FF9933] ring-1 ring-[#FF9933]/20 shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          notif.type === "success"
                            ? "bg-[#E8F5E9] text-[#138808]"
                            : notif.type === "warning"
                            ? "bg-[#FFF3E0] text-[#E65100]"
                            : "bg-[#E8EEF5] text-[#000080] dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        {notif.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : notif.type === "warning" ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-[#FF9933] animate-pulse" />
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 font-mono">
                          <span>{notif.timestamp}</span>
                          {notif.applicationId && (
                            <span className="text-[#000080] dark:text-blue-300 font-bold flex items-center gap-0.5">
                              <span>App #{notif.applicationId}</span>
                              <ChevronRight className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => markNotificationRead(notif.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#138808] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Dialog Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#138808]" />
            <span>Encrypted Citizen Vault Communications</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMessagesOpen(false);
                setActiveMessageAppId(null);
              }}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
