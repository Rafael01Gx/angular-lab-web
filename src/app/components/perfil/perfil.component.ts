import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroUser,
  heroEnvelope,
  heroLockClosed,
  heroPhone,
  heroMapPin,
  heroBriefcase,
  heroShieldExclamation,
  heroEye,
  heroEyeSlash,
  heroCheck,
  heroXMark,
  heroPencil,
} from '@ng-icons/heroicons/outline';
import { IUser, UpdateUserData } from '../../shared/interfaces/user.interface';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { NgxMaskDirective } from 'ngx-mask';
import { ToastrService } from '../../services/toastr.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIconComponent,
    NgxMaskDirective,
  ],
  viewProviders: [
    provideIcons({
      heroUser,
      heroEnvelope,
      heroLockClosed,
      heroPhone,
      heroMapPin,
      heroBriefcase,
      heroShieldExclamation,
      heroEye,
      heroEyeSlash,
      heroCheck,
      heroXMark,
      heroPencil,
    }),
  ],
  templateUrl: './perfil.component.html',
  host: {
    class: 'w-full h-full overflow-hidden flex',
  },
})
export class PerfilComponent implements OnInit {
  #userService = inject(UserService);
  #authService = inject(AuthService);
  #router = inject(Router)
  #toast = inject(ToastrService);
  #fb = inject(FormBuilder);
  #platformId = inject(PLATFORM_ID);
  currentUser = signal<IUser | null>(null);
  profileForm!: FormGroup;
  isLoading = signal(false);
  showPasswordFields = signal(false);
  showOldPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  ngOnInit() {
    if (isPlatformBrowser(this.#platformId)) {
      this.currentUser.set(this.#authService.currentUser());
      this.initializeForm();
    }
  }
  initializeForm() {
    this.profileForm = this.#fb.group({
      name: [
        this.currentUser()?.name || '',
        [Validators.required, Validators.minLength(2)],
      ],
      email: [{ value: this.currentUser()?.email || '', disabled: true }],
      phone: [this.currentUser()?.phone || ''],
      area: [this.currentUser()?.area || ''],
      funcao: [this.currentUser()?.funcao || ''],
      receives_email: [this.currentUser()?.receives_email || false],
      oldPassword: [''],
      password: [''],
      confirmPassword: [''],
    });
  }


  togglePasswordChange(event: any) {
    const checked = event.target.checked;
    this.showPasswordFields.set(checked);

    if (checked) {
      this.profileForm.get('oldPassword')?.setValidators([Validators.required]);
      this.profileForm
        .get('password')
        ?.setValidators([Validators.required, this.strongPasswordValidator]);
      this.profileForm
        .get('confirmPassword')
        ?.setValidators([
          Validators.required,
          this.passwordMatchValidator.bind(this),
        ]);
    } else {
      this.profileForm.get('oldPassword')?.clearValidators();
      this.profileForm.get('password')?.clearValidators();
      this.profileForm.get('confirmPassword')?.clearValidators();
      this.profileForm.get('oldPassword')?.setValue('');
      this.profileForm.get('password')?.setValue('');
      this.profileForm.get('confirmPassword')?.setValue('');
    }

    this.profileForm.get('oldPassword')?.updateValueAndValidity();
    this.profileForm.get('password')?.updateValueAndValidity();
    this.profileForm.get('confirmPassword')?.updateValueAndValidity();
  }

  toggleOldPasswordVisibility() {
    this.showOldPassword.set(!this.showOldPassword());
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword.set(!this.showNewPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  strongPasswordValidator(control: AbstractControl) {
    const password = control.value;
    if (!password) return null;

    const hasMinLength = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isValid =
      hasMinLength && hasLowercase && hasUppercase && hasNumbers && hasSymbols;

    return isValid ? null : { strongPassword: true };
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = this.profileForm?.get('password')?.value;
    const confirmPassword = control.value;

    if (!password || !confirmPassword) return null;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading.set(true);

      try {
        const formData = this.profileForm.value;
        const updateData: UpdateUserData = {
          name: formData.name,
          phone: formData.phone,
          area: formData.area,
          funcao: formData.funcao,
          receives_email: formData.receives_email
        };

        if (this.showPasswordFields()) {
          updateData.oldPassword = formData.oldPassword;
          updateData.password = formData.password;
        }

        this.#userService.update(updateData).subscribe({
          complete: () => {
            this.isLoading.set(false);
            this.#toast.success('Perfil atualizado com sucesso!', 'Sucesso');
            if (this.showPasswordFields()) {
              this.showPasswordFields.set(false);
              this.profileForm.get('oldPassword')?.setValue('');
              this.profileForm.get('password')?.setValue('');
              this.profileForm.get('confirmPassword')?.setValue('');
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            this.#toast.error(err.error.message || 'Erro ao atualizar perfil.');
          },
        });
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
      }
    }
  }
  cancel(){
    return this.#router.navigate(['/'])
  }
  
}
