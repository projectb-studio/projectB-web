-- ============================================
-- 테스트 상품: VICTO LEATHER JUMPER
-- 제거: DELETE FROM pb_products WHERE slug = 'victo-leather-jumper';
-- ============================================

INSERT INTO pb_products (
  id, name, slug, price, sale_price, tag, badge,
  description, details, shipping, care,
  is_published, sort_order, detail_blocks
) VALUES (
  gen_random_uuid(),
  'VICTO LEATHER JUMPER',
  'victo-leather-jumper',
  279000,
  NULL,
  'handmade',
  'NEW',
  '캐주얼한 블루종 실루엣에 고급스러운 레더 소재를 더한 점퍼. 플랩 포켓과 스냅 버튼 디테일로 클래식하면서도 모던한 무드를 연출합니다.',
  'TOTAL LENGTH: 53cm' || chr(10) || 'SHOULDER: 52cm' || chr(10) || 'CHEST: 118cm' || chr(10) || 'ARM HOLE: 56cm' || chr(10) || 'SLEEVE: 55cm' || chr(10) || chr(10) || 'MODEL: 168cm / FREE SIZE 착용',
  '무료 배송 (₩50,000 이상)' || chr(10) || '일반 배송: 2~3일 소요' || chr(10) || '도서산간: 3~5일 소요',
  '드라이클리닝 권장' || chr(10) || '물세탁 시 변형 주의' || chr(10) || '직사광선 장시간 노출 주의' || chr(10) || '이염 주의 (밝은색 의류와 분리 보관)',
  true,
  0,
  '[
    {
      "id": "b0000001-0000-4000-8000-000000000001",
      "type": "banner",
      "data": {
        "text": "EVERY STITCH OF CRAFT",
        "bgColor": "black",
        "align": "center"
      }
    },
    {
      "id": "b0000002-0000-4000-8000-000000000002",
      "type": "richtext",
      "data": {
        "html": "<h2>VICTO LEATHER JUMPER</h2><p>캐주얼한 블루종 실루엣에 레더 소재를 더한 점퍼입니다. 플랩 포켓과 스냅 버튼 디테일이 클래식하면서도 모던한 무드를 연출합니다. 오버사이즈 핏으로 다양한 이너와 레이어링하기 좋으며, 시즌 내내 활용도 높은 아이템입니다.</p>"
      }
    },
    {
      "id": "b0000003-0000-4000-8000-000000000003",
      "type": "richtext",
      "data": {
        "html": "<h3>DETAIL</h3><p>· 클래식 블루종 실루엣<br>· 플랩 포켓 + 스냅 버튼 디테일<br>· 허리 밴딩으로 깔끔한 실루엣<br>· 소매 스냅 버튼 조절 가능<br>· 오버사이즈 핏 — FREE SIZE</p>"
      }
    },
    {
      "id": "b0000004-0000-4000-8000-000000000004",
      "type": "spec",
      "data": {
        "title": "SIZE GUIDE",
        "rows": [
          {"label": "총장", "value": "53cm"},
          {"label": "어깨", "value": "52cm"},
          {"label": "가슴", "value": "118cm"},
          {"label": "암홀", "value": "56cm"},
          {"label": "소매", "value": "55cm"},
          {"label": "모델", "value": "168cm / FREE SIZE 착용"}
        ]
      }
    },
    {
      "id": "b0000005-0000-4000-8000-000000000005",
      "type": "spec",
      "data": {
        "title": "FABRIC & COMPOSITION",
        "rows": [
          {"label": "겉감", "value": "POLYURETHANE 100%"},
          {"label": "안감", "value": "POLYESTER 100%"},
          {"label": "원산지", "value": "KOREA"}
        ]
      }
    },
    {
      "id": "b0000006-0000-4000-8000-000000000006",
      "type": "care",
      "data": {
        "items": [
          {"icon": "wash", "text": "드라이클리닝 권장"},
          {"icon": "wash", "text": "물세탁 시 변형 및 탈색 주의"},
          {"icon": "iron", "text": "다림질 시 천을 덧대어 사용"},
          {"icon": "bleach", "text": "표백제 사용 금지"},
          {"icon": "custom", "text": "밝은색 의류와 함께 보관 시 이염 주의"}
        ]
      }
    },
    {
      "id": "b0000007-0000-4000-8000-000000000007",
      "type": "banner",
      "data": {
        "text": "HANDCRAFTED WITH CARE — PROJECT B",
        "bgColor": "offwhite",
        "align": "center"
      }
    }
  ]'::jsonb
);

-- 확인
SELECT id, name, slug FROM pb_products WHERE slug = 'victo-leather-jumper';
