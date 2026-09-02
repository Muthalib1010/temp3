import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import engine, Base
from seed import seed_database
from routers import (
    auth, farmers, mandis, crops, slots, bookings, payments, notifications, admin
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed demo data
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield
    # Shutdown logic if any

app = FastAPI(
    title="Farmer Slot Booking System - National Agricultural E-Procurement Portal",
    description="Smart India Hackathon (SIH Problem Statement 260321): Complete API for farmer slot reservations, live queue tracking, procurement milestone processing, and DBT payment clearance.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS for mobile apps and web frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )

# Include Routers
app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(mandis.router)
app.include_router(crops.router)
app.include_router(slots.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(notifications.router)
app.include_router(admin.router)

@app.get("/", tags=["Root"])
def root_info():
    return {
        "portal": "Farmer Slot Booking System (SIH Problem Statement 260321)",
        "version": "2.0.0",
        "status": "Online & Operational",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "auth": "/api/auth",
            "farmers": "/api/farmers",
            "mandis": "/api/mandis",
            "crops": "/api/crops",
            "slots": "/api/slots",
            "bookings": "/api/bookings",
            "payments": "/api/payments",
            "notifications": "/api/notifications",
            "admin": "/api/admin"
        }
    }

@app.get("/api/health", tags=["Root"])
def health_check():
    return {"status": "healthy", "service": "farmer-slot-booking-backend"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
