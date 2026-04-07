"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CHAT_API, USER_API } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

type Contact = {
  _id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
};

type Conversation = {
  _id: string;
  otherParticipantId: string;
  unreadCount: number;
};

type Message = {
  _id?: string;
  senderId: string;
  senderRole: string;
  text: string;
  createdAt: string;
};

type DashboardChatPanelProps = {
  title: string;
  description: string;
  className?: string;
  emptyStateMessage?: string;
};

export function DashboardChatPanel({
  title,
  description,
  className = "",
  emptyStateMessage = "Select a conversation to start chatting."
}: DashboardChatPanelProps) {
  const currentUser = getSessionUser();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const selectedContact = useMemo(
    () => contacts.find((contact) => contact._id === selectedContactId) || null,
    [contacts, selectedContactId]
  );

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    void loadChatData();
  }, [refreshTick]);

  useEffect(() => {
    if (!selectedContactId) {
      return;
    }

    void loadMessages(selectedContactId);
  }, [selectedContactId]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const interval = window.setInterval(() => {
      setRefreshTick((value) => value + 1);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  const loadChatData = async () => {
    try {
      const [contactsRes, conversationsRes] = await Promise.all([
        USER_API.get("/chat/contacts"),
        CHAT_API.get("/conversations")
      ]);

      const fetchedContacts = contactsRes.data.users || [];
      const fetchedConversations = conversationsRes.data.conversations || [];

      setContacts(fetchedContacts);
      setConversations(fetchedConversations);

      if (
        selectedContactId &&
        fetchedContacts.some((contact: Contact) => contact._id === selectedContactId)
      ) {
        return;
      }

      if (fetchedConversations.length > 0) {
        setSelectedContactId(fetchedConversations[0].otherParticipantId);
      } else if (fetchedContacts.length > 0) {
        setSelectedContactId(fetchedContacts[0]._id);
      }
    } catch (error) {
      console.error("Failed to load dashboard chat", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (contactId: string) => {
    try {
      const res = await CHAT_API.get(`/messages/${contactId}`);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error("Failed to load dashboard messages", error);
    }
  };

  const sendMessage = async () => {
    if (!selectedContact || !draft.trim()) {
      return;
    }

    try {
      setSending(true);
      await CHAT_API.post("/send", {
        receiverId: selectedContact._id,
        receiverRole: selectedContact.role,
        message: draft
      });

      setDraft("");
      await Promise.all([loadMessages(selectedContact._id), loadChatData()]);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading chat...</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contacts available yet.</p>
              ) : (
                contacts.map((contact) => {
                  const conversation = conversations.find(
                    (item) => item.otherParticipantId === contact._id
                  );
                  const isUnread = Boolean(conversation?.unreadCount);

                  return (
                    <button
                      key={contact._id}
                      type="button"
                      onClick={() => setSelectedContactId(contact._id)}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition ${
                        selectedContactId === contact._id
                          ? "border-primary bg-primary/10"
                          : isUnread
                            ? "border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50"
                            : "border-border hover:bg-muted"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {contact.role}
                        </p>
                      </div>
                      {isUnread ? (
                        <span className="rounded-full bg-primary px-2 py-1 text-xs text-white">
                          {conversation?.unreadCount}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex min-h-[420px] flex-col rounded-xl border border-border bg-muted/20 p-4">
              <div className="mb-4 flex-1 space-y-3 overflow-y-auto">
                {selectedContact ? (
                  messages.length > 0 ? (
                    messages.map((message, index) => {
                      const isMine = message.senderId === currentUser?._id;

                      return (
                        <div
                          key={`${message.createdAt}-${index}`}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                              isMine
                                ? "bg-primary text-primary-foreground"
                                : "bg-white text-foreground"
                            }`}
                          >
                            <p>{message.text}</p>
                            <p
                              className={`mt-2 text-[11px] ${
                                isMine ? "text-primary-foreground/80" : "text-muted-foreground"
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Start the conversation with {selectedContact.name}.
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {emptyStateMessage}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Input
                  placeholder="Type your message..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  disabled={!selectedContact || sending}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!selectedContact || sending || !draft.trim()}
                >
                  {sending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
