import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY chưa được cấu hình. Vui lòng thiết lập trong Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

const SYSTEM_INSTRUCTION = `Bạn là một chuyên gia ngôn ngữ và trợ lý ứng dụng học ngoại ngữ thông minh số 1 cho người Việt.
Ứng dụng hỗ trợ 7 ngôn ngữ: Tiếng Anh, Tiếng Nhật, Tiếng Pháp, Tiếng Thái, Tiếng Trung, Tiếng Đức, Tiếng Tây Ban Nha.

Nhiệm vụ trọng tâm:
1. Khi người dùng nhập từ hoặc câu (đặc biệt là tiếng Việt, hoặc từ ngôn ngữ mục tiêu), dịch sang ngôn ngữ mục tiêu ở trường "original".
2. Cung cấp phiên âm quốc tế IPA và phiên âm tiếng Việt bồi (vi_transliteration) chuẩn xác, gần gũi, chia âm tiết bằng gạch nối rõ ràng, có dấu thanh điệu tiếng Việt tự nhiên nhất.
3. ĐẶC BIỆT - ĐƯA RA CÁC CÂU DIỄN ĐẠT THEO 3 CẤP ĐỘ (level_expressions):
   - Cấp độ 1 ("basic" - "Cơ bản (A1 - A2)"): Câu giao tiếp ngắn gọn, trực diện, dễ nhớ nhất cho người mới bắt đầu.
   - Cấp độ 2 ("intermediate" - "Tự nhiên / Thông dụng (B1 - B2)"): Cách nói tự nhiên, uyển chuyển đúng chuẩn người bản xứ dùng trong cuộc sống.
   - Cấp độ 3 ("advanced" - "Nâng cao / Lịch sự (C1 - C2)"): Cách diễn đạt trang trọng, tinh tế, phù hợp cho môi trường công việc, giao tiếp lịch sự hoặc văn phong sâu sắc.
   Mỗi cấp độ bắt buộc phải có câu gốc ("original"), nghĩa tiếng Việt ("meaning_vi"), ký âm IPA ("ipa"), phiên âm tiếng Việt bồi ("vi_transliteration") và ngữ cảnh áp dụng ("context").

Quy tắc phiên âm tiếng Việt bồi:
- Anh: "Hi" -> "Hai", "Thank you" -> "Thẻng kiu", "Nice to meet you" -> "Nai-xừ tu mít diu"
- Nhật: "Konnichiwa" (こんにちは) -> "Côn-ni-chi-wa", "Arigatou" (ありがとう) -> "A-ri-ga-tô"
- Trung: "Nǐ hǎo" (你好) -> "Ní hảo", "Xièxie" (谢谢) -> "Xiê-xiệ"
- Pháp: "Bonjour" -> "Bông-giua", "Merci" -> "Me-xì"
- Thái: "Sawatdee" (สวัสดี) -> "Xà-goát-đi", "Khop khun" (ขอบคุณ) -> "Khọp-khun"
- Đức: "Guten Tag" -> "Gu-từn Thác", "Danke schön" -> "Đăng-kơ suơn"
- Tây Ban Nha: "Hola" -> "Ô-la", "Muchas gracias" -> "Mu-chát gờ-ra-xi-át"

Chỉ trả về định dạng JSON thuần túy theo đúng lược đồ, không kèm văn bản giải thích nào khác.`;

