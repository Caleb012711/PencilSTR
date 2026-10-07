#!/usr/bin/env python3
"""
OpenRouter Voice Bridge CLI & Studio Audio Synthesizer
Universal speech synthesis and voiceover engine for AI agents.
Connects directly to OpenRouter Audio API with broadcast-quality mastering.
"""

import os
import sys
import json
import base64
import argparse
import subprocess
import tempfile
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, Any, List, Optional

KEY_FILE = Path(os.environ.get('OPENROUTER_KEY_FILE', str(Path.home() / '.config' / 'openrouter' / 'api_key')))


def resolve_api_key(explicit: Optional[str] = None) -> Optional[str]:
    """Key bridge: --api-key > $OPENROUTER_API_KEY > ~/.config/openrouter/api_key (chmod 600).
    Keys are never hardcoded in source so the skill can be shared/committed safely."""
    if explicit:
        return explicit.strip()
    env = os.environ.get('OPENROUTER_API_KEY')
    if env:
        return env.strip()
    try:
        if KEY_FILE.exists():
            return KEY_FILE.read_text().strip() or None
    except OSError:
        pass
    return None


DEFAULT_API_KEY = None  # deprecated: kept for backward compatibility with older imports

# Voice Style Profile Definitions
VOICE_STYLES: Dict[str, Dict[str, Any]] = {
    'institutional': {
        'name': 'The Sovereign Creditor',
        'description': 'British RP / Wall Street Private Equity & Sovereign Debt Fund (authoritative, measured)',
        'openrouter_voice': 'onyx',
        'macos_voice': 'Daniel',
        'speaking_rate': 168,
        'pitch_adjustment': 1.0,
        'ffmpeg_filters': (
            'aformat=channel_layouts=stereo,'
            'equalizer=f=120:width_type=o:width=1:g=2.5,'
            'equalizer=f=3200:width_type=o:width=1:g=1.8,'
            'loudnorm=I=-16:LRA=10:TP=-1.5'
        ),
        'bgm_tag': 'orchestral_strings',
    },
    'tech_keynote': {
        'name': 'The Autonomous Copilot',
        'description': 'Silicon Valley Tech Launch / Keynote Presenter (clear, kinetic, engaging)',
        'openrouter_voice': 'nova',
        'macos_voice': 'Samantha',
        'speaking_rate': 185,
        'pitch_adjustment': 1.02,
        'ffmpeg_filters': (
            'aformat=channel_layouts=stereo,'
            'equalizer=f=200:width_type=o:width=1:g=1.0,'
            'equalizer=f=4500:width_type=o:width=1:g=2.2,'
            'loudnorm=I=-15:LRA=9:TP=-1.2'
        ),
        'bgm_tag': 'future_bass_pulse',
    },
    'editorial': {
        'name': 'The Curated Comp',
        'description': 'High-End Architectural & Hospitality Curator (warm, refined, sophisticated)',
        'openrouter_voice': 'shimmer',
        'macos_voice': 'Karen',
        'speaking_rate': 165,
        'pitch_adjustment': 0.98,
        'ffmpeg_filters': (
            'aformat=channel_layouts=stereo,'
            'equalizer=f=140:width_type=o:width=1:g=2.0,'
            'equalizer=f=2800:width_type=o:width=1:g=1.5,'
            'loudnorm=I=-16:LRA=11:TP=-1.5'
        ),
        'bgm_tag': 'lofi_acoustic_luxury',
    },
    'quant_analyst': {
        'name': 'The Stress Test',
        'description': 'Algorithmic Quantitative Finance & Risk Stress-Tester (crisp, precise, objective)',
        'openrouter_voice': 'echo',
        'macos_voice': 'Daniel',
        'speaking_rate': 192,
        'pitch_adjustment': 0.99,
        'ffmpeg_filters': (
            'aformat=channel_layouts=stereo,'
            'equalizer=f=100:width_type=o:width=1:g=3.0,'
            'equalizer=f=3800:width_type=o:width=1:g=2.5,'
            'loudnorm=I=-15:LRA=8:TP=-1.0'
        ),
        'bgm_tag': 'sub_bass_pulse',
    },
    'tactile_craft': {
        'name': 'The Tactile Engine',
        'description': 'Minimalist Industrial Designer & Precision Engineer (deliberate, calm, authentic)',
        'openrouter_voice': 'alloy',
        'macos_voice': 'Samantha',
        'speaking_rate': 158,
        'pitch_adjustment': 0.97,
        'ffmpeg_filters': (
            'aformat=channel_layouts=stereo,'
            'equalizer=f=160:width_type=o:width=1:g=2.2,'
            'equalizer=f=3000:width_type=o:width=1:g=1.2,'
            'loudnorm=I=-16:LRA=12:TP=-1.5'
        ),
        'bgm_tag': 'minimal_ambient_ticks',
    },
}

