# Intellisync Business Suite

A modern business operations toolkit featuring an AI-powered business plan builder, financial calculators, and cashflow analysis tools.

## 🌟 Features

- **Business Plan Builder**
  - AI-assisted plan generation with GPT integration
  - Iterative refinement and customization
  - Export to PDF, Excel, and other formats
  - Real-time collaboration capabilities

- **Financial Calculators**
  - Break-even analysis
  - Startup cost estimation
  - Key business ratios and metrics
  - Interactive data visualization
  - Real-time calculations with instant updates

- **Cashflow Analysis**
  - Comprehensive validation tools
  - Advanced forecasting models
  - Visual reports and charts
  - Export and sharing capabilities

## 🛠 Tech Stack

- **Frontend**
  - React 18+ with TypeScript
  - Vite for fast development and building
  - TailwindCSS for styling
  - ShadcN UI Components for consistent design
  - Recharts for data visualization
  - Framer Motion for smooth animations
  - Lucide React Icons
  - Zustand for state management

- **Backend**
  - Netlify Functions (Serverless)
  - OpenAI API integration
  - Supabase for authentication and database

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.17.0 or higher)
- npm (v9.6.7 or higher)
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/Intellisync-Solutions/Business-One.git
cd intellisync-business-suite
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create a .env file in the root directory
cp .env.example .env

# Add your environment variables
VITE_OPENAI_API_KEY=your_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

1. Start the development server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

2. Start Netlify Functions locally (in a separate terminal)
```bash
npx netlify-cli dev
```
This will start the Netlify Functions development server

### Production Build

1. Build the application
```bash
npm run build
```

2. Preview the production build
```bash
npm run preview
```

### Deployment

The application is configured for deployment on Netlify:

1. Push your changes to the main branch
2. Netlify will automatically build and deploy the application
3. Environment variables must be configured in the Netlify dashboard

## 📝 Development Notes

- The application uses TypeScript for type safety
- ESLint and Prettier are configured for code quality
- Tailwind CSS is used for styling with a custom configuration
- The project follows the feature-based folder structure
- Netlify Functions are used for serverless backend operations

## 🔑 Environment Variables

Required environment variables:

```env
VITE_OPENAI_API_KEY=           # OpenAI API key for AI features
VITE_SUPABASE_URL=            # Supabase project URL
VITE_SUPABASE_ANON_KEY=       # Supabase anonymous key
```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.
