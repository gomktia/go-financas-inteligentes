# 🍎 Changelog - Apple Design Update

## ✨ O Que Mudou

### 🎨 **Design System Completo Estilo Apple**

Transformei todo o design para seguir os princípios da **Apple Human Interface Guidelines**!

---

## 🆕 Novos Componentes

### 1. **Sheet/Drawer** (`components/ui/sheet.tsx`)
- ✅ Abre de baixo para cima (Apple-style)
- ✅ Handle (barra de arraste) no topo
- ✅ Backdrop com blur
- ✅ Animação suave (cubic-bezier)
- ✅ Border radius de 20px no topo
- ✅ Max height de 85vh
- ✅ Fecha ao clicar fora

**Preview:**
```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetHeader onClose={() => setOpen(false)}>
    Título
  </SheetHeader>
  <SheetContent>
    {/* Conteúdo */}
  </SheetContent>
  <SheetFooter>
    <Button>Ação</Button>
  </SheetFooter>
</Sheet>
```

### 2. **GastoSheet** (`components/gasto-sheet.tsx`)
- ✅ Substitui o modal antigo
- ✅ Design mais elegante
- ✅ Input de moeda com R$ fixo
- ✅ Botões pill para forma de pagamento
- ✅ Visual clean e minimalista

**Antes:**
```tsx
<GastoDialog /> // Modal centralizado
```

**Depois:**
```tsx
<GastoSheet /> // Drawer de baixo
```

---

## 🎨 Design System Atualizado

### **Cores Apple** (`app/globals.css`)

#### Apple Blue
```css
--primary: 211 100% 50%; /* #007AFF */
```

#### Light Mode
- Background: `#FAFAFA` (cinza muito claro)
- Cards: `#FFFFFF` (branco puro)
- Bordas: `#E5E5E5` (cinza suave)

#### Dark Mode
- Background: `#121212` (preto puro)
- Cards: `#1A1A1A` (cinza escuro)
- Bordas: `#2E2E2E` (cinza médio)

### **Tipografia San Francisco**
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text'
```

**Features:**
- ✅ Anti-aliasing perfeito
- ✅ Ligatures automáticas
- ✅ Kerning otimizado

### **Border Radius**
```css
--radius: 0.75rem; /* 12px - padrão Apple */
```

**Aplicações:**
- Botões: `rounded-xl` (12px)
- Cards: `rounded-lg` (12px)
- Sheets: `rounded-t-[20px]` (topo)
- Pills: `rounded-full`

### **Scrollbar Customizado**
- ✅ Fino (8px)
- ✅ Transparente quando não hover
- ✅ Rounded corners
- ✅ Suave no dark mode

---

## ✨ Animações Apple-Style

### **Timing Functions**
```css
cubic-bezier(0.4, 0, 0.2, 1) /* Apple ease-out */
```

### **Durações**
- Hover: 150ms
- Transições: 300ms
- Mudanças grandes: 500ms

### **Classes Utilitárias**
```tsx
.animate-in           // Fade in suave
.fade-in              // Opacidade 0 → 1
.slide-in-from-bottom // Slide de baixo
.glass                // Glassmorphism
```

---

## 📱 Componentes Atualizados

### **Botões**
```tsx
// ✅ Novo estilo
<Button className="h-12 rounded-xl shadow-lg shadow-primary/30">
  Adicionar
</Button>
```

**Mudanças:**
- Altura: 40px → 48px (`h-12`)
- Radius: 8px → 12px (`rounded-xl`)
- Shadow: Azul suave com opacidade
- Active: `scale-95` (comprime ao clicar)

### **Inputs**
```tsx
// ✅ Novo estilo
<Input className="h-12 rounded-xl text-base" />
```

**Mudanças:**
- Altura: 40px → 48px
- Radius: 8px → 12px
- Font size: 14px → 16px (evita zoom no iOS)

### **Cards**
```tsx
// ✅ Novo estilo
<Card className="rounded-lg backdrop-blur-sm hover:shadow-lg">
```

**Mudanças:**
- Blur sutil (glassmorphism)
- Hover: Shadow grows
- Transição: 300ms smooth

---

## 🔄 Migrações

### **Modal → Sheet**

**Antes:**
```tsx
// Centralizado na tela
<div className="fixed inset-0 flex items-center justify-center">
  <div className="rounded-lg p-6">
    {/* Modal */}
  </div>
</div>
```

**Depois:**
```tsx
// Drawer de baixo
<Sheet open={open} onOpenChange={setOpen}>
  <SheetHeader>Título</SheetHeader>
  <SheetContent>{/* Conteúdo */}</SheetContent>
  <SheetFooter>{/* Botões */}</SheetFooter>
</Sheet>
```

### **Botão de Forma de Pagamento**

**Antes:**
```tsx
<select>
  <option>PIX</option>
  <option>Débito</option>
</select>
```

**Depois:**
```tsx
<div className="grid grid-cols-3 gap-2">
  {TIPOS_PAGAMENTO.map((tipo) => (
    <button
      className={`
        h-12 rounded-xl border-2 transition-all
        ${selected ? 'border-primary bg-primary text-white scale-95' : ''}
      `}
    >
      {tipo}
    </button>
  ))}
