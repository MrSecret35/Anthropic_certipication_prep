---
name: Fieldnotes
description: A study atlas with ultramarine ink and ruled paper.
colors:
  ultramarine: "#2544ab"
  ultramarine-hover: "#1b348f"
  blue-wash: "#e2e9ff"
  on-accent: "#ffffff"
  chart-blue: "#203da4"
  chart-ink: "#fcfcff"
  chart-label: "#dbe3ff"
  chart-grid: "#b1c3ff"
  locator-yellow: "#ffe29a"
  completion-green: "#23624d"
  completion-wash: "#e1efe9"
  error-rose: "#9d3048"
  cool-paper: "#f4f5fa"
  raised-paper: "#fdfdff"
  sidebar-paper: "#e9edf8"
  navy-ink: "#171e3b"
  muted-ink: "#515c78"
  rule-blue: "#c9d2e8"
  soft-rule: "#e4e9f6"
  night-paper: "#13192d"
  night-panel: "#1c2440"
  night-sidebar: "#10162a"
  night-ink: "#f0f2ff"
  night-muted: "#b6c0df"
  night-rule: "#404e75"
  night-accent: "#afc0ff"
  night-chart: "#202f71"
typography:
  display:
    fontFamily: "STIX Two Text, Georgia, serif"
    fontSize: "clamp(58px, 6.8vw, 90px)"
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: "-0.039em"
  headline:
    fontFamily: "STIX Two Text, Georgia, serif"
    fontSize: "clamp(32px, 3.8vw, 52px)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "STIX Two Text, Georgia, serif"
    fontSize: "25px"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "-0.035em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.95
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  badge: "4px"
  field: "5px"
  control: "6px"
  panel: "8px"
  dialog: "10px"
  plate: "12px"
  point: "50%"
spacing:
  tight: "6px"
  control: "12px"
  group: "24px"
  section: "32px"
  desktop-gutter: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
  button-primary-hover:
    backgroundColor: "{colors.ultramarine-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.navy-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
  button-small:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  button-danger:
    backgroundColor: "{colors.error-rose}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
  button-danger-outline:
    backgroundColor: "transparent"
    textColor: "{colors.error-rose}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 17px"
  number-field:
    backgroundColor: "{colors.raised-paper}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.field}"
    padding: "{spacing.control}"
  nav-current:
    backgroundColor: "{colors.blue-wash}"
    textColor: "{colors.ultramarine}"
    rounded: "{rounded.control}"
    padding: "12px 13px"
  metadata-badge:
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.badge}"
    padding: "4px 8px"
  paper-panel:
    backgroundColor: "{colors.raised-paper}"
    rounded: "{rounded.panel}"
    padding: "26px"
  domain-chart:
    backgroundColor: "{colors.chart-blue}"
    textColor: "{colors.chart-ink}"
    rounded: "{rounded.plate}"
  waypoint-selected:
    backgroundColor: "{colors.locator-yellow}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.point}"
---

# Design System — Fieldnotes

## Overview

**Creative North Star: "Study Atlas"**

Fieldnotes uses the materials of a printed atlas. A quiet paper field frames open editorial typography, precise rules and a saturated chart. The permanent desktop navigation provides a stable point of reference.

The interface gives lessons room to read and keeps practice controls compact. Charts orient learners within real study material. The cartographic mark and lettering give Fieldnotes a distinct identity.

**Key Characteristics:**

- Cool paper, navy type and ultramarine controls.
- Editorial serif titles with compact sans-serif controls.
- Flat paper surfaces, ruled indexes and numbered waypoints.
- Visible keyboard focus and paired light and dark themes.

## Colors

Cool neutrals carry the reading surface, with stronger blue reserved for interaction and the chart.

### Primary

- **Ultramarine** fills the primary button and marks selected navigation. A blue wash backs current items and a deeper ultramarine signals button hover in the light theme.
- **Chart Blue** anchors the chart. Chart Ink and Chart Label support text, while Chart Grid draws coordinate lines, contours and thin rules.

### Secondary

- **Locator Yellow** marks the dashed chart route, current or hovered waypoint, chart focus outline and lesson link.

### Tertiary

- **Completion Green** labels completed work. Its wash backs learning objectives. Error Rose marks wrong answers, urgent timing and destructive controls.

### Neutral

