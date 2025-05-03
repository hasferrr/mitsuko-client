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
    title: "Emphasize Target Language Localization",
    instruction:
      "Adapt cultural references, idioms, measurements, and formats (e.g., dates, currency) to be natural and easily understood by the target audience in [Target Language/Region]. Avoid overly literal translations that might sound awkward or lose meaning. Ensure names, places, and concepts are localized appropriately unless specifically instructed otherwise (e.g., keep original character names). The goal is seamless cultural integration.",
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

export const transcriptionInstructionPresets = [
  {
    title: "High Accuracy Focus",
    instruction: "Prioritize word-for-word accuracy above all else. Capture every utterance, including fillers like 'uh' and 'um'. Punctuate strictly based on speech pauses."
  },
  {
    title: "Readability Focus",
    instruction: "Produce a clean, readable transcript. Remove filler words and false starts. Use standard punctuation for clarity, even if speech pauses differ slightly."
  },
  {
    title: "Direct Translation",
    instruction: `After transcribing the audio, translate the text to Romaji using this format:

\`\`\`
original text
(translated text)
\`\`\`

e.g.,
\`\`\`
こんにちは
(Konnichiwa)
\`\`\`
`.trim()
  },
  {
    title: "Provide Lyrics",
    instruction: `Transcribe using the lyrics provided. After transcribing the audio, translate the text to Romaji using this format:

\`\`\`
original text
(translated text)
\`\`\`

e.g.,
\`\`\`
こんにちは
(Konnichiwa)
\`\`\`

Lyrics:
月影揺れる夜の小道
ヒラリ舞い散る花の香り
カラカラと鳴る風鈴の音
淡い夢がそっと囁く

影絵の中で踊る影
ゆらゆら揺れる灯りの下
彩り豊かな夕焼け空
キラリと光る星の砂

過ぎゆく季節、音もなく
心の奥に響く声

カゲロウの調べに乗せて
君との記憶　消えないように
結び合う手が伝うぬくもり
この瞬間を永久に刻む
ひらひらと舞う、夜風に乗せ
共に歩んだ日々を感じて
未来を描く　君と二人で
今宵もまた　光の中へ

朝露に濡れる緑の葉
静寂の中に潜む息吹
コトコトと鳴る川の流れ
優しい声が風に溶ける

木漏れ日の中　微笑む君
さらさら流れる時間の中
色とりどりの風景映し
キラリと光る未来へと

過ぎゆく時を抱きしめて
心の奥に眠る願い

カゲロウの調べに乗せて
君との夢を忘れないように
重ね合う手が伝う想い
この瞬間を永遠に歌う
ふわふわ浮かぶ、淡い想い
共に刻んだ日々を感じて
未来を見据え　君と二人で
今宵もまた　光の中へ

触れるたび溢れる想い
未来へと続くこの道を　光の中へ

カゲロウの調べに乗せて
君との記憶　忘れぬように
結び合う手が示すしるべ
この瞬間を永遠に刻む
そよ風揺れる　柔らかな夢
共に見上げた星を感じて
未来を描く　君と二人で
明日もまた　光の中へ
`.trim()
  }
].slice(2)
