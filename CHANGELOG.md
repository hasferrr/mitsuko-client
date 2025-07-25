# Changelog

<!--
All notable changes to this project will be documented in this file.

If you want to update the changelog, please use the same style. The intent is for users to get rid of the technical details and focus on the features.
-->

🚀 **We're just getting started!** 🌟

*Your AI-powered subtitle translation companion*

---

## 2025

### July 25

- 🚀 **Introducing Batch Translation:** Translate multiple subtitle files at once! Drag-and-drop your files, reorder them, and manage the entire process with a powerful new queue system.
- ✨ **Enhanced Batch Workflow:** Take full control of your batch translations:
    - **Flexible Controls:** Adjust concurrent jobs, stop all translations at once, or continue partially completed batches.
    - **Easy File Management:** Download individual files or entire projects as a ZIP archive.
    - **Instant Previews:** Review translated subtitles in a new preview dialog before finalizing.
- 🐛 **Performance & Reliability:** Made the batch translator more robust with several bug fixes, improved performance by optimizing database writes, and corrected an issue with subtitle mapping to ensure translation accuracy.
- 🌐 **Website & Landing Page:** We've refreshed our landing page with a new layout and text, added custom error pages for a better browsing experience, and polished various UI elements across the application.

### July 22

- 🤖 **Model Updates:** We've added new Mistral models (Mistral Small 3, Mistral Medium 3, and Mistral Nemo) and cleaned up the model list by removing older Llama models to keep your choices relevant and up-to-date.

### July 20

- ✨ **VTT Subtitle Support:** You can now work with VTT subtitle files, expanding the range of supported formats.
- 🐛 **Improved Subtitle Parsing:** We've made our ASS file parser more flexible to better handle different file variations.

### July 19

- ✨ **Enhanced Project Management:** We've made it easier to manage your projects! You can now drag-and-drop to reorder them, and a new dropdown menu lets you export or delete projects with a single click.
- ⚙️ **Better Navigation:** Added a "Back" button inside projects to make navigating back to your project list more intuitive.

### July 12

- ✨ **Share & Discover in the Public Library:** Introducing the Public Library! You can now publish your own custom instructions to share with the community. You can also browse and import instructions created by other users to enhance your workflow.
- 🛠️ **Library Enhancements:** We've polished the library experience with a more compact design, a new refresh button, and the ability to filter the public library to see only your own published work. You can also now delete instructions you've shared.

### July 11

- ✨ **Custom Instruction Library:** We've added a brand new "My Library" section where you can easily create, edit, and organize your custom instructions! This makes it simpler to reuse your favorite prompts across projects without starting from scratch every time.
- 📥 **Import & Export Custom Instructions:** Now you can import custom instructions from JSON files and export them selectively or in bulk. It's perfect for backing up your work, sharing with others, or transferring between devices – we've even added smart handling for any duplicates during import.
- 🔍 **Search Your Library:** Quickly find the custom instructions you need with our new search feature, helping you stay organized as your library grows.
- 🛠️ **Polished User Interface:** We've freshened up the app with updated icons, smoother navigation, and refined layouts to make everything feel more intuitive and modern.

### July 10

- ✨ **Instant Subtitle Preview:** Your translations now appear as fully-formatted subtitles in real-time! Our new viewer gives you an instant look at the final result as the AI works, making the process faster and more transparent.
- 🧠 **New in AI Models:** Added support for Grok 4 and remove some deprecated models.
- 🐛 **Project List Fix:** Reordering items in your project list now updates the view correctly.
- ⚙️ **Internal Improvements:** We've updated some core components and expanded our internal documentation to keep things running smoothly and help us build new features faster.

### July 8

- 📤 **Export Single Projects:** You can now back up and export a single project instead of your entire workspace, making it easier to manage your data.
- ✨ **Smoother Imports:** When you import a backup and choose to replace your existing data, you'll now be automatically redirected to your dashboard for a more seamless experience.
- 🖼️ **New Look:** We've updated the image that appears when you share Mitsuko links for a fresh new look.
- 🐛 **Bug Fix:** Fixed a small issue with how project-specific settings were saved.

### July 7

- 📥 **Smarter File Uploads:** We've introduced a new upload dialog that not only lets you drag-and-drop or select files, but also includes a new "Upload as Translated" option. This is perfect for importing existing translations, and it intelligently handles any line mismatches.
- 🔄 **New Tool: Swap Original & Translated:** A handy new tool lets you instantly swap the original and translated text columns with a single click.
- 🌐 **Language Expansion:** Added support for Portuguese and Spanish, opening up Mitsuko to more users.
- ✨ **UI Polish:** The subtitle editor table now includes a line index number, making it easier to navigate and reference specific lines.

