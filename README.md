# Azurinsight

**Azurinsight** is a lightweight, local emulator for Azure Application Insights, designed to help developers debug and visualize telemetry data locally within Visual Studio Code — no cloud push, no extra Azure resources, no surprise costs.
Inspired by [Azurite](https://github.com/Azure/Azurite), Azurinsight provides a local ingestion endpoint and a built-in Telemetry Viewer to inspect requests, traces, exceptions, and more in real-time.

Perfect for local development when you just want to answer:
> “Did my telemetry actually get sent?” 😅

## ✨ Why Azurinsight?
- 🔍 Real-time telemetry visualization inside VS Code  
- 🧠 Local Application Insights emulator  
- 💰 Reduced local dev & testing costs  
- ⚡ Faster feedback loops

💡 Found a bug or have an idea?  
Please **open an Issue** or **raise a Pull Request** — contributions are very welcome!

## Features

- **Local Telemetry Ingestion**: Accepts telemetry via the standard Application Insights SDKs (using a custom endpoint).
- **Real-time Visualization**: View live telemetry streams directly in VS Code.
- **Data Persistence**: Telemetry is stored locally in an SQLite database, persisting across sessions.
- **Granular Management**:
  - **Purge All**: Clear all data with a single click.
  - **Delete Selected**: Select and remove specific telemetry items.
  - **Delete Range**: Remove data within a specific date/time range.
- **Search & Filter**: Quickly find relevant logs by name or type.
- **Detailed Inspection**: View full JSON payloads of telemetry items.

## Getting Started

### Visual Studio Code Extension

Azurinsight is primarily designed as a VS Code extension.

1.  **Install**: Search for "Azurinsight" in the VS Code Marketplace and install it.
2.  **Start**: The emulator starts automatically with VS Code, or you can run the command `Azurinsight: Start Server`.
3.  **View Telemetry**: Click the "Azurinsight" status bar item or run `Azurinsight: Open Telemetry Viewer`.

### Configuration

You can configure the emulator via VS Code settings:

-   `azurinsight.port`: The port for the ingestion server (default: `5000`).
-   `azurinsight.dbPath`: Path to the SQLite database file (default: inside the extension folder).
-   `azurinsight.autoStart`: Whether to start the server automatically on VS Code startup (default: `true`).

### Usage with Application Insights SDK

To send telemetry to Azurinsight, configure your Application Insights SDK to point to the local endpoint.

**Python Example:**

```python
import logging
from azure.monitor.opentelemetry import configure_azure_monitor

# Configure Azure Monitor to point to the local emulator
# The IngestionEndpoint must point to your local server's base URL.
# The SDK will automatically append /v2.1/track
CONNECTION_STRING = (
    "InstrumentationKey=00000000-0000-0000-0000-000000000000;"
    "IngestionEndpoint=http://localhost:5000/;"
    "LiveEndpoint=http://localhost:5000/"
)

configure_azure_monitor(
    connection_string=CONNECTION_STRING,
)

logger = logging.getLogger(__name__)

def main():
    print("Sending telemetry to http://localhost:5000/ ...")
    
    logger.info("Inside span 'hello-emulator'")
    
    logger.warning("This is a warning message from Python!")
    
    try:
        x = 1 / 0
    except ZeroDivisionError:
        logger.error("Caught a division by zero error", exc_info=True)

print("Telemetry sent. Check the emulator UI.")

if __name__ == "__main__":
    main()
```

## Architecture

Azurinsight consists of three main packages:

-   **`packages/server`**: A Node.js Express server that handles telemetry ingestion (`/v2.1/track`) and serves the query API (`/api/query`, `/api/purge`, etc.). It uses SQLite for storage and WebSockets for live streaming.
-   **`packages/extension`**: The VS Code extension that manages the server process and hosts the Webview.
-   **`packages/ui`**: A React application (Webview) for visualizing the telemetry.

## License

This project is licensed under the MIT License.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.