// Endpoint: Dịch và phát âm học ngoại ngữ
app.post("/api/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Vui lòng nhập từ hoặc câu cần học." });
      return;
    }

    const validLanguages = [
      "Tiếng Anh",
      "Tiếng Nhật",
      "Tiếng Pháp",
      "Tiếng Thái",
      "Tiếng Trung",
      "Tiếng Đức",
      "Tiếng Tây Ban Nha",
    ];
    const targetLang = validLanguages.includes(targetLanguage) ? targetLanguage : "Tiếng Anh";

    const ai = getGeminiClient();
    const prompt = `Từ hoặc câu đầu vào từ người dùng: "${text.trim()}"\nNgôn ngữ mục tiêu cần dịch và luyện phát âm: ${targetLang}\nHãy dịch từ/câu này, tạo phiên âm tiếng Việt bồi và xây dựng 3 câu diễn đạt mẫu theo cấp độ (Cơ bản A1-A2, Tự nhiên B1-B2, Nâng cao C1-C2).`;

    // Candidate models in priority order for resilience
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
    let lastError: any = null;
    let responseText = "";

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                original: {
                  type: Type.STRING,
                  description: "Từ hoặc câu chuẩn xác bằng ngôn ngữ mục tiêu",
                },
                meaning_vi: {
                  type: Type.STRING,
                  description: "Nghĩa tiếng Việt chuẩn xác",
                },
                ipa: {
                  type: Type.STRING,
                  description: "Ký âm phát âm quốc tế IPA",
                },
                vi_transliteration: {
                  type: Type.STRING,
                  description: "Tiếng Việt bồi (phiên âm âm đọc gần nhất bằng chữ quốc ngữ Việt Nam)",
                },
                level_expressions: {
                  type: Type.ARRAY,
                  description: "Danh sách các câu diễn đạt theo 3 cấp độ: Cơ bản (basic), Tự nhiên (intermediate), Nâng cao/Lịch sự (advanced)",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      level: {
                        type: Type.STRING,
                        description: "basic | intermediate | advanced",
                      },
                      level_label: {
                        type: Type.STRING,
                        description: "Ví dụ: 'Cơ bản (A1 - A2)', 'Tự nhiên / Thông dụng (B1 - B2)', 'Nâng cao / Lịch sự (C1 - C2)'",
                      },
                      original: {
                        type: Type.STRING,
                        description: "Câu mẫu bằng ngôn ngữ mục tiêu",
                      },
                      meaning_vi: {
                        type: Type.STRING,
                        description: "Dịch nghĩa tiếng Việt của câu mẫu",
                      },
                      ipa: {
                        type: Type.STRING,
                        description: "Phiên âm IPA của câu",
                      },
                      vi_transliteration: {
                        type: Type.STRING,
                        description: "Tiếng Việt bồi của câu",
                      },
                      context: {
                        type: Type.STRING,
                        description: "Ngữ cảnh hoặc tình huống nên dùng câu này",
                      },
                    },
                    required: [
                      "level",
                      "level_label",
                      "original",
                      "meaning_vi",
                      "ipa",
                      "vi_transliteration",
                      "context",
                    ],
                  },
                },
              },
              required: ["original", "meaning_vi", "ipa", "vi_transliteration"],
            },
          },
        });

        if (response.text) {
          responseText = response.text.trim();
          break; // Success!
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed with:`, err?.message || err);
        // Continue to try next candidate model
      }
    }

    if (!responseText) {
      const errMsg = lastError?.message || "";
      let friendlyMessage = "Không thể kết nối đến máy chủ AI. Vui lòng thử lại sau giây lát.";
      if (errMsg.includes("503") || errMsg.includes("demand") || errMsg.includes("UNAVAILABLE")) {
        friendlyMessage = "Hệ thống AI đang tiếp nhận lượt truy cập cao đột biến. Vui lòng bấm 'Thử lại' sau ít giây!";
      } else if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        friendlyMessage = "Đã đạt giới hạn yêu cầu tạm thời. Vui lòng đợi vài giây và thử lại.";
      }
      res.status(503).json({ error: friendlyMessage });
      return;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Fallback regex extract in case of markdown wrapping
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error("Không thể phân tích dữ liệu trả về từ mô hình.");
      }
    }

    res.json({
      success: true,
      data: parsedData,
      rawJson: responseText,
      targetLanguage: targetLang,
      inputQuery: text.trim(),
    });
  } catch (error: any) {
    console.error("Translation API error:", error);
    let message = error?.message || "Đã xảy ra lỗi khi xử lý yêu cầu.";
    if (message.includes("503") || message.includes("demand") || message.includes("UNAVAILABLE")) {
      message = "Hệ thống AI đang tiếp nhận lượt truy cập cao đột biến. Vui lòng thử lại sau ít giây!";
    }
    res.status(500).json({ error: message });
  }
});

// Endpoint: Chấm điểm & Huấn luyện chỉnh sửa phát âm cho người dùng
app.post("/api/pronunciation-evaluate", async (req, res) => {
  try {
    const { targetWord, targetLanguage, ipa, viTransliteration, spokenText } = req.body;

    if (!targetWord || typeof targetWord !== "string") {
      res.status(400).json({ error: "Vui lòng cung cấp từ mục tiêu cần đánh giá phát âm." });
      return;
    }

    const ai = getGeminiClient();
    const cleanSpoken = (spokenText || "").trim();

    const prompt = `Bạn là Chuyên gia Ngữ âm và Huấn luyện viên phát âm bản xứ (Pronunciation Coach) dành riêng cho người Việt.
Nhiệm vụ: Đánh giá và hướng dẫn chỉnh sửa phát âm chi tiết cho người học.

Thông tin cần đánh giá:
- Từ/Câu mục tiêu: "${targetWord.trim()}"
- Ngôn ngữ: ${targetLanguage || "Tiếng Anh"}
- Ký âm IPA chuẩn: "${ipa || ""}"
- Phiên âm tiếng Việt bồi chuẩn: "${viTransliteration || ""}"
- Âm thanh người dùng vừa đọc (nhận diện): "${cleanSpoken || "(Người dùng luyện đọc từ này)"}"

Yêu cầu phân tích:
1. Chấm điểm độ chính xác phát âm (thang điểm 0 - 100).
   - Nếu từ nhận diện trùng khớp hoặc rất sát với từ mục tiêu: cho từ 85-98 điểm ("Xuất sắc" hoặc "Rất tốt").
   - Nếu lệch một phần âm cuối, trọng âm hoặc nguyên âm: cho 65-84 điểm ("Rất tốt" hoặc "Cần luyện thêm").
   - Nếu đọc sai hoặc lệch nhiều: cho 30-64 điểm ("Cần luyện thêm" hoặc "Chưa chính xác").
2. Chia từ/câu thành từng âm tiết (syllables) cụ thể và đánh giá trạng thái ("correct" | "warning" | "error") kèm lời khuyên ngắn cho từng âm tiết.
3. Hướng dẫn chi tiết khẩu hình miệng (độ mở miệng, môi chụm hay bè) và vị trí đặt đầu lưỡi/răng.
4. Mẹo sửa phát âm qua chữ quốc ngữ tiếng Việt bồi (chỉ rõ cách mượn âm quen thuộc để bật đúng âm khó).
5. Chỉ ra lỗi điển hình mà người Việt hay mắc phải khi nói từ này.`;

    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
    let responseText = "";
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: {
                  type: Type.INTEGER,
                  description: "Điểm số phát âm từ 0 đến 100",
                },
                accuracyLevel: {
                  type: Type.STRING,
                  description: "Xuất sắc | Rất tốt | Cần luyện thêm | Chưa chính xác",
                },
                spokenText: {
                  type: Type.STRING,
                  description: "Nội dung nhận diện được hoặc tóm tắt",
                },
                feedback: {
                  type: Type.STRING,
                  description: "Nhận xét tổng quan và khích lệ người học",
                },
                syllables: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      syllable: { type: Type.STRING, description: "Âm tiết của từ" },
                      ipaSyllable: { type: Type.STRING, description: "Ký hiệu IPA của âm tiết đó" },
                      status: { type: Type.STRING, description: "correct | warning | error" },
                      tip: { type: Type.STRING, description: "Gợi ý chỉnh sửa ngắn cho âm tiết này" },
                    },
                    required: ["syllable", "ipaSyllable", "status", "tip"],
                  },
                },
                mouthAndTongueGuide: {
                  type: Type.STRING,
                  description: "Hướng dẫn cụ thể về khẩu hình miệng và vị trí đặt lưỡi",
                },
                vietnameseTip: {
                  type: Type.STRING,
                  description: "Mẹo bồi âm tiếng Việt để phát âm chuẩn xác",
                },
                commonVietnameseMistakes: {
                  type: Type.STRING,
                  description: "Lỗi người Việt hay mắc phải khi phát âm từ này",
                },
              },
              required: [
                "score",
                "accuracyLevel",
                "spokenText",
                "feedback",
                "syllables",
                "mouthAndTongueGuide",
                "vietnameseTip",
                "commonVietnameseMistakes",
              ],
            },
          },
        });

        if (response.text) {
          responseText = response.text.trim();
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Pronunciation eval with ${model} failed:`, err?.message || err);
      }
    }

    if (!responseText) {
      throw lastError || new Error("Không thể kết nối đến máy chủ AI chấm điểm.");
    }

    const evaluation = JSON.parse(responseText);
    res.json({ success: true, evaluation });
  } catch (error: any) {
    console.error("Pronunciation evaluation error:", error);
    res.status(500).json({
      error: error?.message || "Đã xảy ra lỗi khi phân tích và chấm điểm phát âm.",
    });
  }
});

