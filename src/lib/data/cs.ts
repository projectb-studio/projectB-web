export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const DUMMY_FAQ: FaqItem[] = [
  {
    id: "1",
    question: "배송은 얼마나 걸리나요?",
    answer: "일반 택배 기준 결제 완료 후 2~3영업일 내 발송됩니다. 도서산간 지역은 3~5영업일이 소요될 수 있습니다.",
    category: "배송",
  },
  {
    id: "2",
    question: "무료배송 조건은 무엇인가요?",
    answer: "50,000원 이상 구매 시 무료배송입니다. 미만 주문 시 배송비 3,000원이 부과됩니다.",
    category: "배송",
  },
  {
    id: "3",
    question: "교환/반품은 어떻게 하나요?",
    answer: "수령 후 7일 이내에 1:1 문의 또는 카카오톡으로 접수해 주세요. 단순 변심의 경우 반품 배송비는 고객 부담입니다. 상품 하자의 경우 무료 교환/반품 처리됩니다.",
    category: "교환/반품",
  },
  {
    id: "4",
    question: "핸드메이드 제품의 미세한 차이가 있나요?",
    answer: "모든 핸드메이드 제품은 하나하나 수작업으로 제작되어 크기, 색상, 패턴에 미세한 차이가 있을 수 있습니다. 이는 불량이 아닌 핸드메이드의 특성이며, 교환/반품 사유에 해당하지 않습니다.",
    category: "상품",
  },
  {
    id: "5",
    question: "세탁은 어떻게 해야 하나요?",
    answer: "패브릭 제품은 30도 이하 찬물에 중성세제로 손세탁을 권장합니다. 도자기/유리/금속 제품은 부드러운 마른 천으로 닦아주세요. 각 제품 상세 페이지의 Care 탭에서 관리법을 확인하실 수 있습니다.",
    category: "상품",
  },
  {
    id: "6",
    question: "선물 포장이 가능한가요?",
    answer: "네, 주문 시 배송 메모에 '선물 포장 요청'이라고 적어주시면 무료로 포장해 드립니다.",
    category: "주문",
  },
  {
    id: "7",
    question: "적립금/포인트는 어떻게 사용하나요?",
    answer: "결제 시 보유 적립금을 사용할 수 있습니다. 적립금은 구매 확정 후 자동 적립되며, 마이페이지에서 확인 가능합니다.",
    category: "주문",
  },
  {
    id: "8",
    question: "오프라인 매장에서도 온라인 가격으로 구매할 수 있나요?",
    answer: "온/오프라인 가격은 동일합니다. 다만, 온라인 전용 할인이나 쿠폰은 매장에서 적용되지 않을 수 있습니다.",
    category: "매장",
  },
];

export async function getFaqItems(): Promise<FaqItem[]> {
  return DUMMY_FAQ;
}
