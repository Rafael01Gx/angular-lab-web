import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { mapUserRole, Role, ROLE_HIERARCHY } from '../../shared/enums/roles.enum';

export const roleGuard: CanActivateFn = (route) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const allowedRoles = route.data?.['roles'] as Role[] | undefined;
    const userRole = mapUserRole(auth.currentUser()?.role || '');

    if (!userRole || !allowedRoles) {
        router.navigate(['/']);
        return false;
    }

    const allowedByHierarchy = ROLE_HIERARCHY[userRole];

    const hasAccess = allowedRoles.some(role =>
        allowedByHierarchy.includes(role)
    );

    if (!hasAccess) {
        router.navigate(['/unauthorized']);
        return false;
    }

    return true;
};
