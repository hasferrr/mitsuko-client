"use client"

import { useState } from "react"
import { Check, Globe, Target, ChevronRight } from "lucide-react"
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

  const handleMouseEnter = (category: ComparisonCategory) => {
    setHoveredCategory(category)
    setExampleIndex(0) // Reset example index when changing category
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Left Column - Comparison Table (Interactive) */}
      <div
        className="dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-8 shadow-sm"
      >
        <h3 className="text-2xl font-semibold mb-6 ">
          Mitsuko vs. Generic Translation
        </h3>

        <div className="flex justify-center gap-16 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-2">
              <Target size={24} className="text-white" />
            </div>
            <span className="font-medium">Mitsuko</span>
          </div>

          <div className="flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-2"
            >
              <Globe size={24} className="text-gray-500 dark:text-gray-400" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              MTL
            </span>
          </div>
        </div>

        {/* Comparison Rows - Interactive */}
        <div>
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
      <div
        className="dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-8 shadow-sm"
      >
        {/* Heading with Next Example Button */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">
            See the Difference
          </h3>
          {hasMultipleExamples && (
            <button
              onClick={showNextExample}
              className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              aria-label="Show next example"
            >
              Next Example <ChevronRight size={16} />
            </button>
          )}
        </div>


        {/* Example Content (Renders based on hoveredCategory and exampleIndex) */}
        {/* Added a key prop to force re-render on category change for animation */}
        <div key={hoveredCategory + exampleIndex} className="space-y-6 animate-fadeIn">
          {/* Render Original */}
          {details.original && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {details.original.label}
                </span>
              </div>
              <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-900 whitespace-pre-line">
                {/* Special handling for timestamp visual placeholder */}
                {hoveredCategory === "timestamp" && details.original.label === "Audio Segment" ? (
                  <div className="italic text-gray-600 dark:text-gray-400">
                    {details.original.content} {/* Display placeholder text */}
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
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="flex items-center gap-1">
                <Target size={16} className="text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {details.mitsuko.label}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-900 whitespace-pre-line">
              {Array.isArray(details.mitsuko.content) ? (
                // Handle array content (e.g., timestamp list)
                <div className="space-y-1">
                  {details.mitsuko.content.map((item, index) => (
                    <p key={index} className="text-gray-800 dark:text-gray-200 font-mono text-sm"> {/* Use mono for timestamps */}
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
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="flex items-center gap-1">
                <Globe size={16} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {details.generic.label}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-900 whitespace-pre-line">
              {/* Special handling for timestamp generic content */}
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
          <div className="mt-4">
            <h4 className="text-xl font-bold mb-4">
              {details.advantage.title}
            </h4>
            {Array.isArray(details.advantage.description) ? (
              <ul className="space-y-4">
                {details.advantage.description.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="text-blue-400 mt-1 flex-shrink-0" size={18} />
                    <p className="text-gray-700 dark:text-gray-300">{item}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {details.advantage.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}