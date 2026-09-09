import type { ReactNode } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { ContentFigureView } from "@/components/content-figure";
import type { ContentFigure, ContentImage, ContentSource } from "@/lib/content-schema";

export type BlogPost = {
  slug: string;
  date: string;
  updatedAt: string;
  readingMinutes: number;
  cover: ContentImage;
  bodyVisuals: readonly ContentFigure[];
  sources: readonly ContentSource[];
  relatedSlugs: readonly string[];
  tags: Record<Locale, string[]>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  content: Record<Locale, ReactNode>;
};

const h2 = "mt-10 text-2xl font-semibold tracking-[-0.02em] text-[var(--foreground)]";
const p = "mt-4 text-base leading-8 text-[var(--muted)]";
const ul = "mt-4 list-disc space-y-2 pl-6 text-base leading-8 text-[var(--muted)]";
const strong = "font-semibold text-[var(--foreground)]";

const firstWorkflowCover: ContentImage = {
  src: "/blog/why-first-ai-workflow-needs-human-review/cover.webp",
  width: 1200,
  height: 630,
  alt: {
    zh: "独立工作者在两套方案间做最终判断，猫头鹰和小狗 AI 伙伴在旁整理素材与检查清单",
    en: "A solo operator makes the final choice between two options while owl and dog AI partners organize material and a checklist",
  },
};

const firstWorkflowScene: ContentFigure = {
  id: "human-review-before-next-step",
  kind: "scene",
  src: "/blog/why-first-ai-workflow-needs-human-review/scene-01.webp",
  width: 1600,
  height: 900,
  alt: {
    zh: "猫头鹰 AI 伙伴把零散卡片整理成两组，独立工作者正在放下代表确认的圆形标记",
    en: "An owl AI partner sorts loose cards into two groups while a solo operator places an approval token",
  },
  caption: {
    zh: "先让 AI 把材料整理成可比较的选项，再由你确认是否继续。",
    en: "Let AI prepare reviewable options first; you decide whether the workflow continues.",
  },
};

const firstWorkflowProductCase: ContentFigure = {
  id: "first-workflow-agent-workspace",
  kind: "screenshot",
  src: "/blog/why-first-ai-workflow-needs-human-review/screenshot-01.png",
  width: 1440,
  height: 1000,
  alt: {
    zh: "MotiClaw AI 伙伴管理页展示一组本地示例伙伴，以及每位伙伴的职责、状态、技能和任务数量",
    en: "The MotiClaw AI partner management page shows a local sample team with each partner's role, status, skills, and task counts",
  },
  caption: {
    zh: "先从列表里选出最贴近当前重复事务的一位，把职责和确认点跑清楚，再决定还需要哪些伙伴。",
    en: "Choose the partner closest to the recurring task, prove the role and approval point, then decide which other partners are useful.",
  },
  capturedAt: "2026-07-14T16:11:43.465Z",
  appVersion: "0.3.3",
  dataMode: "synthetic",
  scenarioId: "solo-operator-overview",
  fixtureVersion: "2026.07.14.2",
  fixtureSha256: "aaebab4b9eb169e5dc35213c87f0a53c324e98ef2509dcd2a18fd5c3e018ac08",
  productGitDirty: false,
  productGitSha: "3c596f2375044c38f6112757bbfb61c5d2ad1d4a",
};

const firstWorkflowSources: readonly ContentSource[] = [
  {
    title: "Anthropic — Building effective agents",
    url: "https://www.anthropic.com/engineering/building-effective-agents",
    accessedAt: "2026-07-14",
  },
  {
    title: "OpenAI — A practical guide to building agents",
    url: "https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/",
    accessedAt: "2026-07-14",
  },
  {
    title: "METR — Task-Completion Time Horizons of Frontier AI Models",
    url: "https://metr.org/time-horizons/",
    accessedAt: "2026-07-14",
  },
  {
    title: "Hacker News — 300 Founders, 3M LOC, 0 engineers. Here's our workflow",
    url: "https://news.ycombinator.com/item?id=47279224",
    accessedAt: "2026-07-14",
  },
];

const stopConditionsCover: ContentImage = {
  src: "/blog/solo-ai-workflow-stop-conditions/cover.webp",
  width: 1200,
  height: 630,
  alt: {
    zh: "独立工作者用珊瑚色圆牌停止重复循环，并在重新开始前检查结果卡片",
    en: "A solo operator stops a repeating loop with a coral token and checks the result card before restarting",
  },
};

const stopConditionsProductCase: ContentFigure = {
  id: "exception-recovery-confirmation",
  kind: "screenshot",
  src: "/blog/solo-ai-workflow-stop-conditions/screenshot-01.png",
  width: 1440,
  height: 1000,
  alt: {
    zh: "MotiClaw 问题修复页显示内容发布任务已重新接续，准备环境、检查状态、确认伙伴与确认结果四步均已完成",
    en: "The MotiClaw repair page shows a publishing task reconnected after environment preparation, status checks, partner confirmation, and result confirmation",
  },
  caption: {
    zh: "异常处理不是继续碰运气：先检查状态，恢复任务，再由人确认结果是否真的可用。",
    en: "Recovery is not another blind attempt: check the state, restore the task, then have a person confirm the result is actually usable.",
  },
  capturedAt: "2026-07-17T01:04:24.286Z",
  appVersion: "0.3.3",
  dataMode: "synthetic",
  scenarioId: "exception-recovery",
  fixtureVersion: "2026.07.14.2",
  fixtureSha256: "e49c5e3321c8e7c0c70b46ed85fb12d03ca44329bea2a863d01812a1a3c65174",
  productGitDirty: false,
  productGitSha: "3c596f2375044c38f6112757bbfb61c5d2ad1d4a",
};

const stopConditionsSources: readonly ContentSource[] = [
  {
    title: "OpenAI — A practical guide to building agents",
    url: "https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/",
    accessedAt: "2026-07-17",
  },
  {
    title: "Google Cloud — Retry strategy",
    url: "https://docs.cloud.google.com/storage/docs/retry-strategy",
    accessedAt: "2026-07-17",
  },
  {
    title: "NIST — AI Risk Management Framework Core",
    url: "https://airc.nist.gov/airmf-resources/airmf/5-sec-core/",
    accessedAt: "2026-07-17",
  },
  {
    title: "Hacker News — AI agents break rules under everyday pressure",
    url: "https://news.ycombinator.com/item?id=46067995",
    accessedAt: "2026-07-17",
  },
];

const contextBudgetCover: ContentImage = {
  src: "/blog/one-person-business-context-budget/cover.webp",
  width: 1200,
  height: 630,
  alt: {
    zh: "独立工作者从一大叠材料中挑选两张关键卡片，龙虾连帽服宠物伙伴拿着小文件夹等待确认",
    en: "A solo operator selects two essential cards from a large pile while a lobster-hoodie pet partner waits with a small folder",
  },
};

const contextBudgetProductCase: ContentFigure = {
  id: "context-packet-publishing-loop",
  kind: "screenshot",
  src: "/blog/one-person-business-context-budget/screenshot-01.png",
  width: 1440,
  height: 1000,
  alt: {
    zh: "MotiClaw 发布空间把客户反馈、产品进展和下一步计划整理成核心素材，并为即刻、X 和 Threads 准备不同草稿",
    en: "MotiClaw Publish Space turns customer feedback, product progress, and next steps into core material, then prepares separate drafts for Jike, X, and Threads",
  },
  caption: {
    zh: "先把稳定事实整理成一份可复用的核心素材，再让不同渠道各自改写，最后只保留一次人工确认。",
    en: "Prepare one reusable packet of stable facts, let each channel adapt it, and keep one final human confirmation.",
  },
  capturedAt: "2026-07-18T01:03:06.348Z",
  appVersion: "0.3.3",
  dataMode: "synthetic",
  scenarioId: "content-publishing-loop",
  fixtureVersion: "2026.07.14.2",
  fixtureSha256: "697dde02cb0f0d307d1fc93fe6da60f3acc8dcf80d8eef6de14c54ee9030d869",
  productGitDirty: false,
  productGitSha: "3c596f2375044c38f6112757bbfb61c5d2ad1d4a",
};

const contextBudgetSources: readonly ContentSource[] = [
  {
    title: "OpenAI — Harness engineering: leveraging Codex in an agent-first world",
    url: "https://openai.com/index/harness-engineering/",
    accessedAt: "2026-07-18",
  },
  {
    title: "Anthropic — Effective harnesses for long-running agents",
    url: "https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents",
    accessedAt: "2026-07-18",
  },
  {
    title: "OpenAI — A practical guide to building agents",
    url: "https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/",
    accessedAt: "2026-07-18",
  },
  {
    title: "Hacker News — AI-docs (Git-based workflow to manage AI-generated memory files)",
    url: "https://news.ycombinator.com/item?id=44490399",
    accessedAt: "2026-07-18",
  },
];

const partnerReliabilityCover: ContentImage = {
  src: "/blog/measure-ai-partner-reliability/cover.webp",
  width: 1200,
  height: 630,
  alt: {
    zh: "独立经营者和龙虾连帽服宠物伙伴检查分组后的任务标记，并把一枚珊瑚色异常标记留给人工判断",
    en: "A solo operator and lobster-hoodie pet partners review grouped task tokens while one coral exception waits for a human decision",
  },
};

const partnerReliabilityProductCase: ContentFigure = {
  id: "weekly-ai-partner-reliability-review",
  kind: "screenshot",
  src: "/blog/measure-ai-partner-reliability/screenshot-01.png",
  width: 1440,
  height: 1000,
  alt: {
    zh: "MotiClaw AI 伙伴管理页汇总 15 位伙伴的工作、空闲、离线与异常状态，并展示每位伙伴的任务数和使用量",
    en: "The MotiClaw AI partner page summarizes working, idle, offline, and failed states across 15 partners with task counts and usage for each partner",
  },
  caption: {
    zh: "先从全局状态里找到离线和异常，再打开对应伙伴的任务与最近活动，决定本周要修什么。",
    en: "Start with offline and failed states, then inspect that partner's tasks and recent activity before deciding what to fix this week.",
  },
  capturedAt: "2026-08-10T04:26:53.487Z",
  appVersion: "0.3.3",
  dataMode: "synthetic",
  scenarioId: "solo-operator-overview",
  fixtureVersion: "2026.07.14.2",
  fixtureSha256: "aaebab4b9eb169e5dc35213c87f0a53c324e98ef2509dcd2a18fd5c3e018ac08",
  productGitDirty: false,
  productGitSha: "3c596f2375044c38f6112757bbfb61c5d2ad1d4a",
};

