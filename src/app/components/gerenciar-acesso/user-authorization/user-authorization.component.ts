import { FormsModule } from '@angular/forms';

import { IUser } from '../../../interfaces/user.interface';
import { Component, inject, OnInit } from '@angular/core';
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
} from '@ng-icons/heroicons/outline';
import { Role } from '../../../enums/roles.enum';
import { ToastrService } from '../../layout/toastr/toastr.service';
import { UserService } from '../../../services/user.service';

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
    }),
  ],
  templateUrl: './user-authorization.component.html',
})
export class UserAuthorizationComponent implements OnInit {
  #toastr = inject(ToastrService);
  #userService = inject(UserService);
  users: IUser[] = [];
  filteredUsers: IUser[] = [];
  paginatedUsers: IUser[] = [];
  selectedUser: IUser | null = null;

  searchTerm: string = '';
  authorizationFilter: string = '';
  roleFilter: string = '';

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;

  roles = [
    { value: Role.USUARIO, label: Role.USUARIO },
    { value: Role.OPERADOR, label: Role.OPERADOR },
    { value: Role.ADMIN, label: Role.ADMIN },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

 async loadUsers() {
    try {
     await this.#userService.findAll().then((res) => {
        if (res) {
          this.users = res;
          console.log(res.map(res=> res.role))
        }
      });
    } catch (error) {
      console.log(error)
    }
    this.filteredUsers = [...this.users];
    this.updatePagination();
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter((user) => {
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

    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.authorizationFilter = '';
    this.roleFilter = '';
    this.filteredUsers = [...this.users];
    this.currentPage = 1;
    this.updatePagination();
  }

  toggleAuthorization(user: IUser): void {
    user.authorization = !user.authorization;
   
    this.#toastr.error('Inclusao', user.email);
  }

  updateUserRole(user: IUser): void {}

  openUserDetails(user: IUser): void {
    this.selectedUser = user;
  }

  closeUserDetails(): void {
    this.selectedUser = null;
  }

  getAuthorizedCount(): number {
    return this.users.filter((user) => user.authorization).length;
  }

  getUnauthorizedCount(): number {
    return this.users.filter((user) => !user.authorization).length;
  }

  // Métodos de paginação
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
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
      this.filteredUsers.length
    );
  }
}