class VoiceBridge:
    def __init__(self, api_key: Optional[str] = None, default_style: str = 'institutional'):
        self.api_key = resolve_api_key(api_key)
        self.default_style = default_style if default_style in VOICE_STYLES else 'institutional'

    def synthesize_with_openrouter(
        self,
        text: str,
        style: str,
        output_path: Path,
        model: str = 'openai/gpt-audio-mini',
        voice: Optional[str] = None,
        direction: Optional[str] = None,
    ) -> Optional[float]:
        """Synthesizes speech via OpenRouter streaming audio endpoint (PCM16 format)."""
        if not self.api_key:
            return None

        profile = VOICE_STYLES.get(style, VOICE_STYLES['institutional'])
        voice = voice or profile.get('openrouter_voice', 'alloy')
        filters = profile['ffmpeg_filters']

        url = "https://openrouter.ai/api/v1/chat/completions"
        payload = {
            "model": model,
            "stream": True,
            "modalities": ["text", "audio"],
            "audio": {"voice": voice, "format": "pcm16"},
            "messages": [
                {
                    "role": "system",
                    "content": "You are a professional voiceover narrator. Speak only the exact words requested, verbatim, with natural cadence and clear diction. Do not add, remove or comment on any words."
                    + (f" Delivery direction: {direction}" if direction else "")
                },
                {
                    "role": "user",
                    "content": f"Read this exact narration script aloud:\n{text}"
                }
            ]
        }

        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://pencilstr.internal",
                "X-Title": "PencilSTR Voice Bridge"
            }
        )

        try:
            audio_chunks = []
            with urllib.request.urlopen(req, timeout=90) as resp:
                for line in resp:
                    line_str = line.decode('utf-8').strip()
                    if not line_str or line_str == 'data: [DONE]':
                        continue
                    if line_str.startswith('data: '):
                        try:
                            chunk = json.loads(line_str[6:])
                            delta = chunk.get('choices', [{}])[0].get('delta', {})
                            if 'audio' in delta and delta['audio'].get('data'):
                                audio_chunks.append(base64.b64decode(delta['audio']['data']))
                        except Exception:
                            pass

            raw_pcm = b''.join(audio_chunks)
            if not raw_pcm:
                print(f"[OpenRouter Voice Bridge] No PCM audio chunks received for '{text[:30]}...'", file=sys.stderr)
                return None

            with tempfile.NamedTemporaryFile(suffix='.pcm', delete=False) as tmp_pcm:
                tmp_pcm.write(raw_pcm)
                pcm_path = Path(tmp_pcm.name)

            output_path.parent.mkdir(parents=True, exist_ok=True)
            cmd_ffmpeg = [
                'ffmpeg', '-y',
                '-f', 's16le', '-ar', '24000', '-ac', '1',
                '-i', str(pcm_path),
                '-af', filters,
                '-c:a', 'libmp3lame',
                '-b:a', '192k',
                str(output_path)
            ]
            subprocess.run(cmd_ffmpeg, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            # Determine duration via ffprobe
            cmd_probe = [
                'ffprobe', '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                str(output_path)
            ]
            proc = subprocess.run(cmd_probe, capture_output=True, text=True, check=True)
            duration = float(proc.stdout.strip())
            return duration

        except Exception as e:
            print(f"[OpenRouter Voice Bridge] Endpoint warning: {e}. Falling back to neural local engine.", file=sys.stderr)
            return None
        finally:
            if 'pcm_path' in locals() and pcm_path.exists():
                pcm_path.unlink()

    def synthesize_local_mastered(
        self,
        text: str,
        style: str,
        output_path: Path
    ) -> float:
        """Synthesizes voiceover locally using macOS say + studio mastering ffmpeg filter chain."""
        profile = VOICE_STYLES.get(style, VOICE_STYLES['institutional'])
        voice = profile['macos_voice']
        rate = profile['speaking_rate']
        filters = profile['ffmpeg_filters']

        with tempfile.NamedTemporaryFile(suffix='.aiff', delete=False) as tmp_aiff:
            raw_aiff_path = Path(tmp_aiff.name)

        try:
            # 1. Generate uncompressed raw voice AIFF via macOS say
            cmd_say = ['say', '-v', voice, '-r', str(rate), '-o', str(raw_aiff_path), text]
            subprocess.run(cmd_say, check=True)

            # 2. Master to stereo MP3 via ffmpeg with loudness normalization & studio EQ
            output_path.parent.mkdir(parents=True, exist_ok=True)
            cmd_ffmpeg = [
                'ffmpeg', '-y',
                '-i', str(raw_aiff_path),
                '-af', filters,
                '-c:a', 'libmp3lame',
                '-b:a', '192k',
                str(output_path)
            ]
            subprocess.run(cmd_ffmpeg, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

            # 3. Determine duration
            cmd_probe = [
                'ffprobe', '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                str(output_path)
            ]
            proc = subprocess.run(cmd_probe, capture_output=True, text=True, check=True)
            duration = float(proc.stdout.strip())
            return duration

        finally:
            if raw_aiff_path.exists():
                raw_aiff_path.unlink()

    def synthesize_text(self, text: str, style: str, output_path: Path) -> float:
        """Attempts OpenRouter synthesis first, falling back to local studio synthesis."""
        duration = self.synthesize_with_openrouter(text, style, output_path)
        if duration is not None:
            return duration
        return self.synthesize_local_mastered(text, style, output_path)

    def generate_captions(self, text: str, duration: float) -> List[Dict[str, Any]]:
        """Generates estimated word-level timestamps across the duration."""
        words = text.split()
        if not words:
            return []
        time_per_word = duration / len(words)
        captions = []
        for i, w in enumerate(words):
            start = round(i * time_per_word, 2)
            end = round((i + 1) * time_per_word, 2)
            captions.append({
                "index": i,
                "word": w,
                "start": start,
                "end": end
            })
        return captions

    def process_storyboard(
        self,
        storyboard_path: Path,
        output_dir: Path,
        override_style: Optional[str] = None
    ) -> Dict[str, Any]:
        """Processes a multi-chapter 60-second storyboard JSON file."""
        with open(storyboard_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        style = override_style or data.get('style', self.default_style)
        profile = VOICE_STYLES.get(style, VOICE_STYLES['institutional'])
        chapters = data.get('chapters', [])

        output_dir.mkdir(parents=True, exist_ok=True)
        chapter_stems = []
        full_text_parts = []

        print(f"\n🎙️  Processing Storyboard: '{data.get('title', 'Launch Video')}'")
        print(f"🎭  Voice Style: {profile['name']} ({style}) [OpenRouter: {profile.get('openrouter_voice')}]")
        print(f"📊  Chapters to render: {len(chapters)}")

        for ch in chapters:
            ch_id = ch['id']
            ch_text = ch['text']
            full_text_parts.append(ch_text)
            ch_output = output_dir / f"chapter_{ch_id}_{style}.mp3"

            duration = self.synthesize_text(ch_text, style, ch_output)
            captions = self.generate_captions(ch_text, duration)

            chapter_stems.append({
                "id": ch_id,
                "title": ch.get("title", ch_id),
                "text": ch_text,
                "visualCue": ch.get("visualCue", ""),
                "audioFile": str(ch_output.name),
                "duration": duration,
                "captions": captions
            })
            print(f"  ✓ Chapter '{ch_id}' mastered ({duration:.1f}s) -> {ch_output.name}")

        # Render full combined voiceover track by concatenating chapter stems
        full_audio_path = output_dir / f"full_voiceover_{style}.mp3"
        stem_list_file = output_dir / f"stems_{style}.txt"
        with open(stem_list_file, 'w', encoding='utf-8') as f:
            for stem in chapter_stems:
                f.write(f"file '{stem['audioFile']}'\n")

        cmd_concat = [
            'ffmpeg', '-y',
            '-f', 'concat', '-safe', '0',
            '-i', str(stem_list_file),
            '-c', 'copy',
            str(full_audio_path)
        ]
        subprocess.run(cmd_concat, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        stem_list_file.unlink()

        cmd_probe = [
            'ffprobe', '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            str(full_audio_path)
        ]
        proc = subprocess.run(cmd_probe, capture_output=True, text=True, check=True)
        total_duration = float(proc.stdout.strip())

        combined_text = " ".join(full_text_parts)
        full_captions = self.generate_captions(combined_text, total_duration)

        # Generate VTT and SRT subtitle files
        vtt_path = output_dir / f"subtitles_{style}.vtt"
        srt_path = output_dir / f"subtitles_{style}.srt"
        self._write_vtt(chapter_stems, vtt_path)
        self._write_srt(chapter_stems, srt_path)

        manifest = {
            "title": data.get("title", "PencilSTR 60s Launch Video"),
            "style": style,
            "profile": profile,
            "totalDuration": total_duration,
            "fullAudioFile": str(full_audio_path.name),
            "vttFile": str(vtt_path.name),
            "srtFile": str(srt_path.name),
            "chapters": chapter_stems,
            "captions": full_captions
        }

        manifest_path = output_dir / f"manifest_{style}.json"
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2)

        print(f"\n🎉 Successfully mastered 60s voiceover track: {full_audio_path.name} ({total_duration:.1f}s)")
        print(f"📄 Manifest written to: {manifest_path.name}")
        return manifest

    def _write_vtt(self, chapters: List[Dict[str, Any]], vtt_path: Path):
        with open(vtt_path, 'w', encoding='utf-8') as f:
            f.write("WEBVTT\n\n")
            current_time = 0.0
            for i, ch in enumerate(chapters, 1):
                start = self._format_timestamp_vtt(current_time)
                end = self._format_timestamp_vtt(current_time + ch['duration'])
                f.write(f"{i}\n{start} --> {end}\n{ch['text']}\n\n")
                current_time += ch['duration']

    def _write_srt(self, chapters: List[Dict[str, Any]], srt_path: Path):
        with open(srt_path, 'w', encoding='utf-8') as f:
            current_time = 0.0
            for i, ch in enumerate(chapters, 1):
                start = self._format_timestamp_srt(current_time)
                end = self._format_timestamp_srt(current_time + ch['duration'])
                f.write(f"{i}\n{start} --> {end}\n{ch['text']}\n\n")
                current_time += ch['duration']

    @staticmethod
    def _format_timestamp_vtt(seconds: float) -> str:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = seconds % 60
        return f"{hours:02d}:{minutes:02d}:{secs:06.3f}"

    @staticmethod
    def _format_timestamp_srt(seconds: float) -> str:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds - int(seconds)) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def main():
    parser = argparse.ArgumentParser(description="OpenRouter Voice Bridge CLI & Audio Studio Synthesizer")
    parser.add_argument("--text", type=str, help="Text to speak")
    parser.add_argument("--style", type=str, default="institutional", choices=list(VOICE_STYLES.keys()), help="Spoken style preset")
    parser.add_argument("--output", type=str, default="output.mp3", help="Output file path for standalone text")
    parser.add_argument("--script-file", type=str, help="Path to a storyboard JSON file")
    parser.add_argument("--output-dir", type=str, default="output", help="Output directory for storyboard assets")
    parser.add_argument("--api-key", type=str, default=None, help="OpenRouter API key (else $OPENROUTER_API_KEY or ~/.config/openrouter/api_key)")
    parser.add_argument("--voice", type=str, default=None, help="Override OpenRouter voice (alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer, verse)")
    parser.add_argument("--direction", type=str, default=None, help="Delivery direction appended to the narrator system prompt")
    parser.add_argument("--model", type=str, default="openai/gpt-audio-mini", help="OpenRouter audio model id")
    parser.add_argument("--no-fallback", action="store_true", help="Fail instead of falling back to macOS say")
    parser.add_argument("--list-styles", action="store_true", help="List available styles and voice profiles")

    args = parser.parse_args()

    if args.list_styles:
        print("\nAvailable Voice Styles:")
        for k, v in VOICE_STYLES.items():
            print(f"  • {k.ljust(15)} : {v['name']} ({v['description']}) [Voice: {v.get('openrouter_voice')}]")
        return

    bridge = VoiceBridge(api_key=args.api_key, default_style=args.style)

    if args.script_file:
        script_path = Path(args.script_file)
        if not script_path.exists():
            print(f"Error: Script file {script_path} not found.", file=sys.stderr)
            sys.exit(1)
        out_dir = Path(args.output_dir)
        bridge.process_storyboard(script_path, out_dir, override_style=args.style)
    elif args.text:
        out_path = Path(args.output)
        if args.voice or args.direction or args.no_fallback or args.model != 'openai/gpt-audio-mini':
            dur = bridge.synthesize_with_openrouter(args.text, args.style, out_path, model=args.model, voice=args.voice, direction=args.direction)
            if dur is None:
                if args.no_fallback:
                    print("OpenRouter synthesis failed (no fallback requested).", file=sys.stderr)
                    sys.exit(2)
                dur = bridge.synthesize_local_mastered(args.text, args.style, out_path)
        else:
            dur = bridge.synthesize_text(args.text, args.style, out_path)
        print(f"Mastered audio saved to {out_path} ({dur:.2f}s)")
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
