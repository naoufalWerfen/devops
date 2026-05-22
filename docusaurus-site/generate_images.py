#!/usr/bin/env python3
"""Generate landing page images using OpenAI DALL-E API."""
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

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "img", "landing")
os.makedirs(OUTPUT_DIR, exist_ok=True)

PROMPTS = {
    "hero": (
        "Professional photograph of a modern clinical laboratory with a female scientist in a white lab coat "
        "analyzing blood samples on an advanced in-vitro diagnostic analyzer. Bright, clean environment with "
        "soft lighting. Corporate healthcare photography style, high quality, no text overlays."
    ),
    "innovation": (
        "Close-up professional photograph of a DNA double helix molecular structure with a modern research "
        "microscope and genomic sequencing equipment in background. Blue and orange accent lighting. "
        "Scientific research photography, high quality, no text."
    ),
    "global": (
        "Aerial photograph of a modern corporate headquarters building with glass facade surrounded by "
        "landscaped grounds. Professional architectural photography, blue sky, warm golden hour lighting. "
        "No text overlays."
    ),
    "products": (
        "Professional product photograph of a modern automated clinical chemistry analyzer machine in a "
        "hospital laboratory setting. Clean white background with subtle blue accents. Medical device "
        "photography style, high quality, no text."
    ),
}


def generate_image(name, prompt):
    """Call DALL-E API and save image."""
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

            # Handle both URL and base64 responses
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
    print("Generating landing page images with DALL-E 3...")
    print(f"Output: {OUTPUT_DIR}\n")

    results = {}
    for name, prompt in PROMPTS.items():
        results[name] = generate_image(name, prompt)

    print("\n--- Summary ---")
    for name, ok in results.items():
        status = "✓" if ok else "✗"
        print(f"  {status} {name}.png")

    if all(results.values()):
        print("\nAll images generated! Update landing.js to use them.")
    else:
        print("\nSome images failed. Re-run to retry (existing ones will be skipped).")


if __name__ == "__main__":
    main()
