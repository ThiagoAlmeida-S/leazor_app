// Paleta do Leazor: inspirada em equipamento de manutenção de rodovia,
// não em "dark mode tech genérico". Verde = grama/tarefa concluída com
// sucesso, âmbar = sinalização viária (atenção/em movimento), vermelho
// = emergência real de equipamento.

export const colors = {
  background: '#1B1D19', // asfalto escuro, tom quente (não preto puro)
  surface: '#24271F',
  surfaceAlt: '#2C3025',
  border: '#33372C',
  borderMuted: '#3D4133',

  grass: '#7FA65A', // verde de grama cortada — status positivo
  grassMuted: '#5C7A40',
  safety: '#E8A23D', // âmbar de sinalização viária — atenção/movimento
  danger: '#D64545', // vermelho de emergência

  textPrimary: '#F1EFE6',
  textSecondary: '#9A9C8E',
  textDisabled: '#5B5D50',
};

export const typography = {
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  label: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  body: { fontSize: 15, fontWeight: '400', color: colors.textPrimary },
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };