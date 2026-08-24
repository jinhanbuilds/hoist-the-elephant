# Hoist the Elephant

[English](README.md)

一个只在用户明确调用时使用的 Agent Skill：当长对话被一轮轮局部修正带偏，先把惯性停下来，再恢复真正应该支配后续工作的主线。

> **当大象开始摇摆，不要继续推它。把它吊起来。**

长对话里的每一次纠正都可能单独合理，但整体方向却越来越不像最初真正要解决的问题。Agent 紧跟最新反馈、发生过度修正、再次被纠正，最后让一个局部坏案例取代更高层的使命。

Hoist the Elephant 会中断这股惯性，重新阅读相关对话，恢复用户拥有的使命和已经形成的认识，分开必须保持的原则与可以调整的实现选择；完整重述后先停下来，让用户确认，再继续原来的任务。

[阅读完整产品故事](docs/product-story.zh-CN.md)

## 什么时候使用

- 最近每次反馈都合理，但整体结果越来越不对；
- Agent 在两个极端之间反复摇摆；
- 一个坏案例正在变成越来越多的永久规则；
- 已接受、否决和修正的内容太多，主线开始模糊；
- 执行依然聪明，但你怀疑它正在聪明地走错方向。

## 一行安装

```bash
npx skills add jinhanbuilds/hoist-the-elephant --skill hoist-the-elephant -y
```

本包遵循 [Agent Skills 规范](https://agentskills.io/specification)。上述命令使用跨宿主的 `skills` CLI；需要明确选择已支持宿主时可追加 `--agent <host>`。手动安装时，把 `skills/hoist-the-elephant/` 复制到目标宿主会扫描的目录；支持共享约定的宿主可以使用 `~/.agents/skills/hoist-the-elephant/`。

核心 `SKILL.md` 不绑定宿主。`skills/hoist-the-elephant/agents/openai.yaml` 与 `.codex-plugin/plugin.json` 是可选的 OpenAI／ChatGPT／Codex 元数据；兼容的非 OpenAI 宿主可以忽略。重新定锚要求宿主能够访问相关对话历史；历史不可见或相互冲突时，本 Skill 会明确缺口，不会自行补造。

安装后重新打开 Agent 宿主，并明确调用：

```text
$hoist-the-elephant
```

本 Skill 明确关闭隐式触发。重置当前对话依据是一个实质动作，应由用户决定何时发起。

## 调用后会发生什么

Agent 应当：

1. 停止继续扩展当前方案。
2. 重读相关对话，而不是只相信短摘要。
3. 恢复真实使命、已有认识、硬约束、偏好和已否决方向；如果可见历史不足或冲突，明确未知并请用户纠正，不假装已经完整找回。
4. 只在有助于避免再次偏离时，说明局部修正怎样造成了偏航。
5. 充分重述能够支配下一步的主线。
6. 停下来请用户确认或纠正。

重置后不会自动继续实施。

## 边界

- 不是普通总结，也不是机械回到第一条消息。
- 不假定最早或最新表达天然正确。
- 不创建长期记忆、使命文件、任务数据库或新项目计划。
- 不删除旧工作，不修改来源文件。
- 不静默选择新方向；恢复后的主线必须由用户确认。

## 包含内容

- `skills/hoist-the-elephant/`：完整运行 Skill。
- `docs/product-story.zh-CN.md`：原有独立产品故事与机制说明。
- `.codex-plugin/plugin.json`：可选的 OpenAI／ChatGPT／Codex Plugin 元数据。
- `scripts/`、`tests/`：包校验、可重复发布构建，以及仅供维护者使用的本地安装同步。

## 状态与验证

最新版本：**[v0.1.0](https://github.com/jinhanbuilds/hoist-the-elephant/releases/tag/v0.1.0)**。

```bash
npm run validate
npm test
npm run build
```

结构校验通过不等于真实效果已经被证明。它应该在确实发生局部修正偏航的长对话中验证，并以用户是否确认恢复后的主线为核心验收信号。

## License

[MIT](LICENSE) © 2026 Jinhan
