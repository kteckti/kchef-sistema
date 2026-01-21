import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // --- LÓGICA DO ADMIN (Super Admin) ---
  const adminSession = request.cookies.get('admin_session');
  const isAdminProtected = request.nextUrl.pathname.startsWith('/admin') && 
                           !request.nextUrl.pathname.startsWith('/admin/login');

  if (isAdminProtected && !adminSession) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  if (request.nextUrl.pathname.startsWith('/admin/login') && adminSession) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // --- LÓGICA DA LOJA (Novo) ---
  const painelSession = request.cookies.get('painel_session'); // <--- NOME NOVO DO COOKIE
  const isPainelProtected = request.nextUrl.pathname.startsWith('/painel') && 
                          !request.nextUrl.pathname.startsWith('/painel/login');

  if (isPainelProtected && !painelSession) {
    return NextResponse.redirect(new URL('/painel/login', request.url));
  }
  
  if (request.nextUrl.pathname.startsWith('/painel/login') && painelSession) {
    return NextResponse.redirect(new URL('/painel/dashboard', request.url));
  }

  // --- HEADERS DE CACHE (Igual anterior) ---
  const response = NextResponse.next();
  if (isAdminProtected || isPainelProtected) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  }

  return response;
}

export const config = {
  // Monitora tanto /admin quanto /loja
  matcher: ['/admin/:path*', '/painel/:path*'],
}