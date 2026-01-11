# 🍎 Apple Design Guide - Financeiro v3.0

## ✨ Princípios de Design Apple

### 1. **Clareza**
- Conteúdo sempre em primeiro lugar
- Texto legível em todos os tamanhos
- Ícones precisos e lucidos
- Funcionalidade clara através do design

### 2. **Deferência**
- UI fluida e leve que não compete com conteúdo
- Bordas sutis e transparências
- Uso de blur e vibrancy
- Animações suaves e naturais

### 3. **Profundidade**
- Camadas distintas criam hierarquia
- Movimento e paralaxe criam realismo
- Transições suaves entre telas

---

## 🎨 Cores (Apple Blue)

### Primary Blue
```css
--primary: 211 100% 50%; /* #007AFF */
```

**Uso:**
- Botões primários
- Links
- Estados ativos
- Indicadores de seleção

### Light Mode
```css
--background: 0 0% 98%;    /* #FAFAFA */
--card: 0 0% 100%;         /* #FFFFFF */
--border: 0 0% 90%;        /* #E5E5E5 */
```

### Dark Mode
```css
--background: 0 0% 7%;     /* #121212 */
--card: 0 0% 10%;          /* #1A1A1A */
--border: 0 0% 18%;        /* #2E2E2E */
```

---

## 📐 Espaçamento

### Sistema 4px
```
4px  → Padding mínimo
8px  → Espaçamento entre elementos próximos
12px → Padding padrão
16px → Espaçamento entre cards
24px → Seções
32px → Grandes divisões
```

### Aplicação
```tsx
// ✅ Bom
<div className="p-4 space-y-4">

// ❌ Evitar valores aleatórios
<div className="p-3 space-y-5">
```

---

## 🔤 Tipografia

### Fonte
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text'
```

### Tamanhos
```tsx
Título Principal:    text-3xl (30px) font-bold
Título Seção:        text-2xl (24px) font-semibold
Título Card:         text-lg (18px) font-semibold
Corpo:               text-base (16px)
Descrição:           text-sm (14px) text-muted-foreground
Legenda:             text-xs (12px) text-muted-foreground
```

### Pesos
```
Regular: 400  → Texto normal
Medium:  500  → Ênfase leve
Semibold: 600 → Títulos
Bold:     700 → Destaque forte
```

---

## 🎯 Border Radius

### Sistema Apple
```css
--radius: 0.75rem; /* 12px - padrão */
```

### Aplicações
```tsx
Botões:       rounded-xl (12px)
Cards:        rounded-lg (12px)
Inputs:       rounded-xl (12px)
Sheet/Drawer: rounded-t-[20px] (topo)
Pills/Tags:   rounded-full
```

---

## 🔘 Botões

### Primary (Blue)
```tsx
<Button className="h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
  Adicionar
</Button>
```

**Características:**
- Altura: 48px (`h-12`)
- Borda: 12px (`rounded-xl`)
- Sombra: Azul suave
- Hover: 10% mais escuro

### Secondary (Outline)
```tsx
<Button
  variant="outline"
  className="h-12 rounded-xl border-2"
>
  Cancelar
</Button>
```

**Características:**
- Borda: 2px
- Sem preenchimento
- Hover: Background sutil

### Pill Buttons (Formas de Pagamento)
```tsx
<button className={`
  h-12 rounded-xl border-2 transition-all
  ${selected
    ? 'border-primary bg-primary text-white scale-95'
    : 'border-input hover:border-muted-foreground/50'
  }
`}>
  PIX
</button>
```

---

## 📋 Cards

### Design Apple
```tsx
<Card className="rounded-lg border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
  <CardContent className="p-4">
    {/* Conteúdo */}
  </CardContent>
</Card>
```

**Características:**
- Background semi-transparente
- Blur sutil (glassmorph)
- Hover: Shadow cresce
- Transição: 300ms cubic-bezier
- Bordas: 1px sólido

---

## 🔽 Sheet/Drawer

### Estrutura
```tsx
<Sheet>
  {/* Handle - barra de arraste */}
  <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />

  {/* Content */}
  <div className="rounded-t-[20px]">
    {children}
  </div>
</Sheet>
```

**Características:**
- Animação: Slide de baixo para cima
- Handle: Barra cinza de 12px
- Border radius: 20px no topo
- Backdrop: Blur + escurecimento
- Max height: 85vh

---

## 🎭 Inputs

### Text Input
```tsx
<Input
  className="h-12 rounded-xl text-base px-4"
  placeholder="Digite aqui..."
