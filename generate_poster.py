#!/usr/bin/env python3
"""
Generates high-resolution Light Mode video poster 'brag-output/brag.jpg' (1920x1080).
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

def create_poster():
    width, height = 1920, 1080
    # Alabaster Light Mode base #F9F8F5
    img = Image.new('RGB', (width, height), color=(249, 248, 245))
    draw = ImageDraw.Draw(img)

    # Hairline outer margin frame
    draw.rectangle([40, 40, width - 40, height - 40], outline=(229, 228, 223), width=2)
    # Inner bone card #F1EFEB
    draw.rectangle([70, 70, width - 70, height - 70], fill=(241, 239, 235), outline=(214, 212, 205), width=2)

    # Top Window Bar
    draw.rectangle([70, 70, width - 70, 140], fill=(234, 232, 226))
    draw.line([(70, 140), (width - 70, 140)], fill=(214, 212, 205), width=2)

    # Window dots
    draw.ellipse([100, 95, 120, 115], fill=(239, 68, 68))
    draw.ellipse([135, 95, 155, 115], fill=(245, 158, 11))
    draw.ellipse([170, 95, 190, 115], fill=(16, 185, 129))

    # Fonts fallback
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", 64)
        font_title = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", 44)
        font_body = ImageFont.truetype("/System/Library/Fonts/HelveticaNeue.ttc", 26)
        font_mono = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 22)
        font_mono_sm = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 18)
    except Exception:
        font_large = font_title = font_body = font_mono = font_mono_sm = ImageFont.load_default()

    # Top Bar Text
    draw.text((215, 93), "PENCILSTR CINEMA STUDIO // LIGHT MODE 60s REEL", fill=(17, 17, 16), font=font_mono)
    draw.text((width - 450, 93), "5 ALTERNATE STYLES • 120 FPS", fill=(217, 119, 6), font=font_mono)

    # Main Hero Title
    draw.text((120, 180), "PENCILSTR", fill=(17, 17, 16), font=font_large)
    draw.text((540, 180), "— Autonomous STR Underwriting", fill=(217, 119, 6), font=font_large)
    draw.text((120, 260), "Institutional Debt Modeling, Verbatim Deed Covenants & 4-Agent Scribe Mesh", fill=(102, 101, 98), font=font_body)

    # 3 Major Feature Pillars (Cards)
    # Pillar 1: Muse Spatial Comps
    p1_box = [120, 330, 640, 840]
    draw.rectangle(p1_box, fill=(255, 255, 255), outline=(229, 228, 223), width=2)
    draw.rectangle([120, 330, 640, 380], fill=(249, 248, 245))
    draw.text((140, 345), "01 // MUSE SPATIAL COMPS", fill=(17, 17, 16), font=font_mono)
    # Mock visual preview
    draw.rectangle([150, 410, 610, 620], fill=(230, 228, 220))
    draw.rectangle([170, 430, 310, 465], fill=(17, 17, 16))
    draw.text((180, 438), "DSCR 1.38x", fill=(5, 150, 105), font=font_mono_sm)
    draw.rectangle([440, 430, 590, 465], fill=(5, 150, 105))
    draw.text((455, 438), "VERIFIED", fill=(255, 255, 255), font=font_mono_sm)
    draw.text((150, 645), "Smoky Mountain Vista Chalet", fill=(17, 17, 16), font=font_body)
    draw.text((150, 685), "Gatlinburg, TN • 4 Bed • 4 Bath • $485/nt", fill=(102, 101, 98), font=font_mono_sm)
    draw.rectangle([150, 725, 610, 800], fill=(236, 253, 245), outline=(209, 250, 229), width=1)
    draw.text((165, 745), "CC&R Legal Audit: Res. 2021-08 allows STR", fill=(5, 150, 105), font=font_mono_sm)
    draw.text((165, 768), "with zero municipal density restrictions.", fill=(5, 150, 105), font=font_mono_sm)

    # Pillar 2: Deterministic Dual DSCR
    p2_box = [690, 330, 1230, 840]
    draw.rectangle(p2_box, fill=(255, 255, 255), outline=(229, 228, 223), width=2)
    draw.rectangle([690, 330, 1230, 380], fill=(249, 248, 245))
    draw.text((710, 345), "02 // DETERMINISTIC DUAL DSCR", fill=(17, 17, 16), font=font_mono)
    # DSCR Metric Hero
    draw.rectangle([720, 410, 1200, 530], fill=(249, 248, 245), outline=(5, 150, 105), width=2)
    draw.text((750, 430), "DEBT SERVICE COVERAGE RATIO", fill=(5, 150, 105), font=font_mono_sm)
    draw.text((750, 455), "1.38x", fill=(5, 150, 105), font=font_large)
    draw.text((950, 465), "APPROVED (> 1.25x)", fill=(5, 150, 105), font=font_body)
    # Sensitivity matrix snippet
    draw.text((720, 560), "2D Sensitivity Matrix (+200bps Rate Shock):", fill=(17, 17, 16), font=font_mono_sm)
    draw.rectangle([720, 595, 830, 645], fill=(236, 253, 245))
    draw.text((735, 610), "7.0%: 1.38x", fill=(5, 150, 105), font=font_mono_sm)
    draw.rectangle([845, 595, 955, 645], fill=(236, 253, 245))
    draw.text((860, 610), "8.0%: 1.31x", fill=(5, 150, 105), font=font_mono_sm)
    draw.rectangle([970, 595, 1080, 645], fill=(254, 243, 199))
    draw.text((985, 610), "9.0%: 1.25x", fill=(217, 119, 6), font=font_mono_sm)
    draw.rectangle([1095, 595, 1205, 645], fill=(255, 228, 230))
    draw.text((1105, 610), "10.0%: 1.19x", fill=(225, 29, 72), font=font_mono_sm)
    # Hairline text
    draw.text((720, 680), "• Gross Rental Income (GRI): $112,400", fill=(102, 101, 98), font=font_mono_sm)
    draw.text((720, 715), "• Net Operating Income (NOI): $72,400", fill=(102, 101, 98), font=font_mono_sm)
    draw.text((720, 750), "• Debt Service (P&I 30-Yr Fixed): $52,460", fill=(102, 101, 98), font=font_mono_sm)
    draw.text((720, 785), "• Free Cash Flow: $1,661/mo ($19,940/yr)", fill=(5, 150, 105), font=font_mono_sm)

    # Pillar 3: Scribe Multi-Agent War Room
    p3_box = [1280, 330, 1800, 840]
    draw.rectangle(p3_box, fill=(255, 255, 255), outline=(229, 228, 223), width=2)
    draw.rectangle([1280, 330, 1800, 380], fill=(249, 248, 245))
    draw.text((1300, 345), "03 // SCRIBE MESH WAR ROOM", fill=(17, 17, 16), font=font_mono)
    # Agents cards
    draw.rectangle([1305, 410, 1775, 495], fill=(249, 248, 245), outline=(229, 228, 223), width=1)
    draw.text((1320, 425), "ASTRA // Lead Investment Scribe", fill=(17, 17, 16), font=font_body)
    draw.text((1320, 460), "Debt yield 8.62%, thesis confirmed.", fill=(5, 150, 105), font=font_mono_sm)

    draw.rectangle([1305, 515, 1775, 600], fill=(249, 248, 245), outline=(229, 228, 223), width=1)
    draw.text((1320, 530), "SCOUT // Spatial Comp Verifier", fill=(17, 17, 16), font=font_body)
    draw.text((1320, 565), "4 comps within 1.2mi parsed & verified.", fill=(102, 101, 98), font=font_mono_sm)

    draw.rectangle([1305, 620, 1775, 705], fill=(249, 248, 245), outline=(229, 228, 223), width=1)
    draw.text((1320, 635), "CIPHER // Depreciation & Tax Scribe", fill=(17, 17, 16), font=font_body)
    draw.text((1320, 670), "$42,500 year-one cost segregation deduction.", fill=(102, 101, 98), font=font_mono_sm)

    draw.rectangle([1305, 725, 1775, 810], fill=(249, 248, 245), outline=(229, 228, 223), width=1)
    draw.text((1320, 740), "LEX // Legal Ordinance & CC&R", fill=(17, 17, 16), font=font_body)
    draw.text((1320, 775), "Permit valid. No 30-day rental minimum.", fill=(5, 150, 105), font=font_mono_sm)

    # Bottom Studio Controls Bar
    draw.rectangle([120, 880, width - 120, 970], fill=(17, 17, 16), outline=(0, 0, 0), width=1)
    draw.text((160, 910), "▶ PLAY 1-MIN REEL", fill=(255, 255, 255), font=font_body)
    draw.text((440, 913), "STYLE: The Sovereign Creditor (Daniel • British RP)", fill=(217, 119, 6), font=font_mono)
    draw.text((1150, 913), "TIME: 0:00 / 1:00 • 6 CHAPTERS", fill=(249, 248, 245), font=font_mono)
    draw.text((1550, 913), "OPENROUTER AUDIO", fill=(5, 150, 105), font=font_mono)

    # Save as brag-output/brag.jpg
    out_path = Path("brag-output/brag.jpg")
    img.save(out_path, format="JPEG", quality=95)
    print(f"✓ Successfully generated poster image at {out_path} ({width}x{height})")

if __name__ == '__main__':
    create_poster()
