'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send, User, Sparkles } from 'lucide-react'

export default function AssistantPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    {
      role: 'ai',
      text: 'Hello, Doctor. I am your SmartDeFi Finance Assistant. Ask me anything about your clinic\'s revenue, pending payments, or top treatments.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSend() {
    if (!input.trim()) return

    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch response')
      }

      setMessages(prev => [...prev, { role: 'ai', text: data.answer }])
    } catch (e: any) {
      console.error(e)
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${e.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center">
          <Sparkles className="mr-2 h-6 w-6 text-primary" />
          AI Finance Assistant
        </h2>
      </div>

      <Card className="border-border shadow-sm rounded-xl flex flex-col h-[650px]">
        <CardHeader className="bg-muted/30 pb-4 border-b border-border shadow-sm z-10">
          <CardTitle className="text-lg">Gemini Chat</CardTitle>
          <CardDescription>Ask natural language questions about your database.</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary ml-3' : 'bg-secondary mr-3'}`}>
                  {msg.role === 'user' ? <User className="h-5 w-5 text-primary-foreground" /> : <Bot className="h-5 w-5 text-foreground" />}
                </div>
                <div className={`rounded-xl p-4 text-sm whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border border-border text-card-foreground rounded-tl-none'}`}>
                  {msg.role === 'ai' ? (
                     <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  ) : (
                     msg.text
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary mr-3 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-foreground" />
                </div>
                <div className="rounded-xl p-4 text-sm bg-card border border-border text-muted-foreground rounded-tl-none flex items-center shadow-sm">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t border-border bg-card">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='e.g., "How much did I earn this month?"'
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()} className="bg-primary hover:bg-primary/90 text-white">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
