---
name: openrouter-voice-bridge
description: Universal OpenRouter audio & voice model bridge for AI agents. Synthesizes professional narration, dialogue, and voiceovers using OpenRouter API audio models with fallback to local high-fidelity neural audio engines (macOS say, ffmpeg loudness normalization, and web speech). Generates timed audio tracks, word-level timestamps, and subtitle files (JSON, VTT, SRT) across multiple vocal personas and creative tones.
---

# OpenRouter Voice Bridge

The `openrouter-voice-bridge` provides universal voiceover and speech synthesis capabilities for AI agents across projects. It interfaces with OpenRouter's LLM and audio endpoints, provides automated voice persona routing, and delivers mastered broadcast-quality audio stems with word-level caption timing.

## Core Capabilities

1. **OpenRouter Multimodal Voice Generation**: Connects to OpenRouter (`https://openrouter.ai/api/v1`) using available audio-capable models (e.g. `openai/gpt-4o-audio-preview`) or text-to-speech routing with custom voice parameters.
2. **Local Studio Mastering Engine**: When API keys are unconfigured or offline, seamlessly utilizes high-resolution neural speech engines (`say`, `ffmpeg`) with professional mastering filters:
   - ITU-R BS.1770-4 Loudness Normalization (`loudnorm` to -16 LUFS broadcast standard).
   - Dynamic range compression, subtle de-essing, and warmth equalization.
   - 48,000 Hz / 24-bit studio stereo rendering.
3. **5 Vocal Persona Presets**:
   - `institutional`: British RP / Wall Street Private Equity & Sovereign Debt Fund (authoritative, measured).
   - `tech_keynote`: Silicon Valley Tech Launch / Keynote Presenter (clear, kinetic, engaging).
   - `editorial`: High-End Architectural & Hospitality Curator (warm, refined, sophisticated).
   - `quant_analyst`: Algorithmic Quantitative Finance & Risk Stress-Tester (crisp, precise, objective).
   - `tactile_craft`: Minimalist Industrial Designer & Precision Engineer (deliberate, calm, authentic).
4. **Timed Subtitle & Caption Generation**: Automatically outputs synchronized word-level captions in JSON, WebVTT (`.vtt`), and SubRip (`.srt`) formats.

## CLI Usage

The bundled Python CLI tool is located at `scripts/voice_bridge.py`:

```bash
# Basic usage with text prompt
python3 <skill-dir>/scripts/voice_bridge.py \
  --text "PencilSTR is the autonomous short term rental underwriting engine." \
  --output voiceover.mp3 \
  --style institutional

# Generation using structured 60-second chapter JSON
python3 <skill-dir>/scripts/voice_bridge.py \
  --script-file script.json \
  --output-dir ./audio-stems \
  --style tech_keynote \
  --format mp3

# Specifying OpenRouter API key and custom model
python3 <skill-dir>/scripts/voice_bridge.py \
  --text "..." \
  --api-key "$OPENROUTER_API_KEY" \
  --model "openai/gpt-4o-audio-preview" \
  --voice "alloy"
```

## JSON Script Schema

For multi-chapter 60-second launch videos, provide a JSON storyboard:

```json
{
  "title": "PencilSTR 60-Second Launch Video",
  "style": "institutional",
  "chapters": [
    {
      "id": "hook",
      "startSec": 0.0,
      "endSec": 8.5,
      "text": "Every real estate investor has stared at a pro-forma spreadsheet and wondered if the numbers were real.",
      "visualCue": "Hero Alabaster Light Mode Interface"
    },
    {
      "id": "solution",
      "startSec": 8.5,
      "endSec": 20.0,
      "text": "Introducing PencilSTR. The institutional short-term rental underwriting terminal built for ruthless mathematical clarity.",
      "visualCue": "Interactive DSCR Waterfall"
    }
  ]
}
```

## Python API Integration

```python
from voice_bridge import VoiceBridge

bridge = VoiceBridge(api_key="...", default_style="institutional")
result = bridge.synthesize(
    text="DSCR ratio qualifies at 1.38x coverage.",
    style="quant_analyst",
    output_path="dscr_callout.mp3"
)
print(f"Generated {result.duration_seconds}s audio at {result.output_path}")
```
