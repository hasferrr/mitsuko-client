"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// FAQ data structure
const faqData = [
  {
    question: "What is Mitsuko?",
    answer: "An AI-powered app for translating subtitles and transcribing audio, considering the context of the content for accuracy.",
  },
  {
    question: "What file formats does Mitsuko support?",
    answer: [
      "Subtitles: SRT, ASS, and VTT.",
      "Audio: WAV, MP3, AIFF, AAC, OGG, and FLAC."
    ],
  },
  {
    question: "How accurate is the AI translation?",
    answer: [
      "High accuracy with context-aware AI that retains and adapt original meaning, idioms, and cultural references. It uses frontier LLMs (Large Language Models) like Gemini, Claude, Grok, and OpenAI.",
      "To achieve the highest accuracy, you can provide context to the AI to inform the translation.",
    ],
  },
  {
    question: "How does the context extraction feature work?",
    answer: [
      "It analyzes subtitles to track characters, settings, and relationships, creating reusable context documents. You can use this context document to inform the translation.",
      "To use this feature, you need to extract context from the first episode. Then, you can use this context document to inform the translation of the second episode.",
      "You can also use this feature by extracting context to inform the translation of the same episode.",
    ],
  },
  {
    question: "How many languages does Mitsuko support?",
    answer: "100+ languages, including major global languages and regional dialects. You can request new languages through Discord server.",
  },
  {
    question: "Is there a limit to how much content I can process?",
    answer: "As long as credits are available, you can process as much content as you want. If you have no credits, you can use the limited free models available.",
  },
  {
    question: "What is the refund policy?",
    answer: "We currently do not offer refunds for purchased credits and plans. However, this might change in the future. Contact us if you have any questions.",
  },
  {
    question: "Will Mitsuko add more features in the future?",
    answer: "Yes, we're continuously adding features and improving service quality through regular updates.",
  },
]

export default function FAQSection() {
  return (
    <section className="w-full py-16 transition-colors">
      <div className="relative max-w-6xl mx-auto px-4">
        <div id="faq" className="absolute -top-24" />
        <div
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="space-y-2">
            <h2 className="text-4xl font-semibold tracking-tighter">
              Frequently Asked Questions
            </h2>
            <p className="max-w-[900px] text-gray-600 dark:text-gray-400 md:text-base/relaxed lg:text-base/relaxed xl:text-base/relaxed">
              Find answers to common questions about Mitsuko and its features.
            </p>
          </div>
        </div>
        <div
          className="mx-auto max-w-3xl mt-12"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 dark:border-gray-800">
                <AccordionTrigger className="text-left text-base md:text-lg font-medium hover:text-gray-900 dark:hover:text-white py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-1" >
                  {Array.isArray(faq.answer) ? (
                    faq.answer.map((line, i) => (
                      <p key={i} className="mb-2">
                        {line}
                      </p>
                    ))
                  ) : (
                    <p className="mb-2">{faq.answer}</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

