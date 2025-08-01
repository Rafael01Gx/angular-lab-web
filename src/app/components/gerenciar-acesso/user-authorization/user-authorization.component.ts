import { FormsModule } from '@angular/forms';

import { IUser } from '../../../shared/interfaces/user.interface';
import {Component, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroUsers,
  heroFunnel,
  heroCheckCircle,
  heroXCircle,
  heroUserGroup,
  heroPencil,
  heroTrash,
  heroMagnifyingGlass,
  heroEllipsisVertical,
  heroChevronLeft,
  heroChevronRight,
  heroChevronDoubleLeft,
  heroChevronDoubleRight,
  heroArrowDown,
  heroArrowUp,
} from '@ng-icons/heroicons/outline';
import { mapUserRole } from '../../../shared/enums/roles.enum';
import { ToastrService } from '../../layout/toastr/toastr.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-authorization',
  imports: [CommonModule, NgIconComponent, FormsModule],
  viewProviders: [
    provideIcons({
      heroUsers,
      heroFunnel,
      heroCheckCircle,
      heroXCircle,
      heroUserGroup,
      heroPencil,
      heroTrash,
      heroMagnifyingGlass,
      heroEllipsisVertical,
      heroChevronLeft,
      heroChevronRight,
      heroChevronDoubleLeft,
      heroChevronDoubleRight,
      heroArrowUp,
      heroArrowDown,
    }),
  ],
  templateUrl: './user-authorization.component.html',
})
export class UserAuthorizationComponent implements OnInit {
  mapRoles = mapUserRole;
  #toastr = inject(ToastrService);
  #userService = inject(UserService);
  #authService = inject(AuthService);

  users= signal<IUser[]>([]);
  filteredUsers= signal<IUser[]>([]);
  paginatedUsers= signal<IUser[]>([]);
  selectedUser= signal<IUser | null>(null);
  roleFilter:string=''
  searchTerm:string=''
  authorizationFilter:string=''
  expanded:boolean=true;

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;

  roles = [
    { value: 'USUARIO', label: 'Usuário' },
    { value: 'OPERADOR', label: 'Operador' },
    { value: 'ADMIN', label: 'Administrador' },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers() {

      await this.#userService.findAll().then((res) => {
        if (res) {
          res.map((res) => {
            return { ...res, role: this.mapRoles(res.role as string) };
          });
          this.users.set(res);
        }
      }).catch((err) => {console.log(err)})

    this.filteredUsers.set([...this.users()]);
    this.updatePagination();
  }

  applyFilters(): void {
    const filters = this.users().filter((user) => {
      const matchesSearch =
        this.searchTerm === '' ||
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesAuth =
        this.authorizationFilter === '' ||
        (this.authorizationFilter === 'authorized' && user.authorization) ||
        (this.authorizationFilter === 'unauthorized' && !user.authorization);

      const matchesRole =
        this.roleFilter === '' || user.role === this.roleFilter;

      return matchesSearch && matchesAuth && matchesRole;
    });
    this.filteredUsers.set(filters);
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm='';
    this.authorizationFilter='';
    this.roleFilter='';
    this.filteredUsers.set([...this.users()]);
    this.currentPage = 1;
    this.updatePagination();
  }

  updateUser(user: IUser): void {
    if (!user.id || !this.#authService.currentUser()) return;

    if (user.id == this.#authService.currentUser()?.id) {
      this.#toastr.info(
        'Você não pode alterar suas próprias permissões de acesso.'
      );
      return;
    }
    this.#userService
      .updateStatus(user.id, user)
      .then(() => {
        this.#toastr.success(`Usuário ${user.name}, atualizado com sucesso!`);
      })
      .catch((err) => {
        this.#toastr.error(err.error.message);
        console.log(err);
      });
  }

  getAuthorizedCount(): number {
    return this.users().filter((user) => user.authorization).length;
  }

  getUnauthorizedCount(): number {
    return this.users().filter((user) => !user.authorization).length;
  }

  // Métodos de paginação
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers().length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers.update(()=> this.filteredUsers().slice(startIndex, endIndex))
  }

  goToFirstPage(): void {
    this.currentPage = 1;
    this.updatePaginatedUsers();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedUsers();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedUsers();
    }
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
    this.updatePaginatedUsers();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  getEndIndex(): number {
    return Math.min(
      this.getStartIndex() + this.pageSize,
      this.filteredUsers().length
    );
  }
}
