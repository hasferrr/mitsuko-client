import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// FAQ data structure
const faqData = [
  {
    question: "What is Mitsuko?",
    answer: "An AI-powered app for translating subtitles (SRT/ASS formats) and transcribing audio, considering the context of the content for accuracy.",
  },
  {
    question: "What file formats does Mitsuko support?",
    answer: [
      "Subtitles: SRT and ASS.",
      "Audio: WAV, MP3, AIFF, AAC, OGG, and FLAC."
    ],
  },
  {
    question: "How accurate is the AI translation?",
    answer: "High accuracy with context-aware AI that retains original meaning, idioms, and cultural references. It uses frontier AI models like DeepSeek, Gemini, Claude, and OpenAI.",
  },
  {
    question: "How does the context extraction feature work?",
    answer: [
      "It analyzes subtitles to track characters, settings, and relationships, creating reusable context documents. You can use this context document to inform the translation of the next episode.",
      "To use the context document, you need to create a context document for the first episode. Then, you can use the context document to inform the translation of the second episode."
    ],
  },
  {
    question: "How many languages does Mitsuko support?",
    answer: "100+ languages, including major global languages and regional dialects. Regularly updated. You can request new languages through Discord server.",
  },
  {
    question: "Can I edit the translations or transcriptions?",
    answer: "Yes. Includes an editing interface to refine results before exporting.",
  },
  {
    question: "Is there a limit to how much content I can process?",
    answer: "As long as credits are available, you can process as much content as you want. For free tiers, you can use free models available.",
  },
  {
    question: "Will Mitsuko add more features in the future?",
    answer: "Yes, we're continuously adding features and improving service quality through regular updates.",
  },
]

export default function FAQSection() {
  return (
    <section className="w-full py-16 bg-white dark:bg-black transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tighter text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="max-w-[900px] text-gray-600 dark:text-gray-400 md:text-base/relaxed lg:text-base/relaxed xl:text-base/relaxed">
              Find answers to common questions about Mitsuko and its features.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 dark:border-gray-800">
                <AccordionTrigger className="text-left text-base md:text-lg font-medium text-gray-900 dark:text-white hover:text-gray-900 dark:hover:text-white py-4">
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

