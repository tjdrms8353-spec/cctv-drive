// FontAwesome에 없는 브랜드 아이콘 대체 매핑
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import { faComment } from '@fortawesome/free-solid-svg-icons'

// 네이버 전용 아이콘은 무료 세트에 없으므로 'N' 글자 대체용으로 circle 사용 대신
// FontAwesome 기본 문자 아이콘 대체: 빈 아이콘 객체 대신 comment 재사용 방지를 위해
// 간단한 커스텀 아이콘 정의 (svg path 'N')
export const faN = {
  prefix: 'fas',
  iconName: 'n',
  icon: [16, 16, [], 'f0n', 'M2 15V1h2.6l6.8 10.9V1H14v14h-2.6L4.6 4.1V15H2z'],
}

export { faGoogle, faComment }
