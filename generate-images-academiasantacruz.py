#!/usr/bin/env python3
"""
Generate placeholder images for Academia Santa Cruz landing page.
Based on the photography style of https://academiasantacruz.com/

Requirements:
    pip install Pillow

Usage:
    python3 generate-images-academiasantacruz.py

This generates dark, cinematic-style placeholder images that match
the dark luxury barbershop aesthetic (gold + dark tones).

For production, replace with real photos from:
- https://academiasantacruz.com/wp-content/uploads/2025/05/IMG_5833-scaled.jpeg (hero)
- https://academiasantacruz.com/wp-content/uploads/2025/05/56976A3D-6FC1-438A-AFCC-E443B1A2028E-e1748604062374-1.jpeg (barbero)
- https://academiasantacruz.com/wp-content/uploads/2025/05/EAD09D10-485E-47BE-86A2-937945A94519.jpeg (clase)
"""

import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    print("Installing Pillow...")
    os.system(f"{sys.executable} -m pip install Pillow")
    from PIL import Image, ImageDraw, ImageFont, ImageFilter

import random
import math

# Output directory
OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "docusaurus-site", "static", "img", "academiasantacruz"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Color palette (matching the dark cinema gold aesthetic)
COLORS = {
    "black": (10, 10, 10),
    "dark": (20, 20, 20),
    "surface": (28, 28, 28),
    "gold": (201, 168, 76),
    "gold_light": (232, 212, 139),
    "gold_dark": (160, 124, 42),
    "warm_dark": (35, 25, 15),
    "warm_mid": (60, 40, 20),
}


def create_gradient(draw, width, height, color1, color2, direction="vertical"):
    """Create a smooth gradient."""
    for i in range(height if direction == "vertical" else width):
        ratio = i / (height if direction == "vertical" else width)
        r = int(color1[0] + (color2[0] - color1[0]) * ratio)
        g = int(color1[1] + (color2[1] - color1[1]) * ratio)
        b = int(color1[2] + (color2[2] - color1[2]) * ratio)
        if direction == "vertical":
            draw.line([(0, i), (width, i)], fill=(r, g, b))
        else:
            draw.line([(i, 0), (i, height)], fill=(r, g, b))


def add_noise(img, intensity=15):
    """Add subtle film grain noise."""
    pixels = img.load()
    width, height = img.size
    for _ in range(int(width * height * 0.3)):
        x = random.randint(0, width - 1)
        y = random.randint(0, height - 1)
        r, g, b = pixels[x, y]
        noise = random.randint(-intensity, intensity)
        pixels[x, y] = (
            max(0, min(255, r + noise)),
            max(0, min(255, g + noise)),
            max(0, min(255, b + noise)),
        )
    return img


def add_gold_accent(draw, width, height, style="line"):
    """Add gold accent elements."""
    gold = COLORS["gold"]
    if style == "line":
        y = int(height * 0.7)
        draw.line([(width * 0.1, y), (width * 0.4, y)], fill=gold, width=2)
    elif style == "corner":
        draw.line([(20, 20), (80, 20)], fill=gold, width=2)
        draw.line([(20, 20), (20, 80)], fill=gold, width=2)
    elif style == "circle":
        cx, cy = width // 2, height // 2
        r = min(width, height) // 6
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=gold, width=2)


def draw_scissors(draw, x, y, size, color):
    """Draw a stylized scissors icon."""
    # Simple X-shape representing scissors
    half = size // 2
    draw.line([(x - half, y - half), (x + half, y + half)], fill=color, width=3)
    draw.line([(x - half, y + half), (x + half, y - half)], fill=color, width=3)
    # Small circles at the handles
    r = size // 6
    draw.ellipse([x - half - r, y - half - r, x - half + r, y - half + r], outline=color, width=2)
    draw.ellipse([x - half - r, y + half - r, x - half + r, y + half + r], outline=color, width=2)


def draw_text_centered(draw, text, y, width, color, size=24):
    """Draw centered text (uses default font)."""
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    except (OSError, IOError):
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    x = (width - text_width) // 2
    draw.text((x, y), text, fill=color, font=font)


def draw_rounded_rect(draw, coords, radius=20, outline=None, fill=None, width=1):
    """Compatibility wrapper for rounded_rectangle."""
    try:
        draw.rounded_rectangle(coords, radius=radius, outline=outline, fill=fill, width=width)
    except AttributeError:
        draw.rectangle(coords, outline=outline, fill=fill, width=width)


