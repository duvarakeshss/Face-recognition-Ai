from app import app  # assuming app = FastAPI()

# This is the ASGI handler Vercel expects
handler = app
