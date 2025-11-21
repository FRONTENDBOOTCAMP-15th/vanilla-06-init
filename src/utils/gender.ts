export function guessGender(name: string) {
  let score = 0;
  const lower = name.toLowerCase();

  // -------------------------
  // 한국어 키워드 (가중치: 4)
  // -------------------------
  const maleKorKeywords = ['오빠', '남자', '형', '아재'];
  const femaleKorKeywords = ['언니', '누나', '여자', '이모'];

  maleKorKeywords.forEach(k => {
    if (name.includes(k)) score += 4;
  });

  femaleKorKeywords.forEach(k => {
    if (name.includes(k)) score -= 4;
  });

  // -------------------------
  // 한국어 끝글자 (가중치: 3)
  // -------------------------
  const maleKorEnd = ['준', '훈', '현', '성', '호', '진', '원', '율'];
  const femaleKorEnd = ['아', '나', '라', '리', '희', '미', '슬', '연', '영'];

  const lastChar = name[name.length - 1];
  if (maleKorEnd.includes(lastChar)) score += 3;
  if (femaleKorEnd.includes(lastChar)) score -= 3;

  // -------------------------
  // 영어 키워드 (가중치: 1)
  // -------------------------
  const maleEngKeywords = ['boy', 'king', 'man', 'mr', 'dude'];
  const femaleEngKeywords = ['girl', 'queen', 'lady', 'ms', 'miss'];

  maleEngKeywords.forEach(k => {
    if (lower.includes(k)) score += 1;
  });

  femaleEngKeywords.forEach(k => {
    if (lower.includes(k)) score -= 1;
  });

  return score >= 0 ? 'boy' : 'girl';
}
