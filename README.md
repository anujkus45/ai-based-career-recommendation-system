# AI-Based Career Recommendation System

An intelligent career guidance platform that uses AI to provide personalized career recommendations based on user assessments, skill analysis, and market trends.

## 🚀 Features

- **Interactive Career Quiz**: Comprehensive assessment covering interests, skills, and preferences
- **AI-Powered Recommendations**: Uses OpenAI GPT-4 for personalized career suggestions
- **Skill Gap Analysis**: Identifies skills needed for target careers and provides learning paths
- **Career Comparison**: Compare different career paths side-by-side
- **Cost & Scholarship Information**: Financial planning for education and career transitions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Chatbot**: AI assistant for career guidance questions

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Query** for API state management
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** with Drizzle ORM
- **OpenAI API** for AI recommendations

### Infrastructure
- **pnpm** for package management
- **Monorepo** structure with workspaces
- **Docker** support (optional)

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** 20+ (recommended 22+)
- **pnpm** 9+
- **PostgreSQL** 14+
- **OpenAI API Key** (for AI features)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anujkus45/ai-based-career-recommendation-system.git
   cd ai-based-career-recommendation-system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Fill in your values in `.env`:
   ```env
   # OpenAI API Key - get from https://platform.openai.com/api-keys
   OPENAI_API_KEY=sk-your-api-key-here

   # PostgreSQL connection string
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/career_ai
   ```

4. **Set up PostgreSQL database**

   Create a database named `career_ai`:
   ```sql
   CREATE DATABASE career_ai;
   ```

5. **Push database schema**
   ```bash
   pnpm --filter @workspace/db run push
   ```

## 🏃‍♂️ Running the Application

### Development Mode

Start both frontend and backend simultaneously:
```bash
pnpm run dev
```

Or run them separately:

**Terminal 1 - Backend API:**
```bash
pnpm run dev:api
```

**Terminal 2 - Frontend:**
```bash
pnpm run dev:client
```

### Production Build

```bash
pnpm run build
```

## 🌐 Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Take the career assessment quiz
3. View personalized career recommendations
4. Explore skill gap analysis and learning paths
5. Compare different career options
6. Get cost estimates and scholarship information

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── context/       # React context providers
│   │   └── lib/           # Utility functions
├── server/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── services/      # Business logic services
│   │   └── config/        # Configuration files
├── shared/                 # Shared packages and utilities
│   ├── api-spec/          # OpenAPI specifications
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-zod/           # Generated Zod validators
│   └── db/                # Database schema and client
├── docs/                  # Documentation
└── config/                # Configuration files
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI capabilities
- The open-source community for the amazing tools and libraries

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Note:** This is a development version. For production deployment, additional configuration and security measures are required.