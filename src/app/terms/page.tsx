import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "프로젝트비(PROJECT B) 이용약관",
};

export default function TermsPage() {
  return (
    <div className="bg-[var(--pb-snow)] py-16 sm:py-24">
      <div className="max-w-[720px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="heading-display text-2xl sm:text-3xl text-[var(--pb-jet-black)] mb-4">
            TERMS OF SERVICE
          </h1>
          <p className="text-sm text-[var(--pb-gray)]">이용약관</p>
          <p className="text-xs text-[var(--pb-silver)] mt-2">
            최종 수정일: 2026년 4월 1일
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 text-sm leading-relaxed text-[var(--pb-charcoal)]">
          <Section title="제1조 (목적)">
            <p>
              이 약관은 <Strong>프로젝트비(PROJECT B)</Strong> (이하
              &quot;회사&quot;)이 운영하는 온라인 쇼핑몰 (이하
              &quot;몰&quot;)에서 제공하는 인터넷 관련 서비스(이하
              &quot;서비스&quot;)를 이용함에 있어 회사와 이용자의 권리·의무 및
              책임사항을 규정함을 목적으로 합니다.
            </p>
          </Section>

          <Section title="제2조 (정의)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <Strong>&quot;몰&quot;</Strong>이란 회사가 재화 또는 용역(이하
                &quot;재화 등&quot;)을 이용자에게 제공하기 위하여 컴퓨터 등
                정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한
                가상의 영업장을 말합니다.
              </li>
              <li>
                <Strong>&quot;이용자&quot;</Strong>란 몰에 접속하여 이 약관에
                따라 몰이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
              </li>
              <li>
                <Strong>&quot;회원&quot;</Strong>이란 몰에 회원등록을 한
                자로서, 계속적으로 몰이 제공하는 서비스를 이용할 수 있는 자를
                말합니다.
              </li>
              <li>
                <Strong>&quot;비회원&quot;</Strong>이란 회원에 가입하지 않고
                몰이 제공하는 서비스를 이용하는 자를 말합니다.
              </li>
            </ol>
          </Section>

          <Section title="제3조 (약관 등의 명시와 설명 및 개정)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                회사는 이 약관의 내용과 상호 및 대표자 성명, 영업소 소재지
                주소, 전화번호, 이메일주소, 사업자등록번호, 통신판매업
                신고번호, 개인정보 보호책임자 등을 이용자가 쉽게 알 수 있도록
                몰의 초기 서비스화면에 게시합니다.
              </li>
              <li>
                회사는 관련 법을 위배하지 않는 범위에서 이 약관을 개정할 수
                있습니다.
              </li>
              <li>
                회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여
                현행 약관과 함께 몰의 초기화면에 그 적용일자 7일 이전부터
                적용일자 전일까지 공지합니다. 다만, 이용자에게 불리하게
                약관내용을 변경하는 경우에는 최소한 30일 이상의 사전
                유예기간을 두고 공지합니다.
              </li>
            </ol>
          </Section>

          <Section title="제4조 (서비스의 제공 및 변경)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                회사는 다음과 같은 업무를 수행합니다.
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>
                    재화 또는 용역에 대한 정보 제공 및 구매계약의 체결
                  </li>
                  <li>구매계약이 체결된 재화 또는 용역의 배송</li>
                  <li>기타 회사가 정하는 업무</li>
                </ul>
              </li>
              <li>
                회사는 재화 또는 용역의 품절 또는 기술적 사양의 변경 등의
                경우에는 장차 체결되는 계약에 의해 제공할 재화 또는 용역의
                내용을 변경할 수 있습니다.
              </li>
            </ol>
          </Section>

          <Section title="제5조 (서비스의 중단)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                회사는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신의
                두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로
                중단할 수 있습니다.
              </li>
              <li>
                제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여
                이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사가
                고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.
              </li>
            </ol>
          </Section>

          <Section title="제6조 (회원가입)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                이용자는 몰이 정한 가입 양식에 따라 회원정보를 기입한 후 이
                약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
              </li>
              <li>
                몰은 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음
                각 호에 해당하지 않는 한 회원으로 등록합니다.
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                  <li>
                    기타 회원으로 등록하는 것이 기술상 현저히 지장이 있다고
                    판단되는 경우
                  </li>
                </ul>
              </li>
              <li>
                회원가입의 성립 시기는 몰의 승낙이 회원에게 도달한 시점으로
                합니다.
              </li>
              <li>
                소셜 로그인(카카오, 네이버, 구글, 애플)을 통한 가입도 본
                약관의 동의로 간주합니다.
              </li>
            </ol>
          </Section>

          <Section title="제7조 (회원 탈퇴 및 자격 상실 등)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                회원은 몰에 언제든지 탈퇴를 요청할 수 있으며 몰은 즉시
                회원탈퇴를 처리합니다.
              </li>
              <li>
                회원이 다음 각 호의 사유에 해당하는 경우, 몰은 회원자격을
                제한 및 정지시킬 수 있습니다.
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                  <li>
                    몰을 이용하여 구입한 재화 등의 대금을 기일에 지급하지
                    않는 경우
                  </li>
                  <li>
                    다른 사람의 몰 이용을 방해하거나 그 정보를 도용하는 경우
                  </li>
                  <li>
                    몰을 이용하여 법령 또는 이 약관이 금지하거나 공서양속에
                    반하는 행위를 하는 경우
                  </li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제8조 (회원에 대한 통지)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                몰이 회원에 대한 통지를 하는 경우, 회원이 몰과 미리 약정하여
                지정한 이메일주소로 할 수 있습니다.
              </li>
              <li>
                몰은 불특정다수 회원에 대한 통지의 경우 1주일 이상 몰
                게시판에 게시함으로써 개별 통지에 갈음할 수 있습니다.
              </li>
            </ol>
          </Section>

          <Section title="제9조 (구매신청)">
            <p className="mb-2">
              몰 이용자는 몰 상에서 다음 또는 이와 유사한 방법에 의하여
              구매를 신청합니다.
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>재화 등의 검색 및 선택</li>
              <li>
                받는 사람의 성명, 주소, 전화번호, 이메일주소 등의 입력
              </li>
              <li>
                약관내용, 청약철회권이 제한되는 서비스, 배송료 등의 비용부담에
                관한 내용 확인
              </li>
              <li>이 약관에 동의하고 위 내용을 확인하거나 거부하는 표시</li>
              <li>
                재화 등의 구매신청 및 이에 관한 확인 또는 몰의 확인에 대한
                동의
              </li>
              <li>결제방법의 선택</li>
            </ol>
          </Section>

          <Section title="제10조 (계약의 성립)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                몰은 구매신청에 대하여 다음 각 호에 해당하면 승낙하지 않을 수
                있습니다.
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>신청 내용에 허위, 기재누락, 오기가 있는 경우</li>
                  <li>
                    기타 구매신청에 승낙하는 것이 기술상 현저히 지장이 있다고
                    판단하는 경우
                  </li>
                </ul>
              </li>
              <li>
                몰의 승낙이 이용자에게 수신확인 통지 형태로 도달한 시점에
                계약이 성립한 것으로 봅니다.
              </li>
            </ol>
          </Section>

          <Section title="제11조 (결제방법)">
            <p className="mb-2">
              몰에서 구매한 재화 또는 용역에 대한 대금 지급 방법은 다음 각
              호의 방법 중 가용한 방법으로 할 수 있습니다.
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>신용카드 결제</li>
              <li>무통장 입금</li>
              <li>카카오페이</li>
              <li>네이버페이</li>
              <li>토스페이</li>
              <li>휴대폰 결제</li>
              <li>포인트/적립금 결제</li>
              <li>기타 회사가 추가 지정하는 결제 수단</li>
            </ol>
          </Section>

          <Section title="제12조 (배송)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                몰은 이용자가 구매한 재화에 대해 배송수단, 수단별 배송비용
                부담자, 수단별 배송기간 등을 명시합니다.
              </li>
              <li>
                배송 기간은 결제 완료 후 영업일 기준{" "}
                <Strong>2~5일</Strong> 이내이며, 제작 상품의 경우 별도
                안내합니다.
              </li>
              <li>
                <Strong>무료 배송 기준:</Strong> 주문 금액{" "}
                <Strong>50,000원 이상</Strong> 시 무료 배송
              </li>
              <li>도서·산간 지역은 추가 배송비가 발생할 수 있습니다.</li>
              <li>해외 배송은 별도 문의를 통해 진행합니다.</li>
            </ol>
          </Section>

          <Section title="제13조 (환급)">
            <p>
              몰은 이용자가 구매신청한 재화 등이 품절 등의 사유로 인도 또는
              제공을 할 수 없을 때에는 지체 없이 그 사유를 이용자에게
              통지하고, 사전에 재화 등의 대금을 받은 경우에는 대금을 받은
              날부터 <Strong>3영업일 이내</Strong>에 환급하거나 환급에 필요한
              조치를 취합니다.
            </p>
          </Section>

          <Section title="제14조 (청약철회 등)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                몰과 재화 등의 구매에 관한 계약을 체결한 이용자는
                수신확인의 통지를 받은 날부터{" "}
                <Strong>7일 이내</Strong>에 청약의 철회를 할 수 있습니다.
              </li>
              <li>
                이용자는 재화 등을 배송받은 경우 다음 각 호의 경우에는 반품
                및 교환을 할 수 없습니다.
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>
                    이용자에게 책임 있는 사유로 재화 등이 멸실 또는 훼손된
                    경우 (다만, 내용 확인을 위한 포장 훼손은 가능)
                  </li>
                  <li>
                    이용자의 사용 또는 일부 소비에 의하여 재화 등의 가치가
                    현저히 감소한 경우
                  </li>
                  <li>
                    시간의 경과에 의하여 재판매가 곤란할 정도로 가치가
                    감소한 경우
                  </li>
                  <li>원본 포장을 훼손한 경우 (복제 가능 재화)</li>
                  <li>
                    <Strong>주문제작(핸드메이드) 상품</Strong>의 경우 제작이
                    시작된 이후에는 청약철회가 제한될 수 있습니다.
                  </li>
                </ul>
              </li>
              <li>
                제2항에도 불구하고, 재화 등의 내용이 표시·광고 내용과 다르거나
                계약내용과 다르게 이행된 때에는 당해 재화 등을 공급받은
                날부터 3월 이내, 그 사실을 안 날 또는 알 수 있었던 날부터
                30일 이내에 청약철회 등을 할 수 있습니다.
              </li>
            </ol>
          </Section>

          <Section title="제15조 (청약철회 등의 효과)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                회사는 이용자로부터 재화 등을 반환받은 경우{" "}
                <Strong>3영업일 이내</Strong>에 이미 지급받은 대금을
                환급합니다.
              </li>
              <li>
                환급 지연 시 지연기간에 대하여 법령에서 정하는 지연이자를
                지급합니다.
              </li>
              <li>
                반환 비용은 이용자가 부담합니다. 다만, 표시·광고와 다르거나
                계약과 다르게 이행된 경우 회사가 부담합니다.
              </li>
            </ol>
          </Section>

          <Section title="제16조 (적립금 및 쿠폰)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                회사는 회원에게 구매 금액의 일정 비율을 적립금(포인트)으로
                지급할 수 있습니다.
              </li>
              <li>
                적립금은 상품 구매 시 결제 수단으로 사용할 수 있으며, 현금으로
                환급되지 않습니다.
              </li>
              <li>
                쿠폰은 회사가 지정한 조건과 유효기간 내에서만 사용할 수
                있습니다.
              </li>
              <li>
                회원 탈퇴 시 미사용 적립금 및 쿠폰은 소멸됩니다.
              </li>
            </ol>
          </Section>

          <Section title="제17조 (개인정보보호)">
            <p>
              회사는 이용자의 개인정보 수집 시 서비스 제공을 위하여 필요한
              범위에서 최소한의 개인정보를 수집합니다. 자세한 사항은 회사의{" "}
              <a
                href="/privacy"
                className="underline text-[var(--pb-jet-black)] hover:text-[#B5704F] transition-colors"
              >
                개인정보처리방침
              </a>
              을 따릅니다.
            </p>
          </Section>

          <Section title="제18조 (회사의 의무)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                회사는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를
                하지 않으며 지속적이고, 안정적으로 재화 및 용역을 제공하는데
                최선을 다하여야 합니다.
              </li>
              <li>
                회사는 이용자가 안전하게 인터넷 서비스를 이용할 수 있도록
                이용자의 개인정보 보호를 위한 보안 시스템을 갖추어야 합니다.
              </li>
            </ol>
          </Section>

          <Section title="제19조 (이용자의 의무)">
            <p className="mb-2">
              이용자는 다음 행위를 하여서는 안 됩니다.
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>신청 또는 변경 시 허위 내용의 등록</li>
              <li>타인의 정보 도용</li>
              <li>몰에 게시된 정보의 변경</li>
              <li>
                몰이 정한 정보 이외의 정보(컴퓨터 프로그램 등)의 송신 또는
                게시
              </li>
              <li>몰 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>
                몰 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위
              </li>
              <li>
                외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는
                정보를 공개 또는 게시하는 행위
              </li>
            </ol>
          </Section>

          <Section title="제20조 (면책 조항)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를
                제공할 수 없는 경우에는 서비스 제공에 관한 책임이
                면제됩니다.
              </li>
              <li>
                회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는
                책임을 지지 않습니다.
              </li>
              <li>
                회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에
                대하여 책임을 지지 않습니다.
              </li>
            </ol>
          </Section>

          <Section title="제21조 (분쟁해결)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그
                피해를 보상처리하기 위하여 피해보상처리기구를
                설치·운영합니다.
              </li>
              <li>
                회사는 이용자로부터 제출되는 불만사항 및 의견은 우선적으로
                처리합니다. 다만, 신속한 처리가 곤란한 경우에는 이용자에게 그
                사유와 처리일정을 즉시 통보해 드립니다.
              </li>
            </ol>
          </Section>

          <Section title="제22조 (재판권 및 준거법)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소
                당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를
                관할하는 지방법원의 전속관할로 합니다.
              </li>
              <li>
                회사와 이용자 간에 제기된 전자상거래 소송에는 대한민국 법을
                적용합니다.
              </li>
            </ol>
          </Section>

          {/* Business info */}
          <div className="pt-8 border-t border-[var(--pb-border)]">
            <h2 className="heading-section text-sm text-[var(--pb-jet-black)] mb-6">
              BUSINESS INFORMATION
            </h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-sm">
              <dt className="text-[var(--pb-gray)]">상호</dt>
              <dd>프로젝트비(PROJECT B)</dd>
              <dt className="text-[var(--pb-gray)]">대표자</dt>
              <dd>이기복</dd>
              <dt className="text-[var(--pb-gray)]">사업자등록번호</dt>
              <dd>611-43-00831</dd>
              <dt className="text-[var(--pb-gray)]">주소</dt>
              <dd>서울특별시 중구 다산로 240. 1층 102호(신당동, 동원빌딩)</dd>
              <dt className="text-[var(--pb-gray)]">전화번호</dt>
              <dd>010-2122-0691</dd>
              <dt className="text-[var(--pb-gray)]">이메일</dt>
              <dd>project_b_sindang@naver.com</dd>
            </dl>
          </div>
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
