import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const decodedPathname = decodeURIComponent(pathname).toLowerCase()
  
  // Jika ada pengunjung yang mencoba mengakses cabang lama yang sudah dihapus
  if (
    decodedPathname.startsWith('/bogor') || 
    decodedPathname.startsWith('/bandung') ||
    decodedPathname.startsWith('/jakarta-selatan') ||
    decodedPathname.startsWith('/jakarta selatan')
  ) {
    // Alihkan langsung ke halaman utama (jakarta)
    return NextResponse.redirect(new URL('/jakarta', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/bogor/:path*',
    '/bandung/:path*',
    '/jakarta-selatan/:path*',
    '/jakarta%20selatan/:path*',
  ],
}
