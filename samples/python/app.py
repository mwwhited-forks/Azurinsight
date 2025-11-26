import logging
from azure.monitor.opentelemetry import configure_azure_monitor
from opentelemetry import trace

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

# tracer = trace.get_tracer(__name__)
logger = logging.getLogger(__name__)

def main():
    print("Sending telemetry to http://localhost:5000/ ...")
    
    # with tracer.start_as_current_span("hello-emulator"):
    logger.info("Inside span 'hello-emulator'")
    
    # Log a message (captured as Trace telemetry)
    logger.warning("This is a warning message from Python!")
    
    # Simulate some work
    try:
        x = 1 / 0
    except ZeroDivisionError:
        logger.error("Caught a division by zero error", exc_info=True)

print("Telemetry sent. Check the emulator UI.")

# Force flush to ensure data is sent before script exits
try:
    trace.get_tracer_provider().force_flush()
except Exception as e:
    print(f"Error flushing: {e}")

if __name__ == "__main__":
    main()
