from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import CargoUsuario, EstadoUsuario, Usuario
from backend.schemas import AuthResponse, LoginRequest, UsuarioCreate, UsuarioOut
from backend.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

UNIQUE_FIELDS = ("identificacion", "email", "nombre_usuario")


def _raise_if_duplicate(db: Session, field: str, value: str | None) -> None:
    if value is not None and db.scalar(
        select(Usuario.id).where(getattr(Usuario, field) == value)
    ) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un usuario con ese valor de {field}",
        )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    usuario = db.scalar(
        select(Usuario).where(Usuario.identificacion == payload.identificacion)
    )
    if usuario is None or not verify_password(payload.contrasena, usuario.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña inválidos",
        )

    if usuario.estado == EstadoUsuario.DESACTIVADO:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario desactivado",
        )

    return AuthResponse(
        access_token=create_access_token(str(usuario.id)),
        usuario=usuario,
    )


@router.post(
    "/registro",
    response_model=UsuarioOut,
    status_code=status.HTTP_201_CREATED,
)
def registrar_usuario(
    payload: UsuarioCreate,
    db: Session = Depends(get_db),
) -> Usuario:
    values = payload.model_dump()
    for field in UNIQUE_FIELDS:
        _raise_if_duplicate(db, field, values[field])

    usuario = Usuario(
        identificacion=values["identificacion"],
        nombre=values["nombre"],
        apellido=values["apellido"],
        email=values["email"],
        cargo=CargoUsuario(values["cargo"]),
        telefono=values["telefono"],
        nombre_usuario=values["nombre_usuario"],
        contrasena=hash_password(values["contrasena"]),
        estado=EstadoUsuario(values["estado"]),
    )
    db.add(usuario)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Identificacion, email o nombre de usuario ya registrado",
        ) from exc

    db.refresh(usuario)
    return usuario
