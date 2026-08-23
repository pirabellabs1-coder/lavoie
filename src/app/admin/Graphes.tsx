/**
 * Les graphiques du tableau de bord.
 *
 * Tout est rendu côté serveur, en SVG : pas une ligne de JavaScript envoyée au
 * navigateur pour dessiner une courbe, et le survol lui-même tient en CSS.
 *
 * Les règles suivies ici, une fois pour toutes :
 *
 *   · une série unique n'a pas de légende — le titre dit déjà ce qui est tracé ;
 *   · on n'étiquette pas chaque point, seulement le dernier et le maximum ;
 *   · des catégories sans ordre naturel (les sources) prennent toutes la même
 *     couleur : la longueur de la barre porte déjà la valeur ;
 *   · des catégories ordonnées (l'entonnoir) prennent une rampe d'une seule
 *     teinte, du clair au foncé, dans l'ordre du parcours ;
 *   · le texte ne porte jamais la couleur de la donnée.
 */

const RAMPE = [
  "var(--adm-d1)",
  "var(--adm-d2)",
  "var(--adm-d3)",
  "var(--adm-d4)",
  "var(--adm-d5)",
  "var(--adm-d6)",
  "var(--adm-d7)",
];

/** Arrondit vers le haut à un palier lisible (1, 2, 5, 10, 20, 50…). */
function plafond(valeur: number): number {
  if (valeur <= 5) return Math.max(1, valeur);
  const magnitude = Math.pow(10, Math.floor(Math.log10(valeur)));
  for (const pas of [1, 2, 2.5, 5, 10]) {
    const candidat = pas * magnitude;
    if (candidat >= valeur) return candidat;
  }
  return 10 * magnitude;
}

