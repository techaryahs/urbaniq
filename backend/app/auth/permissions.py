from fastapi import Depends, HTTPException, status

from app.models import User
from app.routers.auth import get_current_user


def require_researcher(
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "researcher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Researchers only.",
        )
    return current_user


def require_city_planner(
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "city_planner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="City Planners only.",
        )
    return current_user


def require_roles(*roles):
    def role_checker(
        current_user: User = Depends(get_current_user),
    ):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to perform this action.",
            )
        return current_user

    return role_checker