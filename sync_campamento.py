#!/usr/bin/env python3
"""
Sincroniza campa_de_invierno_2026-REAL.md → sitio/campamento/*.md

Uso:
    python3 sync_campamento.py
"""

SRC = "campamento_2026/campa_de_invierno_2026-REAL.md"

SECTIONS = [
    ("sitio/campamento/cronograma.md",  "# Cronograma General",    "# juegos"),
    ("sitio/campamento/juegos.md",      "# juegos",                "# SÁBADO"),
    ("sitio/campamento/actividades.md", "# SÁBADO",                "# Evaluación"),
    ("sitio/campamento/evaluacion.md",  "# Evaluación",            None),
]

with open(SRC, "r") as f:
    lines = f.readlines()

def find_line(marker):
    for i, l in enumerate(lines):
        if l.strip() == marker:
            return i
    raise ValueError(f"No se encontró la sección: '{marker}'")

for dest, start_marker, end_marker in SECTIONS:
    start = find_line(start_marker)
    end   = find_line(end_marker) if end_marker else len(lines)
    with open(dest, "w") as f:
        f.writelines(lines[start:end])
    print(f"  ✓ {dest}  ({end - start} líneas)")

print("Listo. Podés hacer commit y push.")
