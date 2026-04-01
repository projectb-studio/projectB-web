export interface Notice {
  id: string;
  title: string;
  content: string;
  type: "notice" | "event";
  date: string;
  isPinned?: boolean;
}

const DUMMY_NOTICES: Notice[] = [
  {
    id: "1",
    title: "[공지] PROJECT B 온라인 스토어 오픈 안내",
    content: "안녕하세요, PROJECT B입니다.\n\n오프라인 매장에서만 만나볼 수 있었던 PROJECT B 제품을 이제 온라인에서도 만나보실 수 있습니다.\n\n앞으로도 좋은 제품으로 찾아뵙겠습니다. 감사합니다.",
    type: "notice",
    date: "2026-03-30",
    isPinned: true,
  },
  {
    id: "2",
    title: "[공지] 배송 안내 사항",
    content: "주문 후 2~3영업일 내 발송되며, 도서산간 지역은 추가 1~2일이 소요될 수 있습니다.\n\n5만원 이상 구매 시 무료배송입니다.",
    type: "notice",
    date: "2026-03-28",
  },
  {
    id: "3",
    title: "[공지] 개인정보처리방침 안내",
    content: "PROJECT B의 개인정보처리방침이 게시되었습니다. 자세한 내용은 하단 '개인정보처리방침' 링크를 확인해주세요.",
    type: "notice",
    date: "2026-03-25",
  },
  {
    id: "4",
    title: "[이벤트] 오픈 기념 전 상품 10% 할인",
    content: "온라인 스토어 오픈을 기념하여 전 상품 10% 할인 이벤트를 진행합니다.\n\n기간: 2026년 4월 1일 ~ 4월 14일\n쿠폰코드: OPEN10\n\n많은 관심 부탁드립니다!",
    type: "event",
    date: "2026-03-30",
    isPinned: true,
  },
  {
    id: "5",
    title: "[이벤트] 포토 리뷰 작성 시 적립금 1,000원 지급",
    content: "구매하신 상품의 포토 리뷰를 작성해주시면 적립금 1,000원을 지급해 드립니다.\n\n리뷰는 구매 확정 후 마이페이지에서 작성 가능합니다.",
    type: "event",
    date: "2026-03-28",
  },
  {
    id: "6",
    title: "[이벤트] 친구 초대 이벤트",
    content: "친구를 초대하고 함께 혜택을 받으세요!\n\n초대한 친구가 첫 구매 시:\n- 추천인: 2,000원 적립금\n- 피추천인: 2,000원 할인 쿠폰",
    type: "event",
    date: "2026-03-25",
  },
];

export async function getNotices(type?: "notice" | "event"): Promise<Notice[]> {
  const filtered = type ? DUMMY_NOTICES.filter((n) => n.type === type) : DUMMY_NOTICES;
  return filtered.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
