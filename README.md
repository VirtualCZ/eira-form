# 🚀 Eira Form - Modern React Form Solution

A feature-rich form management system built with React, TypeScript, and modern web technologies. Handles complex form scenarios with ease!

## ✨ Key Features
- 📋 Multi-step form wizard with tab navigation
- 🌐 Internationalization (i18n) support (English/Čeština)
- 🔒 Type-safe form validation with Zod
- 🎛 Complex form components (Date pickers, File uploads, Dynamic tables)
- 📱 Responsive UI built with Radix UI and Tailwind CSS
- 🛠 Form state management with React Hook Form
- 🖼 Image upload with preview functionality
- 📅 Date range picker with dependency management

## 🛠 Tech Stack
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI + Tailwind CSS
- **Form Management**: React Hook Form + Zod
- **Internationalization**: i18next
- **Date Handling**: date-fns + react-day-picker

## ⚙️ Installation
```bash
git clone https://github.com/yourusername/eira-form.git
cd eira-form
npm install
npm run dev
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
## 🧩 Key Components
```
src/
├─ customComponents/
│  ├─ FormInput.tsx       # Smart input with type handling
│  ├─ FormDate.tsx        # Date picker with validation
│  ├─ FormTable.tsx       # Dynamic table with CRUD operations
│  ├─ FormPhotoUpload.tsx # Image upload with preview
│  └─ FormDateFromTo.tsx  # Connected date range picker
├─ components/ui/         # Radix-based UI primitives
└─ i18n/                  # Translation configurations
```

## 🔧 Scripts
```
npm run dev     # Start development server
npm run build   # Create production build
npm run lint    # Run ESLint
npm run preview # Preview production build
```
