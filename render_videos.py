#!/usr/bin/env python3
"""
PencilSTR 1080p Light Mode Video Renderer
Generates broadcast-quality MP4 launch videos for:
1. Video 1: The Institutional Debt Fund (The Sovereign Creditor)
2. Video 2: The Autonomous AI Copilot (Silicon Valley Keynote)
3. Video 3: The Curated Comp (Architectural & Hospitality Editorial)
"""

import os
import sys
import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

FONTS = {}
def get_font(size: int, mono: bool = False, bold: bool = False):
    key = (size, mono, bold)
    if key in FONTS:
        return FONTS[key]
    
    font_paths = [
        "/System/Library/Fonts/SFNSMono.ttf" if mono else ("/System/Library/Fonts/SFNS.ttf" if not bold else "/System/Library/Fonts/SFNSBold.ttf"),
        "/System/Library/Fonts/Menlo.ttc" if mono else ("/System/Library/Fonts/HelveticaNeue.ttc"),
        "/Library/Fonts/Arial.ttf"
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                f = ImageFont.truetype(p, size)
                FONTS[key] = f
                return f
            except Exception:
                pass
    f = ImageFont.load_default()
    FONTS[key] = f
    return f

def draw_header(draw, width, chapter_idx, total_chapters, chapter_title, style_name, tag):
    # Top Window Bar
    draw.rectangle([70, 60, width - 70, 130], fill=(241, 239, 235), outline=(225, 223, 216), width=2)
    # Window dots
    draw.ellipse([95, 87, 115, 107], fill=(239, 68, 68))
    draw.ellipse([125, 87, 145, 107], fill=(245, 158, 11))
    draw.ellipse([155, 87, 175, 107], fill=(16, 185, 129))

    # Brand Title
    draw.text((195, 85), "PENCILSTR // 120 FPS // LIGHT MODE", fill=(17, 17, 16), font=get_font(20, mono=True, bold=True))
    # Style Tag
    draw.text((700, 85), f"STYLE: {style_name.upper()} • {tag.upper()}", fill=(217, 119, 6), font=get_font(20, mono=True, bold=True))
    # Chapter Progress
    draw.text((width - 320, 85), f"CHAPTER {chapter_idx:02d} / {total_chapters:02d}", fill=(5, 150, 105), font=get_font(20, mono=True, bold=True))

def draw_footer_subtitle(draw, width, height, chapter_title, narration_text, style_name):
    # Floating Glassmorphic Subtitle Bar
    sub_box = [120, height - 200, width - 120, height - 80]
    draw.rectangle(sub_box, fill=(255, 255, 255), outline=(214, 212, 205), width=2)
    
    # Gold header pill
    draw.rectangle([140, height - 188, 520, height - 162], fill=(254, 243, 199))
    draw.text((150, height - 184), f"{style_name.upper()} // {chapter_title.upper()}", fill=(180, 83, 9), font=get_font(16, mono=True, bold=True))

    # Spoken narration quote (wrapped)
    words = narration_text.split()
    lines = []
    curr = []
    for w in words:
        curr.append(w)
        if len(" ".join(curr)) > 115:
            lines.append(" ".join(curr))
            curr = []
    if curr:
        lines.append(" ".join(curr))

    y = height - 150
    for line in lines[:2]:
        draw.text((140, y), f'"{line}"', fill=(17, 17, 16), font=get_font(22, bold=True))
        y += 28

def render_slide_screen(width, height, screen_key, chapter_data, style_id, style_name, tag):
    img = Image.new('RGB', (width, height), color=(249, 248, 245)) # Alabaster Light Mode
    draw = ImageDraw.Draw(img)

    # Frame
    draw.rectangle([40, 40, width - 40, height - 40], outline=(229, 228, 223), width=2)
    draw_header(draw, width, chapter_data['index'], 6, chapter_data['title'], style_name, tag)

    # Main Visual Stage: 160 to height - 220
    if screen_key == 'scanner_hero':
        # Hero Headline
        draw.text((140, 170), "PENCIL ANY STR IN 3 SECONDS", fill=(17, 17, 16), font=get_font(48, bold=True))
        draw.text((140, 235), "Autonomous Listing Ingestion • MLS / Airbnb URL Resolution • Sub-400ms Pipeline", fill=(102, 101, 98), font=get_font(24))

        # Search Input Bar
        draw.rectangle([140, 290, width - 140, 370], fill=(255, 255, 255), outline=(17, 17, 16), width=3)
        draw.text((170, 318), "✦ https://www.airbnb.com/rooms/1084291823/luxury-smoky-chalet", fill=(17, 17, 16), font=get_font(26, mono=True))
        draw.rectangle([width - 380, 305, width - 160, 355], fill=(17, 17, 16))
        draw.text((width - 350, 320), "PENCIL DEAL →", fill=(255, 255, 255), font=get_font(20, mono=True, bold=True))

        # Ingestion Telemetry Grid
        cols = [
            ("PARCEL & TAX DISCOVERY", "County: Sevier, TN • Parcel #084-192.01", "Status: Clean Title Verified", (5, 150, 105)),
            ("HISTORICAL REVENUE CRAWL", "Trailing 12-Mo GRI: $112,400", "ADR: $485 • Occ: 63.5%", (217, 119, 6)),
            ("DEBT COVENANT HURDLE", "Modeled DSCR: 1.38x Coverage", "Min Hurdle: 1.25x [PASSED]", (5, 150, 105)),
        ]
        col_w = 510
        for i, (title, l1, l2, col) in enumerate(cols):
            bx = 140 + i * (col_w + 25)
            draw.rectangle([bx, 410, bx + col_w, 560], fill=(255, 255, 255), outline=(229, 228, 223), width=2)
            draw.text((bx + 25, 435), title, fill=(102, 101, 98), font=get_font(18, mono=True, bold=True))
            draw.text((bx + 25, 475), l1, fill=(17, 17, 16), font=get_font(22, bold=True))
            draw.text((bx + 25, 515), l2, fill=col, font=get_font(20, mono=True, bold=True))

        # Strikethrough callout
        draw.rectangle([140, 600, width - 140, 680], fill=(254, 243, 199), outline=(251, 191, 36), width=1)
        draw.text((165, 620), "INSTITUTIONAL DISCOUNT HAIRCUT APPLIED:", fill=(180, 83, 9), font=get_font(20, mono=True, bold=True))
        draw.text((165, 648), "Retail Pro-Forma: 85% Occ ($152,000 GRI)  →  Sovereign Underwriting: 63.5% Stabilized ($112,400 GRI)", fill=(17, 17, 16), font=get_font(20, mono=True))

    elif screen_key == 'autonomous_radar':
        draw.text((140, 170), "AUTONOMOUS MARKET RADAR", fill=(17, 17, 16), font=get_font(48, bold=True))
        draw.text((140, 235), "Algorithmic Clustering & Risk Scoring Across Primary STR Markets", fill=(102, 101, 98), font=get_font(24))

        # 3 Market Cards
        mkts = [
            ("SEVIER COUNTY, TN", "Smoky Mountain Chalets", "DSCR 1.42x", "Cap Rate 8.4%", "$842k Avg", "Permits: Unrestricted"),
            ("SCOTTSDALE, AZ", "Paradise Valley Villas", "DSCR 1.34x", "Cap Rate 7.8%", "$1.45M Avg", "Permits: Conditional (30d)"),
            ("GULF SHORES, AL", "Coastal Beachfront Homes", "DSCR 1.28x", "Cap Rate 7.2%", "$1.12M Avg", "Permits: Tier 1 Licensed"),
        ]
        col_w = 510
        for i, (mkt, sub, dscr, cap, avg, pmt) in enumerate(mkts):
            bx = 140 + i * (col_w + 25)
            draw.rectangle([bx, 290, bx + col_w, 660], fill=(255, 255, 255), outline=(229, 228, 223), width=2)
            draw.rectangle([bx, 290, bx + col_w, 350], fill=(241, 239, 235))
            draw.text((bx + 20, 310), mkt, fill=(17, 17, 16), font=get_font(20, mono=True, bold=True))
            
            draw.text((bx + 20, 375), sub, fill=(17, 17, 16), font=get_font(26, bold=True))
            draw.text((bx + 20, 420), f"Median Price: {avg}", fill=(102, 101, 98), font=get_font(20))

            draw.rectangle([bx + 20, 470, bx + col_w - 20, 530], fill=(236, 253, 245))
            draw.text((bx + 40, 488), f"Modeled Debt Coverage: {dscr}", fill=(5, 150, 105), font=get_font(22, mono=True, bold=True))

            draw.text((bx + 20, 560), f"Unlevered Yield: {cap}", fill=(17, 17, 16), font=get_font(20, mono=True))
            draw.text((bx + 20, 605), f"Zoning Status: {pmt}", fill=(217, 119, 6), font=get_font(18, mono=True, bold=True))

    elif screen_key == 'muse_comps':
        draw.text((140, 170), "MUSE SPATIAL COMPS & CC&R CITATIONS", fill=(17, 17, 16), font=get_font(48, bold=True))
        draw.text((140, 235), "Full-Bleed 16:10 Photography Cards Paired with Verbatim Deed Audits", fill=(102, 101, 98), font=get_font(24))

        # Two Large Comp Cards
        draw.rectangle([140, 290, 920, 660], fill=(255, 255, 255), outline=(229, 228, 223), width=2)
        draw.rectangle([160, 310, 900, 480], fill=(230, 228, 220)) # Image area
        # Badges
        draw.rectangle([180, 330, 330, 370], fill=(17, 17, 16))
        draw.text((195, 340), "DSCR 1.38x", fill=(5, 150, 105), font=get_font(20, mono=True, bold=True))
        draw.rectangle([345, 330, 465, 370], fill=(17, 17, 16))
        draw.text((360, 340), "$485/nt", fill=(255, 255, 255), font=get_font(20, mono=True, bold=True))
        draw.rectangle([740, 330, 880, 370], fill=(5, 150, 105))
        draw.text((755, 340), "VERIFIED", fill=(255, 255, 255), font=get_font(18, mono=True, bold=True))

        draw.text((160, 500), "Smoky Mountain Vista Chalet", fill=(17, 17, 16), font=get_font(26, bold=True))
        draw.text((160, 535), "Gatlinburg, TN • 4 Bed • 4 Bath • 3,200 SqFt • Mountain Panorama", fill=(102, 101, 98), font=get_font(18))
        draw.rectangle([160, 575, 900, 640], fill=(236, 253, 245), outline=(209, 250, 229), width=1)
        draw.text((175, 595), "Deed Citation: Res. 2021-08 allows STR w/ zero occupancy caps.", fill=(5, 150, 105), font=get_font(18, mono=True, bold=True))

        # Comp Card 2
        draw.rectangle([960, 290, width - 140, 660], fill=(255, 255, 255), outline=(229, 228, 223), width=2)
        draw.rectangle([980, 310, width - 160, 480], fill=(230, 228, 220))
        draw.rectangle([1000, 330, 1150, 370], fill=(17, 17, 16))
        draw.text((1015, 340), "DSCR 1.29x", fill=(5, 150, 105), font=get_font(20, mono=True, bold=True))
        draw.rectangle([1165, 330, 1285, 370], fill=(17, 17, 16))
        draw.text((1180, 340), "$620/nt", fill=(255, 255, 255), font=get_font(20, mono=True, bold=True))
        draw.rectangle([width - 320, 330, width - 180, 370], fill=(217, 119, 6))
        draw.text((width - 305, 340), "CONDITIONAL", fill=(255, 255, 255), font=get_font(18, mono=True, bold=True))

        draw.text((980, 500), "Scottsdale Desert Oasis Retreat", fill=(17, 17, 16), font=get_font(26, bold=True))
        draw.text((980, 535), "Scottsdale, AZ • 5 Bed • 4.5 Bath • 4,100 SqFt • Heated Pool & Spa", fill=(102, 101, 98), font=get_font(18))
        draw.rectangle([980, 575, width - 160, 640], fill=(254, 243, 199), outline=(251, 191, 36), width=1)
        draw.text((995, 595), "HOA Citation: Bylaws Art. IV §2: 30-day minimum unless permit on file.", fill=(180, 83, 9), font=get_font(18, mono=True, bold=True))

    elif screen_key == 'underwriter_studio':
        draw.text((140, 170), "DETERMINISTIC DUAL DSCR ENGINE", fill=(17, 17, 16), font=get_font(48, bold=True))
        draw.text((140, 235), "Sub-Millisecond Modeling: Non-QM Residential vs Commercial Fund NOI", fill=(102, 101, 98), font=get_font(24))

        # Financial Metrics Bar
        mets = [
            ("GROSS RENTAL INCOME", "$112,400", "+12.4% vs Baseline"),
            ("NET OPERATING INCOME", "$72,400", "64.4% Margin"),
            ("ANNUAL DEBT SERVICE", "$52,460", "6.85% / 30-Yr Fixed"),
            ("DEBT COVERAGE RATIO", "1.38x", "APPROVED (> 1.25x)"),
        ]
        m_w = 380
        for i, (title, val, sub) in enumerate(mets):
            bx = 140 + i * (m_w + 20)
            is_dscr = (i == 3)
            draw.rectangle([bx, 290, bx + m_w, 420], fill=(255, 255, 255), outline=(5, 150, 105) if is_dscr else (229, 228, 223), width=3 if is_dscr else 2)
            draw.text((bx + 20, 310), title, fill=(5, 150, 105) if is_dscr else (102, 101, 98), font=get_font(16, mono=True, bold=True))
            draw.text((bx + 20, 340), val, fill=(5, 150, 105) if is_dscr else (17, 17, 16), font=get_font(40, bold=True))
            draw.text((bx + 20, 385), sub, fill=(5, 150, 105) if is_dscr else (102, 101, 98), font=get_font(16, mono=True))

        # 2D Sensitivity Matrix Heatmap
        draw.rectangle([140, 450, width - 140, 660], fill=(255, 255, 255), outline=(229, 228, 223), width=2)
        draw.text((170, 475), "STOCHASTIC 2D SENSITIVITY MATRIX (+300bps INTEREST RATE SHOCK vs SEASONAL OCCUPANCY)", fill=(17, 17, 16), font=get_font(20, mono=True, bold=True))

        # Heatmap grid
        rates = ["Base (6.85%)", "+100bps (7.85%)", "+200bps (8.85%)", "+300bps (9.85%)"]
        occs = ["68% Occ", "62% Occ", "55% Occ", "48% Occ (Break-Even)"]
        grid_data = [
            ["1.48x", "1.39x", "1.32x", "1.25x"],
            ["1.38x", "1.31x", "1.25x", "1.19x"],
            ["1.26x", "1.20x", "1.14x", "1.08x"],
            ["1.12x", "1.06x", "1.01x", "0.95x"],
        ]

        start_x = 350
        start_y = 510
        cell_w = 280
        cell_h = 32

        for ci, occ in enumerate(occs):
            draw.text((170, start_y + ci * cell_h + 5), occ, fill=(102, 101, 98), font=get_font(16, mono=True, bold=True))

        for ri, rate in enumerate(rates):
            draw.text((start_x + ri * cell_w + 30, start_y - 28), rate, fill=(17, 17, 16), font=get_font(16, mono=True, bold=True))
            for ci, occ in enumerate(occs):
                val = grid_data[ci][ri]
                val_f = float(val.replace("x", ""))
                bg = (236, 253, 245) if val_f >= 1.25 else ((254, 243, 199) if val_f >= 1.10 else (255, 228, 230))
                fg = (5, 150, 105) if val_f >= 1.25 else ((217, 119, 6) if val_f >= 1.10 else (225, 29, 72))
                draw.rectangle([start_x + ri * cell_w, start_y + ci * cell_h, start_x + (ri + 1) * cell_w - 10, start_y + (ci + 1) * cell_h - 4], fill=bg)
                draw.text((start_x + ri * cell_w + 50, start_y + ci * cell_h + 4), f"{val} COVERAGE", fill=fg, font=get_font(16, mono=True, bold=True))

    elif screen_key == 'agent_team':
        draw.text((140, 170), "SCRIBE MULTI-AGENT WAR ROOM", fill=(17, 17, 16), font=get_font(48, bold=True))
        draw.text((140, 235), "Four Autonomous Specialized AI Agents Collaborating Across WebSocket Mesh", fill=(102, 101, 98), font=get_font(24))

        # 4 Agent Cards
        agents = [
            ("ASTRA", "Lead Investment Committee Scribe", "Underwriting thesis affirmed: debt yield 8.62%, robust shoulder demand.", (5, 150, 105)),
            ("SCOUT", "Spatial Comp Verifier", "Verified 4 architectural comps within 1.2 miles. Mean ADR $485.", (217, 119, 6)),
            ("CIPHER", "Depreciation & Tax Scribe", "Bonus depreciation scheduled: $42,500 year-one cost segregation deduction.", (37, 99, 235)),
            ("LEX", "Legal & CC&R Ordinance Auditor", "County bed-tax permit verified. No deed covenant rental caps found.", (16, 185, 129)),
        ]
        ag_w = 780
        for i, (name, role, log, col) in enumerate(agents):
            col_idx = i % 2
            row_idx = i // 2
            bx = 140 + col_idx * (ag_w + 40)
            by = 290 + row_idx * 180

            draw.rectangle([bx, by, bx + ag_w, by + 160], fill=(255, 255, 255), outline=(229, 228, 223), width=2)
            draw.ellipse([bx + 20, by + 20, bx + 35, by + 35], fill=col)
            draw.text((bx + 45, by + 18), f"{name} // {role.upper()}", fill=(17, 17, 16), font=get_font(20, mono=True, bold=True))
            draw.text((bx + ag_w - 120, by + 18), "STREAMING", fill=(5, 150, 105), font=get_font(16, mono=True, bold=True))
            
            draw.rectangle([bx + 20, by + 55, bx + ag_w - 20, by + 135], fill=(249, 248, 245), outline=(235, 233, 226), width=1)
            draw.text((bx + 35, by + 75), f'"{log}"', fill=(68, 67, 64), font=get_font(18, mono=True))

        # Command Palette Dock
        draw.rectangle([140, 660, width - 140, 710], fill=(17, 17, 16))
        draw.text((170, 675), "⌘K UNIVERSAL COMMAND PALETTE", fill=(255, 255, 255), font=get_font(18, mono=True, bold=True))
        draw.text((600, 675), "Jump to any deal, agent, underwriting model, or lender export instantaneously", fill=(217, 119, 6), font=get_font(18, mono=True))

    elif screen_key == 'lender_memo':
        draw.text((140, 170), "BANKABLE CREDIT MEMORANDUM", fill=(17, 17, 16), font=get_font(48, bold=True))
        draw.text((140, 235), "1-Click Export: Investment Committee & Syndicate Debt Package", fill=(102, 101, 98), font=get_font(24))

        # Main Memorandum Document Container
        draw.rectangle([140, 290, width - 140, 680], fill=(255, 255, 255), outline=(17, 17, 16), width=3)
        # Memo Header
        draw.rectangle([140, 290, width - 140, 360], fill=(241, 239, 235))
        draw.text((170, 310), "PENCILSTR CAPITAL MARKETS // CREDIT COMMITTEE MEMORANDUM", fill=(17, 17, 16), font=get_font(22, mono=True, bold=True))
        draw.rectangle([width - 340, 305, width - 170, 345], fill=(5, 150, 105))
        draw.text((width - 315, 315), "COVENANTS APPROVED", fill=(255, 255, 255), font=get_font(16, mono=True, bold=True))

        # 4 Memo Sections
        draw.text((170, 390), "1. ASSET PROFILE: Smoky Mountain Vista Chalet (Gatlinburg, TN)", fill=(17, 17, 16), font=get_font(22, bold=True))
        draw.text((170, 425), "• Purchase Price: $840,000   • Loan Amount: $630,000 (75% LTV)   • Term: 30-Yr Fixed Non-QM", fill=(102, 101, 98), font=get_font(20, mono=True))

        draw.text((170, 480), "2. FINANCIAL SOLVENCY & DEBT COVERAGE METRICS", fill=(17, 17, 16), font=get_font(22, bold=True))
        draw.text((170, 515), "• GRI: $112,400   • NOI: $72,400   • P&I: $52,460   • DSCR: 1.38x (+0.13x cushion)   • Debt Yield: 8.62%", fill=(5, 150, 105), font=get_font(20, mono=True, bold=True))

        draw.text((170, 570), "3. LEGAL, TITLE & MUNICIPAL CC&R RESOLUTION", fill=(17, 17, 16), font=get_font(22, bold=True))
        draw.text((170, 605), "• Sevier County Res. 2021-08: Zero STR density caps or blackout periods. Bed-tax license verified.", fill=(102, 101, 98), font=get_font(20, mono=True))

        draw.rectangle([170, 635, width - 170, 670], fill=(236, 253, 245))
        draw.text((190, 642), "SIGN-OFF: Approved by PencilSTR Autonomous Scribe Mesh • Ready for Debt Syndicate Underwriting", fill=(5, 150, 105), font=get_font(18, mono=True, bold=True))

    draw_footer_subtitle(draw, width, height, chapter_data['title'], chapter_data['text'], style_name)
    return img

def render_style_video(style_id: str, script_path: Path, output_dir: Path):
    with open(script_path, 'r', encoding='utf-8') as f:
        storyboard = json.load(f)

    style_name = storyboard.get('title', 'PencilSTR Launch Video').split('—')[-1].strip()
    tag = storyboard.get('tagline', 'Institutional Debt Modeling')
    chapters = storyboard.get('chapters', [])

    print(f"\n🎬  Rendering 1080p Light Mode Video: {style_id.upper()}")
    print(f"    Style: {style_name}")
    print(f"    Chapters: {len(chapters)}")

    temp_dir = Path(tempfile.mkdtemp(prefix=f"video_render_{style_id}_"))
    clip_files = []

    try:
        width, height = 1920, 1080
        fps = 30

        for i, ch in enumerate(chapters, 1):
            ch_id = ch['id']
            audio_stem = output_dir / f"chapter_{ch_id}_{style_id}.mp3"
            if not audio_stem.exists():
                audio_stem = Path("public/video/styles") / f"chapter_{ch_id}_{style_id}.mp3"
            if not audio_stem.exists():
                print(f"Warning: audio stem {audio_stem} not found!", file=sys.stderr)
                continue

            # Determine duration
            cmd_probe = [
                'ffprobe', '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                str(audio_stem)
            ]
            dur = float(subprocess.run(cmd_probe, capture_output=True, text=True, check=True).stdout.strip())

            # Render 1080p slide image
            slide_img = render_slide_screen(width, height, ch.get('screenKey', 'scanner_hero'), ch, style_id, style_name, tag)
            img_path = temp_dir / f"slide_{i:02d}.png"
            slide_img.save(img_path, format="PNG")

            # Render clip with subtle motion and synced audio
            clip_path = temp_dir / f"clip_{i:02d}.mp4"
            total_frames = int(dur * fps)
            cmd_clip = [
                'ffmpeg', '-y',
                '-loop', '1',
                '-t', str(dur),
                '-i', str(img_path),
                '-i', str(audio_stem),
                '-vf', f"scale=1920:1080,zoompan=z='min(zoom+0.0003,1.03)':d={total_frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps={fps}",
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-crf', '18',
                '-pix_fmt', 'yuv420p',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-shortest',
                str(clip_path)
            ]
            subprocess.run(cmd_clip, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            clip_files.append(clip_path)
            print(f"  ✓ Rendered Chapter {i:02d} ({dur:.1f}s): {ch['title']}")

        # Concatenate all clips
        concat_txt = temp_dir / "concat_list.txt"
        with open(concat_txt, 'w', encoding='utf-8') as f:
            for clip in clip_files:
                f.write(f"file '{clip.resolve()}'\n")

        final_mp4 = output_dir / f"video_{style_id}.mp4"
        cmd_concat = [
            'ffmpeg', '-y',
            '-f', 'concat', '-safe', '0',
            '-i', str(concat_txt),
            '-c', 'copy',
            str(final_mp4)
        ]
        subprocess.run(cmd_concat, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # Generate Poster frame (frame 0)
        poster_jpg = output_dir / f"poster_{style_id}.jpg"
        cmd_poster = [
            'ffmpeg', '-y',
            '-i', str(final_mp4),
            '-vframes', '1',
            '-q:v', '2',
            str(poster_jpg)
        ]
        subprocess.run(cmd_poster, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        print(f"🎉 Complete 1080p MP4 Video Rendered: {final_mp4} ({final_mp4.stat().st_size / (1024*1024):.2f} MB)")
        return final_mp4

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

def main():
    out_dir = Path("brag-output")
    out_dir.mkdir(parents=True, exist_ok=True)
    pub_dir = Path("public/video/styles")
    pub_dir.mkdir(parents=True, exist_ok=True)

    styles = [
        ("institutional", Path("brag-output/storyboards/style_1_institutional.json"), "video_1_institutional.mp4"),
        ("tech_keynote", Path("brag-output/storyboards/style_2_tech_keynote.json"), "video_2_tech_keynote.mp4"),
        ("editorial", Path("brag-output/storyboards/style_3_editorial.json"), "video_3_editorial.mp4"),
    ]

    for style_id, storyboard_path, out_name in styles:
        mp4_path = render_style_video(style_id, storyboard_path, out_dir)
        # Copy to named file and public directory
        named_path = out_dir / out_name
        shutil.copyfile(mp4_path, named_path)
        shutil.copyfile(mp4_path, pub_dir / f"video_{style_id}.mp4")

    # Copy Video 1 to brag-output/brag.mp4 as official brag deliverable
    shutil.copyfile(out_dir / "video_1_institutional.mp4", out_dir / "brag.mp4")
    shutil.copyfile(out_dir / "poster_institutional.jpg", out_dir / "brag.jpg")
    print("\n✅ All 3 Videos Successfully Rendered & Packaged!")

if __name__ == '__main__':
    main()
