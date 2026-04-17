// locale-utils.ts
// Utility functions for resolving locale contexts in prompts.

export interface ResolvedLocale {
    lang: string;
    langTag: string;
    isBrazil: boolean;
    regionalKey: string;
}

export function resolveLocale(locale?: string | null): ResolvedLocale {
    const loc = (locale || "es-419").toLowerCase();
    
    // Default to Spanish / Global
    let lang = "Spanish";
    let langTag = "es-419";
    let isBrazil = false;
    let regionalKey = "global";

    if (loc.startsWith("pt")) {
        lang = "Portuguese";
        langTag = "pt-BR";
        isBrazil = true;
        regionalKey = "brazil";
    } else if (loc.includes("mx")) {
        regionalKey = "mexico";
    } else if (loc.includes("co")) {
        regionalKey = "colombia";
    }
    
    return { lang, langTag, isBrazil, regionalKey };
}

export function getPillarTags(lc: ResolvedLocale) {
    if (lc.isBrazil) {
        return {
            p1: "Resiliência Linguística",
            p2: "Defesa de Valor/ROI",
            p3: "Alinhamento Cultural",
            p4: "Estrutura do Discurso"
        };
    }
    
    return {
        p1: "Resiliencia Lingüística",
        p2: "Defensa de Valor/ROI",
        p3: "Alineación Cultural",
        p4: "Estructura del Discurso"
    };
}
