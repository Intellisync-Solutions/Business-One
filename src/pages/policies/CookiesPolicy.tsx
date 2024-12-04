import { motion } from "framer-motion"

export default function CookiesPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <h1 className="text-4xl font-bold mb-8">Cookies Policy</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
          <p className="mb-4">
            Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide useful information to website owners.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
          <p className="mb-4">We use cookies for the following purposes:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Authentication and security</li>
            <li>Preferences and settings</li>
            <li>Analytics and performance</li>
            <li>User experience improvements</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
              <p>Required for the website to function properly. They enable basic functions like page navigation and access to secure areas.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Preference Cookies</h3>
              <p>Allow the website to remember choices you make (such as language or region) to provide a more personalized experience.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Analytics Cookies</h3>
              <p>Help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Marketing Cookies</h3>
              <p>Used to track visitors across websites to enable us to display relevant and engaging advertisements.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Managing Cookies</h2>
          <p className="mb-4">
            Most web browsers allow you to control cookies through their settings preferences. However, limiting cookies may impact your experience of our website.
          </p>
          <p className="mb-4">
            You can manage cookies in your browser settings. Here's how to do it in common browsers:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Chrome: Settings → Privacy and Security → Cookies and other site data</li>
            <li>Firefox: Options → Privacy & Security → Cookies and Site Data</li>
            <li>Safari: Preferences → Privacy → Cookies and website data</li>
            <li>Edge: Settings → Privacy, search, and services → Cookies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Third-Party Cookies</h2>
          <p className="mb-4">
            We may use third-party services that use cookies. These services include:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Google Analytics</li>
            <li>Payment processors</li>
            <li>Social media platforms</li>
            <li>Advertising partners</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Updates to This Policy</h2>
          <p className="mb-4">
            We may update this Cookies Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our Cookies Policy, please contact us at:
          </p>
          <ul className="list-none mb-4">
            <li>Email: chris.june@intellisync.ca</li>
            <li>Phone: (519) 358-9712</li>
            <li>Address: Chatham-Kent, Ontario, Canada</li>
          </ul>
        </section>

        <p className="text-sm text-muted-foreground">Last Updated: January 2024</p>
      </div>
    </motion.div>
  )
}
