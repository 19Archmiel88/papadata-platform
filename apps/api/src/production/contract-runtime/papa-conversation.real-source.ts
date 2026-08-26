import type {
  AiMessage,
  AiProviderAdapter,
} from "@papadata/ai-runtime";
import type { AssistantConversationRepository } from "@papadata/database";

export type PapaConversationStatus =
  | "blocked"
  | "completed"
  | "ready";

export type PapaConversationEvidence = {
  readonly evidenceId: string;
  readonly source: string;
  readonly collectedAt: string;
  readonly confidence: number;
};

export type PapaConversationRecord = {
  readonly messageId: string;
  readonly content: string;
  readonly confidence: number | null;
  readonly evidence: readonly PapaConversationEvidence[];
  readonly actionId: string | null;
  readonly status: PapaConversationStatus;
  readonly riskLevel: "critical" | "high" | "low" | "medium";
  readonly approvalRequired: boolean;
  readonly role: "assistant" | "system" | "user";
  readonly createdAt: string;
  readonly limitations: readonly string[];
};

export type PapaConversationSummary = {
  readonly total: number;
  readonly ready: number;
  readonly warning: number;
  readonly critical: number;
  readonly updatedAt: string;
};

export type PapaContextCaptureResult = {
  readonly conversationId: string;
  readonly snapshotId: string;
  readonly created: boolean;
};

export async function capturePapaContext(options: {
  readonly repository: AssistantConversationRepository;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly userId: string;
  readonly conversationId: string | null;
  readonly parentConversationId: string | null;
  readonly captureReason: string;
  readonly snapshot: Record<string, unknown>;
  readonly title: string;
  readonly idempotencyKey: string;
}): Promise<PapaContextCaptureResult | null> {
  let conversationId = options.conversationId;
  let created = false;

  if (conversationId) {
    const existing = await options.repository.findThread(
      options.tenantId,
      options.workspaceId,
      conversationId,
    );
    if (!existing) return null;

    if (options.parentConversationId) {
      const parent = await validateParentConversation({
        parentConversationId: options.parentConversationId,
        repository: options.repository,
        tenantId: options.tenantId,
        workspaceId: options.workspaceId,
      });
      if (!parent) return null;

      if (
        readOptionalRowString(existing, "parent_thread_id")
          !== options.parentConversationId
        || readRowString(existing, "thread_kind") !== "case"
      ) {
        return null;
      }
    }
  } else {
    if (options.parentConversationId) {
      const parent = await validateParentConversation({
        parentConversationId: options.parentConversationId,
        repository: options.repository,
        tenantId: options.tenantId,
        workspaceId: options.workspaceId,
      });
      if (!parent) return null;
    }

    const thread = await options.repository.createThread({
      tenantId: options.tenantId,
      workspaceId: options.workspaceId,
      createdByUserId: options.userId,
      title: options.title,
      context: options.snapshot,
      threadKind: options.parentConversationId ? "case" : "conversation",
      parentThreadId: options.parentConversationId,
      idempotencyKey: options.idempotencyKey,
    });
    conversationId = readRowString(thread, "assistant_thread_id");
    created = true;
  }

  if (options.parentConversationId && conversationId) {
    await options.repository.upsertAssistantCase({
      caseThreadId: conversationId,
      caseType: readAllowedRecordString(
        options.snapshot,
        "caseType",
        ["action", "analysis", "anomaly", "decision", "opportunity", "report", "risk"],
        "analysis",
      ) as "action" | "analysis" | "anomaly" | "decision" | "opportunity" | "report" | "risk",
      comments: readOptionalRecordArray(options.snapshot, "comments"),
      createdByUserId: options.userId,
      decisions: readOptionalRecordArray(options.snapshot, "decisions"),
      evidence: readOptionalRecordArray(options.snapshot, "evidence"),
      hypotheses: readOptionalRecordArray(options.snapshot, "hypotheses"),
      idempotencyKey: `${options.idempotencyKey}:case`,
      limitations: readOptionalRecordArray(options.snapshot, "limitations"),
      metrics: readOptionalRecordArray(options.snapshot, "metrics"),
      outcome: readOptionalRecordObject(options.snapshot, "outcome"),
      ownerUserId: readOptionalRecordString(options.snapshot, "ownerUserId"),
      parentThreadId: options.parentConversationId,
      recommendations: readOptionalRecordArray(options.snapshot, "recommendations"),
      severity: readAllowedRecordString(
        options.snapshot,
        "severity",
        ["critical", "high", "low", "medium"],
        "medium",
      ) as "critical" | "high" | "low" | "medium",
      snapshots: [options.snapshot],
      sourceElementId: readOptionalRecordString(options.snapshot, "caseElementId")
        ?? readOptionalRecordString(options.snapshot, "elementId"),
      status: readAllowedRecordString(
        options.snapshot,
        "status",
        [
          "analysis",
          "approval",
          "detected",
          "dismissed",
          "monitoring",
          "recommendation",
          "resolved",
          "triage",
        ],
        "detected",
      ) as "analysis" | "approval" | "detected" | "dismissed" | "monitoring" | "recommendation" | "resolved" | "triage",
      tenantId: options.tenantId,
      title: options.title,
      workspaceId: options.workspaceId,
    });
  }


  if (conversationId) {
    await syncDurableRecommendationDecisionActionOutcomeFromSnapshot({
      conversationId,
      idempotencyKey: options.idempotencyKey,
      parentConversationId: options.parentConversationId,
      repository: options.repository,
      snapshot: options.snapshot,
      tenantId: options.tenantId,
      userId: options.userId,
      workspaceId: options.workspaceId,
    });
  }


  if (conversationId) {
    await syncMetricEngineProvenanceFromSnapshot({
      conversationId,
      idempotencyKey: options.idempotencyKey,
      repository: options.repository,
      snapshot: options.snapshot,
      tenantId: options.tenantId,
      userId: options.userId,
      workspaceId: options.workspaceId,
    });
  }


  const snapshotRow = await options.repository.saveSnapshot({
    tenantId: options.tenantId,
    workspaceId: options.workspaceId,
    threadId: conversationId,
    captureReason: options.captureReason,
    snapshot: options.snapshot,
    idempotencyKey: options.idempotencyKey,
  });

  await options.repository.touchThread(
    options.tenantId,
    options.workspaceId,
    conversationId,
  );

  return {
    conversationId,
    created,
    snapshotId: readRowString(snapshotRow, "assistant_context_snapshot_id"),
  };
}

export type PapaAnswerGenerationResult = {
  readonly conversationId: string;
  readonly caseThreadId: string | null;
  readonly messageId: string;
  readonly record: PapaConversationRecord;
};