function jourCourt(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ─── Courbe des inscriptions ────────────────────────────────────────────────

export function CourbeInscriptions({
  points,
}: {
  points: { jour: string; n: number }[];
}) {
  if (points.length < 2) {
    return <p className="adm-vide">Pas encore assez de jours pour tracer une courbe.</p>;
  }

  const L = 720;
  const H = 200;
  const marge = { haut: 18, bas: 26, gauche: 30, droite: 14 };
  const largeur = L - marge.gauche - marge.droite;
  const hauteur = H - marge.haut - marge.bas;

  const max = plafond(Math.max(...points.map((p) => p.n), 1));
  const x = (i: number) => marge.gauche + (i / (points.length - 1)) * largeur;
  const y = (n: number) => marge.haut + hauteur - (n / max) * hauteur;

  const ligne = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.n).toFixed(1)}`).join(" ");
  const aire = `${ligne} L${x(points.length - 1).toFixed(1)},${marge.haut + hauteur} L${x(0).toFixed(1)},${marge.haut + hauteur} Z`;

  const dernier = points[points.length - 1];
  const graduations = [0, max / 2, max];

  return (
    <svg
      className="adm-graphe"
      viewBox={`0 0 ${L} ${H}`}
      role="img"
      aria-label={`Inscriptions par jour sur ${points.length} jours. Dernier jour : ${dernier.n}.`}
    >
      {graduations.map((g) => (
        <g key={g}>
          <line className="grille" x1={marge.gauche} x2={L - marge.droite} y1={y(g)} y2={y(g)} />
          <text className="axe" x={marge.gauche - 8} y={y(g) + 3.5} textAnchor="end">
            {Math.round(g)}
          </text>
        </g>
      ))}

      <path className="lavis" d={aire} />
      <path className="ligne" d={ligne} />

      {points.map((p, i) => {
        // Une colonne de touche large : viser un point de 4 px à la souris est
        // hostile, viser sa colonne ne l'est pas.
        const pas = largeur / (points.length - 1);
        const infoADroite = i < points.length - 4;
        return (
          <g className="point" key={p.jour} tabIndex={0}>
            <rect
              className="touche"
              x={x(i) - pas / 2}
              y={marge.haut}
              width={pas}
              height={hauteur}
            />
            <g className="repere">
              <line x1={x(i)} x2={x(i)} y1={marge.haut} y2={marge.haut + hauteur} />
              <circle cx={x(i)} cy={y(p.n)} r={4.5} />
              <rect
                x={infoADroite ? x(i) + 8 : x(i) - 116}
                y={Math.max(marge.haut, y(p.n) - 30)}
                width={108}
                height={22}
              />
              <text
                x={infoADroite ? x(i) + 16 : x(i) - 108}
                y={Math.max(marge.haut, y(p.n) - 30) + 15}
              >
                {jourCourt(p.jour)} · {p.n} inscrit{p.n > 1 ? "s" : ""}
              </text>
            </g>
          </g>
        );
      })}

      <circle className="bout" cx={x(points.length - 1)} cy={y(dernier.n)} r={4.5} />

      <text className="axe" x={marge.gauche} y={H - 6}>
        {jourCourt(points[0].jour)}
      </text>
      <text className="axe" x={L - marge.droite} y={H - 6} textAnchor="end">
        {jourCourt(dernier.jour)}
      </text>
    </svg>
  );
}

// ─── Entonnoir ──────────────────────────────────────────────────────────────

export function Entonnoir({
  etages,
}: {
  etages: { cle: string; label: string; n: number }[];
}) {
  const max = Math.max(1, ...etages.map((e) => e.n));
  const total = etages.reduce((s, e) => s + e.n, 0);

  return (
    <div className="adm-entonnoir">
      {etages.map((e, i) => (
        <div className="adm-etage" key={e.cle}>
          <span className="nom">{e.label}</span>
          <div className="piste">
            <i
              style={{
                width: `${Math.max(2, (e.n / max) * 100)}%`,
                background: RAMPE[Math.min(i, RAMPE.length - 1)],
              }}
            />
          </div>
          <span className="val">{e.n}</span>
          <span className="part">{total ? `${Math.round((e.n / total) * 100)} %` : "—"}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Barres horizontales ────────────────────────────────────────────────────

export function Barres({
  lignes,
  vide,
}: {
  lignes: { nom: string; n: number }[];
  vide: string;
}) {
  if (lignes.length === 0) return <p className="adm-vide">{vide}</p>;
  const max = Math.max(1, ...lignes.map((l) => l.n));

  return (
    <div className="adm-barres">
      {lignes.map((l) => (
        <div className="adm-barre" key={l.nom}>
          <span className="nom">{l.nom}</span>
          <span className="val">{l.n}</span>
          <div className="piste">
            <i style={{ width: `${Math.max(2, (l.n / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tuile de chiffre ───────────────────────────────────────────────────────

export function Tuile({
  label,
  valeur,
  detail,
  delta,
  serie,
}: {
  label: string;
  valeur: number | string;
  detail?: string;
  /** Écart en pourcentage face à la période précédente. */
  delta?: number | null;
  /** Douze points pour l'esquisse de tendance. */
  serie?: number[];
}) {
  const sens = delta == null ? null : delta > 2 ? "haut" : delta < -2 ? "bas" : "plat";

  return (
    <div className="adm-carte adm-kpi">
      <span className="l">{label}</span>
      <span className="n">{valeur}</span>
      {detail && <span className="s">{detail}</span>}
      {sens && (
        <span className="adm-delta" data-sens={sens}>
          {delta! > 0 ? "▲" : delta! < 0 ? "▼" : "="} {Math.abs(Math.round(delta!))} %
          <span style={{ fontWeight: 500, opacity: 0.75 }}>vs 30 j avant</span>
        </span>
      )}
      {serie && serie.length > 1 && <Esquisse points={serie} />}
    </div>
  );
}

/** Esquisse de tendance — pas d'axes, pas de valeurs : une silhouette. */
function Esquisse({ points }: { points: number[] }) {
  const L = 120;
  const H = 26;
  const max = Math.max(...points, 1);
  const x = (i: number) => (i / (points.length - 1)) * L;
  const y = (n: number) => H - (n / max) * (H - 3) - 1.5;
  const d = points.map((n, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(n).toFixed(1)}`).join(" ");

  return (
    <svg
      className="adm-graphe"
      viewBox={`0 0 ${L} ${H}`}
      style={{ marginTop: 10, height: 26 }}
      aria-hidden="true"
    >
      <path className="lavis" d={`${d} L${L},${H} L0,${H} Z`} />
      <path className="ligne" d={d} style={{ strokeWidth: 1.5 }} />
      <circle className="bout" cx={x(points.length - 1)} cy={y(points[points.length - 1])} r={3} />
    </svg>
  );
}

// ─── Jauge ──────────────────────────────────────────────────────────────────

export function Jauge({ part }: { part: number }) {
  return (
    <div className="adm-jauge" role="presentation">
      <i style={{ width: `${Math.max(0, Math.min(100, part))}%` }} />
    </div>
  );
}
