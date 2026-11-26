"""환경 변수 로드 (.env 파일, Render는 대시보드 환경 변수 사용)"""
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")
load_dotenv()  # cwd의 .env도 허용

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-insecure-secret")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "120"))
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "admin-demo-secret")
TEST_USER_PASSWORD = os.getenv("TEST_USER_PASSWORD", "User1234!")
TEST_ADMIN_PASSWORD = os.getenv("TEST_ADMIN_PASSWORD", "Admin1234!")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,https://cctv-drive.netlify.app,https://cctv-drive.onrender.com",
    ).split(",")
    if o.strip()
]
