# Claude Skills — Brief tiếng Việt cho Day 16

> Nguồn: **The Complete Guide to Building Skills for Claude** (Anthropic, 33 trang, đã đọc trực tiếp file PDF).
> File gốc lưu tại: `claude_skills_guide.pdf` cùng workspace.

---

## 1. Skill là gì? Khác gì MCP?

**Skill** = thư mục đóng gói dạy Claude làm 1 workflow lặp lại (viết tài liệu theo style guide, quy trình onboarding khách, sprint planning…).

Anthropic ví:
- **MCP** = **bếp chuyên nghiệp** — cung cấp công cụ, nguyên liệu, thiết bị (tool access).
- **Skill** = **công thức nấu** — hướng dẫn **làm gì với chính bộ tool đó** để ra món ngon.

→ MCP nói **Claude làm được gì**. Skill nói **Claude nên làm thế nào**.

Coach đã có MCP server `my-business`, đây chính là tầng tiếp theo cần xây.

---

## 2. Cấu trúc bắt buộc

```
your-skill-name/
├── SKILL.md           # bắt buộc, đúng tên hoa-thường
├── scripts/           # optional — Python/Bash chạy được
├── references/        # optional — docs Claude đọc khi cần
└── assets/            # optional — template, font, icon...
```

### Quy tắc CHẾT NGƯỜI (sai là skill không upload được)

| Yếu tố | Đúng | Sai |
|--------|------|-----|
| Tên file chính | `SKILL.md` (case-sensitive) | `skill.md`, `SKILL.MD` |
| Tên folder | `notion-project-setup` | `Notion Project Setup`, `notion_project_setup`, `NotionProjectSetup` |
| README trong folder | **KHÔNG** có README.md | Có README.md |
| Prefix tên | bất kỳ | tên bắt đầu `claude` hoặc `anthropic` (reserved) |
| YAML frontmatter | `< >` ⛔ | dùng XML angle brackets (security) |

> Repo public trên GitHub vẫn cần README cho người đọc — nhưng để **ngoài** folder skill, không trộn lẫn.

---

## 3. Progressive Disclosure (cốt lõi tiết kiệm context)

Đây là **ý tưởng quan trọng nhất** của Skills. 3 tầng load theo nhu cầu:

| Tầng | Khi nào load | Token cost |
|------|-------------|-----------|
| **L1 — Frontmatter** (name + description) | **Luôn luôn** trong system prompt | thấp, ~50-100 token/skill |
| **L2 — SKILL.md body** | Chỉ khi Claude thấy skill match query | trung bình |
| **L3 — Files trong skills** (`scripts/`, `references/`) | Chỉ khi Claude tự navigate | cao |

→ Có thể nuôi **20–50 skills** mà context vẫn nhẹ. Vượt > 50 → cảnh báo trong PDF: hệ thống chậm, response degrade.

---

## 4. YAML frontmatter — phần Anthropic nhấn mạnh nhất

Đây là chỗ Claude **quyết định có dùng skill không**. Sai → skill **không bao giờ trigger**.

### Format tối thiểu

```yaml
---
name: pickleball-lead-reply
description: Soạn DM Telegram chào mừng lead pickleball mới đăng ký.
  Dùng khi user đề cập "lead mới", "khách mới điền form", hoặc cần
  follow-up người vừa để lại số điện thoại trên landing page.
---
```

### Mọi trường

| Field | Required? | Quy tắc |
|-------|-----------|---------|
| `name` | ✅ | kebab-case, lowercase, khớp tên folder |
| `description` | ✅ | **WHAT** + **WHEN** + **trigger phrases**, ≤1024 ký tự, không `< >` |
| `license` | optional | `MIT`, `Apache-2.0` nếu open-source |
| `compatibility` | optional | yêu cầu env (1–500 ký tự) |
| `allowed-tools` | optional | giới hạn tool, vd: `Bash(python:*) WebFetch` |
| `metadata` | optional | `author`, `version`, `mcp-server`, `category`, `tags` |

