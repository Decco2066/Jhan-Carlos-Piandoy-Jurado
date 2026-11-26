import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../services/auth.service';

@Component({
  imports: [
    ButtonModule,
    CardModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  selector: 'app-login',
  styleUrl: './login.component.css',
  templateUrl: './login.component.html',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group({
    identificacion: ['', Validators.required],
    contrasena: ['', Validators.required],
  });

  readonly errorMessage = signal('');
  readonly loading = signal(false);

  iniciarSesion(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.loading.set(true);
    this.authService
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/usuarios'),
        error: (error: unknown) => {
          this.errorMessage.set(this.mensajeError(error));
        },
      });
  }

  private mensajeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Usuario o contraseña inválidos';
      }
      if (error.status === 403) {
        return 'Usuario desactivado';
      }
      if (typeof error.error?.detail === 'string') {
        return error.error.detail;
      }
    }

    return 'No fue posible iniciar sesión. Inténtalo de nuevo.';
  }
}
