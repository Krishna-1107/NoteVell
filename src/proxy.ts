import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/sign-up') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const isAuthRoute = request.nextUrl.pathname === '/login' ||
                      request.nextUrl.pathname === '/sign-up';

  if(isAuthRoute) {
    if(user) {
        return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const { searchParams, pathname } = request.nextUrl;

  if (user && pathname === "/" && !searchParams.has("noteId")) {
    const url = request.nextUrl.clone();

    // 1. Direct DB Query (No Fetch!)
    const { data: newestNote } = await supabase
      .from("Note") // Ensure table name matches exactly (Case Sensitive!)
      .select("id")
      .eq("authorId", user.id) // Ensure column name matches exactly
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();

    if (newestNote) {
      url.searchParams.set("noteId", newestNote.id);
      return NextResponse.redirect(url);
    } else {
      // 2. Create Note Directly
      const { data: newNote } = await supabase
        .from("Note")
        .insert({ authorId: user.id, text: "" })
        .select("id")
        .single();
        
      if (newNote) {
        url.searchParams.set("noteId", newNote.id);
        return NextResponse.redirect(url);
      }
    }
  }
  
  return supabaseResponse
}


export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}