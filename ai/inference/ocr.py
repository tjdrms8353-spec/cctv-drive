"""번호판 OCR — EasyOCR/PaddleOCR 래퍼 (미설치 시 스텁).

OCR_ENGINE 환경 변수로 엔진 선택. 테스트 관리자 화면용
번호판 마스킹 함수 포함 (개인정보 보호).
"""
import os
import re

ENGINE = os.getenv("OCR_ENGINE", "easyocr")
PLATE_RE = re.compile(r"\d{2,3}[가-힣]\s?\d{4}")


def read_plate(image) -> dict | None:
    """→ {'plate': '12가 3456', 'conf': 0.97} 또는 None"""
    try:
        import easyocr  # noqa: PLC0415

        reader = easyocr.Reader(["ko", "en"], gpu=False)
        for _, text, conf in reader.readtext(image):
            m = PLATE_RE.search(text.replace(" ", ""))
            if m:
                return {"plate": m.group(0), "conf": float(conf)}
    except ImportError:
        pass
    return None


def mask_plate(plate: str) -> str:
    """12가 3456 → 12가 **** (테스트 관리자 뷰 마스킹)"""
    return re.sub(r"\d{4}$", "****", plate)