### Description tốt vs xấu (PDF nhấn mạnh nguyên Chapter 2)

✅ **Tốt** — cụ thể, có trigger phrases, có file types:
```
description: Analyzes Figma design files and generates developer
handoff documentation. Use when user uploads .fig files, asks for
"design specs", "component documentation", or "design-to-code handoff".
```

❌ **Xấu**:
- "Helps with projects." — quá mơ hồ
- "Creates sophisticated multi-page documentation systems." — thiếu trigger
- "Implements the Project entity model..." — kỹ thuật quá, không có user trigger

**Mẹo debug** description (PDF Chapter 5): hỏi Claude *"When would you use the X skill?"* — Claude sẽ quote description lại. Đọc câu Claude trả lời → biết description đang truyền tải gì cho model.

---

## 5. Ba category Anthropic công nhận (Chapter 2)

| # | Category | Ví dụ skill thật của Anthropic | Phù hợp Coach |
|---|----------|--------------------------------|---------------|
| **1** | Document & Asset Creation | `frontend-design`, `docx`, `pptx`, `xlsx` | Soạn email sequence, drill card, post Facebook theo brand voice |
| **2** | Workflow Automation | `skill-creator` | Onboard học viên, sprint planning lớp học, sản xuất content |
| **3** | MCP Enhancement | `sentry-code-review` (dùng Sentry MCP) | **Đây là sweet spot cho Coach** — tận dụng MCP `my-business` đã build |

---

## 6. Năm pattern thiết kế skill (Chapter 5)

| Pattern | Khi nào dùng | Map vào Coach PPR |
|---------|-------------|-------------------|
| **1. Sequential workflow** | Quy trình có thứ tự rõ | "Onboard học viên": tạo customer → email welcome → đẩy vào group |
| **2. Multi-MCP coordination** | Nhiều MCP server (vd: Figma + Drive + Linear + Slack) | Hiện chỉ 1 MCP, chưa cần |
| **3. Iterative refinement** | Output cải thiện qua vòng lặp | "Soạn caption Facebook": draft → check brand voice → refine |
| **4. Context-aware tool selection** | Cùng outcome, tool khác nhau theo bối cảnh | "Trả lời khách": lead chưa thanh toán → DM nhắc · paid → DM cảm ơn |
| **5. Domain-specific intelligence** | Cần domain knowledge ngoài tool | "Đề xuất bài tập theo level học viên" — cần kiến thức pickleball |

---

## 7. Testing 3 cấp (Chapter 3) — quan trọng cho SOP Day 16

PDF đề xuất check **3 vùng**:

### A. Triggering tests
**Mục tiêu**: skill load **đúng lúc**.

```
Should trigger:
- "Lead mới điền form xong, soạn cho mình DM chào mừng"
- "Có khách mới đăng ký, anh follow-up giúp Coach"

Should NOT trigger:
- "Hôm nay thời tiết Hà Nội thế nào?"
- "Viết đoạn code Python in fizzbuzz"
```

### B. Functional tests
**Mục tiêu**: skill chạy ra output đúng. Kiểm:
- Output hợp lệ.
- API call (MCP) thành công.
- Error handling đúng.
- Edge cases pass.

### C. Performance comparison
So sánh **with skill vs without skill**:

| Metric | Without skill | With skill |
|--------|--------------|-----------|
| Số tin nhắn back-and-forth | 15 | 2 |
| API call thất bại | 3 (cần retry) | 0 |
| Token tiêu tốn | 12,000 | 6,000 |

**Target Anthropic đặt ra**:
- Trigger đúng ≥ **90%** trên test 10–20 query.
- **0** API call thất bại / workflow.
- User không cần redirect / clarify.

---

## 8. Iteration loop (Chapter 3 + 5)

PDF dạy 1 framework debug rõ:

