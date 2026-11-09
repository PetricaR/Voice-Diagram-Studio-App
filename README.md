# Voice Diagram Studio

Speak a diagram into existence with Gemini Live, then keep talking to refine it. Every request
is a precise edit of what is on the canvas, never a redraw. Diagrams export to draw.io, and
their documentation exports to Markdown.

The app lives in [studio/](studio/):

```bash
cd studio
./studio.sh          # installs dependencies, asks for the Gemini key once, opens http://127.0.0.1:5173
./studio.sh help     # test, e2e, eval, build, key
```

See [studio/README.md](studio/README.md) for what you can ask for and how it works.