export async function generatePapaAnswer(options: {
  readonly repository: AssistantConversationRepository;
  readonly provider: AiProviderAdapter;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly userId: string;
  readonly conversationId: string | null;
  readonly parentConversationId: string | null;
  readonly caseThreadId: string | null;
  readonly prompt: string;
  readonly idempotencyKey: string;
}): Promise<PapaAnswerGenerationResult | null> {
  const providerPrivacy = await persistPapaPreProviderRedactionProof({
    createdByUserId: options.userId,
    idempotencyKey: options.idempotencyKey,
    operationId: "papa.answer.generate",
    rawInput: readPapaPrivacyPromptInput(options as unknown as Record<string, unknown>),
    repository: options.repository,
    tenantId: options.tenantId,
    threadId: options.conversationId ?? options.parentConversationId ?? options.idempotencyKey,
    workspaceId: options.workspaceId,
  });

  const prompt = providerPrivacy.redactedInput.trim();
  if (!prompt) throw new RangeError("prompt must not be blank");

  let conversationId = options.conversationId;
  let mainThread: Record<string, unknown>;

  if (conversationId) {
    const existing = await options.repository.findThread(
      options.tenantId,
      options.workspaceId,
      conversationId,
    );
    if (!existing) return null;
    if (readRowString(existing, "thread_kind") !== "conversation") return null;
    mainThread = existing;
  } else {
    if (options.parentConversationId) {
      // A case must be explicitly created by papa.context.capture so its
      // parent/snapshot relationship is persisted before any AI answer.
      return null;
    }
    mainThread = await options.repository.createThread({
      tenantId: options.tenantId,
      workspaceId: options.workspaceId,
      createdByUserId: options.userId,
      title: buildThreadTitle(prompt),
      context: {},
      threadKind: "conversation",
      parentThreadId: null,
      idempotencyKey: `${options.idempotencyKey}:conversation`,
    });
    conversationId = readRowString(mainThread, "assistant_thread_id");
  }

  let targetThreadId = conversationId;
  if (options.caseThreadId) {
    const existingCase = await options.repository.findThread(
      options.tenantId,
      options.workspaceId,
      options.caseThreadId,
    );
    if (!existingCase) return null;
    if (
      readRowString(existingCase, "thread_kind") !== "case"
      || readOptionalRowString(existingCase, "parent_thread_id") !== conversationId
    ) {
      return null;
    }
    targetThreadId = options.caseThreadId;
  }

  const existingAssistant = await options.repository.findMessageByIdempotencyKey({
    tenantId: options.tenantId,
    workspaceId: options.workspaceId,
    threadId: targetThreadId,
    role: "assistant",
    idempotencyKey: options.idempotencyKey,
  });
  if (existingAssistant) {
    const existingEvidence = await options.repository.listEvidence({
      tenantId: options.tenantId,
      workspaceId: options.workspaceId,
      threadId: targetThreadId,
    });
    return {
      caseThreadId: targetThreadId === conversationId ? null : targetThreadId,
      conversationId,
      messageId: readRowString(existingAssistant, "assistant_message_id"),
      record: toPapaConversationRecord(
        existingAssistant,
        evidenceForMessage(existingEvidence, existingAssistant),
      ),
    };
  }

  const historyRows = await options.repository.listMessages({
    limit: 12,
    tenantId: options.tenantId,
    threadId: targetThreadId,
    workspaceId: options.workspaceId,
  });
  const targetSnapshot = await options.repository.findLatestSnapshot({
    tenantId: options.tenantId,
    workspaceId: options.workspaceId,
    threadId: targetThreadId,
  });
  const mainSnapshot = targetThreadId === conversationId
    ? targetSnapshot
    : await options.repository.findLatestSnapshot({
        tenantId: options.tenantId,
        workspaceId: options.workspaceId,
        threadId: conversationId,
      });
  const snapshotRow = targetSnapshot ?? mainSnapshot;
  const grounding = snapshotRow
    ? buildGroundingContext(readRowObject(snapshotRow, "snapshot"))
    : null;
  const auditReference = `papa-answer:${options.idempotencyKey}`;

  await options.repository.appendMessage({
    auditReference,
    confidence: 1,
    content: prompt,
    limitations: [],
    recommendations: [],
    refusalCode: null,
    role: "user",
    tenantId: options.tenantId,
    threadId: targetThreadId,
    workspaceId: options.workspaceId,
    idempotencyKey: options.idempotencyKey,
  });

  const usableGrounding = grounding && isGroundingUsable(grounding);
  let assistantMessage: Record<string, unknown>;

  if (!usableGrounding) {
    const limitations = buildGroundingLimitations(grounding, options.provider.providerId);
    assistantMessage = await options.repository.appendMessage({
      auditReference,
      confidence: grounding ? calculateGroundingConfidence(grounding) : 0,
      content: buildGroundingRefusalContent(grounding),
      limitations,
      recommendations: [],
      refusalCode: grounding ? "DATA_NOT_READY" : "EVIDENCE_UNAVAILABLE",
      role: "assistant",
      tenantId: options.tenantId,
      threadId: targetThreadId,
      workspaceId: options.workspaceId,
      idempotencyKey: options.idempotencyKey,
    });
  } else {
    const confidence = calculateGroundingConfidence(grounding);
    const limitations = buildGroundingLimitations(
      grounding,
      options.provider.providerId,
    );
    const providerMessages: readonly AiMessage[] = [
      {
        role: PAPA_SYSTEM_MESSAGE_ROLE,
        content: buildSystemGroundingPrompt(grounding, confidence, limitations),
      },
      ...historyRows
        .slice()
        .reverse()
        .map(toProviderMessage)
        .filter((message): message is AiMessage => message !== null),
      { role: "user", content: prompt },
    ];
    const providerResponse = await options.provider.complete({
      maxOutputTokens: 512,
      messages: providerMessages,
      modelId: "local-deterministic",
      temperature: 0,
    });
    const providerOutput = parseDeterministicSummary(providerResponse.output);
    const content = options.provider.providerId === "local-deterministic"
      ? buildLocalGroundedAnswer(prompt, grounding, confidence, limitations)
      : buildProviderGroundedAnswer(
          providerOutput,
          grounding,
          confidence,
          limitations,
        );

    assistantMessage = await options.repository.appendMessage({
      auditReference,
      confidence,
      content,
      limitations,
      recommendations: grounding.recommendations.map((item) => item.label),
      refusalCode: null,
      role: "assistant",
      tenantId: options.tenantId,
      threadId: targetThreadId,
      workspaceId: options.workspaceId,
      idempotencyKey: options.idempotencyKey,
    });

    await persistGroundingEvidence({
      grounding,
      messageId: readRowString(assistantMessage, "assistant_message_id"),
      repository: options.repository,
      tenantId: options.tenantId,
      workspaceId: options.workspaceId,
    });
  }

  await options.repository.touchThread(
    options.tenantId,
    options.workspaceId,
    targetThreadId,
  );
  if (targetThreadId !== conversationId) {
    await options.repository.touchThread(
      options.tenantId,
      options.workspaceId,
      conversationId,
    );
  }

  const evidenceRows = await options.repository.listEvidence({
    tenantId: options.tenantId,
    workspaceId: options.workspaceId,
    threadId: targetThreadId,
  });

  await persistPapaAiAnswerContractAndGovernance({
    answerMessage: assistantMessage,
    conversationId,
    idempotencyKey: options.idempotencyKey,
    repository: options.repository,
    tenantId: options.tenantId,
    userId: options.userId,
    workspaceId: options.workspaceId,
  });

  return {
    caseThreadId: targetThreadId === conversationId ? null : targetThreadId,
    conversationId,
    messageId: readRowString(assistantMessage, "assistant_message_id"),
    record: toPapaConversationRecord(
      assistantMessage,
      evidenceForMessage(evidenceRows, assistantMessage),
    ),
  };
}

export async function listPapaAnswerRecords(options: {
  readonly repository: AssistantConversationRepository;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly conversationId: string | null;
  readonly limit?: number | null;
}): Promise<{
  readonly records: readonly PapaConversationRecord[];
  readonly summary: PapaConversationSummary;
}> {
  const [rows, evidenceRows] = await Promise.all([
    options.repository.listMessages({
      limit: options.limit ?? 50,
      tenantId: options.tenantId,
      threadId: options.conversationId,
      workspaceId: options.workspaceId,
    }),
    options.repository.listEvidence({
      tenantId: options.tenantId,
      workspaceId: options.workspaceId,
      threadId: options.conversationId,
    }),
  ]);
  const records = rows.map((row) => toPapaConversationRecord(
    row,
    evidenceForMessage(evidenceRows, row),
  ));

  return {
    records,
    summary: buildSummary(records),
  };
}

export type PapaObservationSaveResult = {
  readonly conversationId: string;
  readonly observationId: string;
  readonly messageId: string;
  readonly record: PapaConversationRecord;
};

