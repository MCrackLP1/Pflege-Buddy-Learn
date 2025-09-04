# 🏥 PflegeBuddy Learn

> **Tägliche Wissens-Drills für die Pflege - Mobile-first Lernapp**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Security](https://github.com/MCrackLP1/Pflege-Buddy-Learn/workflows/Security/badge.svg)](https://github.com/MCrackLP1/Pflege-Buddy-Learn/actions/workflows/security.yml)
[![CI/CD](https://github.com/MCrackLP1/Pflege-Buddy-Learn/workflows/CI%2FCD/badge.svg)](https://github.com/MCrackLP1/Pflege-Buddy-Learn/actions/workflows/ci.yml)

---

## ⚠️ **Wichtiger Rechtlicher Hinweis**

**Diese Anwendung ist ausschließlich für Bildungszwecke bestimmt und stellt KEINEN Ersatz für professionelle medizinische Beratung, Diagnose oder Behandlung dar.**

---

## 🎯 **Was ist PflegeBuddy Learn?**

Eine **mobile-optimierte Web-App** für Pflegekräfte, um ihr Fachwissen durch tägliche 5-Minuten-Sessions zu vertiefen. Die App bietet:

- 📚 **Strukturiertes Lernen** in 4 Hauptbereichen der Pflege
- 🧠 **Multiple-Choice und Wahr/Falsch Fragen** mit wissenschaftlichen Quellen
- 🎮 **Gamification** mit XP-System und Streak-Tracking  
- 💡 **Intelligentes Hint-System** für schwierige Fragen
- 📱 **Mobile-First Design** - optimiert für Smartphone-Nutzung

## 🚀 **Live Demo**

🔗 **[Hier testen](https://your-app.vercel.app)** (sobald deployed)

## 📱 **Screenshots**

*[Screenshots werden nach Deployment hinzugefügt]*

---

## 🛠️ **Für Entwickler**

### **Tech Stack**

| Kategorie | Technologie |
|-----------|-------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **UI Library** | shadcn/ui, Lucide React |
| **Backend** | Supabase (Auth + Database) |
| **Database** | PostgreSQL mit Drizzle ORM |
| **Payments** | Stripe Checkout |
| **i18n** | next-intl (DE/EN) |
| **Testing** | Playwright |
| **Hosting** | Vercel |

### **Installation**

```bash
# Repository klonen
git clone https://github.com/MCrackLP1/Pflege-Buddy-Learn.git
cd Pflege-Buddy-Learn

# Dependencies installieren
npm install

# Environment Setup
cp env.template .env.local
# Fülle deine Supabase & Stripe Keys ein

# Datenbank Setup
npm run db:generate
npm run db:migrate  
npm run db:seed

# Development Server starten
npm run dev
```

### **Environment Variables**

Alle erforderlichen Environment Variables findest du in [`env.template`](./env.template).

**Kritisch für Sicherheit:**
- Verwende **NIE** echte API-Keys in öffentlichem Code
- Nutze die bereitgestellten Templates
- Prüfe `.gitignore` vor Commits

### **Verfügbare Scripts**

```bash
# Development
npm run dev              # Development Server
npm run build           # Production Build
npm run type-check      # TypeScript Prüfung

# Database
npm run db:generate     # Migrations generieren
npm run db:migrate      # Migrations ausführen
npm run db:seed         # Testdaten laden
npm run db:reset        # Database zurücksetzen

# Content (AI-basiert)
npm run content:discover # Quellen finden
npm run content:generate # Fragen generieren (benötigt OpenAI)

# Testing
npm test               # Playwright Tests
npm run test:ui        # Interactive Test UI
```

---

## 🏗️ **Architektur**

### **Projektstruktur**

```
src/
├── 📄 app/                    # Next.js App Router
│   ├── 🌍 [locale]/          # Internationalisierte Routen  
│   │   ├── learn/           # Lernbereich
│   │   ├── quiz/[topic]/    # Quiz-Sessions
│   │   ├── review/          # Antworten-Review
│   │   ├── store/           # Hint-Shop
│   │   └── profile/         # Benutzerprofil
│   └── 🔌 api/               # API Endpoints
│       ├── auth/           # Supabase Auth Callback
│       └── stripe/         # Payment Webhooks
│
├── 🧩 components/            # React Komponenten
│   ├── 🎨 ui/               # shadcn/ui Basis-Komponenten
│   ├── 📄 pages/            # Seiten-spezifische Komponenten  
│   ├── 🧠 quiz/             # Quiz-System Komponenten
│   ├── 🔐 auth/             # Authentifizierung
│   └── 🏗️ layout/           # Navigation & Layout
│
├── 📚 lib/                  # Utilities & Services
│   ├── 💾 db/               # Datenbank Schema & Client
│   ├── 🔐 supabase/        # Supabase Client/Server Utils
│   └── 🛠️ utils.ts          # Helper Functions
│
└── 🌍 i18n/                # Internationalisierung
    └── messages/           # Übersetzungen (DE/EN)
```

### **Datenbank Schema**

- **`topics`** - Lernbereiche (Grundlagen, Hygiene, etc.)
- **`questions`** - Fragen mit Multiple-Choice/True-False
- **`attempts`** - User-Antworten und Progress
- **`user_progress`** - XP, Streaks, Statistiken
- **`user_wallet`** - Hint-Balance und Daily Limits
- **`purchases`** - Stripe Payment-Tracking

---

## 🔒 **Sicherheit & Compliance**

### **Implementierte Sicherheitsmaßnahmen**

- ✅ **Row Level Security (RLS)** auf allen Tabellen
- ✅ **Supabase Auth** mit Google OAuth 2.0
- ✅ **Environment Variables** - keine Secrets im Code
- ✅ **Automated Security Scanning** via GitHub Actions
- ✅ **Dependabot** für automatische Updates
- ✅ **Input Validation** und XSS-Schutz
- ✅ **CORS-Policies** und Webhook-Validierung

### **GDPR Compliance**

- 📋 **Datenminimierung** - nur notwendige Daten
- 👤 **Benutzerkontrolle** - Profil exportieren/löschen
- 🔐 **Sichere Speicherung** - Hash-basierte Session-Tokens
- 📝 **Transparenz** - klare Datennutzung dokumentiert

### **Medizinische Verantwortung**

- ⚕️ **Nur Bildungszwecke** - klare Disclaimers
- 📖 **Quellenbasiert** - alle Inhalte wissenschaftlich belegt
- 👨‍⚕️ **Fachliche Prüfung** - Content-Review durch Pflegeexperten
- 🚫 **Keine Patientendaten** - ausschließlich Lernmaterial

---

## 🤝 **Contributing**

Wir freuen uns über Beiträge! Bitte lies unsere **[Contributing Guidelines](./CONTRIBUTING.md)** sorgfältig durch.

**Besonders wichtig für medizinische Inhalte:**
- 📚 Alle medizinischen Informationen müssen wissenschaftlich belegt sein
- 🔍 Quellen sind Pflicht für jede medizinische Aussage
- ⚕️ Content sollte von Gesundheitsexperten geprüft werden

### **Entwicklung starten**

1. 🍴 Repository forken
2. 🌟 Feature Branch erstellen: `git checkout -b feature/amazing-feature`
3. 📱 **Mobile-first entwickeln** (390px Viewport)
4. ♿ **Accessibility testen** (Screen Reader)
5. 🧪 Tests hinzufügen/ausführen
6. 📝 Pull Request mit medizinischer Review-Checkliste

---

## 📞 **Support & Community**

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/MCrackLP1/Pflege-Buddy-Learn/issues/new?template=bug_report.md)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/MCrackLP1/Pflege-Buddy-Learn/issues/new?template=feature_request.md)
- 🔒 **Security Issues**: Siehe [SECURITY.md](./SECURITY.md)
- 💬 **Diskussionen**: [GitHub Discussions](https://github.com/MCrackLP1/Pflege-Buddy-Learn/discussions)

---

## 📄 **Lizenz**

[MIT License](./LICENSE) - Für Bildungszwecke. Siehe Lizenz für medizinische Haftungsausschlüsse.

---

## 🙏 **Danksagung**

- **shadcn/ui** für die exzellenten UI-Komponenten
- **Supabase** für die Backend-Infrastructure  
- **Next.js Team** für das großartige Framework
- **Open Source Community** für die Dependencies
- **Pflegeexperten** für fachliche Content-Review

---

## 📊 **Status**

- 🚧 **Version**: 0.1.0 (Beta)
- 📱 **Mobile Support**: ✅ Vollständig
- ♿ **Accessibility**: ✅ WCAG AA+
- 🌍 **i18n**: ✅ DE/EN
- 🔒 **Security**: ✅ Production-ready

**Bereit für Testing und Feedback!** 🎉