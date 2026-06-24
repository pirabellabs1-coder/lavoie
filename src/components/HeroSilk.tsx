/**
 * Fond du hero d'accueil : un bleu marine profond traversé par un drapé de
 * soie blanc (rubans fluides + dégradés pour les plis et la lumière), façon
 * tissu sur mannequin. Purement décoratif (aria-hidden), aucun texte.
 */
export default function HeroSilk() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background:
          "radial-gradient(125% 95% at 58% 16%, #1c2f8c 0%, #13226f 36%, #0b1656 66%, #070f3a 100%)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="silkFade" x1="0" y1="0" x2="0" y2="800" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.20" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="0.50" stopColor="#ffffff" stopOpacity="0.30" />
            <stop offset="0.76" stopColor="#ffffff" stopOpacity="0.07" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="silkRidge" x1="0" y1="0" x2="0" y2="800" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.28" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="0.58" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="0.85" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Pli d'ombre — donne du volume au tissu */}
        <path
          d="M 470 -80 C 610 170 400 390 560 600 C 668 740 606 860 560 940"
          fill="none"
          stroke="#070f3a"
          strokeOpacity="0.55"
          strokeWidth="170"
          strokeLinecap="round"
        />

        {/* Plis de soie */}
        <path
          d="M 560 -80 C 700 180 480 400 640 610 C 748 748 686 868 640 940"
          fill="none"
          stroke="url(#silkFade)"
          strokeOpacity="0.55"
          strokeWidth="160"
          strokeLinecap="round"
        />
        <path
          d="M 690 -80 C 798 200 612 420 762 620 C 852 752 800 868 760 940"
          fill="none"
          stroke="url(#silkFade)"
          strokeOpacity="0.42"
          strokeWidth="120"
          strokeLinecap="round"
        />
        <path
          d="M 820 -80 C 906 180 766 400 884 620 C 956 748 922 864 890 940"
          fill="none"
          stroke="url(#silkFade)"
          strokeOpacity="0.30"
          strokeWidth="88"
          strokeLinecap="round"
        />

        {/* Arête de lumière — le reflet sur le pli */}
        <path
          d="M 612 -80 C 742 190 530 410 678 612 C 770 742 712 858 676 930"
          fill="none"
          stroke="url(#silkRidge)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M 742 -80 C 842 210 660 430 798 624"
          fill="none"
          stroke="url(#silkRidge)"
          strokeOpacity="0.6"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
