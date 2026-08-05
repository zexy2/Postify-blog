# Postify Blog

A full-stack blog platform built with React 19, Redux Toolkit, and Supabase.

**Demo:** https://zexy2.github.io/Postify-blog

## Features

- Content management with rich text editor (TipTap)
- JWT authentication with refresh token mechanism
- Role-based access control (Admin, Moderator, User)
- Admin dashboard for user and content management
- Multi-language support (English, Turkish)
- Dark/Light theme with system preference detection
- PWA with offline support
- Analytics dashboard with charts

## Tech Stack

**Frontend:** React 19, Redux Toolkit, TanStack Query, React Router 7, TipTap, Recharts

**Backend:** Supabase (PostgreSQL), JWT Authentication

**Build:** Vite 7, Docker

**Testing:** Vitest, Playwright

## Getting Started

```bash
git clone https://github.com/zexy2/Postify-blog.git
cd Postify-blog
npm install
cp .env.example .env
npm run dev
```

## Project Structure

```
src/
├── components/     # UI components
├── pages/          # Route pages
├── services/       # API and business logic
│   ├── apiService.js      # REST API layer
│   ├── authService.js     # Auth logic
│   ├── jwtService.js      # Token management
│   └── adminService.js    # Admin operations
├── store/          # Redux store and slices
├── hooks/          # Custom hooks
└── lib/            # External configs (Supabase, i18n)
```

## API

```javascript
api.posts.getAll({ page, limit })
api.posts.getById(id)
api.posts.create(data)
api.posts.update(id, data)
api.posts.delete(id)

api.users.getById(id)
api.users.update(id, data)
```

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run test      # Run tests
npm run lint      # Lint code
```

## Environment Variables

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Performance

| Metric | Score |
|--------|-------|
| Best Practices | 100 |
| Accessibility | 95 |
| SEO | 90 |

## License

MIT
