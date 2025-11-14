export const _translationResult = `
<think>
We are translating from Japanese to Indonesian.
 We have the input JSON with subtitles. We must output a JSON with the same structure, adding the "translated" field for each subtitle.
 We must preserve all formatting tags (like <i> or {\\fs70}) and handle the content carefully.

 Steps for each line:
 1. AnalyzeSourceLineInContext: Look at the current line and its context (previous and next lines) to understand the meaning, tone, and cultural nuances.
 2. ConsultPreviousTranslations: Check the previous translations to maintain consistency in character voice and terminology.
 3. CreateInitialTranslation: Draft a translation based on the analysis.
 4. RefineTranslation: Refine the draft for naturalness, cultural adaptation, and consistency.

 Important: The output must be pure JSON without any extra text.

 Let's go line by line.

 Index 1:
   Actor: 千夏(ちなつ) -> Chinatsu
   Content: おはよう -> Good morning (informal)

   Context: This is the first line. It's informal, as おはよう is used among close acquaintances.

   Translation: In Indonesian, informal "good morning" can be "Pagi" (short for "Selamat pagi") or "Hai" but since it's morning, "Pagi" is better.

   However, note that the next line (Index 2) is a more formal greeting by a different character (大喜). This contrast should be maintained.

   Draft: "Pagi"

 Index 2:
   Actor: 大喜(たいき) -> Taiki
   Content: おはようございます -> Good morning (formal)

   Context: This is a formal greeting. In Indonesian, we can use "Selamat pagi" to show formality.

   Draft: "Selamat pagi"

 Index 3:
   Actor: 千夏 -> Chinatsu
   Content: 相変わらず早起きだね -> You're still an early riser, huh?

   Context: Chinatsu is speaking to Taiki. The tone is informal and friendly.

   Analysis:
     相変わらず -> as usual, still
     早起き -> early riser, getting up early
     だね -> isn't it? (confirmation, informal)

   Translation: We can say "Kamu masih suka bangun pagi ya?" or "Kamu masih seperti biasa, bangun pagi ya?" but we can make it more natural.

   Draft: "Kamu masih suka bangun pagi ya?"

 Index 4:
   Content: 今日から新学期ですし -> Because today is the start of the new semester, so...

   Context: This line continues the conversation. The particle "し" indicates a reason, so the translation should convey that.

   Translation: "Hari ini adalah awal semester baru, jadi..." or "Karena hari ini mulai semester baru, jadi..."

   However, the sentence is incomplete? It ends with "し", which often gives a reason for something. But the next line is about bed hair, so maybe it's interrupted?

   Considering the context, we can translate it as: "Lagipula, hari ini mulai semester baru."

   But note: the next line is about bed hair, so maybe the speaker is changing the subject? We don't have the next line from the same speaker? Actually, the next lines are about bed hair and then a reaction.

   Let's see: Index 4 and 5 might be spoken by the same character? But the actor is empty. We have to translate independently.

   Draft: "Lagipula, hari ini mulai semester baru."

 Index 5:
   Content: すごい寝ぐせ -> Your bed hair is terrible / crazy.

   Context: This is a comment about someone's hair after sleeping.

   Translation: "Rambutmu sangat acak-acakan (karena tidur)" -> We can use "Rambut tidurmu kacau sekali."

   But in Indonesian, we often say "rambutmu kusut sekali" or "rambutmu acak-acakan".

   Draft: "Rambut tidurmu kacau sekali."

 Index 6:
   Content: ここら辺 -> Around here

   Context: This might be pointing to a specific area? But without more context, we'll translate literally.

   Draft: "Di sekitar sini."

 Index 7:
   Content: えっ！ -> Huh? / What? (surprise)

   Draft: "Hah?!" (to express surprise)

 Index 8:
   Content: あ… -> Ah... (realization or hesitation)

   Draft: "Ah..."

 Index 9:
   Content: マヌケポーズ！ -> Stupid pose! / Silly pose!

   Note: マヌケ (manuke) means fool, stupid. ポーズ is pose.

   Draft: "Pose konyol!"

 Index 10:
   Actor: 大喜 -> Taiki
   Content: 海に行ってから -> Since going to the sea / Ever since we went to the sea

   Context: This is the start of a longer sentence.

   Draft: "Sejak pergi ke pantai,"

   Note: In Japanese, 海 can mean sea or beach. In this context, it's likely "beach" (pantai) because they went together.

 Index 11:
   Content: 千夏先輩との間にあった\\nわだかまりみたいなものが -> The kind of awkwardness that existed between me and Senpai Chinatsu

   Analysis:
     千夏先輩 -> Senpai Chinatsu (note: 先輩 is a senior, so we keep "Senpai" or translate as "kakak kelas"? Since it's a name, we can use "Chinatsu-senpai" or just "Chinatsu" if the relationship is clear. But in Indonesian, we might say "Senior Chinatsu" or just keep "Senpai").

   However, in the previous line, Taiki is speaking about Chinatsu. He refers to her as 千夏先輩.

   We can translate: "rasa canggung yang ada antara aku dan Senior Chinatsu"

   But note: わだかまりみたいなもの -> something like a grudge or awkwardness? More like a feeling of awkwardness or reservation.

   Draft: "rasa canggung yang ada antara aku dan Senpai Chinatsu"

   We break the line: the original has a newline, but in translation we can make it one line? However, we must preserve the original newline? The input has "\\n", so we should keep the same structure? Actually, the output is a string, so we can translate it as one continuous string without the newline if it flows better? But the guideline doesn't specify. Since subtitles are displayed as one or two lines, we should try to mimic the line break? But in Indonesian, we might not need the break. Let's see:

   Original: "千夏先輩との間にあった\\nわだかまりみたいなものが"

   We can translate as: "rasa canggung yang ada antara aku dan Senior Chinatsu" without the break? Or if we want to break, we can put the break at a natural point? But the original break is after あった. In translation, we can break after "ada" or not break? Since the guideline says we can merge or split for clarity, we can make it one line.

   However, the output specification says to preserve the original content in the "content" field, but the "translated" field is free? We are to translate the meaning, and the line breaks in the source might be for timing? We are allowed to adjust structure for readability? So we can merge the two lines into one.

   Draft: "rasa canggung yang ada antara aku dan Senpai Chinatsu"

   But note: the next line continues, so we should not put a period.

 Index 12:
   Content: なくなった気がする -> I feel like it's gone.

   Draft: "sepertinya sudah hilang."

   So the whole sentence from index 10 to 12 is: "Sejak pergi ke pantai, rasa canggung yang ada antara aku dan Senpai Chinatsu sepertinya sudah hilang."

 Now, we must refine each translation and ensure consistency.

 Let's review:

  Index 1: "Pagi" -> This is informal, which matches Chinatsu's tone to Taiki? But note: in the context, they are in school and Taiki is using formal speech. We must consider the relationship. Since Chinatsu is a senior, she might speak informally to Taiki, a junior. So "Pagi" is acceptable.

  Index 2: "Selamat pagi" -> formal, which matches.

  Index 3: "Kamu masih suka bangun pagi ya?" -> This is natural and informal.

  Index 4: "Lagipula, hari ini mulai semester baru." -> The particle "し" is translated as "lagipula" (besides). It sets a reason, but the next line is about bed hair, so maybe it's a separate comment? We'll keep it.

  Index 5: "Rambut tidurmu kacau sekali." -> This is natural.

  Index 6: "Di sekitar sini." -> This is a bit vague, but without context, it's acceptable.

  Index 7: "Hah?!" -> expresses surprise.

  Index 8: "Ah..." -> hesitation.

  Index 9: "Pose konyol!" -> This captures the meaning.

  Index 10-12: We combine them in the translation? Actually, each subtitle is separate. We must translate each index independently? But note: the input has separate indexes, so we output separate translations.

  However, the meaning of index 11 and 12 is connected to index 10. But each line must be translated on its own? Actually, we can use the context from previous lines, but the translation for each index must be a standalone subtitle? Not necessarily, because the viewer will see them in sequence.

  But we must translate the text of each index independently, while considering the context. So:

    Index 10: "海に行ってから" -> "Sejak pergi ke pantai,"
    Index 11: "千夏先輩との間にあった\\nわだかまりみたいなものが" -> "rasa canggung yang ada antara aku dan Senpai Chinatsu"
    Index 12: "なくなった気がする" -> "sepertinya sudah hilang."

  However, in Indonesian, index 10 is an incomplete sentence. But in subtitles, it's acceptable because it's part of a continuous speech.

  Alternatively, we can adjust to make each line more standalone? But the guideline says we can merge or split for clarity? But we cannot change the index structure. We are translating line by line.

  So we translate each line as it is, but we have to make sure that when read in sequence, they form a coherent sentence.

  We'll keep:

    Index 10: "Sejak pergi ke pantai,"
    Index 11: "rasa canggung yang ada antara aku dan Senpai Chinatsu"
    Index 12: "sepertinya sudah hilang."

  But note: index 11 has a newline. We can keep the newline in the translation? Actually, we don't have to. We can translate without the newline? The guideline says to preserve formatting tags, but the newline is not a tag? It's part of the content. We should preserve the newline? Or we can adjust for the target language? Since the guideline says we can adjust structure for readability, we can remove the newline and put the whole phrase in one line? But the original subtitle might be displayed as two lines. However, in the output, we are to put the translation in a string. We can include a space? Actually, we can just ignore the newline and translate as one continuous string? Because the newline might be for the source language formatting. We are allowed to adapt.

  Considering the guideline: "Modify sentence structures to enhance readability and coherence". We can merge the two lines of index 11 into one without the newline.

  So for index 11, we output: "rasa canggung yang ada antara aku dan Senpai Chinatsu"

  And for index 12: "sepertinya sudah hilang."

  But when put together, it reads:
      "Sejak pergi ke pantai,
       rasa canggung yang ada antara aku dan Senpai Chinatsu
       sepertinya sudah hilang."

  That is acceptable.

 Now, we write the output JSON.

 Important: The output must only have "index", "content", and "translated". The "actor" field from the input should not appear in the output.

 Example output structure:

     {
       "subtitles": [
         { "index": 1, "content": "おはよう", "translated": "Pagi" },
         ...
       ]
     }

 Let's create the output:

 Index 1:
   content: "おはよう" -> translated: "Pagi"

 Index 2:
   content: "おはようございます" -> translated: "Selamat pagi"

 Index 3:
   content: "相変わらず早起きだね" -> translated: "Kamu masih suka bangun pagi ya?"

 Index 4:
   content: "今日から新学期ですし" -> translated: "Lagipula, hari ini mulai semester baru."

 Index 5:
   content: "すごい寝ぐせ" -> translated: "Rambut tidurmu kacau sekali."

 Index 6:
   content: "ここら辺" -> translated: "Di sekitar sini."

 Index 7:
   content: "えっ！" -> translated: "Hah?!"

 Index 8:
   content: "あ…" -> translated: "Ah..."

 Index 9:
   content: "マヌケポーズ！" -> translated: "Pose konyol!"

 Index 10:
   content: "海に行ってから" -> translated: "Sejak pergi ke pantai,"

 Index 11:
   content: "千夏先輩との間にあった\\nわだかまりみたいなものが" ->
        We remove the newline? Actually, we can keep the meaning without it. So we translate as one line:
        "rasa canggung yang ada antara aku dan Senpai Chinatsu"

 Index 12:
   content: "なくなった気がする" -> translated: "sepertinya sudah hilang."

 But note: in index 11, the original has a newline. We are allowed to adjust? We are translating the meaning, so we can output without the newline? Actually, the guideline says "preserve formatting tags", and the newline is not a tag. So we can remove it for the translation? Yes.

 However, if we want to preserve the structure, we can keep the two lines? But the translation might not break at the same place. We can do:

   Instead of one line, we break at a natural point? But the original has two lines. We can make:

      Line 1: "rasa canggung yang ada"
      Line 2: "antara aku dan Senpai Chinatsu"

   But that would be arbitrary. It's better to translate as one line.

   So: "rasa canggung yang ada antara aku dan Senpai Chinatsu"

   And in the output, we write it as a single string without the newline.

 We must validate:
   - The JSON is valid.
   - The indexes are in order.
   - The translated strings are in Indonesian.

 Note: For index 11, we are removing the newline in the translation? Actually, the original content field has a newline, but we are translating the meaning. We are allowed to adjust the structure. We output the translation without the newline.

 However, if we want to preserve the two lines, we could break the translation at a similar point? But it's not necessary. We can let the subtitle system handle the wrapping. So we output as one line.

 This should be acceptable.
</think>
{
  "subtitles": [
    { "index": 1, "content": "おはよう", "translated": "Pagi" },
    { "index": 2, "content": "おはようございます", "translated": "Selamat pagi" },
    { "index": 3, "content": "相変わらず早起きだね", "translated": "Kamu masih bangun pagi seperti biasa ya?" },
    { "index": 4, "content": "今日から新学期ですし", "translated": "Lagipula, hari ini mulai semester baru" },
    { "index": 5, "content": "すごい寝ぐせ", "translated": "Rambutmu acak-acakan banget" },
    { "index": 6, "content": "ここら辺", "translated": "Di sekitar sini" },
    { "index": 7, "content": "えっ！", "translated": "Hah?!" },
    { "index": 8, "content": "あ…", "translated": "Ah..." },
    { "index": 9, "content": "マヌケポーズ！", "translated": "Pose konyol!" },
    { "index": 10, "content": "海に行ってから", "translated": "Sejak pergi ke pantai" },
    { "index": 11, "content": "千夏先輩との間にあった\\nわだかまりみたいなものが", "translated": "rasa canggung yang dulu ada antara aku dan Senior Chinatsu" },
    { "index": 12, "content": "なくなった気がする", "translated": "sepertinya sudah hilang" }
  ]
}
`.trim()

