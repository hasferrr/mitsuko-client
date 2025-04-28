export const customInstructionPresets = [
  {
    title: "Target Younger Audience (Informal & Contemporary)",
    instruction:
      "Adapt the language consistently for a young adult audience (approx. 15-20 years old). Prioritize natural, contemporary language common in the target language for this demographic. Use appropriate informal expressions and slang where fitting with the character and context, but avoid overly niche terms that might date quickly. Ensure the tone feels authentic and engaging, not forced. Sentence structure can be more dynamic.",
  },
  {
    title: "Maintain Highly Formal/Technical Tone",
    instruction:
      "Maintain a consistently formal and precise tone throughout the translation, suitable for [e.g., historical documentary, scientific explanation, legal proceedings]. Avoid colloquialisms, slang, contractions, and overly casual phrasing. Use formal address terms and precise technical vocabulary (cross-referencing the Glossary) appropriate for the target language and context. Prioritize clarity and accuracy over stylistic flair.",
  },
  {
    title: "Strict Handling of Specific Terminology",
    instruction:
      "Handle the following specific terms exactly as indicated, overriding any general guidelines or glossary entries if they conflict:\n- '[Source Term 1]': MUST always be translated as '[Target Translation 1]'. Do not use synonyms.\n- '[Source Term 2]': MUST remain in the original language '[Source Term 2]' (e.g., brand name, proper noun). Do not translate.\n- '[Source Phrase 3]': Translate this recurring phrase consistently as '[Target Phrase 3]'.\n- '[Ambiguous Term 4]': In this specific content, always interpret this term as meaning '[Specific Meaning]' and translate accordingly.",
  },
  {
    title: "Prioritize Humor Adaptation",
    instruction:
      "When translating humor (jokes, puns, sarcasm, witty banter), the primary goal is to achieve a similar *comedic effect* in the target language and culture. Do not prioritize literal translation if it kills the joke. Adapt creatively: find an equivalent idiom, joke structure, or humorous situation in the target language that fits the character, context, and timing. If a direct equivalent is impossible, convey the *intent* (e.g., \"He made a bad pun\") or find the closest possible humorous phrasing.",
  },
  {
    title: "Maximize Literal Accuracy (Minimize Cultural Adaptation)",
    instruction:
      "For this specific project, prioritize maximum literal accuracy and fidelity to the source text structure. Minimize cultural adaptation and localization beyond what is strictly necessary for grammatical correctness and basic intelligibility in the target language. Adhere closely to source sentence boundaries and word choices where possible. This overrides the general guideline prioritizing cultural nuance.",
  },
  {
    title: "Remove Japanese Honorifics",
    instruction:
      "Translate Japanese names without including common honorifics (e.g., -san, -kun, -chan, -sama, -dono, -sensei). Use the base name only or adapt to natural forms of address in the target language (e.g., using titles like Mr./Ms. or first/last names as appropriate for the context and relationship between characters), unless the honorific itself is crucial for plot or characterization (rare).",
  },
]
