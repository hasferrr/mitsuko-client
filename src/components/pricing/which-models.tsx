export default function WhichModels() {
  return (
    <div className="relative rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto mt-8 p-8 shadow-sm">
      <div id="which-models" className="absolute -top-24" />
      <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">
        Which Models Should I Use?
      </h3>
      <div className="flex flex-col gap-4">
        <p>Different LLMs (Large Language Models) have varying performance when it comes to different languages and tasks.</p>
        <p>
          For example, <span className="font-semibold">DeepSeek</span> models excel at English and Chinese (surprisingly good at Indonesian too) but may struggle with other languages,
          while some models like <span className="font-semibold">Gemini</span> and <span className="font-semibold">Claude</span> are multilingual and perform well across many languages.
        </p>
        <p>It's important to experiment with different models to find the best fit for your specific language and use case.</p>
        <div className="flex flex-col gap-2">
          <span>Tips:</span>
          <ul className="list-disc pl-4">
            <li>
              Start with cost-effective models (like {[
                'Gemini 2.0 Flash',
                'Gemini 1.5 Flash-8B',
                'GPT-4.1 mini',
              ].map((model, index) => (
                <span key={model} className="font-semibold">
                  {model}{index < 2 ? ' / ' : ''}
                </span>
              ))}).
            </li>
            <li>If the results meet your needs, you can continue using them.</li>
            <li>If you need higher quality results, you can gradually switch to more expensive models.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
