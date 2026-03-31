import { useState, useRef } from "react";

const SECTIONS = [
  {
    id: "business",
    icon: "🏪",
    title: "우리 가게 소개",
    subtitle: "사장님의 사업을 이해하기 위한 질문입니다",
    questions: [
      { id: "b1", label: "가게(브랜드) 이름이 뭔가요?", type: "text", placeholder: "예: 행복한꽃집, 모던리빙 등", mapping: "brand_name" },
      { id: "b2", label: "주로 어떤 상품을 파시나요?", type: "textarea", placeholder: "예: 여성 의류, 수제 액세서리, 건강식품, 생활용품 등\n가능하면 대표 상품 카테고리를 적어주세요", mapping: "product_type" },
      { id: "b3", label: "상품이 대략 몇 개 정도 되나요?", type: "select", options: ["10개 이하", "10~50개", "50~200개", "200~1000개", "1000개 이상"], mapping: "product_count" },
      { id: "b4", label: "주로 어떤 분들이 사장님 가게에서 물건을 사시나요?", type: "textarea", placeholder: "예: 20~30대 여성, 40~50대 주부, 남녀 모두, 학생 등", mapping: "target_audience" },
      { id: "b5", label: "오프라인 매장도 있으신가요?", type: "select", options: ["온라인만 운영", "오프라인 매장도 있음", "오프라인이 메인이고 온라인 추가 희망"], mapping: "offline_store" },
      { id: "b6", label: "우리 가게만의 특별한 점이 있다면?", type: "textarea", placeholder: "예: 직접 만든 수제 제품, 산지 직송, 무료 배송, 독점 브랜드 등", mapping: "usp" },
      { id: "b7", label: "로고나 브랜드 이미지가 있으신가요?", type: "select", options: ["이미 있음 (파일 제공 가능)", "대략적인 아이디어만 있음", "새로 만들어주세요", "아직 없고 고민 중"], mapping: "logo_status" },
    ],
  },
  {
    id: "legal",
    icon: "📋",
    title: "사업 준비 상태",
    subtitle: "온라인 판매에 필요한 법적 준비 상태를 확인합니다",
    isNew: true,
    questions: [
      { id: "l1", label: "사업자등록은 되어 있으신가요?", type: "select", options: ["개인사업자", "법인사업자", "간이과세자", "아직 안 했음", "잘 모르겠음"], mapping: "business_registration" },
      { id: "l2", label: "통신판매업 신고는 하셨나요?", type: "select", options: ["이미 신고 완료", "아직 안 했음", "이게 뭔지 모르겠음"], mapping: "ecommerce_license", hint: "온라인으로 물건을 팔려면 반드시 필요한 신고예요. 구청에서 해요" },
      { id: "l3", label: "세금계산서 발행이 필요한가요?", type: "select", options: ["필요함 (기업 고객이 있음)", "필요 없음 (개인 고객만)", "잘 모르겠음"], mapping: "tax_invoice" },
      { id: "l4", label: "이미 계약된 택배사가 있나요?", type: "select", options: ["CJ대한통운", "한진택배", "롯데택배", "우체국택배", "여러 곳 사용", "아직 없음"], mapping: "delivery_company" },
      { id: "l5", label: "개인정보처리방침 준비는 되어 있나요?", type: "select", options: ["이미 있음", "만들어줘야 함", "이게 뭔지 모르겠음"], mapping: "privacy_policy", hint: "회원가입 기능이 있으면 법적으로 반드시 필요해요" },
    ],
  },
  {
    id: "customers",
    icon: "👥",
    title: "고객 & 매출 현황",
    subtitle: "현재 장사 상황을 파악해야 맞춤 설계가 가능합니다",
    isNew: true,
    questions: [
      { id: "c1", label: "고객이 보통 어디서 우리 가게를 알게 되나요?", type: "multi", options: ["인스타그램", "네이버 검색", "블로그/카페", "지인 추천(입소문)", "유튜브", "광고(페이스북/구글 등)", "오프라인 매장 방문 후", "기타"], mapping: "customer_source" },
      { id: "c2", label: "한 달에 주문이 대략 몇 건 정도 되나요?", type: "select", options: ["아직 없음 (처음 시작)", "10건 이하", "10~50건", "50~200건", "200~1000건", "1000건 이상"], mapping: "monthly_orders" },
      { id: "c3", label: "한번 사신 분이 또 사시는 편인가요? (재구매율)", type: "select", options: ["거의 없음 (대부분 1회 구매)", "가끔 있음 (20~30%)", "꽤 많음 (50% 이상)", "대부분 재구매 (단골 위주)", "잘 모르겠음"], mapping: "repeat_purchase_rate" },
      { id: "c4", label: "반품/교환이 많은 편인가요?", type: "select", options: ["거의 없음", "가끔 있음", "꽤 많음 (10% 이상)", "잘 모르겠음"], mapping: "return_rate" },
      { id: "c5", label: "고객이 가장 많이 하는 문의는 뭔가요?", type: "textarea", placeholder: "예: 배송 언제 오나요, 사이즈 문의, 재입고 문의, 교환/반품 등\n가장 많이 들어오는 것 2~3개만 적어주세요", mapping: "top_inquiries" },
    ],
  },
  {
    id: "design",
    icon: "🎨",
    title: "원하는 느낌 & 디자인",
    subtitle: "홈페이지/앱의 분위기를 정하기 위한 질문입니다",
    questions: [
      { id: "d1", label: "홈페이지 분위기로 어떤 느낌을 원하세요?", type: "multi", options: ["깔끔하고 심플한", "고급스럽고 세련된", "귀엽고 발랄한", "따뜻하고 편안한", "트렌디하고 모던한", "전통적이고 신뢰감 있는", "화려하고 눈에 띄는", "자연친화적인"], mapping: "design_mood" },
      { id: "d2", label: "좋아하는 색상이 있으신가요?", type: "textarea", placeholder: "예: 파란색 계열, 핑크+화이트, 블랙+골드 등\n잘 모르겠으면 '맡겨주세요'라고 적어도 됩니다", mapping: "color_preference" },
      { id: "d3", label: "'이런 사이트 느낌이 좋다' 하는 곳이 있으면 알려주세요", type: "textarea", placeholder: "예: 무신사, 29cm, 쿠팡, 마켓컬리 등\n또는 URL 주소를 적어주셔도 됩니다\n여러 개 적어주셔도 좋아요!", mapping: "reference_sites" },
      { id: "d4", label: "상품 사진 스타일은 어떤 걸 주로 쓰시나요?", type: "select", options: ["직접 촬영한 사진", "전문 촬영 사진", "제조사 제공 이미지", "아직 사진이 없음", "혼합 사용"], mapping: "photo_style" },
    ],
  },
  {
    id: "content",
    icon: "📸",
    title: "콘텐츠 준비 상태",
    subtitle: "홈페이지에 실제로 들어갈 내용물에 대한 질문입니다",
    isNew: true,
    questions: [
      { id: "ct1", label: "상품 상세페이지에 뭘 넣고 싶으세요? (복수 선택)", type: "multi", options: ["상품 사진 여러 장", "텍스트 상세 설명", "영상 리뷰/사용법", "성분표/원산지 정보", "사이즈 가이드", "배송/교환 안내", "관련 상품 추천"], mapping: "product_detail_content" },
      { id: "ct2", label: "배너/이벤트 이미지는 누가 만드나요?", type: "select", options: ["내가 직접 만듦 (캔바, 미리캔버스 등)", "별도 디자이너가 있음", "만들어줬으면 좋겠음", "배너 없이 심플하게"], mapping: "banner_creator" },
      { id: "ct3", label: "블로그나 매거진 콘텐츠를 직접 쓰실 건가요?", type: "select", options: ["직접 쓸 예정", "가끔 쓸 것 같음", "안 쓸 것 같음 (블로그 불필요)", "누가 대신 써주면 좋겠음"], mapping: "blog_plan" },
    ],
  },
  {
    id: "pages",
    icon: "📄",
    title: "어떤 페이지가 필요한가요?",
    subtitle: "홈페이지에 들어갈 화면(페이지)을 정하는 질문입니다",
    questions: [
      { id: "p1", label: "아래 페이지 중 필요한 것을 모두 골라주세요", type: "multi", options: ["메인(홈) 페이지", "상품 목록 페이지", "상품 상세 페이지", "장바구니", "주문/결제 페이지", "회원가입/로그인", "마이페이지 (주문내역, 정보수정)", "공지사항/이벤트", "고객센터/문의하기", "회사(브랜드) 소개", "이용약관/개인정보처리방침", "블로그/매거진", "리뷰 게시판"], mapping: "required_pages" },
      { id: "p2", label: "상품 카테고리(분류)를 어떻게 나누고 싶으세요?", type: "textarea", placeholder: "예: 상의/하의/아우터/악세서리\n예: 과일/채소/건강식품/간식\n\n대분류-중분류가 있다면 함께 적어주세요", mapping: "product_categories" },
      { id: "p3", label: "그 외에 추가로 필요한 페이지가 있으면 적어주세요", type: "textarea", placeholder: "예: 매장 위치 안내, 도매 문의, 제휴 문의, FAQ 등", mapping: "extra_pages" },
    ],
  },
  {
    id: "features",
    icon: "⚙️",
    title: "필요한 기능",
    subtitle: "홈페이지/앱에서 작동했으면 하는 기능들입니다",
    questions: [
      { id: "f1", label: "결제 관련 - 필요한 것을 모두 골라주세요", type: "multi", options: ["카드 결제", "무통장 입금", "카카오페이", "네이버페이", "토스페이", "휴대폰 결제", "해외 결제 (페이팔 등)", "포인트/적립금 결제"], mapping: "payment_methods" },
      { id: "f2", label: "회원/고객 관련 기능 - 필요한 것을 모두 골라주세요", type: "multi", options: ["회원가입 (이메일)", "카카오 로그인", "네이버 로그인", "구글 로그인", "애플 로그인", "비회원 주문", "회원 등급 (VIP 등)", "적립금/포인트", "쿠폰 발급", "찜하기/위시리스트"], mapping: "member_features" },
      { id: "f3", label: "상품/주문 관련 기능 - 필요한 것을 모두 골라주세요", type: "multi", options: ["상품 옵션 선택 (색상, 사이즈 등)", "상품 리뷰/별점", "상품 문의 (Q&A)", "재입고 알림", "상품 비교", "최근 본 상품", "추천 상품 (AI 추천)", "세트/묶음 상품", "예약 주문", "정기 구독"], mapping: "product_features" },
      { id: "f4", label: "배송 관련 - 필요한 것을 모두 골라주세요", type: "multi", options: ["택배 배송", "퀵/당일 배송", "매장 픽업", "배송 추적", "무료 배송 조건 설정", "해외 배송"], mapping: "shipping_features" },
      { id: "f5", label: "마케팅/알림 기능 - 필요한 것을 모두 골라주세요", type: "multi", options: ["이벤트/할인 배너", "타임세일/한정판매", "SMS/문자 알림", "카카오 알림톡", "이메일 뉴스레터", "앱 푸시 알림", "SNS 공유 버튼", "팝업 공지"], mapping: "marketing_features" },
      { id: "f6", label: "고객 응대 기능 - 필요한 것을 모두 골라주세요", type: "multi", options: ["1:1 문의 게시판", "실시간 채팅 상담", "카카오톡 상담 연결", "전화 문의 버튼", "자주 묻는 질문(FAQ)", "교환/반품 신청"], mapping: "cs_features" },
    ],
  },
  {
    id: "admin",
    icon: "🔧",
    title: "관리자(사장님) 기능",
    subtitle: "사장님이 직접 관리할 수 있어야 하는 것들입니다",
    questions: [
      { id: "a1", label: "사장님이 직접 하고 싶은 것을 골라주세요", type: "multi", options: ["상품 등록/수정/삭제", "주문 확인/처리", "배송 상태 변경", "매출/통계 확인", "회원 관리", "쿠폰/이벤트 생성", "공지사항 작성", "리뷰/문의 답변", "재고 관리", "정산 확인"], mapping: "admin_features" },
      { id: "a2", label: "관리자가 사장님 혼자인가요? 직원도 쓰나요?", type: "select", options: ["나 혼자만 사용", "직원 1~2명도 사용", "여러 명이 역할 나눠서 사용"], mapping: "admin_users" },
      { id: "a3", label: "현재 재고/상품 관리는 어떻게 하고 계세요?", type: "select", options: ["엑셀/스프레드시트", "별도 프로그램 사용 (SAP, ERP 등)", "수기/메모", "아직 체계 없음", "기타"], mapping: "current_management" },
    ],
  },
  {
    id: "app",
    icon: "📱",
    title: "앱(모바일) 관련",
    subtitle: "스마트폰 앱에 대한 질문입니다",
    questions: [
      { id: "m1", label: "앱도 필요하신가요?", type: "select", options: ["웹사이트만 있으면 됨", "앱도 필요함 (안드로이드+아이폰)", "안드로이드만", "아이폰만", "나중에 추가할 예정"], mapping: "app_need" },
      { id: "m2", label: "앱에서 특별히 필요한 기능이 있나요?", type: "multi", options: ["푸시 알림 (할인/이벤트 알림)", "바코드/QR 스캔", "위치 기반 서비스 (근처 매장 찾기)", "카메라 (리뷰 사진 촬영)", "오프라인에서도 일부 사용", "특별히 없음 (웹과 같으면 됨)"], mapping: "app_features" },
    ],
  },
  {
    id: "marketing",
    icon: "📢",
    title: "마케팅 & 성장",
    subtitle: "홈페이지를 만든 후 고객을 모으기 위한 질문입니다",
    isNew: true,
    questions: [
      { id: "mk1", label: "현재 운영 중인 SNS 채널이 있으신가요? (복수 선택)", type: "multi", options: ["인스타그램", "네이버 블로그", "유튜브", "페이스북", "카카오 채널", "틱톡", "없음"], mapping: "sns_channels" },
      { id: "mk2", label: "네이버 쇼핑이나 카카오 쇼핑에 입점할 계획이 있나요?", type: "select", options: ["이미 입점해 있음", "입점할 계획 있음", "관심 없음", "이게 뭔지 모르겠음"], mapping: "marketplace_plan", hint: "네이버/카카오에 상품을 노출하면 검색으로 고객이 유입돼요" },
    ],
  },
  {
    id: "operation",
    icon: "💼",
    title: "운영 & 예산",
    subtitle: "프로젝트 진행에 필요한 실무적인 질문입니다",
    questions: [
      { id: "o1", label: "도메인(인터넷 주소)이 있으신가요?", type: "select", options: ["이미 있음 (예: www.가게이름.com)", "없지만 원하는 이름이 있음", "추천해주세요", "잘 모르겠음"], mapping: "domain_status" },
      { id: "o1a", label: "원하는 도메인이 있다면 적어주세요", type: "text", placeholder: "예: www.happyflower.co.kr", mapping: "domain_name" },
      { id: "o2", label: "언제까지 완성되면 좋겠어요?", type: "select", options: ["급함 (1개월 이내)", "여유 있음 (2~3개월)", "천천히 (6개월 이내)", "시간 제한 없음"], mapping: "timeline" },
      { id: "o3", label: "예산은 대략 어느 정도 생각하고 계세요?", type: "select", options: ["100만원 이하", "100~300만원", "300~500만원", "500~1000만원", "1000만원 이상", "잘 모르겠음 (견적 요청)"], mapping: "budget" },
      { id: "o4", label: "월 유지비(서버, 관리 등)는 얼마까지 괜찮으세요?", type: "select", options: ["최소한으로 (5만원 이하)", "적당히 (5~20만원)", "투자할 의향 있음 (20만원 이상)", "잘 모르겠음"], mapping: "monthly_budget" },
      { id: "o5", label: "현재 다른 쇼핑몰 플랫폼을 사용하고 계신가요?", type: "select", options: ["없음 (처음 시작)", "네이버 스마트스토어", "카페24", "고도몰", "쿠팡/11번가 등 오픈마켓", "인스타그램/블로그로만 판매 중", "기타"], mapping: "current_platform" },
      { id: "o6", label: "기존 플랫폼에서 데이터(상품, 회원 등) 옮겨야 하나요?", type: "select", options: ["옮길 데이터 없음", "상품 데이터만", "회원 + 상품 데이터", "전체 데이터 이전 필요", "해당 없음"], mapping: "data_migration" },
    ],
  },
  {
    id: "extra",
    icon: "💡",
    title: "추가 요청사항",
    subtitle: "마지막으로 자유롭게 적어주세요!",
    questions: [
      { id: "e1", label: "꼭 넣고 싶은 기능이나 아이디어가 있으면 자유롭게 적어주세요", type: "textarea", placeholder: "예: 라이브 커머스, 멤버십 구독, SNS 피드 연동, 특별한 이벤트 페이지 등\n\n어떤 아이디어든 괜찮습니다!", mapping: "extra_ideas" },
      { id: "e2", label: "절대 싫은 것, 피하고 싶은 것이 있다면?", type: "textarea", placeholder: "예: 복잡한 회원가입, 너무 화려한 디자인, 팝업 광고 등", mapping: "avoid_items" },
      { id: "e3", label: "경쟁 업체(라이벌)가 있다면 알려주세요", type: "textarea", placeholder: "예: OO쇼핑몰 (www.example.com)\n경쟁사보다 나은 점을 만들어드릴게요!", mapping: "competitors" },
    ],
  },
];

