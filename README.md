# Manada Peña de la Paz

## Estructura

```
anual_2026/                  → cuaderno de programas del año
  manada_2026.md
  imagenes/

campamento_2026/             → campamento 2026
  campamento_2026.md
  PLANILLA_PROGRAMA_ZONA_ 42.md

acantonamiento/              → acantonamiento agosto 2026
  index.html                 → web (portada + menú)
  planificacion/             → cronograma y fichas
  presupuesto/               → compras, lista y tickets
    tickets_compras/         → fotos de tickets
```

## Ver la web del acantonamiento

Desde la carpeta `acantonamiento` (hace falta un servidor local para cargar los `.md`):

```bash
cd acantonamiento
python3 -m http.server 8765
```

Abrí [http://localhost:8765](http://localhost:8765).
