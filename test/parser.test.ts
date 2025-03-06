import { test, expect } from "bun:test"
import { repairJson } from "@/lib/parser"

function parseAndRepair(input: string): any {
  try {
    const repaired = repairJson(input)
    return JSON.parse(repaired)
  } catch (error) {
    return null
  }
}

const arr2 = [
  { "index": 1, "content": "x", "translated": "y" },
  { "index": 2, "content": "v", "translated": "w" }
]
const arr1 = [arr2[0]]


const testData = [
  {
    input: "[]",
    expected: [],
  },
  {
    input: `[
      {"index":1,"content":"{\\\\an8}BASEMENT LEVEL FIVE","translated":"{\\\\an8}BASEMENT LEVEL LIMA"},
      {"index":2,"content":"{\\\\an8}You keep dodging my attacks. \\" test \\" ","translated":"{\\\\an8}Kau terus menghindari seranganku."}
    ]`,
    expected: [
      {
        index: 1,
        content: "{\\an8}BASEMENT LEVEL FIVE",
        translated: "{\\an8}BASEMENT LEVEL LIMA",
      }, {
        index: 2,
        content: "{\\an8}You keep dodging my attacks. \" test \" ",
        translated: "{\\an8}Kau terus menghindari seranganku.",
      }
    ],
  },
  {
    input: `[
      {"index":1,"content":"BASEMENT LEVEL FIVE","translated":"BASEMENT LEVEL LIMA"},
      {"index":2,"content":"You keep dodging my \\" attacks.","translated":"Kau terus menghindari seranganku."}
    ]`,
    expected: [
      {
        index: 1,
        content: "BASEMENT LEVEL FIVE",
        translated: "BASEMENT LEVEL LIMA",
      }, {
        index: 2,
        content: "You keep dodging my \" attacks.",
        translated: "Kau terus menghindari seranganku.",
      }
    ],
  },
  {
    input: `[
      {"index":1,"content":"BASEMENT LEVEL FIVE","translated":"BASEMENT LEVEL LIMA"},
      {"index":2,"content":"You keep dodging my attacks. \\\\","translated":"Kau terus menghindari seranganku."}
    ]`,
    expected: [
      {
        index: 1,
        content: "BASEMENT LEVEL FIVE",
        translated: "BASEMENT LEVEL LIMA",
      }, {
        index: 2,
        content: "You keep dodging my attacks. \\",
        translated: "Kau terus menghindari seranganku.",
      }
    ],
  },
  {
    input: `[
      {"index":1,"content":"x","translated":"y"},
      {"index":2,"content":"v","translated":"w"}`,
    expected: arr2,
  },
  {
    input: `[
      {"index":1,"content":"x","translated":"y"},
      {"index":2,"content":"v","translated":"w"`,
    expected: arr1,
  },
  {
    input: `[
      {"index":1,"content":"x","translated":"y"},
      {"index":2,"content":"v","transla`,
    expected: arr1,
  },
  {
    input: `[{"index":1,"content":"x","translated":"y"},`,
    expected: arr1,
  },
  {
    input: `[{"index":1,"content":"x","translated":"y"`,
    expected: [],
  },
  {
    input: `[{"index":1,"cont"`,
    expected: [],
  },
]


testData.forEach(({ input, expected }, i) => {
  test(`Input: ${i}`, () => {
    expect(parseAndRepair(input)).toEqual(expected)
  })
})
