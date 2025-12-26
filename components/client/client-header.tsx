"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useRef, useEffect } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";

export function ClientHeader() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const { wishlist } = useWishlist();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setMobileMenuOpen((prev) => !prev);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    ...(user && user.role === "customer"
      ? [{ name: "Orders", href: "/orders" }]
      : []),

    {
      name: "More",
      children: [
        { name: "Return and Refund", href: "/return-refund" },
        { name: "Privacy and Policy  ", href: "/policy-privacy" },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                E
              </span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">
              E-com
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 relative">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.name} className="relative" ref={moreRef}>
                  <button
                    onClick={() => setMoreOpen((prev) => !prev)}
                    className="text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    {link.name}
                  </button>

                  {moreOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg animate-in fade-in slide-in-from-top-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block px-4 py-2 text-foreground hover:bg-muted rounded-md"
                          onClick={() => setMoreOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              )
            )}
          </nav>
         
        

          <div className="flex items-center gap-3">

              <Link href="/wishlist" className="relative">
            <Button variant="ghost" size="icon">
              <Heart
                className={`w-5 h-5 ${
                  wishlist.length > 0 ? "text-red-500 fill-red-500" : ""
                }`}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-1  -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {wishlist.length}
                </span>
              )}
            </Button>
          </Link>
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="w-5 h-5" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                    {items.length}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              user.role === "admin" ? (
                <Link href="/admin/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex"
                  >
                    Admin Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/profile">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex"
                  >
                    {user.name}
                  </Button>
                </Link>
              )
            ) : null}

            {user ? (
              <>
                <Button
                  onClick={() => setConfirmLogout(true)}
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  Logout
                </Button>

                <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Confirm Logout</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to log out of your account?
                    </p>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setConfirmLogout(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          logout();
                          setConfirmLogout(false);
                        }}
                      >
                        Logout
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Link href="/account/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.name} className="space-y-1">
                  <span className="block px-4 py-2 text-foreground font-semibold">
                    {link.name}
                  </span>
                  {link.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className="block px-6 py-2 text-foreground hover:bg-muted rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )
            )}

          {user ? (
      <>
        {user.role === "admin" ? (
          <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="outline" className="w-full mb-1.5">
              Admin Dashboard
            </Button>
          </Link>
        ) : (
          <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="outline" className="w-full mb-1.5">
              {user.name}
            </Button>
          </Link>
        )}

        <Button
          onClick={() => {
            setConfirmLogout(true);
            setMobileMenuOpen(false);
          }}
          variant="outline"
          className="w-full"
        >
          Logout
        </Button>
      </>
    ) : (
      <Link href="/account/login" onClick={() => setMobileMenuOpen(false)}>
        <Button variant="outline" className="w-full">
          Login
        </Button>
      </Link>
    )}
          </nav>
        )}
      </div>
    </header>
  );
}
