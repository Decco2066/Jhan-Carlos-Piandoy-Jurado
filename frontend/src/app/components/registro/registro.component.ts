import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { CargoUsuario, UsuarioCreate } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [
    ButtonModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
    ReactiveFormsModule,
    RouterLink,
    SelectModule,
  ],
  selector: 'app-registro',
  styleUrl: './registro.component.css',
  templateUrl: './registro.component.html',
})
export class Registro {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

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
    contrasena: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(255),
    ]),
  });

  readonly errorMessage = signal('');
  readonly loading = signal(false);

  registrar(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    if (!formValue.cargo) {
      return;
    }

    const usuario: UsuarioCreate = { ...formValue, cargo: formValue.cargo };
    this.errorMessage.set('');
    this.loading.set(true);
    this.authService
      .registrar(usuario)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Registro exitoso',
            detail: 'Tu cuenta fue creada. Ya puedes iniciar sesión.',
          });
          void this.router.navigateByUrl('/login');
        },
        error: (error: unknown) => {
          this.errorMessage.set(
            error instanceof HttpErrorResponse && typeof error.error?.detail === 'string'
              ? error.error.detail
              : 'No fue posible crear la cuenta. Inténtalo de nuevo.',
          );
        },
      });
  }
}
