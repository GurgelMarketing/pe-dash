export interface MunicipioJurisdicao {
  codigo: number;
  nome:   string;
}

export const MUNICIPIOS_JURISDICAO: MunicipioJurisdicao[] = [
  { codigo: 1500206, nome: 'Acará'                  },
  { codigo: 1500800, nome: 'Ananindeua'              },
  { codigo: 1501501, nome: 'Benevides'               },
  { codigo: 1501907, nome: 'Bujaru'                  },
  { codigo: 1502608, nome: 'Colares'                 },
  { codigo: 1502756, nome: 'Concórdia do Pará'       },
  { codigo: 1504422, nome: 'Marituba'                },
  { codigo: 1506351, nome: 'Santa Bárbara do Pará'   },
  { codigo: 1506500, nome: 'Santa Isabel do Pará'    },
  { codigo: 1507003, nome: 'Santo Antônio do Tauá'   },
  { codigo: 1507102, nome: 'São Caetano de Odivelas' },
  { codigo: 1508001, nome: 'Tomé-Açu'                },
  { codigo: 1508209, nome: 'Vigia'                   },
];

// Normaliza nome vindo da planilha para casar com a lista oficial
// Ex: "ANANINDEUA", "ananindeua", "Ananindeua" → "Ananindeua"
export function normalizarMunicipio(raw: string): string {
  const limpo = raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  const match = MUNICIPIOS_JURISDICAO.find(m => {
    const oficial = m.nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
    return oficial === limpo;
  });

  return match?.nome ?? raw.trim();
}
