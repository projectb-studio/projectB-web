export interface Review {
  id: string;
  productName: string;
  productSlug: string;
  author: string;
  rating: number;
  content: string;
  imageUrl: string;
  date: string;
}

const DUMMY_REVIEWS: Review[] = [
  {
    id: "1",
    productName: "Ceramic vase — matte black",
    productSlug: "ceramic-vase-matte-black",
    author: "김**",
    rating: 5,
    content: "질감이 정말 좋아요. 사진보다 실물이 훨씬 예쁩니다. 거실에 놓으니 분위기가 확 바뀌었어요.",
    imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=400&h=400&fit=crop&crop=center",
    date: "2026-03-25",
  },
  {
    id: "2",
    productName: "Wool felt coaster (4p)",
    productSlug: "wool-felt-coaster-4p",
    author: "이**",
    rating: 5,
    content: "선물용으로 구매했는데 포장도 정성스럽고 받으신 분이 정말 좋아하셨어요!",
    imageUrl: "https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=400&h=400&fit=crop&crop=center",
    date: "2026-03-22",
  },
  {
    id: "3",
    productName: "Brass candle holder set",
    productSlug: "brass-candle-holder-set",
    author: "박**",
    rating: 4,
    content: "디자인이 미니멀하면서도 고급스러워요. 황동 특유의 색감이 매력적입니다.",
    imageUrl: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=400&h=400&fit=crop&crop=center",
    date: "2026-03-18",
  },
  {
    id: "4",
    productName: "Linen table runner — ivory",
    productSlug: "linen-table-runner-ivory",
    author: "최**",
    rating: 5,
    content: "린넨 질감이 고급스럽고 세탁해도 형태가 잘 유지됩니다. 재구매 의사 있어요.",
    imageUrl: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=400&h=400&fit=crop&crop=center",
    date: "2026-03-15",
  },
  {
    id: "5",
    productName: "Stone incense holder",
    productSlug: "stone-incense-holder",
    author: "정**",
    rating: 5,
    content: "돌의 무게감이 좋고 인센스를 꽂았을 때 안정감이 있어요. 명상할 때 사용하기 좋습니다.",
    imageUrl: "https://images.unsplash.com/photo-1600056809880-a46e89b2e704?w=400&h=400&fit=crop&crop=center",
    date: "2026-03-12",
  },
  {
    id: "6",
    productName: "Oak wood tray — natural",
    productSlug: "oak-wood-tray-natural",
    author: "한**",
    rating: 4,
    content: "나무결이 아름답고 실용적이에요. 아침 식사 트레이로 매일 사용 중입니다.",
    imageUrl: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=400&h=400&fit=crop&crop=center",
    date: "2026-03-08",
  },
  {
    id: "7",
    productName: "Hand-blown glass cup",
    productSlug: "hand-blown-glass-cup",
    author: "윤**",
    rating: 5,
    content: "하나하나 다른 모양이 매력적이에요. 차를 마실 때 기분이 좋아집니다.",
    imageUrl: "https://images.unsplash.com/photo-1514651029227-c09ada3d8a33?w=400&h=400&fit=crop&crop=center",
    date: "2026-03-05",
  },
  {
    id: "8",
    productName: "Cotton blend napkin set",
    productSlug: "cotton-blend-napkin-set",
    author: "강**",
    rating: 4,
    content: "세일 가격에 구매해서 더 만족스럽습니다. 촉감이 부드럽고 흡수력도 좋아요.",
    imageUrl: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&h=400&fit=crop&crop=center",
    date: "2026-03-01",
  },
];

export async function getReviews(): Promise<Review[]> {
  return DUMMY_REVIEWS;
}
