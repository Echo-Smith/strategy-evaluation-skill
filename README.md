# WritingAgentBench

WritingAgentBench 是面向写作 Agent 的可复现评测基准。它把“模型写得像不像”扩展为一条完整证据链：任务与来源约束、工具轨迹、五项 Rubric、硬失败、人工接受、修改负担、延迟、成本可用性和发布门禁。

> 公开核心用于复现和比较；企业私有集用于真实业务决策。两者使用同一协议，但绝不混用数据。

[English](./README.en.md) · [方法说明](./docs/methodology.md) · [私有扩展](./docs/private-extension.md) · [Skill](./skill/writing-agent-benchmark/SKILL.md)

## 产品经理案例：Luminbuddy 如何让评测影响上线

Luminbuddy（笔润智谈）最初面对两个策略问题：是否强制来源证据闸门，以及是否默认注入个人风格记忆。团队没有只比较平均分，而是冻结同批样本，进行盲评、Holdout、真实用户接受代理和失败归因。

| 决策 | 关键证据 | 产品动作 |
| --- | --- | --- |
| 来源证据闸门 | Holdout 通过率 75% → 100%，硬失败率 18.8% → 0%，接受率 75% → 100% | 默认开启，并保留回滚开关 |
| 个人风格 Memory | 通过率 93.8% → 87.5%，接受率同步下降，新增 2 个硬失败 | 默认关闭，仅显式 opt-in |
| Lexiang-only 路由 | 24/24 命中乐享且 `knowledgeOnly=true`，全网搜索误触发为 0 | 固化来源路由回归与线上观测 |

这个案例体现的不是某个模型“更聪明”，而是产品决策可以由可审计证据推动：

```text
问题定义 → 冻结候选 → 同批运行 → 盲评/仲裁 → Badcase 根因
       → Holdout → 线上指标 → 发布门禁 → 回归资产
```

公开仓库只保留聚合结果和脱敏方法；企业知识库原文、真实 Trace、内部 Prompt 和私有 Holdout 均留在 Luminbuddy 私有命名空间。

## Benchmark 亮点

- **写作任务原生**：覆盖选题、写作、润色、查重和异常输入，而不是把通用聊天题改名为写作题。
- **质量与可靠性分离**：五项 1—5 分 Rubric 衡量质量；路由、长度、工具、隐私等作为确定性 checks，不与主观分数混算。
- **硬失败优先**：编造关键事实、改变原意、来源冲突隐瞒、隐私泄露和缺失澄清不能被平均分抵消。
- **Human-in-the-loop**：记录评审人、角色、方式、时间、标签来源和仲裁，支持中文 Excel 协作。
- **公开核心 + 私有企业集**：公开集可复现；私有 Holdout 验证真实业务，协议一致但数据隔离。
- **从评测到发布**：同时报告通过率、修改负担、接受、延迟、成本可用性、工具失败和回滚条件。

## 快速开始

```bash
npm test
npm run validate
npm run privacy:scan
node scripts/summarize.mjs benchmark/examples/reviews.valid.json
```

校验器不依赖云服务或模型凭证。接入真实产品时，通过 Adapter 实现：

```text
prepare(case, candidate) -> productRequest
execute(productRequest) -> rawTrace
normalize(rawTrace) -> WABench output
collectOutcome(traceId) -> WABench outcome[]
```

## 目录

```text
benchmark/   Rubric、根因分类和脱敏示例
schemas/     WABench Schema v1
scripts/     校验、汇总和隐私扫描 CLI
skill/       可安装的 writing-agent-benchmark Skill
docs/        中英文方法与私有扩展说明
tests/       契约、评分和隐私测试
```

## 当前范围

本版本完成协议、Rubric、根因、CLI 和 Skill。60—100 条公开核心集及 Luminbuddy V1/V2 Adapter 将在后续任务中按同一协议加入。

## License

[MIT](./LICENSE)