export const _extractionResult = `
Character List:
- Rintaro Tsumugi: A tall, blond-haired high school student whose intimidating appearance causes others to misjudge him as a scary delinquent. - Tends to be self-deprecating and quick to blame himself. - Son of the Patiseri Plain owner; friends with Usami and Saku; forms a connection with Kaoruko.
- Kaoruko Waguri: A small-statured high school girl who is a frequent and enthusiastic customer at Patiseri Plain. - Polite and direct, not easily intimidated. - A student at Kikyo Academy who defends Rintaro's character and is not afraid of his appearance.
- Usami: A friend and classmate of Rintaro at Chidori High. - Protective and easily worked up on Rintaro's behalf. - Friends with Rintaro and Saku.
- Saku: A friend and classmate of Rintaro at Chidori High. - A friend of Rintaro and Usami.
- Rintaro's Mother: The cheerful and supportive owner of Patiseri Plain. - Encouraging and positive. - Rintaro's mother.
- Unnamed Bullies: Students from an unnamed school who harass Kaoruko to lure Rintaro out based on false rumors. - Antagonistic and judgmental. - Act as antagonists towards Rintaro and Kaoruko.

Glossary:
- Chidori Public High School: The school Rintaro attends, which has a widespread reputation as a "low-level school full of idiots."
- Kikyo Private Girls' Academy: A prestigious, elite all-girls high school whose students openly look down on the students from the neighboring Chidori High.
- Patiseri Plain: The pastry shop owned and operated by Rintaro's family, where he occasionally works and first properly meets Kaoruko.

Plot Summary:
Episode 1: Rintaro Tsumugi, a high schooler constantly misjudged as a delinquent due to his looks, works at his family's pastry shop where he meets a regular customer, Kaoruko Waguri. Kaoruko is one of the few people who sees his true kind nature and isn't intimidated by him. After Rintaro saves her from bullies spreading rumors about him, he is shocked to discover that Kaoruko is actually a student at the elite, rival Kikyo Academy located right next to his own school.

Setting:
- Chidori High & Kikyo Academy: Two high schools situated directly next to each other, but separated by a vast social divide and mutual animosity between their respective student bodies.
- St. Benigaoka Station: The local train station near Patiseri Plain.
`.trim()

