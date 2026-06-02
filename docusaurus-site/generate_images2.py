#!/usr/bin/env python3
"""Generate landing page images for Academia Santa Cruz barbershop."""
import os
import sys
import urllib.request
import urllib.error
import json
import base64

API_KEY = os.environ.get("OPENAI_API_KEY")
if not API_KEY:
    print("ERROR: Set OPENAI_API_KEY environment variable first")
    sys.exit(1)

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "img", "landing2")
os.makedirs(OUTPUT_DIR, exist_ok=True)

PROMPTS = {
    "hero": (
        "Cinematic photograph of a professional male barber performing a precise fade haircut "
        "on a young man in a premium modern barbershop. Dark moody interior with warm amber "
        "lighting, exposed brick walls, leather chairs. Shot from slight angle showing skilled "
        "hands with clippers. Professional barbershop photography, dramatic lighting, shallow "
        "depth of field. No text."
    ),
    "training": (
        "Professional photograph of a barbershop training class. An instructor demonstrating "
        "a haircut technique to three focused students in white aprons, in a modern academy "
        "setting with mirrors, professional stations, and good lighting. Educational "
        "atmosphere, warm tones, documentary photography style. No text."
    ),
    "tools": (
        "Elegant flat-lay product photograph of premium barbershop tools on dark slate surface. "
        "Gold scissors, black and chrome clippers, straight razor, comb, brush, and hair products "
        "arranged artistically. Dramatic overhead lighting with warm gold accents against dark "
        "background. Luxury product photography. No text."
    ),
    "result": (
        "Professional portrait photograph of a young man with a perfect modern fade haircut "
        "and styled beard, looking confident. Clean barbershop background slightly blurred. "
        "Warm amber lighting, magazine-quality portrait photography. Sharp focus on the haircut "
        "details. No text."
    ),
    "interior": (
        "Wide-angle interior photograph of a luxury modern barbershop. Dark walls with warm "
        "wood accents, vintage leather barber chairs, large mirrors with Edison bulb lighting, "
        "exposed brick, plants. Premium masculine atmosphere. Architectural interior "
        "photography with warm ambient lighting. No text, no people."
    ),
}


def generate_image(name, prompt):
    """Call OpenAI API and save image."""
    output_path = os.path.join(OUTPUT_DIR, f"{name}.png")
    if os.path.exists(output_path):
        print(f"  [SKIP] {name}.png already exists")
        return True

    print(f"  [GEN] {name}... ", end="", flush=True)

    body = json.dumps({
        "model": "gpt-image-1",
        "prompt": prompt,
        "n": 1,
        "size": "1536x1024",
        "quality": "medium",
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            item = data["data"][0]

            if "url" in item and item["url"]:
                urllib.request.urlretrieve(item["url"], output_path)
            elif "b64_json" in item:
                img_bytes = base64.b64decode(item["b64_json"])
                with open(output_path, "wb") as f:
                    f.write(img_bytes)
            else:
                print(f"FAILED: No image data in response")
                return False

        print(f"OK -> {output_path}")
        return True
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"FAILED: {e.code} {e.reason}")
        print(f"        Detail: {body[:500]}")
        return False
    except Exception as e:
        print(f"FAILED: {e}")
        return False


def main():
    print("Generating Academia Santa Cruz landing images with OpenAI...")
    print(f"Output: {OUTPUT_DIR}\n")

    results = {}
    for name, prompt in PROMPTS.items():
        results[name] = generate_image(name, prompt)

    print("\n--- Summary ---")
    for name, ok in results.items():
        status = "✓" if ok else "✗"
        print(f"  {status} {name}.png")

    if all(results.values()):
        print("\nAll images generated successfully!")
    else:
        print("\nSome images failed. Re-run to retry (existing ones will be skipped).")


if __name__ == "__main__":
    main()
