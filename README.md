# LifeHub Pro

Seu centro de organização pessoal — PWA completo com Dashboard, Tarefas, Calendário, Estudos, Notas, Finanças, Hábitos, Objetivos e Ajustes.

- **Stack:** React 18 + TypeScript + Vite + Tailwind CSS
- **Dados:** 100% locais no seu dispositivo (IndexedDB, com fallback para localStorage). Sem backend, sem conta, sem rastreamento.
- **PWA:** instalável, funciona offline, com notificações.

## Como rodar no computador

Pré-requisito: [Node.js](https://nodejs.org) 18 ou superior.

```bash
# 1. Entre na pasta do projeto
cd lifehub-pro

# 2. Instale as dependências
npm install

# 3. Rode em modo desenvolvimento
npm run dev
# Abra http://localhost:5173 no navegador
```

Para testar os recursos de PWA (instalação, offline, service worker), use o build de produção:

```bash
npm run build
npm run preview
# Abra http://localhost:4173
```

> Service worker e instalação exigem HTTPS ou `localhost`. Para usar no celular, publique a pasta `dist/` em qualquer hospedagem estática gratuita (Vercel, Netlify, GitHub Pages, Cloudflare Pages).

## Como instalar no celular

**Android (Chrome):** abra o site → menu **⋮** → **"Instalar app"** ou **"Adicionar à tela inicial"**. O botão "Instalar app" também aparece na barra superior do próprio LifeHub.

**iPhone/iPad (Safari):** abra o site → botão **Compartilhar** (quadrado com seta) → **"Adicionar à Tela de Início"**. Limitações do iOS: notificações web só funcionam no iOS 16.4+ e apenas com o app instalado na tela de início; o iOS não mostra prompt automático de instalação.

## Como usar como aplicativo

Depois de instalado, abra pelo ícone na tela inicial — ele roda em janela própria, sem barra do navegador. Funciona **offline** (os dados ficam no dispositivo). Ative as **notificações** em Ajustes → Notificações; como não há servidor, os lembretes disparam enquanto o app está aberto.

## Estrutura de pastas

```
lifehub-pro/
├── index.html               # Shell HTML + meta tags de PWA
├── public/
│   ├── manifest.json        # Manifesto do PWA
│   ├── sw.js                # Service worker (offline + notificações)
│   └── icons/               # Ícones 192 e 512
├── src/
│   ├── main.tsx             # Bootstrap + registro do SW
│   ├── App.tsx              # Shell: sidebar, topbar, navegação
│   ├── types.ts             # Tipos de todo o domínio
│   ├── db.ts                # IndexedDB + fallback localStorage
│   ├── store.tsx            # Estado global + persistência + export/import
│   ├── notifications.ts     # Permissão, disparo e agendador
│   ├── utils.ts             # Datas, moeda BRL, streaks
│   ├── index.css            # Tailwind + design system
│   ├── components/          # Sidebar, UI (Modal, Toggle...), Charts, Icons
│   └── pages/               # Dashboard, Tasks, Calendar, Studies, Notes,
│                            # Finance, Habits, Goals, Settings
└── ...configs (vite, ts, tailwind, postcss)
```

## Backup

Ajustes → Seus dados → **Exportar backup (JSON)**. Para restaurar, use **Importar backup** no mesmo lugar (funciona entre dispositivos).
