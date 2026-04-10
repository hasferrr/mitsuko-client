"use client"

import { useState } from "react"
import { Check, Globe, Target, ChevronRight, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

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
      <div className="dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xs flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 mb-2">
            Comparison
          </span>
          <h3 className="text-2xl font-semibold">
            Mitsuko vs. Generic Translation
          </h3>
        </div>

        {/* Legend */}
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-center gap-16">
            <div className="flex flex-col items-center">
              <div className="size-12 rounded-full bg-blue-500 flex items-center justify-center mb-2">
                <Target size={24} className="text-white" />
              </div>
              <span className="font-medium">Mitsuko</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="size-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-2">
                <Globe size={24} className="text-gray-500 dark:text-gray-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
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
                hoveredCategory === category.id && "bg-blue-50 dark:bg-blue-900/20"
              )}
              onMouseEnter={() => handleMouseEnter(category.id)}
            >
              <div className="flex justify-between items-center my-2">
                <span className="font-medium">
                  {category.label}
                </span>
                <div className="flex gap-4">
                  <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">{category.mitsukoLevel}</span>
                  <span
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-sm rounded-full"
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
      <div className="dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xs flex flex-col">
        {/* Header with category badge */}
        <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-2">
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
                        ? "bg-blue-500 w-6"
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
                <div className="size-2.5 rounded-full bg-blue-400"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {details.original.label}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 whitespace-pre-line">
                {hoveredCategory === "timestamp" && details.original.label === "Audio Segment" ? (
                  <div className="italic text-gray-600 dark:text-gray-400">
                    {details.original.content}
                  </div>
                ) : (
                  <p className="text-gray-800 dark:text-gray-200">{details.original.content}</p>
                )}
              </div>
            </div>
          )}

          {/* Render Mitsuko */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-2.5 rounded-full bg-emerald-400"></div>
              <div className="flex items-center gap-1.5">
                <Target size={14} className="text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {details.mitsuko.label}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 whitespace-pre-line">
              {Array.isArray(details.mitsuko.content) ? (
                <div className="space-y-1">
                  {details.mitsuko.content.map((item, index) => (
                    <p key={index} className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                      {item}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-800 dark:text-gray-200">{details.mitsuko.content}</p>
              )}
            </div>
          </div>

          {/* Render Generic */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="size-2.5 rounded-full bg-red-400"></div>
              <div className="flex items-center gap-1.5">
                <Globe size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {details.generic.label}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 whitespace-pre-line">
              {hoveredCategory === "timestamp" ? (
                <p className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                  {details.generic.content}
                </p>
              ) : (
                <p className="text-gray-800 dark:text-gray-200">
                  {details.generic.content}
                </p>
              )}
            </div>
          </div>

          {/* Render Advantage */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {details.advantage.title.replace(" Advantage:", "")}
              </h4>
            </div>
            {Array.isArray(details.advantage.description) ? (
              <ul className="space-y-2.5">
                {details.advantage.description.map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm">
                    <ArrowRight className="text-blue-400 mt-0.5 shrink-0" size={14} />
                    <p className="text-gray-600 dark:text-gray-400">{item}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {details.advantage.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer with navigation */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {exampleIndex + 1} of {currentCategoryExamples.length} example{currentCategoryExamples.length > 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-2">
            {hasMultipleExamples && (
              <button
                onClick={showNextExample}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Show next example"
              >
                <span>Example</span>
                <ChevronRight size={14} />
              </button>
            )}
            <button
              onClick={showNextCategory}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              aria-label="Show next category"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}