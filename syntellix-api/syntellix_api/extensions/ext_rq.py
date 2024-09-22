from rq import Queue
from redis import Redis
from flask import Flask

def init_app(app: Flask) -> Queue:
    redis_conn = Redis.from_url(app.config['RQ_REDIS_URL'])
    
    queue = Queue(connection=redis_conn)
    
    app.extensions['rq'] = queue
    
    # Check if RQ is created successfully
    try:
        queue.count
        app.logger.info("RQ created successfully")
    except Exception as e:
        app.logger.error(f"Failed to create RQ: {str(e)}")
        raise

    return queue