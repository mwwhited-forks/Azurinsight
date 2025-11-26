# Contributing to Azurinsight

Thank you for your interest in contributing to Azurinsight! We welcome bug reports, feature requests, and pull requests.

## Development Setup

Azurinsight is a monorepo managed with npm workspaces.

### Prerequisites

-   Node.js (v16 or higher)
-   npm (v8 or higher)
-   Visual Studio Code

### Setup Steps

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/azurinsight.git
    cd azurinsight
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Build the project**:
    ```bash
    npm run build --workspaces
    ```

### Running the Extension Locally

1.  Open the project in VS Code.
2.  Press `F5` to start the "Extension" launch configuration. This will open a new "Extension Development Host" window.
3.  In the new window, the Azurinsight server should start automatically.
4.  Open the Telemetry Viewer via the status bar or command palette.

### Project Structure

-   `packages/server`: Backend logic (Express, SQLite, WebSockets).
-   `packages/ui`: Frontend logic (React, Vite).
-   `packages/extension`: VS Code extension glue code.

### Making Changes

-   **UI Changes**: Edit files in `packages/ui/src`. Run `npm run build` in `packages/ui` to rebuild the React app. You may need to reload the Extension Host window to see changes.
-   **Server Changes**: Edit files in `packages/server/src`. Run `npm run build` in `packages/server`.
-   **Extension Changes**: Edit files in `packages/extension/src`.

## Submitting Pull Requests

1.  Fork the repository.
2.  Create a new branch for your feature or fix.
3.  Commit your changes with clear messages.
4.  Push to your fork and submit a Pull Request.
5.  Describe your changes and link to any relevant issues.

## Code of Conduct

Please be respectful and inclusive in all interactions.
