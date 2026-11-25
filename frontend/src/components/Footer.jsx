import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquareParking, faEnvelope, faClock } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <FontAwesomeIcon icon={faSquareParking} />
            </span>
            <span className="font-display text-lg font-bold text-brand-900">parkpick</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            AI 이동체 인지 영상 분석 기반<br />B2B 주차관제·유도 플랫폼
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Team. 홍기흥(조장) · 박미금 · 김모란 · 이오리
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-700">고객센터</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li className="flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
              B2B 도입 문의: biz@parkpick.kr
            </li>
            <li className="flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} className="text-slate-400" />
              평일 09:00 – 18:00
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-700">정책</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><a href="#" className="hover:text-brand-600">이용약관</a></li>
            <li><a href="#" className="hover:text-brand-600">개인정보처리방침</a></li>
            <li><a href="#" className="hover:text-brand-600">영상정보처리기기(CCTV) 운영·관리 방침</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-700">링크 & 데이터 출처</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>
              <a href="https://github.com/tjdrms8353-spec/cctv-drive" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-600">
                <FontAwesomeIcon icon={faGithub} /> GitHub Repository
              </a>
            </li>
            <li>
              <a href="https://tjdrms8353-spec.github.io/cctv-drive/" target="_blank" rel="noreferrer" className="hover:text-brand-600">
                프로젝트 안내 페이지
              </a>
            </li>
            <li className="pt-2 text-xs text-slate-400">AI Hub K-AI 데이터셋 · 공공데이터포털</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        © 2026 parkpick. All rights reserved.
      </div>
    </footer>
  )
}
