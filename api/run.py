import uvicorn
import logging
from pathlib import Path
from typing import Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_project_root() -> Path:
    """Get the project root directory."""
    return Path(__file__).parent

def start_server(
    host: str = "127.0.0.1",
    port: int = 3001,
    reload: bool = True,
    workers: int = 1,
    log_level: str = "info"
) -> None:
    """
    Start the FastAPI server with the specified configuration.
    
    Args:
        host: The host to bind to
        port: The port to bind to
        reload: Whether to reload on code changes
        workers: Number of worker processes
        log_level: Logging level
    """
    try:
        logger.info(f"Starting server at http://{host}:{port}")
        
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=reload,
            workers=workers,
            log_level=log_level,
            access_log=True,
            loop="auto"
        )
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        raise

if __name__ == "__main__":
    # Ensure we're in the correct directory
    api_dir = get_project_root()
    if not (api_dir / "main.py").exists():
        raise FileNotFoundError("main.py not found. Please run from the api directory.")
    
    start_server() 