const partnerReliabilitySources: readonly ContentSource[] = [
  {
    title: "Google SRE Book, Service Level Objectives",
    url: "https://sre.google/sre-book/service-level-objectives/",
    accessedAt: "2026-08-10",
  },
  {
    title: "GitHub Docs, About GitHub Actions metrics",
    url: "https://docs.github.com/en/actions/concepts/metrics",
    accessedAt: "2026-08-10",
  },
  {
    title: "OpenTelemetry, Semantic Conventions for GenAI agent and framework spans",
    url: "https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-agent-spans.md",
    accessedAt: "2026-08-10",
  },
  {
    title: "OpenTelemetry, GenAI attribute registry",
    url: "https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/",
    accessedAt: "2026-08-10",
  },
];

const promptInjectionCover: ContentImage = {
  src: "/blog/protect-channel-agents-from-prompt-injection/cover.webp",
  width: 1200,
  height: 630,
  alt: {
    zh: "独立经营者检查一张外部卡片，龙虾连帽服宠物伙伴把其余卡片放进隔离托盘，工具箱保持上锁",
    en: "A solo operator reviews an external card while a lobster-hoodie pet partner places the rest in a quarantine tray beside a locked toolbox",
  },
};

const promptInjectionProductCase: ContentFigure = {
  id: "channel-content-human-review-board",
  kind: "screenshot",
  src: "/blog/protect-channel-agents-from-prompt-injection/screenshot-01.png",
  width: 1440,
  height: 1000,
  alt: {
    zh: "MotiClaw 任务看板把客户声音分为待处理、推进中、待验收和已完成，并在待验收卡片上提供通过与驳回操作",
    en: "The MotiClaw task board separates customer feedback into pending, in progress, awaiting review, and completed, with accept and reject actions on the review card",
  },
  caption: {
    zh: "让渠道内容先停在待处理和待验收位置，确认来源、范围与下一步后再推进。",
    en: "Keep channel content in pending and review states until its source, scope, and next action have been confirmed.",
  },
  capturedAt: "2026-08-11T07:06:20.543Z",
  appVersion: "0.3.3",
  dataMode: "synthetic",
  scenarioId: "customer-feedback-triage",
  fixtureVersion: "2026.07.14.2",
  fixtureSha256: "139471f7499b708b9237d1ab7ba913752413b292457cc2f6c5c70023070e0baa",
  productGitDirty: false,
  productGitSha: "3c596f2375044c38f6112757bbfb61c5d2ad1d4a",
};