| Triệu chứng | Nguyên nhân | Fix |
|------------|-------------|-----|
| **Under-triggering** (skill không load) | Description quá generic, thiếu trigger phrases | Thêm keyword cụ thể, technical terms |
| **Over-triggering** (load nhầm) | Description quá rộng | Thêm **negative triggers** (`Do NOT use for X`), thu hẹp scope |
| **Execution issues** (load nhưng làm sai) | Instructions verbose / mơ hồ | Bullet point, numbered list, đưa script deterministic vào |
| **Large context** (response chậm) | SKILL.md > 5,000 từ; > 50 skills | Move detail sang `references/`, disable skills không dùng |

**Pro tip từ PDF**: *"Iterate on a single challenging task until Claude succeeds, then extract the winning approach into a skill."* — đừng cố thiết kế general-purpose từ đầu, **làm 1 task siêu khó cho thật ổn rồi mới đóng gói**.

---

## 9. Phân phối / Distribution (Chapter 4)

**State of Jan 2026** (theo PDF — đã ra đời được vài tháng):

| Channel | Cách upload |
|---------|-------------|
| Cá nhân Claude.ai | Settings → Capabilities → Skills → Upload (zip folder) |
| Claude Code | Đặt folder vào `~/.claude/skills/` |
| Org-wide (Team/Enterprise) | Admin deploy workspace-wide (ship 18/12/2025), auto-update |
| API programmatic | `/v1/skills` endpoint, `container.skills` param trong Messages API; **cần Code Execution Tool beta** |

**Khuyến nghị Anthropic**: host trên **GitHub public repo**, README clear (cho người), link từ MCP repo sang skill repo, viết quick-start guide.

> Đây cũng là **open standard** — skill chuẩn này hoạt động được trên Claude và "other AI platforms" (ám chỉ Cursor, Cline, ai dùng Anthropic Agent SDK).

---

## 10. skill-creator — meta-skill nên dùng

Anthropic dựng sẵn skill tên `skill-creator`:
- Generate skill từ mô tả tự nhiên.
- Format SKILL.md đúng frontmatter.
- Đề xuất trigger phrases + structure.
- **Review** skill có sẵn → flag issue (description mơ hồ, thiếu trigger…).

Cách dùng:
> *"Use the skill-creator skill to help me build a skill for [your use case]."*

→ Day 16 nếu yêu cầu xây skill, dùng skill-creator để **build trong 15–30 phút**.

---

## 11. Plan đề xuất cho Coach Day 16

Dựa trên hệ thống Coach đã có (MCP `my-business` 4 tools + Knowledge Vault 5 file), đây là **3 skill phù hợp nhất theo Pattern 3 (MCP Enhancement)**:

### Skill 1 — `pickleball-lead-reply` ⭐ khuyến nghị làm đầu

```yaml
---
name: pickleball-lead-reply
description: Soạn DM Telegram cá nhân hóa cho lead pickleball mới (vừa
  điền form trên landing). Dùng khi Coach gửi tên/SĐT/email của lead, hoặc
  agent vừa nhận alert lead mới qua biz__get_business_signals. Bám brand
  voice "Coach Culi" — gần gũi, không hô hào, CTA gọn không thúc giục.
---
```

- **Pattern**: 4 (Context-aware) + 5 (Domain) — phân loại lead theo gợi ý từ form rồi chọn template tương ứng.
- **MCP gọi**: không bắt buộc (skill thuần ngôn ngữ + đọc vault).
- **References**: link vào `vault-ready/brand-voice.md`, `vault-ready/products.md`.

### Skill 2 — `order-recovery-dm`

```yaml
---
name: order-recovery-dm
description: Soạn tin nhắn nhắc khách thanh toán đơn hàng pending quá 3h.
  Dùng khi nhận được biz__get_business_signals trả về pending_orders, hoặc
  Coach paste mã đơn PB-XXXXX và yêu cầu "soạn nhắc khách". Tone nhẹ,
  không tạo áp lực, kèm link Sepay.
---
```

