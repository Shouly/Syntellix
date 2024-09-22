import os
import sys
from dotenv import load_dotenv
from redis import Redis
from rq import Connection, Queue, Worker as RQWorker
from flask import current_app
from syntellix_api.configs import syntellix_config
from syntellix_api.app import create_flask_app_with_configs
from syntellix_api.extensions import ext_database, ext_redis, ext_rq
import resource

# Load environment variables
load_dotenv()

# Set up Redis connection
redis_conn = Redis.from_url(syntellix_config.RQ_REDIS_URL)

# Define the queue name
queue_name = "document_processing"

class FlaskWorker(RQWorker):
    def perform_job(self, *args, **kwargs):
        with self.app.app_context():
            return super().perform_job(*args, **kwargs)

def create_minimal_app():
    app = create_flask_app_with_configs()
    
    # 只初始化 RQ worker 需要的扩展
    ext_database.init_app(app)
    ext_redis.init_app(app)
    ext_rq.init_app(app)
    
    return app

# Create minimal Flask application
app = create_minimal_app()

# 设置更大的内存限制
resource.setrlimit(resource.RLIMIT_AS, (4 * 1024 * 1024 * 1024, -1))

if __name__ == "__main__":
    # Handle macOS fork issue
    if sys.platform == "darwin":  # macOS
        os.environ["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

    with Connection(redis_conn):
        with app.app_context():
            worker = FlaskWorker([Queue(queue_name)], connection=redis_conn)
            worker.work()