export async function saveObservation(options: {
  readonly repository: AssistantConversationRepository;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly userId: string;
  readonly conversationId: string | null;
  readonly content: string;
  readonly idempotencyKey: string;
}): Promise<PapaObservationSaveResult | null> {
  const content = options.content.trim();
  if (!content) throw new RangeError("content must not be blank");

  let conversationId = options.conversationId;
  if (conversationId) {
    const existing = await options.repository.findThread(
      options.tenantId,
      options.workspaceId,
      conversationId,
    );
    if (!existing || readRowString(existing, "thread_kind") !== "conversation") {
      return null;
    }
  } else {
    const thread = await options.repository.createThread({
      tenantId: options.tenantId,
      workspaceId: options.workspaceId,
      createdByUserId: options.userId,
      title: buildThreadTitle(content),
      context: {},
      threadKind: "conversation",
      parentThreadId: null,
      idempotencyKey: `${options.idempotencyKey}:conversation`,
    });
    conversationId = readRowString(thread, "assistant_thread_id");
  }

  const observation = await options.repository.appendObservation({
    caseId: null,
    confidence: 1,
    content,
    createdByUserId: options.userId,
    evidence: [],
    idempotencyKey: options.idempotencyKey,
    limitations: [],
    observationType: "manual",
    tenantId: options.tenantId,
    threadId: conversationId,
    workspaceId: options.workspaceId,
  });

  await options.repository.touchThread(
    options.tenantId,
    options.workspaceId,
    conversationId,
  );

  return {
    conversationId,
    messageId: readRowString(observation, "assistant_observation_id"),
    observationId: readRowString(observation, "assistant_observation_id"),
    record: toPapaObservationRecord(observation),
  };
}

export async function listObservationRecords(options: {
  readonly repository: AssistantConversationRepository;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly conversationId: string | null;
  readonly limit?: number | null;
}): Promise<{
  readonly records: readonly PapaConversationRecord[];
  readonly summary: PapaConversationSummary;
}> {
  const rows = await options.repository.listObservationRecords({
    limit: options.limit ?? 50,
    tenantId: options.tenantId,
    threadId: options.conversationId,
    workspaceId: options.workspaceId,
  });

  const records = rows.map((row) => toPapaObservationRecord(row));

  return {
    records,
    summary: buildSummary(records),
  };
}

export type PapaHistoryTimelineEvent = {
  readonly eventId: string;
  readonly occurredAt: string;
  readonly type: string;
  readonly actorId: string | null;
  readonly description: string;
};

export async function listHistoryRecords(options: {
  readonly repository: AssistantConversationRepository;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly limit?: number | null;
}): Promise<{
  readonly records: readonly PapaConversationRecord[];
  readonly summary: PapaConversationSummary;
  readonly timeline: readonly PapaHistoryTimelineEvent[];
}> {
  const [messageRows, snapshotRows, evidenceRows] = await Promise.all([
    options.repository.listMessages({
      limit: options.limit ?? 50,
      tenantId: options.tenantId,
      threadId: null,
      workspaceId: options.workspaceId,
    }),
    options.repository.listSnapshots({
      limit: options.limit ?? 50,
      tenantId: options.tenantId,
      workspaceId: options.workspaceId,
    }),
    options.repository.listEvidence({
      tenantId: options.tenantId,
      workspaceId: options.workspaceId,
      threadId: null,
    }),
  ]);
  const records = messageRows.map((row) => toPapaConversationRecord(
    row,
    evidenceForMessage(evidenceRows, row),
  ));

  return {
    records,
    summary: buildSummary(records),
    timeline: snapshotRows.map(toTimelineEvent),
  };
}

type GroundingItem = {
  readonly id: string;
  readonly label: string;
  readonly value: string | null;
  readonly source: string | null;
  readonly status: string | null;
  readonly description: string | null;
};

type GroundingContext = {
  readonly title: string;
  readonly route: string;
  readonly capturedAt: string;
  readonly dateRangeLabel: string;
  readonly readiness: string | null;
  readonly summary: string | null;
  readonly metrics: readonly GroundingItem[];
  readonly evidence: readonly GroundingItem[];
  readonly recommendations: readonly GroundingItem[];
  readonly filters: readonly GroundingItem[];
  readonly tables: readonly GroundingItem[];
  readonly charts: readonly GroundingItem[];
  readonly elements: readonly GroundingItem[];
};

async function validateParentConversation(options: {
  readonly repository: AssistantConversationRepository;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly parentConversationId: string;
}): Promise<Record<string, unknown> | null> {
  const parent = await options.repository.findThread(
    options.tenantId,
    options.workspaceId,
    options.parentConversationId,
  );
  if (!parent) return null;
  if (readRowString(parent, "thread_kind") !== "conversation") return null;
  if (readOptionalRowString(parent, "parent_thread_id") !== null) return null;
  return parent;
}

function buildGroundingContext(snapshot: Record<string, unknown>): GroundingContext {
  return {
    title: readOptionalRecordString(snapshot, "title") ?? "Bieżący ekran",
    route: readOptionalRecordString(snapshot, "route") ?? "nieznana trasa",
    capturedAt: readOptionalRecordString(snapshot, "capturedAt")
      ?? readOptionalRecordString(snapshot, "updatedAt")
      ?? new Date().toISOString(),
    dateRangeLabel: readOptionalRecordString(snapshot, "dateRangeLabel") ?? "Bieżący zakres",
    readiness: readOptionalRecordString(snapshot, "readiness"),
    summary: readOptionalRecordString(snapshot, "summary"),
    metrics: readGroundingItems(snapshot, "metrics"),
    evidence: readGroundingItems(snapshot, "evidence"),
    recommendations: readGroundingItems(snapshot, "recommendations"),
    filters: readGroundingItems(snapshot, "filters"),
    tables: readGroundingItems(snapshot, "tables"),
    charts: readGroundingItems(snapshot, "charts"),
    elements: readGroundingItems(snapshot, "elements"),
  };
}

function isGroundingUsable(grounding: GroundingContext): boolean {
  const readiness = grounding.readiness?.toLowerCase() ?? "";
  if (
    readiness.includes("blocked")
    || readiness.includes("zablok")
    || readiness.includes("sourceerror")
    || readiness.includes("błąd")
    || readiness.includes("nodata")
    || readiness.includes("brak danych")
  ) {
    return false;
  }

  return grounding.metrics.length > 0
    || grounding.evidence.length > 0
    || grounding.tables.length > 0
    || grounding.elements.length > 0;
}

function calculateGroundingConfidence(grounding: GroundingContext): number {
  const explicit = [
    ...grounding.evidence,
    ...grounding.metrics,
    ...grounding.elements,
  ]
    .map((item) => parsePercent(item.status))
    .filter((value): value is number => value !== null);
  const readinessBase = readinessConfidence(grounding.readiness) ?? 0.5;
  if (explicit.length === 0) return readinessBase;

  const average = explicit.reduce((sum, value) => sum + value, 0) / explicit.length;
  return clampConfidence((average * 0.75) + (readinessBase * 0.25));
}

function readinessConfidence(readiness: string | null): number | null {
  const value = readiness?.toLowerCase() ?? "";
  if (value.includes("ready") || value.includes("gotow")) return 0.9;
  if (value.includes("partial") || value.includes("części")) return 0.65;
  if (value.includes("stale") || value.includes("nieświe")) return 0.45;
  if (value.includes("process") || value.includes("przetwarz")) return null;
  if (value.includes("blocked") || value.includes("zablok")) return 0.1;
  if (value.includes("error") || value.includes("błąd")) return 0.1;
  if (value.includes("nodata") || value.includes("brak danych")) return 0;
  return null;
}

