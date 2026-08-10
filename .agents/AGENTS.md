# Workspace Agent Rules

## Skill & MCP Usage Guidelines
For **every prompt**:
1. Scan available Skills (`frontend-design`, `ui-ux-pro-max`, `awwwards-animations`, `high-end-visual-design`, `clean-code-refactor`, `graphify` vb.) and MCP Servers (`21st-dev`, `shadcn`, `playwright`, `fetch`, `filesystem`, `memory`, `graphify`).
2. **Independent Tool Selection**: Skills and MCP Servers operate independently. You do NOT need to call an MCP server to use a Skill, and you do NOT need a Skill to use an MCP server. Use whichever applies to the task.
3. **MUST BE THE FIRST LINE** of the response, expressed in present/future starting tense ("işleme başlıyorum"):
   - **If matching Skill(s) and/or MCP(s) are used:** `🔍 **Tespit Edilen Araçlar:** Bu görev için **[Kullanılan Skill/MCP Adı]** araçlarını tespit ettim, bunları kullanarak işleme başlıyorum.`
   - **If none apply:** `🔍 **Tespit Edilen Araçlar:** Bu görev için özel bir Skill veya MCP bulunamadı / gerekmiyor. Standart araçlarla devam ediyorum.`
4. **Design & Code Excellence**: Enforce top-tier UI/UX design standards, smooth micro-interactions, responsive ergonomics, clean code principles, and zero false claims.