</div>
```

---

## 📐 Espaçamento Apple

### **Sistema 4px**
```
Mínimo:   4px  (p-1)
Pequeno:  8px  (p-2)
Padrão:   12px (p-3)
Médio:    16px (p-4)
Grande:   24px (p-6)
XL:       32px (p-8)
```

### **Gaps**
```tsx
// Entre elementos próximos
gap-2  // 8px

// Entre cards
gap-4  // 16px

// Entre seções
gap-6  // 24px
```

---

## 🎯 Melhorias de UX

### **Feedback Visual**
- ✅ Todos os botões têm estado hover
- ✅ Active state com scale-down
- ✅ Focus ring azul visível
- ✅ Disabled com opacity 50%

### **Acessibilidade**
- ✅ Contraste WCAG AA
- ✅ Focus visible
- ✅ Keyboard navigation
- ✅ Screen reader friendly

### **Performance**
- ✅ GPU-accelerated animations (transform/opacity)
- ✅ Smooth scrolling
- ✅ Optimized re-renders

---

## 📖 Documentação Criada

### **APPLE_DESIGN_GUIDE.md**
Guia completo com:
- ✅ Princípios de design Apple
- ✅ Paleta de cores completa
- ✅ Tipografia e espaçamento
- ✅ Componentes e exemplos
- ✅ Animações e timing functions
- ✅ Boas práticas

---

## 🎨 Exemplos Visuais

### **Dashboard**
```
┌────────────────────────────────────────┐
│  Dashboard Financeiro                  │
├────────────────────────────────────────┤
│                                        │
│  ┌─────────────┐  ┌─────────────┐     │
│  │ 📈 Receitas │  │ 📉 Despesas │     │
│  │             │  │             │     │
│  │ R$ 5.000,00 │  │ R$ 3.200,00 │     │
│  │  (verde)    │  │  (vermelho) │     │
│  └─────────────┘  └─────────────┘     │
│                                        │
└────────────────────────────────────────┘
```

### **Sheet (Drawer)**
```
┌────────────────────────────────────────┐
│         Tela Principal                 │
│                                        │
│  [Backdrop com blur]                   │
│  ╔════════════════════════════════════╗│
│  ║  ─────  (handle)                   ║│
│  ║                                    ║│
│  ║  Novo Gasto                        ║│
│  ║  ────────────────────────────────  ║│
│  ║                                    ║│
│  ║  Descrição                         ║│
│  ║  [________________]                ║│
│  ║                                    ║│
│  ║  Valor                             ║│
│  ║  R$ [___________]                  ║│
│  ║                                    ║│
│  ║  [Cancelar]  [Adicionar]           ║│
│  ╚════════════════════════════════════╝│
└────────────────────────────────────────┘
```

---

## 🚀 Como Usar

### **1. Abrir Sheet**
```tsx
const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>
  Novo Gasto
</Button>

<GastoSheet open={open} onOpenChange={setOpen} />
```

### **2. Aplicar Estilo Apple**
```tsx
// Botão primário
<Button className="h-12 rounded-xl">
  Ação
</Button>

// Card elegante
<Card className="rounded-lg hover:shadow-lg transition-all">
  Conteúdo
</Card>

// Input grande
<Input className="h-12 rounded-xl text-base" />
```

### **3. Usar Glassmorphism**
```tsx
<div className="glass p-4 rounded-lg">
  {/* Background blur automático */}
</div>
```

---

## 📊 Comparação

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Modal** | Centralizado | Drawer (bottom-up) |
| **Cores** | Azul genérico | Apple Blue #007AFF |
| **Font** | Inter | SF Pro (Apple) |
| **Radius** | 8px | 12px |
| **Botões** | 40px altura | 48px altura |
| **Inputs** | 40px altura | 48px altura |
| **Animações** | Linear | Cubic-bezier Apple |
| **Scrollbar** | Padrão | Custom Apple-style |

---

## ✅ Checklist de Migração

Para migrar seus componentes para o novo design:

- [ ] Substituir modais por `<Sheet>`
- [ ] Trocar `Dialog` por `GastoSheet`
- [ ] Atualizar botões para `h-12 rounded-xl`
- [ ] Atualizar inputs para `h-12 rounded-xl`
- [ ] Usar `transition-all duration-300` em hovers
- [ ] Aplicar `active:scale-95` em botões
- [ ] Usar variáveis CSS (`--primary`, etc.)

---

## 🎉 Resultado Final

Sistema com **visual idêntico aos apps Apple**:
- ✅ Elegante e minimalista
- ✅ Animações suaves
- ✅ Feedback visual perfeito
- ✅ Dark mode impecável
- ✅ Mobile-first responsive
- ✅ Performance otimizada

---

**Feito com 🍎 seguindo Apple HIG (Human Interface Guidelines)**

**Versão:** 3.0.1 Apple Edition
**Data:** Outubro 2025
