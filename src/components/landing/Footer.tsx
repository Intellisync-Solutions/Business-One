import { Facebook, Github, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Intellisync Business Suite</h3>
            <p className="text-sm text-muted-foreground">
              Empowering businesses with intelligent financial tools and analytics for better decision-making.
            </p>
            <div className="flex space-x-4">
              <Link to="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary">Home</Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary">About Us</Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary">Features</Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary">Pricing</Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-muted-foreground hover:text-primary">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-sm text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>Chatham-Kent<br />Ontario, Canada</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Phone className="h-5 w-5" />
                <span>(519) 358-9712</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Mail className="h-5 w-5" />
                <span>chris.june@intellisync.ca</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest updates and insights.
            </p>
            <div className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-background"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            2024 Intellisync Business Suite. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service
            </Link>
            <Link to="/cookies-policy" className="text-sm text-muted-foreground hover:text-primary">
              Cookies Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
