"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, X } from "lucide-react"
import { aiChatAPI } from "@/lib/api"


interface Message {
  role: "user" | "assistant"
  content: string
}

function LoadingDots() {
  return (
    <div className="flex justify-start">
      <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted text-foreground">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm Amigo, your health companion. I'm here to support your wellness journey with gentle guidance and helpful insights. How are you feeling today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Check if we're on login/register pages
  const isAuthPage = pathname === "/" || pathname === "/onboarding"

  // Load chat memory from localStorage (user-specific)
  const loadChatMemory = () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return null
      const saved = localStorage.getItem(`chat_memory_${token}`)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  }

  // Save chat memory to localStorage (user-specific)
  const saveChatMemory = (messages: Message[]) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return
      localStorage.setItem(`chat_memory_${token}`, JSON.stringify(messages))
    } catch (error) {
      console.error("Failed to save chat memory:", error)
    }
  }

  // Clear chat memory (user-specific)
  const clearChatMemory = () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) return
      localStorage.removeItem(`chat_memory_${token}`)
    } catch (error) {
      console.error("Failed to clear chat memory:", error)
    }
  }

  // Clean up old chat memories (remove entries without current token)
  const cleanupOldMemories = () => {
    try {
      const currentToken = localStorage.getItem("access_token")
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith("chat_memory_") && key !== `chat_memory_${currentToken}`) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error("Failed to cleanup old memories:", error)
    }
  }

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token")
      const wasAuthenticated = isAuthenticated
      setIsAuthenticated(!!token)

      // If user just logged in, load saved chat memory
      if (token && !wasAuthenticated) {
        cleanupOldMemories() // Clean up old memories first
        const savedMessages = loadChatMemory()
        if (savedMessages) {
          setMessages(savedMessages)
        }
      }

      // If user just logged out, clear memory and reset to initial state
      if (!token && wasAuthenticated) {
        clearChatMemory()
        setMessages([
          {
            role: "assistant",
            content: "Hello! I'm Amigo, your health companion. I'm here to support your wellness journey with gentle guidance and helpful insights. How are you feeling today?",
          },
        ])
        setIsOpen(false)
      }
    }

    checkAuth()
    // Listen for storage changes (login/logout)
    window.addEventListener("storage", checkAuth)
    return () => window.removeEventListener("storage", checkAuth)
  }, [isAuthenticated])

  // Save messages whenever they change (only if authenticated)
  useEffect(() => {
    if (isAuthenticated && messages.length > 1) { // Don't save initial message
      saveChatMemory(messages)
    }
  }, [messages, isAuthenticated])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      const response = await aiChatAPI.sendMessage(input)
      const assistantMessage: Message = {
        role: "assistant",
        content: response.reply || "I'm here to help with your health questions."
      }
      setMessages([...newMessages, assistantMessage])
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again later."
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Button - Only show when authenticated and not on auth pages */}
      {isAuthenticated && !isOpen && !isAuthPage && (
        <div className="fixed bottom-6 right-6 z-[60]">
          <div className="relative">
            {/* Pulsing ring effect */}
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></div>
            <div className="absolute inset-1 rounded-full bg-primary/20 animate-pulse"></div>
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="relative h-12 w-12 rounded-full shadow-2xl shadow-primary/40 bg-gradient-to-br from-primary via-primary/95 to-primary/80 border-2 border-primary-foreground/20 hover:from-primary/90 hover:via-primary hover:to-primary/70 hover:scale-110 hover:shadow-primary/60 transition-all duration-300"
            >
              <Bot className="h-5 w-5 text-primary-foreground drop-shadow-lg" />
              <span className="sr-only">Open AI Chat</span>
            </Button>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isAuthenticated && isOpen && !isAuthPage && (
        <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] shadow-xl shadow-black/10 border border-violet-500/10 bg-card/95 backdrop-blur-sm flex flex-col z-[60]">
          <CardHeader className="pb-4 bg-card/50 border-b border-border/20">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Amigo</div>
                  <div className="text-sm text-muted-foreground/80 font-normal">Your health companion</div>
                </div>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted/50"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close chat</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea ref={scrollAreaRef} className="h-full px-4">
              <div className="space-y-4 py-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && <LoadingDots />}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t border-border/20 bg-card/30 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex w-full gap-2"
            >
              <Input
                placeholder="Ask about your health..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-background/50 border-border/30"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-primary/90 hover:bg-primary">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