// Endpoint: Chat hội thoại tương tác với Trợ lý ngôn ngữ (kèm sửa lỗi, gợi ý từ câu của người dùng, dịch nghĩa tiếng Việt & phiên âm bồi)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, targetLanguage, topic } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Vui lòng cung cấp lịch sử tin nhắn." });
      return;
    }

    const ai = getGeminiClient();
    const targetLang = targetLanguage || "Tiếng Anh";
    const currentTopic = topic || "Giao tiếp hàng ngày";

    // Format recent chat turns
    const conversationContext = messages
      .slice(-8)
      .map((m: any) => `${m.role === "user" ? "Người học" : "Trợ lý AI"}: ${m.content || m.original || ""}`)
      .join("\n");

    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user")?.content || "";

    const prompt = `Bạn là Trợ lý Ngôn ngữ AI thông minh, kiên nhẫn, vui vẻ và am hiểu sư phạm, giúp người Việt luyện giao tiếp ngoại ngữ thực tế.
Ngôn ngữ đang luyện tập: ${targetLang}.
Chủ đề cuộc trò chuyện: ${currentTopic}.

Lịch sử trò chuyện gần đây:
${conversationContext}

Tin nhắn mới nhất của người học: "${lastUserMsg}"

NHIỆM VỤ QUAN TRỌNG CỦA BẠN (GỒM 3 PHẦN CHÍNH):

1. SỬA LỖI KHI NGƯỜI DÙNG TRẢ LỜI SAI (user_correction):
- Phân tích kỹ câu vừa rồi của người học: "${lastUserMsg}"
- Nếu người học nói bằng ${targetLang} nhưng có lỗi (sai ngữ pháp, sai từ vựng, sai chia thì, sai trật tự từ, thiếu mạo từ/giới từ, diễn đạt gượng gạo):
  + has_error: true
  + status: "has_error" hoặc "minor_issue"
  + original_user_text: câu người học vừa nói
  + corrected_text: câu đã được sửa lại chuẩn xác, tự nhiên theo đúng văn phong bản xứ
  + vi_transliteration: phiên âm bồi tiếng Việt dễ đọc cho câu đã sửa
  + explanation_vi: giải thích chi tiết, dễ hiểu bằng tiếng Việt (chỉ rõ sai ở từ nào/cấu trúc nào, vì sao sai và nguyên tắc ngữ pháp chuẩn)
  + praise_or_critique: lời nhận xét động viên, khích lệ người học
- Nếu người học nhập bằng Tiếng Việt (hoặc muốn hỏi cách nói):
  + has_error: false
  + status: "vietnamese_input"
  + original_user_text: câu tiếng Việt của người học
  + corrected_text: câu chuẩn tự nhiên bằng ${targetLang}
  + vi_transliteration: phiên âm bồi tiếng Việt
  + explanation_vi: hướng dẫn cách nói ý này bằng ${targetLang}
  + praise_or_critique: "Cách nói ý này bằng ${targetLang} chuẩn nhất:"
- Nếu người học nói bằng ${targetLang} và câu HOÀN TOÀN ĐÚNG chuẩn xác:
  + has_error: false
  + status: "correct"
  + original_user_text: câu của người học
  + corrected_text: giữ nguyên câu của người học
  + vi_transliteration: phiên âm bồi
  + explanation_vi: nhận xét khen ngợi cụ thể vì sao câu này chuẩn xác
  + praise_or_critique: "Rất xuất sắc! Câu của bạn chuẩn ngữ pháp 100%! 👏"

2. ĐƯA RA GỢI Ý TỪ CHÍNH CÂU TRẢ LỜI CỦA NGƯỜI DÙNG (user_suggestions):
- Dựa trên chính nội dung/ý tưởng mà người học vừa nói ("${lastUserMsg}"), hãy đưa ra 2 đến 3 gợi ý để giúp người học phát triển câu:
  + Gợi ý 1 (natural_upgrade): Cách nói tự nhiên/bản xứ hơn (Native Phrasing) cho chính ý đó. Label: "Cách nói tự nhiên hơn"
  + Gợi ý 2 (expansion): Cách mở rộng ý của câu (thêm cảm xúc, lý do, chi tiết sinh động) để câu nói dài và lưu loát hơn. Label: "Mở rộng ý câu nói"
  + Gợi ý 3 (alternative): Một cách diễn đạt tương đương khác để phong phú vốn từ. Label: "Cách diễn đạt khác"
  Mỗi gợi ý BẮT BUỘC có: text (${targetLang}), meaning_vi (tiếng Việt), vi_transliteration (bồi âm).

3. TIẾP TỤC ĐÀM THOẠI VỚI NGƯỜI HỌC:
- Trả lời bằng ${targetLang} tự nhiên, lôi cuốn (original, 1-2 câu).
- BẮT BUỘC dịch nghĩa tiếng Việt chuẩn xác (meaning_vi).
- BẮT BUỘC có phiên âm bồi tiếng Việt ('vi_transliteration') và ký âm quốc tế IPA ('ipa').
- formatted_message: Câu hoàn chỉnh gồm ngoại ngữ kèm dịch nghĩa tiếng Việt trong ngoặc đơn, ví dụ: "Great! Where are you going? (Tuyệt quá! Bạn đang đi đâu thế?)".
- suggested_replies: 2-3 câu ngắn gợi ý cho người học trả lời tiếp trong ngữ cảnh này.`;

    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
    let responseText = "";
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                user_correction: {
                  type: Type.OBJECT,
                  description: "Phần phân tích sửa lỗi câu của người học",
                  properties: {
                    has_error: { type: Type.BOOLEAN },
                    status: {
                      type: Type.STRING,
                      enum: ["correct", "minor_issue", "has_error", "vietnamese_input"],
                    },
                    original_user_text: { type: Type.STRING },
                    corrected_text: { type: Type.STRING },
                    vi_transliteration: { type: Type.STRING },
                    explanation_vi: { type: Type.STRING },
                    praise_or_critique: { type: Type.STRING },
                  },
                  required: ["has_error", "status", "original_user_text", "corrected_text", "vi_transliteration", "explanation_vi"],
                },
                user_suggestions: {
                  type: Type.ARRAY,
                  description: "2-3 gợi ý nâng cấp/mở rộng từ chính câu trả lời của người dùng",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: {
                        type: Type.STRING,
                        enum: ["natural_upgrade", "expansion", "alternative"],
                      },
                      label: { type: Type.STRING },
                      text: { type: Type.STRING },
                      meaning_vi: { type: Type.STRING },
                      vi_transliteration: { type: Type.STRING },
                    },
                    required: ["type", "label", "text", "meaning_vi", "vi_transliteration"],
                  },
                },
                original: {
                  type: Type.STRING,
                  description: `Câu trả lời bằng ${targetLang}`,
                },
                meaning_vi: {
                  type: Type.STRING,
                  description: "Dịch nghĩa tiếng Việt của câu trả lời",
                },
                vi_transliteration: {
                  type: Type.STRING,
                  description: "Phiên âm bồi tiếng Việt chuẩn xác",
                },
                ipa: {
                  type: Type.STRING,
                  description: "Ký âm quốc tế IPA",
                },
                formatted_message: {
                  type: Type.STRING,
                  description: "Câu hoàn chỉnh gồm tiếng nước ngoài và phần dịch nghĩa tiếng Việt trong ngoặc đơn",
                },
                suggested_replies: {
                  type: Type.ARRAY,
                  description: "2-3 gợi ý câu trả lời ngắn cho người học tiếp tục đoạn chat",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING },
                      meaning_vi: { type: Type.STRING },
                      vi_transliteration: { type: Type.STRING },
                    },
                    required: ["original", "meaning_vi", "vi_transliteration"],
                  },
                },
                user_tip: {
                  type: Type.STRING,
                  description: "Mẹo nhỏ bổ sung nếu có",
                },
              },
              required: [
                "user_correction",
                "user_suggestions",
                "original",
                "meaning_vi",
                "vi_transliteration",
                "formatted_message",
                "suggested_replies",
              ],
            },
          },
        });

        if (response.text) {
          responseText = response.text.trim();
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Chat endpoint with ${model} failed:`, err?.message || err);
      }
    }

    if (!responseText) {
      throw lastError || new Error("Không thể kết nối đến Trợ lý AI trò chuyện lúc này.");
    }

    const data = JSON.parse(responseText);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({
      error: error?.message || "Đã xảy ra lỗi trong cuộc hội thoại.",
    });
  }
});

// Endpoint: Text-to-Speech audio stream
app.get("/api/tts", async (req, res) => {
  try {
    const text = req.query.text as string;
    const lang = (req.query.lang as string) || "en";

    if (!text || !text.trim()) {
      res.status(400).send("Text is required");
      return;
    }

    // Map lang to standard Google TTS language code
    let tl = "en";
    const lower = lang.toLowerCase();
    if (lower.startsWith("ja")) tl = "ja";
    else if (lower.startsWith("th")) tl = "th";
    else if (lower.startsWith("fr")) tl = "fr";
    else if (lower.startsWith("zh")) tl = "zh-CN";
    else if (lower.startsWith("en")) tl = "en";
    else if (lower.startsWith("vi")) tl = "vi";
    else if (lower.startsWith("de")) tl = "de";
    else if (lower.startsWith("es")) tl = "es";

    // Clean text: strip parenthesis or romanization
    let cleanText = text.trim();
    if (cleanText.includes("(") && cleanText.includes(")")) {
      const part = cleanText.split("(")[0].trim();
      if (part) cleanText = part;
    }

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${tl}&q=${encodeURIComponent(cleanText)}`;
    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
    });

    if (!response.ok) {
      throw new Error(`TTS upstream failed with status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "public, max-age=86400",
      "Accept-Ranges": "bytes",
    });

    res.send(buffer);
  } catch (error: any) {
    console.error("TTS generation error:", error);
    res.status(500).send(error?.message || "Failed to generate TTS");
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Vietnamese Language Learning Assistant" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
