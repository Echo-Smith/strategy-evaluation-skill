# Strategy Evaluation Skill

一个面向写作助手的可复策略评测工具包，帮助团队比较 Prompt、Memory、检索、工具和交互策略，并通过盲评、真实用户接受、Holdout 和回归门禁决定是否上线。

## 内容

- `skill/SKILL.md`：可供 Codex/Agent 使用的 Strategy Evaluation Skill。
- `skill/agents/openai.yaml`：Skill 的界面元数据。
- `docs/strategy-evaluation-sop.md`：中文评测 SOP。
- `docs/strategy-evaluation-sop.en.md`：英文评测 SOP。
- `README.en.md`：English overview.

## 核心流程

定义数据契约 → 固定 Rubric 与 Badcase → 运行成对策略实验 → 生成中文 Excel 盲评 → 导入真实用户接受数据 → 冻结候选 → Holdout → 上线或回滚。

## 适用场景

- Prompt 或 Memory 策略前后对比
- 检索和来源证据闸门评估
- 一次生成与研究—写作—审校流程比较
- 写作助手的选题、写作、润色、查重和异常输入评测
- 乐享/IMA 知识库来源路由回归

## 重要原则

- 开发集用于筛选，Holdout 用于验证泛化。
- 每次只改变一个策略变量。
- 评测者接受和真实用户接受分开记录。
- 硬失败不能被平均分抵消。
- 不伪造缺失的评测或用户数据。
- 公开报告不得包含私有知识库正文、凭证、Prompt 或模型配置。

## 使用 Skill

将 `skill/` 目录安装到你的 Agent Skill 目录，然后使用 `$strategy-evaluation` 触发。

详细流程见 [中文 SOP](docs/strategy-evaluation-sop.md) 和 [English SOP](docs/strategy-evaluation-sop.en.md)。

## License

MIT
