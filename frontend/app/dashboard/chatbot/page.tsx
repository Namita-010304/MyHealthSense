"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User } from "lucide-react"
import { useState } from "react"
import { aiChatAPI } from "@/lib/api"

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI Health Companion. How can I help you today? You can ask me about your health metrics, get lifestyle advice, or discuss any health concerns.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: "user", content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await aiChatAPI.sendMessage(input)
      const assistantMessage = {
        role: "assistant",
        content: response.reply || "I'm here to help with your health questions."
      }
      setMessages([...newMessages, assistantMessage])
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again later."
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-border/50 h-[calc(100vh-10rem)]">
          <CardHeader>
            <CardTitle>AI Health Assistant</CardTitle>
            <CardDescription>
              Ask questions about your health, get personalized advice, and track your wellness journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-[calc(100%-6rem)]">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback
                        className={message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"}
                      >
                        {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Ask me anything about your health..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
              />
              <Button onClick={handleSend} size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
