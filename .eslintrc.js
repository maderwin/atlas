module.exports = {
    root: true,
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:tailwindcss/recommended",
        "plugin:prettier/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "airbnb",
        "airbnb/hooks",
        "next",
    ],
    plugins: [
        "@typescript-eslint",
        "prettier",
        "react",
        "react-hooks",
        "tailwindcss",
        "next",
    ],
    overrides: [
        {
            files: ["*.ts", "*.tsx", "*.js"],
            parser: "@typescript-eslint/parser",
        },
    ],
    rules: {
        "prettier/prettier": "error",
    },
    settings: {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx", "*.js"],
        },
        "import/resolver": {
            typescript: {
                alwaysTryTypes: true,
            },
        },
    },
};
