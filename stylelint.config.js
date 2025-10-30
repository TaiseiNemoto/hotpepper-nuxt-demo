/** @type {import('stylelint').Config} */
export default {
  /**
   * stylelint-config-standard-scss には、以下のルール群が含まれる
   * - stylelint-config-standard-scss
   *   [https://github.com/stylelint-scss/stylelint-config-standard-scss]
   * - stylelint-config-recommended-scss
   *   [https://github.com/stylelint-scss/stylelint-config-recommended-scss]
   * - stylelint-config-standard
   *   [https://github.com/stylelint/stylelint-config-standard]
   * - stylelint-config-recommended
   *   [https://github.com/stylelint/stylelint-config-recommended]
   * - stylelint-scss
   *   [https://github.com/stylelint-scss/stylelint-scss]
   * - stylelint (built-in rules)
   *   [https://stylelint.io/user-guide/rules]
   */
  extends: ['stylelint-config-standard-scss'],
  overrides: [
    {
      files: ['*.vue', '**/*.vue'],
      customSyntax: 'postcss-html',
      rules: {
        /**
         * ここには、Vue SFC 固有のルールを追加してください。
         * Vueのスコープ付きスタイルや特定のCSS機能が動作するようにします。
         * e.g. [https://vuejs.org/api/sfc-css-features.html]
         */
        'selector-pseudo-class-no-unknown': [
          true,
          {
            ignorePseudoClasses: ['deep', 'global', 'slotted'],
          },
        ],
      },
    },
    {
      files: ['src/components/**/*.scss', 'src/views/**/*.scss'],
      rules: {
        /**
         * ここには、Vue SFC で読み込むscssファイル群のルールを追加してください。
         * Vue SFC と同じ構文が使用できるので、Vue SFC 固有のルールを追加します。
         */
        'selector-pseudo-class-no-unknown': [
          true,
          {
            ignorePseudoClasses: ['deep', 'global', 'slotted'],
          },
        ],
      },
    },
  ],
  plugins: ['stylelint-prettier'],
  rules: {
    /**
     * ここには、ファイルの種類に依存しない
     * グローバルな定義を追加してください。
     */
    // Enable the "stylelint-prettier" plugin rules.
    'prettier/prettier': true,
    // ------------------------------
    // Disable some "stylelint-config-standard" rules.
    'selector-class-pattern': null,
    // ------------------------------
  },
}
