export interface MagazinePost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
  date: string;
}

const DUMMY_POSTS: MagazinePost[] = [
  {
    id: "1",
    title: "The art of handmade ceramics",
    excerpt: "도자기 한 점이 만들어지기까지, 장인의 손끝에서 일어나는 일들을 소개합니다.",
    slug: "art-of-handmade-ceramics",
    imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop&crop=center",
    category: "Craft",
    date: "2026-03-28",
  },
  {
    id: "2",
    title: "Living with natural materials",
    excerpt: "목재, 돌, 유리 — 자연 소재가 가져다주는 공간의 변화에 대하여.",
    slug: "living-with-natural-materials",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop&crop=center",
    category: "Lifestyle",
    date: "2026-03-20",
  },
  {
    id: "3",
    title: "How to care for brass items",
    excerpt: "황동 제품을 오래도록 아름답게 유지하는 관리법을 알려드립니다.",
    slug: "how-to-care-for-brass",
    imageUrl: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&h=400&fit=crop&crop=center",
    category: "Care Guide",
    date: "2026-03-15",
  },
  {
    id: "4",
    title: "Spring table styling ideas",
    excerpt: "봄맞이 테이블 세팅, PROJECT B 소품으로 완성하는 따뜻한 식탁.",
    slug: "spring-table-styling",
    imageUrl: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=400&fit=crop&crop=center",
    category: "Styling",
    date: "2026-03-10",
  },
  {
    id: "5",
    title: "Behind the scenes: Our workshop",
    excerpt: "PROJECT B 작업실의 하루를 공개합니다. 어떤 과정을 거쳐 제품이 탄생하는지.",
    slug: "behind-the-scenes-workshop",
    imageUrl: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?w=600&h=400&fit=crop&crop=center",
    category: "Behind",
    date: "2026-03-05",
  },
  {
    id: "6",
    title: "Gift guide: Meaningful handmade presents",
    excerpt: "마음을 담은 선물, 핸드메이드 소품 추천 가이드.",
    slug: "gift-guide-handmade",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=600&h=400&fit=crop&crop=center",
    category: "Guide",
    date: "2026-02-28",
  },
];

export async function getMagazinePosts(): Promise<MagazinePost[]> {
  return DUMMY_POSTS;
}