const ProgressBar = ({ current, total }) => (
  <div style={{ width: "100%", height: 6, background: "#1a1a2e", borderRadius: 3, overflow: "hidden" }}>
    <div style={{ width: `${(current / total) * 100}%`, height: "100%", background: "linear-gradient(90deg, #e94560, #ff6b6b)", borderRadius: 3, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
  </div>
);

const MultiSelect = ({ options, selected = [], onChange }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {options.map((opt) => {
      const isSelected = selected.includes(opt);
      return (
        <button key={opt} onClick={() => { if (isSelected) onChange(selected.filter((s) => s !== opt)); else onChange([...selected, opt]); }}
          style={{ padding: "8px 16px", borderRadius: 20, border: isSelected ? "2px solid #e94560" : "2px solid #2a2a4a", background: isSelected ? "rgba(233,69,96,0.15)" : "rgba(255,255,255,0.03)", color: isSelected ? "#ff6b6b" : "#8888aa", cursor: "pointer", fontSize: 14, fontFamily: "'Pretendard', sans-serif", transition: "all 0.2s", fontWeight: isSelected ? 600 : 400 }}>
          {isSelected ? "✓ " : ""}{opt}
        </button>
      );
    })}
  </div>
);

export default function ShoppingMallChecklistV2() {
  const [answers, setAnswers] = useState({});
  const [activeSection, setActiveSection] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportTab, setExportTab] = useState("text");

  const updateAnswer = (qId, value) => setAnswers((prev) => ({ ...prev, [qId]: value }));

  const totalQuestions = SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);
  const answeredCount = Object.keys(answers).filter((k) => {
    const v = answers[k];
    if (Array.isArray(v)) return v.length > 0;
    return v && v.trim && v.trim() !== "";
  }).length;

  const section = SECTIONS[activeSection];

  const generateExportText = () => {
    let text = "═══════════════════════════════════════\n";
    text += "  🛍️ 쇼핑몰 홈페이지/앱 제작 요청서 v2\n";
    text += `  작성일: ${new Date().toLocaleDateString("ko-KR")}\n`;
    text += `  응답률: ${answeredCount}/${totalQuestions} (${Math.round((answeredCount / totalQuestions) * 100)}%)\n`;
    text += "═══════════════════════════════════════\n\n";
    SECTIONS.forEach((sec) => {
      text += `\n${sec.icon} [${sec.title}]${sec.isNew ? " ★NEW" : ""}\n`;
      text += "───────────────────────────────────────\n";
      sec.questions.forEach((q) => {
        const ans = answers[q.id];
        let ansText = "";
        if (Array.isArray(ans) && ans.length > 0) ansText = ans.join(", ");
        else if (typeof ans === "string" && ans.trim()) ansText = ans;
        else ansText = "(미응답)";
        text += `\nQ. ${q.label}\n→ ${ansText}\n`;
      });
      text += "\n";
    });
    return text;
  };

  const generateJSON = () => {
    const result = { _version: "2.0", _date: new Date().toISOString(), _answered: answeredCount, _total: totalQuestions };
    SECTIONS.forEach((sec) => { sec.questions.forEach((q) => { if (answers[q.id]) result[q.mapping] = answers[q.id]; }); });
    return JSON.stringify(result, null, 2);
  };

  const handleCopy = (text) => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };

  if (showExport) {
    const exportText = generateExportText();
    const jsonText = generateJSON();
    return (
      <div style={{ fontFamily: "'Pretendard', -apple-system, sans-serif", background: "#0f0f23", minHeight: "100vh", color: "#e0e0f0", padding: "32px 20px" }}>
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet" />
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <button onClick={() => setShowExport(false)} style={{ background: "none", border: "none", color: "#8888aa", cursor: "pointer", fontSize: 16, marginBottom: 20, fontFamily: "inherit" }}>← 체크리스트로 돌아가기</button>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>📋 응답 결과 내보내기 <span style={{ fontSize: 14, color: "#e94560", fontWeight: 600 }}>v2</span></h1>
          <p style={{ color: "#8888aa", marginBottom: 24 }}>아래 내용을 복사해서 개발자(나)에게 전달하면 됩니다</p>

          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[{ key: "text", label: "📝 텍스트 (사장님용)" }, { key: "json", label: "🔧 JSON (Claude 설계용)" }].map((t) => (
              <button key={t.key} onClick={() => setExportTab(t.key)}
                style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: exportTab === t.key ? "#e94560" : "#1a1a2e", color: exportTab === t.key ? "white" : "#8888aa", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={() => handleCopy(exportTab === "text" ? exportText : jsonText)}
              style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: copied ? "#2ecc71" : "#3498db", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>
              {copied ? "✓ 복사됨!" : "📋 복사하기"}
            </button>
          </div>
          <pre style={{ background: "#1a1a2e", padding: 20, borderRadius: 12, fontSize: 13, lineHeight: 1.8, overflow: "auto", maxHeight: 500, border: "1px solid #2a2a4a", whiteSpace: "pre-wrap", wordBreak: "break-word", color: exportTab === "json" ? "#7ec8e3" : "#e0e0f0" }}>
            {exportTab === "text" ? exportText : jsonText}
          </pre>
          {exportTab === "json" && (
            <p style={{ color: "#8888aa", fontSize: 13, marginTop: 12 }}>이 JSON을 Claude에 붙여넣으면 → 분석 → Sitemap → Wireframe → Style Guide → 프로토타입까지 자동 설계됩니다</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Pretendard', -apple-system, sans-serif", background: "#0f0f23", minHeight: "100vh", color: "#e0e0f0" }}>
      <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet" />
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", borderBottom: "1px solid #2a2a4a", padding: "24px 20px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 36 }}>🛍️</div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>쇼핑몰 제작 체크리스트 <span style={{ fontSize: 14, color: "#e94560", fontWeight: 600 }}>v2</span></h1>
              <p style={{ fontSize: 13, color: "#8888aa", margin: "4px 0 0" }}>사장님, 아래 질문에 답해주시면 딱 맞는 홈페이지를 만들어드릴게요!</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ProgressBar current={answeredCount} total={totalQuestions} />
            <span style={{ fontSize: 13, color: "#e94560", fontWeight: 700, whiteSpace: "nowrap" }}>{answeredCount}/{totalQuestions}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "16px 0", WebkitOverflowScrolling: "touch" }}>
          {SECTIONS.map((sec, i) => {
            const sectionAnswered = sec.questions.filter((q) => { const v = answers[q.id]; if (Array.isArray(v)) return v.length > 0; return v && v.trim && v.trim() !== ""; }).length;
            const isActive = i === activeSection;
            const isComplete = sectionAnswered === sec.questions.length;
            return (
              <button key={sec.id} onClick={() => setActiveSection(i)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 12, border: "none", background: isActive ? "rgba(233,69,96,0.15)" : "rgba(255,255,255,0.03)", color: isActive ? "#ff6b6b" : isComplete ? "#2ecc71" : "#8888aa", cursor: "pointer", fontSize: 13, fontWeight: isActive ? 700 : 500, whiteSpace: "nowrap", fontFamily: "inherit", outline: isActive ? "2px solid #e94560" : "none", transition: "all 0.2s", position: "relative" }}>
                <span>{sec.icon}</span>
                <span>{sec.title}</span>
                {sec.isNew && <span style={{ fontSize: 9, background: "#e94560", color: "white", padding: "1px 5px", borderRadius: 6, fontWeight: 700 }}>NEW</span>}
                {isComplete && <span style={{ color: "#2ecc71" }}>✓</span>}
                {!isComplete && sectionAnswered > 0 && <span style={{ fontSize: 11, color: "#8888aa" }}>{sectionAnswered}/{sec.questions.length}</span>}
              </button>
            );
          })}
        </div>

        <div style={{ paddingBottom: 120 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", display: "flex", alignItems: "center", gap: 10 }}>
              {section.icon} {section.title}
              {section.isNew && <span style={{ fontSize: 12, background: "#e94560", color: "white", padding: "3px 10px", borderRadius: 8, fontWeight: 700 }}>NEW</span>}
            </h2>
            <p style={{ color: "#8888aa", fontSize: 14, margin: 0 }}>{section.subtitle}</p>
          </div>

          {section.questions.map((q, qi) => (
            <div key={q.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "20px 24px", marginBottom: 16, border: "1px solid #2a2a4a" }}>
              <label style={{ display: "block", fontSize: 15, fontWeight: 700, marginBottom: q.hint ? 6 : 12, lineHeight: 1.5 }}>
                <span style={{ color: "#e94560", marginRight: 8 }}>Q{qi + 1}.</span>{q.label}
              </label>
              {q.hint && <p style={{ fontSize: 13, color: "#6a6a8a", marginBottom: 12, paddingLeft: 4, lineHeight: 1.5 }}>💡 {q.hint}</p>}

              {q.type === "text" && (
                <input type="text" value={answers[q.id] || ""} onChange={(e) => updateAnswer(q.id, e.target.value)} placeholder={q.placeholder}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #2a2a4a", background: "#1a1a2e", color: "#e0e0f0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "#e94560")} onBlur={(e) => (e.target.style.borderColor = "#2a2a4a")} />
              )}
              {q.type === "textarea" && (
                <textarea value={answers[q.id] || ""} onChange={(e) => updateAnswer(q.id, e.target.value)} placeholder={q.placeholder} rows={4}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #2a2a4a", background: "#1a1a2e", color: "#e0e0f0", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "#e94560")} onBlur={(e) => (e.target.style.borderColor = "#2a2a4a")} />
              )}
              {q.type === "select" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {q.options.map((opt) => (
                    <button key={opt} onClick={() => updateAnswer(q.id, opt)}
                      style={{ padding: "10px 18px", borderRadius: 10, border: answers[q.id] === opt ? "2px solid #e94560" : "2px solid #2a2a4a", background: answers[q.id] === opt ? "rgba(233,69,96,0.15)" : "rgba(255,255,255,0.03)", color: answers[q.id] === opt ? "#ff6b6b" : "#8888aa", cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: answers[q.id] === opt ? 600 : 400, transition: "all 0.2s" }}>
                      {answers[q.id] === opt ? "● " : "○ "}{opt}
                    </button>
                  ))}
                </div>
              )}
              {q.type === "multi" && <MultiSelect options={q.options} selected={answers[q.id] || []} onChange={(v) => updateAnswer(q.id, v)} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(15,15,35,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid #2a2a4a", padding: "16px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setActiveSection(Math.max(0, activeSection - 1))} disabled={activeSection === 0}
            style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: activeSection === 0 ? "#1a1a2e" : "#2a2a4a", color: activeSection === 0 ? "#555" : "#e0e0f0", cursor: activeSection === 0 ? "default" : "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>← 이전</button>
          <button onClick={() => setShowExport(true)}
            style={{ padding: "12px 20px", borderRadius: 12, border: "2px solid #3498db", background: "rgba(52,152,219,0.1)", color: "#3498db", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
            📋 결과 보기 ({Math.round((answeredCount / totalQuestions) * 100)}%)
          </button>
          {activeSection < SECTIONS.length - 1 ? (
            <button onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))}
              style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #e94560, #c23152)", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>다음 →</button>
          ) : (
            <button onClick={() => setShowExport(true)}
              style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #2ecc71, #27ae60)", color: "white", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit" }}>✓ 완료! 결과 보기</button>
          )}
        </div>
      </div>
    </div>
  );
}
