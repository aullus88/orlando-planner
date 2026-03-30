# Orlando Planner v2 — Plano de Evolução

## Visão geral

Transformar o app de um planner simples com abas isoladas em um **painel completo de viagem** com timeline unificada, listas por pessoa, melhor UI/UX, e tema claro/escuro.

---

## ~~Fase 1 — Refatoração & Infraestrutura~~ ✅ CONCLUÍDA

### 1.1 Quebrar o monolito `App.js`
O arquivo único de 706 linhas precisa virar componentes isolados antes de qualquer feature nova.

```
src/
├── components/
│   ├── ui/                  # Primitivas reutilizáveis
│   │   ├── Badge.js
│   │   ├── Card.js
│   │   ├── Modal.js
│   │   ├── Input.js
│   │   ├── Btn.js
│   │   ├── Select.js
│   │   └── Toggle.js
│   ├── layout/
│   │   ├── Header.js        # Hero + countdown
│   │   ├── TabBar.js         # Navegação por abas
│   │   └── ThemeToggle.js    # Botão light/dark
│   ├── timeline/
│   │   ├── Timeline.js       # View unificada (nova)
│   │   ├── TimelineDay.js
│   │   ├── TimelineEvent.js  # Bloco genérico (voo, hotel, parque, item)
│   │   └── TimelineFilters.js
│   ├── tabs/
│   │   ├── TabRoteiro.js
│   │   ├── TabParques.js
│   │   ├── TabCustos.js
│   │   ├── TabVoos.js
│   │   ├── TabMalu.js
│   │   ├── TabTodo.js        # (nova)
│   │   └── TabCompras.js     # (nova)
│   └── hooks/
│       ├── useCountdown.js
│       ├── useTrip.js        # Hook central de dados (fetchAll + mutations)
│       └── useTheme.js       # Light/dark mode
├── lib/
│   ├── supabase.js
│   └── constants.js          # TRIP_ID, cores, categorias, etc.
└── app/
    ├── layout.js
    ├── page.js
    └── globals.css
```

### 1.2 Hook central `useTrip`
Extrair toda lógica de fetch/mutação do App.js para um hook dedicado. Incluir **optimistic updates** — atualizar o state local imediatamente e sincronizar com Supabase em background. Elimina o padrão atual de "re-fetch tudo após cada operação".

### 1.3 Supabase Realtime
Ativar subscriptions nas tabelas principais para que Aulus e Patrícia vejam mudanças do outro em tempo real sem refresh manual.

---

## ~~Fase 2 — Timeline Unificada~~ ✅ CONCLUÍDA

### 2.1 Visão "Timeline" (nova aba principal)
Uma view vertical onde **todos os eventos da viagem** aparecem na mesma tela, organizados por dia:

```
┌─────────────────────────────────────┐
│  31 MAR (Seg) · Dia 1               │
│  ─────────────────────────────       │
│  ✈️ 06:10  Voo BSB → PTY (CM240)    │  ← trip_flights
│  ✈️ 12:05  Voo PTY → MCO (CM460)    │  ← trip_flights
│  🏨 16:00  Check-in Hilton Bonnet   │  ← trip_hotels (NOVA TABELA)
│  🚗 16:30  Retirar carro Alamo      │  ← trip_cars (NOVA TABELA)
│  🍽️ 19:00  Jantar T-Rex Café       │  ← day_items
│  🛒 20:30  Walmart — compras base   │  ← day_items
│                                      │
│  01 ABR (Ter) · Dia 2               │
│  ─────────────────────────────       │
│  🎢 08:00  Universal Studios        │  ← day_items (linked to park)
│  🍽️ 12:30  Almoço no parque        │  ← day_items
│  😴 14:00  Soneca hotel             │  ← day_items
│  🎢 17:00  Volta ao parque          │  ← day_items
│  ...                                 │
│                                      │
│  10 ABR (Qui) · Dia 11              │
│  ─────────────────────────────       │
│  🏨 11:00  Check-out                │  ← trip_hotels
│  🚗 11:30  Devolver carro           │  ← trip_cars
│  ✈️ 14:35  Voo MCO → PTY (CM461)   │  ← trip_flights
│  ✈️ 19:55  Voo PTY → BSB (CM241)   │  ← trip_flights
└─────────────────────────────────────┘
```

**Cada bloco é editável inline** — toque para expandir, editar ou remover.

### 2.2 Novas tabelas Supabase

**`trip_hotels`**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| trip_id | uuid | FK → trip |
| name | text | Nome do hotel |
| check_in | date | Data entrada |
| check_out | date | Data saída |
| address | text | Endereço |
| booking_ref | text | Nº reserva |
| notes | text | Observações |
| icon | text | Emoji |
| sort_order | int | Ordem |

