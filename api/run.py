import uvicorn
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Get configuration from environment variables
    host = os.getenv("HOST", "localhost")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"

    # Run the FastAPI application
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        workers=1
    ) 