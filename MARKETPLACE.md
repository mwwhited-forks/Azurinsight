# Deploying to Visual Studio Code Marketplace

This guide outlines the steps to package and publish the Azurinsight extension.

## Semantic Versioning

- **Patch** (1.0.X): Bug fixes
- **Minor** (1.X.0): New features, backward compatible
- **Major** (X.0.0): Breaking changes

## Prerequisites

-   [vsce](https://github.com/microsoft/vscode-vsce) installed globally: `npm install -g @vscode/vsce`
-   A publisher account on the [VS Code Marketplace](https://marketplace.visualstudio.com/).
-   A Personal Access Token (PAT) from Azure DevOps with "Marketplace (manage)" scope.

## Packaging

To create a `.vsix` file for local installation or manual distribution:

1.  **Build all packages**:
    ```bash
    npm install
    npm run build --workspaces
    ```

2.  **Prepare Assets**:
    Ensure the UI assets are copied to the extension folder and renamed correctly (this is usually handled by the build scripts or manual steps during dev, but for release, ensure `packages/extension/ui/assets` contains `index.js` and `index.css`).

    ```bash
    # Example manual steps if not automated
    xcopy packages\ui\dist packages\extension\ui /E /I /Y
    cd packages\extension\ui\assets
    del index.js index.css
    ren index-*.js index.js
    ren index-*.css index.css
    ```

3.  **Package**:
    Navigate to the extension directory and run `vsce package`.
    ```bash
    cd packages/extension
    vsce package
    ```
    This will generate a file like `azurinsight-extension-1.0.0.vsix`.

## Publishing

To publish directly to the Marketplace:

1.  **Login**:
    ```bash
    vsce login <publisher-id>
    ```
    Enter your PAT when prompted.

2.  **Publish**:
    ```bash
    cd packages/extension
    vsce publish
    ```
    Or to publish a specific version:
    ```bash
    vsce publish 1.0.0
    ```

## Verification

After publishing, it may take a few minutes for the extension to appear or update in the Marketplace. You can verify the status in the [Marketplace Management Portal](https://marketplace.visualstudio.com/manage).