const promptInjectionSources: readonly ContentSource[] = [
  {
    title: "OpenAI, Understanding prompt injections",
    url: "https://openai.com/safety/prompt-injections/",
    accessedAt: "2026-08-11",
  },
  {
    title: "OWASP GenAI Security Project, LLM01 Prompt Injection",
    url: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
    accessedAt: "2026-08-11",
  },
  {
    title: "Microsoft Agent Framework, Agent Safety",
    url: "https://learn.microsoft.com/en-us/agent-framework/concepts/agents/safety",
    accessedAt: "2026-08-11",
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "protect-channel-agents-from-prompt-injection",
    date: "2026-08-11",
    updatedAt: "2026-08-11",
    readingMinutes: 8,
    cover: promptInjectionCover,
    bodyVisuals: [promptInjectionProductCase],
    sources: promptInjectionSources,
    relatedSlugs: [
      "solo-ai-workflow-stop-conditions",
      "why-first-ai-workflow-needs-human-review",
      "one-person-business-context-budget",
    ],
    tags: {
      zh: ["AI Agent 提示词注入防护", "渠道安全", "人工确认"],
      en: ["AI agent prompt injection", "Channel safety", "Human approval"],
    },
    title: {
      zh: "AI Agent 提示词注入防护，先从信任边界做起",
      en: "Protect Channel Agents from Prompt Injection with Clear Trust Boundaries",
    },
    description: {
      zh: "AI 伙伴接入群聊、网页和文件后，把第三方内容当作不可信数据，缩小读取与工具权限，并在发送、删除和改权限前保留确定性校验与人工确认。",
      en: "Treat third-party messages, pages, and files as untrusted data, narrow data and tool access, and keep deterministic checks and human approval before consequential actions.",
    },
    content: {
      zh: (
        <>
          <p className={p}>
            AI 伙伴接上群聊、网页和文件以后，一条看似普通的内容就可能改变它接下来做什么。有人可以在消息里夹带忽略原任务、读取别处资料或代替你发送结果的指令。OpenAI 把这类提示词注入解释为一种针对对话式 AI 的社会工程攻击，第三方内容试图让 AI 做出用户没有要求的动作。
          </p>
          <p className={p}>
            我觉得个人经营场景里，最实用的起点是把每条外部内容都当作数据。它可以提供事实和线索，却不能改写任务目标、扩大访问范围，也不能决定消息发给谁。AI 先整理，人和确定性规则共同决定能不能继续。
          </p>

          <h2 className={h2}>一条安全提示词挡不住所有外部内容</h2>
          <p className={p}>
            间接注入可以藏在网页、文件、聊天记录和图片里。OWASP 的提示词注入说明指出，检索增强和微调也无法完整消除这类风险。只让模型记住一句不要听陌生指令，仍然把识别与执行都压在同一次概率判断上。
          </p>
          <p className={p}>
            更稳妥的做法会分开内容与权限。外部消息只进入材料区，工具只拿到当前任务需要的最小范围。模型输出还要经过格式、类型、范围和允许值检查。发送消息、删除文件、修改权限这类有副作用的动作停在确认位置。
          </p>

          <h2 className={h2}>先为一条渠道任务画清两道边界</h2>
          <p className={p}>
            假设你让 AI 伙伴整理本周客户群里的反馈。第一道边界管输入，只读取指定群和指定时间内的消息，不因为消息正文要求就打开其他文件夹或知识库。第二道边界管动作，结果只能进入待确认清单，不能自动回复客户、删除原消息或调整群权限。
          </p>
          <ul className={ul}>
            <li><span className={strong}>把来源留在结果旁边。</span> 每条分类都带回原消息位置，材料不足时进入待确认，不让模型用猜测补齐。</li>
            <li><span className={strong}>把动作参数交给代码检查。</span> 群组、文件路径、收件人和数量只接受允许范围，任何越界值都停止执行。</li>
          </ul>
          <p className={p}>
            Microsoft 的 Agent Safety 文档把用户输入、历史记录、上下文服务、模型与工具都视为需要检查的信任边界，并要求把模型生成的工具参数当成不可信输入。允许列表、类型和范围限制负责挡住确定性错误，人工确认负责处理高风险与不可逆动作。
          </p>

          <ContentFigureView visual={promptInjectionProductCase} locale="zh" />

          <h2 className={h2}>让外部内容停在待处理位置</h2>
          <p className={p}>
            这张 MotiClaw 合成示例看板把客户声音分为待处理、推进中、待验收和已完成。待验收卡片保留通过与驳回，适合让一个人先确认来源、任务范围和结果，再决定是否推进。渠道里出现任何试图改写目标的内容，也只能先作为材料进入这条路径。
          </p>
          <p className={p}>
            这里展示的是可复核的任务流。MotiClaw 文档确认 AI 伙伴可以接入飞书，并说明渠道收发与模型调用会按任务所需出网，任务执行、中间产物和日志默认留在设备上。当前证据没有说明产品内置了专用提示词注入检测器，因此防护仍要靠任务范围、最小权限、参数校验和人工确认共同完成。
          </p>

          <h2 className={h2}>权限越靠近真实动作，范围就要越小</h2>
          <p className={p}>
            OpenAI 的安全建议强调，只给 Agent 当前任务需要的数据访问，并在发送邮件、购买等重要动作前仔细复核。OWASP 也建议采用最小权限，把高风险操作交给人工批准。放到一个人的日常工作里，可以先让新渠道只做读取、归类和草稿。连续跑过一段稳定任务以后，再逐项开放可撤销的小动作。
          </p>
          <p className={p}>
            今天就能检查一条现有工作流。写下它允许读取的来源、允许产生的结果，以及必须停下来找你的动作。再把外部内容、模型输出和工具参数都放进不可信一侧。工作数据默认留在本机；仅你主动接入的渠道与模型调用按任务所需出网。边界写得越具体，AI 伙伴越容易把材料整理好，也越难被一条陌生内容带去做越界的事。
          </p>
        </>
      ),
      en: (
        <>
          <p className={p}>
            Once an AI partner can read group chats, web pages, and files, an ordinary-looking item can influence what it does next. A message may contain instructions to ignore the assigned task, reach into another data source, or send a result on your behalf. OpenAI describes prompt injection as social engineering for conversational AI, where third-party content tries to make the AI do something the user never requested.
          </p>
          <p className={p}>
            A practical starting point for a solo operator is to treat every external item as data. It may supply facts and clues. It cannot redefine the task, widen access, or choose a recipient. The AI prepares the material, while deterministic rules and a person decide whether work continues.
          </p>

          <h2 className={h2}>One safety instruction cannot cover every external item</h2>
          <p className={p}>
            Indirect injections can be hidden in pages, files, chat history, and images. OWASP notes that retrieval augmentation and fine-tuning do not fully remove this risk. Telling a model to ignore suspicious instructions still leaves both detection and execution inside one probabilistic decision.
          </p>
          <p className={p}>
            A safer design separates content from authority. External messages enter a material area, and tools receive only the access needed for the assigned task. Output then passes format, type, range, and allow-list checks. Actions with side effects, including sending messages, deleting files, or changing permissions, stop for approval.
          </p>

          <h2 className={h2}>Draw two boundaries around one channel task</h2>
          <p className={p}>
            Suppose an AI partner is sorting this week&apos;s feedback from a customer group. The input boundary lets it read only that group and that time window. Instructions inside a message cannot open other folders or knowledge bases. The action boundary limits the result to a review list. It cannot reply to a customer, delete the original message, or change group permissions.
          </p>
          <ul className={ul}>
            <li><span className={strong}>Keep the source beside the result.</span> Every classification points back to the original item, and missing material goes to review instead of being guessed.</li>
            <li><span className={strong}>Validate action arguments in code.</span> Groups, file paths, recipients, and quantities must stay inside known allowed values. Anything outside the range stops.</li>
          </ul>
          <p className={p}>
            Microsoft&apos;s Agent Safety guidance treats user input, history, context services, the model, and tools as trust boundaries. It also says model-generated tool arguments should be handled as untrusted input. Allow lists and type or range checks catch deterministic violations, while human approval covers sensitive and irreversible actions.
          </p>

          <ContentFigureView visual={promptInjectionProductCase} locale="en" />

          <h2 className={h2}>Keep external content in a pending state</h2>
          <p className={p}>
            This synthetic MotiClaw board separates customer feedback into pending, in progress, awaiting review, and completed. The review card retains accept and reject actions, giving a solo operator a place to confirm the source, scope, and result before work moves forward. Content that tries to rewrite the goal remains material inside the same controlled path.
          </p>
          <p className={p}>
            The screenshot demonstrates a reviewable task flow. MotiClaw documentation confirms that AI partners can connect to Feishu and explains that connected channels and model calls go online as the task requires, while task execution, intermediate artifacts, and logs stay on the device by default. Current evidence does not claim a dedicated prompt-injection detector in the product. The protection described here comes from task scope, least privilege, argument validation, and human approval working together.
          </p>

          <h2 className={h2}>Narrow permission as it gets closer to a real action</h2>
          <p className={p}>
            OpenAI recommends limiting an agent to the data it needs and carefully reviewing important actions such as sending email or making a purchase. OWASP also recommends least privilege and human approval for high-risk operations. A new channel can begin with reading, classification, and drafts. After a stable run of repeated work, open small and reversible actions one at a time.
          </p>
          <p className={p}>
            You can check one existing workflow today. Write down the sources it may read, the results it may prepare, and the actions that must return to you. Place external content, model output, and tool arguments on the untrusted side of that boundary. Work data stays on your device by default; only channels you connect and model calls go online as the task requires. Specific boundaries make it easier for an AI partner to prepare useful material and harder for an unfamiliar item to drive an unauthorized action.
          </p>
        </>
      ),
    },
  },
  {
    slug: "measure-ai-partner-reliability",
    date: "2026-08-10",
    updatedAt: "2026-08-10",
    readingMinutes: 8,
    cover: partnerReliabilityCover,
    bodyVisuals: [partnerReliabilityProductCase],
    sources: partnerReliabilitySources,
    relatedSlugs: [
      "solo-ai-workflow-stop-conditions",
      "why-first-ai-workflow-needs-human-review",
      "one-person-business-context-budget",
    ],
    tags: {
      zh: ["AI Agent 可观测性", "可靠性", "超级个体"],
      en: ["AI agent observability", "Reliability", "Solo operators"],
    },
    title: {
      zh: "AI 伙伴稳不稳定，别只看某一次回答",
      en: "Do Not Judge an AI Partner by One Good Answer",
    },
    description: {
      zh: "把任务完成率、等待与运行耗时、失败类型和使用量放进每周巡查，用自己的业务容忍度判断 AI 伙伴是否可靠，同时只保留必要的运行元数据。",
      en: "Review completion rate, queue and run time, failure types, and usage each week. Judge reliability against your own operating tolerance while keeping only the metadata you need.",
    },
    content: {
      zh: (
        <>
          <p className={p}>
            AI 伙伴偶尔给出一份漂亮答案，最多说明这次结果可用。一个人把客户跟进、内容整理或发版检查长期交出去以后，可靠性来自另一组问题。它一周接了多少任务，多少结果通过验收，等待和运行花了多久，失败以后有没有留下能继续处理的原因。
          </p>
          <p className={p}>
            我觉得个人经营最容易忽略的是观察周期。每次只盯着最新回复，很难发现任务正在越排越久、失败集中在同一类输入，或者使用量增长却没有带来更多可验收结果。把视角拉到一周，才有机会判断这个伙伴能不能继续承担重复工作。
          </p>

          <h2 className={h2}>先把可靠写成你能承受的结果</h2>
          <p className={p}>
            Google 的 SRE 资料把 SLI 定义为服务某个方面的定量度量，把 SLO 定义为这个指标的目标值或范围，并提醒团队从用户真正关心的行为出发。个人工作流不需要照搬整套工程制度，但这个顺序很有用。先写清哪种结果对你的业务算可用，再决定记录什么。
          </p>
          <p className={p}>
            比如客户回访助手的结果可以写成，每周约定的回访任务都进入清单，有依据不足的项目明确停在待确认，未经人工确认的回复不发送。这里没有通用的百分比。客户消息错过一次可能就要当天处理，内部资料整理偶尔延迟半天也许可以接受。目标应该跟后果一起定。
          </p>

          <h2 className={h2}>每周巡查保留四组信号</h2>
          <ul className={ul}>
            <li><span className={strong}>任务完成率</span>。分母只放这周约定要完成的同类任务，分子只算已经通过你验收的结果。生成了内容却仍缺关键事实，不能记成完成。</li>
            <li><span className={strong}>等待与运行耗时</span>。等待时间持续变长，通常说明任务排队或伙伴没有及时开始。运行时间突然变长，则值得检查输入是否膨胀、工具是否卡住，或流程是否在重复尝试。</li>
            <li><span className={strong}>失败类型</span>。保留原始失败类别和最后可用状态，把短暂错误、缺少输入、需要人工决定和不可恢复问题分开。总失败数相同，处理顺序也可能完全不同。</li>
            <li><span className={strong}>使用量与可验收产出</span>。使用量只在和完成任务数、返工次数放在一起时有意义。消耗上升而可用结果没有增加，才需要继续追原因。</li>
          </ul>
          <p className={p}>
            GitHub Actions 的官方指标同样把平均运行时间、排队时间和失败率放在工作流观测里，并用使用量帮助定位高消耗任务。这个做法来自软件交付，不能直接替你决定内容或客户工作的标准。它提供的是一组可复用的观察对象。
          </p>

          <ContentFigureView visual={partnerReliabilityProductCase} locale="zh" />

          <h2 className={h2}>先看异常，再决定是否需要更多数据</h2>
          <p className={p}>
            这张 MotiClaw 示例工作台把 15 位伙伴的工作、空闲、离线和异常状态放在一起，每张卡片还能看到任务数与使用量。一个人做每周巡查时，可以先打开离线和异常伙伴，检查最近活动与任务，再决定暂停、补输入或交回人工。
          </p>
          <p className={p}>
            MotiClaw 在这里提供的是状态、任务、最近活动、健康和使用量等原始信号。本文整理的完成率与目标范围需要你根据自己的任务定义，产品当前没有被描述为自动计算 SLO。这个边界很重要，因为一张漂亮的总览仍然不能替你定义什么结果值得继续。
          </p>

          <h2 className={h2}>记录到足够排查就停</h2>
          <p className={p}>
            OpenTelemetry 为生成式 AI Agent、工作流和工具执行定义了可观测语义，并要求操作报错时记录错误类型。它也明确提醒，工具参数和结果等属性可能带有敏感信息。放到个人工作流里，最小记录可以只有任务标识、开始与结束时间、最终状态、失败类型、使用量，以及有没有经过人工处理。
          </p>
          <p className={p}>
            客户原文、完整提示词、工具参数和模型输出没有排查需要时，不要为了以后也许有用就全部保存。工作数据默认留在本机；仅你主动接入的渠道与模型调用按任务所需出网。每周固定十分钟看一次这四组信号，连续两三周后再调整目标。你会先得到一条适合自己业务的可靠性基线，然后才知道哪一项值得自动化得更深。
          </p>
        </>
      ),
      en: (
        <>
          <p className={p}>
            One polished answer proves that one result was usable. Once a solo operator relies on an AI partner for customer follow-up, content preparation, or release checks, reliability has to cover repeated work. How many assigned tasks finished, how many passed review, how long work waited and ran, and whether a failure left enough evidence for recovery all matter.
          </p>
          <p className={p}>
            The observation window is easy to miss. Watching only the latest response hides a queue that grows longer each day, failures that cluster around one input type, or usage that rises without producing more accepted work. A weekly view makes those patterns visible.
          </p>

          <h2 className={h2}>Define reliability in terms your business can tolerate</h2>
          <p className={p}>
            Google&apos;s SRE guidance describes an SLI as a quantitative measure of one aspect of service and an SLO as a target value or range for that measure. It also starts from behavior users actually care about. A personal workflow does not need the full operating system of a large service team. The useful order is to define a usable business result first, then choose the measurements that expose drift.
          </p>
          <p className={p}>
            A customer follow-up partner might be acceptable when every scheduled conversation enters the review list, uncertain items stop for clarification, and no reply is sent without approval. There is no universal percentage for this. One missed customer message may need same-day action, while an internal research task might tolerate half a day of delay. Set the target beside the consequence.
          </p>

          <h2 className={h2}>Keep four groups of signals in the weekly review</h2>
          <ul className={ul}>
            <li><span className={strong}>Task completion rate</span>. Count only the recurring tasks expected in the period, and count a completion only after it passes review. An output that still lacks a required fact remains unfinished.</li>
            <li><span className={strong}>Queue and run time</span>. A growing wait can expose a backlog or a partner that is not starting promptly. A sudden increase in run time can point to larger inputs, a stalled tool, or repeated attempts.</li>
            <li><span className={strong}>Failure type</span>. Preserve the original category and the last usable state. Temporary errors, missing inputs, human decisions, and unrecoverable failures lead to different next actions even when the total count is identical.</li>
            <li><span className={strong}>Usage beside accepted output</span>. Usage becomes useful when viewed with completed tasks and rework. Rising consumption with flat accepted output is the signal to investigate.</li>
          </ul>
          <p className={p}>
            GitHub&apos;s official Actions metrics use average run time, queue time, and failure rate to observe workflow performance, while usage metrics help identify expensive workflows and jobs. Those measures come from software delivery and cannot set the standard for customer or content work. They still offer a practical set of things to watch.
          </p>

          <ContentFigureView visual={partnerReliabilityProductCase} locale="en" />

          <h2 className={h2}>Start with exceptions before collecting more data</h2>
          <p className={p}>
            This MotiClaw sample workspace puts working, idle, offline, and failed states for 15 partners in one view. Each card also exposes task count and usage. A solo operator can begin a weekly review with the offline and failed partners, inspect recent activity and tasks, then decide whether to pause, supply missing input, or return the work to a person.
          </p>
          <p className={p}>
            MotiClaw supplies raw signals such as status, tasks, recent activity, health, and usage in this case. The completion rate and target ranges in this article remain your operating definitions. The product is not being described as an automatic SLO calculator. A clear overview still cannot decide which outcome your business should accept.
          </p>

          <h2 className={h2}>Stop recording when you can diagnose the work</h2>
          <p className={p}>
            OpenTelemetry defines observability semantics for generative AI agents, workflows, and tool execution, including an error type when an operation fails. Its attribute guidance also warns that tool arguments and results may contain sensitive information. For a personal workflow, a minimal record can be limited to a task identifier, start and end time, final state, failure type, usage, and whether a person intervened.
          </p>
          <p className={p}>
            Do not retain customer text, full prompts, tool arguments, or model output when diagnosis does not require them. Work data stays on your device by default; only channels you connect and model calls go online as the task requires. Spend ten minutes on these four signal groups each week, then adjust the targets after two or three weeks. That gives you a baseline grounded in your own work before you automate another step.
          </p>
        </>
      ),
    },
  },
  {
    slug: "one-person-business-context-budget",
    date: "2026-07-18",
    updatedAt: "2026-07-18",
    readingMinutes: 8,
    cover: contextBudgetCover,
    bodyVisuals: [contextBudgetProductCase],
    sources: contextBudgetSources,
    relatedSlugs: [
      "why-first-ai-workflow-needs-human-review",
      "solo-ai-workflow-stop-conditions",
      "indie-ai-developer-feedback-and-release",
    ],
    tags: {
      zh: ["AI 工作流", "上下文管理", "超级个体"],
      en: ["AI workflows", "Context management", "Solo operators"],
    },
    title: {
      zh: "一个人的 AI 工作流，别把全部资料都塞进上下文",
      en: "A Solo AI Workflow Does Not Need Your Entire Archive",
    },
    description: {
      zh: "AI 工作流缺上下文会反复追问，上下文过多又会挤掉真正重要的信息。用目标、真值来源、当前状态和验收条件组成最小上下文包，让重复任务少解释、可更新、能交接。",
      en: "Too little context makes an AI workflow ask the same questions; too much hides what matters. Build a minimal context packet from the goal, sources of truth, current state, and acceptance conditions.",
    },
    content: {
      zh: (
        <>
          <p className={p}>
            一个人用 AI 做重复工作，很容易在两个方向上同时浪费时间：材料给少了，它每轮都要重新问背景；材料给多了，几十页聊天记录、旧文档和临时想法一起塞进去，真正影响这次结果的几条事实反而被埋住。
          </p>
          <p className={p}>
            我更倾向于把上下文当成一笔有限预算。目标不是把你知道的一切交给 AI，而是让它能找到当前任务需要的真值，并且知道什么时候应该停下来问你。
          </p>

          <h2 className={h2}>上下文越多，不等于工作流越懂你</h2>
          <p className={p}>
            OpenAI 在介绍 Codex harness 的实践时，专门提到一份巨大的说明文件会挤占任务、代码和相关文档的位置；他们最后采用的是一张短地图，指向结构化、可验证的真值来源。Anthropic 对长时间 Agent 的实验也发现，单靠上下文压缩并不足以跨会话稳定工作，后续任务还需要看得见的进度文件和清楚的当前状态。
          </p>
          <p className={p}>
            这些是软件工程场景的一手实践，不能直接证明每个内容、销售或客户跟进工作流都要用同样的文件结构。但它说明了一个可以迁移的判断：<span className={strong}>上下文的价值不在体积，而在它能不能把 AI 带到正确的事实、当前进度和下一步。</span>
          </p>
          <p className={p}>
            社区里也有人把提示词、记忆、临时笔记和规则单独做成版本化文件，起因正是这些材料长期堆在一起以后变得混乱。这只是一个实践信号，不是通用结论。不过对一个人经营业务来说，维护成本已经足够值得警惕：每多放一份材料，就多一份过期、冲突和误用的可能。
          </p>

          <h2 className={h2}>最小上下文包只需要四部分</h2>
          <ul className={ul}>
            <li><span className={strong}>这次要完成什么</span>：写成一个可以检查的结果，不要只写“帮我处理一下”。例如“把本周产品进展整理成三份渠道草稿，发布前交回确认”。</li>
            <li><span className={strong}>真值去哪里找</span>：给来源和优先级，不把全文重复粘贴。产品状态看哪份记录，用户原话看哪个入口，冲突时以谁为准，都要能定位。</li>
            <li><span className={strong}>现在已经到哪一步</span>：保留最新完成项、待处理项和已知缺口。跨会话继续时，AI 先读状态，不用从历史聊天里猜。</li>
            <li><span className={strong}>什么结果才算通过</span>：写清输出格式、必须保留的事实、不能做的动作，以及哪一步必须交回人工。</li>
          </ul>
          <p className={p}>
            OpenAI 的 Agent 指南建议从已有 SOP 和政策文档建立指令，把密集材料拆成更清楚的步骤，并让每一步对应具体动作或输出。放到个人工作流里，最实用的不是再写一篇万能提示词，而是把上面四部分做成一张会更新的任务卡。
          </p>

          <ContentFigureView visual={contextBudgetProductCase} locale="zh" />

          <h2 className={h2}>先整理一次，再让不同任务按需取用</h2>
          <p className={p}>
            这张 MotiClaw 示例工作台里，一位独自经营产品的人先把客户反馈、产品进展和下一步计划整理成一份核心素材，再交给即刻、X 和 Threads 分别改写。三个渠道不需要各听一遍完整背景，最终发布也没有自动越过人工确认。
          </p>
          <p className={p}>
            这更接近一个可维护的上下文包：稳定事实只整理一次，渠道语气按任务变化，发布权仍留在人手里。MotiClaw 在这个案例里提供的是整理、分发草稿和人工确认的产品路径；外部项目关于上下文管理的做法只是设计参考，不能反过来证明 MotiClaw 已经提供它们的全部底层能力。
          </p>

          <h2 className={h2}>什么时候该补，什么时候该删</h2>
          <ul className={ul}>
            <li>AI 连续追问同一个背景，而且答案确实会在后续任务复用时，把它补进真值来源或当前状态。</li>
            <li>材料只解释一次性的讨论过程，最终决定已经写进正式记录时，删掉过程，只保留决定与理由。</li>
            <li>两份资料互相冲突时，不继续加第三份摘要；先标出 owner、更新时间和优先级。</li>
            <li>任务结束后，只沉淀下次会复用的事实、规则和验收项，临时推理留在本轮记录里。</li>
          </ul>
          <p className={p}>
            你可以从下一件每周重复的工作开始：新建一张任务卡，只写目标、真值来源、当前状态和验收条件，然后跑三轮。每次 AI 追问，先判断这是长期缺口还是本轮例外；只有长期缺口才写回上下文包。工作数据默认留在本机；仅你主动接入的渠道与模型调用按任务所需出网。上下文能被持续删减和校正，才真正开始为你节省解释成本。
          </p>
        </>
      ),
      en: (
        <>
          <p className={p}>
            A solo operator can waste time in two opposite ways. Give an AI workflow too little context and it asks for the same background every run. Give it everything—old chats, outdated documents, and half-formed ideas—and the few facts that matter now disappear inside the pile.
          </p>
          <p className={p}>
            Treat context as a limited budget. The goal is not to transfer everything you know. It is to help the workflow find the right source of truth, understand the current state, and know when it must stop and ask you.
          </p>

          <h2 className={h2}>More context does not mean more understanding</h2>
          <p className={p}>
            OpenAI&apos;s account of building a Codex harness describes how a giant instruction file crowded out the task, code, and relevant documentation. The team replaced it with a short map pointing to structured, verifiable sources of truth. Anthropic&apos;s work on long-running agents reached a related conclusion: compaction alone was not enough for reliable handoffs across context windows; later sessions also needed visible progress artifacts and an explicit current state.
          </p>
          <p className={p}>
            These are first-party software-engineering practices, not proof that every publishing, sales, or follow-up workflow needs the same file structure. The transferable principle is narrower: <span className={strong}>context earns its place when it leads the workflow to the right facts, present state, and next action.</span>
          </p>
          <p className={p}>
            A community project for versioning prompt, memory, scratch, and rule files began from the same practical irritation: those materials mattered, but became messy when they accumulated together. That is a signal, not a universal finding. It still exposes a real maintenance cost for a one-person business: every extra item can become stale, conflict with another source, or be reused in the wrong task.
          </p>

          <h2 className={h2}>A minimal context packet has four parts</h2>
          <ul className={ul}>
            <li><span className={strong}>The outcome for this run</span>: name a result you can inspect. “Prepare three channel drafts from this week&apos;s product progress and return them for approval” is clearer than “handle this content.”</li>
            <li><span className={strong}>Where truth lives</span>: provide locations and priority instead of pasting every document. Identify the product record, the source of customer language, and which one wins when sources disagree.</li>
            <li><span className={strong}>The current state</span>: preserve completed work, remaining work, and known gaps. A new session should read state instead of reconstructing it from chat history.</li>
            <li><span className={strong}>Acceptance and handback</span>: define the output shape, facts that must survive, actions that are forbidden, and the point that requires your approval.</li>
          </ul>
          <p className={p}>
            OpenAI&apos;s agent guide recommends turning existing procedures into instructions, breaking dense material into clearer steps, and mapping each step to a concrete action or output. For a solo workflow, the useful artifact is not another universal mega-prompt. It is one task card that keeps these four fields current.
          </p>

          <ContentFigureView visual={contextBudgetProductCase} locale="en" />

          <h2 className={h2}>Organize once, then retrieve for each task</h2>
          <p className={p}>
            In this MotiClaw sample workspace, a solo product operator first turns customer feedback, product progress, and next-week plans into one core packet. Jike, X, and Threads then receive separate drafts. The operator does not repeat the full background three times, and publication still waits for one human confirmation.
          </p>
          <p className={p}>
            That is closer to maintainable context: stable facts are prepared once, channel voice changes by task, and publication authority stays with the person. MotiClaw provides the organize-draft-review path shown in this case. The external projects above are design references; their native capabilities do not prove that MotiClaw provides the same underlying systems.
          </p>

          <h2 className={h2}>Know when to add and when to delete</h2>
          <ul className={ul}>
            <li>Add a fact to the source of truth or current state when the workflow repeatedly asks for it and future runs will genuinely reuse it.</li>
            <li>Delete one-off discussion history after its final decision and rationale have moved into the durable record.</li>
            <li>When two sources conflict, do not add a third summary. Mark the owner, freshness, and priority first.</li>
            <li>At the end of a run, preserve only reusable facts, rules, and acceptance checks. Keep temporary reasoning in the run record.</li>
          </ul>
          <p className={p}>
            Start with the next task you repeat every week. Create one card with the outcome, sources of truth, current state, and acceptance conditions, then run it three times. When the workflow asks a question, decide whether it uncovered a durable gap or a one-run exception; only durable gaps enter the packet. Work data stays on your device by default; only channels you connect and model calls go online as the task requires. Context begins saving explanation time when you can keep deleting and correcting it.
          </p>
        </>
      ),
    },
  },
  {
    slug: "solo-ai-workflow-stop-conditions",
    date: "2026-07-17",
    updatedAt: "2026-07-17",
    readingMinutes: 7,
    cover: stopConditionsCover,
    bodyVisuals: [stopConditionsProductCase],
    sources: stopConditionsSources,
    relatedSlugs: [
      "why-first-ai-workflow-needs-human-review",
      "indie-ai-developer-feedback-and-release",
      "local-first-data-boundaries",
    ],
    tags: {
      zh: ["AI 工作流", "停止条件", "超级个体"],
      en: ["AI workflows", "Stop conditions", "Solo operators"],
    },
    title: {
      zh: "一个人的 AI 工作流，停止条件要写在开始之前",
      en: "Write Stop Conditions Before Your Solo AI Workflow Starts",
    },
    description: {
      zh: "AI 工作流不是多试几次就会稳定。给重试次数、重复结果和高风险动作设停止条件，保留最后一次可用结果，再决定恢复还是交回人工。",
      en: "An AI workflow does not become reliable by trying forever. Set stop conditions for retries, repeated results, and high-risk actions, preserve the last good state, then decide whether to resume or hand back to a person.",
    },
    content: {
      zh: (
        <>
          <p className={p}>
            一个人跑 AI 工作流，最危险的时刻通常不是第一次失败，而是失败以后系统还在继续。它换一种说法、再调一次工具、再生成一版，看起来一直有动作，实际上可能没有增加任何新证据。时间、调用额度和错误影响就在这种“还差一次”的循环里被放大。
          </p>
          <p className={p}>
            我更在意的不是工作流能连续跑多久，而是它能不能在不确定时停在一个可恢复的位置。<span className={strong}>停止条件应该在开始前写好，而不是出事后临时决定。</span>
          </p>

          <h2 className={h2}>停止不是失败，是把判断权拿回来</h2>
          <p className={p}>
            OpenAI 的 Agent 指南把两类人工介入触发器说得很直接：超过失败阈值，以及即将执行敏感、不可逆或高风险动作。NIST 的 AI 风险管理框架也要求运行中的系统具备监控、人工覆盖、事件响应和恢复机制。它们共同指向一个很朴素的设计：自动化可以自己往前走，但不能自己决定什么时候值得继续冒险。
          </p>
          <p className={p}>
            社区讨论里经常出现循环调用、反复修正和越改越乱的个案。这些只能算实践信号，不能证明所有 Agent 都会失控。不过它足以提醒一个人经营业务的人：不要把“模型还愿意继续”误当成“这次重试有价值”。
          </p>

          <h2 className={h2}>先写下三类停止条件</h2>
          <ul className={ul}>
            <li><span className={strong}>失败次数到上限</span>：同一个动作连续失败，且新一轮没有带来新的错误信息，就停止。具体是一两次还是更多，取决于任务成本；关键是上限由工作流计数，不交给模型自己感觉。</li>
            <li><span className={strong}>结果没有实质变化</span>：连续两版只是换措辞、换顺序，验收项仍然不通过，就停止。继续生成不是进展，只有新的证据或新的可检查结果才算。</li>
            <li><span className={strong}>下一步会扩大后果</span>：发送、付款、删除、覆盖、公开发布或改动账号权限前，直接交回人工。即使前面全部成功，高风险动作也不靠累计信心自动放行。</li>
          </ul>
          <p className={p}>
            Google Cloud 的重试文档给了一个很实用的工程边界：没有退避地重试、无条件重试非幂等操作，以及重试本来就不会自行恢复的错误，都会让问题更严重。放到个人 AI 工作流里，可以翻成一句话：<span className={strong}>只有错误可能短暂恢复、动作可以安全重复，而且每次尝试都有上限时，重试才有意义。</span>
          </p>

          <h2 className={h2}>停下来时，至少留下四样东西</h2>
          <ul className={ul}>
            <li>已经完成到哪一步，以及最后一次可用结果在哪里。</li>
            <li>最后一次失败的原始原因，不让后续摘要把它改写成猜测。</li>
            <li>本轮试过哪些动作，哪些动作明确没有效果。</li>
            <li>恢复需要谁确认、从哪一步继续，以及什么结果才算通过。</li>
          </ul>
          <p className={p}>
            这样做的价值不是让错误报告更漂亮，而是避免下一次从头猜。停止点保存的是工作状态，也是你继续、回退或放弃这条路径时的决定材料。
          </p>

          <ContentFigureView visual={stopConditionsProductCase} locale="zh" />

          <h2 className={h2}>恢复也要有验收，不是点一下“再来”</h2>
          <p className={p}>
            我们用本地示例数据复现了一次内容发布任务的异常恢复。页面没有把“重新开始”当成结果，而是依次检查准备环境、任务状态、AI 伙伴和最终结果；四步完成后，仍然把“问题修复了吗”留给人确认。这个顺序很重要：技术动作完成，只能说明恢复流程跑完了，不能替你判断业务结果是否可用。
          </p>
          <p className={p}>
            如果你准备把一件重复工作交给 AI，先在任务卡上补三行：最多重试几次，什么变化才算进展，哪一步必须停下来叫你。工作数据默认留在本机；仅你主动接入的渠道与模型调用按任务所需出网。先让失败可控，自动化才有资格长期运行。
          </p>
        </>
      ),
      en: (
        <>
          <p className={p}>
            The most dangerous moment in a solo AI workflow is often not the first failure. It is the moment after failure when the system keeps going. It rephrases an answer, calls a tool again, or produces another draft. Activity continues, but no new evidence appears. Time, model usage, and the impact of a bad action all grow inside that “one more try” loop.
          </p>
          <p className={p}>
            The useful question is not how long a workflow can run. It is whether the workflow can stop in a state you can recover. <span className={strong}>Write the stop conditions before the task starts, not after something goes wrong.</span>
          </p>

          <h2 className={h2}>Stopping is how you take judgment back</h2>
          <p className={p}>
            OpenAI&apos;s agent guide identifies two direct triggers for human intervention: exceeding a failure threshold and approaching a sensitive, irreversible, or high-risk action. NIST&apos;s AI Risk Management Framework likewise calls for monitoring, override, incident response, and recovery. The shared design principle is simple: automation may move work forward, but it should not decide for itself how much risk is worth taking.
          </p>
          <p className={p}>
            Community discussions repeatedly surface looping tool calls, repeated corrections, and fixes that create more damage. These reports are signals, not proof that every agent behaves this way. They are still enough to warn a solo operator not to confuse “the model is still trying” with “this retry is producing value.”
          </p>

          <h2 className={h2}>Define three kinds of stop condition</h2>
          <ul className={ul}>
            <li><span className={strong}>The failure limit is reached</span>: stop when the same action keeps failing and the latest attempt adds no new error evidence. The right limit depends on task cost; the important part is that the workflow counts attempts instead of asking the model how it feels.</li>
            <li><span className={strong}>The result has not materially changed</span>: stop when two outputs only rearrange wording while the same acceptance check still fails. Another draft is not progress unless it adds new evidence or a newly reviewable result.</li>
            <li><span className={strong}>The next action expands the consequence</span>: hand control back before sending, paying, deleting, overwriting, publishing, or changing account permissions. Earlier success does not automatically authorize an irreversible step.</li>
          </ul>
          <p className={p}>
            Google Cloud&apos;s retry guidance draws a useful engineering boundary: retrying without backoff, retrying non-idempotent operations unconditionally, and retrying errors that will not recover on their own can make failures worse. For a personal AI workflow, that becomes one rule: <span className={strong}>retry only when the error may be temporary, the action is safe to repeat, and the attempt count is bounded.</span>
          </p>

          <h2 className={h2}>Leave four things behind when the workflow stops</h2>
          <ul className={ul}>
            <li>The last completed step and the location of the last usable result.</li>
            <li>The original failure reason, before a later summary turns it into a guess.</li>
            <li>The actions already attempted and the ones that clearly did not work.</li>
            <li>Who must approve recovery, where work resumes, and what result will count as accepted.</li>
          </ul>
          <p className={p}>
            This is not about making an error report look tidy. It prevents the next attempt from starting with another round of guessing. A stop point preserves the work state and the material you need to continue, roll back, or abandon the path.
          </p>

          <ContentFigureView visual={stopConditionsProductCase} locale="en" />

          <h2 className={h2}>Recovery still needs acceptance</h2>
          <p className={p}>
            We reproduced the recovery of a publishing task with local sample data. The repair page does not treat “restart” as the outcome. It checks the environment, task state, AI partner, and final result in sequence, then still asks a person whether the problem is actually fixed. That order matters: completing the technical recovery path does not prove the business result is usable.
          </p>
          <p className={p}>
            Before handing a recurring task to AI, add three lines to the task card: the retry limit, what change counts as progress, and the step that must stop for you. Work data stays on your device by default; only channels you connect and model calls go online as the task requires. Make failure controllable before asking automation to run for the long term.
          </p>
        </>
      ),
    },
  },
  {
    slug: "why-first-ai-workflow-needs-human-review",
    date: "2026-07-14",
    updatedAt: "2026-07-14",
    readingMinutes: 8,
    cover: firstWorkflowCover,
    bodyVisuals: [firstWorkflowScene, firstWorkflowProductCase],
    sources: firstWorkflowSources,
    relatedSlugs: [
      "build-local-ai-partner-team-in-3-minutes",
      "local-first-data-boundaries",
      "indie-ai-developer-feedback-and-release",
    ],
    tags: {
      zh: ["AI 自动化", "工作流", "超级个体"],
      en: ["AI automation", "Workflow", "Solo operators"],
    },
    title: {
      zh: "一个人用 AI，第一条工作流别从“全自动”开始",
      en: "Your First AI Workflow Should Not Start Fully Automated",
    },
    description: {
      zh: "AI 自动化从哪里开始？对超级个体来说，第一条工作流最重要的不是替你做决定，而是稳定地把决定所需的材料准备齐，并把确认权留给你。",
      en: "Where should a solo operator start with AI automation? Not by outsourcing the decision, but by making the material behind that decision reliably reviewable.",
    },
    content: {
      zh: (
        <>
          <p className={p}>
            一个人开始用 AI，最容易给自己挖的坑，是把“全自动”当成第一阶段的终点：自动找资料、自动判断、自动发布、自动跟进。链路看起来很完整，真正出错时，你却很难判断是哪一步带偏了结果。
          </p>
          <p className={p}>
            对超级个体、独立开发者和老板个体来说，更稳的起点其实很朴素：<span className={strong}>别先让 AI 替你做决定，先让它把决定需要的东西准备齐。</span>
          </p>

          <h2 className={h2}>为什么第一条工作流不该追求“无人值守”</h2>
          <p className={p}>
            Anthropic 在总结 Agent 实践时，把可预先定义路径的 workflow 和由模型动态决定过程的 agent 分开，并建议从最简单、可组合的方案开始；只有复杂度确实改善结果时，再继续加。OpenAI 的 Agent 指南同样把明确的护栏、停止条件和交还人工控制列为基础设计，而不是上线后的补丁。
          </p>
          <p className={p}>
            这不是说 AI 做不了长任务。METR 的 time horizon 研究正是在持续测量模型完成更长软件任务的能力，但它测的是给定可靠度下的任务难度，不是“只要任务没超过某个时长就一定成功”。能力在增长，具体任务仍然需要验收点。
          </p>
          <p className={p}>
            社区里的一个实际案例也指向同一件事：即使独立构建者已经在使用多 Agent 开发流程，仍会把人工评审单独留出来。不是因为重复工作必须由人完成，而是关键决定必须有人负责。
          </p>

          <ContentFigureView visual={firstWorkflowScene} locale="zh" />

          <h2 className={h2}>第一条工作流，只挑这四类条件都满足的任务</h2>
          <ul className={ul}>
            <li><span className={strong}>重复出现</span>：每周至少来两三次，今天跑通，下周还会用到。</li>
            <li><span className={strong}>输入找得到</span>：原始材料有固定来源，不需要你每次临时补一堆背景。</li>
            <li><span className={strong}>产出看得懂</span>：好与不好能被你快速比较，而不是只能凭感觉相信。</li>
            <li><span className={strong}>做错能退回</span>：先生成草稿、清单或候选项，不直接付款、删除、群发或上线。</li>
          </ul>
          <p className={p}>
            比如“收集一周的用户反馈，归成三类并列出待确认的问题”就比“自动决定下个版本做什么并直接发布”更适合作为第一条。前者替你准备判断，后者连判断和后果一起交出去了。
          </p>

          <p className={p}>
            我们用一套完全留在本地的示例工作台，把第一步做具体：一位自己做产品的老板面对 15 位伙伴，没有一次全部接进来，而是先定位“客户回访助手”，准备把它的职责限定为整理本周反馈，并把最终判断留给自己。先把伙伴、职责和停止点选清楚，再运行任务，才不会一上来就把整条业务交出去。
          </p>

          <ContentFigureView visual={firstWorkflowProductCase} locale="zh" />

          <h2 className={h2}>先跑三个回合，再多自动一步</h2>
          <p className={p}>
            第一回合，手动把一份真实材料交给 AI 伙伴，观察它缺什么上下文。第二回合，把你的修改写进固定的检查清单。第三回合，换一份新材料再跑，看它是否还能稳定产出。连续三个回合都能在几分钟内完成检查，才值得把下一个动作接上去。
          </p>
          <p className={p}>
            这里的重点不是“三次”这个数字有多科学，而是你要看见可复现性：同一条工作流换了输入，仍然能把结果放到你面前，而不是靠上一次对话的运气。
          </p>

          <h2 className={h2}>把人放在决定上，而不是放在搬运上</h2>
          <p className={p}>
            一条好的个人工作流，应该让 AI 伙伴负责收集、整理、比对和起草，让你负责目标、边界与最终确认。工作数据默认留在本机；仅你主动接入的渠道与模型调用按任务所需出网。边界越清楚，你越敢把重复工作长期交出去。
          </p>
          <p className={p}>
            如果你已经有一件每周重复的事，可以直接照着《<Link className={strong} href="/zh/docs/first-repeatable-workflow">用一条重复任务，跑通第一个 AI 伙伴工作流</Link>》里的工作流卡和三轮验收法跑一遍。先得到一条会重复成功的链路，再谈更大的自动化。
          </p>
        </>
      ),
      en: (
        <>
          <p className={p}>
            The easiest trap when you start using AI alone is treating “fully automated” as the first milestone: research, decide, publish, and follow up without a pause. The chain looks complete. When the outcome drifts, you cannot tell which step introduced the error.
          </p>
          <p className={p}>
            A steadier starting point for solo operators and indie founders is simpler: <span className={strong}>do not ask AI to make the decision first; ask it to prepare what the decision needs.</span>
          </p>

          <h2 className={h2}>Why unattended should not be the first goal</h2>
          <p className={p}>
            Anthropic separates predefined workflows from agents that dynamically direct their own process, and recommends starting with the simplest composable solution. Add complexity only when it demonstrably improves the result. OpenAI&apos;s agent guide likewise treats guardrails, stopping conditions, and handoff to a person as foundation work, not cleanup after launch.
          </p>
          <p className={p}>
            This does not mean AI cannot complete long tasks. METR&apos;s time-horizon work measures how models handle increasingly difficult software tasks at a stated reliability level. It is not a promise that every task below a certain duration will succeed. Capability is growing; a real workflow still needs acceptance points.
          </p>
          <p className={p}>
            One builder report points in the same direction. Even with a multi-agent development pipeline, the solo founder kept human review as a separate phase—not because people should repeat the work, but because someone must own the important decisions.
          </p>

          <ContentFigureView visual={firstWorkflowScene} locale="en" />

          <h2 className={h2}>Choose a first task that meets all four conditions</h2>
          <ul className={ul}>
            <li><span className={strong}>It repeats</span>: it appears at least a few times a week, so a win today still matters next week.</li>
            <li><span className={strong}>Inputs are findable</span>: raw material has a stable source instead of requiring a fresh context dump every time.</li>
            <li><span className={strong}>Output is reviewable</span>: you can compare good and bad quickly rather than trusting a feeling.</li>
            <li><span className={strong}>Failure is reversible</span>: the workflow produces a draft, checklist, or options before it pays, deletes, broadcasts, or ships anything.</li>
          </ul>
          <p className={p}>
            “Collect this week&apos;s feedback, group it into three themes, and list the questions I need to answer” is a better first workflow than “decide what the next release should contain and publish it.” The first prepares your judgment. The second gives away both judgment and consequence.
          </p>

          <p className={p}>
            We made the first step concrete in a fully local sample workspace. Faced with 15 partners, a solo product owner did not connect the whole team at once. They first located the customer follow-up partner, planned to limit its role to organizing the week&apos;s feedback, and kept final judgment with the owner. Choose the partner, role, and stopping point before a task runs so the first experiment does not quietly become a handoff of the whole business process.
          </p>

          <ContentFigureView visual={firstWorkflowProductCase} locale="en" />

          <h2 className={h2}>Run three rounds before automating one more step</h2>
          <p className={p}>
            In round one, give an AI partner one real input and watch for missing context. In round two, turn your corrections into a fixed review checklist. In round three, use fresh material and see whether the result remains stable. Only connect the next action after all three outputs can be checked in minutes.
          </p>
          <p className={p}>
            Three is not a magical number. The point is to see repeatability: a new input still produces something you can evaluate without depending on the luck of the previous conversation.
          </p>

          <h2 className={h2}>Keep the person on decisions, not on moving information</h2>
          <p className={p}>
            A useful personal workflow lets AI gather, organize, compare, and draft while you keep the goal, boundary, and final confirmation. Work data stays on your device by default; only channels you connect and model calls go online as the task requires. Clearer boundaries make repeated delegation easier to trust.
          </p>
          <p className={p}>
            If you already have one weekly recurring task, use the workflow card and three-round check in <Link className={strong} href="/docs/first-repeatable-workflow">Run Your First AI Partner Workflow with One Recurring Task</Link>. Build one loop that succeeds repeatedly before chasing a larger automation.
          </p>
        </>
      ),
    },
  },
  {
    slug: "build-local-ai-partner-team-in-3-minutes",
    date: "2026-06-10",
    updatedAt: "2026-07-14",
    readingMinutes: 6,
    cover: {
      src: "/blog/blog-cover-build-team.jpg",
      width: 1200,
      height: 800,
      alt: {
        zh: "一个人在书桌前工作，旁边站着三个拿着任务卡片的 AI 助手插画",
        en: "Illustration of one person at a desk with three AI assistants holding task cards",
      },
    },
    bodyVisuals: [],
    sources: [],
    relatedSlugs: ["why-first-ai-workflow-needs-human-review", "local-first-data-boundaries", "indie-ai-developer-feedback-and-release"],
    tags: { zh: ["上手指南", "AI 伙伴"], en: ["Getting started", "AI partners"] },
    title: {
      zh: "一个人，3 分钟搭建本地 AI 伙伴团队：MotiClaw 上手实录",
      en: "One Person, 3 Minutes: Building a Local AI Partner Team with MotiClaw",
    },
    description: {
      zh: "从下载安装到第一个 AI 伙伴上岗，完整走一遍 MotiClaw 的 3 分钟上手流程：安装、领取 Agent、接入飞书，以及第一天就能交给 AI 伙伴的三类工作。",
      en: "From download to your first working AI partner: the full 3-minute MotiClaw onboarding - install, claim an agent, connect channels, and the first three kinds of work to hand over.",
    },
    content: {
      zh: (
        <>
          <p className={p}>
            很多人对“AI 伙伴”的想象是：要懂技术、要配环境、要写提示词，折腾半天才能跑起来。MotiClaw 想把这件事压缩到 3 分钟——下载、领取、上岗，全程不需要写一行代码。工作数据默认留在本机；仅你主动接入的渠道与模型调用按任务所需出网。
          </p>
          <h2 className={h2}>第一步：下载安装（约 1 分钟）</h2>
          <p className={p}>
            在官网点击“下载安装”，系统会自动识别你的设备（macOS Apple Silicon / Intel、Windows x64 兼容 ARM64），直接给出推荐安装包。macOS 首次启动时如果系统提示，去“系统设置 → 隐私与安全性”允许打开即可。
          </p>
          <h2 className={h2}>第二步：领取你的第一个 AI 伙伴（约 1 分钟）</h2>
          <p className={p}>
            MotiClaw 内置了上百个预配置 Agent，覆盖资料整理、客户跟进、内容初稿、日报周报等常见场景。你不需要从零搭建：在 Agent 工区里挑一个最贴近你工作的，点“领取”，它就带着预设的角色、技能和工作方式上岗了。
          </p>
          <ul className={ul}>
            <li><span className={strong}>超级个体 / 自由职业者</span>：先领“资料收拢”类 Agent，把散在微信、网页、截图里的素材归到一起。</li>
            <li><span className={strong}>小团队老板</span>：先领“客户跟进”类 Agent，让每个客户都有当前动作和提醒。</li>
            <li><span className={strong}>AI 独立开发者</span>：先领“用户反馈归类”类 Agent，把群消息和 bug 反馈先分好类。</li>
          </ul>
          <h2 className={h2}>第三步：接入你每天在用的渠道（约 1 分钟）</h2>
          <p className={p}>
            AI 伙伴要真的“在场”，得出现在你日常工作的地方。MotiClaw 支持把 Agent 接入飞书等渠道：会议纪要发进去，下一步、提醒和关键变动会先被整理出来；你负责拍板，不用再靠记忆兜底。
          </p>
          <h2 className={h2}>第一天就能交出去的三类工作</h2>
          <ul className={ul}>
            <li><span className={strong}>收拢</span>：把灵感、链接、截图、聊天记录先归到一起，再列出可动手的方向。</li>
            <li><span className={strong}>跟进</span>：把“答应过谁什么事”变成有提醒、有上下文的待办。</li>
            <li><span className={strong}>初稿</span>：让常见问题回复、帮助文档、周报先有一版草稿，你只做修改和决定。</li>
          </ul>
          <h2 className={h2}>为什么是“本地”AI 伙伴</h2>
          <p className={p}>
            MotiClaw 是本地优先的：工作数据和 Agent 状态默认保存在你自己的设备上；只有你主动接入的渠道与模型调用按当前任务所需出网。客户资料、商务报价和未发布计划不需要被整库上传。如果你想了解这套数据边界的设计，可以接着读《为什么我们坚持本地优先》。
          </p>
        </>
      ),
      en: (
        <>
          <p className={p}>
            Most people imagine that running an &quot;AI partner&quot; requires technical chops: environments, prompts, hours of setup. MotiClaw compresses it into 3 minutes - download, claim, on the job - with no code. Work data stays on your device by default; only channels you connect and model calls go online as the task requires.
          </p>
          <h2 className={h2}>Step 1: Download and install (about 1 minute)</h2>
          <p className={p}>
            Click Download on the site and MotiClaw detects your device (macOS Apple Silicon / Intel, Windows x64 with ARM64 compatibility) and recommends the right installer. On macOS, allow the app under System Settings → Privacy &amp; Security on first launch if prompted.
          </p>
          <h2 className={h2}>Step 2: Claim your first AI partner (about 1 minute)</h2>
          <p className={p}>
            MotiClaw ships with hundreds of pre-configured agents covering common scenarios: gathering material, client follow-up, first drafts, weekly reports. Pick the one closest to your work in the agent workspace, click Claim, and it starts working with a preset role and skills.
          </p>
          <ul className={ul}>
            <li><span className={strong}>Solo creators</span>: start with a gathering agent that pulls scattered links, screenshots, and chat notes together.</li>
            <li><span className={strong}>Small-team founders</span>: start with a follow-up agent so every client has a current action and a reminder.</li>
            <li><span className={strong}>Indie AI developers</span>: start with a feedback-triage agent that groups bug reports and user questions.</li>
          </ul>
          <h2 className={h2}>Step 3: Connect the channels you already use (about 1 minute)</h2>
          <p className={p}>
            An AI partner is only useful where you actually work. MotiClaw connects agents to channels like Feishu: drop a meeting note in, and the next action, reminder, and key changes get surfaced. You make the call; you stop being the backup memory.
          </p>
          <h2 className={h2}>Three kinds of work to hand over on day one</h2>
          <ul className={ul}>
            <li><span className={strong}>Gathering</span>: collect ideas, links, screenshots, and chats first, then list workable angles.</li>
            <li><span className={strong}>Follow-up</span>: turn &quot;I promised someone something&quot; into todos with context and reminders.</li>
            <li><span className={strong}>First drafts</span>: get a first pass at FAQ replies, docs, and weekly reports - you only edit and decide.</li>
          </ul>
          <h2 className={h2}>Why a local AI partner</h2>
          <p className={p}>
            MotiClaw is local-first: work data and agent state stay on your device by default; only channels you connect and model calls go online with the context the task needs. Client files, quotes, and unreleased plans do not need to be uploaded as a whole library. Read our local-first post next for the full boundary.
          </p>
        </>
      ),
    },
  },
  {
    slug: "local-first-data-boundaries",
    date: "2026-06-10",
    updatedAt: "2026-07-14",
    readingMinutes: 5,
    cover: {
      src: "/blog/blog-cover-local-first.jpg",
      width: 1200,
      height: 800,
      alt: {
        zh: "本地优先示意插画：房子里的笔记本与 AI 助手被保护边界包住，云端服务器被隔在边界外",
        en: "Local-first illustration: a laptop and AI assistant inside a protected house boundary, cloud servers kept outside",
      },
    },
    bodyVisuals: [],
    sources: [],
    relatedSlugs: ["why-first-ai-workflow-needs-human-review", "build-local-ai-partner-team-in-3-minutes"],
    tags: { zh: ["本地优先", "数据安全"], en: ["Local-first", "Data privacy"] },
    title: {
      zh: "为什么我们坚持本地优先：MotiClaw 的数据边界设计",
      en: "Why We Insist on Local-First: How MotiClaw Draws the Data Boundary",
    },
    description: {
      zh: "客户资料、报价、未发布的计划，不该为了用上 AI 而离开你的电脑。这篇文章讲清 MotiClaw 的本地优先架构：什么留在本地、什么走网络，以及如何选择托管模型额度。",
      en: "Client files, quotes, and unreleased plans should not leave your computer just to use AI. This post explains MotiClaw's local-first architecture: what stays local, what goes over the network, and how to choose a hosted-model allowance.",
    },
    content: {
      zh: (
        <>
          <p className={p}>
            把工作交给 AI 的最大顾虑，往往不是“它做得好不好”，而是“我的东西去哪了”。客户名单、商务报价、还没发布的产品计划——这些内容一旦被整库交给不可控的第三方，风险就不再由你决定。MotiClaw 的回答是：工作数据默认留在本机，只让当前任务需要的请求出网。
          </p>
          <h2 className={h2}>什么留在本地</h2>
          <ul className={ul}>
            <li><span className={strong}>你的数据</span>：素材、笔记、聊天记录、文件，全部存在你自己的设备上。</li>
            <li><span className={strong}>你的 Agent</span>：AI 伙伴的配置、记忆和工作过程都在本机运行。</li>
            <li><span className={strong}>你的控制面</span>：安装、修复、重启、更新，都在本地一键完成，不依赖云端面板。</li>
          </ul>
          <h2 className={h2}>什么会走网络</h2>
          <p className={p}>
            只有两类请求会出网：一是你主动接入的渠道（比如飞书消息收发），二是调用大模型推理本身。模型调用时只发送完成当前任务所需的上下文，而不是把你的资料库整体上传。你也可以接入自己的模型网关，把这条边界进一步收紧。
          </p>
          <h2 className={h2}>如何选择托管模型额度</h2>
          <p className={p}>
            如果你不想自己配模型，可以直接使用 MotiClaw 的托管模型。订阅套餐提供更多额度，Plus 和 Pro 对应不同的使用需求。所有计费都只发生在“模型调用”这一层——你的数据存储始终免费并保留在本地。
          </p>
          <h2 className={h2}>这对不同角色意味着什么</h2>
          <ul className={ul}>
            <li><span className={strong}>FDE / 交付者</span>：可以放心把工作台部署进客户内网，数据边界讲得清楚，验收有据可依。</li>
            <li><span className={strong}>老板 / 超级个体</span>：客户资料和报价不出设备，AI 伙伴照常干活。</li>
            <li><span className={strong}>AI 独立开发者</span>：产品代码和用户反馈留在本机，演示和支持照常进行。</li>
          </ul>
          <p className={p}>
            本地优先不是一个功能开关，而是 MotiClaw 的默认架构。想实际感受，下载安装后 3 分钟就能让第一个 AI 伙伴上岗——上一篇《一个人，3 分钟搭建本地 AI 伙伴团队》有完整的上手实录。
          </p>
        </>
      ),
      en: (
        <>
          <p className={p}>
            The biggest worry about handing work to AI is rarely &quot;will it do a good job&quot; - it is &quot;where did my stuff go&quot;. Client lists, quotes, and unreleased plans should not be handed over as a whole library. MotiClaw keeps work data local by default and only sends requests the active channel or model task needs.
          </p>
          <h2 className={h2}>What stays on your device</h2>
          <ul className={ul}>
            <li><span className={strong}>Your data</span>: material, notes, chats, and files live on your own machine.</li>
            <li><span className={strong}>Your agents</span>: AI partner configuration, memory, and work all run locally.</li>
            <li><span className={strong}>Your control plane</span>: install, repair, restart, update - one click, locally, no cloud dashboard required.</li>
          </ul>
          <h2 className={h2}>What goes over the network</h2>
          <p className={p}>
            Only two kinds of requests leave your machine: channels you explicitly connect (such as Feishu messaging), and model inference itself. Model calls send only the context needed for the current task - never a bulk upload of your library. You can also plug in your own model gateway to tighten the boundary further.
          </p>
          <h2 className={h2}>How to choose a hosted-model allowance</h2>
          <p className={p}>
            If you prefer not to configure models yourself, use MotiClaw&apos;s hosted models. Paid plans provide more allowance, with Plus and Pro designed for different levels of use. Billing only happens at the model-call layer; storing your data stays free and local.
          </p>
          <h2 className={h2}>What this means for different roles</h2>
          <ul className={ul}>
            <li><span className={strong}>FDEs / delivery builders</span>: deploy the workbench inside client networks with a data boundary you can explain and verify.</li>
            <li><span className={strong}>Founders / solo operators</span>: client files and quotes never leave the device while AI partners keep working.</li>
            <li><span className={strong}>Indie AI developers</span>: product code and user feedback stay on your machine; demos and support continue as usual.</li>
          </ul>
          <p className={p}>
            Local-first is not a feature toggle - it is MotiClaw&apos;s default architecture. To feel it in practice, the previous post walks through getting your first AI partner working three minutes after download.
          </p>
        </>
      ),
    },
  },
  {
    slug: "indie-ai-developer-feedback-and-release",
    date: "2026-06-11",
    updatedAt: "2026-07-14",
    readingMinutes: 6,
    cover: {
      src: "/blog/blog-cover-indie-dev.jpg",
      width: 1200,
      height: 630,
      alt: {
        zh: "独立开发者在书桌前工作，三个 AI 机器人助手把反馈卡片分进 bug、想法、提问三个收纳盒的插画",
        en: "Illustration of an indie developer at a desk while three robot assistants sort feedback cards into bug, idea, and question trays",
      },
    },
    bodyVisuals: [],
    sources: [],
    relatedSlugs: ["why-first-ai-workflow-needs-human-review", "build-local-ai-partner-team-in-3-minutes"],
    tags: { zh: ["独立开发者", "工作流"], en: ["Indie developers", "Workflow"] },
    title: {
      zh: "AI 独立开发者：把用户反馈和发布节奏交给 AI 伙伴",
      en: "Indie AI Developers: Hand Feedback Triage and Release Cadence to AI Partners",
    },
    description: {
      zh: "一个人维护产品最容易被拖垮的不是写代码，而是反馈分类、用户答疑和发布杂事。这篇文章给出一套用 MotiClaw 搭建的独立开发者工作流：反馈归类、答疑初稿、发布清单三个 AI 伙伴怎么配。",
      en: "What burns out a one-person product is rarely the code - it is feedback triage, support replies, and release chores. Here is an indie workflow on MotiClaw: three AI partners for triage, support drafts, and release checklists.",
    },
    content: {
      zh: (
        <>
          <p className={p}>
            一个人做产品，写代码反而是最可控的部分。真正把节奏拖垮的，是散落在群聊、邮件、应用商店评论里的反馈，是同一个问题被问第五遍，是每次发版前那张永远记不全的检查清单。这些事不难，但它们会无限打断你。MotiClaw 的思路是：把这三类“打断型工作”分别交给三个常驻的本地 AI 伙伴。
          </p>
          <h2 className={h2}>伙伴一：反馈归类员</h2>
          <p className={p}>
            把用户群、反馈邮箱、评论区的内容交给一个归类 Agent，它负责把每条反馈拆成三类：bug（带复现线索）、需求（带场景描述）、提问（带已有答案的指向）。你每天只看一份归好类的清单，而不是在十个入口之间来回切换。
          </p>
          <ul className={ul}>
            <li><span className={strong}>bug</span>：自动附上用户描述里的设备、版本和操作路径，缺什么就列出“待追问”。</li>
            <li><span className={strong}>需求</span>：相似的合并成一条，附上提出人数，方便你判断优先级。</li>
            <li><span className={strong}>提问</span>：能在已有文档里找到答案的，直接给出引用位置。</li>
          </ul>
          <h2 className={h2}>伙伴二：答疑初稿员</h2>
          <p className={p}>
            高频问题不该每次都现写回复。答疑 Agent 基于你的产品文档和历史回复，为每条提问生成一版“可以直接发，但你最好扫一眼”的草稿。你保留最终发送权——这是底线，AI 伙伴负责的是把 10 分钟的回复压缩成 30 秒的确认。
          </p>
          <h2 className={h2}>伙伴三：发布清单员</h2>
          <p className={p}>
            发版前的杂事最适合清单化：更新日志有没有写、截图有没有换、版本号有没有同步、回滚方案是什么。发布 Agent 维护这张清单，并在你说“准备发版”时逐项过一遍，把没完成的标红。节奏感不靠记性，靠流程。
          </p>
          <h2 className={h2}>为什么在本地跑这套流程</h2>
          <p className={p}>
            独立开发者的反馈数据里有用户邮箱、崩溃日志，甚至还没发布的功能讨论。MotiClaw 是本地优先的：这三个 Agent 都运行在你自己的电脑上，反馈库和产品计划不需要为了“用上 AI”而上传给第三方。模型调用只发送当前任务需要的上下文，托管模型额度说明见<span className={strong}>《为什么我们坚持本地优先》</span>一文。
          </p>
          <h2 className={h2}>今天就能开始的最小配置</h2>
          <ul className={ul}>
            <li>下载 MotiClaw，在 Agent 工区领取一个“反馈归类”类 Agent——这是性价比最高的第一步。</li>
            <li>跑顺一周后，再加答疑初稿员；等你信任它的草稿质量，再加发布清单员。</li>
            <li>三个伙伴都稳定后，如果需要更多托管模型额度，再考虑 Plus 订阅，不用一开始就付费。</li>
          </ul>
        </>
      ),
      en: (
        <>
          <p className={p}>
            When you build a product alone, the code is the controllable part. What actually wrecks your cadence is feedback scattered across chats, emails, and store reviews; the same question asked a fifth time; and the release checklist you never fully remember. None of this is hard - it is just endlessly interruptive. MotiClaw&apos;s approach: hand each of these three interrupt streams to a dedicated local AI partner.
          </p>
          <h2 className={h2}>Partner 1: the feedback triager</h2>
          <p className={p}>
            Point a triage agent at your user group, support inbox, and reviews. It splits every item into three buckets: bugs (with reproduction clues), feature requests (with scenario context), and questions (with pointers to existing answers). You read one sorted list a day instead of juggling ten inboxes.
          </p>
          <ul className={ul}>
            <li><span className={strong}>Bugs</span>: device, version, and steps extracted from the report, with missing details flagged as follow-ups.</li>
            <li><span className={strong}>Requests</span>: similar asks merged into one entry with a counter, so prioritising is easy.</li>
            <li><span className={strong}>Questions</span>: if the docs already answer it, the agent cites the exact section.</li>
          </ul>
          <h2 className={h2}>Partner 2: the support drafter</h2>
          <p className={p}>
            Frequent questions should never be written from scratch. The support agent drafts replies from your docs and past answers - good enough to send, but you glance first. You keep the final send button; the agent turns a 10-minute reply into a 30-second review.
          </p>
          <h2 className={h2}>Partner 3: the release checklister</h2>
          <p className={p}>
            Pre-release chores belong on a checklist: changelog written, screenshots updated, version bumped, rollback plan ready. The release agent owns that list and walks it with you when you say &quot;preparing a release&quot;, flagging anything unfinished. Cadence comes from process, not memory.
          </p>
          <h2 className={h2}>Why run this locally</h2>
          <p className={p}>
            Indie feedback data contains user emails, crash logs, and discussions of unreleased features. MotiClaw is local-first: all three agents run on your own machine, and your feedback corpus never has to be uploaded to a third party just to &quot;use AI&quot;. Model calls send only the context the current task needs - see our local-first post for how hosted-model allowance works.
          </p>
          <h2 className={h2}>The minimal setup you can start today</h2>
          <ul className={ul}>
            <li>Download MotiClaw and claim a feedback-triage agent in the workspace - the highest-leverage first step.</li>
            <li>After a smooth week, add the support drafter; once you trust its drafts, add the release checklister.</li>
            <li>Only consider a Plus subscription when you need more hosted-model allowance.</li>
          </ul>
        </>
      ),
    },
  },
];

export const blogPostSlugAliases: Record<string, string> = {
  "build-local-ai-employee-team-in-3-minutes": "build-local-ai-partner-team-in-3-minutes",
};

export function resolveBlogPostSlug(slug: string): string {
  return blogPostSlugAliases[slug] ?? slug;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  const canonicalSlug = resolveBlogPostSlug(slug);
  return blogPosts.find((post) => post.slug === canonicalSlug);
}