function buildGroundingLimitations(
  grounding: GroundingContext | null,
  providerId: string,
): readonly string[] {
  const limitations: string[] = [];
  if (!grounding) {
    limitations.push("Brak serwerowo zapisanego snapshotu kontekstu dla tej rozmowy.");
    return limitations;
  }

  limitations.push(
    "Odpowiedź jest uziemiona wyłącznie w zapisanym snapshotcie aktywnego ekranu i jego dowodach; Papa nie tworzy alternatywnych definicji metryk.",
  );
  const readiness = grounding.readiness?.toLowerCase() ?? "";
  if (readiness.includes("partial") || readiness.includes("części")) {
    limitations.push("Snapshot ma częściową gotowość danych; wnioski wymagają dodatkowej weryfikacji.");
  }
  if (readiness.includes("stale") || readiness.includes("nieświe")) {
    limitations.push("Snapshot zawiera nieświeże dane; nie należy używać go do decyzji wymagających danych bieżących.");
  }
  if (grounding.evidence.length === 0) {
    limitations.push("Snapshot nie zawiera jawnych dowodów źródłowych.");
  }
  if (providerId === "local-deterministic") {
    limitations.push(
      "Środowisko używa lokalnego deterministycznego adaptera AI; odpowiedź ma charakter weryfikacyjny, nie generatywny.",
    );
  }
  return limitations;
}

function buildSystemGroundingPrompt(
  grounding: GroundingContext,
  confidence: number,
  limitations: readonly string[],
): string {
  return [
    "Jesteś Papa Asystentem w PapaData.",
    "Odpowiadaj wyłącznie na podstawie poniższego snapshotu i historii tej rozmowy.",
    "Nie wymyślaj metryk, źródeł ani faktów. Oddzielaj tezę od dowodów i ograniczeń.",
    "Jeśli dane są niewystarczające, powiedz to jawnie. Nie wykonuj działań zewnętrznych.",
    `Pewność uziemienia: ${Math.round(confidence * 100)}%.`,
    `Ograniczenia: ${limitations.join(" | ") || "brak dodatkowych"}.`,
    `SNAPSHOT_JSON=${JSON.stringify(grounding)}`,
  ].join("\n");
}

function buildLocalGroundedAnswer(
  prompt: string,
  grounding: GroundingContext,
  confidence: number,
  limitations: readonly string[],
): string {
  const metricLines = grounding.metrics.slice(0, 8).map((item) => (
    `${item.label}${item.value ? `: ${item.value}` : ""}${item.source ? ` (${item.source})` : ""}`
  ));
  const evidenceLines = grounding.evidence.slice(0, 6).map((item) => (
    `${item.label}${item.source ? ` — ${item.source}` : ""}`
  ));
  const recommendationLines = grounding.recommendations.slice(0, 5).map((item) => (
    `${item.label}${item.value ? ` — ${item.value}` : item.description ? ` — ${item.description}` : ""}`
  ));

  return [
    `Pytanie: ${prompt}`,
    `Teza: kontekst „${grounding.title}” został przeanalizowany wyłącznie na podstawie zapisanego snapshotu; w lokalnym trybie deterministycznym Papa nie dopowiada faktów spoza danych.`,
    `Zakres: ${grounding.dateRangeLabel}; readiness: ${grounding.readiness ?? "nieokreślone"}; ekran: ${grounding.route}.`,
    metricLines.length > 0 ? `Dane: ${metricLines.join(" | ")}` : "Dane: brak jawnych metryk w snapshotcie.",
    evidenceLines.length > 0 ? `Dowody: ${evidenceLines.join(" | ")}` : "Dowody: brak jawnych dowodów źródłowych.",
    recommendationLines.length > 0
      ? `Rekomendacje obecne w kontekście: ${recommendationLines.join(" | ")}`
      : "Rekomendacje: brak rekomendacji w bieżącym snapshotcie.",
    `Pewność: ${Math.round(confidence * 100)}%.`,
    `Ograniczenia: ${limitations.join(" | ") || "brak dodatkowych ograniczeń"}.`,
  ].join("\n\n");
}

function buildProviderGroundedAnswer(
  providerOutput: string,
  grounding: GroundingContext,
  confidence: number,
  limitations: readonly string[],
): string {
  const evidence = grounding.evidence.slice(0, 6).map((item) => (
    `${item.label}${item.source ? ` — ${item.source}` : ""}`
  ));
  return [
    providerOutput.trim() || "Papa nie zwrócił treści odpowiedzi.",
    `Zakres: ${grounding.dateRangeLabel}; ekran: ${grounding.title}.`,
    evidence.length > 0 ? `Dowody: ${evidence.join(" | ")}` : "Dowody: brak jawnych dowodów.",
    `Pewność uziemienia: ${Math.round(confidence * 100)}%.`,
    `Ograniczenia: ${limitations.join(" | ") || "brak dodatkowych ograniczeń"}.`,
  ].join("\n\n");
}

function buildGroundingRefusalContent(grounding: GroundingContext | null): string {
  if (!grounding) {
    return "Papa nie może przeanalizować bieżącego ekranu, ponieważ rozmowa nie ma zapisanego snapshotu kontekstu. Odśwież lub przechwyć kontekst i spróbuj ponownie.";
  }

  return `Papa nie może wiarygodnie odpowiedzieć dla ekranu „${grounding.title}”, ponieważ readiness danych wynosi „${grounding.readiness ?? "nieokreślone"}” albo snapshot nie zawiera danych wystarczających do uziemienia odpowiedzi.`;
}

function toProviderMessage(row: Record<string, unknown>): AiMessage | null {
  const role = readConversationRole(row);
  if (!role) return null;
  return {
    role,
    content: readRowString(row, "content"),
  };
}

async function persistGroundingEvidence(options: {
  readonly repository: AssistantConversationRepository;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly messageId: string;
  readonly grounding: GroundingContext;
}): Promise<void> {
  const candidates = options.grounding.evidence.length > 0
    ? options.grounding.evidence
    : options.grounding.metrics;

  for (const item of candidates.slice(0, 20)) {
    const resolvedSourceType = resolvePapaEvidenceSourceType(item);
    const sourceType: "dashboard_readiness" | "metric_snapshot" =
      resolvedSourceType === "dashboard_readiness" ? "dashboard_readiness" : "metric_snapshot";
    const evidenceRow = await options.repository.appendEvidence({
      tenantId: options.tenantId,
      workspaceId: options.workspaceId,
      messageId: options.messageId,
      sourceType,
      sourceRef: item.source ?? item.label,
      metricCode: item.id,
    });

    await options.repository.appendAssistantEvidenceProvenance({
      canonicalMetricRef: {
        id: item.id,
        label: item.label,
        source: item.source,
      },
      dataQuality: {
        status: item.status,
      },
      evidenceId: readOptionalRowString(evidenceRow, "assistant_evidence_id")
        ?? readOptionalRowString(evidenceRow, "id"),
      freshnessAt: null,
      metricIdentifier: item.id,
      metricSnapshotId: null,
      provenance: {
        description: item.description,
        source: item.source,
        value: item.value,
      },
      sourceId: item.id,
      sourceLabel: item.label,
      sourcePath: item.source,
      sourceType,
      tenantId: options.tenantId,
      workspaceId: options.workspaceId,
    });
  }
}

function evidenceForMessage(
  evidenceRows: readonly Record<string, unknown>[],
  messageRow: Record<string, unknown>,
): readonly Record<string, unknown>[] {
  const messageId = readRowString(messageRow, "assistant_message_id");
  return evidenceRows.filter((row) => (
    readRowString(row, "assistant_message_id") === messageId
  ));
}

