import { test, expect, describe } from "bun:test"
import { isEscaped, repairJson } from "@/lib/parser/repairer"
import { SubtitleNoTimeNoActorTranslated } from "@/types/subtitles"

function parseAndRepair(input: string): unknown {
  try {
    const repaired = repairJson(input)
    return JSON.parse(repaired)
  } catch (e) {
    return e
  }
}

const wrapSub = (arr: SubtitleNoTimeNoActorTranslated[]) => {
  return { subtitles: arr }
}

const _arr2 = [
  { "index": 1, "content": "x", "translated": "y" },
  { "index": 2, "content": "v", "translated": "w" }
]
const _arr1 = [_arr2[0]]
const arr2 = wrapSub(_arr2)
const arr1 = wrapSub(_arr1)


interface TestDataItem {
  name?: string
  input: string
  expected: { subtitles: SubtitleNoTimeNoActorTranslated[] }
}

const testData: TestDataItem[] = [
  // empty test
  {
    input: "",
    expected: wrapSub([]),
  },
  {
    input: `{"subtitles":[]}`,
    expected: wrapSub([]),
  },
  // escaped char test
  {
    input: `{"subtitles":[
      {"index":1,"content":"{\\\\an8}BASEMENT LEVEL FIVE","translated":"{\\\\an8}BASEMENT LEVEL LIMA"},
      {"index":2,"content":"{\\\\an8}You keep dodging my attacks. \\" test \\" ","translated":"{\\\\an8}Kau terus menghindari seranganku."}
    ]}`,
    expected: wrapSub([
      {
        index: 1,
        content: "{\\an8}BASEMENT LEVEL FIVE",
        translated: "{\\an8}BASEMENT LEVEL LIMA",
      }, {
        index: 2,
        content: "{\\an8}You keep dodging my attacks. \" test \" ",
        translated: "{\\an8}Kau terus menghindari seranganku.",
      }
    ]),
  },
  {
    input: `{"subtitles":[
      {"index":1,"content":"BASEMENT LEVEL FIVE","translated":"BASEMENT LEVEL LIMA"},
      {"index":2,"content":"You keep dodging my \\" attacks.","translated":"Kau terus menghindari seranganku."}
    ]}`,
    expected: wrapSub([
      {
        index: 1,
        content: "BASEMENT LEVEL FIVE",
        translated: "BASEMENT LEVEL LIMA",
      }, {
        index: 2,
        content: "You keep dodging my \" attacks.",
        translated: "Kau terus menghindari seranganku.",
      }
    ]),
  },
  {
    input: `{"subtitles":[
      {"index":1,"content":"BASEMENT LEVEL FIVE","translated":"BASEMENT LEVEL LIMA"},
      {"index":2,"content":"You keep dodging my attacks. \\\\","translated":"Kau terus menghindari seranganku."}
    ]}`,
    expected: wrapSub([
      {
        index: 1,
        content: "BASEMENT LEVEL FIVE",
        translated: "BASEMENT LEVEL LIMA",
      }, {
        index: 2,
        content: "You keep dodging my attacks. \\",
        translated: "Kau terus menghindari seranganku.",
      }
    ]),
  },
  // bracket test
  {
    input: `{"subtitles":[
      {"index":1,"content":"x","translated":"y"},
      {"index":2,"content":"v","translated":"w"}]`,
    expected: arr2,
  },
  {
    input: `{"subtitles":[
      {"index":1,"content":"x","translated":"y"},
      {"index":2,"content":"v","translated":"w"},`,
    expected: arr2,
  },
  {
    input: `{"subtitles":[
      {"index":1,"content":"x","translated":"y"},
      {"index":2,"content":"v","translated":"w"}`,
    expected: arr2,
  },
  {
    input: `{"subtitles":[
      {"index":1,"content":"x","translated":"y"},
      {"index":2,"content":"v","translated":"w"`,
    expected: arr1,
  },
  {
    input: `{"subtitles":[
      {"index":1,"content":"x","translated":"y"},
      {"index":2,"content":"v","transla`,
    expected: arr1,
  },
  {
    input: `{"subtitles":[{"index":1,"content":"x","translated":"y"}]`,
    expected: arr1,
  },
  {
    input: `{"subtitles":[{"index":1,"content":"x","translated":"y"},`,
    expected: arr1,
  },
  {
    input: `{"subtitles":[{"index":1,"content":"x","translated":"y"}`,
    expected: arr1,
  },
  {
    input: `{"subtitles":[{"index":1,"content":"x","translated":"y"`,
    expected: wrapSub([]),
  },
  {
    input: `{"subtitles":[{"index":1,"content":"x","translated":"y`,
    expected: wrapSub([]),
  },
  {
    input: `{"subtitles":[{"index":1,"cont"`,
    expected: wrapSub([]),
  },
  {
    input: `{"subtitles":[{"`,
    expected: wrapSub([]),
  },
  {
    input: `{"subtitles"`,
    expected: wrapSub([]),
  },
  {
    input: `{"subtitles`,
    expected: wrapSub([]),
  },
  {
    input: `{"`,
    expected: wrapSub([]),
  },
  // Bracket in string tests
  {
    name: "bracket in string 1",
    input: `{"subtitles":[ {"index":1,"content":"hello { [ world ] } ","translated":"test"} ]}`,
    expected: wrapSub([{
      index: 1,
      content: "hello { [ world ] } ",
      translated: "test"
    }]),
  },
  {
    name: "bracket in string 2",
    input: `{"subtitles":[ {"index":1,"content":"hello { [ world ] } ","translated":"test"}`,
    expected: wrapSub([{
      index: 1,
      content: "hello { [ world ] } ",
      translated: "test"
    }]),
  },
  {
    name: "bracket in string 3",
    input: `{"subtitles":[ {"index":1,"content":"hello { [ world ] } ","translated":"test`,
    expected: wrapSub([]),
  },
  {
    name: "bracket in string 4",
    input: `{"subtitles":[ {"index":1,"content":"hello { [ world ] } ","translated":"test"}`,
    expected: wrapSub([{
      index: 1,
      content: "hello { [ world ] } ",
      translated: "test"
    }]),
  },
  {
    name: "bracket in string 5",
    input: `{"subtitles":[ {"index":1,"content":"hello { [ world ]","translated":"test"}`,
    expected: wrapSub([{
      index: 1,
      content: "hello { [ world ]",
      translated: "test"
    }]),
  },
  // Quote in string tests
  {
    name: "quote in string 1",
    input: `{"subtitles":[ {"index":1,"content":"hello \\"{ [ world ] }\\" ","translated":"test"} ]}`,
    expected: wrapSub([{
      index: 1,
      content: 'hello \"{ [ world ] }\" ',
      translated: "test"
    }]),
  },
  {
    name: "quote in string 2",
    input: `{"subtitles":[ {"index":1,"content":"hello { \\"world ]","translated":"test"}`,
    expected: wrapSub([{
      index: 1,
      content: "hello { \"world ]",
      translated: "test"
    }]),
  },
  {
    name: "quote in string 3",
    input: `{"subtitles":[ {"index":1,"content":"{{\\"\\\\\\"{}{(||)([[]]){\\"]{{{{]]]]","translated":"test"}`,
    expected: wrapSub([{
      index: 1,
      content: `{{\"\\\"{}{(||)([[]]){\"]{{{{]]]]`,
      translated: "test"
    }]),
  },
  {
    name: "quote in string 4",
    input: `{"subtitles":[ {"index":1,"content":"\\"\\"\\"","translated":""}`,
    expected: wrapSub([{
      index: 1,
      content: `\"\"\"`,
      translated: ""
    }]),
  },
  // Stupid model output tests
  {
    name: "stupid model output with reasoning",
    input: `<internal_reasoning>
Saya akan menerapkan proses 4 langkah untuk setiap baris subtitle yang belum diterjemahkan (index 7-100) sesuai panduan:
{"subtitles": [
...etc
</internal_reasoning>
{"subtitles":[ {"index":1,"content":"hello \\"{ [ world ] }\\" ","translated":"test"} ]}`,
    expected: wrapSub([{
      index: 1,
      content: 'hello \"{ [ world ] }\" ',
      translated: "test"
    }]),
  },
  {
    name: "stupid model output with reasoning and whitespace",
    input: `<stupid>
...
</stupid>
  {
    "subtitles": [
      {
        "index": 1,
        "content": "test",
        "translated": "test"
      }
    ]
  }
<stupid>
...
</stupid>
`,
    expected: wrapSub([{
      index: 1,
      content: 'test',
      translated: "test"
    }]),
  },
  {
    name: "stupid model output with trailing garbage",
    input: `<stupid>
...
</stupid>
**Explanation**:
...
some stupid explanation

  {
    "subtitles": [
      {
        "index": 1,
        "content": "test",
        "translated": "test"
      }
    ]
  }

**Explanation**:
...
some stupid explanation
`,
    expected: wrapSub([{
      index: 1,
      content: 'test',
      translated: "test"
    }]),
  },
  // Trailing comments tests
  {
    name: "output with trailing comments",
    input: `
{
  "subtitles": [
    {"index": 201, "content": "Wouldn't imagine the strongest of our School is so romantic.", "translated": "Tak kusangka yang terkuat di Sekolah kami begitu romantis."}, // This is comment
    {"index": 216, "content": "You were selected as \\"The Star of The Sky\\"", "translated": "Kau terpilih sebagai \\"Bintang Langit\\""} // This is comment
  ]
}
`,
    expected: wrapSub([
      {
        "index": 201,
        "content": "Wouldn't imagine the strongest of our School is so romantic.",
        "translated": "Tak kusangka yang terkuat di Sekolah kami begitu romantis."
      },
      {
        "index": 216,
        "content": "You were selected as \"The Star of The Sky\"",
        "translated": "Kau terpilih sebagai \"Bintang Langit\""
      },
    ])
  },
  // Trailing comma tests
  {
    name: "trailing comma before array close",
    input: `{"subtitles":[
      {"index":1,"content":"x","translated":"y"},
      {"index":2,"content":"v","translated":"w"},
    ],},`,
    expected: arr2,
  },
  {
    name: "trailing comma before object close",
    input: `{"subtitles":[
      {"index":1,"content":"x","translated":"y",},
      {"index":2,"content":"v","translated":"w",},
    ],},`,
    expected: arr2,
  },
]

describe("isEscaped", () => {
  test("1", () => expect(isEscaped("", 0)).toBe(false))
  test("2", () => expect(isEscaped("a", 0)).toBe(false))
  test("3", () => expect(isEscaped("\\a", 1)).toBe(true))
  test("4", () => expect(isEscaped("\\\\a", 2)).toBe(false))
  test("5", () => expect(isEscaped("\\\\\\a", 3)).toBe(true))
  test("6", () => expect(isEscaped("\\\\\\\\", 3)).toBe(true))
  test("7", () => expect(isEscaped("\\\\\\\\\\", 4)).toBe(false))
  test("8", () => expect(isEscaped("\\\\", 0)).toBe(false))
  test("9", () => expect(isEscaped("\\\\", 1)).toBe(true))
})

describe("parse & repair json", () => {
  testData.forEach(({ input, expected, name }, i) => {
    test(`Input: ${i}` + (name ? ` [${name}]` : ""), () => {
      expect(parseAndRepair(input)).toEqual(expected)
    })
  })
})