**`trip_cars`**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| trip_id | uuid | FK → trip |
| company | text | Locadora (Alamo, etc.) |
| car_type | text | Categoria do carro |
| pickup_date | timestamp | Data/hora retirada |
| return_date | timestamp | Data/hora devolução |
| pickup_location | text | Local retirada |
| return_location | text | Local devolução |
| booking_ref | text | Nº reserva |
| notes | text | Observações |
| icon | text | Emoji |
| sort_order | int | Ordem |

### 2.3 Filtros da timeline
- Mostrar/ocultar por tipo: voos, hotel, carro, parques, refeições, outros
- Destacar itens por pessoa (ex: "mostrar só o que a Malu pode fazer")
- Indicador de crowd level por dia

---

## ~~Fase 3 — Listas por Pessoa~~ ✅ CONCLUÍDA

### 3.1 Nova tabela `shopping_lists`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| trip_id | uuid | FK → trip |
| person | text | `aulus`, `patricia`, `malu`, `baby` |
| category | text | `roupa`, `farmacia`, `brinquedo`, `eletronico`, `parque`, `outro` |
| item | text | Nome do item |
| quantity | int | Quantidade (default 1) |
| is_checked | boolean | Comprado? |
| store | text | Loja sugerida (Walmart, Target, outlet, etc.) |
| notes | text | Observações |
| sort_order | int | Ordem |

### 3.2 Tab "Compras" (TabCompras)
Layout dividido por pessoa com contadores:

```
┌──────────────────────────────────┐
│  🛍️ Lista de Compras             │
│                                   │
│  [👨 Aulus (8)] [👩 Patrícia (12)]│ ← sub-tabs por pessoa
│  [👶 Malu (15)] [🍼 Baby (6)]    │
│                                   │
│  ── 👶 Malu ──────────────────   │
│                                   │
│  🧸 Brinquedos (4)               │
│  ☐ Pelúcia Stitch — Disney       │
│  ☐ LEGO Duplo dinossauro         │
│  ☑ Fantasia Moana — Party City   │
│  ☐ Balde de areia                │
│                                   │
│  👗 Roupas (6)                    │
│  ☐ Vestido Disney (3T)           │
│  ☐ Pijama dino (3T) — Target    │
│  ...                              │
│                                   │
│  💊 Farmácia (3)                  │
│  ☐ Protetor solar baby           │
│  ☐ Band-aid infantil             │
│  ...                              │
│                                   │
│  + Adicionar item                 │
└──────────────────────────────────┘
```

Funcionalidades:
- Filtro por pessoa (sub-tabs) e por categoria
- Marcar como comprado (checkbox)
- Sugestão de loja por item
- Resumo: "X de Y itens comprados"
- Poder mover item entre pessoas

### 3.3 Pessoas

| Pessoa | Contexto |
|--------|----------|
| 👨 Aulus | Pai, adulto |
| 👩 Patrícia | Mãe, grávida |
| 👶 Malu | 1 ano (faz 2 em 12/abr), 87cm |
| 🍼 Baby | Novo bebê (enxoval, itens de farmácia, etc.) |

---

## Fase 4 — Todo List

### 4.1 Nova tabela `trip_todos`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | PK |
| trip_id | uuid | FK → trip |
| title | text | Tarefa |
| category | text | `docs`, `reserva`, `compra`, `saude`, `parque`, `outro` |
| assignee | text | Pessoa responsável (ou null = geral) |
| due_date | date | Data limite (opcional) |
| is_done | boolean | Concluído? |
| priority | text | `high`, `medium`, `low` |
| notes | text | Observações |
| sort_order | int | Ordem |

### 4.2 Tab "Todo" (TabTodo)

```
┌──────────────────────────────────┐
│  ✅ Todo List                     │
│                                   │
│  [Todos] [Docs] [Reservas]       │ ← filtro por categoria
│  [Saúde] [Parques]               │
│                                   │
│  🔴 Alta Prioridade               │
│  ☐ Renovar passaporte Malu       │
│    📅 até 15/mar · 👩 Patrícia   │
│  ☐ Seguro viagem (cotação)       │
│    📅 até 20/mar · 👨 Aulus      │
│                                   │
│  🟡 Média                         │
│  ☐ Reservar T-Rex Café (dia 1)   │
│  ☐ Baixar app My Disney Exp.     │
│  ☑ Comprar adaptador tomada      │
│                                   │
│  🟢 Baixa                         │
│  ☐ Playlist músicas pra viagem   │
│  ☐ Imprimir confirmações         │
│                                   │
│  + Nova tarefa                    │
└──────────────────────────────────┘
```

Funcionalidades:
- Agrupamento por prioridade (alta/média/baixa)
- Filtro por categoria e por pessoa
- Data limite com indicador visual (vencido = vermelho)
- Atribuir responsável
- Contadores: "X de Y feitos"

---

## ~~Fase 5 — Light/Dark Mode~~ ✅ CONCLUÍDA

### 5.1 Sistema de tema
- Hook `useTheme` com 3 modos: `light`, `dark`, `system`
- Persistir preferência em `localStorage`
- CSS variables para todas as cores (já existe parcialmente em globals.css)
- Toggle no header

