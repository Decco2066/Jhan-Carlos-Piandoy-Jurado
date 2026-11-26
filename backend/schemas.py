from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

Cargo = Literal["Doctor", "Especialista", "Administrativo"]
Estado = Literal["Activado", "Desactivado"]


class UsuarioCreate(BaseModel):
    identificacion: str = Field(max_length=30)
    nombre: str = Field(max_length=100)
    apellido: str = Field(max_length=100)
    email: EmailStr | None = None
    cargo: Cargo
    telefono: str | None = Field(default=None, max_length=20)
    nombre_usuario: str = Field(max_length=50)
    contrasena: str = Field(min_length=8, max_length=255)
    estado: Estado = "Activado"


class UsuarioUpdate(BaseModel):
    identificacion: str | None = Field(default=None, max_length=30)
    nombre: str | None = Field(default=None, max_length=100)
    apellido: str | None = Field(default=None, max_length=100)
    email: EmailStr | None = None
    cargo: Cargo | None = None
    telefono: str | None = Field(default=None, max_length=20)
    nombre_usuario: str | None = Field(default=None, max_length=50)
    contrasena: str | None = Field(default=None, min_length=8, max_length=255)
    estado: Estado | None = None


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    identificacion: str
    nombre: str
    apellido: str
    email: EmailStr | None
    cargo: Cargo
    telefono: str | None
    nombre_usuario: str
    estado: Estado


class LoginRequest(BaseModel):
    identificacion: str
    contrasena: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut
