import type { DraftProvider, GenerateInput, GenerateOutput } from "@/lib/ai-draft/provider";
import type { VoiceCopy } from "@/lib/ai-draft/recipe";

/**
 * 결정적(deterministic) 스텁 Provider.
 *
 * 실제 LLM 키 없이도 전체 파이프라인(생성 → 검수 → 발행)이 동작하도록 한다.
 * 동일 입력 → 동일 출력이므로 테스트와 데모에 안정적이다.
 * LLM Provider 와 "동일한 슬롯 구조"를 채우므로 검수 화면은 완전히 동일하게 동작한다.
 */

const TAG_LABEL: Record<string, string> = {
  handmade: "핸드메이드 소품",
  fabric: "패브릭 소품",
  metal: "메탈 소품",
  wood: "우드 소품",
  stone: "스톤 소품",
  glass: "글라스 소품",
};

function tagLabel(tag: string): string {
  return TAG_LABEL[tag] ?? "소품";
}

export class StubDraftProvider implements DraftProvider {
  async generate(input: GenerateInput): Promise<GenerateOutput> {
    const { facts, feedback, previousVoice } = input;
    const label = tagLabel(facts.tag);
    const desc = facts.description?.trim();

    const heroCaption = `${facts.name.toUpperCase()} — 손끝에서 완성된 ${label}`;

    const conceptParas: string[] = [
      `<p>${escapeHtml(facts.name)}은(는) 매일의 공간에 자연스럽게 스며드는 ${escapeHtml(
        label
      )}입니다.</p>`,
    ];
    if (desc) {
      conceptParas.push(`<p>${escapeHtml(desc)}</p>`);
    }
    // 반려 의견을 반영해 재생성하는 경우, 의견을 컨셉 보완에 명시적으로 반영한다.
    if (feedback?.trim()) {
      conceptParas.push(
        `<p>${escapeHtml(feedback.trim())}</p>`
      );
    }

    const points: VoiceCopy["points"] = [
      {
        title: "오래 곁에 두는 마감",
        bodyHtml: "<p>거친 부분 없이 다듬어, 매일 손이 닿아도 변함없는 마감입니다.</p>",
      },
      {
        title: "공간과 어우러지는 톤",
        bodyHtml: "<p>과하지 않은 색과 형태로, 어떤 공간에도 자연스럽게 놓입니다.</p>",
      },
      {
        title: "하나씩 만든 디테일",
        bodyHtml: "<p>대량 생산이 아닌, 하나하나 손으로 다듬은 디테일을 담았습니다.</p>",
      },
    ];

    // 직전 보이스가 있으면(재생성) 포인트 톤을 약간 변형해 "수정본"임을 드러낸다.
    const finalPoints = previousVoice
      ? points.map((p) => ({ ...p, title: `${p.title} (개정)` }))
      : points;

    return {
      voice: {
        heroCaption,
        conceptHtml: conceptParas.join(""),
        points: finalPoints,
        problemHtml:
          `<p>${escapeHtml(label)}을(를) 고를 때 무엇을 봐야 할지 막막할 수 있습니다.</p>` +
          `<p>${escapeHtml(facts.name)}은(는) 손이 닿는 자리부터 다듬어 그 고민을 줄입니다.</p>`,
        closingHtml: `<p>오래 두고 쓰기를 전제로 만든 ${escapeHtml(label)}입니다.</p>`,
      },
      generator: "stub",
      rawMeta: {
        appliedFeedback: feedback?.trim() ? true : false,
        revisedFromPrevious: previousVoice ? true : false,
      },
    };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
