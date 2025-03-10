import { test, expect, describe } from "bun:test"
import { isEscaped, repairJson } from "@/lib/parser"
import { SubtitleNoTimeNoActorTranslated } from "@/types/types"

function parseAndRepair(input: string): any {
  try {
    const repaired = repairJson(input)
    return JSON.parse(repaired)
  } catch (error) {
    return "error parsing"
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


const testData = [
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
  testData.forEach(({ input, expected }, i) => {
    test(`Input: ${i}`, () => {
      expect(parseAndRepair(input)).toEqual(expected)
    })
  })
})
