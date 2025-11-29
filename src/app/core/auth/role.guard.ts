import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const tokenStorage = inject(TokenStorageService);
    const router = inject(Router);

    const user = tokenStorage.getUser();
    const expectedRoles = route.data['roles'] as Array<string>;

    if (user && user.roles && user.roles.some(role => expectedRoles.includes(role))) {
        return true;
    }

    // Redirect to unauthorized or home
    return router.createUrlTree(['/']);
};