async function syncDurableRecommendationDecisionActionOutcomeFromSnapshot(options: {
  readonly repository: AssistantConversationRepository;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly userId: string;
  readonly conversationId: string;
  readonly parentConversationId: string | null;
  readonly snapshot: Record<string, unknown>;
  readonly idempotencyKey: string;
}): Promise<void> {
  const recommendations = readOptionalRecordArray(options.snapshot, "recommendations")
    .filter((item): item is Record<string, unknown> => (
      Boolean(item)
      && typeof item === "object"
      && !Array.isArray(item)
    ));

  if (recommendations.length === 0) return;

  for (const [index, recommendation] of recommendations.entries()) {
    const sourceRecommendationId = readOptionalRecordString(recommendation, "id")
      ?? `snapshot-recommendation-${index + 1}`;
    const title = readOptionalRecordString(recommendation, "label")
      ?? readOptionalRecordString(recommendation, "title")
      ?? "Rekomendacja Papa";
    const summary = readOptionalRecordString(recommendation, "description")
      ?? readOptionalRecordString(recommendation, "summary")
      ?? "Rekomendacja pochodzi z zapisanego snapshotu Papa.";
    const nextStep = readOptionalRecordString(recommendation, "nextStep")
      ?? readOptionalRecordString(recommendation, "value");

    const recommendationRow = await options.repository.upsertAssistantRecommendation({
      baseline: readOptionalRecordObject(recommendation, "baseline"),
      caseId: null,
      confidence: readOptionalRecordConfidence(recommendation),
      effortLevel: readAllowedRecordString(
        recommendation,
        "effort",
        ["high", "low", "medium", "unknown"],
        "unknown",
      ) as "high" | "low" | "medium" | "unknown",
      evidenceIds: readOptionalRecordArray(recommendation, "evidenceIds"),
      idempotencyKey: `${options.idempotencyKey}:recommendation:${sourceRecommendationId}`,
      nextStep,
      observationId: null,
      ownerUserId: readOptionalRecordString(recommendation, "ownerUserId"),
      riskLevel: readAllowedRecordString(
        recommendation,
        "risk",
        ["critical", "high", "low", "medium", "unknown"],
        "unknown",
      ) as "critical" | "high" | "low" | "medium" | "unknown",
      sourceRecommendationId,
      status: readAllowedRecordString(
        recommendation,
        "recommendationStatus",
        ["accepted", "converted_to_decision", "dismissed", "proposed", "rejected", "review"],
        "proposed",
      ) as "accepted" | "converted_to_decision" | "dismissed" | "proposed" | "rejected" | "review",
      summary,
      tenantId: options.tenantId,
      threadId: options.conversationId,
      title,
      variants: readOptionalRecordArray(recommendation, "variants"),
      workspaceId: options.workspaceId,
    });

    const recommendationId = readRowString(recommendationRow, "assistant_recommendation_id");
    const decision = readOptionalRecordObject(recommendation, "decision");

    if (decision) {
      const decisionRow = await options.repository.upsertAssistantDecision({
        baseline: readOptionalRecordObject(decision, "baseline"),
        caseId: null,
        decidedByUserId: readOptionalRecordString(decision, "decidedByUserId"),
        decision: readOptionalRecordString(decision, "decision")
          ?? readOptionalRecordString(decision, "title")
          ?? "Decyzja wymaga uzupełnienia",
        expectedOutcome: readOptionalRecordObject(decision, "expectedOutcome"),
        idempotencyKey: `${options.idempotencyKey}:decision:${sourceRecommendationId}`,
        measuredOutcome: readOptionalRecordObject(decision, "measuredOutcome"),
        rationale: readOptionalRecordString(decision, "rationale"),
        recommendationId,
        status: readAllowedRecordString(
          decision,
          "status",
          ["approved", "dismissed", "executing", "monitoring", "rejected", "resolved", "review", "scheduled"],
          "review",
        ) as "approved" | "dismissed" | "executing" | "monitoring" | "rejected" | "resolved" | "review" | "scheduled",
        tenantId: options.tenantId,
        threadId: options.conversationId,
        workspaceId: options.workspaceId,
      });

      const decisionId = readRowString(decisionRow, "assistant_decision_id");
      const action = readOptionalRecordObject(decision, "action")
        ?? readOptionalRecordObject(recommendation, "action");

      if (action) {
        await options.repository.upsertAssistantActionProposal({
          beforeState: readOptionalRecordObject(action, "beforeState") ?? {},
          caseId: null,
          createdByUserId: options.userId,
          decisionId,
          diff: readOptionalRecordObject(action, "diff") ?? {},
          evidence: readOptionalRecordArray(action, "evidence"),
          idempotencyKey: `${options.idempotencyKey}:action:${sourceRecommendationId}`,
          limits: readOptionalRecordObject(action, "limits") ?? {},
          operationId: readOptionalRecordString(action, "operationId") ?? "papa.ai.action.validate",
          proposedAfterState: readOptionalRecordObject(action, "proposedAfterState") ?? {},
          simulation: readOptionalRecordObject(action, "simulation") ?? {},
          status: readAllowedRecordString(
            action,
            "status",
            ["approval_required", "approved", "blocked", "executed", "proposed", "rejected", "rolled_back", "validated"],
            "proposed",
          ) as "approval_required" | "approved" | "blocked" | "executed" | "proposed" | "rejected" | "rolled_back" | "validated",
          targetRef: readOptionalRecordObject(action, "targetRef") ?? {
            sourceRecommendationId,
            threadId: options.conversationId,
          },
          tenantId: options.tenantId,
          threadId: options.conversationId,
          validation: readOptionalRecordObject(action, "validation") ?? {
            readOnlyMvp: true,
          },
          workspaceId: options.workspaceId,
        });
      }

      const outcome = readOptionalRecordObject(decision, "outcome")
        ?? readOptionalRecordObject(recommendation, "outcome");

      if (outcome) {
        await options.repository.upsertAssistantOutcome({
          baseline: readOptionalRecordObject(outcome, "baseline")
            ?? readOptionalRecordObject(decision, "baseline")
            ?? {},
          caseId: null,
          decisionId,
          expectedOutcome: readOptionalRecordObject(outcome, "expectedOutcome")
            ?? readOptionalRecordObject(decision, "expectedOutcome")
            ?? {},
          idempotencyKey: `${options.idempotencyKey}:outcome:${sourceRecommendationId}`,
          measuredOutcome: readOptionalRecordObject(outcome, "measuredOutcome") ?? {},
          recommendationId,
          status: readAllowedRecordString(
            outcome,
            "status",
            ["dismissed", "measured", "monitoring", "pending", "resolved"],
            "pending",
          ) as "dismissed" | "measured" | "monitoring" | "pending" | "resolved",
          tenantId: options.tenantId,
          threadId: options.conversationId,
          workspaceId: options.workspaceId,
        });
      }
    }
  }
}

function readOptionalRecordConfidence(
  record: Record<string, unknown>,
): number | null {
  const direct = record.confidence;
  if (typeof direct === "number" && Number.isFinite(direct)) {
    return Math.max(0, Math.min(1, direct));
  }

  if (typeof direct === "string" && Number.isFinite(Number(direct))) {
    return Math.max(0, Math.min(1, Number(direct)));
  }

  const status = readOptionalRecordString(record, "status");
  if (!status) return null;

  const match = status.match(/(\d+(?:[.,]\d+)?)\s*%/u);
  if (!match?.[1]) return null;

  const parsed = Number(match[1].replace(",", ".")) / 100;
  return Number.isFinite(parsed)
    ? Math.max(0, Math.min(1, parsed))
    : null;
}


