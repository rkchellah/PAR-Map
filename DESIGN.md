# Design System Specification: The Luminous Curator

This document outlines the visual and interaction framework for a high-end SaaS dashboard. This design system moves away from generic, "out-of-the-box" UI kits, opting instead for an editorial, high-fidelity experience that prioritizes negative space, tonal depth, and sophisticated typography.

## 1. Overview & Creative North Star

**Creative North Star: The Digital Curator**
The philosophy of this design system is rooted in the "Digital Curator" concept. Like a high-end art gallery or a premium editorial magazine, the interface acts as a silent, sophisticated backdrop that elevates the user's content. 

To break the "standard SaaS template" look, we employ:
*   **Intentional Asymmetry:** Strategic use of whitespace to guide the eye, rather than filling every pixel.
*   **Tonal Architecture:** Using color shifts rather than lines to define structure.
*   **Typographic Authority:** A high-contrast scale that uses refined serifs for display and functional sans-serifs for utility.

## 2. Colors & Surface Philosophy

The palette is a sophisticated blend of cool neutrals and a high-energy primary iris (`#4a4bd7`).

### The "No-Line" Rule
Standard 1px borders are prohibited for sectioning. Structural boundaries must be defined solely through background shifts. For example, a side panel in `surface-container-low` (`#f1f4f5`) should sit directly against a `background` (`#f8f9fa`) canvas without a dividing line.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-opaque materials. 
*   **Base:** `surface` (#f8f9fa)
*   **Secondary Sections:** `surface-container-low` (#f1f4f5)
*   **Interactive Cards:** `surface-container-lowest` (#ffffff)
*   **High-Priority Overlays:** `surface-bright` (#f8f9fa)

### The Glass & Gradient Rule
To inject "soul" into the digital environment:
*   **Glassmorphism:** Floating menus and modals should utilize semi-transparent `surface-container-lowest` with a 20px-40px backdrop blur.
*   **Signature Gradients:** For primary CTAs, use a subtle linear gradient from `primary` (#4a4bd7) to `primary-container` (#7073ff) at a 135-degree angle. This prevents buttons from appearing "flat" and adds a tactile, premium finish.

## 3. Typography: The Editorial Voice

We pair **Manrope** (Display/Headlines) with **Inter** (Body/Labels) to create a balance between character and legibility.

| Level | Font | Size | Weight | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Display-LG** | Manrope | 3.5rem | 700 | Hero metrics and large-scale statements. |
| **Headline-SM** | Manrope | 1.5rem | 600 | Section headers and card titles. |
| **Title-MD** | Inter | 1.125rem | 500 | Navigation and sub-headers. |
| **Body-MD** | Inter | 0.875rem | 400 | Primary reading text; high readability. |
| **Label-SM** | Inter | 0.6875rem | 600 | Metadata, captions, and micro-copy. |

*   **Letter Spacing:** Apply -0.02em to all Headlines for a "tighter" editorial feel.
*   **Line Height:** Maintain a generous 1.6x for body text to support the "minimalist" aesthetic.

## 4. Elevation & Depth

This system rejects heavy, dark shadows in favor of **Ambient Light Layering**.

*   **Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on a `surface-container` (#ebeef0) background. The contrast alone provides the necessary elevation.
*   **Ambient Shadows:** For floating elements (Modals/Popovers), use a multi-layered shadow: 
    *   `box-shadow: 0 4px 20px rgba(45, 51, 53, 0.04), 0 12px 40px rgba(45, 51, 53, 0.08);`
    *   The shadow color is derived from `on-surface` (#2d3335) at low opacity, mimicking natural light.
*   **The Ghost Border:** If a boundary is required for accessibility, use `outline-variant` (#adb3b5) at 15% opacity. Never use 100% opaque borders.

## 5. Components

### Buttons
*   **Primary:** Gradient of `primary` to `primary-container`. Corner radius: `md` (0.75rem).
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **Tertiary:** Ghost style; text only with `primary` color, shifting to a subtle `surface-container-low` background on hover.

### Cards & Containers
*   **Rule:** Forbid divider lines within cards. 
*   **Implementation:** Use vertical whitespace (padding: 2rem) or a `surface-container-low` background block to separate header from body.
*   **Radius:** Always use `lg` (1rem) for main dashboard cards to maintain a soft, approachable feel.

### Input Fields
*   **State:** Neutral state uses `surface-container-highest` (#dee3e6) as a subtle background rather than an outline.
*   **Focus:** Transition background to `surface-container-lowest` and add a 2px "Ghost Border" of `primary` at 40% opacity.

### Navigation Rails
*   Utilize "Active State Blurring." The active menu item should not just change color, but should sit on a slightly elevated `surface-container-lowest` pill with a soft ambient shadow.

## 6. Do’s and Don’ts

### Do
*   **Do** use extreme whitespace. If a section feels crowded, double the padding.
*   **Do** use "Optical Centering." Sometimes a perfectly centered icon looks off; adjust by 1-2px for visual balance.
*   **Do** use thin, 1.5px stroke icons (e.g., Lucide or Phosphor) to match the refined typography.

### Don’t
*   **Don’t** use pure black (#000000) for text. Use `on-surface` (#2d3335) to maintain a soft, premium contrast.
*   **Don’t** use traditional "Dividers." Use a 16px or 24px gap instead.
*   **Don’t** use "Alert Red" for everything. Use the sophisticated `error` (#a8364b) for a more muted, intentional warning system.