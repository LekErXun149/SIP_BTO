"""
Generates KeyQuest's favicon and social preview image.
Both are drawn from the site's own design tokens — no stock imagery,
so there are no licensing questions.

Run:  python3 make_images.py
"""

from PIL import Image, ImageDraw, ImageFont

# ---- design tokens, copied from css/style.css :root ----
INK       = (25, 32, 63)
DUSK_A    = (27, 35, 72)
DUSK_B    = (60, 46, 84)
DUSK_C    = (138, 79, 58)
AMBER     = (232, 154, 44)
AMBER_GLOW= (247, 200, 115)
PAPER     = (245, 241, 232)
WIN_DARK  = (26, 30, 58)
BLOCK_BG  = (42, 47, 82)
MUTED     = (199, 194, 216)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG  = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_MONO = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"


def rounded(draw, box, r, fill):
    draw.rounded_rectangle(box, radius=r, fill=fill)


def glow_window(img, box, colour, spread=3):
    """Draw a lit window with a soft amber halo around it."""
    d = ImageDraw.Draw(img, "RGBA")
    x0, y0, x1, y1 = box
    for i in range(spread, 0, -1):
        alpha = int(28 * (spread - i + 1) / spread)
        d.rounded_rectangle(
            [x0 - i * 2, y0 - i * 2, x1 + i * 2, y1 + i * 2],
            radius=3 + i,
            fill=(*AMBER_GLOW, alpha),
        )
    d.rounded_rectangle(box, radius=2, fill=colour)


# =====================================================================
# FAVICON — the key-dot mark: dark rounded square, glowing amber dot
# Must read at 16px, so it's one bold shape and nothing else.
# =====================================================================
def make_favicon(size):
    """Dark rounded tile with a glowing amber dot — the key-dot mark.
    Built on an opaque layer, with rounded corners applied as a mask at the
    end. Compositing the glow directly onto a transparent canvas eats the
    tile's opacity, so the glow gets its own layer."""
    scale = 8
    S = size * scale

    # 1. opaque base tile
    base = Image.new("RGB", (S, S), INK)

    # 2. glow on its own layer, then composited down
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    cx, cy = S / 2, S / 2
    for i in range(16, 0, -1):
        r = S * 0.17 + i * S * 0.014
        gd.ellipse([cx - r, cy - r, cx + r, cy + r],
                   fill=(*AMBER_GLOW, 10))
    base = Image.alpha_composite(base.convert("RGBA"), glow)

    # 3. the dot itself, fully opaque
    d = ImageDraw.Draw(base)
    r = S * 0.19
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=AMBER)
    r2 = S * 0.075
    off = S * 0.045
    d.ellipse([cx - r2 - off, cy - r2 - off, cx + r2 - off, cy + r2 - off],
              fill=AMBER_GLOW)

    # 4. rounded corners via a mask
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=255)
    base.putalpha(mask)

    return base.resize((size, size), Image.LANCZOS)


# =====================================================================
# SOCIAL PREVIEW — 1200x630, the block facade + name + description
# =====================================================================
def make_preview():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), DUSK_A)
    d = ImageDraw.Draw(img, "RGBA")

    # diagonal dusk gradient, matching the site's hero
    for y in range(H):
        for_t = y / H
        for x in range(0, W, 4):
            t = min(1.0, for_t * 0.72 + (x / W) * 0.42)
            if t < 0.55:
                k = t / 0.55
                c = tuple(int(DUSK_A[i] + (DUSK_B[i] - DUSK_A[i]) * k) for i in range(3))
            else:
                k = (t - 0.55) / 0.45
                c = tuple(int(DUSK_B[i] + (DUSK_C[i] - DUSK_B[i]) * k) for i in range(3))
            d.rectangle([x, y, x + 4, y + 1], fill=c)

    # ---- block facade on the right ----
    floors, cols = 6, 4
    win_w, win_h, gap = 44, 52, 13
    pad = 19
    bw = pad * 2 + cols * win_w + (cols - 1) * gap
    bh = pad * 2 + floors * win_h + (floors - 1) * gap
    bx = W - bw - 118
    by = (H - bh) // 2 + 4
    # roof cap
    d.rounded_rectangle([bx + bw * 0.2, by - 14, bx + bw * 0.8, by + 8], radius=6, fill=(32, 36, 63))
    # body
    d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=12, fill=BLOCK_BG)
    d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=12,
                        outline=(*AMBER_GLOW, 46), width=2)

    # which windows are lit — bottom 4 floors, with a couple dark for life
    dark = {(2, 2), (3, 0), (4, 3), (5, 1)}
    for f in range(floors):
        for c in range(cols):
            x0 = bx + pad + c * (win_w + gap)
            y0 = by + pad + f * (win_h + gap)
            box = [x0, y0, x0 + win_w, y0 + win_h]
            lit = f >= floors - 4 and (f, c) not in dark
            if lit:
                glow_window(img, box, AMBER)
            else:
                d.rounded_rectangle(box, radius=2, fill=WIN_DARK)
                d.rounded_rectangle(box, radius=2, outline=(255, 255, 255, 14), width=1)

    # base
    d.rounded_rectangle([bx - 6, by + bh, bx + bw + 6, by + bh + 22], radius=6, fill=(32, 36, 63))

    # ---- text on the left ----
    f_eyebrow = ImageFont.truetype(FONT_MONO, 21)
    f_title   = ImageFont.truetype(FONT_BOLD, 72)
    f_body    = ImageFont.truetype(FONT_REG, 27)
    f_foot    = ImageFont.truetype(FONT_MONO, 20)

    x = 84
    d.text((x, 128), "S I N G A P O R E  ·  H D B  B T O", font=f_eyebrow, fill=AMBER_GLOW)

    d.text((x, 178), "KeyQuest", font=f_title, fill=(243, 238, 228))

    # amber rule under the title
    d.rectangle([x, 272, x + 96, 277], fill=AMBER)

    lines = [
        "From ballot to keys,",
        "one floor at a time.",
    ]
    y = 306
    f_sub = ImageFont.truetype(FONT_BOLD, 38)
    for ln in lines:
        d.text((x, y), ln, font=f_sub, fill=AMBER)
        y += 48

    body = [
        "Check what you can afford, learn the rules",
        "that matter, and play through all six stages.",
    ]
    y += 18
    for ln in body:
        d.text((x, y), ln, font=f_body, fill=MUTED)
        y += 38

    d.text((x, 548), "keyquest  ·  affordability · journey · guide", font=f_foot,
           fill=(158, 154, 180))

    return img


if __name__ == "__main__":
    # favicons
    make_favicon(32).save("favicon-32.png")
    make_favicon(180).save("apple-touch-icon.png")
    ico = make_favicon(64)
    ico.save("favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("favicon.ico, favicon-32.png, apple-touch-icon.png")

    p = make_preview()
    p.save("preview.png", optimize=True)
    print("preview.png", p.size)
