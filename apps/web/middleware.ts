import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
} from '@convex-dev/auth/nextjs/server';

const isSignInPage = createRouteMatcher(['/login']);
const isLandingPage = createRouteMatcher(['/']);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  console.log(
    'middleware',
    await convexAuth.getToken(),
    !isLandingPage(request) &&
      !isSignInPage(request) &&
      !(await convexAuth.isAuthenticated())
  );
  // if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
  //   return nextjsMiddlewareRedirect(request, '/dashboard');
  // }
  // if (
  //   !isLandingPage(request) &&
  //   !isSignInPage(request) &&
  //   !(await convexAuth.isAuthenticated())
  // ) {
  //   return nextjsMiddlewareRedirect(request, '/login');
  // }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