### July 5

- 🤖 **New Free Models:** We've added a selection of new free-to-use models and updated the configurations for several existing ones to give you more great options.

### July 4

- 🛠️ **New Subtitle Viewer & Tools Page:** We've launched a dedicated page for viewing and manipulating subtitles! This new area includes powerful tools and a new option to export your subtitles as a CSV file for easy analysis in spreadsheets.

### July 1

- ℹ️ **Clearer Website Messaging:** We've updated our landing page with a clearer hero message, refreshed the FAQ, and improved the examples on the pricing page to make it easier to understand how Mitsuko can help you.

### June 30

- 🎙️ **Free Transcription Models:** You can now select free models for your transcription tasks, giving you more flexibility to balance cost and quality.
- 💡 **Helpful Hints for Instructions:** We've added a new help dialog for the "Custom Instructions" field, providing guidance on how to write effective instructions for the AI.
- 🤖 **Model Library Updates:** We've updated the output limits for some models to improve performance and have removed the Gemma 3 model from our collection.

### June 24

- ✨ Smarter Temperature Control: We've added a new setting to automatically use the recommended "temperature" for each AI model, but you can now easily toggle it off if you prefer manual control.
- 🧠 Enhanced Reasoning by Default: The "Advanced Reasoning" mode is now always on, ensuring you get the highest quality translations without needing to flip a switch.
- 🐛 Improved Subtitle Parsing: Fixed an issue with how line breaks were handled in certain subtitle files, making our parsing more robust.

### June 18

- ⚙️ **Project-Wide Default Settings:** You can now set default "Temperature" and "Advanced Reasoning" settings for an entire project! This saves you time by automatically applying your preferences to all new translations and transcriptions you create within that project.
- 🤖 **New & Updated AI Models:** We've added powerful new models, including Llama 3.1 405B and the stable versions of Google's Gemini 2.5 Pro and Flash, giving you more high-quality choices for your work.

### June 11

- ✨ **New AI Models & UI Polish:**
    - Welcome OpenAI's new `o3` and updated `o-mini` models to the family, offering more choices for your translation needs.
    - Your credit history now clearly shows the initial amount for each credit grant, making it easier to track.

### June 10

- 🧠 **Smarter Default Settings:** Mitsuko now automatically sets the best "temperature" setting for each AI model you select, giving you more reliable and consistent translations out of the box without any manual tweaking.

### June 8

- 💳 **Clearer Credit Management:**
    - We've updated the pricing page with clearer messaging and information about credit packs.
    - You can now view a detailed history of credits granted to your account in the user dashboard.
    - Our terms have been updated to clarify policies around credits for full transparency.

### June 3

- 🗂️ **Organized Model Selection:** Choosing an AI model is now easier than ever! Models are now grouped by their provider (like OpenAI, Google, Anthropic) and feature their official logos, making the list cleaner and more intuitive to navigate.

### June 2

- 🚀 **New Feature: Advanced Reasoning & Planning:** For truly complex translations, you can now enable "Advanced Reasoning & Planning" in the settings. This tells the AI to think more deeply about the context, potentially yielding even higher quality results for challenging content.
- 🛍️ **Easier Credit Purchase:** You can now easily purchase more credits with new "Buy" buttons located conveniently in the user menu and on the navigation bar.

### May 29

- ✍️ **New Bilingual ExportFormat:** You can now export your subtitles in a "Commented Original" format. This places the original text as a comment directly above the translation in the subtitle file, perfect for review and quality checks.

### May 28

- 🎨 **Revamped Model Selection Experience:**
    - We've added a host of new models, including free Gemini Flash and updated DeepSeek models.
    - Models are now categorized by their strengths, with helpful badges for "Best Quality," "Fastest," and "Multilingual" to help you choose the perfect model for your task.

### May 27

- 💬 **Share Your Feedback Easily:** We've added a new "Feedback" button to the navigation bar. Now you can send us your thoughts, suggestions, or bug reports directly from within Mitsuko!

### May 26

- 🤖 **Expanded AI Model Library:** We've expanded our lineup of powerful AI models, adding support for Claude Sonnet 4, Gemma 3, and Qwen3 to give you even more translation choices.

### May 18