- **Cool Paper** is the workspace field. Raised Paper separates bounded controls and panels. Sidebar Paper identifies persistent navigation.
- **Navy Ink** carries titles and body copy. Muted Ink serves supporting text. Rule Blue defines boundaries and Soft Rule supports quieter hover and divider states.
- **Night Paper** and its panel and sidebar counterparts preserve this separation in dark mode. Pale ink and periwinkle controls carry contrast. The chart deepens to Night Chart and retains Locator Yellow.

**The Locator Rule.** Keep locator yellow inside the chart for its route, active point, keyboard focus and lesson link.

## Typography

**Display font** STIX Two Text with Georgia and serif fallbacks.

**Body and control font** DM Sans with a sans-serif fallback.

Both families ship with the app. The serif sets the reading hierarchy, while the sans-serif carries choices, labels and feedback.

### Hierarchy

- **Display** uses a large, tightly set serif for the atlas title (400, 58–90px on wide screens, 0.96 line height).
- **Headline** uses the regular serif for ordinary page titles (400, 32–52px, 1.2 line height).
- **Title** uses the regular serif for section headings (400, 25px, 1.35 line height). Chart domain names and index entries use the medium serif (500).
- **Body** uses the sans-serif for lesson paragraphs (400, 14px, 1.95 line height). The atlas introduction uses a shorter measure (44ch, 15px, 1.65 line height).
- **Label** uses the sans-serif for controls (500, 12px, 1.4 line height for standard buttons). Waypoints and index progress use tabular numerals.

**The Reading Hierarchy Rule.** Use the serif for titles and domain names. Set controls, captions and data in the sans-serif.

## Layout

The desktop shell pairs a fixed navigation rail (236px) with a centered workspace (1240px maximum width, 48px baseline side padding). The rail narrows at 1200px. At 760px and below it opens from a compact header and the workspace spans the screen. The focused exam uses a dedicated shell.

The atlas uses two columns on wide screens and stacks the introduction above the chart at 1020px and below. At 620px and below, tighter caption padding and stacked index fields preserve a readable layout. The certification index groups path name, progress and action with horizontal rules. Lesson reading uses a column of up to 720px, with a separate outline where space allows.

## Elevation & Depth

Paper tones and one-pixel rules establish separation. The modal uses an ambient shadow over a blurred backdrop. A slight shadow differentiates the selected segment from its track.

**The Flat Surface Rule.** Keep the chart, index rows and standard panels flat. Reserve shadows for the modal and the selected segment.

## Shapes

Corners are small on controls (5–6px) and slightly larger on bounded panels (8px), dialogs (10px) and the chart (12px). Circular waypoints contrast with the chart's coordinate grid. Index rows meet the paper field at fine horizontal rules.

## Components

### Buttons

- The primary button uses ultramarine fill and switches to the hover tone on pointer hover. The secondary button uses a transparent fill and a rule-colored outline, then adds a soft fill on hover.
- Standard buttons use a 6px radius, 11px by 17px padding and 42px minimum height. Small buttons reduce the minimum height to 36px. The primary atlas action uses a 44px minimum height.
- Destructive actions use Error Rose in solid and outlined variants. Disabled controls reduce opacity. Keyboard focus uses a 2px outline with a 4px offset.

### Fields and badges

- Number fields and selects use Raised Paper, a rule-colored border, 5px corners and 12px padding. The label appears above the control.
- Metadata badges use muted text (9px), a fine outline and compact padding. Keep the textual state available when a status also has an icon.

### Paper panels

- The simulator setup uses a flat panel with Raised Paper, a one-pixel rule, 8px corners and 26px internal padding. The question panel uses the same surface and outline.

### Navigation

- The rail pairs line icons with text. Items use 6px corners, 13px text and 44px minimum height. The current item adds a blue wash and heavier lettering. Hover adds a soft fill.
- The compact menu retains the navigation order. Reduced-motion preferences disable transition and entrance effects.

### Domain chart

- The chart pairs a caption and visible selection instruction with a coordinate grid, contour lines and a dashed route. Numbered buttons expose their labels and pressed state to assistive technology.
- Selecting a waypoint fills the point with Locator Yellow and updates the domain name, exam weight and lesson link below the grid. Focus inside the chart uses a yellow outline.

## Do's and Don'ts

- **Do** separate adjacent index records with rules and leave enough space for names and progress to wrap.
- **Do** pair progress and answer states with text or numbers.
- **Do** keep keyboard focus visible on paper and inside the chart.
- **Don't** add stock illustrations or charts without a study task.
- **Don't** imitate the certification provider's marks.
