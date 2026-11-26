import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { SortIcon, Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CargoUsuario, EstadoUsuario, Usuario, UsuarioCreate, UsuarioUpdate } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ReactiveFormsModule,
    RouterLink,
    SelectModule,
    SortIcon,
    TableModule,
    TagModule,
    ToggleSwitchModule,
  ],
  providers: [ConfirmationService],
  selector: 'app-gestion-usuarios',
  styleUrl: './gestion-usuarios.component.css',
  templateUrl: './gestion-usuarios.component.html',
})
export class GestionUsuarios implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly dialogVisible = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly usuarioEditando = signal<Usuario | null>(null);
  readonly usuarioActual = this.authService.obtenerUsuario();
  readonly tituloDialogo = computed(() =>
    this.usuarioEditando() ? 'Editar usuario' : 'Nuevo usuario',
  );
  readonly estadosPendientes = signal<ReadonlySet<number>>(new Set());

  readonly cargos: { label: string; value: CargoUsuario }[] = [
    { label: 'Doctor', value: 'Doctor' },
    { label: 'Especialista', value: 'Especialista' },
    { label: 'Administrativo', value: 'Administrativo' },
  ];

  readonly form = this.formBuilder.group({
    identificacion: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(30),
    ]),
    nombre: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(100),
    ]),
    apellido: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(100),
    ]),
    email: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(254),
    ]),
    cargo: this.formBuilder.control<CargoUsuario | null>(null, Validators.required),
    telefono: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^\d+$/),
      Validators.maxLength(20),
    ]),
    nombre_usuario: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(50),
    ]),
    contrasena: this.formBuilder.nonNullable.control('', []),
  });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(mostrarToast = false): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.usuarioService
      .listar()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (usuarios) => {
          this.usuarios.set(usuarios);
          if (mostrarToast) {
            this.notificarExito('Lista actualizada', 'Los usuarios se actualizaron.');
          }
        },
        error: (error: unknown) =>
          this.notificarError(error, 'No fue posible cargar los usuarios.'),
      });
  }

  filtrar(event: Event, tabla: Table): void {
    if (event.target instanceof HTMLInputElement) {
      tabla.filterGlobal(event.target.value, 'contains');
    }
  }

  abrirNuevoUsuario(): void {
    this.usuarioEditando.set(null);
    this.errorMessage.set(null);
    this.configurarValidacionContrasena(true);
    this.form.reset({
      identificacion: '',
      nombre: '',
      apellido: '',
      email: '',
      cargo: null,
      telefono: '',
      nombre_usuario: '',
      contrasena: '',
    });
    this.dialogVisible.set(true);
  }

  abrirEdicion(usuario: Usuario): void {
    this.usuarioEditando.set(usuario);
    this.errorMessage.set(null);
    this.configurarValidacionContrasena(false);
    this.form.reset({
      identificacion: usuario.identificacion,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email ?? '',
      cargo: usuario.cargo,
      telefono: usuario.telefono ?? '',
      nombre_usuario: usuario.nombre_usuario,
      contrasena: '',
    });
    this.dialogVisible.set(true);
  }

  cerrarDialogo(): void {
    this.cambioVisibilidadDialogo(false);
  }

  cambioVisibilidadDialogo(visible: boolean): void {
    this.dialogVisible.set(visible);
    if (!visible) {
      this.usuarioEditando.set(null);
      this.errorMessage.set(null);
    }
  }

  guardarUsuario(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    if (!values.cargo) {
      return;
    }

    const usuarioExistente = this.usuarioEditando();
    const datosUsuario = {
      identificacion: values.identificacion,
      nombre: values.nombre,
      apellido: values.apellido,
      email: values.email,
      cargo: values.cargo,
      telefono: values.telefono,
      nombre_usuario: values.nombre_usuario,
    };

    const request = usuarioExistente
      ? this.usuarioService.actualizar(usuarioExistente.id, {
          ...datosUsuario,
          ...(values.contrasena ? { contrasena: values.contrasena } : {}),
        } satisfies UsuarioUpdate)
      : this.usuarioService.crear({
          ...datosUsuario,
          contrasena: values.contrasena,
        } satisfies UsuarioCreate);

    this.saving.set(true);
    this.errorMessage.set(null);
    request
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (usuario) => {
          if (usuarioExistente) {
            this.usuarios.update((usuarios) =>
              usuarios.map((item) => (item.id === usuario.id ? usuario : item)),
            );
            this.notificarExito('Usuario actualizado', 'Los cambios se guardaron.');
          } else {
            this.usuarios.update((usuarios) => [usuario, ...usuarios]);
            this.notificarExito('Usuario creado', 'El usuario se agregó correctamente.');
          }
          this.cerrarDialogo();
        },
        error: (error: unknown) =>
          this.notificarError(error, 'No fue posible guardar el usuario.'),
      });
  }

  confirmarEliminacion(usuario: Usuario): void {
    this.confirmationService.confirm({
      header: 'Eliminar usuario',
      message: `¿Seguro que deseas eliminar a ${usuario.nombre} ${usuario.apellido}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.eliminarUsuario(usuario),
    });
  }

  alternarEstado(usuario: Usuario): void {
    this.actualizarPendientes(usuario.id, true);
    this.usuarioService
      .alternarEstado(usuario.id)
      .pipe(
        finalize(() => this.actualizarPendientes(usuario.id, false)),
      )
      .subscribe({
        next: (actualizado) => {
          this.usuarios.update((usuarios) =>
            usuarios.map((item) => (item.id === actualizado.id ? actualizado : item)),
          );
          this.notificarExito(
            'Estado actualizado',
            `${actualizado.nombre} ahora está ${actualizado.estado.toLowerCase()}.`,
          );
        },
        error: (error: unknown) =>
          this.notificarError(error, 'No fue posible cambiar el estado.'),
      });
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    void this.router.navigateByUrl('/login');
  }

  severidadEstado(estado: EstadoUsuario): 'success' | 'danger' {
    return estado === 'Activado' ? 'success' : 'danger';
  }

  private eliminarUsuario(usuario: Usuario): void {
    this.usuarioService.eliminar(usuario.id).subscribe({
      next: () => {
        this.usuarios.update((usuarios) => usuarios.filter((item) => item.id !== usuario.id));
        this.notificarExito('Usuario eliminado', 'El usuario se eliminó correctamente.');
      },
      error: (error: unknown) =>
        this.notificarError(error, 'No fue posible eliminar el usuario.'),
    });
  }

  private configurarValidacionContrasena(requerida: boolean): void {
    const validadores = [Validators.minLength(8), Validators.maxLength(255)];
    if (requerida) {
      validadores.unshift(Validators.required);
    }
    this.form.controls.contrasena.setValidators(validadores);
    this.form.controls.contrasena.updateValueAndValidity({ emitEvent: false });
  }

  private actualizarPendientes(usuarioId: number, pendiente: boolean): void {
    this.estadosPendientes.update((actuales) => {
      const actualizados = new Set(actuales);
      if (pendiente) {
        actualizados.add(usuarioId);
      } else {
        actualizados.delete(usuarioId);
      }
      return actualizados;
    });
  }

  private notificarExito(summary: string, detail: string): void {
    this.messageService.add({ severity: 'success', summary, detail });
  }

  private notificarError(error: unknown, fallback: string): void {
    const detail =
      error instanceof HttpErrorResponse && typeof error.error?.detail === 'string'
        ? error.error.detail
        : fallback;
    this.errorMessage.set(detail);
    this.messageService.add({ severity: 'error', summary: 'Error', detail });
  }
}