- ▶️ **Resume and Refine Your Work:**
    - **Continue Translation:** Did a translation stop midway? A new "Continue" button now appears in the Progress window, allowing you to intelligently resume and fill in any untranslated gaps.
    - **Clear All Translations:** Need to start over on a file? A new tool lets you clear only the translated text while keeping all your original subtitle lines and timestamps perfectly intact.
    - **Third-Party Model Toggle:** You can now easily enable or disable the use of third-party models from your user settings page for more control over your workflow.

### May 16

- ✨ **Introducing GPT-4o Models:** We've added OpenAI's latest and greatest models, `GPT-4o` and `GPT-4o mini`, to our lineup. Experience cutting-edge translation quality and speed. We'll also feature promotional discounts on select models from time to time!

### May 9

- 💡 **Advanced Control with Few-Shot Examples:** A powerful new feature for pros! You can now provide "few-shot examples" in the advanced settings. This lets you show the AI *exactly* how you want specific phrases or styles to be translated, dramatically improving consistency and accuracy for your project's unique needs.
- We've also added more models from Anthropic, xAI, and Google (Gemini) and improved the dynamic resizing of text areas for a smoother UI.

### April 30

- 🎙️ **Supercharged Transcription:**
    - **Model Selection:** You can now choose between Free and Premium models for audio transcription to balance your needs for quality and cost.
    - **Custom Instructions:** Fine-tune your transcription results by providing custom instructions and using our new handy presets.
    - **Long Audio Support:** Transcribing long-form content is easier with a new setting for audio files over one hour.
    - **Improved Workflow:** The entire transcription interface has been updated for a more intuitive and powerful experience.

### April 24

- 💳 **New Flexible Pricing: Introducing Credit Packs:**
    - We've launched a new, more transparent pricing page to make everything easier to understand.
    - You can now purchase "Credit Packs" to use with our premium AI models.
    - Pay in your local currency with our new currency switcher (USD & IDR supported).
    - Use the new credit calculator to estimate the cost of your translation or transcription jobs before you start.

### April 9

- 🏠 **A Fresh New Look & Powerful Project Tools:**
    - **New Landing Page:** We've completely redesigned our homepage to better showcase what Mitsuko can do for you.
    - **Backup & Restore:** You can now export your entire project database for safekeeping and import it later. A great way to back up your work or move it to another computer.
    - **Dashboard UI:** The project dashboard is now more organized, making it easier to manage your work.

### March 28

- 🛠️ **Translation & Transcription Presets:**
    - To give you more control, we've added a "Custom Instructions" field in the translation settings. Guide the AI on tone, style, or terminology to get the perfect result.
    - Quickly get started with our new preset templates for common instructions in both translation and transcription.

### March 24

- ⚙️ **Smarter Settings & Performance:**
    - Mitsuko now automatically applies the best default settings for each specific AI model you choose.
    - Working with huge subtitle files is now faster, as Mitsuko will cleverly hide subtitles if you upload a file that exceeds the display limit, preventing browser slowdown.
    - We've clarified the descriptions for advanced settings to make them easier to understand.

### March 23

- 🚀 **Enhanced Performance:** Improved responsiveness and smoother scrolling when working with large subtitle files, thanks to optimized loading and the ability to show or hide subtitle sections for easier navigation.
- 💬 **ASS Subtitle Format Guidance:** Added guidance dialogs for ASS files to improve translation results.

### March 22

- 🗂️ **New Project Management Features:**
    - **Project Dashboard:** Organize subtitles and projects with drag-and-drop. Manage project layout and views. Track overall progress and quickly resume work.
    - **Work on Multiple Projects Concurrently:** Run multiple translation, transcription, and context extraction processes simultaneously. Switch between projects easily and share context information between them.
    - **Edit Context:** Edit AI-generated context documents. View version history and compare changes.
    - **Workspace Improvements:** Store project data locally. Improved navigation, settings, UI, and UX.

### March 12

- 🧠 **Enhanced Context Caching:** Added a new "Better Context Caching" option in the advanced settings. This feature significantly improves how Mitsuko remembers and uses context from previous translations, leading to more accurate efficient request, especially in long or complex subtitle files.

### March 9

- ⏩ **Find Empty Translations:** Added a new button in the "Start Index" input that automatically finds the first empty translation in your subtitle file and sets the start index to that point. This makes it easy to quickly resume translating where you left off or to identify and fill in gaps.
- 📊 **Subtitle Progress:** Added a new "Progress" button that displays your translation progress, showing the number of translated lines, missing original text lines, and untranslated intervals. This gives you a clear overview of your work.
- 🛠️ **Subtitle Tools:** Introduced a new "Tools" button, providing easy access to helpful utilities like subtitle cleaner and time shifter.
- ✅ **File Type Validation:** Added validation to ensure that only valid SRT or ASS files are parsed, preventing errors.

### March 8

- ⚙️ **Response Handling and Auto-Continue:** Improved handling of manually entered subtitle data, and the robustness of the translation process by automatically repairing broken or incomplete responses. The translation will now try to automatically continue if it encounters certain issues.
- 🔄 **Index Handling:** To simplify your workflow, the start index is now automatically reset to 1 when you load a new subtitle file, and both start and end indices are correctly reset when applying a history item.
- 🐛 **Subtitle Translation Fixes:** We've made improvements to the subtitle translation process. Fixed issues with how subtitle chunks were handled, ensuring all parts of the subtitle are parsed and translated correctly.

### March 6

- 📝 **New Feature: Transcription!** We've added a powerful new transcription feature that lets you convert audio files into text, complete with timestamps! Simply drag and drop your file and watch the transcription appear in real-time. Mitsuko automatically generates subtitles from the transcribed text, and you have full control to manually edit and refine the output. You can also export the final result in standard SRT format.

### March 5

- ✍️ **Enhanced Translation Quality:** We've significantly refined the instructions given to the AI, leading to more nuanced and context-aware translations. The AI now prioritizes cultural nuances and the intended meaning of idiomatic expressions, while also improving consistency in handling technical terms, character speech patterns, and overall context, particularly when a context document is provided.
- 🤖 **Automatic Output Length:** Added an "Auto Mode" for the maximum output length setting. When enabled, Mitsuko lets the AI model decide the best length for the translated text, potentially improving translation quality in some cases. You can still manually set a maximum length if you prefer.
- 🛠️ **Minor Changes and Improvements:** We've made several behind-the-scenes updates, including improved advanced settings reset behavior when switching models, enhancements to core processes for increased reliability and security, and better error message handling.

### March 2

- ⏩ **Fine-Grained Control: End Index for Translations** - You can now specify *both* a starting and ending point for your translations! This gives you even more control, allowing you to translate only specific sections of a subtitle file with precision. Perfect for working with very large files or focusing on particular scenes.
- 🤖 **Enhanced Model Selection: Details and Improved UI** - Choosing the right AI model is now easier and more informative! We've added detailed information about each model, including its context length, maximum output size, and whether it supports structured output.
- 🔄 **Resilience: Automatic Retries** - Mitsuko now automatically retries translation and context extraction requests if they fail. This makes the process more robust and less likely to be interrupted by temporary network issues.
- 🐛 **Bug Fixes: Streamlining and Formatting** - We removed an unused system prompt text area in advanced settings *and* resolved an issue with how newlines were handled in ASS subtitle files.

### February 28

- 🔗 **Easy Access to Updates: Changelog Link** - We've added a direct link to this changelog in the navigation menu.  Now you can easily stay up-to-date on the latest features and improvements with just one click!
- 🌐 **New Language Option: Japanese (Romaji)** - We've expanded our language support! You can now translate to and from Japanese using Romaji (romanized Japanese), making it easier to work with Japanese subtitles even if you don't read Kanji.

### February 27

- 🚀 **Performance Boost: Improved Request Handling** - We've optimized how Mitsuko handles large translation requests and subtitle extraction. This means faster processing times and a smoother experience, especially when working with long or complex subtitle files.
- ✨ **UI Polish: Typo Correction** - Fixed a small typo in the context memory settings description to ensure clarity.

### February 26

- 🆕 **Language Expansion: More Translation Choices** - We've significantly increased the number of languages you can choose from! Translate your subtitles to and from a wider range of languages, giving you more flexibility. The language selection is now presented in a convenient dropdown menu.
- ⚙️ **Settings Improvements: Clearer Descriptions** - We've rewritten the descriptions for all settings options to make them easier to understand. Now you can confidently adjust settings like temperature, split size, and context options, knowing exactly what each one does.
- 🔄 **New Feature: Reset Advanced Settings** - Added a convenient reset button for the advanced settings. If you've experimented with the advanced options and want to go back to the defaults, just click this button.

### February 25

