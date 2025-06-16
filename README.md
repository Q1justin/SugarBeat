# SugarBeat

A React Native app to help people track and reduce their added sugar consumption.

## Features
- Track daily added sugar intake
- Search food items using USDA API
- Create and share custom food items and recipes
- Connect with friends and share recipes
- Set and track sugar intake goals

## Development

### Prerequisites
- Node.js
- npm
- Supabase account

### Setup
1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_API_KEY=your_supabase_anon_key
```

### Supabase Types

After making changes to the database schema, update TypeScript types by running:
```bash
npm run update-types
```

This will regenerate the type definitions in `src/types/supabase.ts` to match your current database schema.