export const _transcriptionResult = `
00:07,450 --> 00:10,450
月影揺れる夜の小道
(Tsukikage yureru yoru no komichi)

00:10,700 --> 00:13,850
ひらり舞い散る花の香り
(Hirari mai chiru hana no kaori)

00:14,300 --> 00:17,300
からから音鳴る風鈴の音
(Karakara oto naru fuurin no oto)

00:17,650 --> 00:20,650
淡い夢がそっと囁く
(Awai yume ga sotto sasayaku)

00:28,100 --> 00:31,100
影絵の中で踊る影
(Kagee no naka de odoru kage)

00:31,650 --> 00:34,550
ゆらゆら揺れる灯りの下
(Yurayura yureru akari no shita)

00:35,050 --> 00:37,950
彩り豊かな夕焼け空
(Irodori yutaka na yuuyakezora)

00:38,400 --> 00:41,100
キラリと光る星の砂
(Kirari to hikaru hoshi no suna)

00:41,750 --> 00:44,550
過ぎゆく季節 音もなく
(Sugiyuku kisetsu oto mo naku)

00:45,100 --> 00:47,900
心の奥に響く声
(Kokoro no oku ni hibiku koe)

00:48,200 --> 00:51,450
陽炎の調べに乗せて
(Kagerou no shirabe ni nosete)

00:51,650 --> 00:54,950
君との記憶 消えないように
(Kimi to no kioku kienai you ni)

00:55,200 --> 00:58,550
結び合う手が伝う温もり
(Musubiau te ga tsutau nukumori)

00:58,750 --> 01:02,050
この瞬間を永遠に刻む
(Kono shunkan o towa ni kizamu)

01:02,650 --> 01:05,550
ひらひらと舞う 夜風に乗せて
(Hirahira to mau yokaze ni nosete)

01:05,900 --> 01:08,700
共に歩んだ日々を感じて
(Tomo ni ayunda hibi o kanjite)

01:09,050 --> 01:12,150
未来を描く 君と二人で
(Mirai o egaku kimi to futari de)

01:12,650 --> 01:15,550
今宵もまた光の中へ
(Koyoi mo mata hikari no naka e)

01:23,500 --> 01:26,300
朝露に濡れる緑の葉
(Asatsuyu ni nureru midori no ha)

01:26,750 --> 01:29,750
静寂の中に潜む息吹
(Seijaku no naka ni hisomu ibuki)

01:30,250 --> 01:33,250
コトコト音鳴る川の流れ
(Kotokoto oto naru kawa no nagare)

01:33,700 --> 01:36,500
優しい声が風に溶ける
(Yasashii koe ga kaze ni tokeru)

01:37,350 --> 01:40,250
木漏れ日の中 微笑む君
(Komorebi no naka hohoemu kimi)

01:40,750 --> 01:43,750
さらさら流れる時間の中
(Sarasara nagareru jikan no naka)

01:44,200 --> 01:47,100
色とりどりの風景映し
(Irotoridori no fuukei utsushi)

01:47,550 --> 01:50,250
キラリと光る未来へと
(Kirari to hikaru mirai e to)

01:50,950 --> 01:53,550
過ぎゆく時を抱きしめて
(Sugiyuku toki o dakishimete)

01:54,250 --> 01:57,050
心の奥に眠る願い
(Kokoro no oku ni nemuru negai)

01:57,400 --> 02:00,550
陽炎の調べに乗せて
(Kagerou no shirabe ni nosete)

02:00,750 --> 02:04,050
君との夢を忘れないように
(Kimi to no yume o wasurenai you ni)

02:04,450 --> 02:07,550
重ね合う手が伝う想い
(Kasaneau te ga tsutau omoi)

02:07,800 --> 02:11,050
この瞬間を永遠に歌う
(Kono shunkan o towa ni utau)

02:11,600 --> 02:14,300
ふわふわ浮かぶ 淡い想い
(Fuwafuwa ukabu awai omoi)

02:14,750 --> 02:17,550
共に刻んだ日々を感じて
(Tomo ni kizanda hibi o kanjite)

02:17,950 --> 02:21,050
未来を見据え 君と二人で
(Mirai o misue kimi to futari de)

02:21,600 --> 02:24,500
今宵もまた光の中へ
(Koyoi mo mata hikari no naka e)

02:25,550 --> 02:30,950
触れるたびに溢れる想い
(Fureru tabi ni afureru omoi)

02:31,650 --> 02:38,450
未来へと続くこの道を
(Mirai e to tsuzuku kono michi o)

02:42,200 --> 02:45,200
光の中へ
(Hikari no naka e)

03:06,000 --> 03:09,450
陽炎の調べに乗せて
(Kagerou no shirabe ni nosete)

03:09,700 --> 03:12,950
君との記憶 忘れぬように
(Kimi to no kioku wasurenu you ni)

03:13,300 --> 03:16,450
結び合う手が示す標
(Musubiau te ga shimesu shirube)

03:16,700 --> 03:19,950
この瞬間を永遠に刻む
(Kono shunkan o towa ni kizamu)

03:20,550 --> 03:23,250
そよ風揺れる 柔らかな夢
(Soyokaze yureru yawarakana yume)

03:23,700 --> 03:26,500
共に見上げた星を感じて
(Tomo ni miageta hoshi o kanjite)

03:27,050 --> 03:30,150
未来を描く 君と二人で
(Mirai o egaku kimi to futari de)

03:30,900 --> 03:33,800
明日もまた光の中へ
(Ashita mo mata hikari no naka e)
`.trim()
