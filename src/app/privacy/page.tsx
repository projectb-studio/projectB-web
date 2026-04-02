import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "프로젝트비(PROJECT B) 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="bg-[var(--pb-snow)] py-16 sm:py-24">
      <div className="max-w-[720px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="heading-display text-2xl sm:text-3xl text-[var(--pb-jet-black)] mb-4">
            PRIVACY POLICY
          </h1>
          <p className="text-sm text-[var(--pb-gray)]">개인정보처리방침</p>
          <p className="text-xs text-[var(--pb-silver)] mt-2">
            최종 수정일: 2026년 4월 1일
          </p>
        </div>

        {/* Intro */}
        <div className="space-y-12 text-sm leading-relaxed text-[var(--pb-charcoal)]">
          <p>
            <Strong>프로젝트비(PROJECT B)</Strong> (이하
            &quot;회사&quot;)은(는) 「개인정보 보호법」 제30조에 따라
            정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고
            원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보
            처리방침을 수립·공개합니다.
          </p>

          <Section title="제1조 (개인정보의 처리 목적)">
            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <Strong>회원가입 및 관리</Strong>
                <br />
                회원제 서비스 이용에 따른 본인확인, 개인식별, 가입의사 확인,
                연령확인, 불만처리 등 민원처리, 고지·통지사항 전달
              </li>
              <li>
                <Strong>재화 또는 서비스 제공</Strong>
                <br />
                물품배송, 서비스 제공, 계약서·청구서 발송, 콘텐츠 제공,
                맞춤서비스 제공, 본인인증, 결제 및 정산
              </li>
              <li>
                <Strong>마케팅 및 광고 활용</Strong>
                <br />
                신규 서비스 개발 및 맞춤 서비스 제공, 이벤트·광고성 정보 제공
                및 참여기회 제공, 서비스 이용 통계
              </li>
              <li>
                <Strong>고충처리</Strong>
                <br />
                민원인의 신원 확인, 민원사항 확인, 사실조사를 위한
                연락·통지, 처리결과 통보
              </li>
            </ol>
          </Section>

          <Section title="제2조 (수집하는 개인정보의 항목)">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--pb-jet-black)] mb-3">
                  1. 회원가입 시
                </h3>
                <Table
                  rows={[
                    ["필수", "이메일, 비밀번호, 이름"],
                    ["선택", "전화번호, 생년월일, 성별"],
                  ]}
                />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--pb-jet-black)] mb-3">
                  2. 소셜 로그인 시 (카카오, 네이버, 구글, 애플)
                </h3>
                <Table
                  rows={[
                    ["필수", "소셜 계정 고유 식별자, 이메일, 이름(닉네임)"],
                    ["선택", "프로필 이미지"],
                  ]}
                />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--pb-jet-black)] mb-3">
                  3. 상품 구매(주문) 시
                </h3>
                <Table
                  rows={[
                    ["필수", "수령인 이름, 배송지 주소, 전화번호, 결제 정보"],
                    ["선택", "배송 메모"],
                  ]}
                />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--pb-jet-black)] mb-3">
                  4. 비회원 주문 시
                </h3>
                <Table
                  rows={[
                    [
                      "필수",
                      "주문자 이름, 이메일, 전화번호, 배송지 주소, 결제 정보",
                    ],
                  ]}
                />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--pb-jet-black)] mb-3">
                  5. 자동 수집 정보
                </h3>
                <p>
                  IP 주소, 쿠키, 서비스 이용 기록, 접속 로그, 방문 일시,
                  브라우저 종류, 기기 정보
                </p>
              </div>
            </div>
          </Section>

          <Section title="제3조 (개인정보의 처리 및 보유 기간)">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--pb-jet-black)] mb-3">
                  회사 내부 방침
                </h3>
                <p>회원 정보: 회원 탈퇴 시까지</p>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--pb-jet-black)] mb-3">
                  관련 법령에 의한 보유
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--pb-border)]">
                        <th className="text-left py-2 pr-4 font-semibold text-[var(--pb-jet-black)]">
                          보유 정보
                        </th>
                        <th className="text-left py-2 pr-4 font-semibold text-[var(--pb-jet-black)]">
                          기간
                        </th>
                        <th className="text-left py-2 font-semibold text-[var(--pb-jet-black)]">
                          근거
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--pb-off-white)]">
                      <tr>
                        <td className="py-2 pr-4">계약/청약철회 기록</td>
                        <td className="py-2 pr-4">5년</td>
                        <td className="py-2">전자상거래법</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4">대금결제/재화공급 기록</td>
                        <td className="py-2 pr-4">5년</td>
                        <td className="py-2">전자상거래법</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4">소비자 불만/분쟁처리 기록</td>
                        <td className="py-2 pr-4">3년</td>
                        <td className="py-2">전자상거래법</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4">표시·광고 기록</td>
                        <td className="py-2 pr-4">6개월</td>
                        <td className="py-2">전자상거래법</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4">접속 로그</td>
                        <td className="py-2 pr-4">3개월</td>
                        <td className="py-2">통신비밀보호법</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Section>

          <Section title="제4조 (개인정보의 제3자 제공)">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--pb-border)]">
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--pb-jet-black)]">
                      제공받는 자
                    </th>
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--pb-jet-black)]">
                      목적
                    </th>
                    <th className="text-left py-2 font-semibold text-[var(--pb-jet-black)]">
                      항목
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--pb-off-white)]">
                  <tr>
                    <td className="py-2 pr-4">토스페이먼츠(주)</td>
                    <td className="py-2 pr-4">결제 처리</td>
                    <td className="py-2">주문정보, 결제정보</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">택배사</td>
                    <td className="py-2 pr-4">상품 배송</td>
                    <td className="py-2">수령인명, 주소, 전화번호</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">카카오 (알림톡)</td>
                    <td className="py-2 pr-4">주문·배송 알림</td>
                    <td className="py-2">전화번호, 주문정보</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="제5조 (개인정보 처리의 위탁)">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--pb-border)]">
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--pb-jet-black)]">
                      위탁받는 자
                    </th>
                    <th className="text-left py-2 font-semibold text-[var(--pb-jet-black)]">
                      업무 내용
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--pb-off-white)]">
                  <tr>
                    <td className="py-2 pr-4">Vercel Inc.</td>
                    <td className="py-2">웹사이트 호스팅 및 서비스 운영</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Supabase Inc.</td>
                    <td className="py-2">
                      데이터베이스 및 회원 인증 서비스 운영
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Cloudflare Inc.</td>
                    <td className="py-2">이미지 저장 및 CDN 서비스</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">토스페이먼츠(주)</td>
                    <td className="py-2">전자결제 대행 서비스</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="제6조 (정보주체의 권리·의무 및 행사방법)">
            <p className="mb-3">
              정보주체는 회사에 대해 언제든지 다음의 권리를 행사할 수
              있습니다.
            </p>
            <ol className="list-decimal pl-5 space-y-1 mb-4">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ol>
            <div className="bg-[var(--pb-off-white)] p-4 space-y-1">
              <p>
                <Strong>이메일:</Strong> project_b_sindang@naver.com
              </p>
              <p>
                <Strong>전화:</Strong> 010-2122-0691
              </p>
              <p>
                <Strong>주소:</Strong> 서울특별시 중구 다산로 240. 1층
                102호(신당동, 동원빌딩)
              </p>
            </div>
          </Section>

          <Section title="제7조 (개인정보의 파기)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <Strong>파기 절차:</Strong> 불필요한 개인정보는
                개인정보보호책임자의 승인을 받아 파기합니다.
              </li>
              <li>
                <Strong>파기 방법:</Strong>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>
                    전자적 파일: 기록을 재생할 수 없는 기술적 방법으로 삭제
                  </li>
                  <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제8조 (개인정보의 안전성 확보 조치)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <Strong>관리적 조치:</Strong> 내부관리계획 수립·시행,
                개인정보 취급 직원 최소화
              </li>
              <li>
                <Strong>기술적 조치:</Strong> 접근 권한 관리,
                접근통제시스템, 암호화, 보안프로그램 설치
              </li>
              <li>
                <Strong>물리적 조치:</Strong> 전산실, 자료보관실 등의 접근
                통제
              </li>
            </ol>
          </Section>

          <Section title="제9조 (쿠키의 설치·운영 및 거부)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <Strong>쿠키 사용 목적:</Strong> 접속 빈도나 방문 시간 등을
                분석하여 맞춤형 서비스 제공
              </li>
              <li>
                <Strong>쿠키 설정 거부:</Strong> 웹브라우저 옵션에서 쿠키
                허용/차단 설정 가능
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>
                    Chrome: 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트
                    데이터
                  </li>
                  <li>Safari: 환경설정 → 개인정보 보호</li>
                </ul>
                <p className="mt-1 text-[var(--pb-gray)]">
                  * 쿠키 설치를 거부할 경우 서비스 이용에 어려움이 발생할 수
                  있습니다.
                </p>
              </li>
            </ol>
          </Section>

          <Section title="제10조 (개인정보 보호책임자)">
            <div className="bg-[var(--pb-off-white)] p-4">
              <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2">
                <dt className="text-[var(--pb-gray)]">성명</dt>
                <dd>김은비</dd>
                <dt className="text-[var(--pb-gray)]">직위</dt>
                <dd>개인정보 보호책임자</dd>
                <dt className="text-[var(--pb-gray)]">이메일</dt>
                <dd>project_b_sindang@naver.com</dd>
                <dt className="text-[var(--pb-gray)]">전화번호</dt>
                <dd>010-7139-7566</dd>
              </dl>
            </div>
          </Section>

          <Section title="제11조 (개인정보 열람청구)">
            <p>
              정보주체는 「개인정보 보호법」 제35조에 따른 개인정보의 열람
              청구를 아래의 부서에 할 수 있습니다.
            </p>
            <div className="mt-3 bg-[var(--pb-off-white)] p-4 space-y-1">
              <p>
                <Strong>담당:</Strong> 프로젝트비 고객지원
              </p>
              <p>
                <Strong>연락처:</Strong> 010-7139-7566
              </p>
              <p>
                <Strong>이메일:</Strong> project_b_sindang@naver.com
              </p>
            </div>
          </Section>

          <Section title="제12조 (권익침해 구제방법)">
            <p className="mb-3">
              개인정보침해로 인한 구제를 받기 위하여 다음 기관에 분쟁해결이나
              상담 등을 신청할 수 있습니다.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--pb-border)]">
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--pb-jet-black)]">
                      기관
                    </th>
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--pb-jet-black)]">
                      연락처
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--pb-off-white)]">
                  <tr>
                    <td className="py-2 pr-4">개인정보분쟁조정위원회</td>
                    <td className="py-2">(국번없이) 1833-6972</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">개인정보침해신고센터</td>
                    <td className="py-2">(국번없이) 118</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">대검찰청 사이버수사과</td>
                    <td className="py-2">(국번없이) 1301</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">경찰청 사이버수사국</td>
                    <td className="py-2">(국번없이) 182</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="제13조 (개인정보 처리방침의 변경)">
            <p>
              이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에
              따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의
              시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="heading-section text-sm text-[var(--pb-jet-black)] mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold text-[var(--pb-jet-black)]">
      {children}
    </strong>
  );
}

function Table({ rows }: { rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--pb-border)]">
            <th className="text-left py-2 pr-4 font-semibold text-[var(--pb-jet-black)] w-16">
              구분
            </th>
            <th className="text-left py-2 font-semibold text-[var(--pb-jet-black)]">
              수집 항목
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--pb-off-white)]">
          {rows.map(([label, items]) => (
            <tr key={label}>
              <td className="py-2 pr-4 text-[var(--pb-gray)]">{label}</td>
              <td className="py-2">{items}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
