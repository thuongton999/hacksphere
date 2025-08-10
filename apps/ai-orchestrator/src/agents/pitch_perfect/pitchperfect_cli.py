import argparse
import json
import os
from .pitchperfect import iterate_pitch, save_iteration


def main():
    parser = argparse.ArgumentParser(description="PitchPerfect CLI")
    parser.add_argument("--idea", required=True, help="Team idea description (text)")
    parser.add_argument("--prototype", default=None, help="Prototype description (optional)")
    parser.add_argument("--draft", default=None, help="Raw draft pitch text (optional)")
    parser.add_argument("--model", default=None, help="Model name (optional)")
    parser.add_argument("--out-dir", default="utils/pitch_guider/sessions", help="Output directory for versions")
    args = parser.parse_args()

    iteration = iterate_pitch(
        idea=args.idea,
        draft_pitch_text=args.draft,
        prototype_text=args.prototype,
        model=args.model,
    )
    out_path = save_iteration(iteration, args.out_dir)
    print(f"Saved: {out_path}")


if __name__ == "__main__":
    main()


