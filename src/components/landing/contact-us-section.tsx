"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Send } from "lucide-react"
import { DISCORD_LINK } from "@/constants/external-links"
import { useEmailLink } from "@/hooks/use-email-link"

export default function ContactUsSection() {
  const { emailHref, eventHandlers } = useEmailLink()

  return (
    <section id="contact" className="pt-12 pb-24 px-4 bg-white dark:bg-black transition-colors">
      <Card className="max-w-3xl mx-auto p-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Have questions about Mitsuko or need assistance? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              {...eventHandlers}
              asChild
            >
              <a href={emailHref} className="text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" /> Email Us
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer">
                <Send className="mr-2 h-4 w-4" /> Join our Discord
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}