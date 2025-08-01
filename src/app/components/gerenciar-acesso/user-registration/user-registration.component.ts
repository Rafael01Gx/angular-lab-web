import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroSlash,
  heroUser,
  heroEnvelope,
  heroPhone,
  heroBriefcase,
  heroUserPlus,
  heroUserGroup,
  heroCheckCircle,
  heroXCircle,
  heroInformationCircle,
  heroArrowPath,
} from '@ng-icons/heroicons/outline';
import { IUser } from '../../../shared/interfaces/user.interface';
import { AuthService } from '../../../services/auth.service';
import { NgxMaskDirective } from 'ngx-mask';
import { ToastrService } from '../../layout/toastr/toastr.service';

@Component({
  selector: 'app-user-registration',
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
      heroPhone,
      heroBriefcase,
      heroUserPlus,
      heroUserGroup,
      heroCheckCircle,
      heroXCircle,
      heroInformationCircle,
      heroArrowPath,
      heroSlash,
    }),
  ],
  templateUrl: './user-registration.component.html',
})
export class UserRegistrationComponent implements OnInit {
  isloading = false;
  #toastr = inject(ToastrService);
  #authService = inject(AuthService);
  userForm: FormGroup;
  generatedPassword: string = '';

  roles = [
    { value: 'USUARIO', label: 'Usuário' },
    { value: 'OPERADOR', label: 'Operador' },
    { value: 'ADMIN', label: 'Administrador' },
  ];

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      area: ['', [Validators.required, Validators.min(3)]],
      funcao: ['', [Validators.required, Validators.min(3)]],
      role: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.generatePassword();
  }

  generatePassword(): void {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';

    password += this.getRandomChar(lowercase);
    password += this.getRandomChar(uppercase);
    password += this.getRandomChar(numbers);
    password += this.getRandomChar(symbols);

    const allChars = lowercase + uppercase + numbers + symbols;
    for (let i = 4; i < 8; i++) {
      password += this.getRandomChar(allChars);
    }
    this.generatedPassword = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  private getRandomChar(chars: string): string {
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.generatePassword();

      const newUser: IUser = {
        name: this.userForm.get('name')?.value,
        email: this.userForm.get('email')?.value,
        password: this.generatedPassword,
        phone: this.userForm.get('phone')?.value || undefined,
        area: this.userForm.get('area')?.value || undefined,
        funcao: this.userForm.get('funcao')?.value || undefined,
        role: this.userForm.get('role')?.value,
      };
      this.isloading = true;
      this.#authService
        .create(newUser)
        .then(() => {
          this.isloading = false;
          this.#toastr.success('', 'Usuário criado com sucesso!');
          this.resetForm();
        })
        .catch((err) => {
          this.isloading = false;
          this.#toastr.error('', err.error.message);
        });
    }
  }

  resetForm(): void {
    this.userForm.reset();
  }
}