async function syncMetricEngineProvenanceFromSnapshot(options: {
  readonly repository: AssistantConversationRepository;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly userId: string;
  readonly conversationId: string;
  readonly snapshot: Record<string, unknown>;
  readonly idempotencyKey: string;
}): Promise<void> {
  const metrics = readOptionalRecordArray(options.snapshot, "metrics")
    .filter((item): item is Record<string, unknown> => (
      Boolean(item)
      && typeof item === "object"
      && !Array.isArray(item)
    ));

  const evidence = readOptionalRecordArray(options.snapshot, "evidence")
    .filter((item): item is Record<string, unknown> => (
      Boolean(item)
      && typeof item === "object"
      && !Array.isArray(item)
    ));

  const filters = readOptionalRecordObject(options.snapshot, "filters")
    ?? {
      items: readOptionalRecordArray(options.snapshot, "filters"),
    };

  const dateRange = readOptionalRecordObject(options.snapshot, "dateRange")
    ?? {
      label: readOptionalRecordString(options.snapshot, "dateRangeLabel"),
    };

  const snapshotId = readOptionalRecordString(options.snapshot, "snapshotId")
    ?? readOptionalRecordString(options.snapshot, "metricSnapshotId")
    ?? `${options.workspaceId}:${options.conversationId}:${options.idempotencyKey}`;

  const metricSnapshotRow = await options.repository.upsertAssistantMetricEngineSnapshot({
    attributionContext: readOptionalRecordObject(options.snapshot, "attributionContext")
      ?? {
        route: readOptionalRecordString(options.snapshot, "route"),
        title: readOptionalRecordString(options.snapshot, "title"),
      },
    canonicalMetricRefs: readOptionalRecordArray(options.snapshot, "canonicalMetricRefs").length > 0
      ? readOptionalRecordArray(options.snapshot, "canonicalMetricRefs")
      : metrics.map((item) => ({
          id: readOptionalRecordString(item, "id"),
          label: readOptionalRecordString(item, "label"),
          source: readOptionalRecordString(item, "source"),
        })),
    contextSnapshotId: null,
    createdByUserId: options.userId,
    currency: readOptionalRecordString(options.snapshot, "currency"),
    dataQuality: readOptionalRecordObject(options.snapshot, "dataQuality")
      ?? {
        readiness: readOptionalRecordString(options.snapshot, "readiness"),
      },
    dateRange,
    filters,
    freshness: readOptionalRecordObject(options.snapshot, "freshness")
      ?? {
        capturedAt: readOptionalRecordString(options.snapshot, "capturedAt")
          ?? readOptionalRecordString(options.snapshot, "updatedAt"),
      },
    idempotencyKey: `${options.idempotencyKey}:metric-provenance`,
    metricIdentifiers: metrics.map((item) => (
      readOptionalRecordString(item, "id")
      ?? readOptionalRecordString(item, "metricCode")
      ?? readOptionalRecordString(item, "label")
      ?? "unknown"
    )),
    nullSemantics: readOptionalRecordString(options.snapshot, "nullSemantics") ?? "unknown",
    partialDataMetadata: readOptionalRecordObject(options.snapshot, "partialDataMetadata") ?? {},
    precisionConfig: readOptionalRecordObject(options.snapshot, "precision")
      ?? readOptionalRecordObject(options.snapshot, "rounding")
      ?? {},
    provenance: readOptionalRecordObject(options.snapshot, "provenance")
      ?? {
        source: "papa_context_snapshot",
      },
    snapshotId,
    sourceModule: readOptionalRecordString(options.snapshot, "sourceModule") ?? "papa",
    tenantId: options.tenantId,
    threadId: options.conversationId,
    timezone: readOptionalRecordString(options.snapshot, "timezone"),
    workspaceId: options.workspaceId,
  });

  const metricSnapshotId = readOptionalRowString(metricSnapshotRow, "id")
    ?? readOptionalRowString(metricSnapshotRow, "assistant_metric_snapshot_id");

  const provenanceItems = [...metrics, ...evidence].slice(0, 50);

  for (const item of provenanceItems) {
    const sourceType = resolvePapaSnapshotSourceType(item);

    await options.repository.appendAssistantEvidenceProvenance({
      canonicalMetricRef: {
        id: readOptionalRecordString(item, "id"),
        label: readOptionalRecordString(item, "label"),
        source: readOptionalRecordString(item, "source"),
      },
      dataQuality: {
        status: readOptionalRecordString(item, "status"),
      },
      evidenceId: null,
      freshnessAt: readOptionalRecordString(item, "freshnessAt")
        ?? readOptionalRecordString(item, "updatedAt"),
      metricIdentifier: readOptionalRecordString(item, "id")
        ?? readOptionalRecordString(item, "metricCode")
        ?? readOptionalRecordString(item, "label"),
      metricSnapshotId,
      provenance: {
        description: readOptionalRecordString(item, "description"),
        source: readOptionalRecordString(item, "source"),
        value: readOptionalRecordString(item, "value"),
      },
      sourceId: readOptionalRecordString(item, "id"),
      sourceLabel: readOptionalRecordString(item, "label"),
      sourcePath: readOptionalRecordString(item, "source"),
      sourceType,
      tenantId: options.tenantId,
      workspaceId: options.workspaceId,
    });
  }
}

function resolvePapaEvidenceSourceType(
  item: GroundingItem,
): "chart" | "context_snapshot" | "dashboard_readiness" | "integration" | "kpi" | "metric_engine_snapshot" | "metric_snapshot" | "recommendation" | "table" | "unknown" {
  return resolvePapaSourceTypeFromText([
    item.source,
    item.label,
    item.id,
    item.description,
  ]);
}

function resolvePapaSnapshotSourceType(
  item: Record<string, unknown>,
): "chart" | "context_snapshot" | "dashboard_readiness" | "integration" | "kpi" | "metric_engine_snapshot" | "metric_snapshot" | "recommendation" | "table" | "unknown" {
  return resolvePapaSourceTypeFromText([
    readOptionalRecordString(item, "sourceType"),
    readOptionalRecordString(item, "source"),
    readOptionalRecordString(item, "collection"),
    readOptionalRecordString(item, "label"),
    readOptionalRecordString(item, "id"),
  ]);
}

function resolvePapaSourceTypeFromText(
  values: readonly (string | null)[],
): "chart" | "context_snapshot" | "dashboard_readiness" | "integration" | "kpi" | "metric_engine_snapshot" | "metric_snapshot" | "recommendation" | "table" | "unknown" {
  const text = values
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  if (!text) return "unknown";
  if (text.includes("metric engine")) return "metric_engine_snapshot";
  if (text.includes("readiness")) return "dashboard_readiness";
  if (text.includes("context")) return "context_snapshot";
  if (text.includes("chart") || text.includes("wykres")) return "chart";
  if (text.includes("table") || text.includes("tabela")) return "table";
  if (text.includes("integration") || text.includes("integracja")) return "integration";
  if (text.includes("recommendation") || text.includes("rekomend")) return "recommendation";
  if (text.includes("kpi")) return "kpi";
  if (text.includes("metric") || text.includes("metryk")) return "metric_snapshot";
  return "unknown";
}


async function persistPapaAiAnswerContractAndGovernance(options: {
  readonly repository: AssistantConversationRepository;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly userId: string;
  readonly conversationId: string;
  readonly answerMessage: Record<string, unknown>;
  readonly idempotencyKey: string;
}): Promise<void> {
  const answerMessageId = readPapaContractOptionalRowString(
    options.answerMessage,
    "assistant_message_id",
  );

  const content = readPapaContractOptionalRowString(options.answerMessage, "content")
    ?? readPapaContractOptionalRowString(options.answerMessage, "body")
    ?? "";

  const confidence = readPapaContractRowConfidence(options.answerMessage, content);
  const refusal = buildPapaAnswerRefusal(content);
  const riskLevel = inferPapaAnswerRiskLevel(content, confidence, refusal.refused);
  const humanRequired = refusal.refused || riskLevel === "critical" || riskLevel === "high";

  await options.repository.upsertAssistantAiAnswerContract({
    answerMessageId,
    assumptions: extractPapaAnswerList(content, ["założ", "assumption"]),
    confidence,
    createdByUserId: options.userId,
    evidence: buildPapaAnswerEvidence(options.answerMessage),
    freshness: {
      generatedAt: readPapaContractOptionalRowString(options.answerMessage, "created_at")
        ?? new Date().toISOString(),
      source: "assistant_messages",
    },
    humanRequired,
    idempotencyKey: `${options.idempotencyKey}:answer-contract`,
    limitations: extractPapaAnswerList(content, ["ogranicz", "limitation", "brak danych"]),
    providerGuardrails: {
      cancellation: {
        status: "not_reported",
      },
      circuitBreaker: {
        state: "unknown",
      },
      cost: {
        status: "not_reported",
      },
      redaction: {
        status: "not_reported",
      },
      retry: {
        count: 0,
      },
      telemetry: {
        status: "not_reported",
      },
      timeout: {
        status: "not_reported",
      },
    },
    providerMetadata: {
      provider: "unknown",
      model: "unknown",
      source: "runtime_persistence",
    },
    refusal,
    riskLevel,
    tenantId: options.tenantId,
    thesis: extractPapaAnswerThesis(content),
    threadId: options.conversationId,
    workspaceId: options.workspaceId,
  });

  await options.repository.appendAssistantProviderGovernanceEvent({
    answerMessageId,
    cancellation: {
      cancelled: false,
      status: "not_reported",
    },
    circuitBreakerState: "unknown",
    cost: {
      status: "not_reported",
    },
    errorCode: refusal.refused ? "AI_REFUSAL" : null,
    errorMessage: refusal.refused ? refusal.reason : null,
    idempotencyKey: `${options.idempotencyKey}:provider-governance`,
    modelName: null,
    operationId: "papa.answer.generate",
    providerName: "unknown",
    redaction: {
      status: "not_reported",
    },
    requestId: null,
    retryCount: 0,
    status: refusal.refused ? "refused" : "completed",
    telemetry: {
      status: "not_reported",
    },
    tenantId: options.tenantId,
    threadId: options.conversationId,
    timeoutMs: null,
    workspaceId: options.workspaceId,
  });
}

