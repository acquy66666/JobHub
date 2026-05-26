# UI/UX Design System

Lấy cảm hứng từ **Status.app** — dark theme, bold typography, gradient accent tím–xanh.

## Color Palette

```css
/* Backgrounds — tối dần */
--bg-0: #07070D   /* Nền chính, near-black */
--bg-1: #0E0E18   /* Section alternate, navbar */
--bg-2: #13131E   /* Card surface */
--bg-3: #1A1A28   /* Card hover, input */
--border: #252538 /* Đường viền mọi card/input */

/* Accent gradient — đặc trưng JobHub */
--accent-purple: #7C3AED
--accent-blue:   #3B82F6
--gradient: linear-gradient(135deg, #7C3AED, #3B82F6)

/* Text */
--t0: #F5F5FF   /* Primary — heading, body quan trọng */
--t1: #9494B0   /* Secondary — mô tả, label */
--t2: #55556A   /* Muted — placeholder, meta info */

/* Status */
--green:  #22C55E  /* Success, badge "Remote", trạng thái tốt */
--yellow: #F59E0B  /* Warning, badge "Mới đăng" */
--red:    #EF4444  /* Error, từ chối */
--pink:   #F472B6  /* Accent phụ — stats */
```

## Typography

- **Font**: Inter (Google Fonts) — import weight 300–900
- **Hero heading**: `clamp(46px, 7vw, 74px)`, `font-weight: 900`, `letter-spacing: -0.035em`
- **Section title**: `clamp(30px, 4vw, 46px)`, `font-weight: 800`, `letter-spacing: -0.03em`
- **Card title**: `16–19px`, `font-weight: 700`
- **Body / description**: `13–16px`, `font-weight: 400–500`, `line-height: 1.65–1.75`
- **Badge / label**: `11–13px`, `font-weight: 500–600`

## Component Patterns

### Card
```css
background: var(--bg-2);
border: 1px solid var(--border);
border-radius: 15–20px;
/* Hover: */
border-color: rgba(124, 58, 237, 0.38);
transform: translateY(-2px);
box-shadow: 0 14px 48px rgba(0,0,0,0.3);
```

### Button Primary
```css
background: linear-gradient(135deg, #7C3AED, #3B82F6);
color: #fff;
border-radius: 10–12px;
box-shadow: 0 4px 22px rgba(124, 58, 237, 0.35);
/* Hover: translateY(-1px), shadow tăng */
```

### Button Ghost
```css
background: transparent;
border: 1px solid var(--border);
color: var(--t1);
```

### Badge
```css
/* Type */   background: rgba(124,58,237,.12); color: #B09BF8; border: 1px solid rgba(124,58,237,.2);
/* Remote */ background: rgba(59,130,246,.12);  color: #60A5FA; border: 1px solid rgba(59,130,246,.2);
/* Salary */ background: rgba(34,197,94,.10);   color: #4ADE80; border: 1px solid rgba(34,197,94,.2);
/* New */    background: rgba(245,158,11,.12);  color: #FCD34D; border: 1px solid rgba(245,158,11,.2);
border-radius: 7px; padding: 4px 10px; font-size: 11px;
```

### Section Tag (label nhỏ trên heading)
```css
background: rgba(124,58,237,.1);
border: 1px solid rgba(124,58,237,.22);
color: #B09BF8;
border-radius: 100px;
padding: 6px 14px;
font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
```

### Input / Search
```css
background: var(--bg-2);
border: 1px solid var(--border);
border-radius: 14px;
/* Focus: */
border-color: rgba(124,58,237,.5);
box-shadow: 0 0 0 3px rgba(124,58,237,.1);
```

### Navbar
```css
position: fixed;
backdrop-filter: blur(24px);
background: rgba(7,7,13,.8);
border-bottom: 1px solid rgba(37,37,56,.7);
height: 64px;
```

## Gradient Text
```css
background: linear-gradient(135deg, #7C3AED, #3B82F6);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

## Glow / Radial Background Effect
```css
/* Đặt absolute trong hero hoặc CTA section */
background: radial-gradient(ellipse, rgba(124,58,237,.18) 0%, transparent 68%);
```
