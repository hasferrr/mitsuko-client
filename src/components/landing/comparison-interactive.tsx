"use client"

import { useState } from "react"
import { Check, Globe, Target, ChevronRight, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Replicate type definitions or import them if shared
type ComparisonCategory = "context" | "cultural" | "timestamp" | "idiomatic" | "content"

interface ComparisonDetailText {
  original?: { label: string; content: string }
  mitsuko: { label: string; content: string | string[] }
  generic: { label: string; content: string }
  advantage: { title: string; description: string | string[] }
}

interface ComparisonCategoryData {
  id: ComparisonCategory;
  label: string;
  mitsukoLevel: string;
  mtlLevel: string;
}

interface ComparisonInteractiveProps {
  comparisonCategoriesData: ComparisonCategoryData[];
  comparisonDetailsTextData: Record<ComparisonCategory, ComparisonDetailText[]>;
}

export default function ComparisonInteractive({
  comparisonCategoriesData,
  comparisonDetailsTextData,
}: ComparisonInteractiveProps) {
  const [hoveredCategory, setHoveredCategory] = useState<ComparisonCategory>("context")
  const [exampleIndex, setExampleIndex] = useState(0)

  const currentCategoryExamples = comparisonDetailsTextData[hoveredCategory]
  const details = currentCategoryExamples[exampleIndex]
  const hasMultipleExamples = currentCategoryExamples.length > 1

  const showNextExample = () => {
    setExampleIndex((prevIndex) => (prevIndex + 1) % currentCategoryExamples.length)
  }

  const showNextCategory = () => {
    const currentCategoryIndex = comparisonCategoriesData.findIndex(c => c.id === hoveredCategory)
    const nextCategoryIndex = (currentCategoryIndex + 1) % comparisonCategoriesData.length
    const nextCategory = comparisonCategoriesData[nextCategoryIndex].id
    setHoveredCategory(nextCategory)
    setExampleIndex(0)
  }

  const handleMouseEnter = (category: ComparisonCategory) => {
    setHoveredCategory(category)
    setExampleIndex(0) // Reset example index when changing category
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Left Column - Comparison Table (Interactive) */}
      <div className="dark:bg-gray-900/20 border border-border rounded-lg shadow-xs flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-muted-foreground mb-2">
            Comparison
          </span>
          <h3 className="text-2xl font-semibold">
            Mitsuko vs. Generic Translation
          </h3>
        </div>

        {/* Legend */}
        <div className="p-6 pb-4 border-b border-border">
          <div className="flex justify-center gap-16">
            <div className="flex flex-col items-center">
              <div className="size-12 rounded-full bg-primary flex items-center justify-center mb-2">
                <Target size={24} className="text-primary-foreground" />
              </div>
              <span className="font-medium">Mitsuko</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="size-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-2">
                <Globe size={24} className="text-muted-foreground" />
              </div>
              <span className="text-muted-foreground font-medium">
                MTL
              </span>
            </div>
          </div>
        </div>

        {/* Comparison Rows - Interactive */}
        <div className="flex-1 p-4 overflow-auto">
          {comparisonCategoriesData.map((category) => (
            <div
              key={category.id}
              className={cn(
                "transition-colors duration-200 rounded-md p-4 cursor-pointer",
                hoveredCategory === category.id && "bg-primary/10"
              )}
              onMouseEnter={() => handleMouseEnter(category.id)}
            >
              <div className="flex justify-between items-center my-2">
                <span className="font-medium">
                  {category.label}
                </span>
                <div className="flex gap-4">
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">{category.mitsukoLevel}</span>
                  <span
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-muted-foreground text-sm rounded-full"
                  >
                    {category.mtlLevel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - See the Difference (Displays based on state) */}
      <div className="dark:bg-gray-900/20 border border-border rounded-lg shadow-xs flex flex-col">
        {/* Header with category badge */}
        <div className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/80 text-white/90 mb-2">
                {comparisonCategoriesData.find(c => c.id === hoveredCategory)?.label}
              </span>
              <h3 className="text-2xl font-semibold">
                See the Difference
              </h3>
            </div>
            {hasMultipleExamples && (
              <div className="flex items-center gap-1.5">
                {currentCategoryExamples.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setExampleIndex(index)}
                    className={cn(
                      "size-2 rounded-full transition-all",
                      index === exampleIndex
                        ? "bg-primary w-6"
                        : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                    )}
                    aria-label={`Go to example ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Example Content */}
        <div key={hoveredCategory + exampleIndex} className="flex-1 p-6 space-y-5 animate-fadeIn overflow-auto">
          {/* Render Original */}
          {details.original && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="size-2.5 rounded-full bg-primary/70"></div>
                <span className="text-sm text-muted-foreground">
                  {details.original.label}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 whitespace-pre-line">
                {hoveredCategory === "timestamp" && details.original.label === "Audio Segment" ? (
                  <div className="italic text-muted-foreground">
                    {details.original.content}
                  </div>
                ) : (
                  <p className="text-foreground">{details.original.content}</p>
                )}
              </div>
            </div>
          )}

          {/* Render Mitsuko */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-2.5 rounded-full bg-emerald-400"></div>
              <div className="flex items-center gap-1.5">
                <Target size={14} className="text-primary" />
                <span className="text-sm text-muted-foreground">
                  {details.mitsuko.label}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 whitespace-pre-line">
              {Array.isArray(details.mitsuko.content) ? (
                <div className="space-y-1">
                  {details.mitsuko.content.map((item, index) => (
                    <p key={index} className="text-foreground font-mono text-sm">
                      {item}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-foreground">{details.mitsuko.content}</p>
              )}
            </div>
          </div>

          {/* Render Generic */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-2.5 rounded-full bg-red-400"></div>
              <div className="flex items-center gap-1.5">
                <Globe size={14} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {details.generic.label}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 whitespace-pre-line">
              {hoveredCategory === "timestamp" ? (
                <p className="text-foreground font-mono text-sm">
                  {details.generic.content}
                </p>
              ) : (
                <p className="text-foreground">
                  {details.generic.content}
                </p>
              )}
            </div>
          </div>

          {/* Render Advantage */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-5 rounded-full bg-primary flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
              <h4 className="font-semibold text-foreground">
                {details.advantage.title.replace(" Advantage:", "")}
              </h4>
            </div>
            {Array.isArray(details.advantage.description) ? (
              <ul className="space-y-2.5">
                {details.advantage.description.map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm">
                    <ArrowRight className="text-primary/70 mt-0.5 shrink-0" size={14} />
                    <p className="text-muted-foreground">{item}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {details.advantage.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer with navigation */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {exampleIndex + 1} of {currentCategoryExamples.length} example{currentCategoryExamples.length > 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-2">
            {hasMultipleExamples && (
              <Button
                onClick={showNextExample}
                variant="secondary"
                size="sm"
                aria-label="Show next example"
              >
                Example
                <ChevronRight />
              </Button>
            )}
            <Button
              onClick={showNextCategory}
              size="sm"
              aria-label="Show next category"
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}