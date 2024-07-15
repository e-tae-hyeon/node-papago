import * as fs from "fs";
import translate from "translate";
import path from "path";

translate.engine = "google";

const __dirname = path.resolve();

const locale_from = "ko";
const locales_to = ["en", "ja", "zh"];
const jsonFilePath = __dirname + "/input/ko.json"; // 번역할 JSON 파일 경로

// Google Translate API 호출 함수
async function translateText(text: string, locale: string): Promise<string> {
  try {
    const res = await translate(text, { from: locale_from, to: locale });

    return res;
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // 오류 발생 시 원본 텍스트 반환
  }
}

// JSON 객체 순회 및 번역 함수
async function translateJSON(jsonObj: any, locale: string): Promise<any> {
  const translatedObj: any = {};

  for (const key in jsonObj) {
    if (typeof jsonObj[key] === "string") {
      translatedObj[key] = await translateText(jsonObj[key], locale);
    } else if (typeof jsonObj[key] === "object" && jsonObj[key] !== null) {
      translatedObj[key] = await translateJSON(jsonObj[key], locale);
    } else {
      translatedObj[key] = jsonObj[key];
    }
  }

  return translatedObj;
}

// JSON 파일 읽기
fs.readFile(jsonFilePath, "utf8", async (err, data) => {
  if (err) {
    console.error("Error reading JSON file:", err);
    return;
  }

  const jsonObj = JSON.parse(data);

  // JSON 객체 번역

  await Promise.all(
    locales_to.map(async (locale) => {
      console.log("Translated Start " + locale);

      const translatedObj = await translateJSON(jsonObj, locale);

      // 번역된 JSON 파일 저장
      const outputFilePath = __dirname + `/output/${locale}.json`; // 번역된 JSON 파일 경로

      fs.writeFile(
        outputFilePath,
        JSON.stringify(translatedObj, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error("Error writing translated JSON file:", err);
            return;
          }

          console.log("Translated JSON file saved successfully " + locale);
        }
      );
    })
  );
});
