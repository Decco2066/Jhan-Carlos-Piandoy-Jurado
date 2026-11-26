from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import CargoUsuario, EstadoUsuario, Usuario
from backend.schemas import UsuarioCreate, UsuarioOut, UsuarioUpdate
from backend.security import hash_password

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

UNIQUE_FIELDS = ("identificacion", "email", "nombre_usuario")
REQUIRED_UPDATE_FIELDS = (
    "identificacion",
    "nombre",
    "apellido",
    "cargo",
    "nombre_usuario",
    "estado",
)


def _get_usuario_or_404(db: Session, usuario_id: int) -> Usuario:
    usuario = db.get(Usuario, usuario_id)
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )
    return usuario


def _check_unique_fields(
    db: Session,
    values: dict[str, Any],
    exclude_id: int | None = None,
) -> None:
    for field in UNIQUE_FIELDS:
        value = values.get(field)
        if value is None:
            continue

        statement = select(Usuario.id).where(getattr(Usuario, field) == value)
        if exclude_id is not None:
            statement = statement.where(Usuario.id != exclude_id)

        if db.scalar(statement) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un usuario con ese valor de {field}",
            )


def _commit_or_conflict(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Identificacion, email o nombre de usuario ya registrado",
        ) from exc


@router.get("", response_model=list[UsuarioOut])
def listar_usuarios(db: Session = Depends(get_db)) -> list[Usuario]:
    return list(db.scalars(select(Usuario).order_by(Usuario.id)).all())


@router.get("/{usuario_id}", response_model=UsuarioOut)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)) -> Usuario:
    return _get_usuario_or_404(db, usuario_id)


@router.post("", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def crear_usuario(payload: UsuarioCreate, db: Session = Depends(get_db)) -> Usuario:
    values = payload.model_dump()
    _check_unique_fields(db, values)

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
    _commit_or_conflict(db)
    db.refresh(usuario)
    return usuario


@router.put("/{usuario_id}", response_model=UsuarioOut)
def actualizar_usuario(
    usuario_id: int,
    payload: UsuarioUpdate,
    db: Session = Depends(get_db),
) -> Usuario:
    usuario = _get_usuario_or_404(db, usuario_id)
    values = payload.model_dump(exclude_unset=True)

    for field in REQUIRED_UPDATE_FIELDS:
        if field in values and values[field] is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El campo {field} no puede ser nulo",
            )

    _check_unique_fields(db, values, exclude_id=usuario_id)

    for field, value in values.items():
        if field == "contrasena":
            if value is not None:
                usuario.contrasena = hash_password(value)
        elif field == "cargo" and value is not None:
            usuario.cargo = CargoUsuario(value)
        elif field == "estado" and value is not None:
            usuario.estado = EstadoUsuario(value)
        else:
            setattr(usuario, field, value)

    _commit_or_conflict(db)
    db.refresh(usuario)
    return usuario


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)) -> Response:
    usuario = _get_usuario_or_404(db, usuario_id)
    db.delete(usuario)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{usuario_id}/estado", response_model=UsuarioOut)
def alternar_estado(usuario_id: int, db: Session = Depends(get_db)) -> Usuario:
    usuario = _get_usuario_or_404(db, usuario_id)
    usuario.estado = (
        EstadoUsuario.DESACTIVADO
        if usuario.estado == EstadoUsuario.ACTIVADO
        else EstadoUsuario.ACTIVADO
    )
    db.commit()
    db.refresh(usuario)
    return usuario
