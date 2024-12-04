import { motion } from "framer-motion"

export default function PrivacyPolicy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            At Intellisync Business Suite, we collect information to provide better services to our users. This information includes:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Personal information (name, email address, phone number)</li>
            <li>Business information</li>
            <li>Financial data for analysis purposes</li>
            <li>Usage data and analytics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the collected information for:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Providing and maintaining our services</li>
            <li>Improving user experience</li>
            <li>Sending important updates and notifications</li>
            <li>Analytics and service optimization</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
          <p className="mb-4">
            We implement robust security measures to protect your data, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Encryption of sensitive data</li>
            <li>Regular security audits</li>
            <li>Secure data storage practices</li>
            <li>Access controls and authentication</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
          <p className="mb-4">
            We do not sell your personal information. We may share data with:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Service providers who assist in our operations</li>
            <li>Legal authorities when required by law</li>
            <li>Business partners with your consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access your personal data</li>
            <li>Request data correction</li>
            <li>Request data deletion</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul className="list-none mb-4">
            <li>Email: chris.june@intellisync.ca</li>
            <li>Phone: (519) 358-9712</li>
            <li>Address: Chatham-Kent, Ontario, Canada</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          <p className="text-sm text-muted-foreground">Last Updated: January 2024</p>
        </section>
      </div>
    </motion.div>
  )
}
