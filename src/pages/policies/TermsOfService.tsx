import { motion } from "framer-motion"

export default function TermsOfService() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using Intellisync Business Suite, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="mb-4">
            Intellisync Business Suite provides financial analysis tools, business planning solutions, and related services. We reserve the right to modify, suspend, or discontinue any part of the service at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
          <p className="mb-4">Users are responsible for:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Maintaining the confidentiality of their account</li>
            <li>All activities that occur under their account</li>
            <li>Ensuring their use of the service complies with all applicable laws</li>
            <li>The accuracy of information provided through the service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
          <p className="mb-4">
            All content, features, and functionality of Intellisync Business Suite are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
          <p className="mb-4">
            Users agree to pay all fees or charges to their account based on the fees, charges, and billing terms in effect at the time a fee or charge is due and payable.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p className="mb-4">
            Intellisync Business Suite shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
          <p className="mb-4">
            We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this site and updating the "Last Updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
          <p className="mb-4">
            If you have any questions about these Terms of Service, please contact us at:
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