function extractPapaAnswerThesis(content: string): string {
  const normalized = content.trim();

  if (!normalized) {
    return "Odpowiedź AI nie zawiera treści tezy.";
  }

  const firstLine = normalized
    .split(/\n+/u)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!firstLine) {
    return "Odpowiedź AI nie zawiera treści tezy.";
  }

  return firstLine.length > 500
    ? `${firstLine.slice(0, 497)}...`
    : firstLine;
}

function buildPapaAnswerEvidence(
  answerMessage: Record<string, unknown>,
): readonly Record<string, unknown>[] {
  const explicitEvidence = answerMessage.evidence;

  if (Array.isArray(explicitEvidence)) {
    return explicitEvidence.filter((item): item is Record<string, unknown> => (
      Boolean(item)
      && typeof item === "object"
      && !Array.isArray(item)
    ));
  }

  return [{
    source: "assistant_messages",
    sourceId: readPapaContractOptionalRowString(answerMessage, "assistant_message_id"),
    sourceType: "answer_message",
  }];
}

function extractPapaAnswerList(
  content: string,
  markers: readonly string[],
): readonly string[] {
  const lines = content
    .split(/\n+/u)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const matches = lines.filter((line) => {
    const normalized = line.toLowerCase();
    return markers.some((marker) => normalized.includes(marker.toLowerCase()));
  });

  return matches.slice(0, 10);
}

function buildPapaAnswerRefusal(content: string): {
  readonly refused: boolean;
  readonly reason: string | null;
} {
  const normalized = content.toLowerCase();

  const refused = normalized.includes("nie mogę")
    || normalized.includes("nie moge")
    || normalized.includes("odmaw")
    || normalized.includes("refusal")
    || normalized.includes("cannot comply");

  return {
    reason: refused ? extractPapaAnswerThesis(content) : null,
    refused,
  };
}

function inferPapaAnswerRiskLevel(
  content: string,
  confidence: number | null,
  refused: boolean,
): "critical" | "high" | "low" | "medium" | "unknown" {
  const normalized = content.toLowerCase();

  if (normalized.includes("critical") || normalized.includes("krytycz")) return "critical";
  if (refused) return "high";
  if (normalized.includes("high risk") || normalized.includes("wysokie ryzyko")) return "high";
  if (normalized.includes("low risk") || normalized.includes("niskie ryzyko")) return "low";
  if (confidence !== null && confidence < 0.4) return "high";
  if (confidence !== null && confidence < 0.7) return "medium";
  if (confidence !== null) return "low";
  return "unknown";
}

function readPapaContractRowConfidence(
  row: Record<string, unknown>,
  content: string,
): number | null {
  const direct = row.confidence;

  if (typeof direct === "number" && Number.isFinite(direct)) {
    return Math.max(0, Math.min(1, direct));
  }

  if (typeof direct === "string" && Number.isFinite(Number(direct))) {
    return Math.max(0, Math.min(1, Number(direct)));
  }

  const match = content.match(/(\d+(?:[.,]\d+)?)\s*%/u);
  if (!match?.[1]) return null;

  const parsed = Number(match[1].replace(",", ".")) / 100;

  return Number.isFinite(parsed)
    ? Math.max(0, Math.min(1, parsed))
    : null;
}

function readPapaContractOptionalRowString(
  row: Record<string, unknown>,
  key: string,
): string | null {
  const value = row[key];

  if (value instanceof Date) return value.toISOString();

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}



const PAPA_CONFIDENCE_ATTENTION_THRESHOLD = 1 / 2;
const PAPA_SYSTEM_MESSAGE_ROLE = "system" as const;

function hasPapaConfidenceAtLeastAttention(confidence: unknown): boolean {
  return typeof confidence === "number"
    && Number.isFinite(confidence)
    && confidence >= PAPA_CONFIDENCE_ATTENTION_THRESHOLD;
}

function isPapaConfidenceBelowAttention(confidence: unknown): boolean {
  return typeof confidence === "number"
    && Number.isFinite(confidence)
    && confidence < PAPA_CONFIDENCE_ATTENTION_THRESHOLD;
}

async function persistPapaPreProviderRedactionProof(options: {
  readonly repository: AssistantConversationRepository;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly threadId: string;
  readonly createdByUserId: string;
  readonly operationId: string;
  readonly rawInput: string;
  readonly idempotencyKey: string;
}): Promise<{
  readonly redactedInput: string;
  readonly redactedInputHash: string;
  readonly rawInputHash: string;
  readonly detectedCategories: readonly string[];
  readonly fieldsRedacted: readonly string[];
  readonly blocked: boolean;
  readonly blockReason: string | null;
}> {
  const proof = redactPapaProviderInputForPrivacy(options.rawInput);

  await options.repository.appendAssistantPrivacyRedactionEvent({
    blocked: proof.blocked,
    blockReason: proof.blockReason,
    createdByUserId: options.createdByUserId,
    detectedCategories: proof.detectedCategories,
    fieldsRedacted: proof.fieldsRedacted,
    idempotencyKey: `${options.idempotencyKey}:pre-provider-dlp`,
    operationId: options.operationId,
    policyVersion: "papa-dlp-v1",
    rawInputHash: proof.rawInputHash,
    redactedInputHash: proof.redactedInputHash,
    redactionSummary: {
      categories: proof.detectedCategories,
      redactedCharacters: Math.max(0, options.rawInput.length - proof.redactedInput.length),
      redactedFields: proof.fieldsRedacted.length,
      sampleStored: false,
    },
    sampleFree: true,
    stage: "pre_provider",
    tenantId: options.tenantId,
    threadId: options.threadId,
    workspaceId: options.workspaceId,
  });

  return proof;
}