/>
```

**Características:**
- Altura: 48px
- Padding: 16px horizontal
- Fonte: 16px (evita zoom no iOS)
- Focus: Ring azul

### Currency Input
```tsx
<div className="relative">
  <span className="absolute left-4 top-1/2 -translate-y-1/2">R$</span>
  <Input
    className="h-12 pl-12 text-lg font-semibold"
    type="number"
  />
</div>
```

---

## 🏷️ Tags/Pills

### Categoria Tag
```tsx
<span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
  Alimentação
</span>
```

**Características:**
- Formato: Pill (rounded-full)
- Background: 10% opacidade da cor
- Padding: 12px horizontal, 4px vertical
- Texto: Mesmo tom da cor, bold

---

## 🎬 Animações

### Timing Functions Apple
```css
/* Entrada */
cubic-bezier(0.4, 0, 0.2, 1)  /* ease-out */

/* Saída */
cubic-bezier(0.4, 0, 1, 1)    /* ease-in */

/* Bidirection */
cubic-bezier(0.4, 0, 0.6, 1)  /* ease-in-out */
```

### Durações
```
Rápido:  150ms  → Hover, focus
Normal:  300ms  → Transições padrão
Lento:   500ms  → Mudanças grandes
```

### Exemplos
```tsx
// Hover card
className="transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"

// Fade in
className="animate-in fade-in duration-300"

// Slide up
className="animate-in slide-in-from-bottom duration-300"
```

---

## 📱 Responsividade

### Breakpoints
```
sm:  640px  → Telefones grandes
md:  768px  → Tablets
lg:  1024px → Desktops pequenos
xl:  1280px → Desktops
2xl: 1536px → Telas grandes
```

### Mobile-First
```tsx
// ✅ Correto - Mobile primeiro
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ❌ Errado - Desktop primeiro
<div className="grid grid-cols-3 lg:grid-cols-2 md:grid-cols-1">
```

---

## 🌓 Dark Mode

### Implementação
```tsx
// Automático via sistema
<ThemeProvider defaultTheme="dark" enableSystem>
```

### Variações de Cor
```tsx
// ✅ Usa variáveis CSS
<div className="bg-background text-foreground">

// ❌ Hardcoded
<div className="bg-white dark:bg-black">
```

---

## ✨ Glassmorphism

### Apple-style Blur
```tsx
<div className="glass">
  {/* background + blur automático */}
</div>
```

**CSS:**
```css
.glass {
  background: hsl(var(--background) / 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}
```

**Uso:**
- Header sticky
- Modals/Sheets
- Cards flutuantes

---

## 🎯 Estados Interativos

### Hover
```tsx
// Sutil elevation
hover:shadow-lg

// Leve movimento
hover:-translate-y-0.5

// Background
hover:bg-muted/50
```

### Active
```tsx
// Scale down (Apple-style)
active:scale-95

// Brightness
active:brightness-90
```

### Focus
```tsx
// Ring azul
focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
```

### Disabled
```tsx
disabled:opacity-50 disabled:pointer-events-none
```

---

## 📏 Componentes Comuns

### Card de Gasto
```tsx
<Card className="hover:shadow-lg transition-all duration-300">
  <CardContent className="p-4 flex items-center justify-between">
    <div className="flex-1">
      <h3 className="font-semibold text-lg">{descricao}</h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {categoria}
        </span>
        <span className="text-sm text-muted-foreground">{data}</span>
      </div>
    </div>
    <div className="text-2xl font-bold">{valor}</div>
  </CardContent>
</Card>
```

### Stats Card (Dashboard)
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Receitas
    </CardTitle>
    <TrendingUp className="h-4 w-4 text-green-500" />
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-green-500">
      R$ 5.000,00
    </div>
  </CardContent>
</Card>
```

---

## ⚡ Performance

### Otimizações Apple
- Usar `transform` e `opacity` (GPU-accelerated)
- Evitar `width`, `height` em animações
- `will-change` para animações complexas
- Lazy load imagens

```tsx
// ✅ GPU-accelerated
transform: translateY(10px)
opacity: 0.5

// ❌ Lento
top: 10px
```

---

## 🎨 Paleta Completa

### Success (Green)
```css
--success: 142 76% 36%; /* #10B981 */
```

### Warning (Orange)
```css
--warning: 38 92% 50%; /* #F59E0B */
```

### Error (Red)
```css
--destructive: 0 84% 60%; /* #EF4444 */
```

### Info (Blue)
```css
--primary: 211 100% 50%; /* #007AFF */
```

---

## 📖 Referências

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SF Pro Font](https://developer.apple.com/fonts/)
- [Apple Design Resources](https://developer.apple.com/design/resources/)

---

**Mantenha sempre:** Claridade, Elegância e Simplicidade 🍎✨