- **Pattern**: 1 (Sequential) — fetch order detail từ MCP → soạn tin → confirm với Coach.
- **MCP gọi**: `biz__get_business_signals` (đọc), không gọi tool ghi.

### Skill 3 — `daily-ops-action-plan`

```yaml
---
name: daily-ops-action-plan
description: Đọc digest 24h và đề xuất 3 hành động cụ thể cho Coach làm
  trong ngày. Dùng khi Coach hỏi "hôm nay nên làm gì", "có việc gì gấp",
  hoặc sau khi nhận báo cáo sáng 8h. Không phải báo cáo tóm tắt — là kế
  hoạch hành động ngắn (3 bullets, mỗi bullet 1 dòng).
---
```

- **Pattern**: 5 (Domain-specific intelligence).
- **MCP gọi**: `biz__get_daily_ops_digest`.
- **Khác báo cáo sáng 8h**: skill này **chuyển dữ liệu → quyết định**, không chỉ liệt kê.

---

## 12. Checklist tự soát trước khi nộp 1 skill (PDF Reference A)

### Before start
- [ ] 2-3 use case cụ thể.
- [ ] Tools nào (built-in / MCP / cả hai).
- [ ] Folder structure đã planning.

### During development
- [ ] Folder kebab-case.
- [ ] `SKILL.md` đúng tên (case-sensitive).
- [ ] `---` delimiter ở frontmatter.
- [ ] `name` kebab-case, không space, không capital.
- [ ] `description` có WHAT + WHEN + trigger phrases.
- [ ] Không có `<` hoặc `>` ở bất kỳ đâu trong frontmatter.
- [ ] Instructions actionable, có error handling, có example.

### Before upload
- [ ] Triggering tests pass (≥ 90% trên 10–20 query).
- [ ] Functional test pass.
- [ ] **Compress thành .zip** (Anthropic UI cần zip).

### After upload
- [ ] Test trong conversation thật.
- [ ] Monitor under/over-trigger.
- [ ] Iterate description.
- [ ] Bump `metadata.version`.

---

## 13. Khác biệt so với bản tóm tắt cũ của mình

| Điểm | Bản trước | Bản refined (đúng PDF) |
|------|-----------|------------------------|
| Số category Anthropic phân loại | 2 (chung chung) | **3** (Document creation / Workflow auto / **MCP Enhancement**) |
| Limits | nói chung "tiết kiệm context" | **SKILL.md < 5,000 từ**, **20–50 skills max** |
| Patterns | không liệt kê | **5 pattern thiết kế** rõ ràng |
| Distribution | không nhấn org-level / API | Org-wide ship 18/12/2025; API `/v1/skills` + Code Execution Tool beta |
| Forbidden | thiếu | **Cấm `<` `>` trong frontmatter**; cấm `claude*`, `anthropic*` trong name |
| Pro tip iterate | thiếu | **Iterate 1 task khó trước khi extract thành skill** |
| Optional fields | thiếu `compatibility`, `allowed-tools` | Đầy đủ |
| skill-creator | nhắc thoáng | meta-skill chính thức, dùng để build trong 15–30 phút |

---

## 14. Câu Coach nên đọc kỹ trước khi vào Day 16

Hai dòng đắt nhất trong PDF:

> *"This metadata...provides just enough information for Claude to know when each skill should be used without loading all of it into context."*
>
> — Toàn bộ thành công của skill nằm ở **chữ trong frontmatter `description`**. Body có hay đến mấy cũng vô nghĩa nếu Claude không bao giờ load skill.

> *"Iterate on a single challenging task until Claude succeeds, then extract the winning approach into a skill."*
>
> — Đừng thiết kế skill general-purpose từ đầu. **Làm 1 task khó nhất, refine cho ra hồn, rồi mới đóng gói**. Đây là pattern thực dụng nhất của agent.

---

**Hết brief.** Khi SOP Day 16 ra cụ thể, mình map vào nội dung này → dựng skill thật cho Coach (chỉ ~30 phút build skill đầu).
