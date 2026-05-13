from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import comparator, training, inference

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "PAT-IQA Backend is running."}

app.include_router(comparator.router, prefix="/api/v1/comparator", tags=["Analytical Comparator"])
app.include_router(training.router, prefix="/api/v1/training", tags=["AI Training Studio"])
app.include_router(inference.router, prefix="/api/v1/inference", tags=["Neural Diagnostics"])