- 📁 **File Handling: Enhanced Drag-and-Drop** - We've refined the drag-and-drop experience. It's now even smoother and more intuitive to upload your subtitle files directly into Mitsuko.
- ⏩ **Resume Translations: Start Where You Left Off** - Introducing a powerful new feature for long subtitle files! You can now specify a starting point (line number) for your translation. This is perfect if you need to pause and resume a large translation project, or if you only need to translate a specific section of a file.
- 📱 **Mobile Improvements: Better Responsiveness** - Mitsuko now adapts even better to different screen sizes, providing a more consistent and user-friendly experience on phones and tablets.

### February 24

- 💾 **New Download Options: Tailored to Your Needs** - We've added a range of download options to give you complete control over your translated subtitles:
    - **Translated Text Only:** Download just the translated text, perfect for creating new subtitles from scratch.
    - **Bilingual Subtitles:** Download a file with both the original and translated text, ideal for learning or comparison.
    - **Multiple Formats:** Choose between SRT and ASS file formats for maximum compatibility.
- 📚 **Translation History: Review and Reuse** - Keep track of your past translations! You can now view a history of your translated files, making it easy to find and reuse previous work. You can also see the detailed JSON output for each translation and even delete old history entries.

### February 23

- ✅ **Safety Features: Confirmation Dialogs** - We've added confirmation dialogs for important actions like applying a previous translation or deleting history items. This helps prevent accidental data loss and ensures you're in control.
- 📈 **Progress Tracking: Real-Time Updates** - See your translations appear as they are processed! We've implemented real-time updates, so you can monitor the progress of your translation and get immediate feedback.

### February 22

- 🖱️ **Drag-and-Drop: Effortless File Upload** - Easily add subtitle files by simply dragging them onto the designated area in Mitsuko. This streamlines the upload process and makes it more convenient.
- 🔗 **Quick Navigation: Seamless Switching** - We've added links in the navigation bar to make it easier to switch between the main translation tool and the context extraction feature.
- ✔️ **Smart Validation: Automatic Error Checks** - Mitsuko now automatically checks for common errors, such as invalid episode numbers or missing subtitle content, helping you avoid potential issues.

### February 21

- 🚦 **Live Updates: See Translations Appear Incrementally** - Experience the magic of real-time translation! As Mitsuko processes your subtitles, you'll see the translated text appear gradually, providing instant visual feedback.
- 🧩 **Large File Support: Optimized Chunking** - We've improved how Mitsuko handles large subtitle files. By splitting them into smaller chunks, we ensure faster processing and better performance, even with very long files.
- 🔒 **Security: API Key Visibility Toggle** - You can now choose to show or hide your API key while you're typing it in. This adds an extra layer of security, especially when working in shared environments.

### February 20

- 💾 **Auto-Save: Never Lose Your Work** - Mitsuko now automatically saves your progress as you work. This means you don't have to worry about losing your edits or translations if you accidentally close the browser or refresh the page.
- 🎨 **Dark Mode: Enhanced Night Viewing** - We've refined the dark mode theme to provide a more comfortable and visually appealing experience when working in low-light conditions.

### February 19

- 🔄 **Session Memory: Remembers Your Preferences** - Mitsuko now remembers your chosen settings (like language, model, and API keys) even if you close the browser. This saves you time and effort by eliminating the need to re-enter your preferences every time you use the application.
- 💬 **Notifications: Instant Feedback** - Get instant feedback on your actions with helpful toast notifications. These notifications provide clear and concise messages about the status of your translations and other operations.
- 🧠 **Smart Context: Extract Details from Previous Episodes** - Use our context extraction feature to gather information from previous episodes' subtitles. This helps improve the accuracy and consistency of translations by providing the AI with relevant background information.

### February 18

- 📖 **Multi-Format Support: SRT and ASS Files** - Mitsuko now supports both SRT and ASS subtitle file formats. This gives you greater flexibility and compatibility with a wider range of video content.
- ✏️ **Smooth Editing: Faster Response** - We've optimized the subtitle editing experience. Changes you make to the subtitle text are now reflected more quickly, resulting in a smoother and more responsive workflow.
- ⚠️ **Safety Net: Unsaved Changes Warnings** - Mitsuko will now warn you if you try to leave the page with unsaved changes to your subtitles. This helps prevent accidental data loss and ensures you don't lose your work.

### February 17

- 🎉 **Initial Launch: Basic Translation Functionality** - The very first version of Mitsuko! This initial release included the core features:
    - **Upload SRT Files:** Upload your subtitle files in the SRT format.
    - **Simple Language Selection:** Choose your source and target languages.
    - **Basic Translation Interface:** A straightforward interface for translating your subtitles.

---

*More exciting updates coming soon...*