### 5.2 Tokens de cor

| Token | Dark | Light |
|-------|------|-------|
| `--bg-primary` | `#0B1120` | `#FFFFFF` |
| `--bg-secondary` | `#151d2e` | `#F8FAFC` |
| `--bg-card` | `rgba(255,255,255,0.025)` | `rgba(0,0,0,0.02)` |
| `--border` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.08)` |
| `--text-primary` | `#F1F5F9` | `#0F172A` |
| `--text-secondary` | `#94A3B8` | `#64748B` |
| `--text-muted` | `#475569` | `#94A3B8` |
| `--accent` | `#FF6B3D` | `#FF6B3D` |

### 5.3 Atualizar todos os componentes
- Substituir cores hardcoded por variáveis CSS
- Garantir contraste WCAG AA em ambos os temas
- Testar glass-morphism no tema claro (ajustar opacidades)

---

## Fase 6 — Melhorias de UI/UX

### 6.1 Drag-and-drop
- Reordenar itens do roteiro, atrações, custos
- Usar uma lib leve tipo `@dnd-kit/core`
- Atualizar `sort_order` no Supabase após drop

### 6.2 Busca global
- Input de busca no topo que filtra atrações, itens do roteiro, custos, todos
- Resultado agrupado por tipo
- "Buscar atrações indoor que Malu pode ir"

### 6.3 Melhorias visuais
- Transições mais suaves entre abas (fade/slide)
- Skeleton loading em vez do bounce do castelo
- Swipe gestures nas abas (mobile)
- Ícone de status em cada dia (completo, parcial, futuro)
- Progress bar geral da viagem

### 6.4 Links para mapas
- Botão em atrações/restaurantes para abrir no Google Maps/Apple Maps
- Deep link: `https://maps.google.com/?q=Nome+do+Lugar+Orlando`

### 6.5 PWA
- Adicionar `manifest.json` para instalar como app na home screen
- Ícone personalizado (castelo)
- Splash screen

---

## Fase 7 — Melhorias de Dados

### 7.1 Custos por dia
- Campo opcional `day_id` na tabela `trip_costs`
- Na timeline, mostrar gasto estimado por dia
- Mini gráfico de custos no resumo

### 7.2 Integração de weather (opcional)
- Buscar previsão do tempo para Orlando nas datas da viagem
- Mostrar ícone de clima por dia na timeline
- API gratuita: OpenWeatherMap ou Open-Meteo

### 7.3 Wait times (opcional)
- Link direto para filas em tempo real por parque
- ThemeParks.wiki API (gratuita) para dados ao vivo

---

## Novas tabelas Supabase — Resumo de migrations

```sql
-- 1. Hotels
CREATE TABLE trip_hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  name TEXT NOT NULL,
  check_in DATE,
  check_out DATE,
  address TEXT,
  booking_ref TEXT,
  notes TEXT,
  icon TEXT DEFAULT '🏨',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Cars
CREATE TABLE trip_cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  company TEXT NOT NULL,
  car_type TEXT,
  pickup_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  pickup_location TEXT,
  return_location TEXT,
  booking_ref TEXT,
  notes TEXT,
  icon TEXT DEFAULT '🚗',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Shopping lists
CREATE TABLE shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  person TEXT NOT NULL CHECK (person IN ('aulus', 'patricia', 'malu', 'baby')),
  category TEXT DEFAULT 'outro',
  item TEXT NOT NULL,
  quantity INT DEFAULT 1,
  is_checked BOOLEAN DEFAULT false,
  store TEXT,
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Todo list
CREATE TABLE trip_todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'outro',
  assignee TEXT,
  due_date DATE,
  is_done BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Add day_id to costs (optional link to day)
ALTER TABLE trip_costs ADD COLUMN day_id UUID REFERENCES trip_days(id);
```

---

## Ordem de execução recomendada

| # | Fase | Prioridade | Status |
|---|------|-----------|--------|
| 1 | Refatoração (1.1, 1.2, 1.3) | **Crítica** | ✅ Concluída |
| 2 | Light/Dark mode (5) | **Alta** | ✅ Concluída |
| 3 | Timeline unificada (2) | **Alta** | ✅ Concluída |
| 4 | Todo list (4) | **Alta** | Pendente |
| 5 | Lista de compras (3) | **Alta** | ✅ Concluída |
| 6 | UI/UX melhorias (6) | **Média** | Pendente |
| 7 | Dados extras (7) | **Baixa** | Pendente |

---

## Novas abas (total: 8)

```
🗺️ Timeline  ·  🗓 Roteiro  ·  🏰 Parques  ·  💰 Custos  ·  ✈️ Voos  ·  ✅ Todo  ·  🛍️ Compras  ·  👶 Malu
```

A **Timeline** vira a aba padrão (home). As outras continuam existindo para views detalhadas.
