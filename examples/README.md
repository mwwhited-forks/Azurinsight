# Azurinsight Examples

This directory contains example scripts and code for integrating with Azurinsight.

## Test Scripts

Simple scripts to verify your Azurinsight server is working:

### Windows (Batch)
```cmd
test-telemetry.bat
```

### Windows (PowerShell)
```powershell
.\test-telemetry.ps1
```

### Linux/Mac (Bash)
```bash
./test-telemetry.sh
```

## Language Integration Examples

### Node.js

```javascript
const appInsights = require('applicationinsights');

// Configure to use local Azurinsight server
appInsights.setup('YOUR-INSTRUMENTATION-KEY')
  .setInternalLogging(false, true)
  .start();

appInsights.defaultClient.config.endpointUrl = 'http://localhost:5000/v2.1/track';

// Track events
appInsights.defaultClient.trackEvent({ name: 'UserLogin', properties: { userId: '123' } });
appInsights.defaultClient.trackTrace({ message: 'Application started' });
appInsights.defaultClient.trackMetric({ name: 'ResponseTime', value: 123 });

// Flush to ensure data is sent
appInsights.defaultClient.flush();
```

### Python

```python
from applicationinsights import TelemetryClient
from applicationinsights.channel import TelemetryChannel

# Configure channel to use local Azurinsight server
channel = TelemetryChannel()
channel.endpoint_uri = 'http://localhost:5000/v2.1/track'

# Create client
client = TelemetryClient('YOUR-INSTRUMENTATION-KEY', telemetry_channel=channel)

# Track events
client.track_event('UserLogin', {'userId': '123'})
client.track_trace('Application started')
client.track_metric('ResponseTime', 123)

# Flush to ensure data is sent
client.flush()
```

### .NET (C#)

```csharp
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Extensibility;

// Configure to use local Azurinsight server
var config = TelemetryConfiguration.CreateDefault();
config.ConnectionString = "InstrumentationKey=YOUR-KEY;IngestionEndpoint=http://localhost:5000";

var client = new TelemetryClient(config);

// Track events
client.TrackEvent("UserLogin", new Dictionary<string, string> { { "userId", "123" } });
client.TrackTrace("Application started");
client.TrackMetric("ResponseTime", 123);

// Flush to ensure data is sent
client.Flush();
```

### Java

```java
import com.microsoft.applicationinsights.TelemetryClient;
import com.microsoft.applicationinsights.TelemetryConfiguration;

// Configure to use local Azurinsight server
TelemetryConfiguration config = TelemetryConfiguration.getActive();
config.setConnectionString("InstrumentationKey=YOUR-KEY;IngestionEndpoint=http://localhost:5000");

TelemetryClient client = new TelemetryClient(config);

// Track events
client.trackEvent("UserLogin");
client.trackTrace("Application started");
client.trackMetric("ResponseTime", 123);

// Flush to ensure data is sent
client.flush();
```

## API Endpoints

### Send Telemetry
```bash
POST http://localhost:5000/v2.1/track
Content-Type: application/json

{
  "name": "Microsoft.ApplicationInsights.Message",
  "time": "2026-01-23T12:00:00.000Z",
  "iKey": "your-instrumentation-key",
  "tags": {
    "ai.cloud.role": "my-service",
    "ai.cloud.roleInstance": "instance-1"
  },
  "data": {
    "baseType": "MessageData",
    "baseData": {
      "message": "Hello World",
      "severityLevel": "Information"
    }
  }
}
```

### Query Telemetry
```bash
# Get all telemetry (default: top 100)
GET http://localhost:5000/api/query

# Get with pagination
GET http://localhost:5000/api/query?top=50&skip=10
```

### Purge Telemetry
```bash
# Delete all telemetry
DELETE http://localhost:5000/api/purge

# Delete specific telemetry by criteria
DELETE http://localhost:5000/api/telemetry?start=2026-01-01&end=2026-01-31
```

## Telemetry Types

Azurinsight supports standard Application Insights telemetry types:

- **Trace**: Log messages and diagnostics
- **Event**: Custom events and user actions
- **Metric**: Performance counters and measurements
- **Exception**: Error and exception tracking
- **Request**: HTTP request tracking
- **Dependency**: External service call tracking
- **PageView**: Page view tracking (web apps)

## Tips

1. **Use realistic instrumentation keys** - Use GUIDs like `12345678-1234-1234-1234-123456789012`
2. **Include timestamps** - Use ISO 8601 format: `2026-01-23T12:00:00.000Z`
3. **Add context with tags** - Use tags for role, instance, user, session tracking
4. **Flush before exit** - Ensure telemetry is sent before application shutdown
5. **Check logs** - Use `docker-compose logs -f` to see incoming telemetry

## Troubleshooting

### Server not responding
```bash
# Check if container is running
docker-compose ps

# View server logs
docker-compose logs -f azurinsight

# Restart container
docker-compose restart
```

### Telemetry not appearing
```bash
# Check if telemetry was accepted
curl -v -X POST http://localhost:5000/v2.1/track -H "Content-Type: application/json" -d '...'

# Query to verify
curl http://localhost:5000/api/query
```

### Port conflicts
If port 5000 is in use, edit `docker-compose.yml`:
```yaml
ports:
  - "8080:5000"  # Use port 8080 instead
```

Then update your endpoint URLs to use port 8080.
