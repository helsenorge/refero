module.exports = {
  extends: ['@helsenorge/eslint-config'],
  rules: {
    'react/prop-types': 0, //Gir feil i funksjonelle komponenter
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-inferrable-types': 0,
  },
};
