import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import { TrendingUp, LogOut, User } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export default function Header() {
  const handleNavbarClick = () => {
    // Clear navigation source to ensure homepage scrolls to top
    sessionStorage.removeItem("navigation-source");
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/"
        }
      }
    });
  };

  // Get session data from better-auth
  const { data: session } = authClient.useSession();

  return (
    <header className="w-full max-w-[1800px] mx-auto px-6 py-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3" onClick={handleNavbarClick}>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <TrendingUp className="text-primary-foreground w-6 h-6" />
          </div>
          <span className="text-2xl font-heading font-bold tracking-tight text-foreground">
            Thesivest
          </span>
        </Link>
      </div>
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors" onClick={handleNavbarClick}>Discover</Link>
        <Link to="/tournaments" className="hover:text-primary transition-colors" onClick={handleNavbarClick}>Tournaments</Link>
        <Link to="/funds" className="hover:text-primary transition-colors" onClick={handleNavbarClick}>Fund Research</Link>
        <Link to="/contributors" className="hover:text-primary transition-colors" onClick={handleNavbarClick}>Contributors</Link>
        <div className="h-4 w-px bg-border/50 mx-2" />
        <Link to="/dashboard" className="text-primary font-bold hover:text-primary/80 transition-colors" onClick={handleNavbarClick}>Dashboard</Link>
      </nav>

      {/* Show user info if logged in, otherwise show sign in */}
      {session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session.user.image || undefined} alt={session.user.name} />
                <AvatarFallback>
                  {session.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session.user.name}
                </p>
                {session.user.email && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={`/profiles/${session.user.id}`}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link to="/login" onClick={handleNavbarClick}>
          <Button className="bg-muted hover:bg-muted/80 text-foreground border-border" variant="outline">
            Sign In
          </Button>
        </Link>
      )}
    </header>
  )
}