def generate_hero(filename="hero.jpg"):
    """Generate hero image: dark barbershop interior with dramatic lighting."""
    width, height = 1920, 1080
    img = Image.new("RGB", (width, height), COLORS["black"])
    draw = ImageDraw.Draw(img)

    # Dark gradient background
    create_gradient(draw, width, height, (15, 10, 5), (5, 5, 5))

    # Simulated light beams from right side
    for i in range(5):
        x_start = width - 100
        y_start = random.randint(0, height // 2)
        x_end = random.randint(width // 4, width * 3 // 4)
        y_end = random.randint(height // 3, height)
        for offset in range(-20, 20):
            opacity = max(0, 30 - abs(offset))
            color = (opacity, int(opacity * 0.8), int(opacity * 0.3))
            draw.line([(x_start, y_start + offset), (x_end, y_end + offset)], fill=color)

    # Gold accent elements
    draw.rectangle([(0, height - 4), (width, height)], fill=COLORS["gold_dark"])

    # Barbershop elements (chair silhouette)
    chair_x = width * 0.6
    chair_y = height * 0.4
    # Chair back
    draw_rounded_rect(draw,
        [int(chair_x), int(chair_y), int(chair_x + 150), int(chair_y + 300)],
        radius=20, outline=COLORS["surface"], width=3
    )
    # Mirror reflection (gold tint)
    draw_rounded_rect(draw,
        [int(width * 0.3), int(height * 0.15), int(width * 0.5), int(height * 0.65)],
        radius=10, outline=COLORS["gold_dark"], width=2
    )

    # Scissors icon
    draw_scissors(draw, int(width * 0.15), int(height * 0.3), 60, COLORS["gold"])

    # Film grain
    img = add_noise(img, 12)
    img = img.filter(ImageFilter.GaussianBlur(radius=1))

    img.save(os.path.join(OUTPUT_DIR, filename), quality=85)
    print(f"  ✓ {filename} ({width}x{height})")


def generate_about(filename="about.jpg"):
    """Generate about image: interior of the academy with warm tones."""
    width, height = 1200, 900
    img = Image.new("RGB", (width, height), COLORS["dark"])
    draw = ImageDraw.Draw(img)

    # Warm gradient
    create_gradient(draw, width, height, (35, 25, 15), (15, 12, 8))

    # Simulated workstations
    for i in range(4):
        x = 100 + i * 280
        y = height * 0.4
        # Mirror
        draw_rounded_rect(draw,
            [x, int(y - 150), x + 120, int(y + 100)],
            radius=8, outline=COLORS["gold_dark"], width=2
        )
        # Counter
        draw.rectangle(
            [x - 30, int(y + 100), x + 150, int(y + 130)],
            fill=COLORS["surface"]
        )
        # Light above
        draw.ellipse(
            [x + 40, int(y - 200), x + 80, int(y - 170)],
            fill=(50, 40, 25)
        )

    # Gold accent line
    draw.line([(50, height - 60), (width - 50, height - 60)], fill=COLORS["gold"], width=1)

    img = add_noise(img, 10)
    img.save(os.path.join(OUTPUT_DIR, filename), quality=85)
    print(f"  ✓ {filename} ({width}x{height})")


def generate_gallery_image(filename, concept, width=800, height=800):
    """Generate a gallery image with a specific concept."""
    img = Image.new("RGB", (width, height), COLORS["dark"])
    draw = ImageDraw.Draw(img)

    if concept == "interior":
        # Wide shot of the academy
        create_gradient(draw, width, height, (25, 18, 10), (10, 8, 5))
        # Chairs in a row
        for i in range(3):
            x = 150 + i * 250
            draw_rounded_rect(draw,
                [x, height // 3, x + 100, int(height * 0.75)],
                radius=15, outline=COLORS["gold_dark"], width=2
            )
        add_gold_accent(draw, width, height, "line")

    elif concept == "cutting":
        # Close-up of a cutting action
        create_gradient(draw, width, height, (20, 15, 10), (8, 6, 4))
        # Stylized scissors
        draw_scissors(draw, width // 2, height // 2, 120, COLORS["gold"])
        # Hair strands effect
        for _ in range(30):
            x1 = random.randint(width // 3, width * 2 // 3)
            y1 = random.randint(height // 4, height * 3 // 4)
            length = random.randint(30, 80)
            angle = random.uniform(-0.5, 0.5)
            x2 = x1 + int(length * math.cos(angle))
            y2 = y1 + int(length * math.sin(angle))
            draw.line([(x1, y1), (x2, y2)], fill=(40, 35, 25), width=1)

    elif concept == "tools":
        # Professional tools layout
        create_gradient(draw, width, height, (18, 15, 12), (8, 7, 5))
        # Clippers silhouette
        draw_rounded_rect(draw,
            [width // 3, height // 4, width * 2 // 3, height * 3 // 4],
            radius=20, outline=COLORS["gold"], width=3
        )
        # Comb lines
        for i in range(10):
            y = height // 4 + i * 30 + 50
            draw.line(
                [(width // 3 + 20, y), (width * 2 // 3 - 20, y)],
                fill=COLORS["gold_dark"], width=1
            )
        add_gold_accent(draw, width, height, "corner")

    elif concept == "class":
        # Students learning
        create_gradient(draw, width, height, (30, 22, 12), (12, 10, 6))
        # Multiple figures (simplified)
        for i in range(3):
            cx = 200 + i * 220
            cy = height // 2
            # Head
            draw.ellipse([cx - 20, cy - 80, cx + 20, cy - 40], outline=COLORS["gold_dark"], width=2)
            # Body
            draw.line([(cx, cy - 40), (cx, cy + 40)], fill=COLORS["gold_dark"], width=2)
        add_gold_accent(draw, width, height, "circle")

    elif concept == "result":
        # Final result showcase
        create_gradient(draw, width, height, (22, 18, 12), (8, 6, 4))
        # Profile silhouette
        cx, cy = width // 2, height // 2
        # Head oval
        draw.ellipse([cx - 80, cy - 120, cx + 80, cy + 60], outline=COLORS["gold"], width=3)
        # Fade lines on side
        for i in range(15):
            y = cy - 80 + i * 8
            x_start = cx + 60 + i * 2
            draw.line([(x_start, y), (x_start + 30, y)], fill=COLORS["gold_dark"], width=1)
        add_gold_accent(draw, width, height, "corner")

    img = add_noise(img, 10)
    img.save(os.path.join(OUTPUT_DIR, filename), quality=85)
    print(f"  ✓ {filename} ({width}x{height})")


def main():
    print("\n🎨 Generating Academia Santa Cruz images...")
    print(f"   Output: {OUTPUT_DIR}\n")

    # Hero (full width, cinematic)
    generate_hero("hero.jpg")

    # About section
    generate_about("about.jpg")

    # Gallery images
    generate_gallery_image("gallery-1.jpg", "interior", 1200, 600)  # wide
    generate_gallery_image("gallery-2.jpg", "cutting", 600, 600)
    generate_gallery_image("gallery-3.jpg", "tools", 600, 600)
    generate_gallery_image("gallery-4.jpg", "class", 600, 600)
    generate_gallery_image("gallery-5.jpg", "result", 1200, 600)  # wide

    print(f"\n✅ All images generated in {OUTPUT_DIR}")
    print("\n📝 For production, replace these placeholders with real photos from:")
    print("   - academiasantacruz.com hero image")
    print("   - Interior/classroom photography")
    print("   - Haircut results close-ups")
    print("   - Professional tools flat-lay")
    print("   - Students in action shots")
    print("\n💡 Recommended AI image generation prompts:")
    print("""
   hero.jpg:
     "Professional barbershop interior, dark moody lighting, golden warm tones,
      leather barber chair, mirrors with warm LED lights, cinematic photography,
      shallow depth of field, 4K, premium barber academy"

   about.jpg:
     "Modern barbershop academy interior, multiple workstations, dark wood and
      gold accents, students learning, professional lighting, editorial photo"

   gallery-1.jpg:
     "Wide angle shot of luxury barbershop academy, multiple barber stations,
      dark interior with gold pendant lights, polished concrete floor, moody"

   gallery-2.jpg:
     "Close-up of barber performing a fade haircut, professional clippers,
      dark background, dramatic side lighting, gold reflections, editorial"

   gallery-3.jpg:
     "Professional barber tools flat lay on dark surface, gold scissors,
      vintage clippers, premium brushes, dark moody product photography"

   gallery-4.jpg:
     "Barbershop academy class in session, instructor demonstrating technique
      to students, warm lighting, dark interior, professional atmosphere"

   gallery-5.jpg:
     "Before and after men's haircut transformation, professional fade,
      dark studio background, split lighting, fashion photography style"
""")


if __name__ == "__main__":
    main()
