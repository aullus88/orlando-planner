# 🏰 Orlando 2026 — Trip Planner

App interativo para gerenciar a viagem em família para Orlando.  
**Aulus + Patrícia (grávida) + Malu (quase 2 anos)**  
31 Mar – 10 Abr 2026

## Stack
- **Next.js 16** + React 19 + Tailwind CSS 4
- **Supabase** (PostgreSQL) — banco de dados
- **Vercel** — hosting com auto-deploy

## Features
- 🗓 **Roteiro**: 11 dias editáveis. Adicionar/remover/editar itens por dia. Marcar como feito ✓
- 🏰 **Parques**: 10 parques com 55+ atrações. Filtros de altura (Malu), grávida, AC. CRUD completo
- 💰 **Custos**: Toggle pago/pendente. Totais automáticos. Adicionar novos custos
- ✈️ **Voos**: Copa Airlines BSB → PTY → MCO (Economy ida, Business volta!)
- 👶 **Malu**: Guia automático com atrações que ela pode ir (baseado em altura 87cm)

## Deploy em 3 passos

### 1. GitHub
```bash
# Crie um repo no GitHub (ex: orlando-planner)
git init
git add .
git commit -m "Orlando 2026 trip planner"
git branch -M main
git remote add origin https://github.com/SEU_USER/orlando-planner.git
git push -u origin main
```

### 2. Vercel
1. Vá em [vercel.com/new](https://vercel.com/new)
2. Import o repo `orlando-planner`
3. Em **Environment Variables**, adicione:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://itnbcuafjjgmmekosiei.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(ver .env.local)* |

4. Clique **Deploy**

### 3. Pronto!
Qualquer `git push` fará auto-deploy no Vercel.  
Compartilhe o link com a Patrícia — ambos podem editar! ✨
