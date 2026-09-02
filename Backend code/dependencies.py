from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import Farmer
from auth import decode_access_token

security = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Farmer:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    farmer_id = payload.get("sub")
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Farmer account associated with token not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return farmer

def get_current_admin(
    current_user: Farmer = Depends(get_current_user)
) -> Farmer:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource"
        )
    return current_user