function readPapaPrivacyPromptInput(
  options: Record<string, unknown>,
): string {
  for (const key of ["prompt", "question", "message", "input", "content"]) {
    const value = options[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return "";
}

function redactPapaProviderInputForPrivacy(input: string): {
  readonly redactedInput: string;
  readonly redactedInputHash: string;
  readonly rawInputHash: string;
  readonly detectedCategories: readonly string[];
  readonly fieldsRedacted: readonly string[];
  readonly blocked: boolean;
  readonly blockReason: string | null;
} {
  const detected = new Set<string>();
  const fields = new Set<string>();
  let redacted = input;

  const replacements: readonly {
    readonly category: string;
    readonly field: string;
    readonly pattern: RegExp;
    readonly token: string;
  }[] = [
    {
      category: "email",
      field: "email",
      pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu,
      token: "[REDACTED_EMAIL]",
    },
    {
      category: "phone",
      field: "phone",
      pattern: /(?<!\d)(?:\+?\d[\d\s().-]{7,}\d)(?!\d)/gu,
      token: "[REDACTED_PHONE]",
    },
    {
      category: "pesel",
      field: "pesel",
      pattern: /(?<!\d)\d{11}(?!\d)/gu,
      token: "[REDACTED_PESEL]",
    },
    {
      category: "nip",
      field: "nip",
      pattern: /(?<!\d)(?:NIP[:\s-]*)?\d{3}[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}(?!\d)/giu,
      token: "[REDACTED_NIP]",
    },
    {
      category: "iban",
      field: "iban",
      pattern: /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]){11,30}\b/giu,
      token: "[REDACTED_IBAN]",
    },
    {
      category: "secret",
      field: "secret",
      pattern: /\b(?:password|hasło|haslo|token|secret|api[_-]?key|klucz)\s*[:=]\s*["']?[^"',;\s]+/giu,
      token: "[REDACTED_SECRET]",
    },
    {
      category: "openai_key",
      field: "api_key",
      pattern: /\bsk-[A-Za-z0-9_-]{10,}\b/gu,
      token: "[REDACTED_API_KEY]",
    },
  ];

  for (const replacement of replacements) {
    if (replacement.pattern.test(redacted)) {
      detected.add(replacement.category);
      fields.add(replacement.field);
      replacement.pattern.lastIndex = 0;
      redacted = redacted.replace(replacement.pattern, replacement.token);
    }
  }

  const blocked = detected.has("secret") || detected.has("openai_key");

  return {
    blocked,
    blockReason: blocked ? "Provider input contains secret-like material and was redacted before provider use." : null,
    detectedCategories: [...detected],
    fieldsRedacted: [...fields],
    rawInputHash: hashPapaPrivacyInput(input),
    redactedInput: redacted,
    redactedInputHash: hashPapaPrivacyInput(redacted),
  };
}

function hashPapaPrivacyInput(input: string): string {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fnv1a:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}


function toPapaObservationRecord(
  row: Record<string, unknown>,
): PapaConversationRecord {
  const confidence = readOptionalRowNumber(row, "confidence") ?? 1;
  const evidenceItems = Array.isArray(row.evidence) ? row.evidence : [];

  return {
    actionId: null,
    approvalRequired: false,
    confidence,
    content: readRowString(row, "content"),
    createdAt: readRowIsoDate(row, "created_at"),
    evidence: evidenceItems.flatMap((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return [];
      const record = item as Record<string, unknown>;

      return [{
        collectedAt: readOptionalRecordString(record, "collectedAt")
          ?? readRowIsoDate(row, "created_at"),
        confidence,
        evidenceId: readOptionalRecordString(record, "id") ?? `observation-evidence-${index + 1}`,
        source: readOptionalRecordString(record, "source") ?? "assistant_observations",
      }];
    }),
    limitations: Array.isArray(row.limitations)
      ? row.limitations.filter((item): item is string => typeof item === "string")
      : [],
    messageId: readRowString(row, "assistant_observation_id"),
    riskLevel: "low",
    role: PAPA_SYSTEM_MESSAGE_ROLE,
    status: "completed",
  };
}


function toPapaConversationRecord(
  row: Record<string, unknown>,
  evidenceRows: readonly Record<string, unknown>[],
): PapaConversationRecord {
  const refusalCode = readOptionalRowString(row, "refusal_code");
  const role = readConversationRole(row) ?? "system";
  const confidence = readOptionalRowNumber(row, "confidence");
  const status: PapaConversationStatus = refusalCode
    ? "blocked"
    : role === "assistant" && hasPapaConfidenceAtLeastAttention(confidence)
      ? "ready"
      : "completed";

  return {
    actionId: null,
    approvalRequired: false,
    confidence,
    content: readRowString(row, "content"),
    createdAt: readRowIsoDate(row, "created_at"),
    evidence: evidenceRows.map((evidence) => ({
      collectedAt: readRowIsoDate(evidence, "created_at"),
      confidence: confidence ?? 0,
      evidenceId: readOptionalRowString(evidence, "metric_code")
        ?? readRowString(evidence, "assistant_evidence_id"),
      source: readRowString(evidence, "source_ref"),
    })),
    limitations: readRowStringArray(row, "limitations"),
    messageId: readRowString(row, "assistant_message_id"),
    riskLevel: refusalCode || isPapaConfidenceBelowAttention(confidence) ? "medium" : "low",
    role,
    status,
  };
}

function buildSummary(
  records: readonly PapaConversationRecord[],
): PapaConversationSummary {
  return {
    critical: records.filter((record) => record.status === "blocked").length,
    ready: records.filter((record) => record.status === "ready").length,
    total: records.length,
    updatedAt: records[0]?.createdAt ?? new Date().toISOString(),
    warning: records.filter((record) => (
      record.role === "assistant"
      && record.status === "completed"
      && record.confidence !== null
      && isPapaConfidenceBelowAttention(record.confidence)
    )).length,
  };
}

function toTimelineEvent(
  row: Record<string, unknown>,
): PapaHistoryTimelineEvent {
  return {
    actorId: null,
    description: readRowString(row, "capture_reason"),
    eventId: readRowString(row, "assistant_context_snapshot_id"),
    occurredAt: readRowIsoDate(row, "created_at"),
    type: "context_snapshot",
  };
}

function buildThreadTitle(prompt: string): string {
  const trimmed = prompt.trim();
  if (trimmed.length === 0) return "Papa Asystent";
  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}...` : trimmed;
}

function parseDeterministicSummary(output: string): string {
  try {
    const parsed = JSON.parse(output) as unknown;
    if (
      parsed
      && typeof parsed === "object"
      && "summary" in parsed
      && typeof (parsed as { summary: unknown }).summary === "string"
    ) {
      return (parsed as { summary: string }).summary;
    }
  } catch {
    // Real providers return plain text; use it without modification.
  }
  return output;
}

function readGroundingItems(
  snapshot: Record<string, unknown>,
  key: string,
): readonly GroundingItem[] {
  const value = snapshot[key];
  if (!Array.isArray(value)) return [];

  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    const label = readOptionalRecordString(record, "label")
      ?? readOptionalRecordString(record, "title")
      ?? `${key}-${index + 1}`;
    return [{
      id: readOptionalRecordString(record, "id") ?? `${key}-${index + 1}`,
      label,
      value: readOptionalRecordString(record, "value"),
      source: readOptionalRecordString(record, "source"),
      status: readOptionalRecordString(record, "status"),
      description: readOptionalRecordString(record, "description"),
    }];
  });
}

function parsePercent(value: string | null): number | null {
  if (!value) return null;
  const match = value.match(/(\d+(?:[.,]\d+)?)\s*%/u);
  if (!match?.[1]) return null;
  const parsed = Number(match[1].replace(",", ".")) / 100;
  return Number.isFinite(parsed) ? clampConfidence(parsed) : null;
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function readConversationRole(
  row: Record<string, unknown>,
): "assistant" | "system" | "user" | null {
  const value = row.role;
  return value === "assistant" || value === "system" || value === "user"
    ? value
    : null;
}

function readRowString(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Expected non-empty string column '${key}'.`);
  }
  return value;
}

function readRowIsoDate(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value.length > 0) return value;
  throw new Error(`Expected timestamp column '${key}'.`);
}

function readOptionalRowString(
  row: Record<string, unknown>,
  key: string,
): string | null {
  const value = row[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readOptionalRowNumber(
  row: Record<string, unknown>,
  key: string,
): number | null {
  const value = row[key];
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readRowStringArray(
  row: Record<string, unknown>,
  key: string,
): readonly string[] {
  const value = row[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readRowObject(
  row: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const value = row[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function readOptionalRecordArray(
  record: Record<string, unknown>,
  key: string,
): readonly unknown[] {
  const value = record[key];
  return Array.isArray(value) ? value : [];
}

function readOptionalRecordObject(
  record: Record<string, unknown>,
  key: string,
): Record<string, unknown> | null {
  const value = record[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function readAllowedRecordString(
  record: Record<string, unknown>,
  key: string,
  allowed: readonly string[],
  fallback: string,
): string {
  const value = readOptionalRecordString(record, key);
  return value && allowed.includes(value) ? value : fallback;
}


function readOptionalRecordString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}
