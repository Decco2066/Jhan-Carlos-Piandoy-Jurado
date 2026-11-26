from enum import Enum

from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import String
from sqlalchemy.dialects.mysql import INTEGER
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class CargoUsuario(str, Enum):
    DOCTOR = "Doctor"
    ESPECIALISTA = "Especialista"
    ADMINISTRATIVO = "Administrativo"


class EstadoUsuario(str, Enum):
    ACTIVADO = "Activado"
    DESACTIVADO = "Desactivado"


def enum_values(enum_class: type[Enum]) -> list[str]:
    return [member.value for member in enum_class]


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(INTEGER(unsigned=True), primary_key=True, autoincrement=True)
    identificacion: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(String(254), unique=True, nullable=True)
    cargo: Mapped[CargoUsuario] = mapped_column(
        SQLAlchemyEnum(
            CargoUsuario,
            name="cargo",
            values_callable=enum_values,
            native_enum=True,
        ),
        nullable=False,
    )
    telefono: Mapped[str | None] = mapped_column(String(20), nullable=True)
    nombre_usuario: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    contrasena: Mapped[str] = mapped_column(String(255), nullable=False)
    estado: Mapped[EstadoUsuario] = mapped_column(
        SQLAlchemyEnum(
            EstadoUsuario,
            name="estado",
            values_callable=enum_values,
            native_enum=True,
        ),
        nullable=False,
        default=EstadoUsuario.ACTIVADO,
        server_default=EstadoUsuario.ACTIVADO.value,
    )
